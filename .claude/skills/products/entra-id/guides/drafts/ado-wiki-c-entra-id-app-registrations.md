---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Entra ID App Registrations"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FEntra%20ID%20App%20Registrations"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Entra ID App Registrations

## Feature Overview

Any application that wants to use the capabilities of Entra ID must first be registered in an Entra ID tenant. See [Quickstart: Register an application with the Microsoft identity platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app).

Users can fully manage their App Registrations using the Entra ID Portal, on the App Registrations blade.

## v1 versus v2 Endpoints

[Comparison of v1 and v2 endpoints](https://docs.microsoft.com/en-us/azure/active-directory/azuread-dev/azure-ad-endpoint-comparison)

### Identify v1 vs v2 apps
- `https://login.microsoftonline.com/common/oauth2/authorize` → **v1**
- `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` → **v2**

### Sign-in Audience

- Starting **March 2024**: new app registrations via MS Graph default signInAudience to **AzureADMyOrg** (previously defaulted to AzureADandPersonalMicrosoftAccount)
- v1.0 endpoint: only work and school accounts (Entra ID)
- v2.0 endpoint: work, school, and personal Microsoft accounts (MSA)

### Scopes vs Resources
- v1: uses `resource` parameter to identify the target API
- v2: uses `scope` parameter with fully qualified scope names (e.g., `https://graph.microsoft.com/directory.read`)

## App Registration Features

### AppId URI (identifierUri) Validation

Since October 2021, all AppId URIs must be part of the verified domain list. This applies only to new apps or when existing apps add new identifier URIs.

Valid api schemes:
- `api://{appId}`
- `api://{tenantId}/{appId}`
- `api://{tenantId}/{string}`
- `api://{string}/{appId}`

Valid https schemes:
- `https://<tenantInitialDomain>.onmicrosoft.com/<string>`
- `https://<verifiedCustomDomain>/<string>`
- `https://<string>.<verifiedCustomDomain>`
- `https://<string>.<verifiedCustomDomain>/<string>`

### Deleted Apps Tab (March 2021)
- View soft deleted apps
- Restore within 30 days
- Permanently delete

**Who can restore?** Owners and global admins (app admins, cloud app admins added later).
**Who can permanently delete?** Owners, global admins, app admins, cloud app admins, hybrid identity admins.

### Certificates and Secrets
- Certificates (recommended over secrets) have finite lifetime - must be monitored and renewed
- Secrets can expire in 1 year, 2 years, or custom
- Federated Credentials enable workload identity federation without managing secrets

### API Permissions
- Microsoft Graph provides a single endpoint to access Office 365, EMS, and Windows 10 data
- Recommend integrating with Microsoft Graph rather than individual APIs

## Case Handling

App Registration is supported by _AAD - Authentication Professional_ and _AAD - Authentication Premier_ support teams.

## ICM Escalation

- Service: AppRegPortal
- Team: AppRegPortal Dev Team
- Template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=T2x2p3

## Training & Documentation

- [Register an application](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Configure app to access web APIs](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-access-web-apis)
- [Configure app to expose web APIs](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis)
- [Modify supported accounts](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-modify-supported-accounts)
- [Remove an application](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-remove-app)
