---
name: vm
description: VM/Compute Kusto 查询专家 - 诊断 Azure VM、VMSS、CRP、Fabric 层相关问题。当用户需要排查虚拟机操作、可用性、性能、硬件故障问题时触发此 skill。
author: fangkun
last_modified: 2026-01-14
---

# VM/Compute Kusto 查询 Skill

## 概述

本 Skill 用于查询 Azure VM/VMSS/CRP/Fabric 相关的 Kusto 日志，诊断虚拟机操作、分配、扩展、可用性、硬件故障等问题。涵盖从 ARM 层到物理主机层的完整诊断链。

## 触发关键词

- VM、虚拟机、VMSS、Virtual Machine Scale Set
- CRP、Compute Resource Provider
- 分配失败、AllocationFailed、OverconstrainedAllocationRequest
- 扩展、Extension、CSE、CustomScriptExtension
- 启动、停止、重启、Deallocate、Redeploy
- Service Healing、Live Migration、意外重启
- 节点故障、硬件故障、HumanInvestigate
- Boot Diagnostics、Serial Console
- Hyper-V、容器状态、ContainerId、NodeId
- VMA、可用性、RCA

## 集群架构

### 诊断层级

```
┌─────────────────────────────────────────────────────────────┐
│ ARM 层 (ARM MC ADX)                                          │
│   HttpIncomingRequests, EventServiceEntries                  │
├─────────────────────────────────────────────────────────────┤
│ CRP 层 (Azure CRP MC)                                        │
│   ApiQosEvent, ContextActivity, VmssQoSEvent                │
├─────────────────────────────────────────────────────────────┤
│ Fabric 层 (Azure CM)                                         │
│   LogContainerSnapshot, TMMgmtTenantEventsEtwTable          │
├─────────────────────────────────────────────────────────────┤
│ 主机节点层 (Azure Core / RDOS)                               │
│   WindowsEventTable, VmHealthRawStateEtwTable, HyperV*      │
├─────────────────────────────────────────────────────────────┤
│ 硬件层 (Azure DCM MC)                                        │
│   ResourceSnapshotHistoryV1, dcmInventoryComponentDiskDirect      │
├─────────────────────────────────────────────────────────────┤
│ 分析层 (VMAInsight / Hawkeye)                                │
│   VMA, VMALENS, HawkeyeRCAEvents                            │
└─────────────────────────────────────────────────────────────┘
```

### 集群信息

| 集群名称 | URI | 数据库 | 用途 |
|----------|-----|--------|------|
| Azure CRP MC | https://azcrpmc.kusto.chinacloudapi.cn | crp_allmc | CRP 操作日志 |
| Azure CM | https://azurecm.chinanorth2.kusto.chinacloudapi.cn | azurecm | Fabric 层日志 |
| Azure Core | https://azcore.chinanorth3.kusto.chinacloudapi.cn | Fa/AzureCP | 主机节点日志 |
| Azure Core 1 | https://azcore1.chinanorth3.kusto.chinacloudapi.cn | AzureCP | 节点故障日志 (AnvilASM) |
| RDOS MC | https://rdosmc.kusto.chinacloudapi.cn | rdos | 主机节点日志 |
| Azure DCM MC | https://azuredcmmc.kusto.chinacloudapi.cn | AzureDCMDb | 硬件管理日志 |
| Disks MC | https://disksmc.chinaeast2.kusto.chinacloudapi.cn | Disks | 磁盘操作日志 |
| Azure Allocator MC | https://azureallocatormc.chinaeast2.kusto.chinacloudapi.cn | azureallocatormc | 分配日志 |
| VMAInsight | https://vmainsight.kusto.windows.net | vmadb | VM 可用性分析 |
| Hawkeye | https://hawkeyedataexplorer.chinanorth2.kusto.chinacloudapi.cn | HawkeyeLogs | 自动 RCA |
| ARM MC ADX | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn | armmc | ARM 层日志 |
| Azure NW China MC | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn | aznwmds | 网络 MDS 数据 |
| ARG MC | https://argmcn2nrpone.chinanorth2 | AzureResourceGraph | ARM 资源图 |

详细集群信息见: [kusto_clusters.csv](./references/kusto_clusters.csv)

## 主要表

### CRP 层 (crp_allmc)

