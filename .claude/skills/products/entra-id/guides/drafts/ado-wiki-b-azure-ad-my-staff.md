---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD User Management/Azure AD My Staff"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20User%20Management/Azure%20AD%20My%20Staff"
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
- My Staff
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [Entra](/Tags/Entra) [EntraID](/Tags/EntraID) [comm-objprinmgt](/Tags/comm%2Dobjprinmgt) [User-Management](/Tags/User%2DManagement)  
 


[[_TOC_]]

# Summary

Many organizations have a large number employees known as "firstline workers" that rarely sign in to their account. These users tend to have customer facing roles, like hair stylists, waiters and baristas, and they tend to forget their username and password. As such, their productivity is negatively impacted because they need to call a helpdesk.

My Staff empowers firstline managers to reset passwords and manage phone numbers for their employees. This eliminates the overhead required by a centralized helpdesk. By delegating administrative roles to a scoped set of users with administrative units, My Staff ensures firstline workers are always able to access the resources they need.  

Currently, My Staff supports the following scenarios:

-	View administrative units (AUs) over which the scoped administrator has been granted access
-	View users assigned to the AUs over which the scoped administrator has been granted access

**Note**: Adding a group to an AU does NOT add the group members to the AU. Adding of groups is only intended to allow delegated group admins to manage group properties. Groups added to an AU do not show up in My Staff.

-	Scoped credential administrators can reset a user's password.
-	Scoped credential administrators can Add/Remove and Edit a user's phone number for Multi-Factor Authentication (MFA), and self-service password reset (SSPR). If the user is in the **Text message** Authentication Method policy, their phone number will be provisioned to support SMS sign in as a primary factor authentication method.

# Licensing
Azure Active Directory Premium 1

# Microsoft Teams Support Channel

