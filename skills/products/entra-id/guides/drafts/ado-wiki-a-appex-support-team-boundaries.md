---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Applications Experiences Support Team Boundaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplications%20Experiences%20Support%20Team%20Boundaries"
importDate: "2026-04-06"
type: troubleshooting-guide
tags:
  - support-boundaries
  - scoping
  - misroute
  - enterprise-app
  - app-registration
  - team-boundaries
---

# Applications Experiences Support Team Boundaries

**Tags**: cw.Entra, cw.comm-appex, SCIM Identity, Scoping

Contact: azidcomm-appex-sme@microsoft.com

[[_TOC_]]

## General Guidelines for All Issues

When engaging the Microsoft Entra ID Applications Experiences team, provide the following:

- AADSTS error message, Correlation ID, and timestamp. (If first-party apps replace errors with their own, App Exp cannot assist — the owning team must review their logs.)
- Expected authentication/authorization protocol (SAML or OAuth 2.0) and flow diagram.
- Documentation followed to integrate the application with Microsoft Entra ID.

---

## Issues Supported by Microsoft Entra ID Application Experiences

### App Registration Issues
- Creating new App Registrations (portal, PowerShell, Graph)
- Managing application object: owners, app roles, replyURI, AppID URI, manifest
- Certificates and client secrets
- Managing API permissions and Admin Consent
- Configuring Optional and group claims
- Publisher verification and publisher domain

### Enterprise Applications Issues
- Adding new Enterprise Applications
- Deleting & Recovering Enterprise Applications (Service Principals)
- Assigning Administrative Roles (Entra ID RBAC) for Enterprise Apps
- Managing Admin & User Consent including Admin Consent Workflow
- SAML Token Signing and Encryption certificate
- Entra ID Enterprise App SSO configuration including Claims & URI config
- ADFS to Entra ID SAML application migration (Entra ID side via migration wizard or manually)
- Enterprise Apps access management (users, groups assignment, owners)

### Additional Support Areas
- Troubleshooting MyApps issues (apps collection, hidden apps, Secure Sign-in Extension, etc.)
- AWS CLI integration application
- Workload identities or Federated Identity Credentials
- Managing Entra ID Access and ID tokens configuration and lifetime
- Investigation of sign-in issues for Enterprise apps and customer-developed applications
- Verified ID (App registration changes, contract issues, credential issues)
- Custom Claims Provider API

---

## Common Misroutes

### Entra External ID Applications Sign-In Issues
Refer to [Entra External ID Scoping Questions and Support Boundaries](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2296149/Entra-External-ID-Scoping-Questions-and-Support-Boundaries) to scope External ID vs. workforce tenant issues.

### First-Party Applications
Issues with First-Party app registration/creation/deletion/disabled status → route to team owning the application.
- Reference: [First Party Applications wiki](/Authentication/Entra-ID-App-Management/First_Party_Applications)

### Managed Identity
System and user assigned Managed Identity for Azure Resources.
- Reference: [Azure AD Managed Identities (MSI)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183967/Azure-AD-Managed-Identities-(MSI)?anchor=support-boundaries)

