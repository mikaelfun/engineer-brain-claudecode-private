---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/People Settings: Profile Cards"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FPeople%20Settings%3A%20Profile%20Cards"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.comm-M365ID
- cw.M365
- cw.M365-AdminCenter
---

[**Tags**](/Tags): [M365](/Tags/M365), [M365-AdminCenter](/Tags/M365%2DAdminCenter)

[[_TOC_]]

### Compliance note  

This wiki contains test/lab data only.

# Feature overview  

The [profile card](https://support.microsoft.com/en-au/office/profile-cards-in-microsoft-365-e80f931f-5fc4-4a59-ba6e-c1e35a85b501) in Microsoft 365 shows information about a user in an organization. The information shown on the profile card is stored and maintained by the organization, for example, **Job title** or **Office location**.

Organizations can use the [profileCardProperty](https://learn.microsoft.com/en-us/graph/api/resources/profilecardproperty) resource to show more properties from [Microsoft Entra ID](https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-id) on the profile card for a user in an organization by:

- Making more attributes visible
- Adding custom attributes

More properties display in the **Contact** section of the profile card in Microsoft 365.

You can also [remove](https://learn.microsoft.com/en-us/graph/api/profilecardproperty-delete) custom attributes from profile cards of the organization.

## Properties in profile cards

Properties in profile cards map to attributes in the [Microsoft 365 profile resource](https://learn.microsoft.com/en-us/graph/api/resources/profile?view=graph-rest-beta) and can be populated from various sources, including:

- [Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/fundamentals/how-to-manage-user-profile-info)
- [Organizational data in Microsoft 365](https://learn.microsoft.com/en-us/entra/fundamentals/how-to-manage-user-profile-info)
- [Microsoft 365 Copilot connectors for people data](https://learn.microsoft.com/en-us/graph/peopleconnectors)
- [User-provided details](https://support.microsoft.com/en-gb/office/edit-your-profile-in-microsoft-365-e7056090-56d4-4b81-bb3f-b6af31089ebe)

Read [Build Microsoft 365 Copilot connectors for people data](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/build-connectors-with-people-data) to learn how to ingest people data from external source systems into Microsoft Graph.

### Default properties

Some properties are shown by default on profile cards when data is available. Admins can't hide these properties:

- Name
- Email
- Chat
- Work phone
- Mobile
- Work location
- Company
- Job title
- Department
- Business address

### Optional properties

Admins can choose to show or hide certain properties on the profile cards. They're hidden by default, but admins can configure their visibility by navigating to **Settings > Org settings > People settings > Profile card > Contact info** in the Microsoft 365 admin center.

When enabled, these properties appear in the **Contact** tab of the profile cards in [Microsoft 365 Copilot app](https://www.microsoft365.com/?omkt=en-US) and [People Companion app](https://support.microsoft.com/office/get-started-with-microsoft-365-companions-a27df74a-cc41-4e74-8216-51091dc30194). They're visible to users viewing their own profile and when viewing the profiles of others.

- Division
- Role
- Employee number
- Employee type
- Cost center
- User principal name
- Alias
- Fax
- Street address
- State
- Postal code

## Limitations

- After an admin changes the visibility of these properties, it can take up to 24 hours for changes to be reflected on profile cards.
- If enabled, street address, state, and postal code are shown under the Business address attribute on the cards.
- Hiding a property removes it from profile cards but doesn't delete the underlying data from Microsoft 365 profiles or stop the property from appearing in other Microsoft 365 experiences. To permanently delete the data, admins need to remove it from the source system.

## How to find the source of a property?

Users can learn the source of each property on their profile cards by [exporting their profile card data](https://support.microsoft.com/en-us/office/export-data-from-your-profile-card-d809f83f-c077-4a95-9b6c-4f093305163d#:~:text=Hover over your name or profile photo to,as a JSON file in your Downloads folder.). The export shows source IDs for each property, indicating the system the data comes from. [Learn what each source ID represents](https://learn.microsoft.com/en-us/graph/api/resources/profilesourceannotation?view=graph-rest-beta)

If a source ID doesn't have a known mapping, the data comes from a third-party source. In this case, users should contact their tenant admin to identify the system. Admins can then match the source ID with a connector ID in Microsoft 365 admin center to find the data source.

## Permissions Required

You must be a Global Administrator or a People Administrator to do the tasks in this article. For more information, see [About admin roles](https://learn.microsoft.com/en-us/microsoft-365/admin/add-users/about-admin-roles?view=o365-worldwide).

## Public Resources

- [Enriching and customizing your organization's profile cards](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/customize-profile-cards?view=o365-worldwide)
- [MS Graph API: Profile resource type](https://learn.microsoft.com/en-us/graph/api/resources/profile?view=graph-rest-beta)
- [Microsoft 365 Copilot connectors for people data](https://learn.microsoft.com/en-us/graph/peopleconnectors)
- [Manage people data and related experiences from the Microsoft admin center](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/people-settings-in-microsoft-365-admin-center)
- [Build Microsoft 365 Copilot connectors for people data](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/build-connectors-with-people-data)
- [Manage profile source settings for an organization using the Microsoft Graph API](https://learn.microsoft.com/en-us/graph/profilesource-configure-settings)
- [Microsoft 365 Copilot connectors for people data](https://learn.microsoft.com/en-us/graph/peopleconnectors)
- [Organizational Data in Microsoft 365 attribute reference](https://learn.microsoft.com/en-us/viva/orgdata-attributes)
- [Import and manage your organizational data with a .csv file](https://learn.microsoft.com/en-us/viva/import-orgdata)
- [Import organizational data with Azure Blob Storage Connector](https://learn.microsoft.com/en-us/viva/import-org-data-azure)
- [Import organizational data from SAP SuccessFactors](https://learn.microsoft.com/en-us/viva/import-org-data-success-factors)
- [Import organizational data from Workday](https://learn.microsoft.com/en-us/viva/import-org-data-workday)
- [Import organizational data using API-based import (preview)](https://learn.microsoft.com/en-us/viva/import-org-data-api)
- [How to review the quality of your imported data](https://learn.microsoft.com/en-us/viva/review-quality-imported-data)
- [How to fix validation errors and warnings](https://learn.microsoft.com/en-us/viva/validation-errors-warnings)
- [Map attributes and set access for Microsoft 365, Copilot, and Viva apps](https://learn.microsoft.com/en-us/viva/map-attributes-set-access)
- [Set access policies for Microsoft 365, Microsoft 365 Copilot, and Viva apps](https://learn.microsoft.com/en-us/viva/set-access-policies)

# Support Boundaries

- M365 Cloud ID owns the configuration of the Profile Card.  
- Support for profile data importation is owned by Share Point Online support.
- If a specific app is not showing the correct profile card data, the team that supports that app should drive investigation.
- If all M365 apps are not showing the correct profile card data, the M365 Identity team should should drive investigation.

# IcM Escalations

## Portal Issues

Please use the [ICM Submission Process](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/589927) and select the following ASC escalation template:

**[ID] [M365] [MAC]** - Manage Users, Groups, and Domains
