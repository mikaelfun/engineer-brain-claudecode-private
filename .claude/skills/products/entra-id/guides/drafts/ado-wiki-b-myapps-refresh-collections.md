---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/MyApps/How to/Azure AD My Apps Refresh and Collections"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/MyApps/How%20to/Azure%20AD%20My%20Apps%20Refresh%20and%20Collections"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-appex
- SCIM Identity
- MyApps
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD Authentication](/Tags/AAD-Authentication) [AAD Workflow](/Tags/AAD-Workflow) 
 

<font color="red">**IMPORTANT NOTICE**</font>:

New App Registrations after March 1st 2021 will be hidden by default. To make the app visible on My Apps an admin must go to the applications properties in Entra ID >> Enterprise Apps and select visible for users.

My Apps ended support for Internet Explorer on August 17th 2021. No updates will ship to IE and no bugs or breaks will be fixed by the product group. Please direct customers to switch to Edge.

[[_TOC_]]

# Summary

My Apps is the central location where users can find all the applications they need to be productive. The My Apps experience is being refreshed to provide a cleaner and more intuitive user interface.

  - **Admin Experience**: My Apps admin management has been consolidated under App launchers under Enterprise apps in the Azure portal. The Collections blade can be accessed through the App launchers entry point. In addition, there is a new Settings blade. The settings blade allows admins to manage previews, toggle gallery apps and set some Microsoft 365 settings. Some of these settings were previously found on the User settings blade. 

**IMPORTANT**: Collections do not assign permission to applications, they are only meant to present applications to the user in groupings that make sense. If the user has not been assigned permission to applications that are in the collection, then the collection will be empty in the user's view. If the user has been assigned to some, but not all of the applications in the collection, the user will only see those applications that they have access to.

# Limitations

  - Collections do not assign permission to applications. If the user has not been assigned permission to applications that are in the collection, then the collection will be empty in the user's view. If the user has been assigned to some, but not all of the applications in the collection, the user will only see those applications that they have access to.
  - Collections support nested group expansion. However, application assignment does not. Users assigned to applications with nested group membership will not see the applications in the Collection.

# Public Documents

- [My Apps overview](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/myapps-overview)

- [End-user experiences for applications](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/end-user-experiences)

