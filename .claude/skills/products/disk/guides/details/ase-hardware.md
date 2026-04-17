# Disk Azure Stack Edge: Device Management — 综合排查指南

**条目数**: 4 | **草稿融合数**: 7 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-ase-bmc-connection.md, ado-wiki-ase-device-replacement.md, ado-wiki-ase-disable-mps.md, ado-wiki-ase-move-subscription.md, ado-wiki-ase-performance-logs.md, ado-wiki-ase-reseat-replace-data-drive.md, ado-wiki-ase-return-process.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Connecting to Azure Stack Edge Device via BMC
> 来源: ADO Wiki (ado-wiki-ase-bmc-connection.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Manage Device/Connecting to an Azure Stack Edge Device via BMC"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FManage%20Device%2FConnecting%20to%20an%20Azure%20Stack%20Edge%20Device%20via%20BMC"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. - Configure host Ethernet adapter: static IP 192.168.100.5, subnet 255.255.255.0
6. - Connect host to BMC port on ASE device
7. 1. Open browser: `https://192.168.100.100` (may take a few minutes after power on)
8. 2. Accept security certificate warning (Advanced > Proceed)
9. - Username: `EdgeSupport`
10. - Password: Request from Engineering Roster team with device serial number; decrypt via Support Password Decrypter at https://hcssupport/

### Phase 2: Replacing an Azure Stack Edge Device
> 来源: ADO Wiki (ado-wiki-ase-device-replacement.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Hardware/Replacing an Azure Stack Edge Device"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FHardware%2FReplacing%20an%20Azure%20Stack%20Edge%20Device"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. 1. **Set up replacement device** as new device (install, connect, configure, activate)
6. 2. **Create shares** on replacement device matching original exactly:
7. - Azure portal > ASE resource > Overview > + Add share
8. - Match name, type (SMB/NFS), storage account, storage service, container
9. 3. **Refresh shares** to pull data from Azure:
10. - Azure portal > Shares > select share > Refresh > confirm

### Phase 3: Disable Multi-Process Service (MPS) on Azure Stack Edge
> 来源: ADO Wiki (ado-wiki-ase-disable-mps.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/GPU - Compute/Disable Multi-Process Service MPS on Azure Stack Edge"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FGPU%20-%20Compute%2FDisable%20Multi-Process%20Service%20MPS%20on%20Azure%20Stack%20Edge"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. MPS is an alternative CUDA API implementation enabling cooperative multi-process CUDA applications to utilize Hyper-Q capabilities on NVIDIA GPUs.
6. 1. Enter a support session on the Azure Stack Edge
7. 2. SSH to the running VM: `ssh hcsuser@<VM_IP>`
8. 3. Remove the MPS service:
9. sudo systemctl disable nvidia-mps.service
10. sudo systemctl stop nvidia-mps.service

### Phase 4: Move Azure Stack Edge Resource Between Azure Subscriptions
> 来源: ADO Wiki (ado-wiki-ase-move-subscription.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Manage Device/Move Azure Stack Edge Resource Between Azure Subscriptions"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FManage%20Device%2FMove%20Azure%20Stack%20Edge%20Resource%20Between%20Azure%20Subscriptions"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. **CAUTION**: Data and configuration on the device will be erased. Data in the current storage account will not migrate.
6. 1. **Reset the device** via Local WebUI or PowerShell (erases all data and config)
7. 2. **Create new ASE Resource** in target subscription
8. - Select "I already have a device" under shipping address tab
9. 3. **Connect to Local WebUI** at https://192.168.100.10 (may take a few minutes after reset)
10. 4. **Configure**: Network settings > Device settings (name, update/time server) > Certificates

### Phase 5: Generating and Reading Performance Logs on Azure Stack Edge
> 来源: ADO Wiki (ado-wiki-ase-performance-logs.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Manage Device/Generating and Reading Performance Logs on Azure Stack Edge"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FManage%20Device%2FGenerating%20and%20Reading%20Performance%20Logs%20on%20Azure%20Stack%20Edge"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Useful for diagnosing high or unusual volume of traffic between ASE and Azure Storage.
6. Performance logs (.blg files) are in the support package, readable by Windows Performance Monitor.
7. 1. Launch **Performance Monitor** (Start > search "Performance Monitor")
8. 2. Click **Performance Monitor** in left pane
9. 3. Click **View Log Data** (second icon from left)
10. 4. **Source** tab > **Log files** > **Add** > select .blg file(s)

### Phase 6: Reseating or Replacing a Data Drive on Azure Stack Edge Pro
> 来源: ADO Wiki (ado-wiki-ase-reseat-replace-data-drive.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Hardware/Reseating or Replacing a Data Drive on Azure Stack Edge Pro"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FHardware%2FReseating%20or%20Replacing%20a%20Data%20Drive%20on%20Azure%20Stack%20Edge%20Pro"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. 1. If applicable, remove the front bezel covering the drive
6. 2. **Remove the drive**:
7. - Press the release button to open the drive carrier release handle
8. - While holding the handle, slide the drive carrier out of the drive slot
9. 3. **Wait ~30 seconds**
10. 4. **(Re-)Install the drive**:

### Phase 7: Return Process for Azure Stack Edge Devices
> 来源: ADO Wiki (ado-wiki-ase-return-process.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Device Return - Logistics/Return Process for Azure Stack Edge Devices"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FDevice%20Return%20-%20Logistics%2FReturn%20Process%20for%20Azure%20Stack%20Edge%20Devices"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Customer should reset device to factory settings and follow: https://learn.microsoft.com/en-us/azure/databox-online/azure-stack-edge-return-device?tabs=azure-edge-hardware-center
6. MS Asset Tag (found on device):
7. Physical Address for pickup:
8. Is shipping box needed?
9. Customer Contact Name:
10. Contact Phone Number:

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Unable to generate activation key for Azure Stack Edge (ASE); 403 error: Resource was disallowed by policy | Azure Policy blocking creation of public endpoints, or user account lacks owner/contributor rights o | Verify account has owner or contributor rights; check for Azure Policy blocking endpoint creation; remove or adjust the  | 🟢 8.5 | [ADO Wiki] |
| 2 | Need to find BIOS version of Azure Stack Edge device | BIOS version information is not directly accessible via portal or CLI; it is only available in the s | Collect support package from ASE device; BIOS version can be found at \cmdlets\platform\systeminfo.txt in the support pa | 🟢 8.5 | [ADO Wiki] |
| 3 | Azure Stack Edge upgrade failing from Azure Portal with error code NO_PARAM; update process fails | Cluster Virtual Disk (ClusterPerformanceHistory) resource is Offline; can occur when updating from v | Enter Support Session; Start-ClusterResource for ClusterPerformanceHistory; confirm Online; retry upgrade from Azure Por | 🟢 8.5 | [ADO Wiki] |
| 4 | Need to set up and use Az.StackEdge PowerShell module for Azure Stack Edge automation |  | Install Azure Az PowerShell module; Connect-AzAccount; verify subscription with Get-AzContext (Set-AzContext if needed); | 🟢 8.0 | [ADO Wiki] |
