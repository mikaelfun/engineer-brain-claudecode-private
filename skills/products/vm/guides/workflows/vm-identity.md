# VM Identity & Auth — 排查工作流

**来源草稿**: ado-wiki-c-AFS-System-Managed-Identity.md, ado-wiki-c-managed-identity-smb-howto.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 1
**覆盖子主题**: vm-identity
**生成日期**: 2026-04-07

---

## Scenario 1: Ado Wiki C Afs System Managed Identity
> 来源: ado-wiki-c-AFS-System-Managed-Identity.md | 适用: Mooncake \u2705

### 排查步骤
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/How Tos/How To for a system managed identity on Azure File Sync_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FHow%20Tos%2FHow%20To%20for%20a%20system%20managed%20identity%20on%20Azure%20File%20Sync_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
Tags:
- cw.Azure-Files-Sync
- cw.How-To
- cw.Reviewed-07-2025
::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::
[[_TOC_]]
# How to enable a system-assigned managed identity on a server
Before you can configure Azure File Sync to use managed identities, the registered servers must have a system-assigned managed identity that will be used to access the Azure File Sync service and Azure file shares.
To enable a system-assigned managed identity on a registered server with the Azure File Sync v19 agent installed, perform the following steps:
- If the server is hosted outside of Azure, it must be an Azure Arc-enabled server to have a system-assigned managed identity.
- If the server is an Azure virtual machine, enable the system-assigned managed identity setting on the VM.
**Notes:**
- At least one registered server must have a system-assigned managed identity before you can configure the Storage Sync Service to use a system-assigned identity.
- Once the Storage Sync Service is configured to use managed identities, registered servers that do not have a system-assigned managed identity will continue to use a shared key to authenticate to the Azure file shares.
# How to check if a server has a system-assigned managed identity
To check if a registered server has a system-assigned managed identity (SAMI), run the following PowerShell command:
```powershell
Get-AzStorageSyncServer -ResourceGroupName <string> -StorageSyncServiceName <string>
```
![Server has a system-assigned managed identity](/.attachments/SME-Topics/Azure-Files-Sync/Server-has-a-system-assigned-manage-identity.jpg)
Verify that the `LatestApplicationId` property has a GUID, which indicates the server has a system-assigned managed identity but is not currently configured to use it.
If the value for the `ActiveAuthType` property is `Certificate` and the `LatestApplicationId` does not have a GUID, the server does not have a system-assigned managed identity and will use shared keys to authenticate to the Azure file share.
> **Note:** Once a server is configured to use the system-assigned managed identity by following the steps in the section below, the `LatestApplicationId` property is no longer used (it will be empty), the `ActiveAuthType` property value will be changed to `ManagedIdentity`, and the `ApplicationId` property will have the GUID for the system-assigned managed identity.
# How to configure Azure File Sync to use system-assigned managed identities
To configure the Storage Sync Service and registered servers to use system-assigned managed identities, run the following command from an elevated PowerShell window:
```powershell
Set-AzStorageSyncServiceIdentity -ResourceGroupName <string> -StorageSyncServiceName <string> -Verbose
```
The `Set-AzStorageSyncServiceIdentity` cmdlet performs the following steps and may take several minutes (or longer for large topologies) to complete:
- Validates that at least one registered server has a system-assigned managed identity.
    - The cmdlet will stop at this step if there are no registered servers with a system-assigned managed identity.
- Enables a system-assigned managed identity for the Storage Sync Service resource.
- Grants the Storage Sync Service system-assigned managed identity access to the Storage Accounts (Storage Account Contributor role).
- Grants the Storage Sync Service system-assigned managed identity access to the Azure file shares (Storage File Data Privileged Contributor role).
- Grants the registered server(s) system-assigned managed identity access to the Azure file shares (Storage File Data Privileged Contributor role).
- Configures the Storage Sync Service to use a system-assigned managed identity.
- Configures registered server(s) to use a system-assigned managed identity.
Customers should use the `Set-AzStorageSyncServiceIdentity` cmdlet anytime they need to configure additional registered servers to use managed identities.
> **Note:** Once the registered server(s) are configured to use a system-assigned managed identity, it can take up to 15 minutes before the server uses the system-assigned managed identity to authenticate to the Storage Sync Service and file shares.
# How to check if the Storage Sync Service is using a system-assigned managed identity
To check if the Storage Sync Service is using a system-assigned managed identity, run the following command from an elevated PowerShell window:
```powershell
Get-AzStorageSyncService -ResourceGroupName <string> -StorageSyncServiceName <string>
```
![Sync Service is using a system-assigned managed identity](/.attachments/SME-Topics/Azure-Files-Sync/Sync-service-is-using-a-system-assigned-managed-identity.jpg)
Verify that the value for the `UseIdentity` property is `True`. If the value is `False`, the Storage Sync Service is using shared keys to authenticate to the Azure file shares.
# How to check if a registered server is configured to use a system-assigned managed identity
To check if a registered server is configured to use a system-assigned managed identity, run the following command from an elevated PowerShell window:
```powershell
Get-AzStorageSyncServer -ResourceGroupName <string> -StorageSyncServiceName <string>
```
![Server is configured to use a system-assigned managed identity](/.attachments/SME-Topics/Azure-Files-Sync/Server-is-configured-to-use-a-system-assigned-managed-identity.jpg)
Verify that the value for the `ActiveAuthType` property is `ManagedIdentity`. Also, the `ApplicationId` property will have a GUID, which is the system-assigned managed identity, and the `LatestApplicationId` property will be empty.
> **Note:** Once the registered server(s) are configured to use a system-assigned managed identity, it can take up to 15 minutes before the server uses the system-assigned managed identity to authenticate to the Storage Sync Service and Azure file shares.
# Additional Resources
- [Expected Issues](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/2180201/Expected-Issues-for-Managed-Identities-on-Azure-File-Sync_Storage)
- [Manage Identities Overview](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/2117746/AFS-Manage-Identities_Storage)
::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md
:::

`[来源: ado-wiki-c-AFS-System-Managed-Identity.md]`

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|
