---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Object Level SOA/Transfer User Source Of Authority From AD To Entra ID"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Sync%20Provisioning/Connect%20Sync/Object%20Level%20SOA/Transfer%20User%20Source%20Of%20Authority%20From%20AD%20To%20Entra%20ID"
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

Currently Administrators must choose between syncing from on premise or having cloud only objects. This can cause difficulty when they want to manage users both in Entra and On-Premise separately. We are introducing a new feature that will allow administrators to selectively change the Source of Authority (SOA) from their On-Premise AD to Microsoft Entra without the need to completely disable sync.

Source of Authority SOA (at an object level) is a feature that enables IT Administrators to transition the management of a specific objects from Active Directory (AD) to Microsoft Entra ID. When SOA is applied to an object synced from AD, it converts the object to a cloud object that can be edited & deleted in Entra ID, and Connect Sync (and soon Cloud Sync) honor the conversion and no longer attempt to sync the object from AD. By granting administrators the ability to selectively migrate objects to be cloud-managed, we facilitate a phased approach for the migration process. Instead of switching the entire directory at once to the cloud and discontinuing AD  an action that necessitates substantial redesign and re-platforming of applications  this feature allows for a gradual reduction of AD dependencies. This phased approach ensures seamless operations with minimal impact on end users as well as helping organizations secure their identities using capabilities in Entra ID and Entra ID Governance. There are important caveats and implications, so be sure to thoroughly understand and test prior to using this capability.

# Prerequisites: 

- Confirm that the objects are already synchronized to Microsoft Entra. Administrative objects, or those excluded from synchronization, cant have their SOA changed.

- Confirm that all attributes you have, or plan to modify, on those users are being synched to Microsoft Entra and are visible as either directory attributes, or directory schema extensions: /graph/api/resources/extensionproperty in Microsoft Graph.

- Confirm there are no reference-valued attributes populated on those user objects in Active Directory other than backlinks, such as memberof, and the users manager attribute.

- Confirm that the value of the manager, if set, must be references to a user in the same Active Directory domain and that the user is also synchronized to Microsoft Entra. They cant refer to other object types, or to objects that arent synchronized from this domain to Microsoft Entra.

- Confirm that there are no attributes on the objects that are updated by another Microsoft on-premises technology, other than Active Directory Domain Services (AD DS) itself or MIM. For example, dont change the SOA of a user whose userCertificate attribute is maintained by Active Directory Certificate Services.

- Client Minimum Buids needed:

    - Connect Sync client: 2.5.76.0

    - Cloud Sync client: 1.1.1370.0

# Setup: 

## Consent permission to apps

You can grant permission in the Microsoft Entra admin center or in Graph Explorer. This highly privileged operation requires the Application Administrator or Cloud Application Administrator role. You can also grant consent by using PowerShell. For more information, see Grant consent on behalf of a single user.

**Graph Explorer:**

Use Microsoft Graph Explorer to consent to User-OnPremisesSyncBehavior.ReadWrite.All permission for the user account.

1. Open Microsoft Graph Explorer and sign in as an Application Administrator or Cloud Application Administrator.

2. Select the profile icon, and select Consent to permissions.

3. Search for User-OnPremisesSyncBehavior, and select Consent for the permission.

![Graph Explorer Permissions Blade](/.attachments/AAD-Synchronization/2278979/GE-User-OnPrem-Permission.jpg)

Confirm that Graph Explorer has the correct permissions from the Entra Admin Center

![Entra Portal Graph Explorer Premissions](/.attachments/AAD-Synchronization/2278979/GE-User-SOA-Permissions-In-Entra.jpg)

**Custom apps:**

Follow these steps to grant User-OnPremisesSyncBehavior.ReadWrite.All permission to the corresponding app. For more information about how to add new permissions to your app registration and grant consent, see Update an app's requested permissions in Microsoft Entra ID.

Use Microsoft Entra admin center to consent permission to custom apps

1. Sign in to the Microsoft Entra admin center as an Application Administrator or a Cloud Application Administrator. 
2. Browse to Enterprise Applications > App name.
3. Select Permissions > Grant admin consent for tenant name.
4. Sign in again as an Application Administrator or a Cloud Application Administrator.
5. Review the list of permissions that require your consent, and select Accept.

# Convert SOA for a test user

1. Use Microsoft Graph API to convert the SOA of the user object (isCloudManaged=true). Open Microsoft Graph Explorer and sign in with an appropriate user role, such as user admin.

2. Let's check the existing SOA status. We didnt update the SOA yet, so the isCloudManaged attribute value should be false. Replace the {ID} in the following examples with the object ID of your user. For more information about this API, see Get onPremisesSyncBehavior. /graph/api/onpremisessyncbehavior-update

```
GET https://graph.microsoft.com/beta/users/{ID}/onPremisesSyncBehavior?$select=isCloudManaged

```

![Graph Explorer Output Confirming isCloudManaged is set to False](/.attachments/AAD-Synchronization/2278979/GE-User-IsCloudManaged-False.jpg)