- [Use collections in the My Apps portal](https://docs.microsoft.com/en-us/azure/active-directory/user-help/my-applications-portal-workspaces)

- [Create collections on the My Apps portal](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/access-panel-collections)

- [Customize app collections in the My Apps portal](https://support.microsoft.com/en-us/account-billing/customize-app-collections-in-the-my-apps-portal-2dae6b8a-d8b0-4a16-9a5d-71ed4d6a6c1d)

- [Edit or revoke application permissions in the My Apps portal](https://docs.microsoft.com/en-us/azure/active-directory/user-help/my-applications-portal-permissions-saved-accounts)

# Updates

## End user's ability to add Password SSO Apps in My Apps is being deprecated

The ability for end users to add Password SSO Apps in My Apps is being deprecated by November 14, 2023.  End users will no longer be able to add password SSO apps in My Apps. If the administrator needs to add a password SSO app for your end users, they can do so in the Microsoft Entra admin center. For more information, see [Add an application for password-based single sign-on](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/configure-password-single-sign-on-non-gallery-applications).

Additionally, admins will no longer see the control to enable this feature for their users in the Entra portal under **Applications** > **Enterprise applications** > **User settings**.

![DeprecatedUserApps](/.attachments/AAD-Authentication/184114/UserAddedPasswordSSOAppDeprecation.png)

Applications that were previously added by users will continue to work and will not be removed or disabled.

For more information please see the public documentation: [My Apps portal overview](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/myapps-overview#discover-applications)

## My Apps improved app discovery view

The My Apps user experience has a new app discovery view that shows more applications in the same space. This update allows users to scroll between their collections instead of one collection per page. 

Today, collections appear as tabs and users must select the tab to navigate to it. If a collection has a small number of apps with it, users are faced with a mostly blank page. The new view vertically stacks collections, similar to the Office apps experience.

Collection settings have also been updated in this new view. Previously, users would select the chevron to the right of the collection tab to manage settings. In the new view, users will select the **Settings** button at the top right of each collection. Clicking the chevron in the new view collapses and expands the collection.

| Old View | New view |
|-----|-----|
| ![OldManage](/.attachments/AAD-Authentication/184114/OldManage.jpg) | ![NewManage](/.attachments/AAD-Authentication/184114/NewManage.jpg) |	 

This new experience also makes Collection management more discoverable. Under the old view, users had to click the ellipses "****" button in the top-right of the ribbon. In the new view, the user simply needs to click the **Manage Collections** button in the top right of the page.

## Create Applications from URLs in My Apps

My Apps supports users adding their own custom applications simply by clicking **Add Apps** at the top of the My Apps page and choosing **Add a site** and entering a URL. Alternatively, the user search for an application and it is not in the application library, they will be given the option to click **Add a site** and they can choose if it gets added to any collections they have created.

![AddASite](/.attachments/AAD-Authentication/184114/AddASite.jpg)

When the user clicks **Add a site** they must enter a **Name** for their application. When the user enters a valid HTTPS address for the site in the **URL** field, My Apps displays the favicon for that site. If the user has any existing collections they can add the site to a collection by choosing it from the **Add to collection (optional)** drop-down.

![AddHTTPS](/.attachments/AAD-Authentication/184114/AddHTTPS.jpg)

Clicking **Save** saves that site to their list of applications.

![SiteAdded](/.attachments/AAD-Authentication/184114/SiteAdded.jpg)

Applications can all be created by selecting a collection and clicking **Edit**. Selecting **+ Add a site** brings up the same add a site wizard shown above **Add to collection (optional)** set to the selected collection.

![AddAppToCollection](/.attachments/AAD-Authentication/184114/AddAppToCollection.jpg)

Finally, users also have the ability to delete their sites by opening the menu for the app and selecting **Delete**.

![DeletePersonalApp](/.attachments/AAD-Authentication/184114/DeletePersonalApp.jpg)

# Known Issues

## Issue \#1: Applications in a Collection differ between team members

Individual team members only see some of the applications in the assigned collection, while other team members see all of the assigned applications.

## Solution \#1: Applications in a Collection differ between team members

  - Assigning individual users directly to applications can result in some users getting a full list of applications in the collection and other users seeing an incomplete list of applications. Instead of assigning individual users to an application, try assigning the user to a group and granting that group access to the applications.
  - Verify the user has been assigned any licenses that are necessary for the application.
  - If the user's permission to the application is assigned through nested group membership, that application will not appear under the Collections in the user's experience.

## Issue \#2: Collection Owners don't see the Collections blade

Collection owners don't see the Collections blade under Enterprise Apps when they sign-into the Azure portal.

## Solution \#2: Collection owners don't see the Collections blade

This can occur if the Collection owner account has Guest membership in another tenant and they signed into the Azure portal of that tenant. Perform a 'Switch user' to change tenants back to their home tenant.

# Required Entra ID Roles

  - Today Global Administrators, Application Administrators, and Cloud Application Administrators have full control over Collections. They can create, delete, and reorder the Collections and see the full list of Collections in Entra ID.
  - Collection owners will only see Collections they own listed in the Collections blade. They will have full control of the properties, like assigned apps and users, who can be delegated Owners, even the name of the Collection.

## Create New Collection Wizard

From the **Collections** blade, an Administrator clicks **New Collection** to launch the New Collection wizard.

**IMPORTANT**: Collections do not assign permission to applications. If the user has not been assigned permission to applications that are in the collection, then the collection will be empty in the user's view. If the user has been assigned to some, but not all of the applications in the collection, the user will only see those applications that they have access to.

![WorkspacesBlade.jpg](/.attachments/AAD-Authentication/184114/WorkspacesBlade.jpg)

### Basics

1.  Enter a **Name** for the collection (required)
2.  Enter a **Description** for the collection (optional)
3.  Click **Next** to move to the **Applications** tab.

![WorkspaceBasics.jpg](/.attachments/AAD-Authentication/184114/WorkspaceBasics.jpg)

### Applications

1.  Click **Add application** to launch the applications object picker
2.  Select one or more applications from the object picker and click **Add**.
3.  If more than one application was added, click the up or down arrow to the right of an application to change the order in which the application appears in the user's view.
4.  Finally, click **Next** to move to the **Users and groups** tab.

### Users and groups

1.  Click **Add users and groups** to launch the users and groups object picker.
2.  Select any combination of users and groups from the object picker and click **Select**.
3.  Assigned users and groups are automatically assigned the **Reader** role.
4.  Expand the drop-down box next to any user or group to assign them the **Owner** role.
5.  Click **Next** to move to the **Review + create** tab.

### Review + create

A summary of the selections is presented. Verify the Collection name and description, along with the selected applications, user and group membership and assigned roles are all correct, then click **Create**.

## Edit Existing Collection Wizard

First, select the collection that needs to be updated.

Next, select the tab that need tab that the change needs to occur under:

  - **Properties** - Changes are allows to the **Name** and **Description**
  - **Applications** - Applications can be added and removed from the list and the order of the list can be modified.
  - **Users and groups** - Users and groups can be added or removed and Role type can be modified for individual members.

Finally, with the correct tab selected, click **Edit properties** to modify the properties of that page and click **Save**.

# User Experience

A user that navigates directly to the new My Applications view at myapplications.microsoft.com will see **All Apps** which contains a list of all **Enterprise applications**. They will also see any Collections that the Collection Owner has assigned to them.

## Collections

If the Administrator creates a Collection and the collection Owner assigned the user to it, that collection will appear to the left of **All Apps**. The order in which applications appear can be controlled by the collection owner.

**IMPORTANT**: Collections do not assign permission to applications. If the user has not been assigned permission to applications that are in the collection, then the collection will be empty in the user's view. If the user has been assigned to some, but not all of the applications in the collection, the user will only see those applications that they have access to.

![WorkspaceUserExperience.jpg](/.attachments/AAD-Authentication/184114/WorkspaceUserExperience.jpg)

## App Management

Users can hover over applications to expose ellipses. Clicking the ellipses exposes a fly-out with these selections:

  - **Copy link** - Allows the user to copy the **User access URL** of the selected application.
  - **Manage your application** - This exposes the user's permissions assigned to the application. Clicking **Revoke Permissions** allows a user to remove their access to the application.

|                             |                                                                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Copy Link                   | ![AppSettings.jpg](/.attachments/AAD-Authentication/184114/AppSettings.jpg)                                    |
| **Manage your application** | ![ManageAppPermissions.jpg](/.attachments/AAD-Authentication/184114/ManageAppPermissions.jpg)] |

Users can click **Add apps > Request** to apps to see all applications that administrators configured for Self service by enabling the _"Allow users to request access to this application"_ setting on. 

# Scenarios

## Create a collection and share with end users

Administrators can create Collections in the Azure Active Directory portal and add Apps to them. They can also Users add Owners to Collections.

## Add/Remove apps to existing collections

Apps can be added to existing collections. Users assigned to the collection will receive an updated list of available applications when they sign into My apps and view the Collection.

## Add/Remove users to an existing collection

Add users to an existing collection and validate the collection shows for end users.

## Add/Remove owners to an existing collection

Add users to an existing collection and validate the collection shows for end users.

## Management operations by Collection Owners

Collection Owners can Edit Collection properties and manage the users that can access the collection from My Apps.

## Delete a collection

Administrators can Delete collections which removes those collections from the user's My Apps page.

## End user view

End users can view all collections shared with them, and the apps those collections contain. End users will only see apps in collections that they have access to.

## Manage preview settings 

Admins can choose to try out new app launcher features while they are in preview. Enabling a preview feature means that the feature is turned on for the organization and will be reflected in the My Apps portal and other app launchers for all users. 

To enable or disable previews for your app launchers: 

- Sign in to the Azure portal as a global administrator, application administrator or cloud application administrator for your directory. 
- Search for and select**Azure Active Directory**, then select**Enterprise applications**. 
- On the left menu, select**App launchers**, then select**Settings**. 
- Under**Preview settings**, toggle the checkboxes for the previews you want to enable or disable. To opt into a preview, toggle the associated checkbox to the checked state. To opt out of a preview, toggle the associated checkbox to the unchecked state. 
- Select**Save**. Wait a few minutes for the changes to take effect. Navigate to the My Apps portal and verify that the preview you enabled or disabled is reflected. 

# FAQ

# Objects and Attributes

Collections are UI constructs stored in Cosmos DB.

# Troubleshooting

At this time there is no service-side tracing available.

## Azure Support Center (ASC)

Currently there is no way to see the Collections info under the **Application** node in ASC. 

The request was submitted to EEE to design the following:

### Applications

  - Selecting Collections tab should list all Collections in the organization. Expanding an individual Collection will show the assigned applications, the assigned users and groups, as well as the roles that have been assigned.
  - Selecting an application will show a Collections tab listing all Collections that the selected application belongs to.

### Users/Groups

  - Selecting a user or group will show a Collections tab listing all Collections that the selected user or group belongs to.

## Jarvis

### Tracing of End-User Actions

Jarvis trace logging can be performed if user's encounter issues when they are viewing their applications in myapplications.microsoft.com by querying the MyApps Namespace using the parameters that are available in this [sample query](https://jarvis-west.dc.ad.msft.net/CF16BCC6):

  - Service URL for Jarvis **Logs**: <https://jarvis-west.dc.ad.msft.net/968B1B7E>
  - **Endpoint**: Diagnostics PROD
  - **Namespace**: MyApps
  - **Events to Search**: IfxDiagnosticsEvent and IfxRequestOperationResults
  - **Time range**: +/- 15 Minutes
  - **Scoping conditions**: Not set
  - **Filtering conditions**: AnyField || contains || UpnOfUser@contoso.com
      - Include "**orderby env\_time**" in the Client Query to sort events by time.

#### Interpret the results

1. Locate the first **Error** from the top under **Log_Level**.
**NOTE**: Ignore the first error if it happens to reference a thumbprint.
2. In this example, the **Log_Message** column shows a call for the **Request to AppManagement** api is failing:

```
Request to AppManagement : Failed,  RawContent , Type GET, RequestUri https://appmanagement.activedirectory.microsoft.com/odata/users/794aab26-####-####-####-############/getAssignedAppTiles, Partner-request-id fcf4ba07-93d5-43c4-9fec-815ceac0a49e
```

3. If present, copy the value of the **Partner-request-id** from the failing api call.
4. Create a [second query](https://jarvis-west.dc.ad.msft.net/90D33137) by removing  the **Filter condition** from the previous query, and replace it with:

 - **Filtering conditions**: AnyField | contains | \<Partner-request-id value>

5. Since the api that is failing is calling AppManagement, the **Namespace** in [the query](https://jarvis-west.dc.ad.msft.net/57244C85) was modified:

  - **Namespace**: AppManagement

6. The result showed one event with an **Action_InternalCorrelationId** that was used in [one last query](https://jarvis-west.dc.ad.msft.net/D78D15F6) to find root cause:

 - **Filtering conditions**: AnyField | contains | \<Action_InternalCorrelationId value>

The results showed an Error where ESTS was failing the sign-in attempt with an error due to Conditional Access requiring MFA and this sign-in was not checked against that CA policy resulting in a failure.

```
Request to https://suite.office.net/api/apps/firstparty?TrackingGuid=4ed52bbf-d72c-49f1-a807-e88b137a091b failed with exception: Microsoft.IdentityModel.Clients.ActiveDirectory.AdalClaimChallengeException: AADSTS50076: Due to a configuration change made by your administrator, or because you moved to a new location, you must use multi-factor authentication to access 'https://suite.office.net'.

Trace ID: 2e286d1c-2695-4bd6-80af-bfdc745a2f00

Correlation ID: 8b2a1857-cef8-45da-9fb4-ff9282b9b0ae

Timestamp: 2020-01-23 00:19:19Z ---> Microsoft.IdentityModel.Clients.ActiveDirectory.AdalServiceException: Response status code does not indicate success: 400 (BadRequest).
```

Examining this sign-in attempt in Logsminer showed a CA policy assigned to this user that included the new Office 365 app group was being enforced and the token that was issued at sign-in was not checked against

#### Fields of interest

| Column Name                   | Example                                                                                                                                                          | Description                                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Action\_SessionId             | 671de0aa-895a-46c9-8b74-f84c65aeaa7f                                                                                                                             | Identifies a particular Session on the service-side where CRUD actions were performed. Useful for narrowing the scope of the trace filter. |
| Action\_ClientRequestId       | 8e0eb73f-113a-4c76-bc18-8e1630910182                                                                                                                             | Client Request ID associated with a CRUD action in a portal blade. Useful for narrowing the scope of the trace filter.                     |
| Action\_InternalCorrelationId | 4b1a3773-f33c-4c1d-9686-101443e50e2d                                                                                                                             | Most useful for narrowing the scope to a specific event in the trace filter.                                                               |
| Caller\_CorrelationId         | f1995f19-562e-4a35-9a29-d2fb1b9e2047                                                                                                                             | Identifies a particular thread of activity within the browser SessionId. Useful for narrowing the scope of the trace filter.               |
| Caller\_SessionId             | 9e6e3581-7408-4591-9505-33512d4a10ad                                                                                                                             | Identifies a particular Browser Session where CRUD actions were performed. Useful for narrowing the scope of the trace filter.             |
| HttpRequestMethod             | GET || POST                                                                                                                                                      | The CRUD action performed on the endpoint                                                                                                  |
| Log\_Level                    | Information || Debug || Error                                                                                                                                    | Indicates the level of service logging and State. Useful for narrowing the scope of the trace filter.                                      |
| Log\_Message                  | Collection d96fcc84-edcd-488c-ae90-34ae54435d4d ExpandAll=False contains 0 apps, 1 owners, 0 usersWithReadPermissions, 0 groupOwners, 1 groupsWithReadPermissions | Provides descriptive results of the CRUD action.                                                                                           |
| RequestUri                    | /api/me/getExpandedAssignedWorkspaces                                                                                                                            | Endpoint called for the CRUD action                                                                                                        |
| Result\_ResultType            | Success or Failure                                                                                                                                               | Response of the CRUD action                                                                                                                |
| Result\_HttpStatusCode        | 200                                                                                                                                                              | [HTTP Status Codes](https://docs.microsoft.com/en-us/windows/win32/wininet/http-status-codes)                                              |

# ICM Path

## Collections Administration

Support engineers working with enterprise customers that encountering potential bugs, or who are requesting a Design Change Request to Application Collections should file an ICM using this template:

<https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=a1zD3S>

TAs that are redirecting these ICMs to the product group should set the service and Team as follows:

**Owning Service**: My Apps

**Owning Team**: My Apps

# Training

**Title:**My Apps Refresh and My Signins (Recent Activity)

**Course ID**: S5667844

**Format:**Self-paced eLearning

**Duration:**42 minutes

**Audience:**Cloud Identity Support Team MSaaS AAD - Authentication Professional and MSaaS AAD - Authentication Premier

**Tool Availability:**October 2, 2019

**Training Completion:**September 30, 2019

**Region**: All regions

**Course Location**:

1. [Login](https://cloudacademy.com/login/) to Cloud Academy (now QA) and click **Log in to your company workspace**.

2. In the *Company subdomain* field, type `microsoft`, then click **Continue**.

3. Launch the [My App Refresh and My Sign-ins](https://cloudacademy.com/resource/my-app-refresh-and-my-sign-ins-1854/?preview=true) course.
