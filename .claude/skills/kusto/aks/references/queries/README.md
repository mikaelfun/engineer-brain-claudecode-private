# 查询模板 (queries/)

本目录存放 KQL 查询模板文件，每个文件对应一个或一组相关查询。

## 查询索引

### 集群基础查询

| 查询 | 用途 | 文件 |
|------|------|------|
| 集群快照 | 获取集群基础信息、CCP Namespace、FQDN | [cluster-snapshot.md](./cluster-snapshot.md) |
| 操作追踪 | 追踪创建、升级、扩缩容操作 | [operation-tracking.md](./operation-tracking.md) |
| ARM/CRP 追踪 | 追踪 ARM 和 CRP 请求链路 | [arm-crp-tracking.md](./arm-crp-tracking.md) |

### 控制平面日志

| 查询 | 用途 | 文件 |
|------|------|------|
| 控制平面日志 | API Server、Controller Manager 等组件日志 | [controlplane-logs.md](./controlplane-logs.md) |
| Autoscaler 分析 | Cluster Autoscaler 操作和决策分析 | [autoscaler-analysis.md](./autoscaler-analysis.md) |
| Kubernetes 事件 | 节点、Pod 事件（类似 kubectl get events） | [kube-events.md](./kube-events.md) |

### 诊断和分析

| 查询 | 用途 | 文件 |
|------|------|------|
| Pod 重启分析 | 分析 Pod 重启原因和历史 | [pod-restart-analysis.md](./pod-restart-analysis.md) |
| 告警查询 | AKS 集群健康告警 | [alertmanager.md](./alertmanager.md) |
| 补救器事件 | 自动修复操作 | [remediator-events.md](./remediator-events.md) |
| 自动升级 | 自动升级执行情况 | [auto-upgrade.md](./auto-upgrade.md) |
| Deprecated APIs | 检查 K8s Deprecated APIs 使用情况 | [deprecated-apis.md](./deprecated-apis.md) |
| API Throttling | API Server 请求和 Throttling 分析 | [api-throttling-analysis.md](./api-throttling-analysis.md) |
| Extension Manager | AKS 扩展管理器日志 | [extension-manager.md](./extension-manager.md) |
| HCP Context Activity | HCP 上下文活动日志 | [hcp-context-activity.md](./hcp-context-activity.md) |

---

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
