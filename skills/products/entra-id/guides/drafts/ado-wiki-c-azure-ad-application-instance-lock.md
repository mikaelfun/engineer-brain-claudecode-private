---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Azure AD Application Instance Lock"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FAzure%20AD%20Application%20Instance%20Lock"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Feature overview

Application instance lock is a feature in Azure Active Directory (Azure AD) that allows sensitive properties of a multi-tenant application object to be locked for modification after the application is provisioned in another tenant. This feature provides application developers with the ability to lock certain properties if the application doesn't support scenarios that require configuring those properties.

## Update March 1, 2024

> ⚠️ **Note: This change has been delayed.** Starting ~~March 1, 2024~~, new applications created using Microsoft Graph application API will have **App instance lock** enabled by default. Applications created using Entra ID portal already have the setting enabled by default. Customers still have control of this setting and can disable if desired.
>
> Reference: https://aka.ms/app-instance-lock

## Why do I need this?

This feature allows app developers to harden security of multi-tenant apps and prevent changes to sensitive properties from external tenants.

**Before:** Tenant admin in Tenant B could add password credential to Service Principal in Tenant B.

**After:** App developer sets restriction in Tenant A → Tenant admin in Tenant B fails to modify sensitive properties.

## What are sensitive properties?

- Credentials (`keyCredentials`, `passwordCredentials`) where usage type is `Sign` (SAML flow)
- Credentials (`keyCredentials`, `passwordCredentials`) where usage type is `Verify` (OIDC client credentials)
- `TokenEncryptionKeyId` — key for token encryption

# Licensing

No additional licensing requirements.

# Prerequisites

Requires a multi-tenant app.

# Limitations and known issues

No known limitations or issues.

# How to configure and manage

See public docs: https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-configure-app-instance-property-locks

## Configurable sensitive properties

| Field | Description |
|-------|-------------|
| **Enable property lock** | Specifies if property locks are enabled |
| **All properties** | Locks all sensitive properties |
| **Credentials used for verification** | Locks `keyCredentials`/`passwordCredentials` with usage=`verify` |
| **Credentials used for signing tokens** | Locks `keyCredentials`/`passwordCredentials` with usage=`sign` |
| **Token Encryption KeyId** | Locks the `tokenEncryptionKeyId` property |

# Troubleshooting

Only the **owner** of the multi-tenant app can modify locked properties. Consumers must work with the developer/owner.

## Check if feature is enabled via MS Graph

```
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

## ICM escalations

- Owning Service: AAD Applications
- Owning Team: AAD Application model

# External documentation

- https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-configure-app-instance-property-locks
- servicePrincipalLockConfiguration resource type: https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipallockconfiguration?view=graph-rest-beta
