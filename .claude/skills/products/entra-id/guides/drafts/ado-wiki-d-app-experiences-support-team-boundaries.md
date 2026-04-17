---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Applications Experiences Support Team Boundaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Applications%20Experiences%20Support%20Team%20Boundaries"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Applications Experiences Support Team Boundaries

This article explains the support boundaries of the Microsoft Entra ID Application Experiences CSS Support team and common misroutes.

Contact: azidcomm-appex-sme@microsoft.com

## General Guidelines for All Issues

When engaging the Microsoft Entra ID Applications Experiences team, provide:
- AADSTS error message, Correlation ID, and timestamp
- Expected authentication/authorization protocol (SAML or OAuth 2.0) and flow diagram
- Documentation followed to integrate the application or service with Microsoft Entra ID

## Supported Areas

### Microsoft Entra ID Application Registration issues
- Creating new Applications registrations (Portal, PowerShell, Graph)
- Managing application object aspects - owners, application roles, replyURI, AppID URI, manifest
- Certificates and client secrets for app registrations
- Managing API permissions and Admin Consent
- Configuring Optional and group claims
- Publisher verification and publisher domain

### Microsoft Entra ID Enterprise Applications issues
- Adding new Enterprise applications (Portal, PowerShell, Graph)
- Deleting & Recovering Enterprise Applications (Service Principals)
- Assigning Administrative Roles (Microsoft Entra ID RBAC) for Enterprise Apps
- Managing Admin & User Consent including Admin Consent Workflow
- SAML Token Signing and Encryption certificate
- Microsoft Entra ID Enterprise App SSO configuration including Claims & URI config
- ADFS to Microsoft Entra ID SAML application migration (app ready to migrate, issues on AAD side)
- Enterprise Apps access management (users, groups assignment, owners)

### Additional support areas
- MyApps issues (collections, hidden apps, Secure Sign-in Extension, etc.)
- AWS CLI integration application
- Workload identities / Federated Identity Credentials
- Access and ID tokens configuration and lifetime
- Sign-in issues for Enterprise apps / customer-developed applications
- Verified ID (App registration changes, contract issues, credential problems)
- Custom Claims Provider API

## Common Misroutes

### Entra External ID applications sign in issues
→ Check tenant type first. See Entra External ID Scoping Questions wiki.

### First party Applications
→ Owned by the team owning the application. App Exp can collaborate on specific Entra ID topics.

### Managed Identity
→ See Azure AD Managed Identities (MSI) wiki for support boundaries.

### M365 first party services (EXO, Outlook, Teams, SPO, Delve)
→ M365 Identity team. App Exp can collaborate on Entra auth questions.

### EXO basic auth deprecation
→ Exchange Online team owns. App Exp helps with app reg and AADSTS errors via collab.

### Resources access issues (Access denied / 401 after token obtained)
→ Service/resource team owns troubleshooting. App Exp verifies API permissions via collab.

### Entra ID Graph API / Microsoft Graph API
→ Entra ID Developers team. See AAD Developer Support Boundaries and Microsoft Graph Support Boundaries wikis.

### Applications Provisioning
→ AAD Synchronization vertical: Azure / Azure Active Directory User Provisioning and Synchronization.

### Entra Services Limits (250 app ownership, 1500 role assignments)
→ AAD Account Management vertical. See Azure AD Object Quotas wiki.

### AADSTS700016 for PnP Management Shell (AppId: 31359c7f-bd7e-475c-86db-fdb8c937548e)
As of 9/9/2024, the multitenant app was disabled. Customers must register in their own tenant.
- See: https://pnp.github.io/blog/post/changes-pnp-management-shell-registration/
- Route to: SharePoint/SharePoint Online/Identity and Authentication/App Authentication

### AADSTS700016 for Intune PowerShell (AppId: d1ddf0e4-d672-4dae-b554-9d5bdfd93547)
Intune PowerShell scripts need own App Registration.
- Updating scripts → Intune team
- App Registration help → Entra Identity via collab
- AADSTS errors → Entra Identity via collab

### Dynamics 365 token resource deprecation
→ Route to Dynamics\Dynamics 365 for Finance and Operations\Red Button\Other

### Azure Bot Framework and Copilot Bot (Power Virtual Agents)
→ Copilot Power Virtual Agents: Dynamics/Microsoft Copilot Studio/Authentication
→ Azure Bot Service: Azure/Bot Service/Deploying a Virtual Assistant bot/Using Deployment Scripts
→ App Exp can help with AADSTS/admin consent errors via collab

### Copilot in Microsoft 365
→ See Support Boundaries for Copilot in Microsoft 365 wiki. App Exp assists with app registration and AADSTS issues via collab.

### Retirement of RBAC Application Impersonation in Exchange Online
→ Route to Exchange Online: Exchange\Exchange Online\Administrator Tasks

### Microsoft Power Platform and Azure Logic Apps connectors
→ Logic Apps: Azure/Logic App/Connectors/Connector Not Listed
→ Power Platform DLP: Dynamics/Power Automate/Administration/Data loss prevention (DLP)
→ Power Platform Connectors: Dynamics/Power Automate/Connectors/Other standard connectors

### SharePoint Online Add-ins - Azure ACS retirement (April 2026)
→ App Exp assists only with "Manually registering a new application in Azure AD" section via collab
→ Route to: SharePoint\SharePoint Development\App Authentication or SharePoint\SharePoint Online\Identity and Authentication\App Authentication

### Legacy EXO token deprecation (Nested App Auth)
→ EXO/M365 Identity owns. App Exp helps with API permissions and app registration via collab.

### Deleting the tenant (unable to delete due to enterprise applications)
→ Follow https://learn.microsoft.com/en-us/entra/identity/users/directory-delete-howto
→ Verify apps via ASC. If no apps visible → Account Management team owns.
→ SAP: Azure\Microsoft Entra Directories, Domains, and Objects\Directory Management\Problems deleting a directory

### Workflow applications created by SPO
→ SharePoint/SharePoint Online/Workflows and Automation\Workflow 2013

### Users missing apps in M365 Portal
→ M365/Admin portal: Microsoft 365/Authentication and Access/Sign-In and Passwords/Access issues