| 表名 | 用途 | 文档 |
|------|------|------|
| ApiQosEvent | API 服务质量事件 | [📄](./references/tables/crp_allmc/ApiQosEvent.md) |
| ApiQosEvent_nonGet | 非 GET 操作事件 | [📄](./references/tables/crp_allmc/ApiQosEvent_nonGet.md) |
| VMApiQosEvent | VM API QoS 事件（含 VM 模型） | [📄](./references/tables/crp_allmc/VMApiQosEvent.md) |
| ContextActivity | 上下文活动详细日志 | [📄](./references/tables/crp_allmc/ContextActivity.md) |
| VmssQoSEvent | VMSS QoS 事件 | [📄](./references/tables/crp_allmc/VmssQoSEvent.md) |
| VmssVMGoalSeekingActivity | VMSS Goal Seeking 活动 | [📄](./references/tables/crp_allmc/VmssVMGoalSeekingActivity.md) |
| MutatingComponentQoSTable | CRP 组件操作 QoS | [📄](./references/tables/crp_allmc/MutatingComponentQoSTable.md) |
| ComputeAllocationActivity | 计算分配活动 | [📄](./references/tables/ComputeAllocationActivity.md) |
| VMAutoExtensionUpgradeEvent | 扩展自动升级事件 | [📄](./references/tables/crp_allmc/VMAutoExtensionUpgradeEvent.md) |

### Fabric 层 (azurecm)

| 表名 | 用途 | 文档 |
|------|------|------|
| LogContainerSnapshot | VM 容器快照 | [📄](./references/tables/azurecm/LogContainerSnapshot.md) |
| LogContainerHealthSnapshot | 容器健康状态 | [📄](./references/tables/azurecm/LogContainerHealthSnapshot.md) |
| LogNodeSnapshot | 节点快照 | [📄](./references/tables/azurecm/LogNodeSnapshot.md) |
| TMMgmtTenantEventsEtwTable | 租户事件 | [📄](./references/tables/azurecm/TMMgmtTenantEventsEtwTable.md) |
| TMMgmtNodeEventsEtwTable | 节点事件 | [📄](./references/tables/azurecm/TMMgmtNodeEventsEtwTable.md) |
| TMMgmtNodeStateChangedEtwTable | 节点状态变更 | [📄](./references/tables/azurecm/TMMgmtNodeStateChangedEtwTable.md) |
| ServiceHealingTriggerEtwTable | Service Healing 触发 | [📄](./references/tables/azurecm/ServiceHealingTriggerEtwTable.md) |
| FaultHandlingRecoveryEventEtwTable | 故障恢复事件 | [📄](./references/tables/azurecm/FaultHandlingRecoveryEventEtwTable.md) |
| LiveMigrationContainerDetailsEventLog | Live Migration 详情 | [📄](./references/tables/azurecm/LiveMigrationContainerDetailsEventLog.md) |
| LogAllocatableVmCountMetric | 可分配 VM 数量 | [📄](./references/tables/azurecm/LogAllocatableVmCountMetric.md) |
| TMMgmtSlaMeasurementEventEtwTable | SLA 测量事件 | [📄](./references/tables/azurecm/TMMgmtSlaMeasurementEventEtwTable.md) |

### 主机节点层 (Fa/rdos/AzureCP)

| 表名 | 用途 | 文档 |
|------|------|------|
| WindowsEventTable | Windows 事件日志 | [📄](./references/tables/Fa/WindowsEventTable.md) |
| VmHealthRawStateEtwTable | VM 健康状态（每 15 秒） | [📄](./references/tables/Fa/VmHealthRawStateEtwTable.md) |
| VmHealthTransitionStateEtwTable | VM 状态转换事件 | [📄](./references/tables/Fa/VmHealthTransitionStateEtwTable.md) |
| NodeServiceOperationEtwTable | 节点服务操作 | [📄](./references/tables/Fa/NodeServiceOperationEtwTable.md) |
| HyperVWorkerTable | Hyper-V Worker 事件 | [📄](./references/tables/Fa/HyperVWorkerTable.md) |
| VmCounterFiveMinuteRoleInstanceCentralBondTable | VM 性能计数器 | [📄](./references/tables/Fa/VmCounterFiveMinuteRoleInstanceCentralBondTable.md) |
| VmServiceContainerOperations | VM 容器操作 | [📄](./references/tables/Fa/VmServiceContainerOperations.md) |
| GuestAgentExtensionEvents | Guest Agent 扩展事件 | [📄](./references/tables/Fa/GuestAgentExtensionEvents.md) |