3. To test we can also attempt to update the object. If user object is managed on-premises, any write attempts to the user in the cloud fail. The error message differs for mail-enabled users, but updates still aren't allowed.

**Note:** If this API fails with 403, use the Modify permissions tab to grant consent to the required User.ReadWrite.All permission.

```
PATCH https://graph.microsoft.com/v1.0/users/{ID}/
  	 {
    	 "DisplayName": "User Name Updated"
 	  }

```
![Graph Explorer Update Fails](/.attachments/AAD-Synchronization/2278979/Update-User-Test-Fail-Expected.jpg)

4. Search the Microsoft Entra admin center for the user. Verify that all user fields are greyed out, and that source is Windows Server AD DS:

![Entra Portal User Attributes are not Editable](/.attachments/AAD-Synchronization/2278979/Entra-Portal-User-Details-Uneditable.jpg)

5. Now you can update the SOA of the user to be cloud-managed. Run the following operation in Microsoft Graph Explorer for the user object you want to convert to the cloud. For more information about this API, see [Update onPremisesSyncBehavior](https://learn.microsoft.com/en-us/graph/api/onpremisessyncbehavior-update?view=graph-rest-beta&branch=main&tabs=http)

```
PATCH https://graph.microsoft.com/beta/users/{ID}/onPremisesSyncBehavior
 	  {
     	"isCloudManaged": true
 	  }   

```
![Graph Explorer Change isCloudManaged to True](/.attachments/AAD-Synchronization/2278979/GE-Patch-Command-And-Output.jpg)

6. To validate the change, call GET to verify isCloudManaged is true.

```
GET https://graph.microsoft.com/beta/users/{ID}/onPremisesSyncBehavior?$select=isCloudManaged
```

![Graph Explorer Change isCloudManaged Confirmed as True](/.attachments/AAD-Synchronization/2278979/GE-isCloudManaged-True-Output.jpg)

7. Confirm the change in the Audit Logs. To access Audit Logs in the Azure portal, open Manage Microsoft Entra ID > Monitoring & Health > Audit Logs, or search for audit logs. Select Change Source of Authority from AD to cloud as the activity

![Audit Event for Change from AD to Entra](/.attachments/AAD-Synchronization/2278979/Audit-Log-1.jpg)

**Audit Log Detail:**

![Audit Event Detail](/.attachments/AAD-Synchronization/2278979/Audit-Log-Detail.jpg)


8. Check that the user can be updated in the cloud.

```
PATCH https://graph.microsoft.com/v1.0/users/{ID}/
  	 {
     	"DisplayName": "Update User Name"
  	 }   
```

![Graph Explorer Name Change After SOA Change](/.attachments/AAD-Synchronization/2278979/GE-DisplayName-Patch-Post-Change.jpg)

9. Open Microsoft Entra admin center and confirm that On-premises sync enabled is showing No for the user in the list under All Users, or check the Properties tab under Overview on the User Object 

**User List:**

![On-Premises Sync Enable State from User List](/.attachments/AAD-Synchronization/2278979/On-Prem-Sync-Enabled-No-User-List.jpg)

**Properties Tab:**

![On-Premises Sync Enable State from User Properties](/.attachments/AAD-Synchronization/2278979/On-Prem-Sync-Enabled-User-Properties-No.jpg)

**Connect Sync client to update Entra Connect Sync**

Run the following command to start Connect Sync:

```
Start-ADSyncSyncCycle

```
**Confirm the change shows in Entra Connect Sync:**

1. To look at the user object with converted SOA, in the Synchronization Service Manager, go to Connectors and select  Active Directory Domain Services Connector, then click Seach Connector Space

![Entra Connect Sync Connectors Page](/.attachments/AAD-Synchronization/2278979/Entra-Connect-Connectors-Page.jpg)

2. Search for the user by the relative domain name (RDN) setting "CN=<UserName>":

![Entra Connect Sync Connector Space Search for User Object](/.attachments/AAD-Synchronization/2278979/Search-Connector-Space.jpg)

3. Double-click the searched entry, and select Lineage > Metaverse Object Properties.

![Entra Connect Sync Lineage/Metaverse Object Properties](/.attachments/AAD-Synchronization/2278979/Entra-Connect-Lineage-Tab.jpg)

4. You can see that the blockOnPremisesSync property is set to true on the Entra ID object. This property value means that any changes made in the corresponding AD DS object don't flow to the Entra ID object:

![Entra Connect Sync User Properties blockOnPremisesSync set to True](/.attachments/AAD-Synchronization/2278979/blockOnPremisesSync-True.jpg)

**Audit Event after Sync**

After blockOnPremisesSync has been set to true, the Application Log on the Entra Connect Sync server will report and **event 6956** showing the Source of Authority is moved to Cloud Only

![Entra Connect Sync Application Event Log](/.attachments/AAD-Synchronization/2278979/Entra-Connect-Application-Event.jpg)

# Status of attributes after you convert SOA

The following table explains the status for isCloudManaged and onPremisesSyncEnabled attributes after you convert the SOA of an object.

| Admin Step | isCloudManaged Value | onPremiseSyncEnabled | Description |
|-----|-----|-----|-----|
| Admin syncs an object from AD DS to Microsoft Entra ID  | False | True | When an object is originally synchronized to Microsoft Entra ID, the onPremisesSyncEnabled attribute is set to true and isCloudManaged is set to false. |
| Admin converts the source of authority (SOA) of the object to the cloud  | True | Null | After an admin converts the SOA of an object to the cloud, the isCloudManaged attribute becomes set to true and the onPremisesSyncEnabled attribute value is set to null.|
| Admin rolls back the SOA operation  | False | Null | If an admin converts the SOA back to AD, the isCloudManaged is set to false and onPremisesSyncEnabled is set to null until the sync client takes over the object. |
| Admin creates a cloud native object in Microsoft Entra ID  | False | Null |If an admin creates a new cloud-native object in Microsoft Entra ID, isCloudManaged is set to false and onPremisesSyncEnabled is set to null. |

# Roll back SOA update

**Important**

Make sure that the users that you roll back have no cloud references. Remove cloud users from SOA converted groups, and remove these groups from access packages before you roll back the users to AD DS. The sync client takes over the object in the next sync cycle.
You can run this operation to roll back the SOA update and revert the SOA to on-premises.

```

PATCH https://graph.microsoft.com/beta/users/{ID}/onPremisesSyncBehavior
   {
     "isCloudManaged": false
   }  

```
![Graph Explorer Change isCloudManaged to False](/.attachments/AAD-Synchronization/2278979/GE-Change-iscloudmanaged-to-false.jpg)

**Note**

The change of isCloudManaged to false allows an AD DS object that's in scope for sync to be taken over by Connect Sync the next time it runs. Until the next time Connect Sync runs, the object can be edited in the cloud. The rollback of SOA is finished only after both the API call and the next scheduled or forced run of Connect Sync are complete.

# Validate the change in the Audit Logs

Select activity as **Undo changes to Source of Authority from AD DS to cloud**:

![Entra Audit Log Rollback Event](/.attachments/AAD-Synchronization/2278979/Audit-Log-Undo-SOA.jpg)

**Run a sync cycle to update the object in Entra Connect Sync**

1. Run the following command to start Connect Sync:

```
Start-ADSyncSyncCycle
```

2. Check the Metaverse Properties for the object to confirm that isCloudManged shows False. 

![Entra Connect Sync Metaverse blockOnPremisesSync set to False](/.attachments/AAD-Synchronization/2278979/Metaverse-Attribute-After-Rollback.jpg)

# Logging:

Admins can use Audit Logs in the Azure portal or the onPremisesSyncBehavior Microsoft Graph API to monitor and report SOA changes in their environment. They can also integrate SOA changes with third-party monitoring systems. For more information, see onPremisesSyncBehavior.

## How to use Audit Logs to see SOA changes

You can access Audit Logs in the Azure portal. They retain a record of SOA changes for the last 30 days.

1. Sign in to the Azure portal as at least a Reports Reader.

2. Select Manage Microsoft Entra ID > Monitoring > Audit logs or search for audit logs in the search bar.

3. Select activity as Change Source of Authority from AD DS to cloud.

![Entra Audit Log Showing "Change Source of Authority from AD to Cloud"](/.attachments/AAD-Synchronization/2278979/Audit-Log-1.jpg))

