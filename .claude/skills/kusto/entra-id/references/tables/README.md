# 表结构定义 (tables/)

本目录存放 Entra ID 相关的 Kusto 表结构定义文件，每个文件对应一个表。

## 表索引

### ESTS 数据库 (登录服务)

> 集群: `estscnn2.chinanorth2.kusto.chinacloudapi.cn` (Mooncake)

| 表名 | 用途 | 文件 |
|------|------|------|
| PerRequestTableIfx | 认证请求详情 | [PerRequestTableIfx.md](./PerRequestTableIfx.md) |
| DiagnosticTracesIfx | 诊断跟踪日志 | [DiagnosticTracesIfx.md](./DiagnosticTracesIfx.md) |

### MSODS 数据库 (目录服务)

> 集群: `mslodsmc.chinanorth2.kusto.chinacloudapi.cn` (Mooncake)

| 表名 | 用途 | 文件 |
|------|------|------|
| IfxAuditLoggingCommon | 目录对象审计日志 | [IfxAuditLoggingCommon.md](./IfxAuditLoggingCommon.md) |
| IfxUlsEvents | 内部操作事件日志 | [IfxUlsEvents.md](./IfxUlsEvents.md) |
| IfxBECAuthorizationManager | 授权管理日志 | [IfxBECAuthorizationManager.md](./IfxBECAuthorizationManager.md) |

### MFA 数据库 (多因素认证)

> 集群: `phonefactormc-bjb.chinanorth2.kusto.chinacloudapi.cn` / `phonefactormc-sha.chinaeast2.kusto.chinacloudapi.cn` (Mooncake)

| 表名 | 用途 | 文件 |
|------|------|------|
| SASCommonEvent | MFA 通用事件日志 | [SASCommonEvent.md](./SASCommonEvent.md) |
| SASRequestEvent | MFA 请求事件 | [SASRequestEvent.md](./SASRequestEvent.md) |
| CappWebSvcRequest | 外部提供商通信日志 | [CappWebSvcRequest.md](./CappWebSvcRequest.md) |

### AAD Gateway 数据库 (网关)

> 集群: `aadgatewaymc-bjb.chinanorth2.kusto.chinacloudapi.cn` / `aadgatewaymc-sha.chinaeast2.kusto.chinacloudapi.cn` (Mooncake)

| 表名 | 用途 | 文件 |
|------|------|------|
| RequestSummaryEventCore | 网关请求摘要 | [RequestSummaryEventCore.md](./RequestSummaryEventCore.md) |

---

## 文件命名规范

```
{TableName}.md
```

使用表的实际名称，如：
- `PerRequestTableIfx.md`
- `SASCommonEvent.md`
- `RequestSummaryEventCore.md`

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
| 集群 | https://estscnn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | ESTS |
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
