---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Privilege Identity Management (PIM)/TSG: PIM Role Activation Delays"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FPrivilege%20Identity%20Management%20(PIM)%2FTSG%3A%20PIM%20Role%20Activation%20Delays"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[[_TOC_]]


# Issue: PIM Role Activation Delays

Entra CSS support teams often get support cases from customers experiencing what they believe are delays in PIM role activation occurring.  The support case statements usually look something like the following

* Support Case Statement Example:
 
   ``I used PIM to elevate my Entra role to Global Administrator at 8:00 AM, but when I sign into the Microsoft 365 Admin Center I am unable to utilize the permissions and receive a insufficient permission error``

When troubleshooting a support case such as this one it is important to understand how role assignments are stored and read by different 1st party Microsoft services\applications.

# How are role assignments stored/replicated/read by Microsoft services

Entra role assignments activated in PIM are stored in AAD\MSODS and accessible via Microsoft Graph within ~1-2 minutes of the activation. The Azure\Entra portals should reflect these role assignments immediately.

Other applications such as (Intune Portal, M365 Admin Center, Sharepoint Online, Exchange Online, and Security and Compliance Portals) may store role assignment info in their own directory services which are kept in sync with AAD\MSODS via [ForwardSync](https://eng.ms/docs/experiences-devices/m365-core/substrate-platform/substrate-identity-fabric/exchangeforwardsync/substrateprovisioning/serviceoverview/forwardsync/forwardsyncoverview) or other notification\sync process. 

The replication delay between application directory stores and AAD\MSODS is generally < 15 minutes but can be more depending on [ForwardSync](https://eng.ms/docs/experiences-devices/m365-core/substrate-platform/substrate-identity-fabric/exchangeforwardsync/substrateprovisioning/serviceoverview/forwardsync/forwardsyncoverview) or other 1st party sync service's load performance.  


In addition to [ForwardSync](https://eng.ms/docs/experiences-devices/m365-core/substrate-platform/substrate-identity-fabric/exchangeforwardsync/substrateprovisioning/serviceoverview/forwardsync/forwardsyncoverview) or notification\replication delay, applications also may cache role assignment info locally when obtained during user's previous sign ins.  This cache may not be updated for 15+ minutes as well.  So if access is denied on initial sign in, local application role assignment cache may not be updated for another 15 minutes regardless of AAD\MSODS and ForwardSync replication of role assignment status.  This is documented in [Activate a Microsoft Entra role in PIM do](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-activate-role)c under the "Important" box.


   *   ![image.png](/.attachments/image-56a9c078-3250-4472-80c8-89397195759c.png =600x)

# Troubleshooting
## Role activation testing recommendations

Given all the dependencies for role activation, replication and caching, if a customer is experiencing activation delays it is recommended that after activating roles in PIM\Entra to wait 10-15 minutes before signing into applications such as (Intune, M365 Admin Center, SharePoint Online, or Exchange Online).  

It is also recommended to completely sign out of any applications after activating roles in Entra before attempting to sign in again post role activation.  If access doesn't reflect role assignments, do not attempt again for 10-15 minutes to account for application's role assignment cache expiring otherwise you could update local application cache with the lack of role assignment for another 10-15 minutes.

## Customer Scoping Questions

When troubleshooting role activation delays with customers, request the customer answer and provide the following data

1. Please answer the following questions:

   1. Which user experienced the issue?  What is their UPN and ObjectID?
   2. Which role did user try to activate?
   2. When did they activate this role?
   3. Which portal has the delay? (Please share portal url). What operation they are trying to do on the portal?
   4. How long is the delay?
   5. Is delay consistent or intermittent?
   6. One user or multiple user are impacted in tenant?
   7. Is there known impact to multiple tenants?
   8. Is there any known workaround to reduce the delay? Such as browser refresh, sign-out/sign-in, machine restart etc.

2. Please reproduce the issue while performing the following and providing traces
   1. Sign out of any existing application session completely
   2. From browser's incognito or private mode, start a https://aka.ms/hartrace  or start a https://aka.ms/fiddlercap (w/https decryption enabled)
   3. From Windows OS start a problem steps recorder (https://aka.ms/problemstepsrecorder)
   4. Sign back into application after waiting 10-15 minutes from any previous attempt.
   5. Stop and save the HAR\Fiddler trace + problem steps recorder
   6. Provide the HAR trace + problem steps recorder to support engineer for review

## Support engineer troubleshooting steps

After customer has provided answers and traces from [Customer scoping questions](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1703570/TSG-PIM-Role-Activation-Delays?anchor=customer-scoping-questions) section, support engineer can review the scenario and scope issue using below steps

### Obtain PIM role activation time audit logs via ASC

1. Using Azure Support Center -> Tenant Explorer -> Audit Logs, filter the audit logs by
   * Target = UPN or ObjectID of user
   * Time range = time user activated role
2. Locate the audit log with the following properties
   * Activity = Add member to role
   * Category = RoleManagement
   * Target = UPN or ObjectID
3.  Note the **Activity Date (UTC)** of the audit log.  This is the timestamp that the role was activated in PIM\Entra\MSODS.  If this activity is not found in audit logs, or the timestamp is later than expected then confirm the customer activated the  role in PIM and this could be a PIM issue requiring [further investigation](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184003/Privilege-Identity-Management-(PIM)?anchor=asc-audit-log-troubleshooting) or [escalation](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184003/Privilege-Identity-Management-(PIM)?anchor=icm-paths) at PIM API level.

    Example:

    ![image.png](/.attachments/image-58471c0d-9400-459c-b8d3-5a50f72c8ad6.png)

### Review the HAR\Fiddler trace
1. From the HAR or Fiddler trace provided by customer during repro, open the trace with Fiddler application
2. If the customer captured the trace from incognito\in private browser you should be able to locate a request to the URL format

   * ```https://login.microsoftonline.com/common/oauth2/authorize```

    If you cannot find this frame, then it more than likely means customer did not sign out or sign in from incognito\private browser mode or did not capture the sign in request correctly.  You can skip to Step 9 below to obtain the timestamp the customer attempted sign in only.

3. Once this URL is found in list of request URLs, choose this frame and on right side of Fiddler choose Inspectors -> WebForms tab.  Note what the `redirect_uri` parameter is for the sign in request.  This is the URL where the id_token will be sent after the user signs in.

    Example:

    ![image.png](/.attachments/image-800c9118-a462-4ac8-aef4-bacac20aeb8e.png)

4. Once `redirect_uri` parameter of the sign in request is located, search remaining request URLs for when Entra sent the `id_token` to this URL.  For example, in above examples the redirect_uri is `https://admin.microsoft.com/landing' so we will find the next request to this url to inspect the id_token

5. Once the request to this URL is found, select it, and  on right side of Fiddler choose Inspectors -> WebForms tab.  Confirm the `id_token` parameter is displayed.  Right click the value and choose Send To TextWizard

    Example:

    ![image.png](/.attachments/image-fb23aa46-d41e-4c75-8cf4-e5e8a15aadc9.png)


6. From the Fiddler TextWizard dialog opened, change the Transform option to "From Base64", you should now see the decoded id_token sent from Entra to the relying party application.

   Note the following claim values within the deocded id_token contents:

   * **iat** = the timestamp the id_token was issued at in unix time
   * **wids** = a list of Entra role definition ids according to Entra at that time

  
     Example:

     ![image.png](/.attachments/image-5484cae8-758e-431d-b648-8ffd4fe30e5d.png)

7. Convert the **iat** value to UTC time with an online conversion tool like https://www.unixtimestamp.com/ or use your local PowerShell terminal and put the iat value in example cmd ```([datetime]'1970-01-01 00:00:00').AddSeconds("1729213575")``` to convert to UTC
8. Convert each of the **wids** claim GUIDs to built in role definition by CTRL+F searching for them on [Microsoft Entra Built-in Roles](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference)

9. In the event that the customer did not capture the `login.microsoftonline.com` request, or you cannot find it in the trace, you will not be able to inspect the id_token.  Instead you can only confirm the timestamp that the customer accessed the resource application itself.  To find this, locate any request frame where the URL is the resource application experiencing permission issue.   Click this frame, and on Fiddler's right side section choose Inspectors -> then review the response section (bottom right) and choose Headers tab.  Note the **Date** field which will contain the timestamp in UTC that the customer accessed resource app.

    Example:

    ![image.png](/.attachments/image-ad85ce35-83a5-4af1-83e6-7462cbc5eb52.png =800x)

### Troubleshooting conclusion + Escalation Guidance

With the above analysis you can verify

1. The id_token issued by Entra\AAD was issued AFTER the role was activated in PIM.  Compare the timestamp of Step 7, with the timestamp found in previous section in ASC Audit Log.  Was token issued at least 15 minutes after the role was activated in PIM?

2. The id_token issued by Entra\AAD contains the Entra built in role the user activated in PIM.  Compare the roles found in wids claim of step 8, with the role activated via PIM in ASC audit log.

3. The timestamp the user accessed the relying party application was at least 15 minutes after role was activated.  Review the timestamp of the request to `redirect_uri` found in Step 5 or Step 9 above.

Was token issued 10-15 minutes after ASC audit log shows role was activated?

* If no, then suggest customer follow [recommended role activation steps](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1703570/TSG-PIM-Role-Activation-Delays?anchor=role-activation-testing-recommendations) again.

* If yes, and customer is still seeing access denied or permission related errors then collect the customer's answers and traces from [Customer scoping questions](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1703570/TSG-PIM-Role-Activation-Delays?anchor=customer-scoping-questions) section and work with the client application support team (Intune Portal, M365 Admin Center, Sharepoint Online, Exchange Online, and Security and Compliance Portals) to investigate their role assignment cache for any failures or ForwardSync delays that may have impacted the authorization decision.  If application support team is unsure who would investigate application role assignment cache review [PIM PG's Partner Team List](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/15333/PIM-Partner-Team).

# Other resources
### Entra\PIM Resources
* [PIM PG wiki on activation delays](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/23872/PIM-activation-or-assignment-delays)
* [AAD Portal UX wiki on troubleshooting role activation delays](https://eng.ms/docs/microsoft-security/identity/identity-and-access-management/iam/iam-management-admin-ux/iam-management-admin-ux-troubleshooting-guides/tsgs/how-to-debug-roles-issues-in-pim-flow)

# Known Issues 

### Intune Portal (https://intune.microsoft.com)
* ICM: Microsoft Intune\CxE Support analysis
    
    * Per Intune Engineering Team in escalations such as ICM 630909741
       * [Task 33005850](https://msazure.visualstudio.com/Intune/_workitems/edit/33005850): Address latency in Intune role assignments to PIM-enabled Entra Groups
         * "Intune supports RBAC role assignments to PIM-enabled groups. The [blog post referenced above](https://techcommunity.microsoft.com/blog/intunecustomersuccess/configuring-microsoft-intune-just-in-time-admin-access-with-azure-ad-pim-for-gro/3843972) documents the relevant guidance to customers. Given the just-in-time nature, customer expectation is for the role assignments to happen immediately once the PIM request is approved/activated in Entra. The current design in Intune does not support this near real-time requirement. Specifically, Intune RBAC relies on G&T to have processed the JIT group membership changes, whose latency is subject to other grouping changes happening in the tenant at the same time. This task tracks the work needed to address the low latency requirement for JIT role assignments.

### SharePoint Online Resources
* ICM: Sharepoint POP\TenantAndSiteLifecycle
   * [SharePoint Online team wiki on PIM activation](https://onedrive.visualstudio.com/SharePoint%20Online/_wiki/wikis/SharePoint-Online.wiki/55731/Feature-Overview)
   * [SharePoint Online team livesite on PIM](https://eng.ms/docs/experiences-devices/onedrivesharepoint/sharepoint-online-and-onedrive-for-business/sharepoint-score/sharepoint-authentication-troubleshooting/sharepoint-score-authzen-tsgs/authorization/privilegedidentitymanagement/authorization_privilegedidentitymanagement_endpointreliability)
   * [SharePoint Online workitem on improving activation delays](https://onedrive.visualstudio.com/SPIN/_workitems/edit/296922)
      * Per SPO Software engineer "15 minutes is what we promise customers, but very very few cases take longer than 2 minutes. And we don't have any plans to improve it as the engineering cost would be extremely high compared to the possible performance gain."

### M365 Admin Center Resources (https://admin.microsoft.com)
* ICM: Office365 Admin Portal and Support \ Office365 Admin
  * Per multiple escalations (535957437, 555747144, 555532751, 584400311).  The `Office365 Admin Portal and Support \ Office365 Admin` engineering team has confirmed that "there are 5-15 min AAD replication time + 15 min caching time in M365 Admin portal. If customer has PIM role assigned they have to wait 30 minutes and then access again M365 Admin portal.  
  * For any concern where it takes more than 15 min (on a first attempt) you can provide exact timestamp/logs of role assignment, user id and network logs for attempting to access MAC and we can review. 
  * For any concern where it takes over 30 min (not a first attempt after permissions are assigned)  you can provide exact timestamp/logs of role assignment, user id and network logs for attempting to access MAC and we can review. "
 * [M365 Admin Center workitem on improving activation delays](https://office.visualstudio.com/OC/_workitems/edit/9327944)

### M365 Defender Resources (https://security.microsoft.com)
* Assist365 Escalation to : O365 Core\Core Auth\Authorization
  * Follow [Privileged Identity Management (PIM) and why to use it with Microsoft Defender for Office 365](https://learn.microsoft.com/en-us/defender-office-365/pim-in-mdo-configure)

### Microsoft Purview (https://purview.microsoft.com)

* Purview supports roles assigned to Entra security groups and JIT can be achieved via PIM for Groups eligible membership.  However this portal has a [documented limitation](https://learn.microsoft.com/en-us/purview/purview-portal#permissions-and-subscriptions) that Purview may take up to 2 hours to see Entra security group membership changes.  Questions on this limitation should be reviewed by Purview suppport \ engineering teams (SAP: Azure/Microsoft Purview/Purview Administration/Access Control) .  See example workitems \ features \ bugs where this limitation is known to Purview engineering team
   * [Feature 4581709](https://o365exchange.visualstudio.com/IP%20Engineering/_workitems/edit/4581709 "https://o365exchange.visualstudio.com/ip%20engineering/_workitems/edit/4581709"): Increase support for Entra PIM and security groups by getting immediate awareness to PIM group membership activation  
      * NOTE: This appears to be a private preview feature that Purview support can request customer be added to
   * [Issue 5583656](https://o365exchange.visualstudio.com/IP%20Engineering/_workitems/edit/5583656 "https://o365exchange.visualstudio.com/ip%20engineering/_workitems/edit/5583656"): [Customer Escalation] [S500] [RFC]: Need to confirm expected delays for PIM activation for Groups
   * [Issue 5176187](https://o365exchange.visualstudio.com/IP%20Engineering/_workitems/edit/5176187): [Customer Escalation] [DCR]: PIM roles to grant permissions for perming Approve/Reject actions in the Defender Action Center is taking too long
   
