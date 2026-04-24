# VM 主权云支持边界 — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 5 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Need to investigate disk state transitions during VM operations (attach/detach/redeploy); disk may a | DiskRP manages disk lifecycle events (Attach, Move, UpdateDiskMetadata) during C | Query DiskRPResourceLifecycleEvent on disksmc.kusto.chinacloudapi.cn/Disks: filt | 🟢 8 | ON |
| 2 | Azure China VM ForceDelete API not working as expected; delete takes excessively long. Host Agent St | Platform issue in Azure China: ForceDelete not functioning, Host Agent container | Fixed by platform. Troubleshoot: CRP ApiQosEvent_nonGet for ForceDelete op, Fabr | 🔵 7.5 | ON |
| 3 | LSI（Live Site Incident）发生后需向客户发送 RCA（根本原因分析） |  | 使用双语（中英文）RCA 模板，包含字段：事件ID、标题、受影响服务、受影响区域、开始时间、恢复时间、事件总结、问题原因、下一步举措、隐私声明链接。隐私声明链接 | 🔵 7 | ON |
| 4 | Engineer needs to receive Azure LSI (Live Site Incident) notification emails for Mooncake/Azure inci |  | Join IDWeb group: 1) Open https://idwebelements/GroupManagement.aspx; 2) Search  | 🔵 7 | ON |
| 5 | Engineer needs overview of Sovereign Cloud support coverage (Azure Government, Mooncake, Black Fores |  | Sovereign Cloud includes Azure Government (Fairfax), Azure China 21Vianet (Moonc | 🔵 6.5 | AW |

## 快速排查路径

1. **Need to investigate disk state transitions during VM operations (attach/detach/r**
   - 根因: DiskRP manages disk lifecycle events (Attach, Move, UpdateDiskMetadata) during CRP VM operations. State transitions foll
   - 方案: Query DiskRPResourceLifecycleEvent on disksmc.kusto.chinacloudapi.cn/Disks: filter by resourceName, project TIMESTAMP/activityId/callerName/diskEvent/
   - `[🟢 8 | ON]`

2. **Azure China VM ForceDelete API not working as expected; delete takes excessively**
   - 根因: Platform issue in Azure China: ForceDelete not functioning, Host Agent container stop hangs. ICM 666633117. Now fixed.
   - 方案: Fixed by platform. Troubleshoot: CRP ApiQosEvent_nonGet for ForceDelete op, Fabric VmServiceContainerOperations for ResultCode 0xc4520018.
   - `[🔵 7.5 | ON]`

3. **LSI（Live Site Incident）发生后需向客户发送 RCA（根本原因分析）**
   - 方案: 使用双语（中英文）RCA 模板，包含字段：事件ID、标题、受影响服务、受影响区域、开始时间、恢复时间、事件总结、问题原因、下一步举措、隐私声明链接。隐私声明链接：https://www.azure.cn/zh-cn/support/legal/privacy-statement/。⚠️ 发送前检查该
   - `[🔵 7 | ON]`

4. **Engineer needs to receive Azure LSI (Live Site Incident) notification emails for**
   - 方案: Join IDWeb group: 1) Open https://idwebelements/GroupManagement.aspx; 2) Search Azure Incident Notification (AzureInternal); 3) Click Join Group. Afte
   - `[🔵 7 | ON]`

5. **Engineer needs overview of Sovereign Cloud support coverage (Azure Government, M**
   - 方案: Sovereign Cloud includes Azure Government (Fairfax), Azure China 21Vianet (Mooncake), Azure Germany (Black Forest). See sub-pages for specific process
   - `[🔵 6.5 | AW]`