## How to use Microsoft Graph API to create reports for SOA

You can use Microsoft Graph to report data such as:

- Report how many objects are SOA converted
- Filter data for converted users
- Identify objects that were SOA converted and rolled back

## How to use Azure Monitor to create workbooks and reports using Log Analytics

You can integrate Audit Logs with Azure Monitoring and search the following events to get SOA operations:

- Event ID 6956 is logged if an object isn't synced to the cloud because the SOA of the object is cloud-managed.
- When SOA transfer is rolled back to on-premises, user provisioning to AD DS stops syncing changes without deleting the AD DS user. The AD DS user is also removed from the configuration scope. The AD DS user remains intact, and AD DS resumes control in the next sync cycle. You can verify in the Audit Logs that sync doesn't happen for this object because it's managed on-premises.

For more information about how to create custom queries, see [Understand how provisioning integrates with Azure Monitor logs](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/application-provisioning-log-analytics)

# Escalations:

ICM Path: 

Owning Service: AAD Distributed Directory Services

Owning Team: Directory Schema


# Deep Dive: 

**Title:** Deep Dive: 306336 - Convert Synced user into cloud user using User Source of Authority conversion feature

**Format:** Self-paced eLearning

**Duration:**  61 minutes

**Audience:** Azure Identity

**Region:** All regions 

**Course Location:** [Deep Dive: 306336 - Convert Synced user into cloud user using User Source of Authority conversion feature](https://aka.ms/AAy9qld)











