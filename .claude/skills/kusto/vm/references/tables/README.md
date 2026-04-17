# 表结构定义 (tables/)

本目录存放 Kusto 表结构定义文件，每个文件对应一个表。

## 表索引

### crp_allmc 数据库 (CRP 操作日志)

> 集群: `azcrpmc.kusto.chinacloudapi.cn`

| 表名 | 用途 | 文件 |
|------|------|------|
| ApiQosEvent | CRP API QoS 事件，记录所有 VM/VMSS 操作结果 | [ApiQosEvent.md](./ApiQosEvent.md) |
| ApiQosEvent_nonGet | 非 GET 操作的 API QoS 事件（派生自 ApiQosEvent） | [ApiQosEvent_nonGet.md](./ApiQosEvent_nonGet.md) |
| ContextActivity | CRP 上下文活动日志，记录操作详细执行过程 | [ContextActivity.md](./ContextActivity.md) |
| MutatingComponentQoSTable | CRP 组件 QoS，记录各组件操作的延迟和结果 | [MutatingComponentQoSTable.md](./MutatingComponentQoSTable.md) |
| VMApiQosEvent | VM API QoS 事件，包含 VM 模型数据和详细操作信息 | [VMApiQosEvent.md](./VMApiQosEvent.md) |
| VMAutoExtensionUpgradeEvent | VM 扩展自动升级事件 | [VMAutoExtensionUpgradeEvent.md](./VMAutoExtensionUpgradeEvent.md) |
| VmssQoSEvent | VMSS QoS 事件，VMSS 级别操作的性能和结果 | [VmssQoSEvent.md](./VmssQoSEvent.md) |
| VmssVMGoalSeekingActivity | VMSS VM Goal Seeking 活动，VM 实例目标状态同步 | [VmssVMGoalSeekingActivity.md](./VmssVMGoalSeekingActivity.md) |

### azurecm 数据库 (Fabric 层日志)

> 集群: `azurecm.chinanorth2.kusto.chinacloudapi.cn`

| 表名 | 用途 | 文件 |
|------|------|------|
| LogContainerSnapshot | VM 容器快照，Fabric 层部署位置和元数据 | [LogContainerSnapshot.md](./LogContainerSnapshot.md) |
| LogContainerHealthSnapshot | 容器健康状态快照，生命周期和操作状态 | [LogContainerHealthSnapshot.md](./LogContainerHealthSnapshot.md) |
| LogNodeSnapshot | 节点快照，物理节点状态和配置 | [LogNodeSnapshot.md](./LogNodeSnapshot.md) |
| LogAllocatableVmCountMetric | 可分配 VM 数量指标 | [LogAllocatableVmCountMetric.md](./LogAllocatableVmCountMetric.md) |
| FaultHandlingRecoveryEventEtwTable | 故障处理恢复事件 | [FaultHandlingRecoveryEventEtwTable.md](./FaultHandlingRecoveryEventEtwTable.md) |
| LiveMigrationContainerDetailsEventLog | Live Migration 容器详情事件 | [LiveMigrationContainerDetailsEventLog.md](./LiveMigrationContainerDetailsEventLog.md) |
| ServiceHealingTriggerEtwTable | Service Healing 触发事件 | [ServiceHealingTriggerEtwTable.md](./ServiceHealingTriggerEtwTable.md) |
| TMMgmtNodeEventsEtwTable | 节点事件，节点级别操作和状态变化 | [TMMgmtNodeEventsEtwTable.md](./TMMgmtNodeEventsEtwTable.md) |
| TMMgmtNodeStateChangedEtwTable | 节点状态变更，节点状态转换记录 | [TMMgmtNodeStateChangedEtwTable.md](./TMMgmtNodeStateChangedEtwTable.md) |
| TMMgmtSlaMeasurementEventEtwTable | TM SLA 测量事件 | [TMMgmtSlaMeasurementEventEtwTable.md](./TMMgmtSlaMeasurementEventEtwTable.md) |
| TMMgmtTenantEventsEtwTable | 租户事件，Service Healing/Live Migration 等 | [TMMgmtTenantEventsEtwTable.md](./TMMgmtTenantEventsEtwTable.md) |
| AzSMTenantStatemachineEvents | 租户状态机事件，状态机操作详情 | [AzSMTenantStatemachineEvents.md](./AzSMTenantStatemachineEvents.md) |
| DCMLMResourceEventEtwTable | DCM 生命周期资源事件，节点维修状态 | [DCMLMResourceEventEtwTable.md](./DCMLMResourceEventEtwTable.md) |
| LogClusterSnapshot | 集群快照，集群配置和 Build 版本 | [LogClusterSnapshot.md](./LogClusterSnapshot.md) |
| TMMgmtNodeFaultEtwTable | 节点故障事件，故障码和原因 | [TMMgmtNodeFaultEtwTable.md](./TMMgmtNodeFaultEtwTable.md) |

### Fa 数据库 (Host 节点层日志)

> 集群: `azcore.chinanorth3.kusto.chinacloudapi.cn`

