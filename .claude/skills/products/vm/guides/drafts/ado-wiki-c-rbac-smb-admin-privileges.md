---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Identity/How Tos/How to assign RBAC roles for SMB admin privileges Azure Files_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Identity%2FHow%20Tos%2FHow%20to%20assign%20RBAC%20roles%20for%20SMB%20admin%20privileges%20Azure%20Files_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Assign New RBAC Roles for SMB Admin Privileges in Azure Files

## Summary

Guide for assigning two new RBAC roles for enabling SMB admin privileges in Azure Files using Azure Portal, PowerShell, and Azure CLI.

## New SMB RBAC Roles

### 1. Storage File Data SMB Take Ownership
- Allows end users to assume ownership of a file or directory.
- Data Action: `Microsoft.Storage/storageAccounts/fileServices/takeOwnership/action`

### 2. Storage File Data SMB Admin
- Provides admin-level access equivalent to storage account key for SMB.
- Data Actions:
  - `fileshares/files/read`, `write`, `delete`
  - `fileshares/files/modifypermissions/action`
  - `readFileBackupSemantics/action`
  - `writeFileBackupSemantics/action`
  - `takeOwnership/action`

## Assign via Azure Portal

1. Sign in to portal.azure.com
2. Navigate to scope (Subscription/RG/Storage Account)
3. Select Access control (IAM) > Add > Add role assignment
4. Choose role: Storage File Data SMB Take Ownership or Storage File Data SMB Admin
5. Select member (user, group, or managed identity)
6. Review + assign

## Assign via PowerShell

```powershell
# Get Object ID
$user = Get-AzADUser -DisplayName "<UserName>"
$objectId = $user.Id

# Assign Role
New-AzRoleAssignment `
  -ObjectId $objectId `
  -RoleDefinitionName "Storage File Data SMB Admin" `
  -Scope "/subscriptions/<subId>/resourceGroups/<rgName>/providers/Microsoft.Storage/storageAccounts/<accountName>"
```

## Assign via Azure CLI

```bash
# Get Object ID
az ad user show --id <userPrincipalName> --query id --output tsv

# Assign Role
az role assignment create \
  --assignee <objectId> \
  --role "Storage File Data SMB Admin" \
  --scope "/subscriptions/<subId>/resourceGroups/<rgName>/providers/Microsoft.Storage/storageAccounts/<accountName>"
```

## Validation

**PowerShell:**
```powershell
Get-AzRoleAssignment -ObjectId $objectId
Get-AzRoleDefinition -Name "Storage File Data SMB Admin" | Select-Object -ExpandProperty DataActions
```

**Azure CLI:**
```bash
az role assignment list --assignee <objectId> --output table
az role definition list --name "Storage File Data SMB Admin" --query "[].dataActions"
```
