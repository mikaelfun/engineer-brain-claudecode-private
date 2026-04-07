---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD User Management/Entra Admin Center Edit User Properties for Multiple Users at Once"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20User%20Management/Entra%20Admin%20Center%20Edit%20User%20Properties%20for%20Multiple%20Users%20at%20Once"
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


# Overview
We have released an update to the Users Blade in Entra Admin Center that allows editing specific user attributes in bulk for up to 60 user objects at a time.

This is just a GUI update. No backend API changes have been made. 

# Steps

1. From the "All Users" page in the Entra Admin Center, Administrators can select up to 60 user accounts and then click the �Edit (Preview)� drop down menu or right click on one of the selected users and choose Edit Properties. 

**Edit Dropdown Menu:**

![Entra Admin Center Edit Dropdown Menu](/.attachments/AAD-Account-Management/1971049/Entra-Admin-Center-Edit-Drop-down-Menu.png)

**Right Click Menu:**

![Entra Admin Center Right Click Dropdown Menu](/.attachments/AAD-Account-Management/1971049/Entra-Admin-Center-Right-Click-Menu.png)

2. This will launch the Edit Properties blade. From this blade, administrators will be able to add multiple properties by clicking Edit New Property, The administrator will then be able to define the value for each selected attribute. 

![Entra Admin Center Edit Properties Blade](/.attachments/AAD-Account-Management/1971049/Entra-Admin-Center-Edit-Properties-Blade.png)

Administrators are able to update the following attributes in bulk using this new method:

- City
- Company Name
- Country / Region
- Department
- Employee Hire Date
- Employee Type
- Job Title
- Office Location
- State / Province
- Street Address
- Usage Location
- Zip / Postal Code

# Public Docs
[Add or update a user's profile information and settings in the Microsoft Entra admin center](https://learn.microsoft.com/en-us/entra/fundamentals/how-to-manage-user-profile-info?toc=%2Fentra%2Fidentity%2Fusers%2Ftoc.json&bc=%2Fentra%2Fidentity%2Fusers%2Fbreadcrumb%2Ftoc.json)
