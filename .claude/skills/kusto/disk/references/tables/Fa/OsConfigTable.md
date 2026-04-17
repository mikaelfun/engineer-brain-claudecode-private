---
name: OsConfigTable
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
database: Fa
description: 主机节点配置信息表，包含磁盘、网络、系统等配置项。
---

# OsConfigTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | AzCore (https://azcore.chinanorth3.kusto.chinacloudapi.cn) |
| 数据库 | Fa |
| 数据延迟 | 约 10 分钟 |
| 保留期 | 30 天 |

## 用途

存储主机节点的各种配置信息，包括磁盘配置、网络配置、系统参数等。

## 核心字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 记录时间 |
| NodeId | string | 主机节点 ID |
| ConfigType | string | 配置类型 |
| Component | string | 组件名称 |
| ConfigName | string | 配置项名称 |
| ConfigValue | string | 配置项值 |
| ConfigPath | string | 配置路径 |
| Cluster | string | 集群名称 |

## 常用配置项

| ConfigName | 说明 |
|------------|------|
| disk.* | 磁盘相关配置 |
| storage.* | 存储相关配置 |
| vhd.* | VHD 相关配置 |
| network.* | 网络相关配置 |

## 示例查询

### 查询节点磁盘配置

```kql
OsConfigTable
| where PreciseTimeStamp >= ago(1h)
| where NodeId == "{nodeId}"
| where ConfigName has "disk"
| project PreciseTimeStamp, ConfigName, ConfigValue
```

## 关联表

- [OsXIOSurfaceCounterTable](./OsXIOSurfaceCounterTable.md) - IO 性能指标
- [VhdDiskEtwEventTable](./VhdDiskEtwEventTable.md) - VHD 事件日志
