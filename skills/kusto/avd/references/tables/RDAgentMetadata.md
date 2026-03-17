---
name: RDAgentMetadata
database: WVD
cluster: https://rdskmc.chinaeast2.kusto.chinacloudapi.cn
description: AVD Agent 和 VM 元数据信息
status: active
---

# RDAgentMetadata

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | WVD |
| 状态 | ✅ 可用 |

## 用途

记录 Session Host VM 和 RD Agent 的元数据信息，包括 VM 大小、SKU、位置、订阅等信息。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Env | string | 环境 |
| Region | string | 区域 |
| RDTenant | string | RD 租户 |
| HostPool | string | 主机池 |
| HostInstance | string | Session Host FQDN |
| HostPoolId | string | 主机池 ID |
| SessionHostId | string | Session Host ID |
| Location | string | VM 位置 |
| ResourceName | string | 资源名称 |
| OsType | string | 操作系统类型 |
| Sku | string | VM SKU |
| VmSize | string | VM 大小 |
| SubscriptionId | string | 订阅 ID |
| OsDiskId | string | OS 磁盘 ID |
| DataDiskIds | string | 数据磁盘 ID 列表 |
| AzureResourceId | string | Azure 资源 ID |
| Props | string | 附加属性 (JSON) |
| ActivityId | string | 活动 ID |

## 常用筛选字段

- `SubscriptionId` - 按订阅筛选
- `HostPool` - 按主机池筛选
- `HostInstance` - 按 Session Host 筛选
- `VmSize` - 按 VM 大小筛选

## 典型应用场景

1. **VM 信息查询** - 获取 Session Host 的 VM 配置信息
2. **资源清单** - 按订阅或主机池列出所有 Session Host
3. **配置审计** - 检查 VM SKU 和大小配置

## 示例查询

### 按订阅获取 VM 信息

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDAgentMetadata
| where SubscriptionId == "{SubscriptionId}"
| where TIMESTAMP >= ago(6h)
| project TIMESTAMP, SubscriptionId, HostPool, HostInstance, 
          Location, OsType, Sku, VmSize, Region
| summarize arg_max(TIMESTAMP, *) by HostInstance
```

### 按 Host Pool 获取 VM 信息

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDAgentMetadata
| where HostPool has "{HostPoolName}"
| where TIMESTAMP > ago(1d)
| project TIMESTAMP, HostPool, HostInstance, VmSize, Sku, Location, OsType
| summarize arg_max(TIMESTAMP, *) by HostInstance
```

### 按 Session Host 获取详细信息

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDAgentMetadata
| where HostInstance has "{SessionHostName}"
| where TIMESTAMP >= ago(1d)
| project TIMESTAMP, SubscriptionId, HostPool, HostInstance, 
          Location, OsType, Sku, VmSize, AzureResourceId
| take 1
```

## 关联表

- [RDOperation.md](./RDOperation.md) - 通过 HostInstance 关联
- [HostPool.md](./HostPool.md) - 通过 HostPoolId 关联

## 注意事项

- 此表记录的是元数据快照，使用 `summarize arg_max()` 获取最新记录
- Props 字段包含 JSON 格式的附加属性