| 表名 | 用途 | 文件 |
|------|------|------|
| GuestAgentExtensionEvents | Guest Agent 扩展事件，扩展操作和状态 | [GuestAgentExtensionEvents.md](./GuestAgentExtensionEvents.md) |
| VmHealthRawStateEtwTable | VM 健康状态原始数据（每 15 秒采样） | [VmHealthRawStateEtwTable.md](./VmHealthRawStateEtwTable.md) |
| VmHealthTransitionStateEtwTable | VM 健康状态转换事件，记录状态变化点 | [VmHealthTransitionStateEtwTable.md](./VmHealthTransitionStateEtwTable.md) |
| VmServiceContainerOperations | VM 服务容器操作详情 | [VmServiceContainerOperations.md](./VmServiceContainerOperations.md) |
| HyperVWorkerTable | Hyper-V Worker，VM 内存分配等操作 | [HyperVWorkerTable.md](./HyperVWorkerTable.md) |
| NodeServiceOperationEtwTable | 节点服务操作事件 | [NodeServiceOperationEtwTable.md](./NodeServiceOperationEtwTable.md) |
| VmCounterFiveMinuteRoleInstanceCentralBondTable | VM 性能计数器 5 分钟聚合 | [VmCounterFiveMinuteRoleInstanceCentralBondTable.md](./VmCounterFiveMinuteRoleInstanceCentralBondTable.md) |
| VmShoeboxCounterTable | VM 性能计数器 Shoebox（含百分位） | [VmShoeboxCounterTable.md](./VmShoeboxCounterTable.md) |
| HighCpuCounterNodeTable | 节点高 CPU 计数器 | [HighCpuCounterNodeTable.md](./HighCpuCounterNodeTable.md) |
| WindowsEventTable | Windows 事件日志（主机节点） | [WindowsEventTable.md](./WindowsEventTable.md) |

### AzureDcmDb 数据库 (DCM 硬件信息)

> 集群: `azuredcmmc.kusto.chinacloudapi.cn`

| 表名 | 用途 | 文件 |
|------|------|------|
| dcmInventoryComponentDiskDirect | DCM 磁盘组件清单，节点磁盘硬件信息 | [dcmInventoryComponentDiskDirect.md](./dcmInventoryComponentDiskDirect.md) |
| dcmInventoryComponentSystemDirect | DCM 系统组件清单，节点硬件/BIOS/BMC 信息 | [dcmInventoryComponentSystemDirect.md](./dcmInventoryComponentSystemDirect.md) |
| RdmResourceSnapshot | 节点资源快照，生命周期状态和故障代码 | [RdmResourceSnapshot.md](./RdmResourceSnapshot.md) |
| RhwChassisSelItemEtwTable | 机箱 BMC SEL 事件，硬件传感器告警 | [RhwChassisSelItemEtwTable.md](./RhwChassisSelItemEtwTable.md) |
| RhLiteDiagBmcSel | BMC SEL 诊断数据（LiteDiag 格式） | [RhLiteDiagBmcSel.md](./RhLiteDiagBmcSel.md) |

### azureallocatormc 数据库 (分配器)

> 集群: `azureallocatormc.chinaeast2.kusto.chinacloudapi.cn`

| 表名 | 用途 | 文件 |
|------|------|------|
| AllocatorAllocationResult | VM 分配结果，分配请求和结果记录 | [AllocatorAllocationResult.md](./AllocatorAllocationResult.md) |

### vmadb 数据库 (VMA 可用性分析)

> 集群: `vmainsight.kusto.windows.net` (⚠️ Public 端点，包含 Mooncake 数据)

| 表名 | 用途 | 文件 |
|------|------|------|
| VMA | VM 可用性事件，包含 RCA 分析结果 | [VMA.md](./VMA.md) |
| VMALENS_MonitorRCAEvents | LENS Monitor RCA 事件，详细 RCA 分类 | [VMALENS_MonitorRCAEvents.md](./VMALENS_MonitorRCAEvents.md) |

---

## 文件命名规范

```
{TableName}.md
```

使用表的实际名称，如：
- `ApiQosEvent.md`
- `LogContainerSnapshot.md`
- `VmHealthRawStateEtwTable.md`

## 文件格式

每个表定义文件使用以下格式：

```markdown
---
name: TableName
database: DatabaseName
cluster: cluster_uri
description: 表描述
status: active|deprecated
---

# TableName

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcrpmc.kusto.chinacloudapi.cn |
| 数据库 | crp_allmc |
| 状态 | ✅ 可用 / ⚠️ 已弃用 |

## 用途

描述此表的主要用途和适用场景。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| subscriptionId | string | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `PreciseTimeStamp` - 按时间筛选

## 典型应用场景

1. **场景 1**: 查询 VM 操作结果
2. **场景 2**: 检查容器健康状态

## 示例查询

\```kql
TableName
| where PreciseTimeStamp > ago(1d)
| where subscriptionId == "{subscription}"
| take 10
\```

## 关联表

- [RelatedTable.md](./RelatedTable.md) - 关联说明

## 注意事项

- 注意事项
```

## 字段类型

| 类型 | KQL 类型 | 说明 |
|------|----------|------|
| datetime | datetime | 日期时间 |
| string | string | 字符串 |
| int | int | 整数 |
| long | long | 长整数 |
| bool | bool | 布尔值 |
| dynamic | dynamic | JSON 对象 |
| guid | guid | GUID |

## 状态标记

| 状态 | 标记 | 说明 |
|------|------|------|
| 可用 | ✅ | 表正常可用 |
| 已弃用 | ⚠️ | 表已弃用，不建议使用 |
| 实验性 | 🧪 | 实验性表，可能变更 |
