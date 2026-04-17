---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Roles and Administrators/Azure AD Administrative Units (PowerShell)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Roles%20and%20Administrators%2FAzure%20AD%20Administrative%20Units%20(PowerShell)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- cw.AAD-Administrative-Units
-  Managing Administrative Unites in PowerShell
- cs.comm-secaccmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Account-Management](/Tags/AAD%2DAccount%2DManagement) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-Administrative-Units](/Tags/AAD%2DAdministrative%2DUnits) 
 


[[_TOC_]]

# Summary

Administrative Units (AU) in Azure AD are similar to OUs in Active Directory Domain Services. AUs can be used to "scope" a role member's permissions over a portion of the directory, rather than directory-wide. 

AUs are directory objects that can be created and populated with resources, such as users, groups and roles. Once created and populated with member user accounts, AUs can be used to scope granting of permissions to just those resources contained in the administrative unit. Currently, only roles which are specific to user management are supported for scoping to an AU.

These credential management roles are exposed in Admin Units UI:

- Authentication administrator
- Group administrator
- Helpdesk administrator
- Password administrator
- License administrator
- Password administrator
- User administrator

Administrative units enable global administratos to delegate administrative permissions to regional administrators, or set policy at a granular level.

# Public Documentation

### Public Preview V1 Announcement (December 11, 2014)

