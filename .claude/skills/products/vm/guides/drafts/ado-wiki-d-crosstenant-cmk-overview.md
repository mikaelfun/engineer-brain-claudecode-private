---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Server Side Encryption (SSE)/Cross Tenant CMK/CrossTenant CMK Overview_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FServer%20Side%20Encryption%20(SSE)%2FCross%20Tenant%20CMK%2FCrossTenant%20CMK%20Overview_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Cross-Tenant CMK Overview for Managed Disks

## Overview

Build a solution where managed disks are encrypted with customer-managed keys using Azure Key Vaults stored in a different Azure AD tenant. Ideal for SaaS service providers offering bring-your-own encryption keys.

## Architecture

- **Tenant1** (service provider): Hosts Azure platform services, multi-tenant app registration, user-assigned managed identity
- **Tenant2** (customer): Hosts Key Vault with CMK encryption key

Service provider creates multi-tenant app with federated identity credential (user-assigned MI). Customer installs the app and grants Key Vault access.

## Prerequisites

- Install latest Azure PowerShell module
- Register preview feature: `Register-AzProviderFeature -FeatureName "AllowAADAuthForDataAccess" -ProviderNamespace "Microsoft.Compute"`

## Limitations

- First release preview only available in West Central US
- Does not support Ultra Disks or Azure Premium SSD v2

## Support Boundaries

| Scenario | Supporting Team |
|----------|----------------|
| DES management for CMK | VM POD |
| Multi-tenant AAD App registration | Authentication - Application Experiences |
| Federated identity credential config | Authentication - Application Experiences |
| User-assigned MI create/delete | Account Management - User Management |
| RBAC role assignment | Account Management - User Management |
| Key Vault management | Security team |

## Setup Phases

### Phase 1: Service Provider Configures Identities
1. Create multi-tenant Azure AD app registration (note app ID)
2. Create user-assigned managed identity
3. Configure MI as federated identity credential on app
4. Share app name and ID with customer

### Phase 2: Customer Authorizes Key Vault
1. Install service provider's app in customer tenant
2. Grant service principal Key Vault access
3. Store CMK in Key Vault
4. Share key URL with service provider

### Phase 3: Encrypt Resources
Service provider creates DES with cross-tenant CMK configuration using app ID, MI, and key URL.

Detailed steps: https://docs.microsoft.com/en-us/azure/virtual-machines/disks-cross-tenant-cmk
