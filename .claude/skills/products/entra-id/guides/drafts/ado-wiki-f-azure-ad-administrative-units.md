---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Roles and Administrators/Azure AD Administrative Units"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Roles%20and%20Administrators%2FAzure%20AD%20Administrative%20Units"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- cw.AAD-Administrative-Units
- cw.comm-secaccmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Account-Management](/Tags/AAD%2DAccount%2DManagement) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-Administrative-Units](/Tags/AAD%2DAdministrative%2DUnits)                                                  
 


[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

___

# Overview

Administrative units can be useful in organizations with independent divisions. Consider the example of a large university that is made up of many autonomous schools (School of Business, School of Engineering, and so on) that each has their own IT administrators who control access, manage users, and set policies for their school. A central administrator could create an administrative unit for the School of Business and populate it with only the business school students and staff. Then the central administrator can add the Business school IT staff to a scoped role that grants administrative permissions over only Azure AD users in the business school administrative unit.
Before Administrative Units (AUs), all Azure AD admin roles had to be assigned tenant-wide. That means someone in the Helpdesk Administrator role, for example, could reset passwords for any (non-admin) user in the tenant. 
 
AUs allow you to grant admin permissions, but restricted to a department, region, or other segment of your organization that you define. For example, granting regional support specialists the Password (i.e. Helpdesk) Administrator role restricted to managing just the users in the region they support. We call this departmentalizing admin roles.

___

# License requirement

Creating and managing AUs themselves is available at no additional charge. Using AUs to scope directory role assignments requires Azure Active Directory Premium 1 licenses.

___

# PowerShell Requirement

Install Azure AD PowerShell (Preview version) to use administrative units in Azure AD PowerShell.
The Microsoft Graph API PowerShell can be used but is not fully functional for all areas of Admin unit.

___

# Administrative Units in the portal

![AdminUnitsBlade](/.attachments/AAD-Account-Management/288769/AdminUnitsBlade.png)

___

# Limitations

- Not available in Identity Governance at this time.
- Administrative Unit-scoped User Account Administrators cannot create or delete users.
- Administrative Units can't be nested.
- By design, scoped credential management role members can't manage credentials of users in Groups assigned to the Administrative Unit, unless that group member is directly assigned under the **Users** blade of that same Administrative unit.
- Azure AD resources can not be a member of more than 30 administrative units.

___

# Azure AD Roles

Only a Global Administrator or Privileged Role Administrator can create or add members to an administrative unit for non-Restricted Admin units.

This table covers non-restricted and restricted AUs.

| Role name / category | Scope | Can manage Restricted AU resources? | Actions allowed |
|-----|-----|-----|-----|
| Global Admin | Directory | No | Full CRUD rights on Restricted AUs |
| Privileged Role Admin | Directory | No | Full CRUD rights on Restricted AUs |
| Built-in roles | Directory | No |  |
| Built-in roles | Restricted AU | Yes | Actions as defined for the built-in role |
| Custom roles | Directory | No |  |
| Custom roles | Restricted AU | Yes | Actions as defined for the custom-role |

___

# Known Issues

## Issue: Cannot assign users due to lack of permissions

Only a Global Administrator or Privileged Role Administrator can create or add members to an administrative unit. If using Restricted AUs, see the table in the [Azure AD Roles](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=183935&anchor=azure-ad-roles) section above.

___

## Issue: Fails because the resource is already a member of the administrative unit

The assignment via PowerShell / Graph can fail if the user is already a member of the targeted Administrative unit. In the UI, an existing member would always be greyed out and not available for selection to be assigned to an existing administrative unit.

___

## Issue: Bulk add of users failed because CSV is not in right format.

The downloaded template should be handled carefully. The first two rows are already populated should not be deleted. The only modification needed in the downloaded template is the addition of members - one UPN on each line.

___

## Issue: User with the relevant role at AU level cannot manage either passwords or authentication methods.

Check if the user belongs to a AAD group where Assignable to role is True. If so, This is by design. The reason for this is because those users are part of groups that are marked as AssignableToRoles. These are special highly privileged groups that have extra protection on them. Members of these groups cannot be managed by anyone other then Global Admin and Privileged Role Admin. This could also apply to additional operations such as delete user. https://docs.microsoft.com/en-us/azure/active-directory/roles/groups-concept#why-we-enforce-creation-of-a-special-group-for-assigning-it-to-a-role

___

# Public Documentation

- **Add an Administrative unit** [in Azure Portal](https://docs.microsoft.com/en-us/azure/active-directory/users-groups-roles/roles-admin-units-manage#azure-portal) and **Remove an Administrative unit** [in the Azure Portal](https://docs.microsoft.com/en-us/azure/active-directory/users-groups-roles/roles-admin-units-manage#azure-portal-1).

- Administrative units Public Preview V1 Announcement (December 11, 2014). See [Wrapping up the year with a boat load of Azure AD news\!](https://techcommunity.microsoft.com/t5/Azure-Active-Directory-Identity/Wrapping-up-the-year-with-a-boat-load-of-Azure-AD-news/ba-p/243851)

- Administrative units Public Preview V2 Announcement (2/13/2017). See [Administrative units management in Azure Active Directory (public preview)](https://docs.microsoft.com/en-us/azure/active-directory/users-groups-roles/directory-administrative-units)

___

# What is currently supported?

Global administrators or Privileged Role Administrators can use the Azure AD portal to create AUs, add users as members of AUs, and then assign IT staff to AU-scoped administrator roles. The AU-scoped admins can then use the Office 365 portal for basic management of users in their AUs.

Additionally, groups can be added as members of AU, AU scoped groups administrator can manage them using PowerShell, Microsoft Graph API and Azure AD portal.

Custom Azure AD Roles are now supported.

The below table describes current support for AU scenarios.

|    | [**MS Graph API**](https://developer.microsoft.com/en-us/graph/docs/api-reference/beta/resources/administrativeunit)  [**PowerShell**](https://docs.microsoft.com/en-us/powershell/module/Azuread/?view=azureadps-2.0-preview) | **Azure AD Portal** | **M365 Admin Center** |
| --- | --- | --- | --- |
| **AU Management** |
| Creating and deleting AUs  | Supported  | Supported  | No current plan to support  |
| Adding and removing AU members individually  | Supported  | Supported  | No current plan to support  |
| Bulk adding and removing AU members using .csv file  | Not supported  | Supported  | No current plan to support  |
| Assigning AU-scoped administrators  | Supported  | Supported  | No current plan to support  |
| Adding and removing AU members dynamically based on attributes  | Private Preview  | Private Preview | No current plan to support  |
| **User management** | 
| AU-scoped management of user properties, passwords, licenses  | Supported  | Supported | Supported  |
| AU-scoped blocking and unblocking of user sign-ins  | Supported  | Supported  | Supported  |
| AU-scoped management of user MFA credentials  | Supported | Supported | Future improvement  |
| AU-scoped viewing of user sign-in reports  | Future improvement | Future improvement | Future improvement  |
| AU-scoped creating and deleting users  | Future improvement  | Future improvement  | Future improvement  |
| **Group management** | 
| AU-scoped management of group properties and members  | Supported  | Supported | Future improvement  |
| AU-scoped management of group licensing  | Supported | Supported | Future improvement  |
| AU-scoped creating and deleting groups  | Future improvement  | Future improvement  | Future improvement  |
| **Additional areas** | 
| AU-scoped device management  | Private Preview  | Private Preview | Future improvement  |
| AU-scoped application management  | Future improvement  | Future improvement  | Future improvement  |

___

# Create Administrative Units

## Azure AD Portal

1.	Go to Active Directory in the portal and click on **Administrative Units** in the left panel

![PortalOverview](/.attachments/AAD-Account-Management/288769/PortalOverview.png)

2.	Click on **Add** and a pane will slide open on the right where the name, and an optional description of the AU can be entered.

![AddNewAU](/.attachments/AAD-Account-Management/288769/AddNewAU.png)

3.	Click on **Add** to finalize the create step.

___

## PowerShell

Install Microsoft Graph PowerShell to perform the actions below:

```powershell
Connect-MgGraph -Scopes AdministrativeUnit.ReadWrite.All
New-MgDirectoryAdministrativeUnit -Description West Coast region -DisplayName West Coast
```

## Microsoft Graph API

- **Create an Administrative Unit**

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/administrativeUnits`

**Request body**:

```json
{
    "displayName": "North America Operations",
    "description": "North America Operations administration"
}
```

- **Delete an Administrative Unit**

**Action**: `DELETE`

**URI**: `https://graph.microsoft.com/beta/administrativeUnits/{id}`

___

# Assign Existing Users to an Admin Unit

## Portal - Assign Existing Users

- **Users blade**:

    1. Go to Azure AD in the portal and click on **Users**.
    2. Select the user to be assigned to an AU.
    3. Click on **Administrative units** in the left panel.
    4. Assign the user to one or more administrative units by clicking on **Assign to administrative unit** and selecting the AUs to which the user needs to be assigned.

- **Administrative Units blade**:

    1. Go to Azure AD in the portal and click on **Administrative units** in the left pane.
    2. Select the administrative unit for which the users need to be assigned.
    3. Click on **Users** on the left pane and then select **Add member**.
    4. Finally, select one or more users to be assigned to the administrative unit from the right pane.

- **Bulk Assignments**

    1. Go to Azure AD in the portal and click on **Administrative units**.
    2. Select the administrative unit in which users need to be added.
    3. Click on **Users** > **Add members from .csv file**.
    4. Download the CSV template and edit the file.
    **NOTE**: The format is simple. It only needs a single UPN to be added in each line.
    5. Once the file is ready, save it at an appropriate location and then upload it in step 3 as highlighted in the snapshot.

![BulkAddMembersToAU](/.attachments/AAD-Account-Management/288769/BulkAddMembersToAU.png)

___

## PowerShell - Manage Existing Users

```powershell
Connect-MgGraph -Scopes AdministrativeUnit.ReadWrite.All
```

### PowerShell - Add an Existing user to an AU

```powershell
$AUObj = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'Top Coffee (Dallas)'"
$UserObj = Get-MgUser -Filter "UserPrincipalName eq 'bill@contoso.onmicrosoft.com'"
$params = @{
	"@odata.id" = "https://graph.microsoft.com/v1.0/users/$($UserObj.id)"
}

New-MgDirectoryAdministrativeUnitMemberByRef -AdministrativeUnitId $AUObj.id -BodyParameter $params
```
___

### PowerShell - Remove a user from an AU

```powershell
$AUObj = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'Top Coffee (Dallas)'"
$UserObj = Get-MgUser -Filter "UserPrincipalName eq 'bill@contoso.onmicrosoft.com'"
Remove-MgDirectoryAdministrativeUnitMemberDirectoryObjectByRef -AdministrativeUnitId $AUObj.Id -DirectoryObjectId $UserObj.Id
```
___

## Microsoft Graph API - Manage Existing Users

### API - List AUs that a user is assigned to

**Action**: `GET`

**URI**: `https://graph.microsoft.com/v1.0/users/{id-or-upn}/memberOf/microsoft.graph.administrativeUnit`

___

### API - Add an Existing user to an AU

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/administrativeUnits/{AU_id}/members/$ref`

**Request body**:

```json
{
  "@odata.id":"https://graph.microsoft.com/v1.0/users/{id-or-upn}"
}
```

___

### API - Remove a user from an AU

**Action**: `DELETE`

**URI**: `https://graph.microsoft.com/beta/directory/administrativeUnits/{admin-unit-id}/members/{id-or-upn}/$ref`

___

# Create a New User Scoped to an Admin Unit

This feature is currently in Private Preview.

Prior to this release, Global administrators could only Assign existing users to an administrative unit using the **Add** and **Remove** buttons on the **Users** blade of an administrative unit.

Administrative Units (AU) now have a **New user** and **Delete** button at the top of the **Users** blade. This allows Global administrators, tenant-wide Group administrators or User Administrator, and scoped User Administrators on an AU to create new users that are automatically added to the AU at the time of creation. The **Delete** option also allows these admin roles to delete the user account.

___

## Portal - Create a user scoped to an AU

1. A scoped User administrator of an AU signs into the [Azure Active Directory](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview) portal and navigates to the **Administrative units** blade.
2. They select the Admin unit where scoped membership in the *User administrators* role is assigned.
3. Click the **New user** button to launch the *New user* wizard.
4. Create a user as usual.
5. Click **Create**.

___

## PowerShell - Manage New Users

### PowerShell - Create a user scoped to an AU

Currently there is no native cmdlet for creating a user in an AU. However the **Invoke-MgGraphRequest** command can be used until cmdlets are available.

1. Install the [Microsoft Graph PowerShell module](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation?view=graph-powershell-1.0)

```powershell
#Install Microsoft Graph PowerShell module 
Install-Module Microsoft.Graph -Scope CurrentUser 
```

2. Open PowerShell and connect to Microsoft Graph using your Global Administrator or User Administrator account (scoped to the AU) that a user is to be created, deleted, or restored in.

**NOTE**: Admin Consent is required to enable PowerShell to access the tenant with the requested scope.  If Microsoft Graph PowerShell has not been used before and consent is needed, a Privileged Role Administrator or Global Administrator will first need to perform this step to grant consent for the tenant before a scoped User Administrator can sign-in. 

```powershell
#Connect to Microsoft Graph using your Global Administrator or User Administrator account (scoped to the Administrative Unit) 
Connect-MgGraph -Scopes "User.ReadWrite.All","AdministrativeUnit.ReadWrite.All"
```

If at any point the user needs to disconnect, the command is:

```powershell
#Disconnect from Microsoft Graph PowerShell
Disconnect-Graph
```

In the example below, replace `{ADMIN_UNIT_ID}` in the URL field with the object ID of the Administrative Unit (available on the Administrative Unit's properties page).  In the body of the request, be sure to replace the `displayName`, `mailNickname`, and `userPrincipalName`, and fill in the `password` field with a secure password in clear text.

The example below will create a user named "John Smith" in the AU.

```powershell
# Create the user in the administrative unit 
$user = Invoke-MgGraphRequest -Method POST -Uri https://graph.microsoft.com/beta/administrativeUnits/{ADMIN_UNIT_ID}/members/ -Body '{ 
>>  	   "@odata.type": "#Microsoft.Graph.User", 
>>  	   "accountEnabled": true, 
>>  	   "displayName": "John Smith", 
>>  	   "mailNickname": "JohnS", 
>> 	   "userPrincipalName": "JohnS@contoso.com", 
>>	   "passwordProfile": { 
>>       	  "forceChangePasswordNextSignIn": true, 
>>	  	  "password": "" 
>>	     	} 
>>	 }' 
```
___

### PowerShell - Delete a user scoped to an AU

Use the existing **Remove-MgUser** cmdlet to delete a user scoped to the AU.

Populate the `$user` object with the user created in the previous step.

```powershell
#List the Id and Description of all administrative units
Get-MgAdministrativeUnit

#Filter on the DisplayName of the user to get their ID.
Get-MgUser -ConsistencyLevel eventual -Count userCount -Filter "startsWith(DisplayName, 'Andy')" -OrderBy UserPrincipalName

#Populate the `$user` object with the user that is to be deleted.
$user = Get-MgUser -UserId a3fabfea-b33c-431d-bab2-2c0ccf87d357

#List the ID for all users assigned to the administrative unit and verify the user is currently a member.
Get-MgAdministrativeUnitMember -AdministrativeUnitId 9212e60f-ff09-400c-ab5f-830c9ed0b5d9

#Delete the user 
Remove-MgUser -UserId $user.Id
```
___

## Microsoft Graph API - Create a Scoped User

### API - Create a user scoped to an AU

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/administrativeUnits/{id}/members/`

**Request body**:

```json
{ 
  "@odata.type": "#Microsoft.Graph.User", 
  "accountEnabled": true, 
  "displayName": "John Smith", 
  "mailNickname": "JohnS", 
  "userPrincipalName": "JohnS@example.com", 
  "passwordProfile": { 
    "forceChangePasswordNextSignIn": true, 
    "password": "{a clear text string}" 
  } 
} 
```
___

### API - Delete a user scoped to an AU

**Action**: `DELETE`

**URI**: `https://graph.microsoft.com/beta/users/{id}`

___

# Assign Groups to Administrative Units

When you add a group to the administrative unit, that does not result in all the group's members being added to it. Users must be directly assigned to the administrative unit. This functionality is meant to delegate the permissions over the group object only.

___

## Azure AD Portal (Groups)

Groups can only be assigned individually to an administrative unit. There's no option to bulk assign groups to an administrative unit.

**NOTE**: During the Dynamic membership Private Preview for user, the Groups blade is not present on AUs. For more information, see the [Azure AD Dynamic Assigned Admin Units](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageID=512493) CSS Wiki page.

___

### From a Selected Group

1. Click on **Groups** blade in Azure AD and click on a group that needs to be assigned to the administrative unit.
2. On the left side, click on **Administrative units** to list out the administrative units that the select group is already assigned to.
3. Click the **Assign to administrative unit** option at the top, and choose one or more administrative units from the object picker.

![AddGroupToAU](/.attachments/AAD-Account-Management/288769/AddGroupToAU.png)

___

### From Groups Blade on an Administrative Unit

1. Navigate to **Azure AD** > **Administrative Units**.
2. Select the Admin unit to be managed.
3. Open the **Groups** blade. Any groups already assigned to the administrative unit will be displayed on the right side.
4. Click **Add** from the top. This opens the object picker which lists all groups available in the tenant.
5. Select one or more groups to be assigned to the administrative unit. 

![AddGroupsPicker](/.attachments/AAD-Account-Management/288769/AddGroupsPicker.png)

___

## PowerShell (Assign/Remove Group)

### Assign a group to an AU

```powershell
$AUObj = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'Top Coffee (Dallas)'"
$GroupObj = Get-MgGroup -Filter "displayname eq 'AAD-Group'"
$params = @{
	"@odata.id" = "https://graph.microsoft.com/v1.0/groups/$($GroupObj.id)"
}

New-MgDirectoryAdministrativeUnitMemberByRef -AdministrativeUnitId $AUObj.id -BodyParameter $params
```

___

### Remove a group from an AU

```powershell
$AUObj = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'Top Coffee (Dallas)'"
$GroupObj = Get-MgGroup -Filter "displayname eq 'AAD-Group'"
Remove-MgDirectoryAdministrativeUnitMemberDirectoryObjectByRef -AdministrativeUnitId $AUObj.Id -DirectoryObjectId $GroupObj.Id
```

___

## Microsoft Graph API (Assign/Remove Group)

### List AUs that the group is assigned to

**Action**: `GET`

**URI**: `https://graph.microsoft.com/v1.0/groups/{id}/memberOf/microsoft.graph.administrativeUnit`

___

### Assign a group to an AU

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/administrativeUnits/{AU_id}/members/$ref`

**Request body**:

```json
{
  "@odata.id":"https://graph.microsoft.com/v1.0/groups/{id}"
}
```

___

### Remove a group from an AU

**Action**: `DELETE`

**URI**: `https://graph.microsoft.com/beta/directory/administrativeUnits/{admin-unit-id}/members/{group_id}/$ref`

___

### Delete and Restore Scoped Users

___

### Azure AD Portal (Delete/Restore Users)

___

# Scoped Group Administration

## Create a Scoped Group

Prior to this release, Global administrators could only Assign groups to, or Remove group assignments from an administrative unit using the **Add** and **Remove** buttons on the **Groups** blade of an administrative unit.

Administrative Units (AU) now have a **New group** and **Delete** button at the top of the **Groups** blade. This allows Global administrators, tenant-wide Group administrators, and users with scoped Group administrator role assignments on an AU to create Security and Microsoft 365 Groups that are automatically added to the AU at the time of creation.

Users with scoped *Group administrator* role assignments on an AU will not have the ability to create and delete groups in other AUs where they don't have scoped role membership.  In addition, if scoped Group administrators delete an Microsoft 365 group from their AU it is soft-deleted from the tenant, and Security groups are hard deleted. Scoped Group administrators can restore soft-deleted Microsoft 365 groups for up to 30 days, so long at the group does not belong to multiple AUs. When the Microsoft 365 group is restored, its scoped membership in the Administrative unit will also be restored.

___

### Azure AD Portal - Scoped Group Creation

1. A scoped Group administrator of an AU signs into the [Azure Active Directory](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview) portal and navigates to the **Administrative units** blade.
2. They select the Admin unit where scoped membership in the *Group administrators* role is assigned.
3. Click the **New group** button to launch the *New group* wizard.

![newGroupButton](/.attachments/AAD-Account-Management/183935/newGroupButton.jpg)

4. Create a group with assigned membership as usual.

- From the **Group type** drop-down select **Security** or **Microsoft 365**
- Provide a name for the group under **Group name**
- *(optional)* Provide a **Description** for the group.
- **Membership type** must be set to **Assigned**.

5. Click **Create**.

**Note**: Group creation will fail with the POST 403 error below if **Membership type** is set to *Dynamic User* and a dynamic query is created.

```
Failed to create group
Failed to create group NewScopedGroup. Insufficient privileges to complete the operation.
```

___

## Delete and Restore Scoped Groups

### Azure AD Portal (Delete/Restore Group)

Selecting one or more groups assigned to an administrative unit will activate the **Delete** button in the ribbon at the top of the **Groups** blade if the user has scoped membership in the *Group administrators* role of that AU. It will not activate in AUs where the user is not a scoped Group administrator. The scoped Group administrator can also delete groups assigned to the AU from the **All groups** blade.

1.	A scoped Group administrator of an AU signs into the [Azure Active Directory](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview) portal and navigates to the **Administrative units** blade.
2.	They select the Admin unit where scoped membership in the Group administrators role is assigned and click on the **Groups** blade.
3.	Selecting one or more groups assigned to an administrative unit activates the **Delete** button in the ribbon at the top.

The button will not activate if the user does not have scoped membership in the Group administrators role on that AU. Additionally, the scoped Group administrator can also delete groups assigned to the AU from the tenants **All groups** blade

![GroupDeletion](/.attachments/AAD-Account-Management/183935/GroupDeletion.jpg)

**Note**: Microsoft 365 groups deleted from an AU are soft-deleted from the tenant, while Security groups are hard deleted. Scoped Group administrators have permission to Restore soft-deleted Microsoft 365 groups for up to 30 days, so long at the group does not belong to multiple AUs. When a soft-deleted M365 group is restored the AU assignment is restored with it.

___

# Assign Devices to Administrative Units

## Azure AD Portal

**NOTE**: This blade is not present on AUs that have Dynamic membership. For more information, see the [Azure AD Dynamic Assigned Admin Units](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageID=512493) CSS Wiki page.

- **Devices blade**

1. Go to Azure AD in the portal and click on **Devices**.
2. Select the device to be assigned to the AU.
3. Click on **Assign to Administrative unit** in the left panel.
4. Assign the device to one or more administrative units by selecting one ore more AUs to which the device needs to be assigned.

- **Administrative Units blade**

1. Go to Azure AD in the portal and click on **Administrative units** in the left pane.
2. Select the administrative unit for which the device needs to be assigned.
3. Click on **Devices** on the left pane and then select **Add device**.
4. Finally, select one or more devices to be assigned to the administrative unit from the object picker.

___

## PowerShell - Manage Device Assignments to Admin Unit

### PowerShell - Add a device to an AU

```powershell
$AUObj = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'Top Coffee (Dallas)'"
$DeviceObj = Get-MgDevice -Filter "displayname eq 'testcomputer'"
$params = @{
	"@odata.id" = "https://graph.microsoft.com/v1.0/devices/$($DeviceObj.id)"
}

New-MgDirectoryAdministrativeUnitMemberByRef -AdministrativeUnitId $AUObj.id -BodyParameter $params
```

___

### PowerShell - Remove a device from an AU

```powershell
$AUObj = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'Top Coffee (Dallas)'"
$DeviceObj = Get-MgDevice -Filter "displayname eq 'testcomputer'"
Remove-MgDirectoryAdministrativeUnitMemberDirectoryObjectByRef -AdministrativeUnitId $AUObj -MemberId $DeviceObj.Id
```

___

## Microsoft Graph API - Manage Device Assignments to Admin Unit

### API - List AUs that the device is assigned to

**Action**: `GET`

**URI**: `https://graph.microsoft.com/beta/devices/{device-objectid}/memberOf/microsoft.graph.administrativeUnit`

___

### API - Assign a device to an AU

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/administrativeUnits/{admin-unit-id}/members/$ref`

**Request body**:

```json
{
  "@odata.id":"https://graph.microsoft.com/v1.0/devices/{device-objectid}"
}
```

___

### API - Remove a device from an AU

**Action**: `DELETE`

**URI**: `https://graph.microsoft.com/beta/directory/administrativeUnits/{admin-unit-id}/members/{device-objectid}/$ref`

___

# Roles Available in Administrative Units

<TABLE  class=MsoTable15Grid4Accent5  border=1  cellspacing=0  cellpadding=0 style="border-collapse:collapse;border:none">
 <TR>
  <TD  width=198  valign=top style="width:148.25pt;border:solid #5B9BD5 1.0pt;border-right:none;background:#5B9BD5;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal"><B><SPAN style="color:white">Role</SPAN></B></P>
  </TD>
  <TD  width=426  valign=top style="width:319.25pt;border:solid #5B9BD5 1.0pt;border-left:none;background:#5B9BD5;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal"><B><SPAN style="color:white">Description</SPAN></B></P>
  </TD>
 </TR>
 <TR>
  <TD  width=198  valign=top style="width:148.25pt;border:solid #9CC2E5 1.0pt;border-top:none;background:#DEEAF6;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal"><B><SPAN style="color:black">Authentication
  Administrator</SPAN></B></P>
  </TD>
  <TD  width=426  valign=top style="width:319.25pt;border-top:none;border-left:
  none;border-bottom:solid #9CC2E5 1.0pt;border-right:solid #9CC2E5 1.0pt;background:#DEEAF6;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal"><SPAN style="color:black">Has
  access to view, set, and reset authentication method information for any
  non-admin user in the assigned administrative unit only.</SPAN></P>
  </TD>
 </TR>
 <TR>
  <TD  width=198  valign=top style="width:148.25pt;border:solid #9CC2E5 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal"><B>Groups Administrator</B></P>
  </TD>
  <TD  width=426  valign=top style="width:319.25pt;border-top:none;border-left:
  none;border-bottom:solid #9CC2E5 1.0pt;border-right:solid #9CC2E5 1.0pt;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal">Can manage all aspects of groups and groups settings like naming and
  expiration policies in the assigned administrative unit only.</P>
  </TD>
 </TR>
 <TR>
  <TD  width=198  valign=top style="width:148.25pt;border:solid #9CC2E5 1.0pt;border-top:none;background:#DEEAF6;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal"><B><SPAN style="color:black">Helpdesk
  Administrator</SPAN></B></P>
  </TD>
  <TD  width=426  valign=top style="width:319.25pt;border-top:none;border-left:
  none;border-bottom:solid #9CC2E5 1.0pt;border-right:solid #9CC2E5 1.0pt;background:#DEEAF6;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal"><SPAN style="color:black">Can
  reset passwords for non-administrators and Helpdesk administrators in the
  assigned administrative unit only.</SPAN></P>
  </TD>
 </TR>
 <TR>
  <TD  width=198  valign=top style="width:148.25pt;border:solid #9CC2E5 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal"><B>License Administrator</B></P>
  </TD>
  <TD  width=426  valign=top style="width:319.25pt;border-top:none;border-left:
  none;border-bottom:solid #9CC2E5 1.0pt;border-right:solid #9CC2E5 1.0pt;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal">Can assign, remove and update license assignments within the administrative
  unit only.</P>
  </TD>
 </TR>
 <TR>
  <TD  width=198  valign=top style="width:148.25pt;border:solid #9CC2E5 1.0pt;border-top:none;background:#DEEAF6;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal"><B><SPAN style="color:black">Password
  Administrator</SPAN></B></P>
  </TD>
  <TD  width=426  valign=top style="width:319.25pt;border-top:none;border-left:
  none;border-bottom:solid #9CC2E5 1.0pt;border-right:solid #9CC2E5 1.0pt;background:#DEEAF6;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal"><SPAN style="color:black">Can
  reset passwords for non-administrators and Password Administrators within the
  assigned administrative unit only.</SPAN></P>
  </TD>
 </TR>
 <TR>
  <TD  width=198  valign=top style="width:148.25pt;border:solid #9CC2E5 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal"><B>User Administrator</B></P>
  </TD>
  <TD  width=426  valign=top style="width:319.25pt;border-top:none;border-left:
  none;border-bottom:solid #9CC2E5 1.0pt;border-right:solid #9CC2E5 1.0pt;padding:0in 5.4pt 0in 5.4pt">
  <P  class=MsoNormal style="margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal">Can manage all aspects of users and groups, including resetting
  passwords for limited admins within the assigned administrative unit only.</P>
  </TD>
 </TR>
</TABLE>

___

# Assigning Roles Scoped to Administrative Units

## Azure AD Portal

1. Go to **Azure AD** > **Administrative units** in the portal.
2. Select the administrative unit over which the user's role is to be assigned.
3. From the left pane, click on **Roles and administrators** to list all the available roles.

![AURolesAndAdminsBlade](/.attachments/AAD-Account-Management/288769/AURolesAndAdminsBlade.png)

4. Select the role to be assigned, and then click on **Add assignments**. Select one or more users from the object picker that should be assigned to the role.

![AssignRoleMemberInAU](/.attachments/AAD-Account-Management/288769/AssignRoleMemberInAU.png)

___

## PowerShell

This example creates a scoped role assignment by making the user a member of the Password Administrator role on an administrative unit called "Test Admin Unit".

```powershell
Connect-MgGraph -Scopes User.Read.All,RoleManagement.ReadWrite.Directory
$User = Get-MgUser -UserId "Example.User@domain.com"  #User to be added as AU admin
$Role = Get-MgRoleManagementDirectoryRoleDefinition | Where-Object -Property DisplayName -EQ -Value "Password Administrator" #Role to add
$AUObj = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'Top Coffee (Dallas)'"
$params = @{
	roleId = $Role.id
	roleMemberInfo = @{
		id = $User.id
	}
}

New-MgDirectoryAdministrativeUnitScopedRoleMember -AdministrativeUnitId $AUObj.id -BodyParameter $params
```

___

# Role Assignment Scopes

Membership in Azure AD Roles can be **Scoped** to three different levels.

* Directory
* Administrative Unit
* Resources (ie: Application Registrations)

| Scopes (UI) | Scopes (PowerShell) | Admin Portal UI |
| ------------------------ | ------------------------ | ------------------------ |
| Directory-Wide | @('/') | Role members are added under **Azure Active Directory** \\ **Roles and administrators** \\ **\<Role Name\>** |
| Administrative Unit      | @('/' + $AdminUnit.ObjectId    | Role members are added under **Azure Active Directory** \\ **Administrative units** \\ **\<Admin Unit Name\>** \\ **Roles and administrators** \\ **\<Role Name\>**  |
| Application Registration | @('/' + $Application.ObjectId) | Role members are added under **Azure Active Directory** \\ **App registrations (Preview)** \\ **\<App Name\>** \\ **Roles and administrators** \\ **\<Role Name\>**. |

___

# List Users Assigned to an Administrative Unit

## Azure AD portal

- **From an Admin Unit**

1. Go to **Azure AD** > **Administrative units** in the portal.
2. Select the administrative unit for which you want to list the users. The **Users** blade is listed by default.

![AllUsersFilteredByAUMembers](/.attachments/AAD-Account-Management/288769/AllUsersFilteredByAUMembers.png)

- **From All Users**

1. Go to **Azure AD** > **Users** in the portal.
2. On the **All Users** blade click **Add filters** and select **Administrative Unit** and **Apply**.
3. Select the Administrative Unit of interest and all assigned users will be listed. 

![AllUsersAUFilter](/.attachments/AAD-Account-Management/288769/AllUsersAUFilter.png)

- **From a Specific User**

1. Go to **Azure AD** > **User** in the portal.
2. On the **All User** blade and select the user of interest.
3. Select the **Administrative Units** blade to see the admin units that the user is assigned to.

___

## PowerShell

This command will retrieve an array of all objects that are assigned as members of the admin unit into an object called `$AUObj`.

```powershell
$AUObj = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'Top Coffee (Dallas)'"
Get-MgDirectoryAdministrativeUnitMember -AdministrativeUnitId $AUObj.Id
```

This command lists all users that are members of the administrative unit:

```powershell
foreach ($member in (Get-MgDirectoryAdministrativeUnitMember -AdministrativeUnitId $AUObj.Id)) {
    if($member.'@odata.type' -eq "User")
    {
        Get-MgUser -UserId $member.Id
    }
}
```

___

## Microsoft Graph API

This call lists AUs that the user is assigned to.

**Action**: `GET`

**URI**: `https://graph.microsoft.com/v1.0/users/{id-or-upn}/memberOf/microsoft.graph.administrativeUnit`

___

## ASC - Users Assigned to AU

See the [Members tab](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=288769&anchor=members-tab) section of this document.

___

# List Groups Assigned to an Administrative Unit

## Azure AD portal

- **From an Admin Unit**

1. Go to **Azure AD** > **Administrative units** in the portal.
2. Select the administrative unit for which you want to list the group. 
3. Select **Groups** and a list of groups that are members of the administrative unit will appear on the right.

![ListGroupsInAU](/.attachments/AAD-Account-Management/288769/ListGroupsInAU.png)

- **From All Groups**

1. Go to **Azure AD** > **Groups** in the portal.
2. On the **All groups** blade click **Add filters** and select **Administrative Unit** and **Apply**.
3. Select the Administrative Unit of interest and all assigned **Groups** will be listed. 

- **From a Specific Group**

1. Go to **Azure AD** > **Group** in the portal.
2. On the **All Groups** blade and select the group of interest.
3. Select the **Administrative Units** blade to see the admin units that the group is assigned to.

___

## PowerShell

This command will retrieve an array of all objects that are assigned as members of the admin unit into an object called `$AUObj`.

```powershell
$AUObj = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'Top Coffee (Dallas)'"
Get-MgDirectoryAdministrativeUnitMember -AdministrativeUnitId $AUObj.Id
```

This command lists all groups that are members of the administrative unit:

```powershell
foreach ($member in (Get-MgDirectoryAdministrativeUnitMember -AdministrativeUnitId $AUObj.Id)) {
    if($member.'@odata.type' -eq "Group")
    {
         Get-MgGroup -GroupId $member.Id
    }
}
```

___

## Microsoft Graph API

This call lists AUs that the group is assigned to.

**Action**: `GET`

**URI**: `https://graph.microsoft.com/v1.0/groups/{id}/memberOf/microsoft.graph.administrativeUnit`

___

## ASC - Groups Assigned to AU

See the [Members-tab](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=288769&anchor=members-tab) section of this document.

___

# List Devices Assigned to an Administrative Unit

## Azure AD portal

- **From an Admin Unit**

1. Go to **Azure AD** > **Administrative units** in the portal.
2. Select the administrative unit for which you want to list the devices. 
3. Select the **Devices** blade and a list of devices that are members of the administrative unit will appear on the right.

- **From All Devices**

1. Go to **Azure AD** > **Devices** in the portal.
2. On the **All devices** blade click **Add filters** and select **Administrative Unit** and **Apply**.
3. Select the Administrative Unit of interest and all assigned **Devices** will be listed. 

- **From a Specific Device**

1. Go to **Azure AD** > **Devices** in the portal.
2. On the **All devices** blade and select the device of interest.
3. Select the **Administrative Units** blade to see the admin units that the device is assigned to.

___

## PowerShell

This command will retrieve an array of all objects that are assigned as members of the admin unit into an object called `$AUObj`.

```powershell
$AUObj = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'Top Coffee (Dallas)'"
Get-MgDirectoryAdministrativeUnitMember -AdministrativeUnitId $AUObj.Id
```

This command lists all devices that are members of the administrative unit:

```powershell
foreach ($member in (Get-MgDirectoryAdministrativeUnitMember -AdministrativeUnitId $AUObj.Id)) {
    if($member.'@odata.type' -eq "Device")
    {
         Get-MgDevice -ObjectId $member.Id
    }
}
```

___

## Microsoft Graph API

This call lists AUs that the device is assigned to.

**Action**: `GET`

**URI**: `https://graph.microsoft.com/beta/devices/{id}/memberOf/microsoft.graph.administrativeUnit`

___

## ASC

See the [Members tab](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=288769&anchor=members-tab) section of this document.

___

# Verify Scoped Role Assignments for a user

## Azure AD portal

How to check if a user has a role assignment that is scoped to an administrative unit or a resource, like a group or device.

1. Go to the ***Users** blade and select the user.
2. On the left pane, select **Assigned roles**.
3. The details in the right pane, show the **Resource Name** and **Resource Type**.

**NOTE**: An administrative Unit role assignment will have a resource type of **Administrative Unit**.

![ViewUsersAUScopedRoles](/.attachments/AAD-Account-Management/288769/ViewUsersAUScopedRoles.png)

___

## PowerShell

```powershell
Connect-MgGraph -Scopes RoleManagement.Read.Directory
$AUObj = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'Top Coffee (Dallas)'"
Get-MgDirectoryAdministrativeUnitScopedRoleMember -AdministrativeUnitId $AUObj.ObjectId | fl *
```

This will list all the role assignments on a particular Administrative Unit

___

## Microsoft Graph API

The graph request below will list all the administrators scoped on the administrative unit represented by their id.

_Http request_

```
GET /administrativeUnits/{id}/scopedRoleMembers
```

_Request body_

```
{}
```

___

## ASC - Scoped administrators

See the [Scoped Administrators tab](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=288769&anchor=scoped-administrators-tab) section of this document.

___

# Frequently Asked Questions

**Why are Administrative Units necessary? Couldnt we have used Security Groups as the way to define a scope?**
 
Security Groups have an existing purpose and authorization model. A User Administrator, for example, can manage membership of all Security Groups in the directory. That is because is it reasonable that a User Administrator can manage access to applications like Salesforce. A User Administrator should not have the ability to manage the delegation model itself, which would be the result if Security Groups were extended to support resource grouping scenarios. 
 
Administrative Units, like Organizational Units in Windows Server Active Directory, are intended to provide a way to scope administration of a wide range of directory objects. Security Groups themselves can be members of resource scopes. Using Security Groups to define the set of Security Groups an administrator can manage would get very confusing. 
 
**What does it mean to add a Group to an Administrative Unit?**

Adding a group to an AU brings the group itself into the management scope of any AU-scoped User Administrators. User Administrators for the AU can manage the name and membership of the group itself. It does not grant the User Administrator for the AU any permission to manage the users of the group (e.g. reset their passwords). To grant the User Administrator the ability to manage users, the users have to be direct members of the AU. 
 
**Can a resource (user, group, etc.) be a member of more than one Administrative Unit?**

Yes, a resource can be a member of more than one AU. The resource can be managed by all tenant and AU-scoped admins who have permissions over the resource. 
 
**Are nested Administrative Units supported?**

Nesting AUs is not supported. 
 
**Are Administrative Units supported in PowerShell and Graph API?** 

Yes. Support for Administrative Units in PowerShell is documented [here](https://docs.microsoft.com/en-us/powershell/module/Azuread/?view=azureadps-2.0-preview) and [here](https://docs.microsoft.com/en-us/powershell/azure/active-directory/working-with-administrative-units?view=azureadps-2.0-preview), and support in Microsoft Graph is documented [here](https://developer.microsoft.com/en-us/graph/docs/api-reference/beta/resources/administrativeunit). 

___

# Troubleshooting

## Audit Logs

Administrators can navigate to the **Audit logs** blade and filter using a **Category** of **AdministrativeUnit** to see events for these activities.

| **Activity** | **Description** | 
|-----------|-----------|  
| **Add administrative unit** | This appears for Success and Failure when creating an Administrative unit |
| **Delete administrative unit** | This appears for Success and Failure when deleting an Administrative unit |
| **Add member to administrative unit** | This appears for Success and Failure when adding users or groups. |
| **Add scoped member to role** | This appears for Success and Failure when adding scoped role members. |
| **Remove member from administrative unit** | This appears for Success and Failure when removing users or groups. |
| **Remove scoped member from role** | This appears for Success and Failure when removing scoped role members. |

**NOTE**: Deleting the AU only shows the **Delete administrative unit** event. Removal of members and scoped role memberships for that AU are not recorded. This is By design. When an AU is deleted, the whole AU goes away along with all the membership links and scope assignments. In the backend, this is a single atomic operation. The service does not enumerate through the links and delete them one by one. That is why the Audit logs only records a deletion event for the AU itself. It's implied that all the member links went away along with it. The same behavior is seen today when a group is deleted.

___

## Azure Support Center (ASC)

### Audit logs

Select the **Audit Logs** node in the left hand navigation and filter using **Category** of **AdministrativeUnit**.

___

### Administrative Units

1. In *Tenant Explorer* select the **Administrative Units** node in the left-hand column.
2. Leave **Search by displayName or objectId** empty and click **Run**.

Leaving the search field empty retrieves a list of all Administrative units in the tenant.

3. Expand the Administrative unit of interest.
4. Copy the ObjectID

![AUSearchInASC](/.attachments/AAD-Account-Management/288769/AUSearchInASC.jpg)

___

#### Members tab

Since an Administrative Unit could have thousands of members, the recommendation is to have support engineers specify exactly which member they are looking for.

Process to view members of a specific Administrative Unit.

1. Paste the ObjectID in **Search by displayName or objectId** and click **Run**.
2. In the **Display name or object ID of member** field.

If the principal that is queried is assigned to the AU as a Member, their account information will be returned. Otherwise, the result will be an error.

- (Preferred) Enter the **ObjectID** of a user, group, service principal or device and click **Run**.

![AUMemberPreferred](/.attachments/AAD-Account-Management/183935/AUMemberPreferred.jpg)

- Enter the **DisplayName** and then, from the **Member Type (required for search by display name)** drop-down, select the correct object type for the principal before clicking **Run**.

**Note**: DisplayName will not accept portions of the displayName, UPN or objectId. 

![AUMemberNotPreferred](/.attachments/AAD-Account-Management/183935/AUMemberNotPreferred.jpg)

___

#### Scoped Administrators tab

1. Click **Run** on the **Scoped Administrators** tab to see a list of users with role assignments scoped to the selected AU.

<span style="color:red">**IMPORTANT**</span>: Only administrators with permissions scoped down to this administrative unit are displayed here. Tenant-level administrators still have access to this administrative unit, and these can be viewed through the Role Assignments tab.

___

# ICM Path

Once this support topic is live, support engineers should set this as the support topic and create the ICM from ASC.

**Service**: Microsoft Entra Directories, Domains and Objects
**Problem**: Administrative units/ Administrative unit role assignment.

Until the support topic goes live in ASC, Support engineers escalate Azure AD Administrative Unit issues should using this [ICM template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=qm2z8j). (**This template link is not working. Please open an ICM through ASC and search for the correct owning service/team as instructed below**)

TAs redirecting these ICMs to the product group should use:

- **Owning Service**: AAD Distributed Directory Services

- **Owning Team**: RBAC Graph API

Formerly the Owning Service was MSODS, but this has been renamed.

___

# Training

## Deep Dive: 17361 - Custom roles for devices and 17360 - Scoping of devices in AUs

**Course ID**: TBD

**Format**: Self-paced eLearning

**Duration**: 37 minutes

**Audience**: Cloud Identity Support Team [AAD - Account Management Professional](https://msaas.support.microsoft.com/queue/ce0b7553-9d09-e711-8121-002dd815174c), [AAD - Account Management Premier](https://msaas.support.microsoft.com/queue/6014a8ba-465c-e711-8129-001dd8b72a0c) and [MSaaS AAD - Developer](https://msaas.support.microsoft.com/queue/5ba5f352-01bc-dd11-9c6c-02bf0afb1072)

**Tool Availability**: October 31, 2021

**Training Completion**: October 20, 2021

**Region**: All regions

**Course Location**: [SuccessFactors](https://aka.ms/AAe238d)

___

## Deep Dive 2057 - Azure AD Administrative Units

**Course ID**: S9192202

**Format**: Self-paced eLearning

**Duration**: 34 minutes

**Audience**: Cloud Identity Support Team [AAD - Account Management Professional](https://msaas.support.microsoft.com/queue/ce0b7553-9d09-e711-8121-002dd815174c), [AAD - Account Management Premier](https://msaas.support.microsoft.com/queue/6014a8ba-465c-e711-8129-001dd8b72a0c)

**Tool Availability**: March 27, 2020

**Training Completion**: March 20, 2020

**Region**: All regions

**Course Location:** [QA](https://aka.ms/AArk06g)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.
