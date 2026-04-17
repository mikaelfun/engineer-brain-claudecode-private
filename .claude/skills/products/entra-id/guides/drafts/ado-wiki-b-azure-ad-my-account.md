---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD User Management/Azure AD My Account"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20User%20Management/Azure%20AD%20My%20Account"
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
- My Account
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [Entra](/Tags/Entra) [EntraID](/Tags/EntraID) [comm-objprinmgt](/Tags/comm%2Dobjprinmgt) [User-Management](/Tags/User%2DManagement)                   
 


[[_TOC_]]

# Product group
Program Manager: Mohit Bhargava

Engineering Manager: Justin Niles

# Summary

## What is My Account?
My Account (https://myaccount.microsoft.com) is a unified account management experience that allows end users to manage their work or school (AAD) account. This account experience is replacing a previous Profile experience (https://account.activedirectory.windowsazure.com/r#/profile). 

End user personas include:
- Information workers
- Students
- Managers
- Admins 

From My Account users can:
- Manage their **Security info** (for MFA / 2-factor authentication and SSPR)
- Reset their **Password** 
- Manage their connected **Devices** by:
    - Disabling lost/inactive devices
    - Retrieving Bitlocker recovery keys
- Manage their guest account access to any other **Organizations** they work with
- Editing their **Language and Region settings**
- Manage their **Privacy** by:
    - Viewing any privacy documents their Organization had them agree to
    - Revoking LinkedIn permissions if their organizational account is connected to their LinkedIn account
- Access **My sign-ins** (if participating in the preview)
- Access Office **Installs** and Office **Subscriptions** from My Account (if assigned an Office license)

## Who can access My Account and how?
My Account is accessible to anyone with an AAD account via the following two methods:
- Knowledge of the My Account URL
- Selecting the **View account** link in the account manager of any new My* experience (i.e. My Apps, My Groups, My Access). 
- The **View account** link of any account manager ("Me Control") in any enterprise Microsoft app or service

## When is the old Profile page getting deprecated?
As mentioned, My Account is replacing the previously offered Profile experience (https://account.activedirectory.windowsazure.com/r#/profile). We are working on migrating customers from the Profile experience to My Account. This migration effort aligns with the migration effort to move customers from the old Apps to new My Apps experience. Starting **August 31st 2020 (updated from July 20th 2020) users will no longer be able to access the previous Profile experience and will be automatically redirected to My Account**. We are encouraging customers to transition their end users to My Account before the August date and have communicated the timeline vie M365 message center, Azure Portal service notifications, and other partner outreach.

**Note:** Please note that this timeline applies to the Public and Gov clouds. We will be deploying the new My Apps and My Account to Mooncake by end of July 2020 and thus their timeline will be adjusted by a month and users will no longer be able to access the current Profile site starting September 30th, 2020.


## How does My Account relate to the Office account portal?
Currently Office offers its own account page to commercial end-users. This means that any user with an Office license has two account pages available to them. The Azure AD My Account team is in the works of integrating with the Office account page by transferring the front-end UX of the Office account features into the AAD My Account experience. Eventually the AAD My Account experience will be the single unified account site for commercial end users.

### Integration timeline
| **When**              | **What**                                                                                                                             |
| ----------------------|--------------------------------------------------------------------------------------------------------------------------------------| 
| Mid-December 2019 (Done) | My Account will GA and have parity with the Office account page (a few deep links to Office account page content.                    |
| End of June 2020 (Done)  | The account manager 'View account' link in in all Microsoft apps and services will update to point to the AAD My Account experience|
| End of July 2020 (IP)    | The 'Contact Preferences' feature on the 'Security & Privacy page' in Office My Account will transition to AAD My Account
| End of FY21 H1     | The remaining front-end UX of Office account features (App installs, Subscriptions, Tools & add-ins, App permissions) will transition to My Account   |
| TBD     | Office will deprecate their account portal|                                                     

# Support Boundaries
While the Office account page integrates with the Azure AD account experience, users may experience some confusion between the two sites. Users who are used to accessing one particular account site may land on the one they are less familiar with since:
- AAD My Account will have links that direct users to the Office account page
- The account manager 'View account' link in Office sites will point to AAD My Account

As a result, if end users or admins notice an issue on either site there may be confusion about specifically where the issue is and how it should be reported. In a perfect world issues would be routed like so:
- Issue with the AAD end user account page -> Ticket submitted through Azure Portal
- Issue with the Office account page -> Ticket submitted through  the M365 Admin Center

If admins are used to operating from one admin center/portal they will likely fail to go to the correct place to submit a ticket. Due to this <font color="red">**it'll be super important that you identify which account site has the issue so the correct support team can address it.**</font> Here are some details specific to both pages that you can ask about:
| **Account page**      |**URL base**                           |**Left navigation content**                                                                   |
| ----------------------|---------------------------------------|----------------------------------------------------------------------------------------------| 
| AAD My Account        | https://myaccount.microsoft.com/ (could also be myworkaccount.microsoft.com or myprofile.microsoft.com)|Overview, Security Info, Devices, Password, Organizations, Privacy, My sign-ins (maybe)       |
| Office account page   | https://portal.office.com/account/    |My Account, Personal Info, Subscriptions, Security & Privacy, App permissions, Apps & devices |

## Support routing
For both account sites, each specific page/feature has different support coverage. If you are working on an issue that seems out of scope, use either table below to figure out which support team you should forward the issue to:

**AAD My Account**
| **Page**         |**Corresponding support team(s)**                                                                                                   |
| -----------------|------------------------------------------------------------------------------------------------------------------------------------|
| Overview         | [MSaaS AAD - Account Management Professional](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2Fce0b7553-9d09-e711-8121-002dd815174c&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977313754%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=5V7e82EIU3xZj3%2BMmOiekZbrhlCArppIeGhV7XN0PTk%3D&reserved=0) and [MSaaS AAD - Account Management Premier](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2F6014a8ba-465c-e711-8129-001dd8b72a0c&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977323750%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=sUjp8A6K7CUMuxvCsE%2BgynIt%2FXQR%2FYC3pqQdE0k4nJg%3D&reserved=0) |
| Security Info    | [MSaaS AAD - Authentication Professional](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2Fdc834c65-9d09-e711-811f-002dd8151752&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977323750%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=KR9n0UkgoYlQaEj0T9uzB4akNKMLV4W7isvsK%2FrhOYw%3D&reserved=0) and [MSaaS AAD - Authentication Premier](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2F5b6689e1-465c-e711-812a-002dd8151751&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977333741%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=Zck4BHnpGS8Ep23MaIp%2FkSAx5%2FQULUEqN8jDerdyQqE%3D&reserved=0) |
| Devices          | [MSaaS AAD - Authentication Professional](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2Fdc834c65-9d09-e711-811f-002dd8151752&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977333741%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=ODbvTrju4w%2B09AQmKyX2Kk8Aw0SuERJ9H%2BI40aSB4F8%3D&reserved=0) and [MSaaS AAD - Authentication Premier](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2F5b6689e1-465c-e711-812a-002dd8151751&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977343738%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=W9g9Vwo9OZsJ9%2FV%2Ffyz4lruzhAUztkymQN8UUkuaUvI%3D&reserved=0) |
| Password         | [MSaaS AAD - Account Management Professional](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2Fce0b7553-9d09-e711-8121-002dd815174c&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977343738%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=wpCxBAIl9ktiBxFPIVIWsPCZMeGMOZt9Ts8Y%2FoU%2FA88%3D&reserved=0) and [MSaaS AAD - Account Management Premier](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2F6014a8ba-465c-e711-8129-001dd8b72a0c&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977353734%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=udyXnPffgvCQSuaEkC3kys05KOwrTeQO543X3kd7%2FjM%3D&reserved=0) |
| Organizations    | [MSaaS AAD - Account Management Professional](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2Fce0b7553-9d09-e711-8121-002dd815174c&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977353734%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=%2FWJmu%2Bw%2FZG4w%2FknhrSurRcoKwyQ28dv8aCOJUNjy9fk%3D&reserved=0) and [MSaaS AAD - Account Management Premier](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2F6014a8ba-465c-e711-8129-001dd8b72a0c&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977363728%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=hePAMkRL0iRnfDb1JtzaRhivZzxS2OPQ9pPTlLETjY0%3D&reserved=0) |
| Privacy          | [MSaaS AAD - Authentication Professional](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2Fdc834c65-9d09-e711-811f-002dd8151752&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977363728%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=jxxTtua4VHQjCiui2%2FCKCf8qOxtHApY8gjlpB%2FCOzeg%3D&reserved=0) and [MSaaS AAD - Authentication Premier](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2F5b6689e1-465c-e711-812a-002dd8151751&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977373720%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=TW84un0ANTUnXktVQ6p60TTrBFG2GTrw05M2P3uYRzM%3D&reserved=0) |
| My sign-ins      | [MSaaS AAD - Account Management Professional](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2Fce0b7553-9d09-e711-8121-002dd815174c&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977383716%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=SrGCDHpXDo24BeJmWQEmUezhf4OaUBEpKpLV6oWKPnU%3D&reserved=0) and [MSaaS AAD - Account Management Premier](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2F6014a8ba-465c-e711-8129-001dd8b72a0c&data=04%7C01%7CJulija.Pettere%40microsoft.com%7C3404f14ecba2409e46fe08d76ed770ce%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637099743977383716%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=J8QW8LIrWUOMQGdQIXg7fYOYWqyXuyjblgqGCNX8vkY%3D&reserved=0)  |
| My Applications (via drop down)| [MSaaS AAD - Authentication Professional](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2Fdc834c65-9d09-e711-811f-002dd8151752&data=04%7C01%7CJulija.Pettere%40microsoft.com%7Cb87aaf27213047fb887008d76f855d19%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637100491228980313%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=imNdLpoKM78Je2EDGA8fCMmKclDliwjMQU7ZAR1uvsY%3D&reserved=0) and [MSaaS AAD - Authentication Premier](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2F5b6689e1-465c-e711-812a-002dd8151751&data=04%7C01%7CJulija.Pettere%40microsoft.com%7Cb87aaf27213047fb887008d76f855d19%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637100491228980313%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=X6nn3Uzgnx2ocYA65LUcoKzo%2F%2FH04v9HZpPvnlQhMFM%3D&reserved=0) |
| My Groups (via drop down)      |[MSaaS AAD - Account Management Professional](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2Fce0b7553-9d09-e711-8121-002dd815174c&data=04%7C01%7CJulija.Pettere%40microsoft.com%7Cb87aaf27213047fb887008d76f855d19%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637100491228990316%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=hliDFBdorxTKPRl%2BjM%2BbURIk17YdRdrQxf%2F%2F0ukQOk8%3D&reserved=0) and [MSaaS AAD - Account Management Premier](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsaas.support.microsoft.com%2Fqueue%2F6014a8ba-465c-e711-8129-001dd8b72a0c&data=04%7C01%7CJulija.Pettere%40microsoft.com%7Cb87aaf27213047fb887008d76f855d19%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637100491228990316%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=Yh6QLgP2dV81trG58ChR11QkZumpq2BeD%2FhYjoTMelQ%3D&reserved=0)|


**Office account page**
| **Page**         | **Corresponding support team(s)** |
|------------------|-----------------------------------|
| My Account       | [Enterprise Cloud Identity](https://internal.evergreen.microsoft.com/topic/4520394)|
| Personal Info    | [Enterprise Cloud Identity](https://internal.evergreen.microsoft.com/topic/4520394) |
| Subscriptions    | [Enterprise Cloud Identity](https://internal.evergreen.microsoft.com/topic/4520394) OR [Enterprise Commerse](https://internal.evergreen.microsoft.com/topic/4052394) |
| Security & Privacy | [Enterprise Cloud Identity](https://internal.evergreen.microsoft.com/topic/4520394) |
| App permissions  | [Enterprise Cloud Identity](https://internal.evergreen.microsoft.com/topic/4520394) *Consult cases requested as many App permissions issues are Azure related*|
| Apps & Devices  | [Enterprise Office Install Setup](https://internal.evergreen.microsoft.com/topic/2723557) |
| Tools & add-ins | [Enterprise Office Install Setup](https://internal.evergreen.microsoft.com/topic/2723557) |

# User Managed Profile Photo

On November 13, 2024, received the ability to update their profile photo directly from their [MyAccount](https://myaccount.microsoft.com) portal. This change exposes a new edit button on the profile photo section of the user's account.

![ChangePhoto](/.attachments/AAD-Account-Management/258739/ChangePhoto.jpg)

When the user clicks the **Change your profile photo** button the *Change photo* wizard opens and lets the user upload a photo. This view also allows the user to Zoom, Rotate and Remove their photo before clicking **Save**.

![EditPhoto](/.attachments/AAD-Account-Management/258739/EditPhoto.jpg)

In some environments, it's necessary to prevent users from making this change. Global administrators can manage this using a tenant-wide policy with Microsoft Graph API, following the guidance in the [Manage user profile photo settings in Microsoft 365](https://learn.microsoft.com/graph/profilephoto-configure-settings) document. Eventually, this policy will also be configurable from the M365 Admin Center.

**Note**: When the user profile photo policy is updated, it can take up to 24 hours for the changes to propagate. For example, if updates to the cloud user profile photo are blocked, it can take up to 24 hours for users to be blocked from making updates.

## Manage the Photo Edit Policy

1.	Navigate to [Microsoft Graph Explorer](https://aka.ms/ge) and sign-in in the top right corner.

2.	Click the **Modify permissions** tab, search for these permissions and click **Consent**:

- `PeopleSettings.Read.All`

- `PeopleSettings.ReadWrite.All`

### View the Photo Edit Policy

**Method**: `GET`

**URL**: `https://graph.microsoft.com/beta/admin/people/photoUpdateSettings`

### Edit the Photo Edit Policy

In the request body, the `"source"` section of the photo editing policy has two properties:

- `"source"` support two settings:

   - `"cloud"`: Indicates only cloud edits can be performed and on-prem synced changes are disabled.

   Example: An Exchange Admin can update a photo of a user in the on-premises directory, but that photo will not be synched to the cloud version of that user account. The user can go to MyAccess and change their profile photo, unless `"allowedRoles"` is populated with the User and/or Global administrator role. If `"allowedRoles"` is populated with roles and the user is not in that role they will not have the ability to edit the cloud version of their synced account.

   - `"onPremises"`: Indicates only on-prem edits can be performed and cloud edits are disabled.

   Example: An Exchange Admin can update a photo of a user in the on-premises directory and that photo will synch to the cloud version of that user account. The user can go to MyAccess and they are not able to change their profile photo on the cloud version of their synced account.

   **Note**: If "source" is left as 'null' both on-premises and cloud updates are allowed and the last writer wins.

-	`"allowedRoles"` This supports role [Template IDs](https://learn.microsoft.com/graph/api/intune-rbac-roledefinition-list?view=graph-rest-1.0&tabs=http) of the User Administrator and/or Global Administrator roles that are allowed to perform edit operations. This is optional.

**Method**: `PATCH`

**URL**: `https://graph.microsoft.com/beta/admin/people/photoUpdateSettings`

**Request body**:

```json
{ 
  "source": "cloud", 
  "allowedRoles": [
      "62e90394-69f5-4237-9190-012177145e10","fe930be7-5e62-47db-91af-98c3a49a38b1"] 
}
```

### Delete the Photo Edit Policy

Deleting the policy sets the source to `"null"` and all users will be able to edit their profile photo.

**Method**: `DELETE`

**URL**: `https://graph.microsoft.com/beta/admin/people/photoUpdateSettings`

## Photo Edit Policy Enforcement

When the policy is set to `"onPremises"`, cloud user accounts will not see the *edit* button and will see the message *You can't update your photo right now* when mousing over their account. Similarly, when the policy is set to `"cloud"`, user accounts synchronized from on-premises will not see the edit button and will see the same message when mousing over their account. 

![BlockEditPhoto](/.attachments/AAD-Account-Management/258739/BlockEditPhoto.jpg)

## Azure Support Center (ASC)

DXP request [3086434](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/3086434) was submitted to add a new anchor called **Photo Edit Policy** to the **Properties** tab on the tenant in ASC. This will show the **Edit Source** which can be "cloud", "onprem", or 'null'. It will also show the optional **Allowed roles**, which contains a list of roleDefinition IDs that can manage photos.

Until DXP Graph Permission request [3086430](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/3086430) is complete, there is no way to view the policy configuration in ASC.

**Note**: roleDefinition IDs can be resolved to their friendly names in ASC under **Directory Roles** > **Role Definitions**. 

# Known issues and limitations

## Issue \#0: Unsupported role for cloud photo update settings

When an administrator attempts to perform a PATCH operation on the cloud photo policy `/beta/admin/people/photoUpdateSettings` they receive this error if they have unsupported role TemplateIDs in the `"allowedRoles"` section. Only Global Administrator and User Administrator can be added to this `"allowedRoles"` section.

```json
{
    "error": {
        "code": "UnknownError",
        "message": "{\r\n    \"error\": {\r\n        \"code\": \"400\",\r\n        \"message\": \"\",\r\n        \"innerError\": {\r\n            \"peopleAdminErrorCode\": \"PeopleAdminValidationFailure\",\r\n            \"peopleAdminValidationError\": \"{\"AllowedRoles\":[\"Unsupported role for cloud photo update settings.\"]}\",\r\n            \"peopleAdminRequestId\": \"9d716cea-12d7-7ac9-bf9b-2816018a6adc\",\r\n            \"peopleAdminClientRequestId\": \"b16e93de-2c21-f5f7-84b8-685ed9657aa0\",\r\n            \"date\": \"2024-11-21T16:31:03.6070114Z\"\r\n        }\r\n     }\r\n }",
        "innerError": {
            "date": "2024-11-21T16:31:03",
            "request-id": "68c75d14-06f5-4ee8-a5d0-fb9cca83e88a",
            "client-request-id": "b16e93de-2c21-f5f7-84b8-685ed9657aa0"
        }
    }
}
```

## Solution \#0: Unsupported role for cloud photo update settings

Only the Global administrator ["62e90394-69f5-4237-9190-012177145e10"] and User administrator ["fe930be7-5e62-47db-91af-98c3a49a38b1"] roles are supported.

## Issue \#1: Users may see either one or two links on the Security Info card on the My Account Overview page
Based on whether a user is a part of a tenant where the admin has or has not enabled converged registration, they may see one or two links on the Security Info card.

## Solution \#1: 
Whether a user sees one or two links, both experiences are perfectly normal. The difference is based on whether or not the user is enabled for the converged registration preview. The two cases are:
- A user is enabled for converged registration, and thus  will only see one link titled **Update info**
- A user is not enabled for converged registration, and thus will see two links titled **Set up self-service password reset** and **Additional security verification**

---
## Issue \#2: My sign-ins has a slightly separate look and feel from My Account
A user might find it confusing that navigating to My sign-ins takes them to a site with a different URL and has a slightly different look and feel from My Account (aka the header and left nav look different)

## Solution \#2:
This is normal. My sign-ins was initially built out as a separate application and the team is planning on pulling it under My Account. Once that happens, it will have the same, consistent header and left navigation.

---
## Issue \#3: User revoked their LinkedIn permissions in My Account, but cannot re-allow the permissions 
If a user selects **Revoke all permissions** under **Privacy** > **LinkedIn** then they will no longer see LinkedIn listed under their connected services.

## Solution \#3:
LinkedIn permissions can only be revoked, not set, in My Account. If a user would like to [re]connect their LinkedIn account with their work account they should follow the instructions [here](https://support.office.com/article/connect-your-linkedin-and-work-or-school-accounts-c7c245f2-fa56-4c9b-ba20-3fceb23c5772?ui=en-US&rs=en-US&ad=US).

---

## Issue \#4: Roles should be passed only for cloud photo update settings

Attempting to add the Global administrator ["62e90394-69f5-4237-9190-012177145e10"] and/or User administrator ["fe930be7-5e62-47db-91af-98c3a49a38b1"] roles to the `"allowedRoles"` section will fail with Error code 400 with an `"innerError"` of `"peopleAdminErrorCode\": \"PeopleAdminValidationFailure\",\r\n            \"peopleAdminValidationError\": \"{\"Source\":[\"Roles should be passed only for cloud photo update settings.\"`.

```json
{
    "error": {
        "code": "UnknownError",
        "message": "{\r\n    \"error\": {\r\n        \"code\": \"400\",\r\n        \"message\": \"\",\r\n        \"innerError\": {\r\n            \"peopleAdminErrorCode\": \"PeopleAdminValidationFailure\",\r\n            \"peopleAdminValidationError\": \"{\"Source\":[\"Roles should be passed only for cloud photo update settings.\"]}\",\r\n            \"peopleAdminRequestId\": \"30512a0c-e2c9-5253-bc74-0e676f1d425b\",\r\n            \"peopleAdminClientRequestId\": \"003978ef-67e3-4645-a9dc-a5a6e8d0a097\",\r\n            \"date\": \"2025-01-22T16:57:39.0864468Z\"\r\n        }\r\n     }\r\n }",
        "innerError": {
            "date": "2025-01-22T16:57:39",
            "request-id": "41bc67ca-462c-4733-921a-97374c93641a",
            "client-request-id": "003978ef-67e3-4645-a9dc-a5a6e8d0a097"
        }
    }
}
```

## Solution \#4:

When the `"source"` is set to `"onPremises"` the `"allowedRoles"` section must be null.

---

# Public documentation

- [Manage user profile photo settings in Microsoft 365 by using Microsoft Graph](https://learn.microsoft.com/graph/profilephoto-configure-settings)

- [My Account portal for work or school accounts](https://support.microsoft.com/account-billing/my-account-portal-for-work-or-school-accounts-eab41bfe-3b9e-441e-82be-1f6e568d65fd)

- [photoUpdateSettings resource type](https://learn.microsoft.com/graph/api/resources/photoupdatesettings?view=graph-rest-beta)

# Administration Experience
## Enabling Users to access My Account from the new My Apps
1. A Global Administrator should navigate to **Azure Active Directory** > **Users** > **User Settings** > **Manage user feature preview settings**.
2. Enable the **Users can use preview features for My Apps** option.
    1. Choose **All** to enable this for all users, or
    2. Choose **Selected** and pick a single group of users that will participate in the preview.
![image.png](/.attachments/image-b4733738-d964-47e7-9347-9f8abe8b5b07.png)

# End User Experience
There are several actions a user can take in My Account. Each of these actions has corresponding end-user documentation:
- [Set up Security info from a sign-in page](https://support.microsoft.com/account-billing/set-up-security-info-from-a-sign-in-page-28180870-c256-4ebf-8bd7-5335571bf9a8)
- [Change your work or school account password](https://support.microsoft.com/account-billing/change-your-work-or-school-account-password-97fced88-e0e7-4d7b-a9d3-936a3dcbd569)
- [Manage your work or school account connected devices from the Devices page](https://support.microsoft.com/account-billing/manage-your-work-or-school-account-connected-devices-from-the-devices-page-6b5a735d-0a7f-4e94-8cfd-f5da6bc13d4e)
- [Manage organizations for a work or school account in the My Account portal](https://support.microsoft.com/account-billing/manage-organizations-for-a-work-or-school-account-in-the-my-account-portal-a9b65a70-fec5-4a1a-8e00-09f99ebdea17)
- [View how your organization uses your privacy-related data](https://support.microsoft.com/account-billing/view-how-your-organization-uses-your-privacy-related-data-32056182-6eb7-423b-af35-4cc8a192bde8)
- [View your work or school account sign-in activity from My Sign-ins](https://support.microsoft.com/account-billing/view-your-work-or-school-account-sign-in-activity-from-my-sign-ins-9e7d108c-8e3f-42aa-ac3a-bca892898972)

# Troubleshooting

Capture and send a Fiddler trace of the customer reproducing the issue in My Account, along with a screenshot of the broken UX.

If one user lacks the ability to edit their profile photo, but another user can edit, examine the Response for the call to `https://graph.microsoft.com/beta/me/photo/getAllowedOperations`. If `"allowedOperations": "update,delete"` is present, the user can edit. If `"allowedOperations": ""` is returned, the user cannot edit.

# ICM Path

Myaccount portal issue:

**Owning Service**: `IAM Services`

**Owning Team**: `AAD End User Experiences`

API related issues:

**Owning Service**: `Profile Image API`

**Owning Team**: `ImageAPI`

# Training

**Title**: Brownbag - My Account Refresh + Office account integrations

**Course ID**: S7175824

**Format**: Self-paced eLearning

**Duration**: 24 minutes

**Audience**: Cloud Identity Support Team [MSaaS AAD - Account Management Professional](https://msaas.support.microsoft.com/queue/ce0b7553-9d09-e711-8121-002dd815174c) and [MSaaS AAD - Account Management Premier](https://msaas.support.microsoft.com/queue/6014a8ba-465c-e711-8129-001dd8b72a0c)

**Tool Availability**: December 15, 2019

**Training Completion**: January 15, 2020

**Region**: All regions

**Course Location**: 

1. [Login](https://cloudacademy.com/login/) to Cloud Academy (now QA) and click **Log in to your company workspace**.
2. In the *Company subdomain* field, type `microsoft`, then click **Continue**.
3. Launch the [Brownbag - My Account Refresh + Office integrations](https://cloudacademy.com/resource/brownbag-my-account-refresh-office-integrations-1854/?preview=true) course.


