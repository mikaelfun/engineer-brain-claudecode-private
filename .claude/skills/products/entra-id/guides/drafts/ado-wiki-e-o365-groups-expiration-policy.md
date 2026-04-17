---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Group Management/SSGM - Self Service Group Management/Azure AD Office 365 Groups Expiration Policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGroup%20Management%2FSSGM%20-%20Self%20Service%20Group%20Management%2FAzure%20AD%20Office%20365%20Groups%20Expiration%20Policy"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-objprinmgt
- SCIM Identity
- cw.Group-Management
- Group Management
- Group Expiration
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
 

[**Tags**](/Tags): [Entra](/Tags/Entra) [EntraID](/Tags/EntraID) [comm-objprinmgt](/Tags/comm%2Dobjprinmgt) [Group-Management](/Tags/Group%2DManagement)    
 


[[_TOC_]]



# Overview

Expiration Settings for Office 365 Groups allows administrators to define an expiration time for Office 365 groups.  These intervals allow groups to expire after a certain predefined interval has passed.  Currently the interval can be set to 180 or 365 days, with a user defined custom interval as well. If you wish to define custom group lifetime, please note that it needs to be at least 30 days.

When the interval is hit, the owners of the group are notified at the 30, 15, and 1 day mark prior to the group expiration date.  Notifications are sent via email to the defined owner, or, if there is no owner, to a predefined email alias such as an admin.  The email contains buttons to extend the lifetime of the group.

Failure to extend the group allows the group to expire into a soft delete state where the group can be restored up to 30 days after the soft delete.  At the 31st day the group is permanently deleted.

This feature requires AAD Premium (P1) as well as requiring the group owners to have an O365 Exchange license.

## Features

**O365 Groups** provide rich capabilities for Information Workers to enhance collaboration within their teams.

**Challenge:** With the proliferation of Office groups created, admins need the ability to properly manage and govern the groups to ensure compliance to corporate policy, to maintain sanctity of resource usage and prevent GAL pollution.

**The Office 365 groups Expiration Policy** enables the admin to reclaim resource space and prevent address book pollution with Office 365 groups that are no longer actively used.

**Office 365 Groups manual renewal**: When Expiration Policy is applied to a group, this feature will require owners of Office 365 groups to renew their group within a time interval defined by the administrator. Failure to renew the group will lead to the group expiring, and being deleted. The group can be restored within a period of 30 days from deletion.

**Office 365 Groups auto-renewal**: This feature automatically renews groups that are actively used based on user activity across Office 365 apps, such as Exchange, SharePoint and Teams. User actions that lead to auto-renewal of groups include viewing, editing or downloading files, etc. on SharePoint, joining group or reading/writing group message, etc. on Outlook and visiting a Teams channel on Teams.

## Case Handling

