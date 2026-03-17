---
name: FaultHandlingRecoveryEventEtwTable
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: 故障处理恢复事件表
status: active
---

# FaultHandlingRecoveryEventEtwTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

记录 Fabric 层的故障处理和恢复事件，包括 PowerCycle、RebootNode、MarkNodeAsUnallocatable 等恢复操作。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| NodeId | string | 节点 ID |
| Reason | string | 故障原因 |
| RecoveryAction | string | 恢复操作 |
| RecoveryResult | string | 恢复结果 |

## 常见恢复操作

| RecoveryAction | 说明 |
|----------------|------|
| PowerCycle | 电源循环 |
| RebootNode | 重启节点 |
| MarkNodeAsUnallocatable | 标记节点为不可分配 |
| MarkNodeAsHumanInvestigate | 标记节点需人工调查 |

## 示例查询

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').FaultHandlingRecoveryEventEtwTable
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime})
| where NodeId == "{nodeId}"
| project PreciseTimeStamp, NodeId, Reason, RecoveryAction, RecoveryResult
| order by PreciseTimeStamp asc
```

## 关联表

- [TMMgmtNodeEventsEtwTable.md](./TMMgmtNodeEventsEtwTable.md) - 节点事件
- [LogNodeSnapshot.md](./LogNodeSnapshot.md) - 节点快照
