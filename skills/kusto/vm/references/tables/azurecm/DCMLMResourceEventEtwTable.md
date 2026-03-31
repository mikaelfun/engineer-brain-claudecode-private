---
name: DCMLMResourceEventEtwTable
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: DCM 生命周期资源事件表，记录节点资源的生命周期状态变更
status: active
---

# DCMLMResourceEventEtwTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

记录 DCM (Data Center Management) 资源的生命周期事件，包括节点的状态变更、组件故障和维修活动。用于追踪硬件维修和节点可用性。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | |
| SourceNodeId | string | 节点 ID | |
| State | string | 资源状态 | |
| Assignee | string | 负责人/团队 | |
| ResourceId | string | 资源 ID | |
| ComponentName | string | 组件名称 | |
| Severity | string | 严重级别 | |
| Description | string | 事件描述 | |
| DeviceType | string | 设备类型 | |

## 常用筛选字段

- `SourceNodeId` - 按节点 ID 筛选
- `State` - 按状态筛选
- `ComponentName` - 按组件筛选

## 典型应用场景

1. **硬件维修追踪** - 查看节点组件的维修状态
2. **节点生命周期分析** - 追踪节点从故障到恢复的过程
3. **Service Healing 辅助分析** - 结合 Service Healing 事件确认根因

## 示例查询

```kql
DCMLMResourceEventEtwTable
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where SourceNodeId == "{nodeId}"
| project PreciseTimeStamp, State, ComponentName, Severity, Description
| order by PreciseTimeStamp desc
```

## 关联表

- [RdmResourceSnapshot.md](./RdmResourceSnapshot.md) - 节点资源快照
- [TMMgmtNodeFaultEtwTable.md](./TMMgmtNodeFaultEtwTable.md) - 节点故障事件