### 硬件层 (AzureDCMDb)

| 表名 | 用途 | 文档 |
|------|------|------|
| ResourceSnapshotHistoryV1 | 节点生命周期状态 | [📄](./references/tables/ResourceSnapshotHistoryV1.md) |
| dcmInventoryComponentDiskDirect | 磁盘硬件库存 | [📄](./references/tables/AzureDCMDb/dcmInventoryComponentDiskDirect.md) |

### 分析层 (vmadb)

| 表名 | 用途 | 文档 |
|------|------|------|
| VMA | VM 可用性事件 (RCA) | [📄](./references/tables/vmadb/VMA.md) |

## 工作流程

### 步骤 1: 获取基础信息

从用户获取以下信息之一:
- `correlationId` / `operationId` (从 Portal 活动日志)
- `subscriptionId` + `resourceGroupName` + `vmName`
- `containerId` / `nodeId` (从 Fabric 层获取)

### 步骤 2: 查询 CRP 操作日志

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where TIMESTAMP > ago(2d)
| where correlationId == "{correlationId}" 
| where operationName notcontains "GET"
| project PreciseTimeStamp, operationId, correlationId, clientPrincipalName, operationName, 
         resourceGroupName, resourceName, httpStatusCode, resultCode, errorDetails, region
| order by PreciseTimeStamp asc
```

### 步骤 3: 查询详细日志 (ContextActivity)

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP > ago(4h)
| where activityId == "{operationId}"
| project PreciseTimeStamp, message, traceCode
| order by PreciseTimeStamp asc
```

