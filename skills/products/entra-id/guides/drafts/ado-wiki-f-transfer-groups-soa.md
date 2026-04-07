---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Object Level SOA/Transfer Groups Source of Authority From Ad Entra ID"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Sync%20Provisioning/Connect%20Sync/Object%20Level%20SOA/Transfer%20Groups%20Source%20of%20Authority%20From%20Ad%20Entra%20ID"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-objprinmgt
- SCIM Identity
- cw.User-Management
- User Management
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [Entra](/Tags/Entra) [EntraID](/Tags/EntraID) [comm-objprinmgt](/Tags/comm%2Dobjprinmgt) [User-Management](/Tags/User%2DManagement)  


[[_TOC_]]

# Summary

Currently Administrators must choose between syncing from on premise or having cloud only objects. This can cause difficulty when they want to manage groups both in Entra and On-Premise separately. We are introducing a new feature that will allow administrators to selectively change the Source of Authority (SOA) from their On-Premise AD to Microsoft Entra without the need to completely disable sync. 

Source of Authority ?SOA? (at an object level) is a feature that enables IT Administrators to transition the management of a specific objects from Active Directory (AD) to Microsoft Entra ID. When SOA is applied to an object synced from AD, it converts the object to a cloud object that can be edited & deleted in Entra ID, and Connect Sync (and soon Cloud Sync) honor the conversion and no longer attempt to sync the object from AD. By granting administrators the ability to selectively migrate objects to be cloud-managed, we facilitate a phased approach for the migration process. Instead of switching the entire directory at once to the cloud and discontinuing AD ? an action that necessitates substantial redesign and re-platforming of applications ? this feature allows for a gradual reduction of AD dependencies. This phased approach ensures seamless operations with minimal impact on end users as well as helping organizations secure their identities using capabilities in Entra ID and Entra ID Governance. There are important caveats and implications, so be sure to thoroughly understand and test prior to using this capability.

# Pre-checks:

- Exchange On-Premise: The Groups to be changed no longer have any association with on-premises Exchange dependencies or require Distribution Lists (DLs), and Mail Enabled Security Groups (MESGs) to be present in Active Directory (AD), and you wish to transition the management of these groups to Exchange Online (EXO).

- Applications: Applications have been updated to use SAML or OpenID Connect from Entra instead of ADFS. These apps should no longer need Active Directory groups for access. Microsoft Entra ID Governance should be used to manage these apps with Entra features. With SOA, instead of creating new cloud groups, you can migrate existing ones. After SOA conversion, app functionality remains as group properties stay the same, enabling you to manage app access using Microsoft Entra features that update group membership.

# Unsupported scenarios: 

1. **No reconciliation support for local AD groups:** An AD admin (or other application with sufficient permissions) can directly modify an AD group. If SOA had been applied to the object and/or if cloud security group provisioning to AD is enabled, those local AD changes will not be reflected in Entra ID. When a change to the cloud security group is made, any local AD changes will be overwritten if group provisioning to AD is enabled.
2. **No Dual write allowed:** Once you start managing a group?s memberships from Entra ID for the transferred group (say cloud group A) and you provision this group to AD using Group Provision to AD as a nested group under another AD group (OnPremGroupB) in scope for AD to Entra ID sync, the membership reference of Group A will not be synced when AD2EntraID sync happens for OnPremGroupB. This is because the sync client will not know the cloud group membership references. This is by Design.
3. **SOA transfer of nested groups:** If you have nested groups in AD and want to transfer the SOA of the parent or top group from AD to Entra ID, only the parent group?s SOA will be switched. All the groups underneath the parent group will continue to be AD groups. You need to switch the SOA of these nested groups one by one. We recommend you start with the group in the lowest hierarchy and move up the tree. 
4. **Extension Attributes (1-**1**5):** Extension attributes 1 ? 15 are not supported on cloud security groups and will not be supported once SOA is converted. 

# Prerequisites:

1. **Roles**:

   - Groups Administrator role is allowed to call the OnPremisesSyncBehavior Graph API for Groups. 

   - Cloud Application Administrator role is allowed to consent to the required permissions for apps to call the OnPremisesSyncBehavior Graph API for Groups.

2. **Permissions:** For apps calling into the OnPremisesSyncBehavior Graph API, Group-OnPremisesSyncBehavior.ReadWrite.All permission scope needs to be granted. 
3. **License needed:** Microsoft Entra Free or Basic license.
4. Confirm that the minimum version of Entra Cloud Sync (TBD) is installed. 

5. **On-Premises Exchange clean up:**  Please make sure that the data for your on-prem Exchange related groups is up to date and in sync with the data in EXO. This is just needed for Private Preview. In Public Preview, this will automatically be handled by our system. 

# Prerequisites for calling Graph API

