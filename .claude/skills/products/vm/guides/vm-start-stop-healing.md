# VM Service Healing 与意外重启 — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 13 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VM unexpected reboot requiring RCA; customer requests root cause analysis for VM downtime | Host OS crash on the physical node caused all VMs on the node to reboot. The VM  | Check ASC VM page for Detailed RCA. Provide customer-facing RCA using standard C | 🟢 9 | ON |
| 2 | VMs experience unexpected reboots during Live Migration Defrag in Mooncake. | Live Migration Defrag enabled on clusters for capacity. Some VMs (<1%) may reboo | Kusto: LiveMigrationSessionCompleteLog / where PreciseTimeStamp >= ago(2d) and T | 🟢 8 | ON |
| 3 | Multiple VMs on same node go down with VhdDiskPrt Event 16 errors, Hyper-V Event 18590 fatal error,  | SSD data drive failure on the physical node. In public Azure, Anvil would automa | Issue FC request (e.g., FC63019) to push the affected node OFR for drive replace | 🟢 8 | ON |
| 4 | Azure Dedicated Host VMs experience frequent unexpected reboots (8 in 3 months), all caused by physi | Physical node disks (SKhynix HFS960G32MED-3410A) reached End-of-Life with SMART  | 1) Check LogContainerSnapshot for nodeId changes. 2) Check LogNodeSnapshot for n | 🟢 8 | ON |
| 5 | AKS nodes report VMEventScheduled condition with Freeze event via IMDS; event persists 15+ minutes t | IMDS scheduled event appears when platform initiates host maintenance (Network i | 1) Verify via AzPE Kusto: query AzPEWorkflowSnapshot/AzPEWorkflowEvent with node | 🟢 8 | ON |
| 6 | Azure VM unexpected reboot caused by compute node fault; Kusto shows HardwareFault with DCM FaultCod | Specific SKhynix SSD model with firmware version 20035P00 has elevated failure r | TSG: (1) Verify fault codes 60048/63023/63019/65298, (2) Check disk manufacturer | 🔵 7.5 | ON |
| 7 | Azure Backup, Azure Site Recovery, Shared disks, Accelerated Networking, or Live migration fails on  | Confidential VMs (all generations including v6) do not support these features du | Inform customer these are known CVM platform limitations, not a bug. Unsupported | 🔵 7.0 | AW |
| 8 | Local NVMe disk data lost after unexpected VM reboot or live migration on v6/v7 series VMs; local NV | Local NVMe disks on v6/v7 series VMs are ephemeral and do not persist data acros | Initialize and format local NVMe disks before use. Expect re-initialization afte | 🔵 7.0 | AW |
| 9 | Live Migration not supported for DCsv3/DCdsv3 confidential VMs — VM may experience downtime during h | DCsv3 and DCdsv3 series do not support Live Migration due to SGX enclave memory  | Plan for maintenance downtime. Use Availability Sets or Availability Zones for H | 🔵 7.0 | AW |
| 10 | VM hang / unavailable due to high CPU, no platform restart or service healing triggered | High CPU usage within guest OS causes VM hang. Azure platform service healing on | Monitor CPU from within OS; check ASC Resource Explorer > VM health tab > VMM av | 🔵 7 | ON |
| 11 | VM unexpected reboot with Event 17 (E17) in RDOS | VHD access failure: page blob requests to storage tenant fail continuously for 3 | Check RDOS for E17 events; investigate storage tenant connectivity and backend s | 🔵 7 | ON |
| 12 | VMSS nodes enter failed state after Scale-in operation due to Fabric Failover | Fabric Failover triggered during or after VMSS scale-in operation causes remaini | Investigate Fabric Failover root cause via Kusto/ICM. Ref ICM: 120205931. | 🔵 7 | ON |
| 13 | FXmsv2/FXmdsv2 VM deployment fails or Live Migration/Ephemeral OS Disk feature not working during Pr | FXmsv2 and FXmdsv2 series are initially available only in West US3 region; Live  | Deploy in West US3 (initially); avoid Live Migration and Ephemeral OS Disks duri | 🔵 6.0 | AW |

## 快速排查路径

1. **VM unexpected reboot requiring RCA; customer requests root cause analysis for VM**
   - 根因: Host OS crash on the physical node caused all VMs on the node to reboot. The VM availability impacts report in ASC shows
   - 方案: Check ASC VM page for Detailed RCA. Provide customer-facing RCA using standard Chinese template (do NOT share detailed failure signature as it is MS c
   - `[🟢 9 | ON]`

2. **VMs experience unexpected reboots during Live Migration Defrag in Mooncake.**
   - 根因: Live Migration Defrag enabled on clusters for capacity. Some VMs (<1%) may reboot.
   - 方案: Kusto: LiveMigrationSessionCompleteLog | where PreciseTimeStamp >= ago(2d) and Tenant contains '<Cluster>' and triggerType contains 'defrag'. Report t
   - `[🟢 8 | ON]`

3. **Multiple VMs on same node go down with VhdDiskPrt Event 16 errors, Hyper-V Event**
   - 根因: SSD data drive failure on the physical node. In public Azure, Anvil would automatically detect the failure and send the 
   - 方案: Issue FC request (e.g., FC63019) to push the affected node OFR for drive replacement. Customer can reset VMs via console to trigger live migration to 
   - `[🟢 8 | ON]`

4. **Azure Dedicated Host VMs experience frequent unexpected reboots (8 in 3 months),**
   - 根因: Physical node disks (SKhynix HFS960G32MED-3410A) reached End-of-Life with SMART threshold exceeded (FaultCode 32010 DISK
   - 方案: 1) Check LogContainerSnapshot for nodeId changes. 2) Check LogNodeSnapshot for nodeState=HumanInvestigate. 3) Check AzureDCMDb.ResourceSnapshotHistory
   - `[🟢 8 | ON]`

5. **AKS nodes report VMEventScheduled condition with Freeze event via IMDS; event pe**
   - 根因: IMDS scheduled event appears when platform initiates host maintenance (Network impact: Freeze). AKS node-problem-detecto
   - 方案: 1) Verify via AzPE Kusto: query AzPEWorkflowSnapshot/AzPEWorkflowEvent with nodeId and vmName to trace full workflow lifecycle. 2) Impact is minimal (
   - `[🟢 8 | ON]`

