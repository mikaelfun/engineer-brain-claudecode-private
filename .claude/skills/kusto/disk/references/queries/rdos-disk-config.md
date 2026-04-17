---
name: rdos-disk-config
description: RDOS 磁盘配置查询
tables:
  - OsConfigTable
parameters:
  - name: nodeId
    required: true
    description: 主机节点 ID
  - name: startTime
    required: true
    description: 开始时间
  - name: endTime
    required: true
    description: 结束时间
---

# RDOS 磁盘配置查询

## 用途

查询主机节点上的磁盘配置信息，包括挂载的托管磁盘和本地磁盘。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {nodeId} | 是 | 主机节点 ID | guid |
| {startTime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endTime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询 1: 节点磁盘配置

```kql
let nodeId = "{nodeId}";
let startTime = datetime({startTime});
let endTime = datetime({endTime});
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsConfigTable
| where PreciseTimeStamp between (startTime .. endTime)
| where NodeId == nodeId
| project PreciseTimeStamp, NodeId, ConfigName, ConfigValue
| where ConfigName has "disk" or ConfigName has "storage"
| order by PreciseTimeStamp desc
| take 100
```

### 查询 2: 最新磁盘配置快照

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsConfigTable
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}"
| summarize arg_max(PreciseTimeStamp, *) by ConfigName
| where ConfigName has "disk" or ConfigName has "vhd" or ConfigName has "storage"
| project ConfigName, ConfigValue, PreciseTimeStamp
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| NodeId | 主机节点 ID |
| ConfigName | 配置项名称 |
| ConfigValue | 配置项值 |
| PreciseTimeStamp | 配置记录时间 |

## 关联查询

- [disk-metadata.md](./disk-metadata.md) - 磁盘元数据查询
- [io-performance.md](./io-performance.md) - IO 性能分析
