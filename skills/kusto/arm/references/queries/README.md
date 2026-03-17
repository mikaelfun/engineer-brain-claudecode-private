# 查询模板 (queries/)

本目录存放 ARM KQL 查询模板文件，每个文件对应一个或一组相关查询。

## 查询索引

### 请求追踪

| 查询 | 用途 | 文件 |
|------|------|------|
| 请求追踪 | 使用 correlationId 追踪完整操作链 | [request-tracking.md](./request-tracking.md) |
| 活动日志 | 查询 ARM 活动日志事件 | [activity-log.md](./activity-log.md) |
| ARM-RP 调用链 | 追踪 ARM 到资源提供程序的调用 | [arm-rp-chain.md](./arm-rp-chain.md) |

### 限流分析

| 查询 | 用途 | 文件 |
|------|------|------|
| 限流分析 | 排查 429 限流问题 | [throttling-analysis.md](./throttling-analysis.md) |

### 部署分析

| 查询 | 用途 | 文件 |
|------|------|------|
| 部署追踪 | 追踪 ARM 模板部署 | [deployment-tracking.md](./deployment-tracking.md) |

### 错误诊断

| 查询 | 用途 | 文件 |
|------|------|------|
| 失败操作 | 查找失败的 ARM 操作 | [failed-operations.md](./failed-operations.md) |
| 容量检查 | 查询容量检查操作 | [capacity-check.md](./capacity-check.md) |

---

## 文件命名规范

```
{场景}-{操作}.md
```

示例：
- `request-tracking.md` - 请求追踪查询
- `throttling-analysis.md` - 限流分析查询
- `deployment-tracking.md` - 部署追踪查询

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
  - name: correlationId
    required: false
    description: 关联 ID
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
cluster('armmcadx.chinaeast2').database('armmc').EventServiceEntries
| where PreciseTimeStamp > ago(1d)
| where subscriptionId == "{subscription}"
\```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| TIMESTAMP | 时间戳 |

## 关联查询

- [related-query.md](./related-query.md) - 关联说明
```

## 参数占位符规范

使用 `{paramName}` 格式定义参数占位符：

| 占位符 | 说明 |
|--------|------|
| `{subscription}` | 订阅 ID |
| `{resourceGroup}` | 资源组名称 |
| `{resourceName}` | 资源名称 |
| `{startDate}` | 开始时间 |
| `{endDate}` | 结束时间 |
| `{correlationId}` | 关联 ID |
| `{operationId}` | 操作 ID |
| `{deploymentName}` | 部署名称 |
| `{activityId}` | 活动 ID（用于关联 RP 日志）|

## 时间参数格式

- **绝对时间**: `datetime(2025-01-01T00:00:00.000Z)`
- **相对时间**: `ago(1d)`, `ago(24h)`, `ago(30m)`
- **时间范围**: `between (datetime(...)..datetime(...))`
