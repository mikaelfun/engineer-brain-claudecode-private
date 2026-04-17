# Disk Data Box POD: Hardware & Error Codes — 综合排查指南

**条目数**: 11 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-data-box-hardware-faq.md, ado-wiki-a-hardware-6k-diagram.md, ado-wiki-a-local-ui-error-codes.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: What hardware is shipped along with Databox?
> 来源: ADO Wiki (ado-wiki-data-box-hardware-faq.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Hardware/Hardware FAQ"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FHardware%2FHardware%20FAQ"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Databox pod is shipped along with its power cable. We do not ship any other cables or SFPs for this product.
6. There is no field replaceable unit in Databox. If there is any hardware issue with Databox, the device will have to be returned.
7. | Specifications | Description |
8. | Weight | < 50 lbs. |
9. | Dimensions | Device - Width: 309.0 mm Height: 430.4 mm Depth: 502.0 mm |
10. | Rack space | 7 U when placed in the rack on its side (cannot be rack-mounted) |

### Phase 2: FXT 6x00 Hardware Diagrams
> 来源: ADO Wiki (ado-wiki-a-hardware-6k-diagram.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Troubleshooting/Hardware 6K Diagram"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20FXT%20and%20vFXT%2FTroubleshooting%2FHardware%206K%20Diagram"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. This document has diagrams showing the front and rear of the 6x00 FXT models. These were taken from the online documentation and should help answer questions relating to the physical FXT hardware.
6. [Front panel diagram — see ADO Wiki attachments]
7. `/.attachments/front-9376e4ca-8c6e-4284-bf16-232634f1bae4.png`
8. [Rear panel diagram — see ADO Wiki attachments]
9. `/.attachments/back-215bc3d8-ca8a-40c0-ba44-f5cb03b6cc41.png`

### Phase 3: Ado Wiki A Local Ui Error Codes
> 来源: ADO Wiki (ado-wiki-a-local-ui-error-codes.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Management and How-To/Local UI Error Codes"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FManagement%20and%20How-To%2FLocal%20UI%20Error%20Codes"
3. importDate: "2026-04-06"
4. type: troubleshooting-guide
5. UI will show "OOPs! Something went wrong" Web Page for below listed cases.
6. UI Page will have an `Error code with #<Alphanumeric value>`
7. This error code will correspond to one of the below failure category.
8. *   Hardware not healthy (#60XZY)
9. The user will not be able to access the appliance or shares.
10. Some of the reasons why the device may be showing unhealthy:

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Data Box POD device software version mismatch detected in support package (expected version differs from actual) | Device firmware update failed or was interrupted, leaving device on an incorrect software version. | Check Get-HcsApplianceInfo.txt in support package at <Device_Logs>/SupportPackage/<Device_Name>/<Device_Serial>/cmdlets/ | 🟢 8.5 | [MCVKB] |
| 2 | Data Box POD network port shows status other than 'Up' in support package diagnostics | Network connectivity issue on Data Box device - cable problem, switch issue, or port configuration e | Check Get-HcsNetInterface.txt in support package. Ports not connected may show blank status (expected). Any connected po | 🟢 8.5 | [MCVKB] |
| 3 | Data Box POD cluster resource in 'Failed' state found in support package | Cluster resource failure on Data Box device. Note: some resources are designed to be 'Offline' and c | Check Get-ClusterResource.txt in support package. Ignore resources in 'Offline' state (by design). Any resource in 'Fail | 🟢 8.5 | [MCVKB] |
| 4 | Windows cannot access Data Box share - The system cannot find the specified file error; device may not respond to ping | Hardware-related issues with Data Box device or faulty network cables preventing connectivity | 1) Ping device by IP. 2) Try different assigned IPs. 3) Try from different machine on same network. 4) Check cables - tr | 🟢 8.5 | [ADO Wiki] |
| 5 | Data Box device unable to power up on arrival; no activity lights; system fault indicator LED is red indicating fan fail | Hardware failure: possible fan failure, CPU temperature too high, motherboard temperature too high,  | Verify proper power connection and try different outlet; check front panel LED indicators (bottom LED = system fault ind | 🟢 8.5 | [ADO Wiki] |
| 6 | Data Box power supply unit (PSU) is faulty; device does not power on or has intermittent power issues | No field replaceable units in Data Box; any hardware issue including PSU failure requires device ret | Customer must return the device; there is no field replaceable unit. Create ICM with Data Box Ops team to arrange return | 🟢 8.5 | [ADO Wiki] |
| 7 | Unable to insert, remove, or manipulate SFP+ cable or transceiver module on Data Box device; SFP+ module stuck in DATA1/ | Physical handling issue with SFP+ modules on Mellanox ConnectX-3 Pro EN Dual-Port 10GBASE-T adapter; | Customer should engage their network team or cable/transceiver vendor for physical handling assistance; recommend using  | 🟢 8.5 | [ADO Wiki] |
| 8 | Data Box Local UI shows OOPs Something went wrong with error code #60XZY (X=3 hardware unhealthy); virtual disk failed o | Hardware component failure on Data Box device - virtual disk in failed state or all network adapters | Collect support package from limited OOBE UI; contact management and platform team; device may need replacement | 🟢 8.5 | [ADO Wiki] |
| 9 | Data Box Local UI shows OOPs Something went wrong with error code #60XYZ (Y=2 software unhealthy); DV filter service not | Software health failure - DV filter service not running, exception trying to unlock disks, or pod st | Collect support package; contact management and platform team; try rebooting the appliance | 🟢 8.5 | [ADO Wiki] |
| 10 | Data Box Local UI shows OOPs Something went wrong with error code #55XYZ; management cluster resource not running or res | Management cluster resource on Data Box device is not running or not responding | Reboot the appliance; if persists collect support package and contact management and platform team | 🟢 8.5 | [ADO Wiki] |
| 11 | Data Box Local UI shows OOPs Something went wrong with error code #70111; unexpected error for a UI action | Data Box returned unexpected error for a UI action; transient or unknown software issue | Reboot the appliance and retry the operation | 🟢 8.5 | [ADO Wiki] |
