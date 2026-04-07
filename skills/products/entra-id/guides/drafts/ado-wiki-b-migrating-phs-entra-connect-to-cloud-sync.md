---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Cloud Sync/Passsword Management/Password Hash Sync (PHS)/Migrating PHS from Entra Connect to Cloud Sync"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD/pages?pagePath=/Sync%20Provisioning/Cloud%20Sync/Passsword%20Management/Password%20Hash%20Sync%20%28PHS%29/Migrating%20PHS%20from%20Entra%20Connect%20to%20Cloud%20Sync"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD Synchronization
- cw.comm-sync
--- 
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

:::template /.templates/Shared/compliance-notice.md
:::


[[_TOC_]]


This TSG focuses on issues that may block customer from successfully setting up the Cloud Sync and Entra connect with different scopes and using Password Hash in both configurations. 


##Migration to Cloud Sync for an existing synced AD forest (Entra Connect) 
 


When you need to migrate to cloud sync for a test Active Directory forest that is already synced using Microsoft Entra Connect Sync you will need to follow the steps that are explained in this article [Migrate to Microsoft Entra Cloud Sync for an existing synced AD forest
](https://learn.microsoft.com/en-us/entra/identity/hybrid/cloud-sync/tutorial-pilot-aadc-aadccp)

In the above article you will find that we do support to have both configurations for Entra Connect and Cloud Sync in the same environment, however you need to setup a different scope, and the correct method to setup different scopes is by creating 2 custom rules, that will be explained later, **but we do not take into consideration the scenario where the customer enabled Password Hash with Cloud Sync and it's also set in Entra Connect at tenant level**.

So, let's focus in the first steps/rules to set different scopes.

**Inbound Rule**

For the creation of the Inbound rule you have to follow the below steps.

- Select Inbound from the drop-down list for Direction and select Add new rule.

- On the Description page, make sure to set the correct values as it's described in the tutorial [Migrate to Microsoft Entra Cloud Sync for an existing synced AD forest
](https://learn.microsoft.com/en-us/entra/identity/hybrid/cloud-sync/tutorial-pilot-aadc-aadccp)

- On the Scoping filter page, enter the OU or security group that you want the pilot based off. To filter on OU, add the OU portion of the distinguished name. This rule will be applied to all users who are in that OU. So, if DN ends with "OU=CPUsers,DC=contoso,DC=com, you would add this filter. 

- Join section will not be modified.

- Transformations page, add a Constant transformation: flow True to cloudNoFlow attribute. Same steps need to be followed for all object types (user, group and contact). Repeat steps per configured AD Connector / per AD forest.

     <IMG  src="https://learn.microsoft.com/en-us/entra/identity/hybrid/cloud-sync/media/tutorial-migrate-aadc-aadccp/user-4.png"  alt="Screenshot that shows the Create inbound synchronization rule - Transformations page with a Constant transformation flow added."/>


**Outbound rule**

For the creation of the outbound rule you have to follow the below steps.

- Select Outbound from the drop-down list for Direction and select Add rule.

- On the Description page, make sure to set the correct values as it's described in the tutorial [Migrate to Microsoft Entra Cloud Sync for an existing synced AD forest
](https://learn.microsoft.com/en-us/entra/identity/hybrid/cloud-sync/tutorial-pilot-aadc-aadccp)

- On the Scoping filter page, **choose cloudNoFlow equal True**. Then select Next.

- Join and Transformations section will not be modified, just click on Add

## Issue observed with this configuration and PHS enabled

This configuration will work smoothly when the customer hasn't setup Password Hash in Cloud sync, however if the customer has enabled PHS in Cloud Sync and Entra connect we will have the 2 engines sending updates for the hashes, this is because the **attribute cloudNoFlow we used previously in the rules will stop the flow for regular attributes but NOT for the password hashes**. 

To check if PHS is enabled you can go to the Cloud Sync configuration --> Overview --> Properties as the below image

   ![image.png](/.attachments/image-93c7d411-baa9-4ca1-b7c6-3c3a61981c35.png)

  

Then we are going to find an issue with the hashes, we will see in the Audit logs how an user will have an update from the Cloud Connector Account for Entra Connect *(Sync_123xxx)* managing the password change / sending hashes  and then another update for the Azure AD Cloud Sync *(ADToAADSyncServiceAccountxxx)* for regular attributes and hashes, which could be confusing for the administrator/customer, they will notice how Entra Connect Account is still managing the user changes even if the users belong to specific OUs that are out of scope. 

The audit logs in customers end will show the same information as we can see them in ASC, you can look for the audit logs per sample user and you will see the below events, for more details you can click on the + sign.

  ![image.png](/.attachments/image-3e10a5b0-f995-47b7-ae93-9578532a20f2.png)

Then at this point you will know that there is an unexpected behavior because Entra Connect is working on the hashes but how can we confirm if Cloud Sync is also sending updates for new hashes, at this point I'll recommend you to run the below queries to confirm PHS for Cloud Sync is also working.

**Step 1**

Find Password Hash Run Profile for Cloud Sync - Tag AD2AADPasswordHash

Run the below query to get the Password Hash run profile Tag

```
    GlobalIfxRunProfileStatisticsEvent 
    | where env_time > ago(5d) // Time range
    //| where contextId == "61a1b05f-####-####-####-############" // Customer's tenantId
    | where * contains "AD2AADPasswordHash" // Filter based on friendly name of Enterprise App
    | project env_time, correlationId, servicePrincipalDisplayName, runProfileIdentifier , message , runProfileTag , tenantDetail, env_cloud_deploymentUnit , env_cloud_location
    | distinct runProfileIdentifier, servicePrincipalDisplayName // Display list of just unique runProfileId/servicePrincipalDisplayName combinations without any other information
```
 
**Step 2**

Find the audit logs for a specific sample user

```
    let runProfileId = "AD2AADPasswordHash.fxxxx.2xxxx";
    GlobalIfxAuditEvent
    | where env_time > ago(10d)  
            and runProfileIdentifier == runProfileId      
            and * contains "sauterson" // Use UPN/EMail for users, If you know objectId in either system then filter by anchor 
    | project env_time, correlationId, sourceAnchor, targetAnchor, reportableIdentifier, eventName, description, ['details']
    | order by env_time asc
 ```
Once you determine/find a useful log when a password hash has been sent/updated to Entra ID, get all the event details (recommended to use the EntryExportUpdate event) and keep handy the correlation Id. You will see something similar in the results:

*EntryImportUpdate*
 ```
"env_time": 2023-12-13xxx,
"correlationId": ebxxxx,
"sourceAnchor": bxxxx4,
"targetAnchor": xxxx ,
"reportableIdentifier": sauterson@xxxxx,
"eventName": EntryImportUpdate,
"description": Received ?-AFxxxxxx-? 'sauterson@xxxx' change of type (Update) from Active Directory,
"details": ADD: **{"PasswordHash":"'[Redacted]'","PasswordChangeDate":"'[Redacted]'","whenChanged":"20231213223542.0Z","userPrincipalName":"sauterson@xxxx","originatingReplicaToken":"'[Redacted]'**"}
 ```
*EntryExportUpdate*

 ```
"env_time": 2023-12-13T22:43:10.9744863Z,
"correlationId": ebxxxx,
"sourceAnchor": bxxxxx4,
"targetAnchor": xxxx,
"reportableIdentifier": sauterson@xxxxx,
"eventName": EntryExportUpdate,
"description": User 'sauterson@xxxx' was updated in Azure Active Directory,
"details": ADD: {"ChangeDate":"'[Redacted]'","CredentialData":"'[Redacted]'"}
 ```


**Step 3**

We are going to check the requests for the Password hashes updates by checking the web Traffic send to Entra ID 

```
  GlobalIfxAllTraces
  | where correlationId == "6fxxxx" // Put CorrelationId here
  | where message contains "sauterson@xxxx" // Find web traffic
  //| where message contains "Warning"  // Filter to only show Warning or Error  
  | project env_time, env_seqNum ,message
  | order by env_time, env_seqNum
```

Response from the web traffic
 ```
"env_time": 2023-12-09T13:32:xxxx,
"env_seqNum": 11727937,
"message": %%pii_## SPLIT exxxxx #100 of 105 ##\n value":"20231208210739.0Z"}]},{...[{"op":"Replace","path":"PasswordHash","value":[{"value":"'[Redacted]'"}]},{"op":"Replace","path":"PasswordChangeDate","value":[{"value":"2023-12-08T22:15:37.6283682Z"}]},{"op":"Replace","path":"whenChanged","value":[{"value":"20231208221537.0Z"}]},{"op":"Replace","path":"userPrincipalName","value":[{"value":"sauterson@xxxxxx"}]},{"op":"Replace","path":"originatingReplicaToken","value":[{"value":"{\"InvocationId\":\"xxxxx\",\"Name\":\"xxxxxxx\"}"}]}]},{"schemas":["http://schemas.microsoft.com/2006/11/ResourceManagement/ADSCIM/Event","http://schemas.microsoft.com/2006/11/ResourceManagement/ADSCIM/Event# ###%%
 ```

  <table style="margin-left">
<tr style="background:#f59fe1;color:black">
<td>
<small> <b>Note</b>: Notice the verbatim in the web traffic for the operation change
[{"op":"Replace","path":"PasswordHash","value":[{"value":"'[Redacted]'"}]},{"op":"Replace","path":"PasswordChangeDate","value":[{"value":"2023-12-08T22:15:37.6283682Z"}] .</small>
</td>    
</tr>
</table>



##Resolution and action plan 

Now we know that Password Hashes are being sent twice, by the Cloud Sync Agent and by Entra Connect and the reason is because we never ask the engine of Entra Connect to stop syncing hashes just regular attributes with the cloudNoFlow logic.

Unfortunately we don't specify we need to follow additional steps to stop flowing password hashes and this is not yet documented in public articles, however we have the action plan to resolve this problem and it will be by creating additional custom rules and use the method called [Selective password hash synchronization configuration for Microsoft Entra Connect
](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-selective-password-hash-synchronization)

PHS once it's been enable by default the password hash synchronization will occur on all of the users you are synchronizing, so if you'd like to have a subset of users excluded from synchronizing their password hash to Microsoft Entra ID, you can configure selective password hash synchronization, in this case we are going to exclude syncing hashes to the users that are in scope for Cloud Sync. 

The administrator of the tenant should first consider the number of user objects they wish to exclude from password hash synchronization. For more guidance they can see the scenarios below, which are mutually exclusive, 

- If the number of users to exclude is smaller than the number of users to include, follow the steps in this [Excluded users is smaller than included users
](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-selective-password-hash-synchronization#excluded-users-is-smaller-than-included-users).
- If the number of users to exclude is greater than the number of users to include, follow the steps in this article [Excluded users is larger than included users
](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-selective-password-hash-synchronization#excluded-users-is-larger-than-included-users).

**In conclusion** our customers will need more than 2 custom rules to accomplish the migration to Cloud Sync when using Password Hash Synchronization and to avoid having duplicated actions on the password hashes management.