### M365 First-Party Services (EXO, Outlook, Teams, SPO, Delve)
- Owner: M365 Identity team
- Reference: [Office 365 Identity support boundaries](https://internal.evergreen.microsoft.com/en-us/topic/19353aaa-0190-ec53-133e-253ca6a6c1a2)
- App Exp can engage via collaboration for specific Entra ID auth questions.

### EXO Basic Auth Deprecation
- EXO team owns the case; App Exp engaged for app reg and AADSTS errors only.
- Reference: [POP3, IMAP & SMTP OAuth](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/683519/POP3-IMAP-SMTP-OAuth?anchor=support-boundaries)

### Resource Access Issues (Access Denied / 401 errors after token obtained)
- Owner: team supporting the service/resource
- App Exp can verify API permissions were configured correctly per service team's spec.

### Entra ID Graph API / Microsoft Graph API
- Owner: Entra ID Developers team
- References:
  - [AAD Developer Support Boundaries](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/273780/AAD-Developer-Support-Boundaries)
  - [Microsoft Graph Support Boundaries](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/473410/Microsoft-Graph-Support-Boundaries)

### Applications Provisioning
- Owner: AAD Synchronization vertical
- SAP: Azure / Azure Active Directory User Provisioning and Synchronization

### Service Limits (250 app ownership limit, 1500 role assignments limit)
- Owner: AAD Account Management vertical
- Reference: [Azure AD Object Quotas](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/337011/Azure-AD-Object-Quotas)

### AADSTS700016 - First-Party App Not Found in Directory
- AppId `d1ddf0e4-d672-4dae-b554-9d5bdfd93547` (Intune PowerShell)
- Boundaries:
  - Updating Intune PowerShell Scripts → Intune
  - Intune PowerShell command errors → Intune
  - App Registration & API permission questions → Entra Identity (via collab)
  - AADSTS errors for token acquisition → Entra Identity (via collab)

### Dynamics 365 — Token resource or audience deprecation
- Finance and Operations token without environment URL deprecation → Dynamics team
- SAP: `Dynamics\Dynamics 365 for Finance and Operations\Red Button\Other`
- App Exp can assist with App Reg questions via collab.

### Azure Bot Framework and Copilot Bot (Power Virtual Agents)
- **Copilot Power Virtual Agents Bot**: SAP `Dynamics/Microsoft Copilot Studio/Authentication`; Queue: `MSaaS D365-GE-Power Platform`
  - 1st Party App IDs: Power Virtual Agents `96ff4394-9197-43aa-b393-6a41652e21f8`, Power Virtual Agents Service `9d8f559b-5984-46a4-902a-ad4271e83efa`
- **Azure Bot Service/Web App Bot**: SAP `Azure/Bot Service/Deploying a Virtual Assistant bot/Using Deployment Scripts`; Queue: `OneSupport System Holding`
- App Exp engaged via collab for AADSTS / Admin consent errors only.

### AADSTS700016 — PnP Management Shell (AppId `31359c7f-bd7e-475c-86db-fdb8c937548e`)
- As of 9/9/2024 app was disabled as multitenant; customers must add app to their tenant.
- Owner: SharePoint Online team — SAP `SharePoint/SharePoint Online/Identity and Authentication/App Authentication`
- Reference: [Changes in PnP Management Shell registration](https://pnp.github.io/blog/post/changes-pnp-management-shell-registration/)

### Legacy EXO Token Deprecation (October 2024)
- Legacy EXO deprecation & Nested App Auth → EXO/M365 Identity
- Opt out of Legacy EXO deprecation → EXO
- Enable nested app auth in add-ins → M365 Identity
- MSAL questions → Entra ID Dev team
- API permission questions / adding permissions → Entra ID Auth (App Exp)
- App Registration questions → Entra ID Auth (App Exp)
- Reference: [Outlook legacy tokens deprecation FAQ](https://learn.microsoft.com/en-us/office/dev/add-ins/outlook/faq-nested-app-auth-outlook-legacy-tokens)

### Copilot in Microsoft 365
- App Exp can help with App Registrations that act as identity bridge between agents and Entra ID integrated applications (AADSTS errors).
- Reference: [Support Boundaries for Copilot in M365](https://supportability.visualstudio.com/M365%20Release%20Announcements/_wiki/wikis/M365-Product-Updates.wiki/979099/Support-Boundaries-for-Copilot-in-Microsoft-365)

### Retirement of RBAC Application Impersonation in Exchange Online (MC724116)
- Owner: Exchange Online
- SAP: `Exchange\Exchange Online\Administrator Tasks`
- App Exp assists with App Reg questions via collab.

### Microsoft Power Platform and Azure Logic Apps — HTTP with Microsoft Entra ID Connector
- As of April 2025: preauthorization removed from "HTTP with Microsoft Entra ID (preauthorized) connector" (HttpWithAADApp, AppID `d2ebd3a9-1ada-4480-8b2d-eac162716601`).
- Logic App incidents: `Azure/Logic App/Connectors/Connector Not Listed`
- Power Platform DLP issues: `Dynamics/Power Automate/Administration/Data loss prevention (DLP)`
- Power Platform connector issues: `Dynamics/Power Automate/Connectors/Other standard connectors`
- App Exp helps with general application permissions questions via collab.

### SharePoint Online Add-ins — Azure ACS Retirement
- Azure ACS stops working for new tenants Nov 1, 2024; fully retired April 2, 2026.
- App Exp can only assist with **Manually registering a new application in Azure AD** section.
- Owner: SPO team — SAP `SharePoint\SharePoint Development\App Authentication` or `SharePoint\SharePoint Online\Identity and Authentication\App Authentication`
- References: [Azure ACS retirement in M365](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/retirement-announcement-for-azure-acs)

### Deleting the Tenant (error: some enterprise apps cannot be deleted)
- App Exp: guide customer through [Delete a Microsoft Entra tenant](https://learn.microsoft.com/en-us/entra/identity/users/directory-delete-howto#remove-enterprise-apps-that-you-cant-delete), verify via ASC Object Count Summary.
- If no visible apps/SPs remain but tenant still can't be deleted → Account Management team owns deletion via IcM.
- SAP: `Azure\Microsoft Entra Directories, Domains, and Objects\Directory Management\Problems deleting a directory`

### Workflow Applications Created by SPO
- Owner: SPO team — SAP `SharePoint/SharePoint Online/Workflows and Automation\Workflow 2013`
- Tool: [M365 Assessment Tool in "2013 Workflow" mode](https://pnp.github.io/pnpassessment/workflow/readme.html)

### Users Missing Apps in M365 (Office) Portal
- SAP: `Microsoft 365/Authentication and Access/Sign-In and Passwords/Access issues`