Case handling is managed by [AAD - Account Management Professional](https://expert.partners.extranet.microsoft.com/expert/Radius?QueueName=AAD%20-%20Account%20Management%20Professional&QueueNameFilter=account%20management&SearchFlag=True) or [AAD - Account Management Premier](https://expert.partners.extranet.microsoft.com/expert/Radius?QueueName=AAD%20-%20Account%20Management%20Premier&QueueNameFilter=account%20management&SearchFlag=True) if the customer is a premier account.

## How it works

When deploying the expiration settings, there may be some groups that are older than the expiration window. These will not be immediately deleted, but will have 35 days to expiration and the first renewal notification email will be sent out at day 30. For example: Suppose Group A has been created 400 days ago, and the expiration interval is set to 180 days, on applying the expiration settings, the group will have 35 days before it will be deleted and the first expiration email will be sent when there are 30 days left until it will be deleted.

When a Dynamic group is deleted and restored, it is seen as a new group and re-processed. This process may take up to 24 hours.

The policy can be managed only by certain privileged roles, shown below:

| PRIVILEGED ADMIN ROLES |
| ---------------------- |
| Tenant Admin           |
| Partner Tier 1 Support |
| Partner Tier 2 Support |
| User Account Admin     |
| Directory Writers      |

|                                   |                                                                       |
| --------------------------------- | --------------------------------------------------------------------- |
| **API**                           | **Roles permitted to do the action**                                  |
| Create groupLifecyclePolicy       | Tenant Admin, User Account Admin                                      |
| groupLifecyclePolicy: addgroup    | Tenant Admin, User Account Admin                                      |
| Delete groupLifecyclePolicy       | Tenant Admin, User Account Admin                                      |
| Get groupLifecyclePolicy          | Privileged Admins, User (must be Group Owner), 3rd party applications |
| groupLifecyclePolicy: removegroup | Tenant Admin, User Account Admin                                      |
| groupLifecyclePolicy: renewgroup  | Tenant Admin, User (must be Group Owner)                              |
| Update groupLifecyclePolicy       | Tenant Admin, User Account Admin                                      |

### Architecture Diagrams

#### Operational flow chart

(click on image for full size)

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![GroupLifeCycle01.png](/.attachments/GroupLifeCycle01-8532b4b2-a26e-49bc-82ae-376b46a9ffd4.png)](/.attachments/GroupLifeCycle01-8532b4b2-a26e-49bc-82ae-376b46a9ffd4.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

## Limitations

This feature only applies to Office 365 groups. It does not apply to Security groups or Distribution lists.

#Troubleshooting steps 

This is a troubleshooting guide for a support engineer to diagnose and solve customer cases for **groups expiration** in Azure Active Directory. To use this document, follow these steps in sequence.  

   - Step 1 lets you verify that the case is in scope for this TSG, and what to do if it’s not.  
- Steps 2-4 help you identify and solve common usability problems encountered by customers.  
- Steps 5-7 let you get more help with case. 

1. **Has group expiration been turned on?** Go to [How to check whether group expiration has been turned on](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183972/Azure-AD-Office-365-Groups-Expiration-Policy?_a=edit&anchor=how-to-check-whether-group-expiration-has-been-turned-on) section to verify. If yes, continue to 2. If no, group expiration is not relevant for this case.
2. **Group renewal issues?** Customers encounter group renewal issues. If verified the issue is manual renewal, follow [this section.](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183972/Azure-AD-Office-365-Groups-Expiration-Policy?_a=edit&anchor=manual-renewal) If auto-renewal, please go [here](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183972/Azure-AD-Office-365-Groups-Expiration-Policy?_a=edit&anchor=auto-renewal).
3. **Renewal email notifications.** If customer has issues with group renewal email notifications, please follow [this section](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183972/Azure-AD-Office-365-Groups-Expiration-Policy?_a=edit&anchor=renewal-notification-emails). 
4. **Group restoration issues.** For group restoration support, please reference [this](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183972/Azure-AD-Office-365-Groups-Expiration-Policy?_a=edit&anchor=group-restoration). 
5. Trouble-shooting tools and processes
6. Get help with the case. Ask question in [Group management Teams](https://teams.microsoft.com/l/channel/19%3ac6e22a9b887d4f77b177cd074d345616%40thread.skype/Group%2520management?groupId=56c43627-9135-4509-bfe0-50ebd0e47960&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) channel to get further help from aztabot, SMEs, TAs, and PG members. File ICM incident accordingly.
7. Communicate with the customer. Communicate root cause and case resolution to the customer.

# How to check whether group expiration has been turned on 

You can configure expiration policy for Office 365 groups. To configure expiration policy, you need global administrator or user administrator role. Groups with expiration policy applied will experience the group reaches the time span defined in Group lifetime under expiration policy. Owners of the group are notified to renew the group as expiration nears. If owner doesn’t renew the group, the group will be deleted. Any Office 365 group that is deleted can be restored within 30 days by the group owners or the administrators. Please note expiration is not supported for security groups. 

To use and configure expiration policy for Office 365 groups, it requires you to possess but not necessarily assign Azure AD Premium licenses for all the members of all groups to which the expiration policy is applied. Like in [Dynamic groups](https://learn.microsoft.com/entra/identity/users/groups-dynamic-membership), you must have the minimum number of licenses in the Azure AD organization to cover all such users.
When you first set up expiration, any groups that are older than the expiration interval will expire in 30 days. The first renewal notification email is sent out within a day. 

For more information, please access [Configure the expiration policy for Microsoft 365 groups](https://learn.microsoft.com/entra/identity/users/groups-lifecycle).

There are currently 2 options to check whether a tenant has expiration policy turned on and how expiration is configured.

1. Customers can check on Azure portal: Go to Groups, on the Expiration blade, check whether expiration is enabled. Expiration can be enabled to all Office 365 groups or selected groups.
![image.png](/.attachments/image-cfb30dc4-ead8-4551-940e-1cd56d962b31.png)
2. On PowerShell

    Managing the Office 365 groups expiration feature requires Microsoft Graph PowerShell Module **(Note that the "Add-MgGroupToLifecyclePolicy" and "Remove-MgGroupLifecyclePolicy" only work if the expiration is set to "Selected" groups)** :


| CMDLETS | Description |
|--|--|
| [Add-MgGroupToLifecyclePolicy](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.groups/add-mggrouptolifecyclepolicy) |Adds a group to a lifecycle policy  |
| [Remove-MgGroupLifecyclePolicy](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.groups/remove-mggrouplifecyclepolicy) |Removes a group from a lifecycle policy  |
| [Get-MgGroupLifecyclePolicy](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.groups/get-mggrouplifecyclepolicy) |  Retrieves the properties and relationships of a groupLifecyclePolicies object in Azure Active Directory. Please note only 1 groupLifecyclePolicy is allowed. If try to create a second policy, MaxExpirationPoliciesCountReachederror message will show.|
| [Get-MgGroupLifecyclePolicy](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.groups/get-mggrouplifecyclepolicy) |Retrieves the lifecycle policy object to which a group belongs.  |
| [New-MgGroupLifecyclePolicy](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.groups/new-mggrouplifecyclepolicy) | Creates a new groupLifecyclePolicy |

# What to do if Group Expiration Date did not get cleared after group expiry policy turned off
Customer may raise an incident in which after they turned off expiration policy from Azure portal, group expiration date did not get cleared for groups.

## Troubleshooting Steps
1. Double check the configuration, ensure group expiry policy is indeed turned off. 

2. With tenantId and GroupId, confirm in ASC whether the group still has GroupExpirationDate value.
   
   If there's a value in the field (may include "#"), it indicates that the GroupExpirationDate has not be cleared.
3. Confirm in logs whether the GroupExpirationDate has been cleared. Sample query:
    ````
    cluster("idsharedwus").database("aadssgmprod").IfxDiagnosticsEvent
    | where env_time > {DateTime}
    | where env_cloud_role == "SSGMWorkerRole-MF"
    | where Actor_TenantId == "{tenantId}"
    | where Log_Message contains "{groupId}"
    | project env_time, Log_Message
    ````
    If GroupExpirationDate has been cleared properly, it is expected to see a message like below, where GroupExpiryDateTime is set to null.
"Updated LCM notification data. PolicyIdentifier = , GroupId = 30cf9d7b-dec6-4437-97ec-31326300b107, LastNotificationDateTime = , NumNotificationsSent = 0, GroupExpiryDateTime = ."

4. If a message like above is not found, customer can ran below command through powershell to re-trigger removing group expiration policy. 
    ````
    Remove-MgGroupLifecyclePolicy -GroupLifecyclePolicyId $groupLifecyclePolicyId
    ````
   For more details about running powershell commands, please refer to this [documentation](https://learn.microsoft.com/powershell/module/azuread/remove-azureadmsgrouplifecyclepolicy?view=azureadps-2.0).

    PolicyId can be found in Log_Message from running the following query with tenantId specified:
    
   ````
   cluster("idsharedwus").database("aadssgmprod").IfxDiagnosticsEvent
   | where env_cloud_role == "SSGMWorkerRole-MF"
   | where Actor_TenantId == {tenantId}
   | where Log_Message startswith "TenantId = "
   | summarize arg_max(env_time, Log_Message) by Actor_TenantId
   ````
5. After customer has run the above command, validate GroupExpirationDate has been cleared with step 1 and step 2.

If the above steps doesn't help, please raise ICM to "IAM Services/SSGM Triage" team.

Bug: [2315818 - LCM worker role should clear any residual expiration date for all groups which are not part of any LCM policy any more](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/2315818)

# How to troubleshoot Office 365 group renewal issues


##Manual renewal 
###Where customers can renew an Office 365 group 

Customers can renew an Office 365 groups from the following channels:
1. Through expiration email: 30, 15 and 1 days/day before a group is set to expire, group owner will receive an expiration email. When clicking on the email “Renew Group” button, group will be renewed. 
2. From Access Panel https://account.activedirectory.windowsazure.com/r#/groups if Self Service Group Management does not restrict access to Groups on Access Panel.
![image.png](/.attachments/image-e32a8fc4-0f0f-4bd0-aaa8-c59abe5978e4.png)

Please note administrator needs to enable Groups access on Access Panel on Azure Portal. If “Restrict access to Groups in the Access Panel” is set to Yes, end users are not able to see Groups blade on Access Panel.

3. Renew group on PowerShell 

   You can renew a group on PowerShell with this command:

       Invoke-MgRenewGroup -GroupId $groupId 

   Please find more details from [here](https://learn.microsoft.com/powershell/module/azuread/Reset-AzureADMSLifeCycleGroup?view=azureadps-2.0-preview). After a group is renewed, you can use this command

       Get-MgGroup -Filter "DisplayName eq 'Business Development'"

   to check if RenewedDateTime is updated.


4. Renew group on MS Graph
    
   A group can be renewed on MS Graph:

        POST/groups/{id}/renew

    Please see [here](https://learn.microsoft.com/graph/api/group-renew?view=graph-rest-1.0&tabs=http) for more details. After group renewal, RenewedTimeDate will be updated. To view the updated expirationDateTime, you’ll need to query the group on MS GraphBeta, not on V1, as expirationDateTime has been enabled only in Beta.

###Manual renewal issues 

After a group is renewed, group expiration date is not updated with the new expiration date in apps such as Outlook, SharePoint and Teams.

CSS can check if the group is renewed successfully on Azure Support Center:

1. Get the group ID and the time customer performed group renewal from the customer
2. Check the last renewed time and expiration time of the group on ASC
3. If the group’s renewedDateTimehas not been updated due to a failed call to renew group, then check audit logs.
    - Launch ASC
    - Go to Azure AD Explorer
    - Go to Audit log section
    - Search for the groupId in the Target field and adjust time range as necessary
4. If need further investigation, you can check SSGM Kusto logs
    - To Search for the logs of a group being renewed, follow the following query(this one is searching for group b43d4e69-####-####-####-############ in the Microsoft tenant being renewed):

Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://idsharedwus.kusto.windows.net/aadssgmprod

      letstart= datetime(6/19/2019);
      IfxDiagnosticsEvent
      | whereenv_time>= startandenv_time<= start+ 1d
      | whereenv_cloud_role== "ApprovalManagementWebRole"
      | whereActor_TenantId== "72f988bf-####-####-####-############"
      | whereLog_Messagecontains"Renew"
      | whereLog_Messagecontains"b43d4e69-####-####-####-############"
  - Then use the Action_InternalCorrelationId to search for the full logs of the request:

Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://idsharedwus.kusto.windows.net/aadssgmprod

      letstart= datetime(6/19/2019);
      IfxDiagnosticsEvent
      | whereenv_time>= startandenv_time<= start+ 1d
      | whereenv_cloud_role== "ApprovalManagementWebRole"
      | whereActor_TenantId== "72f988bf-####-####-####-############"
      | whereAction_InternalCorrelationId== "108dd1c7-3a4f-49d2-a0ac-33e0a11473b3"

5. If renewed successfully, then need to involve Office team 
6. If no logs are found, it could be an issue with SSGM configuration, please involve PG at this time.

##Auto-renewal
Here’s a complete list of activities that can trigger groups auto-renewal:

**ExoSignalsList**=CopyItem,ModernGroupsQuickCompose,ModernGroupsQuickReply,SendMessageToUnifiedGroup,VisitUnifiedGroupConversations,FindGroupConversations,GetGroupConversation,JoinGroup,EditGroup

**SpoSignalsList**=FileAccessed,FileDownloaded,PageViewed,ClientViewSignaled,FileModified,FileUploaded,FileRenamed,FileDeleted,FileMoved,CommentAdded,UserAtMentioned,ShareNotificationRequested,LikeAdded

**TeamsSignalList**=VisitTeamChannel

Please refer to the public doc for the latest info: [Activities that automatically renew group expiration](https://learn.microsoft.com/entra/identity/users/groups-lifecycle#activities-that-automatically-renew-group-expiration)

###How to check what groups are auto-renewed

Customer can get a list of groups that are auto-renewed from Audit Logs on Azure Portal. 
![image.png](/.attachments/image-d1917ebe-5bfd-4666-ba48-b73c9c8af473.png)

1. Customer signs into Azure portal and go to Azure Active Directory

2. Go to Audit logs, select “Self-service Group Management” as the Service and “Auto-renew group” as Activity. Then customize the time interval customer wants to audit the auto-renewed groups. Audit logs are stored for 30 days for tenants with Azure AD Premium P1/P2 licenses 
[Microsoft Entra data retention](https://learn.microsoft.com/entra/identity/monitoring-health/reference-reports-data-retention).

CSS can use Azure Support Center to search audit logs for autorenewed groups: 
![image.png](/.attachments/image-d39452c1-11e0-4e17-98a1-fd73347e0697.png)

###How to check if a group is auto-renewed 

Customer can check from Audit logs on Azure Portal, if the group auto-renewalactivity happened within the time Audit logs are stored in the customer tenant.

CSS can check if a group is auto-renewed on Azure Support Center Audit logs as above, or through the following Kusto query:(Note long time intervals may take a while to execute, and thus this method is not preferred over using ASC)

Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] `https://idsharedwus.kusto.windows.net/aadssgmprod`

      letstart= datetime(6/10/2019);
      IfxDiagnosticsEvent
      | whereenv_time>= startandenv_time<= start+ 10d
      | whereenv_cloud_role== "WorkflowWorker"
      | whereActor_TenantId== "72f988bf-####-####-####-############"
      | whereLog_Messageendswith"was autorenewed."
      | whereLog_Messagecontains"9160bddc-a003-4652-942e-695ff69894b4"

###How to check why a group is auto-renewed 

Because of the design of this feature, Self-Service Group Management (SSGM) doesn’t get the signals of what apps and what app activities that triggered the group auto-renewal. Signals are owned and stored by the Office team(Substrate team). Please have the information of group ID and approximately when the group was auto-renewed and reach out to the Office support team.

###Auto-renewal issues

It's certain that members of the group have been accessing SharePoint or Teams. Why is the group not auto-renewed?

1. Check on Azure Support Center when the group is last renewed. 
2. If the last renewed date matches the time when group members’ app activities occurred, CSS can ensure the customers that the group is auto-renewed.
3. If the last renewed date doesn’t reflect the more recent app activities, the case needs to be co-investigated with Office team.

   * Collaboation with M365 CSS team (SAP below depending on group type) and request escalation to M365 Groups 911 PG team for troubleshooting [activity-based auto renewal signal investigation](https://eng.ms/docs/experiences-devices/m365-core/groups-team/group-management-vnext/groups911-on-call-troubleshooting-guide/troubleshooting_guides/groups/group-features/activity-based-auto-renewal-groups)

      * Sharepoint Groups: SharePoint/SharePoint Online/Sharing, Permissions, and Authorization/SharePoint Groups
      * Exchange Online Groups : Exchange/Exchange Online/Groups, Lists, Contacts, Public Folders

4. NOTE: We do not renew group immediately when activity happens.  When activity happens we update some data on group to indicate the group is eligible for renew and we will renew the group when it's near expiry.  Usually it's 35 days before expiry.  If the group is already near expiry, and had some activity then the group will be renewed within 24 hours.

It’s certain that there’s no activities with the group, why is the group auto-renewed?

1. Check on Azure Support Center when the group is last renewed. 
2. If the group is renewed even though there’s no user activity according to the customers, the case needs to be co-investigated with Office team. Customer can also get Office365GroupsActivityDetail from the Graph API [reportRoot: getOffice365GroupsActivityDetail](https://learn.microsoft.com/graph/api/reportroot-getoffice365groupsactivitydetail?view=graph-rest-1.0&tabs=http)
3. If verified with Office team that there are app signals that auto-renewed the group, ask for more information from the customer if there are any background processing tools in the customer tenant. Inform and involve PG at this phase. 
4. If indeed there are no Office activities, check if it matches the [known issue](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/997252/Known-Issues?anchor=**issue-4**%3A-m365-groups-is-autorewnewed-though-there-are-no-office-activities).
##Troubleshooting / Confirming and updating renewedDateTime and ExpirationDateTime / renew using graph powershell

##Sharepoint Activity not updating Entra renewedDatetime/expirationDateTime

If this is an issue with Sharepoint Online activity not updating Entra : Please get output from sharepoint and entra using the powershell commands below
```
Connect-SPOService -url "https://<yourdomain>-admin.sharepoint.com"
get-sposite -limit all | select url, lastcontentmodifieddate | sort-object lastcontentmodifieddate, url -Descending | export-csv -path c:\temp\sharepoint-site-activity.csv -notypeinformation

To get more filtered list, 

get-sposite -limit all | select url, lastcontentmodifieddate | sort-object lastcontentmodifieddate, url -Descending | ?{$_.url -like "*library*"}
 | export-csv -path c:\temp\sharepoint-site-activity.csv -notypeinformation 

```

Powershell 7+ is required for microsoft.graph  
```
install-module -name microsoft.graph -scope allusers -force -allowclobber
import-module microsoft.graph
  
connect-mggraph -scope "group.read.all"

$groupexpiration = get-mggroup -all | Select-Object -Property displayname, Mail,id, CreatedDateTime, ExpirationDateTime, RenewedDateTime, DeletedDateTime, grouptypes |Sort-Object  -Property ExpirationDateTime,renewedDateTime |Where-Object{$_.grouptypes -contains "Unified" -and $_.expirationDateTime -ne $null} | Export-csv -Path c:\temp\group.csv  
$groupexpiration | ft
```
example output 
![image.png](/.attachments/image-cf5a5ea6-a88e-42df-9d4f-1ee66735158c.png)

To renew a group which is not updating based on the Sharepoint/Teams/etc activity, the following graph commands can be used.  
from the above export, copy a group objectid

```
connect-mggraph -scope "group.readwrite.all"
get-mggroup -groupId 134c1552-65a7-4f35-8d7a-b93b35d4411b -property displayname,id,renewedDateTime, expirationdatetime | select displayname,id,renewedDateTime, expirationdatetime  

DisplayName   Id                                      RenewedDateTime       ExpirationDateTime  
-----------   --                                      ---------------       ------------------  
test          134c1552-65a7-4f35-8d7a-b93b35d4411b    4/5/2023 9:08:26 PM  4/22/2025 12:00:00 AM

invoke-MgRenewGroup -GroupId 134c1552-65a7-4f35-8d7a-b93b35d4411b
```
rerun the above get-mggroup command to view the updated renewedDateTime and ExpirationDateTime  
  
**(Please note, you may have to run this several times up to 1-5 minutes later to confirm the updated renewedDateTime and expirationDateTime (s) have been updated)** 

```
get-mggroup -groupId 134c1552-65a7-4f35-8d7a-b93b35d4411b -property displayname,id,renewedDateTime, expirationdatetime | select displayname,id,renewedDateTime, expirationdatetime

DisplayName    Id                                   RenewedDateTime        ExpirationDateTime  
-----------    --                                   ---------------        ------------------  
test           134c1552-65a7-4f35-8d7a-b93b35d4411b 3/27/2025 8:00:58 PM   9/23/2025 8:00:59 PM**
```
### Update RenewedDateTime using Graph API/Explorer

To update the renewedDateTime/expirationDateTime, Graph Explorer via web browser can also be used  
  
Open Graph Explorer from a web browser and login using your tenant credentials.  
change permissions to **Group.readwrite.all** (under username, consent to permissions, user will need to be GA or have GA consent to this permission)

```
Change method to GET  
https://graph.microsoft.com/v1.0/groups/<groupobjectid>?$select=displayname, id,renewedDateTime, expirationDatetime
Click - Run Query  

Graph Headers should return 

{
    "@odata.context": "[https://graph.microsoft.com/v1.0/$metadata#groups(displayName,id,renewedDateTime,expirationDateTime)/$entity"],
    "displayName": "tests18",
    "id": "82e6b333-2f53-4597-a012-ed2b8b15c0a1",
    "renewedDateTime": "2024-03-27T19:56:23Z",
    "expirationDateTime": "2025-03-23T19:56:23Z"
}
```  
change method to POST -   
```
https://graph.microsoft.com/v1.0/groups/<groupobjectid>/renew
```
Click - Run Query - 200 ok will be returned w 204 no content (below example)  
  
change method to GET, change query to the previous   
```
https://graph.microsoft.com/v1.0/groups/<groupobjectid>?$select=displayname, id,renewedDateTime, expirationDatetime  
```

Click - Run Query and confirm the renewedDateTime (should be same day/time customer is running and expirationDatetime based on expiration policy (ex: 180 days from renewedDateTime)
```
{
    "@odata.context": "[https://graph.microsoft.com/v1.0/$metadata#groups(displayName,id,renewedDateTime,expirationDateTime)/$entity"],
    "displayName": "tests18",
    "id": "82e6b333-2f53-4597-a012-ed2b8b15c0a1",
    "renewedDateTime": "2025-03-27T19:56:23Z",
    "expirationDateTime": "2025-09-23T19:56:23Z"
}
```
GET Example :

![image.png](/.attachments/image-d99aee14-9533-4822-9fd5-2f21f5634ed2.png)


renew Example: NOTE Change to POST, put /renew after the group objectid.  200 OK - 204 response no content

![image.png](/.attachments/image-dc01188a-c0d7-4efc-a41e-14fca4e1d7a3.png)

Confirmation GET Example:

![image.png](/.attachments/image-249e7df6-43e1-473d-8b2c-0e8cf14e2c1a.png)


#Renewal notification emails 

Email notifications such as this one are sent to the Office 365 group owners 30 days, 15 days, and 1 day prior to expiration of the group.
Have the customer check Exchange Online for blocking or allowing msonlineservicesteam@microsoftonline.com OR msgroupsteam@microsoft.com


<div class="thumb tnone">

<div class="thumbinner" style="width:552px;">

![msgroupsteams@microsoft.com.png](/.attachments/image-3eef6927-2263-40c7-98fb-f01bc928e515.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>
#Renewal notification emails 

Email notifications such as this one are sent to the Office 365 group owners 30 days, 15 days, and 1 day prior to expiration of the group. The sending address of these emails is msgroupsteam@microsoft.com. 

<div class="thumb tnone">

<div class="thumbinner" style="width:552px;">

![image.png](/.attachments/image-ec91715a-789b-4433-8f24-eea03407fc79.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

If the owners don’t renew the group within the required time frame, the group expires, and is deleted.  An email notification informs the group owners about the deletion, and allows them to restore the group with a single click for a period of 30 days after its deletion. Learn more about how to configure the Expiration Settings for Office 365 groups [here](https://review.learn.microsoft.com/entra/identity/users/groups-lifecycle?branch=main&branchFallbackFrom=pr-en-us-13933).  

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">



<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

The group can be restored by selecting **Restore group** or by using PowerShell cmdlets, as described in Restore a deleted [Restore a deleted Microsoft 365 group in Microsoft Entra ID](https://learn.microsoft.com/entra/identity/users/groups-restore-deleted)

If the group you're restoring contains documents, SharePoint sites, or other persistent objects, it might take up to 24 hours to fully restore the group and its contents.

##Why customers receive notification emails

Email notifications are sent to Office 365 group owners 30 days, 15 days and 1 day prior to expiration of the group. Owners can renew groups from “Renew group” link in the email. 

The language of the email is determined by groups owner's preferred language or tenant language. If the group owner has defined a preferred language, or multiple owners have the same preferred language, then that language is used. For all other cases, tenant language is used.

##Customers got multiple notificaiton emails within short timeframe 
- Verify time frame when customer received multiple notifications and the group ID for the notifications

- If verified that multiple notifications were sent to the customer for a single group renewal, Involve PG and file an ICM.

##Customer got renewal notification email when group already expired

- Verify from Azure Support Center that email notification was sent later than expiration

- If verified, involve PG and file an ICM.

##Customers didn’t get notification email and their group expired

1. Check with the customer if the email notifications went to Clutter or Junk email folder
2. If customer didn’t receive email notification and the group has not expired yet, please verify the expiration date of the group first on ASC.
3. If the group has expired, you can search SSGM Kusto logs below to verify the expiration date of the group

Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] `https://idsharedwus.kusto.windows.net/aadssgmprod`

      let start = datetime(6/17/2019);IfxDiagnosticsEvent
      | whereenv_time>= startandenv_time<= start+ 1d
      | whereenv_cloud_role== "WorkflowWorker"
      | whereAction_Scenario!contains"processor"//filter out Dynamic Groups logs
      | whereActor_TenantId== "72f988bf-####-####-####-############"
      | whereLog_Messagestartswith"Group 1fbe3131-####-####-####-############"

4. If the date suggests that the email should have been sent and customer still can’t find the email, please engage PG on Group Management Teams channel.
5. If the group has expired but the customer still needs the group, help customer restore the group. Please see Group restoration section below. 

# Group restoration 

## How to restore a group after expiration

When you delete an Office 365 group in the Azure Active Directory (Azure AD), the deleted group is retained but not visible for 30 days from the deletion date. This behavior is so that the group and its contents can be restored if needed. 

This functionality is restricted exclusively to Office 365 groups in Azure AD. It is not available for security groups and distribution groups. Please note that the 30-day group restoration period is not customizable.

Office 365 groups can be restored from Azure portal:
1. Sign into Azure portal with administrator account
2. Select Groups, then select Deleted groups to view the deleted groups that are available to restore
3. On the Deleted group blade, you can:
   - Restore the deleted group and its contents.
   - Permanently remove the deleted group. You must be an administrator to permanently remove a group.

Office 365 groups can be restored using PowerShell:
1. Verify the group is still available to restore
2. Restore the group and its content with the following cmdlet: Restore-EntraDeletedDirectoryObject –Id <objectId>
3. Alternatively the following cmdlet can permanently remove the deleted group: Remove-EntraDeletedDirectoryObject -DirectoryObjectId <objectId>

For more information regarding Group restoration, please check out [this document.](https://learn.microsoft.com/entra/identity/users/groups-restore-deleted)

##Restoration issues

If the group doesn’t appear on the groups page after performing the restoration action, please check Audit logs on Azure Support Center first. Search for the groupId in the Target field and adjust time range as necessary.

###How Office 365 groups expiration works with retention policy

The retention policy is configured by way of the Security and Compliance Center. If you have set up a retention policy for Office 365 groups, when a group expires and is deleted, the group conversations in the group mailbox and files in the group site are retained in the retention container for the specific number of days defined in the retention policy. Users won't see the group or its content after expiration, but can recover the site and mailbox data via e-discovery.

#Trouble-shooting tools and processes


##Azure Support Center

###How to find audit logs in Azure Support Center
1. Go to https://azuresupportcenter.msftcloudes.com/
2. Log in with your Microsoft account
3. Enter the support request ID
4. Go to “Azure AD explorer” Tab on top, navigate to “audit log” in the left panel, as shown below:
![image.png](/.attachments/image-9706bd96-7259-4237-ad4d-73b23f6fa138.png)
5. Set the time range that corresponds to the time when the customer indicated the problem began.
6. Filter the column(s) with corresponding values if applicable: for example, add a filter in activity column to get “add member to group” logs

###How to read group data using Azure Support Center
1. Go to https://azuresupportcenter.msftcloudes.com/
2. Log in with your Microsoft account
3. Enter the support request ID
4. Go to “Azure AD explorer” Tab on top, navigate to “Groups” in the left panel, you can get “**_group properties_**”, “**_Members_**”, “**_Owners_**” and “**_Dynamic Rules_**” info with corresponding inner panel, as shown below:

**Group properties:**
![image.png](/.attachments/image-87909372-5083-47ae-a5ab-2149b5b6d9c3.png)

##Scoping question and sufficient data for support request
###How to get sufficient data in support request for group expiration 

In a support request submitted as below:
![image.png](/.attachments/image-da520e92-4e00-46b3-8a14-c1bb5d5b4a68.png)

##Kusto for diagnostic and log analysis
###How to access Kusto 

1. Download Kusto explorer

|  |  |  |
|--|--|--|
|Kusto.Explorer  |https://aka.ms/ke  |Desktop UI tool for querying Kusto; more details  |
|Kusto.WebExplorer |https://aka.ms/kwe  | Web UI tool for querying Kusto; more details |
|Kusto.Explorer(SAW)  |https://aka.ms/kesaw  | More details here |

2. Create connection to idshared kusto cluster `https://idsharedwus.kusto.windows.net:443`:
![image.png](/.attachments/image-ce76f24a-ca24-4b43-9d66-47aded9dc1b0.png)
3. If adding the connection fails, try joining the AADIAM Log Viewer security group on //idweb.
4. Access Life Cycle Management prod data in database: <font color = "blue" > **aadssgmprod** </font>, table <font color = "purple" > IfxDiagnosticsEvent </font>

###SSGM Group Logs Anatomy

|<font color = "purple" > IfxDiagnosticsEvent </font> |
|--|
|**Important column to query:** |
|**env_time** : time in UTC  |
|**Log_Leve**: warning, error, verbose  |
|**env_cloud_environment**: PROD, PPE, TEST  |
|**env_cloud_role**:  worker-role(WorkflowWorker),  or Web-role (ApprovalManagementWebRole) The worker role processes groups for expiration, whereas the web role handles requests like updating the Lcm policy. |
|**Log_Message**: log content  |
|**env_cloud_location**: Datacenter where the event triggered  |
|**Actor_TenantId**: TenantId where the event triggered  |
|**Actor_InternalCorrelationId**: Internal correlation to processing pipeline or objects depending on the log content  |
|**Action_Scenario**: This field is used for Dynamic groups only, for group expiration logs this field is blank.  |

###How to check error and warning of a tenant processing

For a given tenant objectId <tenant_id>, Run the following Kusto Query to get diagnostic logs in the last 24 hours:

Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] `https://idsharedwus.kusto.windows.net:443/aadssgmprod`

      IfxDiagnosticsEvent
      | where env_time> ago(24h)
      | where env_cloud_role== "WorkflowWorker"
      | whereLog_Level contains"error"orLog_Level contains"warning"
      | where *contains “<tenant_id>”

# Frequently Asked Questions (FAQ)

**Q:** Can you set the notification email format via PowerShell?:

**A:** No

**Q:** Can you customize when the notification email is sent out? E.g. instead of 30,15,1 day prior to expiry, the customer wants 60,45,10 days.

**A:** No, 30,15,1 days are fixed.

**Q:** How is retention policy linked? For groups that need to be retained for a preset number of years, how is this handled?

**A:** This should be handled by default. When the retention policy is set, when the group or its contents get deleted, it moves to a different container that can be accessed through eDiscovery. If a group gets deleted after expiry, and if there is a retention policy set, the group contents (mailbox and files) will still be available.

**Q:** How long does restoration take for Mailbox, SharePoint, etc.?

**A:** There is a 24-Hour Service Level Agreement (SLA) to recover the group.

**Q:** I have groups older than the expiration interval policy i wish to set. What happens to them?

**A:** During the initial deployment for groups older than the expiry interval: When applying the policy, there may be some groups that are older than the expiry window. They will not be immediately deleted upon application of the expiration policy. The group expiration interval will be set to 35 days and the first expiration warning email will be sent 30 days prior to deletion. As an example, Group A has been created 400 days ago, and the expiration interval is set to 180 days. Upon enabling the policy, the group will have 35 days before it will be deleted. The first notification email is sent out 30 days before the group expires, if the group is not auto-renewed. For more information see [Configure the expiration policy for Microsoft 365 groups](https://learn.microsoft.com/azure/active-directory/enterprise-users/groups-lifecycle). 

**Q:** How often does the expiration policy process?

**A:** Each tenant is processed twice a day for changes and application of policy.

**Q:** How are renewals processed?

**A:** Clicking on ‘Renew Group’ in the Notification Email : User need to be Owner or Company Administrator. Note: Renewal will be triggered even if the user does not have a Premium License of if SSGM is disabled via Ibiza Portal.

# PowerShell Examples

Here are examples of how you can use PowerShell cmdlets to configure the expiration settings for Microsoft 365 groups in your Microsoft Entra organization:
1.  Install the Microsoft Graph PowerShell module and sign in at the PowerShell prompt.
    
    
    
        Install-Module Microsoft.Graph -Scope CurrentUser
        Connect-MgGraph -Scopes "Directory.ReadWrite.All"
        
    
2.  Configure the expiration settings. Use the [New-MgGroupLifecyclePolicy](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.groups/new-mggrouplifecyclepolicy) cmdlet to set the lifetime for all Microsoft 365 groups in the Microsoft Entra organization to 365 days. Renewal notifications for Microsoft 365 groups without owners are sent to `emailaddress@contoso.com`.
    
    
    
        New-MgGroupLifecyclePolicy -AlternateNotificationEmails emailaddress@contoso.com `
           -GroupLifetimeInDays 365 -ManagedGroupTypes All
        
    
3.  Retrieve the existing policy by using [Get-MgGroupLifecyclePolicy](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.groups/get-mggrouplifecyclepolicy). This cmdlet retrieves the current Microsoft 365 group expiration settings that were configured.
    
    
    
        Get-MgGroupLifecyclePolicy
        
    
    In this example, you can see:
    *   The policy ID.
    *   Renewal notifications for Microsoft 365 groups without owners are sent to `emailaddress@contoso.com`.
    *   The lifetime for all Microsoft 365 groups in the Microsoft Entra organization is set to 365 days.
    
    OutputCopy
    
        Id                                   AlternateNotificationEmails GroupLifetimeInDays ManagedGroupTypes
        --                                   --------------------------- ------------------- -----------------
        1aaaaaa1-2bb2-3cc3-4dd4-5eeeeeeeeee5 emailaddress@contoso.com    365                 All
        
    
4.  Update the existing policy by using [Update-MgGroupLifecyclePolicy](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.groups/update-mggrouplifecyclepolicy). This cmdlet is used to update an existing policy. In the following example, the group lifetime in the existing policy is changed from 365 days to 180 days.
    
    
    
        Update-MgGroupLifecyclePolicy -GroupLifecyclePolicyId "1aaaaaa1-2bb2-3cc3-4dd4-5eeeeeeeeee5" -GroupLifetimeInDays 180 -AlternateNotificationEmails "emailaddress@contoso.com"
        
    
5.  Add specific groups to the policy by using [Add-MgGroupToLifecyclePolicy](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.groups/add-mggrouptolifecyclepolicy). This cmdlet adds a group to the lifecycle policy. As an example:
    
    
    
        Add-MgGroupToLifecyclePolicy -GroupLifecyclePolicyId "1aaaaaa1-2bb2-3cc3-4dd4-5eeeeeeeeee5" -GroupId "cffd97bd-6b91-4c4e-b553-6918a320211c"
        
    
6.  Remove the existing policy by using [Remove-MgGroupLifecyclePolicy](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.groups/remove-mggrouplifecyclepolicy). This cmdlet deletes the Microsoft 365 group expiration settings but requires the policy ID. This cmdlet disables expiration for Microsoft 365 groups.
    
    
    
        Remove-MgGroupLifecyclePolicy -GroupLifecyclePolicyId "1aaaaaa1-2bb2-3cc3-4dd4-5eeeeeeeeee5"
# Supportability Documentation

### Public documentation

Configure the expiration policy for Office 365 groups : [Configure the expiration policy for Microsoft 365 groups](https://learn.microsoft.com/entra/identity/users/groups-lifecycle)

Blog post: [User Activity based Expiration Policy for Office 365 groups is now in Private Preview!](https://techcommunity.microsoft.com/t5/Office-365-Blog/User-Activity-based-Expiration-Policy-for-Office-365-groups-is/ba-p/762598)

### Troubleshooting Guides (TSGs):

* Updated (11 October 2019) Group Expiration TSG is located [here](https://microsoft.sharepoint-df.com/:b:/s/AccountManagement-SupportEngineeringconnection/EVHxs9oWW-tDj6Wm6T36DqIBjt-ZXP0ki1l15JMB2iNkCQ?e=Ifdpn4).

* Updated (9 Aug 2019) Group Creation and Troubleshooting TSG is located [here](https://microsoft.sharepoint-df.com/:b:/s/AccountManagement-SupportEngineeringconnection/EdxKhMkjEp9MlD4rWkH4uE0BPJgmaL93NGG6t8UCny9-ag?e=M0Xbb3).

### ICM

Escalations are filed via ICM. Please use this link: <https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=I2Y1G2>

**Service Category:** Active Directory

**Owning Service:** IAM Services

**Owning Team:** SSGM Triage

### Training

[Microsoft Community Hub](https://blogs.technet.microsoft.com/enterprisemobility/2017/08/09/automated-expiration-for-office-365-groups-using-azure-ad-is-now-in-public-preview/)

Brownbag session: https://aka.ms/AA8lxqs