1. An Entra ID tenant with on-premises sync enabled at the tenant level.
2. A user account for the above tenant with the following roles assigned:

  - Cloud Application Administrator: To grant user consent to the required permissions to Graph Explorer or the app used to call the Graph APIs.

  - Groups Administrator: To call the Graph APIs to read and update SOA of groups.

## Granting Rights to the APP to be used for updating the SOA

1. Login to Microsoft Entra portal using the **Cloud Application Administrator account** of an on-premises sync enabled tenant.
2. Find the application Id of the app that the permission needs to be granted to via the Enterprise Applications blade in Microsoft Entra portal, such as Graph Explorer.
```
      For Graph Explorer, AppId is:

      de8bc8b5-d9f9-48b1-a8ad-b748da725064
```

3. In the same browser where admin user is logged in, navigate to the following URL to consent to **Group-OnPremisesSyncBehavior.ReadWrite.All** permission (replace **<appId>** in URL below with AppId from step 2):
```

  https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=**<appId>**&response_type=code&scope=https://graph.microsoft.com/Group-OnPremisesSyncBehavior.ReadWrite.All  

```   

4. Click **Accept** to grant consent.

*Note: Consenting on behalf of the entire organization is not required.*



![Screenshot](/.attachments/AAD-Account-Management/2173320/Screenshot-1.jpg)



Note: Ignore the `AADSTS9002325: Proof Key for Code Exchange is required for cross-origin authorization code redemption.` error if you see it after clicking Accept.

![Screenshot 2](/.attachments/AAD-Account-Management/2173320/Screenshot-2.jpg)

1. Verify the permission is granted by navigating to: ?Enterprise Applications -> AppName -> Security -> Permissions -> User consent? in Microsoft Entra portal. Note that it may take a minute or two for the permission to show up.

![Screenshot 3](/.attachments/AAD-Account-Management/2173320/Screenshot-3.jpg)

## Switch the SOA of the Group:

1. You can either create a security group or mail enabled distribution group for your testing purposes in Active Directory and add some group members (or) if you have an existing group that you are already syncing to Entra ID, you can use that.  Make sure the group is in-scope for Connect Sync.
2. Run sync in connect sync by running ?Start-ADSyncSyncCycle? in PowerShell window.
3. Ensure that either the new group or your existing AD group is showing up in the Entra Portal as a synced group.
4. Now change the SOA (CloudManaged=true) on the group object using graph API.

## Using Graph Explorer to update the SOA of a Group

Open Graph explorer and login with an appropriate user role (Groups admin): https://developer.microsoft.com/en-us/graph/graph-explorer

## Check existing SoA

```
**GET** 

  *https://graph.microsoft.com/beta/groups/**<****groupId**>**/onPremisesSyncBehavior?$select=isCloudManaged*  

```

![Screenshot 4](/.attachments/AAD-Account-Management/2173320/Screenshot-4.jpg)

Since we haven?t updated the SoA yet, isCloudManaged should be false.

##  Check synced group is read only 

```
PATCH https://graph.microsoft.com/v1.0/groups/<groupId>

{

  "DisplayName": "Group1 Name Updated"

}
```

Since the Group is on-prem mastered as of now, any writes to the Group in the cloud will fail.

![Screenshot 5](/.attachments/AAD-Account-Management/2173320/Screenshot-5.jpg)

If the group is mail enabled, the error message will be slightly different, but updates will not be allowed.

Note: If this API fails with 403, the ?Modify permissions? tab can be used to grant consent to the required permission: Group.ReadWrite.All

## Entra Portal Check

Check Microsoft Entra portal for the group to verify that all the fields for the group are greyed out and that source is Windows Server AD:

![Screenshot 6](/.attachments/AAD-Account-Management/2173320/Screenshot-6.jpg)

![Screenshot 7](/.attachments/AAD-Account-Management/2173320/Screenshot-7.jpg)

# Update SoA of group to be cloud managed

**Note:** It is recommended that the recycle bin be enabled before changing the SOA for any groups. This will ensure that any groups that may be deleted from AD can be recovered if it is necessary to roll back the SOA for a group to AD from Entra. 


Run the following API in the Graph Explorer for the group object you want to switch to the cloud: 

```
PATCH https://graph.microsoft.com/beta/groups/<groupId>/onPremisesSyncBehavior

{

  "isCloudManaged": true

}
```

![Screenshot 8](/.attachments/AAD-Account-Management/2173320/Screenshot-8.jpg)

# Validation Steps

## Call GET on the API to verify isCloudManaged is true.
```
  **GET** *https://graph.microsoft.com/beta/groups/<groupId>/onPremisesSyncBehavior?$select=isCloudManaged*  
```
![Screenshot 9](/.attachments/AAD-Account-Management/2173320/Screenshot-9.jpg)

