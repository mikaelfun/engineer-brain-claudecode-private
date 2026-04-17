# 查询模板 (queries/)

本目录存放 Azure Monitor KQL 查询模板文件，每个文件对应一个或一组相关查询。

## 查询索引

### 警报查询

| 查询 | 用途 | 文件 |
|------|------|------|
| Metric Alerts | Metric Alerts 触发记录查询 | [metric-alerts.md](./metric-alerts.md) |
| Scheduled Query Rules | 日志搜索规则执行查询 | [scheduled-query-rules.md](./scheduled-query-rules.md) |
| AMP SLI | 警报管理平台 SLI 指标 | [amp-sli.md](./amp-sli.md) |
| Notification Service | 通知服务 (Action Groups) 查询 | [notification-service.md](./notification-service.md) |

### 诊断设置查询

| 查询 | 用途 | 文件 |
|------|------|------|
| Diagnostic Settings | 诊断设置问题排查 | [diagnostic-settings.md](./diagnostic-settings.md) |

---

## 文件命名规范

```
{场景}-{操作}.md
```

示例：
- `metric-alerts.md` - Metric Alerts 查询
- `scheduled-query-rules.md` - Scheduled Query Rules 查询
- `diagnostic-settings.md` - 诊断设置查询

## 文件格式

每个查询模板文件使用以下格式：

```markdown
---
name: query-name
description: 查询描述
tables:
  - TableName1
  - TableName2
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: startDate
    required: true
    description: 开始时间
---

# 查询标题

## 用途

描述此查询的用途和适用场景。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

## 查询语句

\```kql
cluster('...').database('...').traces
| where env_time > ago(1d)
| project env_time, message
\```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间戳 |
| message | 日志消息 |
```

## 参数占位符规范

使用 `{paramName}` 格式定义参数占位符：

| 占位符 | 说明 |
|--------|------|
| `{subscription}` | 订阅 ID |
| `{resourceGroup}` | 资源组名称 |
| `{alertRuleId}` | 警报规则 ID |
| `{alertName}` | 警报规则名称 |
| `{targetResource}` | 目标资源 ID |
| `{startDate}` | 开始时间 |
| `{endDate}` | 结束时间 |

## 时间参数格式

- **绝对时间**: `datetime(2025-01-01T00:00:00.000Z)`
- **相对时间**: `ago(1d)`, `ago(24h)`, `ago(30m)`
- **时间范围**: `between (datetime(...)..datetime(...))`
