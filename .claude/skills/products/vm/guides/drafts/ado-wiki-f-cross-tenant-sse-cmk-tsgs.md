---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/TSGs/Server Side Encryption (SSE)/Cross Tenant SEE+CMK TSGs_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Encryption%2FTSGs%2FServer%20Side%20Encryption%20(SSE)%2FCross%20Tenant%20SEE%2BCMK%20TSGs_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Cross Tenant SSE+CMK TSGs

## Related TSGs
- SSE+CMK Fails with KeyVaultAccessForbidden
- SSE+CMK Fails with KeyVaultSecretDoesNotExist
- SSE+CMK VM Start Fails with InternalDiskManagementError
- Unexpected Error Processing Disk
- SSE+CMK Disk Encryption Set shows Invalid TenantID

## Cross-Tenant Specific Failure Scenarios

### 1. Customer soft deleted their multi-tenant app
- Error: AADSTS700016 - Application with identifier was not found in the directory
- VM side shows "Internal Server error"
- Recovery: Restore the soft-deleted multi-tenant app in Azure AD

### 2. Customer hard deleted their multi-tenant app
- Same AADSTS700016 error pattern
- Recovery: Recreate the multi-tenant app and reconfigure federated identity

### 3. Customer deleted federated identity credential
- Error: AADSTS7000226 - No federated identity credential policy found on application
- VM fails to start with "Internal Server error"
- Recovery: Recreate the federated identity credential on the application

## Diagnostic Pattern
- VM Start operation fails with InternalOperationError / InternalDiskManagementError
- Inner exception shows AAD token acquisition timeout/failure
- Look for AADSTS error codes in Disk RP error details
