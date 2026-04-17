---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Azure AD Application Instance Lock"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FAzure%20AD%20Application%20Instance%20Lock"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Application Instance Lock

## Feature Overview

Application instance lock is a feature in Azure Active Directory that allows sensitive properties of a **multi-tenant application object** to be locked for modification after the application is provisioned in another tenant.

This provides app developers the ability to lock certain properties if the application doesn't support scenarios that require configuring those properties.

### Default Behavior (as of 2024)

New applications created using Microsoft Graph application API will have **App instance lock** enabled by default. Applications created using the Entra ID portal already have the setting enabled by default.

> ⚠️ Note: This change was delayed from the original March 1, 2024 date.

Reference: https://aka.ms/app-instance-lock

## Why Use This Feature?

**Scenario:**

- Developer creates app in Tenant A
- Application is provisioned in Tenant B
- **Before instance lock**: Tenant admin in Tenant B could add a password credential to Service Principal in Tenant B
- **After instance lock**: Tenant admin in Tenant B **fails** to modify sensitive properties — only the app owner in Tenant A can make changes

## What are Sensitive Properties?

The following property usage scenarios are considered sensitive:

| Property | Usage | Description |
|----------|-------|-------------|
| `keyCredentials`, `passwordCredentials` | `Sign` | SAML flow credential |
| `keyCredentials`, `passwordCredentials` | `Verify` | OIDC client credentials flow |
| `tokenEncryptionKeyId` | N/A | Key for encrypting tokens emitted by Azure AD |

## Configurable Sensitive Properties

| Field | Description |
|-------|-------------|
| **Enable property lock** | Specifies if the property locks are enabled |
| **All properties** | Locks all sensitive properties |
| **Credentials used for verification** | Locks `keyCredentials`/`passwordCredentials` where usage = `verify` |
| **Credentials used for signing tokens** | Locks `keyCredentials`/`passwordCredentials` where usage = `sign` |
| **Token Encryption KeyId** | Locks the ability to change `tokenEncryptionKeyId` |

## How to Configure

See public instructions: https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-configure-app-instance-property-locks

## Troubleshooting

Only the owner of the multi-tenant app can modify locked properties. A consumer of the multi-tenant app must work with the developer/owner to make changes.

### Check Current Configuration via MS Graph

```http
GET /applications/{applicationObjectId}
```

Look for `servicePrincipalLockConfiguration` in the output:

```json
{
  "servicePrincipalLockConfiguration": {
    "isEnabled": true,
    "allProperties": false,
    "credentialsWithUsageVerify": true,
    "credentialsWithUsageSign": false,
    "identifierUris": false,
    "tokenEncryptionKeyId": true
  }
}
```

## Licensing

No additional licensing requirements.

## Prerequisites

- The application must be a multi-tenant app.

## Limitations and Known Issues

No known limitations or issues documented.

## ICM Escalations

- **Owning Service**: AAD Applications
- **Owning Team**: AAD Application model

## External Documentation

- How to configure app instance property lock: https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-configure-app-instance-property-locks
- `servicePrincipalLockConfiguration` resource type: https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipallockconfiguration?view=graph-rest-beta
