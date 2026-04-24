---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/blobs/authentication/storage-troubleshoot-403-errors
importDate: 2026-04-21
type: guide-draft
---

# Azure Blob Storage 403 Error Comprehensive Troubleshooting Guide

## Authentication Failures

| Error | Common Causes |
|-------|--------------|
| AuthenticationFailed - Signed expiry time | SAS token expired, clock skew, future start time |
| AuthenticationFailed - MAC signature mismatch | Wrong account key, recently regenerated keys, encoding issues |
| AuthenticationFailed - SAS sv not well formed | Invalid SAS format, manual construction errors, version mismatch |
| AuthenticationFailed - signed resource not allowed | Service vs Account SAS scope mismatch |
| KeyBasedAuthenticationNotPermitted | Shared key auth disabled on storage account |

## Authorization Failures

| Error | Common Causes |
|-------|--------------|
| AuthorizationPermissionMismatch | SAS missing required permissions (sp field), insufficient RBAC role |
| AuthorizationServiceMismatch | SAS created for different service type (ss field) |
| AuthorizationFailure | Public network access disabled, IP restrictions, VNet restrictions |

## Diagnostic Checklist

1. **Secure transfer**: Ensure HTTPS if required
2. **Azure RBAC**: Verify correct role (Reader/Contributor/Owner for data)
3. **SAS tokens**: Check expiration, permissions, generation method, version
4. **User delegation SAS**: Confirm required fields (skoid, sktid, skt, ske)
5. **Stored access policies**: Allow 30s propagation delay
6. **ACLs**: Verify principal in ACL, correct permissions, sticky bit
7. **Shared Key**: Check if shared key auth is allowed
8. **Public endpoint**: Firewall rules, service endpoint policies
9. **Private endpoints**: DNS resolution, hub VNet connectivity
10. **Encryption scopes**: Override settings, disabled customer-managed keys
11. **Disabled accounts**: Subscription status, spending limits
12. **Azure Databricks**: Scope roles to resource group/account/container level
