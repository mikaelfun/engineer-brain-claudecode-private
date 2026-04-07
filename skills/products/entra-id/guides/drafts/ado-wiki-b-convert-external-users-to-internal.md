---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD User Management/Convert External Users to Internal Users"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20User%20Management/Convert%20External%20Users%20to%20Internal%20Users"
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
- cw.AAD.B2B
- User Management
- Convert External Users to Internal
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [Entra](/Tags/Entra) [EntraID](/Tags/EntraID) [comm-objprinmgt](/Tags/comm%2Dobjprinmgt) [User-Management](/Tags/User%2DManagement) [AAD.B2B](/Tags/AAD.B2B)  


[[_TOC_]]

# Compliance note

This wiki contains test and/or lab data only.

___

# Summary

External user conversion enables customers to convert external users* to internal members without needing to delete and create new user objects. Maintaining the same underlying object ensures the user's account and access to resources isn't disrupted and that their history of activities remains intact as their relationship with the host organization changes.

Customers using cross-tenant sync for their Mergers and Acquisitions (M&A) create B2B external users in their home tenant first. As external users have a lot of restrictions, this conversion capability is key to the tenant migration / consolidation for these customers' M&A scenarios. 

The API includes the ability to convert on-prem synced external users to synced internal users. When converting a cloud-only external user, the admin must specify the UPN and password for the user, to allow the user to authenticate with the host's organization. The API updates the `userType` from `guest` to `member` and also returns a complex type called `"conversionUserDetails"` which includes `displayName`, `Upn`, `convertedToInternalUserDateTime` and `mail`. When an on-prem synced user is converted, you can't specify UPN or password. The user will continue to use the on-prem credentials, as on-prem synced user is managed on-prem.

External User Conversion can be performed using MS Graph API and the Entra ID Portal.
 