## Check Audit logs


 Audit logs can be accessed from Azure Portal -> Manage Microsoft Entra ID -> Monitoring -> Audit Logs or by searching for ?audit logs? in the search bar.

Select activity as "**Change Source of Authority from AD to cloud**.?

![Screenshot 10](/.attachments/AAD-Account-Management/2173320/Screenshot-10.jpg)

## Validate that properties on the group can be updated
```
**PATCH** *https://graph.microsoft.com/v1.0/groups/*

{

  "DisplayName": "Group1 Name Updated"

}
```

![Screenshot 11](/.attachments/AAD-Account-Management/2173320/Screenshot-11.jpg)

**Check Microsoft Entra portal to confirm source as cloud**

![Screenshot 12](/.attachments/AAD-Account-Management/2173320/Screenshot-12.jpg)

## Connect Sync Client

1. Run sync in connect sync by running ?Start-ADSyncSyncCycle? in PowerShell window.
2. To look at the group object you switched SOA of, in the ?Synchronization Service Manager,? go to "Connectors":

![Screenshot 13](/.attachments/AAD-Account-Management/2173320/Screenshot-13.jpg)



3. Right click on the ?Active Directory Domain Services Connector?: 

4. Search the group by RDN setting CN=<GroupName>

   

![Screenshot 14](/.attachments/AAD-Account-Management/2173320/Screenshot-14.jpg)

5. Double click on the searched entry and click on ?Lineage->Metaverse Object Properties?


![Screenshot 15](/.attachments/AAD-Account-Management/2173320/Screenshot-15.jpg)

6. Click on ?Connectors? and double click on the **Entra ID object** with ?CN={<Alpha Numeric Characters>}?
7. You will notice ?blockOnPremisesSync? property is set to true on the Entra ID object, which means any changes made in the corresponding Active Directory object will not flow to the Entra ID object:

![Screenshot 16](/.attachments/AAD-Account-Management/2173320/Screenshot-16.jpg)

**Event View Logs:** 

Check Entra Cloud Sync for event ID 6956 in the event viewer, this event id is reserved to inform the customers that the object has not been synced to the cloud because the source of authority of object is in the cloud.

![Screenshot 17](/.attachments/AAD-Account-Management/2173320/Screenshot-17.jpg)


# Rollback SoA update

**Note:** It is recommended that the recycle bin be enabled before changing the SOA for any groups. This will ensure that any groups that may be deleted from AD can be recovered if it is necessary to roll back the SOA for a group to AD from Entra. 

```
**PATCH** *https://graph.microsoft.com/beta/groups/<groupId>/onPremisesSyncBehavior*

{

  "isCloudManaged": false

}
```

![Screenshot 18](/.attachments/AAD-Account-Management/2173320/Screenshot-18.jpg)

**Note:** This change to ?isCloudManaged: false? simply allows the object to be taken over by Connect Sync the next time it runs (assuming the AD object remains in scope). Until Connect Sync runs next, the object remains cloud editable. So, the full ?rollback of SOA? when the object becomes synched from on-prem again only happens after *both* the API call and the next run of Connect Sync (scheduled or forced). 



## CHECK AUDIT LOGs to VALIDATE THE REVERT Operation

 

Select activity as "**Undo changes to Source of Authority from AD to cloud**"

![Screenshot 19](/.attachments/AAD-Account-Management/2173320/Screenshot-19.jpg)



## VALIDATE IN CONNECT SYNC CLIENT

 

1. Run sync in connect sync by running ?Start-ADSyncSyncCycle? in PowerShell window.
2. Open the object in the ?Synchronization Server Manager?, details are given above in the [?CONNECT SYNC CLIENT?](#_Connect_Sync_client) section above, you can notice the state of the Entra ID connector object as ?Awaiting Export Confirmation? and blockOnPremisesSync = false, means the object is taken over by the on-premises again.

![Screenshot 20](/.attachments/AAD-Account-Management/2173320/Screenshot-20.jpg)

# Public Documentation: 


[Configure Group Source of Authority (SOA) (Preview)](https://learn.microsoft.com/en-us/entra/identity/hybrid/how-to-group-source-of-authority-configure?branch=main&branchFallbackFrom=pr-en-us-8663)

[Grant consent on behalf of a single user by using PowerShel](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/grant-consent-single-user?pivots=ms-graph&branch=main)

# Escalations

ICM Path: 

Owning Service: AAD Distributed Directory Services

Owning Team: Directory Schema


# Deep Dive: 

**Title:** Deep Dive: 249757 - Transfer Group Source of Authority from AD to Entra ID 

**Format:** Self-paced eLearning

**Duration:**  61 minutes

**Audience:** Azure Identity

**Region:** All regions 

**Course Location:** [Deep Dive: 249757 - Transfer Group Source of Authority from AD to Entra ID](https://aka.ms/AAwv5bc)