[Wrapping up the year with a boat load of Azure AD news\!](https://techcommunity.microsoft.com/t5/Azure-Active-Directory-Identity/Wrapping-up-the-year-with-a-boat-load-of-Azure-AD-news/ba-p/243851)

  - First Public Preview of Administrative Units

### Public Preview V2 Announcement (2/13/2017)

[Administrative units management in Azure Active Directory (public preview)](https://docs.microsoft.com/en-us/azure/active-directory/users-groups-roles/directory-administrative-units)

# Requirements

* Azure Active Directory Premium
* [Microsoft Graph PowerShell](https://learn.microsoft.com/en-us/powershell/microsoftgraph/overview?view=graph-powershell-1.0)
  ```
  Install-Module Microsoft.Graph -Repository PSGallery
  ```
  Once Microsoft Graph PowerShell is installed. Sign-in with the PowerShell module so that you can call Microsoft Graph...
  ```
  Connect-MgGraph
  ```

# Limitations

- In this release, only User objects are supported as members of Administrative Units. This means only those roles which are specific to user management are supported. This means only the "User Account Administrator" and "Password Administrator" roles can be managed.
- Administrative Unit-scoped User Account Administrators cannot create or delete users.
- For some scenarios user with the relevant role assigned at the AU level cannot reset passwords or manage authentication methods. Check if the user belongs to a AAD group where Assignable to role is True. If so, This is by design. The reason for this is because those users are part of groups that are marked as AssignableToRoles. These are special highly privileged groups that have extra protection on them. Members of these groups cannot be managed by anyone other then Global Admin and Privileged Role Admin. This could also apply to additional operations such as delete user. https://docs.microsoft.com/en-us/azure/active-directory/roles/groups-concept#why-we-enforce-creation-of-a-special-group-for-assigning-it-to-a-role

# Administrative Unit API

Today, Administrative units can be created and managed using Microsoft Graph API:

### Graph API for administrativeUnit resource type

Administrative units can be managed using Microsoft Graph calls documented in as the [administrativeUnit resource type](https://learn.microsoft.com/en-us/graph/api/resources/administrativeunit?view=graph-rest-1.0)  


### PowerShell cmdlets:

| Command                                | Description                                                |
| -------------------------------------- | ---------------------------------------------------------- |
| [Get-MgDirectoryAdministrativeUnit](https://learn.microsoft.com/en-us/graph/api/directory-list-administrativeunits?view=graph-rest-1.0&tabs=powershell) | Gets a administrativeUnit object(s).
| [Get-MgDirectoryAdministrativeUnitMember](https://learn.microsoft.com/en-us/graph/api/administrativeunit-list-members?view=graph-rest-1.0&tabs=powershell) | Gets a member(s) of an administrative unit.
| [Get-MgDirectoryAdministrativeUnitScopedRoleMember](https://learn.microsoft.com/en-us/graph/api/administrativeunit-list-scopedrolemembers?view=graph-rest-1.0&tabs=powershell) | List Microsoft Entra role assignments with administrative unit scope.
| [New-MgDirectoryAdministrativeUnit](https://learn.microsoft.com/en-us/graph/api/directory-post-administrativeunits?view=graph-rest-1.0&tabs=powershell) | Creates an administrative unit.
| [New-MgDirectoryAdministrativeUnitMember](https://learn.microsoft.com/en-us/graph/api/administrativeunit-post-members?view=graph-rest-1.0&tabs=powershell) | Adds an administrative unit member. 
| [New-MgDirectoryAdministrativeUnitScopedRoleMember](https://learn.microsoft.com/en-us/graph/api/administrativeunit-post-scopedrolemembers?view=graph-rest-1.0&tabs=powershell) | Adds a scoped role membership to an administrative unit
| [Remove-MgDirectoryAdministrativeUnit](https://learn.microsoft.com/en-us/graph/api/administrativeunit-delete?view=graph-rest-1.0&tabs=powershell) | Removes an administrative unit.  
| [Remove-MgDirectoryAdministrativeUnitScopedRoleMember](https://learn.microsoft.com/en-us/graph/api/administrativeunit-delete-scopedrolemembers?view=graph-rest-1.0&tabs=powershell) | Removes an  scoped role membership from an administrative unit.
| [Update-MgDirectoryAdministrativeUnit](https://learn.microsoft.com/en-us/graph/api/administrativeunit-update?view=graph-rest-1.0&tabs=powershell) |  Updates an administrative unit

# Errors
    
This occurs when a Administrative Unit scoped user  tries to manage users not within the Administrative Unit...

    ```
        Code: Authorization_RequestDenied
        Message: Insufficient privileges to complete the operation.
        HttpStatusCode: Forbidden
        HttpStatusDescription: Forbidden
        HttpResponseStatus: Completed
    ```

# Viewing Objects in MSODS using DSExplorer

Find the Administrative Units node in DSExplorer and copy the ObjectID of the Administrative Unit you want to investigate.

![ViewLinksOnSingleAdminUnit](/.attachments/AAD-Account-Management/183935/ViewLinksOnSingleAdminUnit.jpg)

### Using the "Scoped Members" tab

The Scoped Members tab in DSExplorer can be used to view Azure AD Role membership that has been scoped to a specific Administrative Unit.

Clicking search on the \[**Scoped Members**\] tab with no search filter defined will return a list of all Azure AD Roles that are scoped to each Administrative Unit in the left navigation pane.

Each Role-\>AU association starts with the left most portion of the ObjectID of an Azure AD Role and is separated by an **-\>** arrow which points to the left most portion of the ObjectId of a particular Administrative Unit.

| Attribute        | Description                                                                            |
| ---------------- | -------------------------------------------------------------------------------------- |
| \_SourceObjectId | ObjectID of the Azure AD Role associated with the Administrative Unit                  |
| \_TargetObjectId | ObjectID of the user or group assigned to the Azure AD Role in the Administrative Unit |
| ScopedIdentifier | ObjectID of the Administrative Unit to which the role assignment is scoped             |

#### Filtering Scoped Members

Scoped Members tab contains a drop-down filter.

  - Selecting "**(any)**" shows all Azure AD Roles and their AU association.
  - Selecting **User** and specifying the ObjectId of a user produces a list of all Role/AU associations that the specified user has been delegated to. The user's ObjectId is seen in the \_**TargetObjectId** attribute.
  - Selecting **Group** and specifying the ObjectId of a group produces a list of all Role/AU associations that the specified group has been delegated to. The group's ObjectId is also seen in the \_**TargetObjectId** attribute.

![UnfilteredScopedMembers](/.attachments/AAD-Account-Management/183935/UnfilteredScopedMembers.jpg)

You can filter the search by a specifying a Role's ObjectId and/or a target principal ObjectId of a User or Group. In this example, a search using the ObjectID of a user in the administrative unit returns two Admin Units that the user is a member of.

![FilteredByUserScopedMembers](/.attachments/AAD-Account-Management/183935/FilteredByUserScopedMembers.jpg)

### Examining Administrative Unit Objects in DSExplorer

Using the ObjectID of an Administrative Unit copied earlier, yo can search for the Administrative Unit ObjectID in '**Single Object**' and examine the **Properties** tab.

![ViewSingleAdminUnit](/.attachments/AAD-Account-Management/183935/ViewSingleAdminUnit.jpg)

To see members linked to the Administrative Unit, select the **Links** tab and locate the desired member. In this case, the member is a scoped role member for the administrative unit. Copy the user's ObjectID.

![ViewLinksOnSingleAdminUnit](/.attachments/AAD-Account-Management/183935/ViewLinksOnSingleAdminUnit.jpg)

Paste the User's ObjectID into the search field of the "**Single User**" tab. Click the '**Links**' tab and expand **Target**\\**ScopedMember** to expose the Roles that are scoped to this member. In this case the "**User Account Administrator**" role is scoped to this user. Copy the ObjectId for this Role.

![ViewLinksOfScopedAdmin](/.attachments/AAD-Account-Management/183935/ViewLinksOfScopedAdmin.jpg)

Paste the ObjectID for the role into the search pane of the '**Single Object**' tab and examine the **Properties** tab to make sure the correct role is found.

![ViewPropertiesOfRoleObjectID](/.attachments/AAD-Account-Management/183935/ViewPropertiesOfRoleObjectID.jpg)

Click the **Links** tab.

  - **Member** contains Permanent and Active candidate members (Privileged Identity Management)
  - **ScopedMember** returns the error shown below.

![ViewLinksOfRoleObjectIDScopedMember.jpg](/.attachments/AAD-Account-Management/183935/ViewLinksOfRoleObjectIDScopedMember.jpg)

  - **EligableMember** are those Inactive candidate members (Privileged Identity Management)

# Logs

## How to perform Server-Side tracing of Administrative Units issues in msodsprod using Jarvis/Geneva

Get the ObjectID of the administrative unit that is the issue is happening with and use it in the search for Filtering condition below:

1.  Connect to <https://jarvis-west.dc.ad.msft.net/#/>
    1.  **Endpoint** = Diagnostic PROD
    2.  **Namespace** = msodsprod
    3.  Set Date/Time to within a few minutes after the event and search -5 minutes.
    4.  **Scoping condition**: ROLE == becwebservice
    5.  **Filtering condition**: AnyField \> contains \> "AdministrativeUnit\_bcedc102-4ba5-4961-939b-bb1a1754d3ea"
2.  Copy the CorrelationID of an event that is found. Remove the Filter condition from the previous search and replace it with the CorrelationID copied from the previous trace results:
    1.  **Filtering condition**: CorrelationID \> contains \> a0b995ac-d39b-41f6-bec8-8942a99e4b16

## Perform Service-Side tracing of Administrative Units

Service-side tracing of issues can be performed in Kusto against the msodsprod database.

1.  Click the link below to request access to MSODS tracing in Kusto.
    1.  [14114](https://ramweb/RequestAccess.aspx?ProjectID=14114) AAD Production MDS General Access (RO)(14114)
2.  Open Kusto from <https://estsam2.kusto.windows.net>
3.  Right-click **Connections** and select "**Add Connection**".
    1.  Type in a "**Data Source**" of <https://msodseas.kusto.windows.net:443>
    2.  Change "**Connection Alias**" to **MSODS** and click **OK**.
4.  Expand **Connections** \\ **MSODS** \\ **MSODS** and select "**UlsEvents**" **Note**: If you get this message when you click the green "**Run**", you must select UlsEvents as described above.
    1.  <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/4acdc802-f7d5-df2e-77f1-74fdcc8a8da3KustoError.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="KustoError.jpg" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/4acdc802-f7d5-df2e-77f1-74fdcc8a8da3KustoError.jpg" width="229" height="118" class="thumbborder"></a><br/>
    2.  Title: No query context
    3.  Please, select any Database or Table
5.  Identify the activity in Kusto. This query pulls all activity for the Administrative Unit based on its ObjectID. Modify your search to use the ObjectID of your customer's administrative Unit. Narrow into activity that correlates closest in time:

**GlobalUlsEvents |whereTimestamp \>= ago(2d)**

**| where Role == "becwebservice"**

**| where Message contains "AdministrativeUnit\_bcedc102-4ba5-4961-939b-bb1a1754d3ea"**

  - **NOTE**: Once you have an event that comes close to the time of the event, modify your search as follows (with the time of the event obtained from the previous search results). Also, copy the CorrelationID from an event that corresponds to the time of the incident. Modify your search to look like this and it will find all activity that corresponds with the event:

**GlobalUlsEvents**

**//|whereTimestamp \>= ago(2d)**

**| where Timestamp \> datetime(2017-03-14T23:32:00Z) and Timestamp \< datetime(2017-03-14T23:34:00Z)**

**//| where Role == "becwebservice" //| where Message contains "AdministrativeUnit\_bcedc102-4ba5-4961-939b-bb1a1754d3ea"**

**| where CorrelationId == "a0b995ac-d39b-41f6-bec8-8942a99e4b16" |}**


