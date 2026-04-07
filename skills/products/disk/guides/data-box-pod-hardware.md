# Disk Data Box POD: Hardware & Error Codes — 排查速查

**来源数**: 11 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: cable, cables, cluster-resource, connectivity, data-box, data-box-pod, doa, error-code, failed-state, firmware

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Data Box POD device software version mismatch detected in support package (expected version differs from actual) | Device firmware update failed or was interrupted, leaving device on an incorrect software version. | Check Get-HcsApplianceInfo.txt in support package at <Device_Logs>/SupportPackage/<Device_Name>/<Device_Serial>/cmdlets/ | 🟢 8.5 | [MCVKB] |
| 2 📋 | Data Box POD network port shows status other than 'Up' in support package diagnostics | Network connectivity issue on Data Box device - cable problem, switch issue, or port configuration e | Check Get-HcsNetInterface.txt in support package. Ports not connected may show blank status (expected). Any connected po | 🟢 8.5 | [MCVKB] |
| 3 📋 | Data Box POD cluster resource in 'Failed' state found in support package | Cluster resource failure on Data Box device. Note: some resources are designed to be 'Offline' and c | Check Get-ClusterResource.txt in support package. Ignore resources in 'Offline' state (by design). Any resource in 'Fail | 🟢 8.5 | [MCVKB] |
| 4 📋 | Windows cannot access Data Box share - The system cannot find the specified file error; device may not respond to ping | Hardware-related issues with Data Box device or faulty network cables preventing connectivity | 1) Ping device by IP. 2) Try different assigned IPs. 3) Try from different machine on same network. 4) Check cables - tr | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | Data Box device unable to power up on arrival; no activity lights; system fault indicator LED is red indicating fan fail | Hardware failure: possible fan failure, CPU temperature too high, motherboard temperature too high,  | Verify proper power connection and try different outlet; check front panel LED indicators (bottom LED = system fault ind | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | Data Box power supply unit (PSU) is faulty; device does not power on or has intermittent power issues | No field replaceable units in Data Box; any hardware issue including PSU failure requires device ret | Customer must return the device; there is no field replaceable unit. Create ICM with Data Box Ops team to arrange return | 🟢 8.5 | [ADO Wiki] |
| 7 📋 | Unable to insert, remove, or manipulate SFP+ cable or transceiver module on Data Box device; SFP+ module stuck in DATA1/ | Physical handling issue with SFP+ modules on Mellanox ConnectX-3 Pro EN Dual-Port 10GBASE-T adapter; | Customer should engage their network team or cable/transceiver vendor for physical handling assistance; recommend using  | 🟢 8.5 | [ADO Wiki] |
| 8 📋 | Data Box Local UI shows OOPs Something went wrong with error code #60XZY (X=3 hardware unhealthy); virtual disk failed o | Hardware component failure on Data Box device - virtual disk in failed state or all network adapters | Collect support package from limited OOBE UI; contact management and platform team; device may need replacement | 🟢 8.5 | [ADO Wiki] |
| 9 📋 | Data Box Local UI shows OOPs Something went wrong with error code #60XYZ (Y=2 software unhealthy); DV filter service not | Software health failure - DV filter service not running, exception trying to unlock disks, or pod st | Collect support package; contact management and platform team; try rebooting the appliance | 🟢 8.5 | [ADO Wiki] |
| 10 📋 | Data Box Local UI shows OOPs Something went wrong with error code #55XYZ; management cluster resource not running or res | Management cluster resource on Data Box device is not running or not responding | Reboot the appliance; if persists collect support package and contact management and platform team | 🟢 8.5 | [ADO Wiki] |
| 11 📋 | Data Box Local UI shows OOPs Something went wrong with error code #70111; unexpected error for a UI action | Data Box returned unexpected error for a UI action; transient or unknown software issue | Reboot the appliance and retry the operation | 🟢 8.5 | [ADO Wiki] |

## 快速排查路径

1. Data Box POD device software version mismatch detected in support package (expec → Check Get-HcsApplianceInfo `[来源: onenote]`
2. Data Box POD network port shows status other than 'Up' in support package diagno → Check Get-HcsNetInterface `[来源: onenote]`
3. Data Box POD cluster resource in 'Failed' state found in support package → Check Get-ClusterResource `[来源: onenote]`
4. Windows cannot access Data Box share - The system cannot find the specified file → 1) Ping device by IP `[来源: ado-wiki]`
5. Data Box device unable to power up on arrival; no activity lights; system fault  → Verify proper power connection and try different outlet; check front panel LED indicators (bottom LE `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/data-box-pod-hardware.md#排查流程)
