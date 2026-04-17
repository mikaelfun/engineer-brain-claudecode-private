# Queries 目录

本目录包含 AVD Kusto 查询模板。

## 查询列表

### 诊断入口查询

| 查询 | 说明 | 文档 |
|------|------|------|
| user-activity | 用户活动和错误查询 | [📄](./user-activity.md) |
| connection-tracking | 连接链路追踪 | [📄](./connection-tracking.md) |

### 健康检查查询

| 查询 | 说明 | 文档 |
|------|------|------|
| health-check | 健康检查状态 | [📄](./health-check.md) |
| heartbeat | 心跳检测 | [📄](./heartbeat.md) |
| url-access-check | URL 访问检查 | [📄](./url-access-check.md) |

### 资源信息查询

| 查询 | 说明 | 文档 |
|------|------|------|
| session-host | Session Host 信息 | [📄](./session-host.md) |
| hostpool-info | 主机池配置 | [📄](./hostpool-info.md) |
| deployment-info | 部署信息（租户、应用组） | [📄](./deployment-info.md) |

### 专项诊断查询

| 查询 | 说明 | 文档 |
|------|------|------|
| msix-appattach | MSIX App Attach 诊断 | [📄](./msix-appattach.md) |
| gateway-broker | Gateway/Broker 信息 | [📄](./gateway-broker.md) |
| rdp-core-events | RDP 核心事件 | [📄](./rdp-core-events.md) |

## 查询文档格式

每个查询文档包含：

1. **元数据** - 查询名称、描述、使用的表、参数
2. **用途** - 查询的主要用途
3. **必要参数** - 必填参数说明
4. **查询语句** - KQL 代码
5. **结果字段说明** - 输出字段解释
6. **关联查询** - 相关查询链接