### 步骤 4: 获取 Fabric 层信息 (ContainerId/NodeId)

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where TIMESTAMP > ago(7d)
| where subscriptionId == "{sub}"
| where roleInstanceName has "{vmname}"
| project TIMESTAMP, Tenant, tenantName, containerId, nodeId, roleInstanceName, virtualMachineUniqueId
| summarize arg_max(TIMESTAMP, *) by containerId
```

### 步骤 5: 深入诊断

根据问题类型选择对应的诊断路径:
- **操作失败** → CRP ContextActivity + VmssVMGoalSeekingActivity
- **Service Healing** → ServiceHealingTriggerEtwTable + TMMgmtTenantEventsEtwTable
- **节点问题** → LogNodeSnapshot + WindowsEventTable + ResourceSnapshotHistoryV1
- **可用性问题** → VMA + VmHealthRawStateEtwTable

## 常见诊断场景

### 场景 1: VM 创建/启动失败
1. 查询 CRP ApiQosEvent 获取错误代码和 operationId
2. 查询 ContextActivity 获取详细执行日志
3. 如果是 AllocationFailed，查询 ComputeAllocationActivity
4. 查询 LogContainerSnapshot 确认 Fabric 层状态

### 场景 2: VM 意外重启 (Service Healing)
1. 获取 containerId 和 nodeId (LogContainerSnapshot)
2. 查询 TMMgmtTenantEventsEtwTable 检查 Service Healing 事件
3. 查询 ServiceHealingTriggerEtwTable 获取触发原因
4. 查询 VMA 表获取 RCA 分析结果
5. 查询 WindowsEventTable 检查 Hyper-V 相关事件

### 场景 3: VMSS 操作失败
1. 查询 VmssQoSEvent 获取 VMSS 级别错误
2. 查询 VmssVMGoalSeekingActivity 获取实例级别日志
3. 联合查询 ContextActivity 获取完整追踪

### 场景 4: VM 扩展问题
1. 查询 ContextActivity 筛选 "extension" 相关消息
2. 查询 VMAutoExtensionUpgradeEvent 获取自动升级事件
3. 检查 WireserverHttpRequestLogEtwTable 确认 Agent 通信

### 场景 5: 节点硬件故障
1. 查询 LogNodeSnapshot 检查节点状态 (Unallocatable/HumanInvestigate)
2. 查询 FaultHandlingRecoveryEventEtwTable 检查恢复操作
3. 查询 ResourceSnapshotHistoryV1/V2 获取硬件故障和修复信息
4. 查询 HawkeyeRCAEvents 获取自动 RCA 结果

### 场景 6: Live Migration 问题
1. 查询 LiveMigrationContainerDetailsEventLog 获取 sessionId
2. 查询 LiveMigrationSessionStatusEventLog 检查迁移状态
3. 查询 TMMgmtTenantEventsEtwTable 获取迁移事件

### 场景 7: OSProvisioningTimedOut
1. 查询 CRP ApiQosEvent 确认超时错误
2. 查询 LogContainerSnapshot 获取 containerId/nodeId
3. 查询 DCMNMAgentProgrammingDurationEtwTable 检查网络编程延迟
4. 查询 WireserverHttpRequestLogEtwTable 检查 Wireserver 请求状态

### 场景 8: VM 容量/分配问题
1. 查询 LogAllocatableVmCountMetric 检查区域容量
2. 查询 AllocationQosEvent 获取分配决策
3. 查询 ComputeAllocationActivity 获取详细分配过程

### 场景 9: VM 网络问题
1. 查询 DCMNMQOSInfoEtwTable 获取 CA/PA/MAC/VNet 信息
2. 查询 aznwmds.Servers + DeviceInterfaceLinks 获取 TOR 交换机信息
3. 查询 InterfaceAliasProgrammedFiveMinuteTable 获取多 NIC/PAv6 信息
4. 参考 [vm-network.md](./references/queries/vm-network.md)

### 场景 10: 计划内维护 (Scheduled Maintenance)
1. 查询 ScheduledMaintenanceInformational 获取维护事件
2. 查询 ScheduledMaintenanceStatus 获取维护状态和类型
3. 查询 ScheduledMaintenanceContextStateChange 获取状态变更历史
4. 参考 [vm-maintenance.md](./references/queries/vm-maintenance.md)

### 场景 11: VM 性能问题
1. 查询 VmShoeboxCounterTable 获取 Shoebox 性能指标 (客户视图)
2. 查询 VmCounterFiveMinuteRoleInstanceCentralBondTable 获取节点性能指标
3. 查询 HighCpuCounterNodeTable 检查主机高 CPU 情况
4. 参考 [vm-health.md](./references/queries/vm-health.md)

## 预定义查询

详细查询模板见: [queries/](./references/queries/)

| 查询 | 用途 |
|------|------|
| [vm-operations.md](./references/queries/vm-operations.md) | VM 操作查询 |
| [vmss-operations.md](./references/queries/vmss-operations.md) | VMSS 操作查询 |
| [extension-events.md](./references/queries/extension-events.md) | 扩展事件查询 |
| [container-snapshot.md](./references/queries/container-snapshot.md) | 容器快照查询 |
| [service-healing.md](./references/queries/service-healing.md) | Service Healing 查询 |
| [node-events.md](./references/queries/node-events.md) | 节点事件查询 |
| [live-migration.md](./references/queries/live-migration.md) | Live Migration 查询 |
| [vm-health.md](./references/queries/vm-health.md) | VM 健康状态查询 |
| [vma-analysis.md](./references/queries/vma-analysis.md) | VMA 可用性分析 |
| [hardware-failure.md](./references/queries/hardware-failure.md) | 硬件故障查询 |
| [capacity-allocation.md](./references/queries/capacity-allocation.md) | 容量分配查询 |
| [disk-operations.md](./references/queries/disk-operations.md) | 磁盘操作查询 |
| [arm-tracking.md](./references/queries/arm-tracking.md) | ARM 追踪查询 |
| [arm-throttling.md](./references/queries/arm-throttling.md) | ARM Throttling/429 查询 |
| [provisioning-timeout.md](./references/queries/provisioning-timeout.md) | OS Provisioning 超时查询 |
| [vm-network.md](./references/queries/vm-network.md) | VM 网络配置查询 (VNet/CA/PA/MAC/TOR) |
| [vm-maintenance.md](./references/queries/vm-maintenance.md) | 计划内维护查询 (Scheduled Maintenance) |

## 查询优化建议

1. **始终使用时间过滤**: `where TIMESTAMP between (datetime(...)..datetime(...))`
2. **优先过滤 subscriptionId**: 大幅减少数据扫描量
3. **使用 correlationId/operationId 追踪**: 关联多个表的查询
4. **过滤无效状态码**: `where httpStatusCode != -1`
5. **使用 take 限制结果集**: `take 1000`
6. **避免大时间跨度**: 建议查询时间不超过 7 天

## 参考链接

- [CRP Kusto Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/1280671/Kusto-Repo-CRP)
- [AzureCM Kusto Wiki](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496460/Kusto-Tables_Tool)
- [VMA Insight Wiki](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496348/Host-Node-Hardware-Failure-Investigation_Restarts)
- [父 Skill](../SKILL.md)
