---
name: HyperVWorkerTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: Hyper-V Worker 表，记录 VM 内存分配等操作
status: active
---

# HyperVWorkerTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录 Hyper-V Worker 进程的操作，特别是 VM/容器启动时的内存分配操作。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| NodeId | string | 节点 ID |
| TaskName | string | 任务名称 |
| Message | string | 消息内容 |

## 示例查询

### 查询 VM 启动时的内存分配

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').HyperVWorkerTable
| where PreciseTimeStamp between(datetime({starttime})..24h) and NodeId == "{nodeId}" 
| where TaskName == "TimeSpentInMemoryOperation"
| where Message contains "{vmid}"
| sort by TIMESTAMP asc
| project PreciseTimeStamp, Message
```

## 关联表

- [VmHealthRawStateEtwTable.md](./VmHealthRawStateEtwTable.md) - VM 健康状态
- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 获取 NodeId