[My Staff](https://teams.microsoft.com/l/channel/19%3ae619ac1284bb402d91e1b28bf4b5b352%40thread.skype/My%2520Staff?groupId=56c43627-9135-4509-bfe0-50ebd0e47960&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) teams channel is under **Cloud Identity - Account Management**.

# Public Documentation

- [Manage front line users with My Staff](https://support.microsoft.com/account-billing/manage-front-line-users-with-my-staff-c65b9673-7e1c-4ad6-812b-1a31ce4460bd)

# Limitations

- **Audit logs** are only shown in the Azure AD portal and cannot be viewed through My Staff.
- **Audit logs** cannot be viewed at the Administrative Unit (AU) level.
      - Managers with permission to view Azure AD Audit logs will not be scoped to users in the AUs that they are assigned to.
- Users that are members of groups assigned to the AU **do not appear** in My Staff. This is by design. My Staff does not perform group expansion and therefore does not list members within the groups.

# Known Issues

## Issue \#0: Oops, seems you're not authorized to see My Staff at this time

This occurs when one or both of the following conditions are not met:
1.	The user has been assigned an admin role of any kind
2.	The user has been enabled to access My Staff under Azure portal > Azure Active Directory > User Settings > Manage user feature preview settings.

 <table class="wikitable">
<tbody><tr>
<th colspan="2">On-screen Error
</th></tr>
<tr>
<td style="vertical-align:top">Oops, seems you're not authorized to see My Staff at this time. Please contact your admin for more information.
</td>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/AAD-Account-Management/184117/UserDeniedPortalAccess.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="UserDeniedPortalAccess.jpg" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/AAD-Account-Management/184117/UserDeniedPortalAccess.jpg" width="619" height="121" class="thumbborder" srcset="/images/thumb/e/e1/UserDeniedPortalAccess.jpg/929px-UserDeniedPortalAccess.jpg 1.5x, /images/e/e1/UserDeniedPortalAccess.jpg 2x"></a>
</td></tr></tbody></table> 

## Issue \#1: Malicious FLM can access FLWs account

Allowing FLMs to set or modify a FLWs credentials, means a malicious manager could effectively sign in to another manager's account, and change a FLW's shifts or read/modify other account data.

A typical abuse flow may look like this:

1\. Kelly is the FLM and he wants to modify Maries shifts without her knowledge

2\. Kelly logs on to the FLM Portal UX, looks up Maries account and replaces Maries phone number with her own

3\. Kelly can now sign into Maries stuff

4\. To hide her malicious activity, Kelly updates the number on Maries account with her number.

Giving credential management power to a class or users allows FLMs to set credentials . As such, it is not possible to prevent the scenario above from happening. All credential changes will be logged giving tenant admins the ability to discover this sort of abuse and understand what their FLMs are doing.

## Issue \#2: FLM can reset password, or change sign-in number on a company executives account, and access their stuff

Role scoping to AUs mitigates this.

## Issue \#3: Scoped Admin Unit admins get an error stating, The list is empty

A manager that has been delegated scoped admin permission over an AU sees a complete list of all AUs in the tenant, even those they do not have delegated admin control over. When they select an AU they do not have control over they get an error stating, The list is empty. Any attempt to navigate away in My Staff continues to show the error stating, The list is empty. the scoped admin must close the browser and sign-in to My Staff again and then avoid selecting an AU they do not have admin control over or they will start the process all over again.

## Issue \#4: Managers see "Phone is not allowed by policy" for Admin Unit members

Users with this listed as their phone number in My Staff are not enabled to use phone number for MFA, SSPR, or SMS sign in. 

## Issue \#5: You must be an admin to view this site
Users who have not been assigned an admin role and navigate to https://mystaff.microsoft.com/ will also get this error, even if they are members of an Admin Unit.

All admin roles (scoped and tenant-wide) can view My Staff. 

If the user shows as being a member of the role when viewing the role assignments from the Administrative Unit, verify the **Scope** of that membership does not show as **Directory (Inherited)**.  Role assignments scoped at the directory level will not grant access over the AU.  The user must be granted a scoped role membership at the AU level.  A scoped role assignment will have a **Scope** of **This resource**.

![ScopedRoleAssignmentRequired](/.attachments/AAD-Account-Management/184117/ScopedRoleAssignmentRequired.jpg)

## Issue \#6: Rapid edit of phone numbers causes backend corruption
If an admin quickly takes multiple actions on a users phone number such as add, change, or delete, the phone number may become corrupted in the backend. Even though all of the settings are setup correctly for the admin to be able to manage the phone number and for the user to be able to use the number, it wont work. Please contact us directly if you believe youve run into this issue. 


# Enable My Staff

1.  Sign into the Azure portal as a user administrator or a global administrator.
2.  Browse to**Azure Active Directory**\>**User settings**\>**Manage settings for access panel preview features**.
3.  Under**Administrators can access My Staff**, the administrator can choose **Selected** and add one group, or **Allusers** to make this apply to all users in the tenant who have been assigned an admin role.

The kusto query below checks if a user is enabled for My Staff and will be added as an ASC insight.  The results of **getEnabledApps** will return **MyStaff enabled**: true | false.

Cluster: kusto.aria.microsoft.com

1. Select the AD IAM PROD database
2. Run the query: ASC_EnabledAppsInsight("name@domain.com") where the string in quotes represents a UPN.
3. The result will tell you if a user is enabled for My Staff.

# Microsoft Entra RBAC

  - To reset passwords and manage phone numbers in My Staff, FLMs must be assigned to roles that have permission perform those actions, such as **Helpdesk (Password) Administrator** or **Authentication Administrator**.
      - My Staff scopes those permissions to a specific AU or AUs.
  - Currently, Entra ID CustomRoles does not support these user management roles. Once they are supported, adding the following permissions to a custom role would allow a user to access My Staff and perform actions on scoped users:
      - microsoft.aad.directory/users/password/update
      - microsoft.aad.directory/users/strongAuthentication/update

# Admin Scenarios

## Reset a users password (cloud & hybrid)

An admin selects a user and resets their password. Works for cloud-only and hybrid users who have their password written back to on-premises AD. User's who have had their password reset must sign in with the temporary password and change their password when prompted.

## Add a users phone number

An admin selects a user and adds a phone number for them. The user then signs into their Azure AD account by entering their phone number, receiving a text with a code, and entering that code.

## Change a users phone number

An admin selects a user and changes their phone number to a different phone number. A user enters their new phone number to sign in. Once they receive the text with a code, they must enter that code.

## Delete a users phone number

An admin selects a user and deletes their phone number. The user can no longer sign into their Azure AD account using their phone number.

## Search for a user

An admin searches for a user by first or last name and can view the user's profile.

## Change location/admin unit

An admin views a specific location in My Staff. The admin is assigned to more than one location. Once they choose a different location they see all users who are in that location.

## Choose location/admin unit on first sign in

At first sign into My Staff, an admin is assigned to more than one location is presented with the option to select which location they want to use. Once they select a location they are shown all users in that location.

## View last location/admin unit

An admin views a specific location in My Staff and closes My Staff. The next time the admin signs back into My Staff, they are presented the same location they previously viewed.

## Rollback

Disable My Staff for the tenant via 'User settings'. Additional instructions can be found in the admin documentation for My Staff.

## B2B

A FLM can be invited to another tenant and given an admin role that is scoped to an AU. In this case, the FLM should be able to switch the tenant in which they are accessing My Staff. If they switch to another tenant where they dont have admin access, they will be shown the standard error message.

<span style="color:red">**\<DOCUMENT THIS ERROR\>**</span>

# Workflows

## Manager Workflow

![Manager Workflow.jpg](/.attachments/AAD-Account-Management/184117/Manager_Workflow.jpg)

# Management Experience

A manager navigates to mystaff.microsoft.com and see a list of Administrative Units where they have been granted scoped Administrative role access.

![ManagerAUs.jpg](/.attachments/AAD-Account-Management/184117/ManagerAUs.jpg)

- For more information about what permissions scoped roles possess and the actions they can perform, see [Roles Available in Administrative Units](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageID=183935&anchor=roles-available-in-administrative-units).

The manager clicked the Admin Unit where they wish to manage a user's credentials to get a list of members.

![UsersInAU.jpg](/.attachments/AAD-Account-Management/184117/UsersInAU.jpg)

The manager selects an individual Administrative Unit member and can **Reset** their password or **Add/Edit/Delete** a phone number.

![ManageCreds.jpg](/.attachments/AAD-Account-Management/184117/ManageCreds.jpg)

## Password Reset

| Reset Password                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------- |
| ![PasswordReset.jpg](/.attachments/AAD-Account-Management/184117/PasswordReset.jpg)         |
| ![CopyNewPassword.jpg](/.attachments/AAD-Account-Management/184117/CopyNewPassword.jpg) |

## Add/Edit/Delete Phone (SMS/Text/Mobile) Number

The phone number is saved to the Mapping Directoryoutside of MSODS and an**AlternativeSecurityId**attribute is populated on the user's account in MSODS with an**"IdentityProvider":"phone"**and**"Key"**information.

 <table class="wikitable">
<tbody><tr>
<th colspan="2">Add/Edit/Delete Phone Number
</th></tr>
<tr>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/AAD-Account-Management/184117/AddPhoneNumber.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="AddPhoneNumber.jpg" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/AAD-Account-Management/184117/AddPhoneNumber.jpg" width="346" height="177" class="thumbborder" srcset="/images/thumb/c/cd/AddPhoneNumber.jpg/519px-AddPhoneNumber.jpg 1.5x, /images/c/cd/AddPhoneNumber.jpg 2x"></a>
</td>
<td style="vertical-align:top"><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/AAD-Account-Management/184117/SuccessfullyRegisteredPhoneNumberForSMS-Sign-in.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="SuccessfullyRegisteredPhoneNumberForSMS-Sign-in.jpg" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/AAD-Account-Management/184117/SuccessfullyRegisteredPhoneNumberForSMS-Sign-in.jpg" width="346" height="83" class="thumbborder" srcset="/images/thumb/2/29/SuccessfullyRegisteredPhoneNumberForSMS-Sign-in.jpg/519px-SuccessfullyRegisteredPhoneNumberForSMS-Sign-in.jpg 1.5x, /images/2/29/SuccessfullyRegisteredPhoneNumberForSMS-Sign-in.jpg 2x"></a>
</td></tr></tbody></table> 

### Text Message Policy Verification

If a phone number is set for the user the **Add** option will no longer be present on the user's account.

  - If phone is enabled by policy for the user for MFA, SSPR, or SMS sign in and a phone number is registered, the options to **Edit** or **Delete** the phone number will exist.
  - If phone is not enabled by policy for the user, the **Phone** will state "**Phone is not allowed by policy**".
  - Clicking **Edit** allows the manager to change the user's phone number
  - Clicking **Delete** will remove the phone number for the user.

| Policy Enabled for User                                                                                                                                                                     | Policy not Enabled for User                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![PhoneSign-inEnabledAndInPolicy.jpg](/.attachments/AAD-Account-Management/184117/PhoneSign-inEnabledAndInPolicy.jpg) | ![PhoneSign-inEnabledButNotInPolicy.jpg](/.attachments/AAD-Account-Management/184117/PhoneSign-inEnabledButNotInPolicy.jpg) |

# Conditional Access

Customers can now protect the My Staff portal using  Conditional Access (CA) policy. This means they can do things like require MFA before accessing My Staff.

The **My Staff** service principal will be enabled in all tenants in the future. Customers that need this capability today can manually create the My Staff service principal by running a couple of PowerShell commands.

**NOTE**: Microsoft strongly recommends that customers protect the My Staff portal with a CA policy.

## Manually Deploy the My Staff Service Principal

This step is only needed for customers that need this capability before it's automatically deployed to Production.

1. Install the [MS Graph beta PowerShell cmdlets](https://github.com/microsoftgraph/msgraph-sdk-powershell/blob/dev/samples/0-InstallModule.ps1)

- Customers that have not installed the "MS Graph beta PowerShell" before only need to run these commands:

```
Install-module Microsoft.Graph
Install-Module Microsoft.Graph.Authentication -Repository PSGallery -force
Connect-Graph -Scopes "Directory.AccessAsUser.All"
New-MgServicePrincipal -DisplayName "My Staff" -AppId "ba9ff945-a723-4ab5-a977-bd8c9044fe61"
```

2. Create a Conditional Access policy that applies to the My Staff cloud application.

![CAPforMyStaff](/.attachments/AAD-Account-Management/184117/CAPforMyStaff.jpg =709x512))

# Error messages
- Message shown when admin tries to register a phone number that has already been registered for another user in the tenant = 'Someone in the tenant has the same mobile number already'
- Message shown when admin enters a password that doesn't meet the on-prem policy = 'Manually provided password does not match the on prem password requirements'
- Message shown when password writeback is not enabled for the user = 'on prem configuration is not valid'
- Message shown when password meets on prem policy but has not yet synced to the cloud = The user's password has successfully been set on-premises, however the password has not yet synced to the cloud
- Message shown when connection to on-prem AD is broken, causing password writeback to not work = 'cannot connect to on prem server'
- Message shown when admin tries to reset the password of a user that is not in their AU or not a member of the tenant - 'outside the au/tenant'

# User Experience

# FAQ

## Can a customer use this capability in production?

During Public Preview, this feature can be scoped to a specific group, which makes it suitable for use in production.

## Who can the customer call when things go wrong?

This Public Preview will be supported by Customer Services and Support (CSS) will support customers according to the guidelines discussed in the Supplemental Terms of Use for Microsoft Azure Previews. This support may not be 24x7.

## Breaking changes and functional takebacks?

Public Preview capabilities may be withdrawn and possibly redesigned before reaching General Availability.

# Troubleshooting

## Step 1: Determine whether initial configuration is correct
First, we need to ensure that the user can access My Staff. To do this, check that the following conditions are satisfied:
1.	The user has been assigned an admin role of any kind
2.	The user has been enabled to access My Staff under Azure portal > Azure Active Directory > User Settings > Manage user feature preview settings.

If both conditions are true and the user is still unable to access My Staff, ask them to try accessing My Staff in a private browser. If this does not work, submit an ICM. 

## Step 2: Determine the issue category
Once you have determined that the initial configuration of My Staff is correct, work with the customer to understand the issue. 

**If the customer is not seeing the administrative units (AUs) or users that they expect to see**, start by investigating issues with viewing or managing AUs.

**If the customer is having issues resetting a users password in My Staff**, first verify that they are actually seeing the profile of the user whose password they want to reset. If not, start by investigating issues with viewing or managing AUs. If the users profile does exist and they are either not able to see the password reset option or are getting an error when resetting a users password, start by investigating issues with password reset. 

**If the customer is having issues with adding, changing, or deleting a users phone number in My Staff**, first verify that they are actually seeing the profile of the user whose phone number they want to manage. If not, start by investigating issues with viewing or managing AUs. If the users profile does exist and they are either not able to see the phone number option or are getting an error when managing a users phone number, start by investigating issues with phone number management.

## Step 3: Troubleshooting deep dives
### Investigate issues with viewing or managing administrative units (AUs)
**If an admin does not see the AUs they expect to see in the locations list**, first confirm that they are either a tenant-wide admin or that they have scoped admin permissions for that AU. If you confirm that the admin should be able to see the AU, please submit an ICM.

**If an admin does not see the user they expect to see in a particular location/AU**, first confirm that the user is actually in the AU. If you confirm that the user is in the AU and that the admin cannot see them in the users list, please submit an ICM.

**If the customer is having issues with setting up AUs**, please review the AU troubleshooting guide at https://aka.ms/AdminUnitsTSG.

### Investigate issues with password reset
**If an admin is not able to reset a user's password**, first determine whether the admin isnt able to reset a users password because the Reset functionality is disabled or because they are getting an error when they try to take an action.

**If the reset functionality is disabled**, the admin does not have the appropriate role for managing that users password. The admin needs to have Password Admin, Helpdesk Admin, Authentication Admin, Privileged Authentication Admin, or Global Admin permission for the tenant or scoped to the user to be able to reset their password.

### Investigate issues with phone number management
**If an admin is not able to edit or add a phone number for a user**, first determine whether the admin isnt able to do this because the Add/Edit/Delete functionality is disabled or because they are getting an error when they try to take an action.

**If the Add/Edit/Delete functionality is disabled**, the admin does not have the appropriate role for managing that users phone number. The admin needs to have Authentication Admin, Privileged Authentication Admin, or Global Admin permission for the tenant or scoped to the user to be able to manage their phone number.

## Azure Support Center (ASC)

A request has been made to expose actions performed by a scoped role admin.

You can view information on AUs in ASC. Learn more at https://aka.ms/AdminUnitsTSG.

## Audit logs

|                                  |                                         |
| -------------------------------- | --------------------------------------- |
| **Category**                     | **Activity**                            |
| Self-service password management | Reset password (by delegated admin)     |
| Self-service password management | Reset password (by delegated admin)     |
| Authentication methods           | Register phone number (for SMS sign in) |
| Authentication methods           | Change phone number (for SMS sign in)   |
| Authentication methods           | Remove phone number                     |

# Case Management

My Staff does not have its own Support Topic, but it is in the Root Cause tree. When closing a support incident where My Staff was having the issue, chose one of the issues under **Root Cause - CID Directory Domain Object** > **My Staff**.

# ICM Path

Support engineers working with enterprise customers that encountering potential bugs, or who are requesting a Design Change Request with My staff should file an ICM using this template:

https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=a1zD3S 

TAs that are redirecting these ICMs to the product group should set the service and Team as follows:

- **Owning Service**: IAM Services
- **Owning Team**: AAD End User Experiences

# Training

- Feature Overview and Troubleshooting for SMS Sign-in and My Staff.

**Title**: Brownbag for SMS Sign-in and My Staff

**Course ID**: S9193310

**Format**: Self-paced eLearning

**Duration**: 114 minutes

**Audience**: Cloud Identity Support Team [MSaaS AAD - Account Management Professional](https://msaas.support.microsoft.com/queue/ce0b7553-9d09-e711-8121-002dd815174c), [MSaaS AAD - Account Management Premier](https://msaas.support.microsoft.com/queue/6014a8ba-465c-e711-8129-001dd8b72a0c), [MSaaS AAD - Developer](https://msaas.support.microsoft.com/queue/5ba5f352-01bc-dd11-9c6c-02bf0afb1072), and [MSaaS Mooncake BC Escalation](https://msaas.support.microsoft.com/queue/7f624f7a-6a9a-e711-812f-002dd8151753)

**Tool Availability**: April 13, 2020

**Training Completion**: April 6, 2020

**Region**: All regions

**Course Location**: [SuccessFactors](https://aka.ms/AA81kx1)

- Deep dive into usage and troubleshooting of new User Authentication Methods and Permissions by Identity PM, Michael McLaughlin.

**Title**: New User Authentication Methods and Permissions

**Course ID**: S9193783

**Format**: Self-paced eLearning

**Duration**: 66 minutes

**Audience**: Cloud Identity Support Team [MSaaS AAD - Account Management Professional](https://msaas.support.microsoft.com/queue/ce0b7553-9d09-e711-8121-002dd815174c), [MSaaS AAD - Account Management Premier](https://msaas.support.microsoft.com/queue/6014a8ba-465c-e711-8129-001dd8b72a0c), [MSaaS Mooncake BC Escalation](https://msaas.support.microsoft.com/queue/7f624f7a-6a9a-e711-812f-002dd8151753)

**Tool Availability**: April 14, 2020

**Training Completion**: April 21, 2020

**Region**: All regions

**Course Location**: [SuccessFactors](https://hcm41.sapsf.com/sf/learning?destUrl=https%3a%2f%2fmicrosoftlmsap2%2elms%2esapsf%2ecom%2flearning%2fuser%2fdeeplink%5fredirect%2ejsp%3flinkId%3dITEM%5fDETAILS%26componentID%3dS9193783%26componentTypeID%3dONLINE%2dCOURSE%26revisionDate%3d1586953380000%26fromSF%3dY&company=microsofAP2)