\* **External** users are those that authenticate via a method not managed by the host organization (i.e., another organization's Azure AD, Google federation, Microsoft account, etc.) While many external users likely have a userType of `guest` there is no formal relation between userType and how a user signs-in. As a result, some external users may have a userType of `member`. These users will also be eligible for conversion.

'externalUserConvertedOn" property is stamped with the date time when the user was converted from external to internal.
___

# Feature Capabilities

External users authenticate with an external tenant, not the current tenant. Internal users authenticate with the current tenant, which manages their authentication. This feature converts external users to internal and updates the `userType` from `guest` to `member`.

It is important to note that a `userType` of `member` vs `guest` doesn't indicate where a user authenticates. Member vs guest only defines the level of permissions the user has in the current tenant. Customers can update the user type for their users, but that alone doesn't change the users' external vs internal state.

## Cloud user conversion

When a cloud user is converted from external to internal, administrators must specify a UPN and password for the user. This ensures the user can authenticate with the current tenant. 
___

## Synced user conversion

For on-prem synced users where the tenant is a managed, meaning it uses cloud authentication, administrators are required to specify a password during conversion.

For on-prem synced users where the tenant uses federated authentication and Password Hash Sync (PHS) is enabled, administrators are blocked from setting a new password during conversion. However, if the federated tenant does not have PHS enabled, administrators have the option to set a password.

| Tenant Authentication type | Password Hash Sync enabled | Password Hash Sync disabled |
|-----|-----|-----|
| Federated | Block Write Password | Allow Write Password | 
| Managed | Force Write Password<br>**Note**: PHS won't have the user's password. | Force Write Password |

Design change:
| Tenant Authentication type | Password Hash Sync enabled | Password Hash Sync disabled |
|-----|-----|-----|
| Federated | Block Write Password | Block Write Password, as the password comes from the federated authentication source | 
| Managed | Block Write Password **Note**: If PHS enabled, password from on prem will always overwrite the cloud password. | Force Write Password |
___

# Roles

Converting an external user requires *User administrator* or *Global administrator* roles.

__

# User eligibility

Only users with an authentication method external to the host organization will be eligible for conversion. A check for eligibility is performed via an internal property that stores information regarding external sign in types. If a user is not eligible for conversion the API or PS command will return a 400 "Bad request" with a message that the user isn't eligible. 

___

# Support Boundaries

If customers report 1st application access or user experience issues with converted accounts, route the support case to that M365 application support team.

If 3rd party applications encounter application access or user experience issues with converted accounts, the customer should contact the vendor of that third party application to determine why the converted account is failing and correct the issue with application.

External to internal user conversion is owned by the Users community (aka: *Object and Principal Management*). Internal to external conversion is owned by the B2B community (aka: *External Identity Management* ).

___

# Known Issues

## Converted users may have issues accessing SharePoint, Teams or Viva Engage (Yammer)

Basic scenarios have been tested for these 1st party apps. However, the Identity PG are not experts on every edge case of these M365 apps. If application access or user experience issues occur with 1st party applications and converted accounts, route the support case to the M365 application support team.

___

# Errors

| Scenario | Code | Message |
|-----|-----|-----|
| `UserPrincipalName` email domain does not belong to the tenant verified domain list. | 400 | The provided UPN does not have a valid domain. |
| `UserPrincipalName` is empty. | 400 | The provided UPN cannot be empty. |
| `Mail` address email domain does not belong to the tenant verified domain list. | 400 | The provided UPN does not have a valid domain. |
| `Mail` address is empty "". | 400 | The mail provided cannot be empty. |
| Password is invalid. | 400 | The provided password is not valid. |
| User is not eligible for conversion. | 400 | The user authentication is already internal and is not eligible for conversion. |
| `UserPrincipalName` name and password should be empty for on prem users | 400 | For users synchronized from on-premises, userPrincipalName and passwordProfile must be empty |
|  UserState is neither accepted nor pending. | 412 | If a user who was previously converted from external to internal is invited again, this error indicates the user cannot be converted back to external.  Search for any users in tenant matching invited email and confirm user was previously converted via externalUserConvertedOn attribute presence

___

# Attributes Modified

| Attribute | Value Before | Value After  |
|-----|-----|-----|
| `"AltSecId"` | populated or null | null |
| `"creationType"` | `"Invitation"` | null |
| `"inviteTicket"` | `[{"Type":1,"Ticket":"267b5c56-1157-4875-90fa-2789f4090258"}]` | null |
| `"invitedAs"` |  | null |
| `"proxyAddresses"`<br><br>**Note**: This gets appended with the old mail nickname and pre-migration UPN. | `"SMTP:TestUser@fabrikam.com"` | `"SMTP:TestUser@fabrikam.com",`<br>`"smtp:TestUser_fabrikam.com#EXT#FakeTenant.onmicrosoft.com","smtp:TestUser@contoso.com","SMTP:TestUser@fabrikam.com"` |
| `"userPrincipalName"` | `"TestUser_fabrikam.com#EXT#@FakeTenant.onmicrosoft.com"` | `"TestUser@contoso.com"` |
| `"externalUserConvertedOn"` | null | `"2024-03-08T16:21:33.4491323Z"`|
| `"externalUserState"` | `"Accepted"` | null |
| `"userType"` | `"Guest"` | `"Member"` |
| `"identities"` | `"identities":` `[`<br>        `{`<br>            `"signInType": "federated",`<br>            `"issuer": "ExternalAzureAD",`<br>            `"issuerAssignedId": null`<br>        `},`<br>        `{`<br>            `"signInType": "userPrincipalName",`<br>            `"issuer": "FakeTenant.onmicrosoft.com",`<br>            `"issuerAssignedId": "TestUser_fabrikam.com#EXT#@FakeTenant.onmicrosoft.com"`<br>        `}`<br>    `],` | `"identities":` `[`<br>        `{`<br>            `"signInType": "userPrincipalName",`<br>            `"issuer": "FakeTenant.onmicrosoft.com",`<br>            `"issuerAssignedId": "TestUser@fabrikam.com"`<br>        `}`<br>    `],` |
| `"mail"`<br><br>**Note**: This only changes if specified in the POST call. | `TestUser@fabrikam.com` | `TestUser@contoso.com` |

___

# Parameters

When converting a user, the administrator must specify which user they want to convert using either the object ID or the user principal name (UPN). The following are the required and optional input parameters for the API & PowerShell command:

| Parameter name | Type | Required | Description |
|-----|-----|-----|-----|
| `userPrincipalName` | String | Yes | New UPN value for the user.<br><br>For cloud-only users, the UPN domain must be one that is non-federated.<br><br>For on-prem synced users, you don't need to provide a UPN. The user will continue to use the on-prem credentials. |
| `passwordProfile` | [passwordProfile](https://learn.microsoft.com/en-us/graph/api/resources/passwordprofile?view=graph-rest-1.0) | Yes | New temporary password for the user and whether to force change password on login.<br><br>For on-prem synced users, you can't configure a password. The user will continue to use the on-prem credentials. |
| `mail` | String | No | Optional new mail address for cloud users. |

\* On-prem synced guest users refers to internal users who have previously been invited to B2B collaboration (see [Invite internal users to B2B collaboration](https://learn.microsoft.com/en-us/entra/external-id/invite-internal-users)).

\** If [password writeback](https://learn.microsoft.com/en-us/entra/identity/authentication/tutorial-enable-sspr-writeback) is enabled, the conversion will not affect the writeback behavior. The converted user's password will still reflect any password changes that were synchronized from Entra ID to the on-prem environment.


___

# Distinguish External vs. Internal User

## What are external and internal users

External users authenticate with an external tenant, not the host tenant. Internal users authenticate with the host tenant, which manages their authentication.

`Usertype` of `member` vs `guest` doesn't indicate where a user authenticates. `Member` vs `guest` only defines the level of permissions the user has in the host tenant. Customers can update the user type for their users, but it doesn't change the users' external vs internal state. To update users' external vs. internal state, customers need to use the two conversion features below.

___

## How Support can distinguish external users

To determine if a user is an external user:

1. Check the user's `altSecId`. An external user should have at least one `altSecId` whose type is *not* `Phone`.

2. If the user doesn't have `altSecId` other than `Phone`, then check if `creationType` is `invitation`. Users who haven't accepted the invitation don't have `altSecId` other than `Phone` populated and should be determined from `creationType` = `invitation`.

**Note** - A user who hasn't redeemed the invitation can't sign into the host tenant, so this can be simplified by just checking the `altSecId` of the user.

**Note** - If customer tries to run conversion on a user who doesn't meet the requirements of being external, they will see an error : `Non-external user is not eligible for conversion` .  External users = Either non empty `altSecId` OR `userType=Guest` and `creationType = Invitation`

___

## How Customers can distinguish external users

`altSecId` isn't exposed publicly. Its information is stored in [identities](https://learn.microsoft.com/en-us/graph/api/resources/objectidentity?view=graph-rest-beta) (Opens in new window or tab) property on the user object. If a user's `signInType` is `federated`, then the user is an external user. Filtering on `signInType` of `federated` requires a valid `issuer` and `issuerAssignedId`. In practice, it's close to impossible for customers to come up with a complete list of `issuer` and `issuerAssignedIds`, so the recommendation is for customers to use another property, like `creationType`.

`creationType` indicates whether the user account was created through one of the following methods:

1. As a regular school or work account (null).

2. As an external account (Invitation).

3. As a local account for an Azure Active Directory B2C tenant (LocalAccount).

4. Through self-service sign-up by an internal user using email verification (EmailVerified).

5. Through self-service sign-up by an external user signing up through a link that is part of a user flow (SelfServiceSignUp).

6. Users whose `creationType` is either `Invitation` or `SelfServiceSignUp` are external users. There might be corner cases when Commerce creates a user and manipulates `creationType` for special purposes. However, for vast majority of the users, filtering on `creationType` should give customers a reliable list of external users.

**Note** - If customer tries to run conversion on a user who doesn't meet the requirements of being external, they will see an error : `Non-external user is not eligible for conversion` .  External users = Either non empty `altSecId` OR `userType=Guest` and `creationType = Invitation`
___

# Convert an External Cloud User to Internal

## Entra ID Portal

A new tile called **B2B collaboration** appears on the **Overview** blade of External users which allows an administrator to convert external cloud and external synced accounts into Internal users.  

### Cloud User (UX)

The **B2B collaboration** tile indicates the selected cloud user account is external.

1. Click the *Convert to internal user* link on the **B2B collaboration** tile to launch the *Convert to internal user* wizard.

![CloudAccountUX](/.attachments/AAD-Account-Management/1241996/CloudAccountUX.jpg)

2. The administrator can populate the following fields in the *Convert to internal user* wizard:

- **New user principal name** allows an administrator to retain the same user name or change it.
    - The domain drop-down lists all verified domains.
- **Auto-generated password** is selected by default. De-selecting allows the administrator to specify a password.

**Note**: Unlike the API, the UX requires the user change their password at next login. It does not provide a method to set the `"forceChangePasswordNextSignIn"` property to `false`.

- **Change email address** (optional) allows the administrator to change the default email address. Not checking this leaves the email address untouched.

![CloudAccountUXwiz](/.attachments/AAD-Account-Management/1241996/CloudAccountUXwiz.jpg)

### Synched User (UX)

The **B2B collaboration** tile indicates the selected on-premises synched user account is external.

1. Click the *Convert to internal user* link on the **B2B collaboration** tile to launch the *Convert to internal user* wizard.

**Note**: The *Domain not listed* link will be removed since nothing can be modified here.

2. The only option available to the administrator is the **Convert** button.

On-premises synced users continue to use their on-premises credentials for sign-in. This does not support altering the user principal name and/or password during the conversion.

![SyncedAccountUXwiz](/.attachments/AAD-Account-Management/1241996/SyncedAccountUXwiz.jpg)

___

## Microsoft Graph API

### Permissions

If attempting to call the Microsoft Graph API from your own application, the least privileged permission is `User-ConvertToInternal.ReadWrite.All` permission.

____

### Cloud User (API)

- Replace `{id}` in the the URI with the external user's `ObjectID` or UPN (i.e.: `TestUser_fabrikam.com#EXT#@FakeTenant.onmicrosoft.com`).
- For `"password"`, set a clear text password.
- Set `"forceChangePasswordNextSignIn"` to `true` or `false`. A setting of `true` requires the user change their password at next login. Setting this to `false` allows them to continue using the specified password.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/users/{id}/convertExternalToInternalMemberUser`

```json
{
    "userprincipalName": "testuser@contoso.com",
    "passwordProfile": {
        "password": "{replace_with_a_clear_text_password}",
        "forceChangePasswordNextSignIn": "true"
    }
}
```

___

### Synched User (API)

For users synchronized from on-premises, `userPrincipalName` and `passwordProfile` must be empty.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/users/{id}/convertExternalToInternalMemberUser`

```json
{
 "displayName": "testuser"
}
```

___

### Query All Converted Users

Use this timestamp to query for all converted users. 

**Action**: `GET`

**URI**: `https://graph.microsoft.com/beta/users?$filter=externalUserConvertedOn ge 2022-01-01T00:00:00Z`

**IMPORTANT**: Sometime around GA the `"externalUserConvertedOn"` attribute will be renamed to `"convertedToInternalUserDateTime"`. Once this occurs use this query:

**URI**: `https://graph.microsoft.com/beta/users?$filter=convertedToInternalUserDateTime ge 2022-01-01T00:00:00Z`

___

# Troubleshooting

## Azure Support Center

## User Properties

A work item is in place to expose the `"externalUserConvertedOn"` attribute in a field called **External user converted to Internal on** on the **Status** anchor of individual user accounts. Since the `"externalUserConvertedOn"` attribute will be renamed to `"convertedToInternalUserDateTime"` by GA, ASC will populate the **External user converted to Internal on** setting using either property name.

Until ASC is updated, the `"externalUserConvertedOn"` or `"convertedToInternalUserDateTime"` property can be viewed by issuing a Graph call in ASC's [Graph Explorer](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=1241996&anchor=graph-explorer).

## Graph Explorer

1. Replace the ObjectID or UPN of the user for `{objectId-or-UPN}` in the query below.

2. If `externalUserConvertedOn` is populated with a date the account was external at one time and converted to internal. Otherwise, the value will be `N/A`.

**Query Url**: `users/{objectId-or-UPN}`

**Version**: `beta`

### Kusto Web UX

1. In ASC, select **Kusto Web UX** and click the *ASC Kusto Web UX* link.

2. click the drop-down to the right of **Select cluster to add:** and select `msodsuswest`, then click **Add Cluster**.

3. Expand **MSODS** > **Functions** and select **GlobalIfxRestBusinessCommon**

**Cluster**: `msodsuswest.kusto.windows.net`

**Database**: `MSODS`

- **First query** - Discover the *correlationId* that aligns with the date and time of the customer issue. If it was a failure and the API error code is known, include that in your query.

**Note**: The `resourcePath` column contains the objectID of the user that is being converted.

**IMPORTANT**: Feedback bug [26113535](https://msazure.visualstudio.com/One/_workitems/edit/26113535) was created to add support for the `message` column. These sample queries do not include `message` in the "project" line. Once this is supported the `message` property should be included in the query 

```json
let delta =1d;let t =datetime(2023-11-21 21:15:00); 
GlobalIfxRestBusinessCommon
| where env_time > t - delta and env_time < delta + t
| where correlationId == "86d18d62-9603-4ad6-8608-9a4afa597b60"
// | where httpStatusCode == 400
// | where operationName == "ConvertExternalToInternalMemberUser"
// | project env_time,message,operationName,resourcePath,contextId,correlationId,internalCorrelationId,env_cloud_roleInstance,internalOperationType,httpStatusCode
| project env_time,operationName,resourcePath,contextId,correlationId,internalCorrelationId,env_cloud_roleInstance,internalOperationType,httpStatusCode
| order by env_time asc
```

- **Second query** - Replace the *correlationId* in sample query with the one copied from the first query and REM out `operationName == "ConvertExternalToInternalMemberUser"` as shown below.

```json
let delta =1d;let t =datetime(2023-11-21 21:15:00); 
GlobalIfxRestBusinessCommon
| where env_time > t - delta and env_time < delta + t
| where correlationId == "86d18d62-9603-4ad6-8608-9a4afa597b60"
// | where httpStatusCode == 400
// | where operationName == "ConvertExternalToInternalMemberUser"
// | project env_time,message,operationName,resourcePath,contextId,correlationId,internalCorrelationId,env_cloud_roleInstance,internalOperationType,httpStatusCode
| project env_time,operationName,resourcePath,contextId,correlationId,internalCorrelationId,env_cloud_roleInstance,internalOperationType,httpStatusCode
| order by env_time asc
```

## Known issues

### Issue # 1 - "Non-external user is not eligible for conversion"

The error "Non-external user is not eligible for conversion" means that the convertExternalToInternalMemberUser API doesnt consider the user as external.

To troubleshoot, look up the user via ASC Graph Explorer query `/users/OBJECTIDHERE?$select=id,userPrincipalName,mail,creationType,userType,externalUserState,externalUserStateChangeDateTime,identities,onPremisesImmutableId,onPremisesSyncEnabled`

Check the creationType, externalUserState, userType, and Identities collection attributes

The convertExternalToInternalMemberUser considers a user as external only if

1. creationType = Invitation + externalUserState = Accepted + identities collection contains non UPN signInType

   **or**

2. creationType = Invitation + userType = Guest

If one of these two scenarios is not true, then convertExternalToInternalMemberUser will fail with error "Non-external user is not eligible for conversion".

If you have created a user via Invitation, never accepted invite but set userType to Member then you cannot convert the user to internal until you change userType to Guest.  The convertExternalToInternalMemberUser API will automatically change userType back to Member during conversion.  

Changing userType to Guest for the purpose of then converting them to member\internal using convertExternalToInternalMemberUser API will not impact users access or permissions. �See definition of [UserType](https://learn.microsoft.com/en-us/entra/external-id/user-properties#user-type "https://learn.microsoft.com/en-us/entra/external-id/user-properties#user-type") property. �It is just a flag that allows admin to distinguish the user's relationship to their organization.

### Issue # 2 "Password is required for users synchronized from on-premises and with managed domain"

The error "Password is required for users synchronized from on-premises and with managed domain" means that the convertExternalToInternalMemberUser API has identified the user as a hybrid user using password hash sync which doesnt require a password to be specified during conversion but does currently require at least a `passwordProfile` to be included in the request.  Reference **[Bug 3428519 [External user conversion] - Password should not be required if PHS is enabled](https://dev.azure.com/IdentityDivision/Engineering/_workitems/edit/3428519 "https://dev.azure.com/identitydivision/engineering/_workitems/edit/3428519")**

To workaround this issue, using Graph API include a blank passwordProfile like the following:
  
   ```json
   POST�https://graph.microsoft.com/beta/users/OBJECTGUIDHERE/convertExternalToInternalMemberUser
    
   {"passwordProfile": { "forceChangePasswordNextSignIn": "false" } }
   ```


# ICM Path

For incidents regarding the conversion API:

**Owning Service**: IAM Services

**Owning Team**: Users Graph API

**Note**: For M365 issues, please route to corresponding M365 services.

___

# Training

**Title:**�Deep Dive 181584 - External to Internal user conversion

**Course ID**: TBD

**Format:**�Self-paced eLearning

**Duration:**�41 minutes

**Audience:**�Cloud Identity Support Community - **Object and Principal Management**.

**Microsoft Confidential**�� Items not in Public Preview or released to the General Audience should be considered confidential. All Dates are subject to change.

**Tool Availability:** January 15, 2024

**Training Completion:** January 15, 2024

**Region**: All regions

**Course Location:**�[QA](https://aka.ms/AAo1s7u)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.

___


