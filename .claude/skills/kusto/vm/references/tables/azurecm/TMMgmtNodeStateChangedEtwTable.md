---
name: TMMgmtNodeStateChangedEtwTable
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: 节点状态变更表，记录节点状态转换
status: active
---

# TMMgmtNodeStateChangedEtwTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

记录节点状态的转换事件，包括 Ready → Booting、Ready → OutForRepair 等状态变化。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| BladeID | string | 节点 ID |
| Tenant | string | 集群名称 |
| OldState | string | 旧状态 |
| NewState | string | 新状态 |

## 常见节点状态

| 状态 | 说明 |
|------|------|
| Ready | 正常就绪 |
| Booting | 启动中 |
| OutForRepair | 维修中 |
| HumanInvestigate | 需人工调查 |
| PoweredOff | 已关机 |
| Dead | 死机 |
| Recovering | 恢复中 |

## 示例查询

### 查询节点状态变更

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtNodeStateChangedEtwTable  
| where BladeID == "{nodeId}" 
| where PreciseTimeStamp >= datetime({starttime}) 
| where PreciseTimeStamp <= datetime({endtime})   
| project PreciseTimeStamp, BladeID, OldState, NewState
```

### 确认集群内多节点重启

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtNodeStateChangedEtwTable  
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime}) 
| where Tenant == "{cluster}" 
| where NewState == "Booting" 
| project PreciseTimeStamp, BladeID, OldState, NewState
```

## 关联表

- [TMMgmtNodeEventsEtwTable.md](./TMMgmtNodeEventsEtwTable.md) - 节点事件
- [LogNodeSnapshot.md](./LogNodeSnapshot.md) - 节点快照
