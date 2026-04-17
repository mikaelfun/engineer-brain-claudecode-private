---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Identity/How Tos/Azure Files Managed Identity Support for SMB HowTo"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Identity%2FHow%20Tos%2FAzure%20Files%20Managed%20Identity%20Support%20for%20SMB%20HowTo"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Files Managed Identity Support for SMB

## Overview

This guide explains how to use managed identities to allow Windows and Linux VMs to access SMB Azure file shares using identity-based authentication with Microsoft Entra ID (preview).

## Why authenticate using a managed identity?

- **Enhanced security:** No dependency on storage account keys
- **Simplified management:** No key rotation required
- **Fine-grained access control:** Role-based access at the identity level
- **Automation friendly:** Easy to integrate with CI/CD pipelines
- **Cost effective:** No extra cost

## System-assigned vs User-assigned Managed Identities

- **System-assigned**: Tied to resource lifecycle, one per resource. Not supported on Linux VMs.
- **User-assigned**: Standalone Azure resource, can be shared across multiple VMs.

## Configure SMB OAuth on Storage Account

Enable the SMB OAuth property on the storage account. Recommended: create a new storage account (cannot have Microsoft Entra Kerberos enabled as identity source).

**Portal**: Enable on the Advanced tab during creation.

**PowerShell (new account)**:
```powershell
New-AzStorageAccount -ResourceGroupName <rg> -Name <name> -SkuName Standard_LRS -Location <region> -EnableSmbOAuth $true
```

**PowerShell (existing account)**:
```powershell
Set-AzStorageAccount -ResourceGroupName <rg> -Name <name> -EnableSmbOAuth $true
```

> If "resource was disallowed by policy" error occurs, retry with:
> `Set-AzStorageAccount -ResourceGroupName <rg> -Name <name> -EnableSmbOAuth $true -AllowBlobPublicAccess $false`

**Create file share**:
```powershell
$storageAccount = Get-AzStorageAccount -ResourceGroupName <rg> -Name <name>
New-AzStorageShare -Name <share-name> -Context $storageAccount.Context
```

## Configure Managed Identity

### Windows

#### Azure VM
1. Create Windows VM (Server 2019+ or any client SKU)
2. Enable managed identity (system-assigned or user-assigned)
3. Assign **Storage File Data SMB MI Admin** RBAC role

#### Non-Azure Windows (on-premises)
1. Onboard to Azure Arc and assign managed identity
2. Assign **Storage File Data SMB MI Admin** RBAC role

### Linux

Requirements: Azure Linux 3.0, Ubuntu 22.04, or Ubuntu 24.04.

> System-assigned managed identities are NOT supported on Linux VMs. Must use user-assigned.

1. Create user-assigned managed identity
2. Navigate to storage account > Access Control (IAM)
3. Add role assignment > **Storage File Data SMB MI Admin**
4. Select Managed identity > choose the user-assigned identity
5. Review + assign
