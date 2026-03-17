# 表结构定义 (tables/)

本目录存放 AVD 相关的 Kusto 表结构定义文件，每个文件对应一个表。

## 表索引

### WVD 数据库 (AVD 主要诊断数据)

> 集群: `rdskmc.chinaeast2.kusto.chinacloudapi.cn` (Mooncake)
> 备选: `rdsprod.eastus2.kusto.windows.net` (Global)

#### 诊断日志表

| 表名 | 用途 | 文件 |
|------|------|------|
| DiagActivity | 用户活动诊断（连接、Feed） | [DiagActivity.md](./DiagActivity.md) |
| DiagError | 错误详情 | [DiagError.md](./DiagError.md) |

#### 基础设施日志表

| 表名 | 用途 | 文件 |
|------|------|------|
| RDInfraTrace | Agent、Broker、Gateway 日志 | [RDInfraTrace.md](./RDInfraTrace.md) |
| RDClientTrace | 客户端日志 | [RDClientTrace.md](./RDClientTrace.md) |
| RDPCoreTSEventLog | RDSH 主机 RDP 事件 | [RDPCoreTSEventLog.md](./RDPCoreTSEventLog.md) |

#### 操作和健康表

| 表名 | 用途 | 文件 |
|------|------|------|
| RDOperation | 健康检查和操作结果 | [RDOperation.md](./RDOperation.md) |
| ShoeboxAgentHealth | ARM 诊断健康检查 | [ShoeboxAgentHealth.md](./ShoeboxAgentHealth.md) |
| RDAgentMetadata | VM 和 Agent 元数据 | [RDAgentMetadata.md](./RDAgentMetadata.md) |

#### 配置信息表

| 表名 | 用途 | 文件 |
|------|------|------|
| HostPool | 主机池配置 | [HostPool.md](./HostPool.md) |
| AppGroup | 应用组信息 | [AppGroup.md](./AppGroup.md) |
| RDTenant | 租户信息 | [RDTenant.md](./RDTenant.md) |

---

## 文件命名规范

```
{TableName}.md
```

## 文件格式

每个表定义文件使用以下格式：

```markdown
---
name: TableName
database: WVD
cluster: https://rdskmc.chinaeast2.kusto.chinacloudapi.cn
description: 表描述
status: active|deprecated
---

# TableName

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | WVD |
| 状态 | ✅ 可用 / ⚠️ 已弃用 |

## 用途 / 关键字段 / 常用筛选字段 / 典型应用场景 / 示例查询 / 关联表 / 注意事项
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
