# Display Azure Disk Encryption Settings on Linux VM

**Source**: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/how-to-display-encryption-settings-with-azure-resource-explorer)

## Overview

When Azure Disk Encryption (ADE) is enabled, encryption settings are stamped on disk or VM objects depending on ADE version.

## Identify ADE Version

Check in Azure Portal: VM > Extensions > AzureDiskEncryptionForLinux:
- Version `0.*` → **dual-pass** (legacy, uses Entra ID) → settings on VM object
- Version `1.*`+ → **single-pass** (current, no Entra ID) → settings on disk object

## View Settings via Azure Portal Resource Explorer

1. Portal > search "Resource Explorer"
2. Navigate to subscription > resource group > disk
3. Check `encryptionSettingsCollection` in JSON:

```json
{
  "encryptionSettingsCollection": {
    "enabled": true,
    "encryptionSettings": [{
      "diskEncryptionKey": {
        "sourceVault": { "id": "/subscriptions/.../vaults/KeyvaultName" },
        "secretUrl": "https://keyvault.vault.azure.net/secrets/..."
      },
      "keyEncryptionKey": {
        "sourceVault": { "id": "/subscriptions/.../vaults/KeyvaultName" },
        "keyUrl": "https://keyvault.vault.azure.net/keys/kek/"
      }
    }],
    "encryptionSettingsVersion": "1.1"
  }
}
```

## Key Fields

| Field | Description |
|-------|-------------|
| `encryptionSettingsCollection.enabled` | True if encryption settings stamped |
| `sourceVault` | Key vault URL used for ADE |
| `secretUrl` | Secret generated during encryption |
| `keyEncryptionKey` | Optional; present if KEK wrapping key used |
| `encryptionSettingsVersion` | 0.* = dual-pass, 1.* = single-pass |

## Also Available via

- [Azure Web Resource Explorer](https://resources.azure.com)
- Azure CLI: `az disk show`

## Key Notes
- Strongly recommended: use single-pass (current) ADE
- 21V (Mooncake): applicable, use Mooncake endpoints for keyvault
