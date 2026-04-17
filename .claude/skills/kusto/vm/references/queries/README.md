# 查询模板格式定义 (queries/)

> **⚠️ Fusion Guide 整合通知**
> 
> 本目录中的 KQL 查询模板已被整合到 Product Skill 的融合排查指南中：
> `.claude/skills/products/{product}/guides/details/*.md`
> 
> **Troubleshooter 加载优先级**：
> 1. 优先读取 `.claude/skills/products/{product}/guides/` 中的融合指南（含嵌入的 KQL）
> 2. 融合指南未覆盖的场景 → fallback 到本目录的查询文件
> 
> 本目录保留作为 fallback 和历史参考，不会被删除。
> 各查询文件的 frontmatter 中 `deprecated: true` 表示已被融合，`fusedTo` 指向对应指南。

本目录存放 KQL 查询模板文件，每个文件对应一个或一组相关查询。

## 文件命名规范

```
{场景}-{操作}.md
```

示例：
- `cluster-snapshot.md` - 集群快照查询
- `operation-tracking.md` - 操作追踪查询
- `error-diagnosis.md` - 错误诊断查询

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
  - name: cluster
    required: true
    description: AKS 集群名称
  - name: startDate
    required: false
    default: ago(1d)
    description: 开始时间
---

# 查询标题

## 用途

描述此查询的用途和适用场景。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {cluster} | 是 | 集群名称 | my-aks-cluster |

## 查询语句

\```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| where clusterName == "{cluster}"
| project PreciseTimeStamp, clusterName, provisioningState, powerState
| sort by PreciseTimeStamp desc
\```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| PreciseTimeStamp | 精确时间戳 |
| clusterName | 集群名称 |
| provisioningState | 预配状态 |

## 变体查询

### 变体 1: 检查异常状态

\```kql
// 筛选异常状态
| where provisioningState != "Succeeded"
\```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 追踪操作详情
```

## 参数占位符规范

使用 `{paramName}` 格式定义参数占位符：

| 占位符 | 说明 |
|--------|------|
| `{subscription}` | 订阅 ID |
| `{resourceGroup}` | 资源组名称 |
| `{cluster}` | 集群/资源名称 |
| `{startDate}` | 开始时间 |
| `{endDate}` | 结束时间 |
| `{correlationId}` | 关联 ID |
| `{operationId}` | 操作 ID |
| `{ccpNamespace}` | CCP 命名空间 |

## 时间参数格式

- **绝对时间**: `datetime(2025-01-01T00:00:00.000Z)`
- **相对时间**: `ago(1d)`, `ago(24h)`, `ago(30m)`
- **时间范围**: `between (datetime(...)..datetime(...))`
