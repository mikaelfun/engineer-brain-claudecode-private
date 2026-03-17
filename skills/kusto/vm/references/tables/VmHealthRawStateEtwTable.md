---
name: VmHealthRawStateEtwTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: VM 健康状态原始数据，每 15 秒记录一次
status: active
---

# VmHealthRawStateEtwTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录 VM 健康状态的原始数据，每 15 秒记录一次。包含 Hyper-V IC 心跳状态、电源状态等。用于精细分析 VM 可用性问题。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| ContainerId | string | 容器 ID |
| NodeId | string | 节点 ID |
| VmIncarnationId | string | VM 实例化 ID（每次启动不同） |
| VirtualMachineUniqueId | string | VM 唯一 ID |
| VmHyperVIcHeartbeat | string | Hyper-V IC 心跳状态（HeartBeatStateOk / HeartBeatStateNoContact） |
| VmPowerState | string | VM 电源状态（PowerStateEnabled / PowerStateDisabled） |
| HasHyperVHandshakeCompleted | bool | Hyper-V IC 握手是否完成（true/false） |
| IsVscStateOperational | bool | VSC 状态是否正常（true/false） |
| Context | string | VM 上下文状态（VirtualMachineRestarted / StartVm / StopVm） |
| VmContext | string | VM 详细上下文信息 |

## 常用筛选字段

- `ContainerId` - 按容器 ID 筛选 (必需)
- `VirtualMachineUniqueId` - 按 VM ID 筛选
- `NodeId` - 按节点筛选

## 示例查询

### 查询 VM 健康状态

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('fa').VmHealthRawStateEtwTable
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where ContainerId == "{containerId}"
| project PreciseTimeStamp, VmHyperVIcHeartbeat, VmPowerState, HasHyperVHandshakeCompleted, ContainerId
```

### 通过 VM ID 查询

```kql
let vmids = split("{vmid}", ",");
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VmHealthRawStateEtwTable 
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where VirtualMachineUniqueId in (vmids)
| project PreciseTimeStamp, ContainerId, NodeId, VmHyperVIcHeartbeat, VmPowerState
```

## 关联表

- [VmHealthTransitionStateEtwTable.md](./VmHealthTransitionStateEtwTable.md) - 状态转换事件
- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 获取 ContainerId
- [VmCounterFiveMinuteRoleInstanceCentralBondTable.md](./VmCounterFiveMinuteRoleInstanceCentralBondTable.md) - 性能计数器

## 注意事项

- 此表记录频率高（每 15 秒），查询时注意时间范围
- `IsVscStateOperational` 在 AllDisksInStripe 配置的节点上始终为 false
- `VmHyperVIcHeartbeat` 和 `VmPowerState` 是 string 类型，不是 int，使用字符串比较
- `Context` 字段可区分 VM 状态（StartVm / StopVm / VirtualMachineRestarted）
- `VmIncarnationId` 可用于区分不同的 VM 启动会话
- 建议使用 VmHealthTransitionStateEtwTable 查看状态变化点
