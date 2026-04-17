---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/AFS Manage Identities_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FAFS%20Manage%20Identities_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AFS Managed Identities

## Summary

Managed identities eliminate the need for shared keys (storage account key, SAS keys) to authenticate to Azure Files by utilizing a system- or user-assigned managed identity provided by Microsoft Entra ID.

## Benefits of Managed Identities with Azure File Sync

- Government and enterprise customers with policies blocking the use of shared keys can now utilize Azure File Sync.
- Customers no longer need to worry about regularly rotating their storage account keys.
- Internal teams that use Azure File Sync now comply with security standards and don't need to request an exception to use shared keys.

Managed identities are now enabled by default for all newly created Storage Sync Services. Existing deployments can use the portal or PowerShell to configure managed identities.

When managed identities are configured for an Azure File Sync deployment, system-assigned managed identities are used for the following scenarios:

- Storage Sync Service authentication to Azure file share
- Registered server authentication to Azure file share
- Registered server authentication to Storage Sync Service

## Prerequisites

- You must have a Storage Sync Service deployed with at least one registered server.
- Azure File Sync agent version 19.0.0.0 or later must be installed on the registered server.
- On the storage accounts used by Azure File Sync:
    - You must be a member of the Owner management role or have `Microsoft.Authorization/roleassignments/write` permissions.
    - The "Allow Azure services on the trusted services list to access this storage account" exception must be enabled for preview.
    - "Allow storage account key access" must be enabled for preview. To check this setting, navigate to your storage account and select **Configuration** under the **Settings** section.
- The Az.StorageSync PowerShell module version 2.2.0 or later must be installed on the machine that will be used to configure Azure File Sync to use managed identities.
    - To install the latest Az.StorageSync PowerShell module, run:
    ```powershell
    Install-Module Az.StorageSync -Force -AllowClobber
    ```

## Additional Resources

- [Expected Issues for Managed Identities on Azure File Sync](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/2180201/Expected-Issues-for-Managed-Identities-on-Azure-File-Sync_Storage)
- [How To for a system managed identity on Azure File Sync](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/2180200/How-To-for-a-system-managed-identity-on-Azure-File-Sync_Storage)
