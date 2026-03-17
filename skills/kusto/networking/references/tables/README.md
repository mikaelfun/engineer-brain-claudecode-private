# 表结构定义 (tables/)

本目录存放 Networking 相关 Kusto 表结构定义文件，每个文件对应一个表。

## 表索引

### aznwmds 数据库 (网络 MDS 日志)

| 表名 | 用途 | 文件 |
|------|------|------|
| TunnelEventsTable | VPN Gateway 隧道事件 | [TunnelEventsTable.md](./TunnelEventsTable.md) |
| GatewayTenantHealth | 网关租户健康状态 | [GatewayTenantHealth.md](./GatewayTenantHealth.md) |
| CircuitTable | ExpressRoute 线路信息 | [CircuitTable.md](./CircuitTable.md) |
| NMAgentCriticalErrorFifteenMinuteTable | NMAgent 关键错误 | [NMAgentCriticalErrorFifteenMinuteTable.md](./NMAgentCriticalErrorFifteenMinuteTable.md) |
| ApplicationGatewaysExtendedLatestProd | Application Gateway 信息 | [ApplicationGatewaysExtendedLatestProd.md](./ApplicationGatewaysExtendedLatestProd.md) |
| Servers | 服务器节点信息 | [Servers.md](./Servers.md) |
| DeviceInterfaceLinks | 设备接口链接 | [DeviceInterfaceLinks.md](./DeviceInterfaceLinks.md) |
| DeviceStatic | 设备静态信息 | [DeviceStatic.md](./DeviceStatic.md) |
| DeviceIpInterface | 设备 IP 接口 | [DeviceIpInterface.md](./DeviceIpInterface.md) |
| NodeCapabilitiesEvent | 节点 VM 能力信息 | [NodeCapabilitiesEvent.md](./NodeCapabilitiesEvent.md) |

> ⚠️ **注意**: `HolmesNodeMetadataEvent` 表（用于查询节点硬件代系信息）在当前 Mooncake 集群中不可用。

### AzureResourceGraph 数据库 (ARG 资源图)

| 表名 | 用途 | 文件 |
|------|------|------|
| Resources | Azure 资源图 | [Resources_ARG.md](./Resources_ARG.md) |

---

## 文件命名规范

```
{TableName}.md
```

使用表的实际名称，如：
- `TunnelEventsTable.md`
- `GatewayTenantHealth.md`
- `CircuitTable.md`

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
| 集群 | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | aznwmds |
| 状态 | ✅ 可用 / ⚠️ 已弃用 |

## 用途

描述此表的主要用途和适用场景。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| GatewayId | string | Gateway 资源 ID |

## 常用筛选字段

- `GatewayId` - 按网关筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **场景 1**: VPN 隧道连接问题排查
2. **场景 2**: ExpressRoute 线路诊断

## 示例查询

\```kql
TableName
| where TIMESTAMP > ago(1d)
| where GatewayId == "{gatewayId}"
| project TIMESTAMP, TunnelName, Message
| take 10
\```

## 关联表

- [RelatedTable.md](./RelatedTable.md) - 关联说明

## 注意事项

- 注意事项 1
- 注意事项 2
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
