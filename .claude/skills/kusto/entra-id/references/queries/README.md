# 查询模板 (queries/)

本目录存放 Entra ID 相关 KQL 查询模板文件，每个文件对应一个或一组相关查询。

## 查询索引

### 认证和登录

| 查询 | 用途 | 文件 |
|------|------|------|
| 登录日志 | ESTS 登录请求详情、错误代码 | [signin-logs.md](./signin-logs.md) |
| 条件访问解码 | 解码 MultiCAEvaluationLog，分析策略评估 | [conditional-access-decode.md](./conditional-access-decode.md) |
| 诊断跟踪 | 获取详细诊断消息和异常信息 | [diagnostic-traces.md](./diagnostic-traces.md) |
| MFA 详情 | MFA 认证事件、错误、认证方法 | [mfa-detail.md](./mfa-detail.md) |

### 目录操作

| 查询 | 用途 | 文件 |
|------|------|------|
| 审计日志 | 用户/组/设备增删改操作历史 | [audit-logs.md](./audit-logs.md) |
| AAD Connect 同步 | 同步活动和详细事件 | [aad-connect-sync.md](./aad-connect-sync.md) |
| 授权管理 | 权限和授权事件查询 | [authorization-manager.md](./authorization-manager.md) |

### 网关和节流

| 查询 | 用途 | 文件 |
|------|------|------|
| 网关节流检测 | 检测租户是否被节流 | [gateway-throttle.md](./gateway-throttle.md) |

---

## 常见场景速查

| 场景 | 推荐查询 | 关键参数 | 时间范围建议 |
|------|---------|---------|-------------|
| 登录失败排查 | signin-logs + diagnostic-traces | CorrelationId | 1-6h |
| 条件访问策略分析 | conditional-access-decode | CorrelationId | 1-24h |
| MFA 电话/短信被阻止 | mfa-detail | userId, trackingId | 1-10d |
| 用户被删除追踪 | audit-logs | objectId | 7-30d |
| AAD Connect 同步状态 | aad-connect-sync | tenantId | 1-7d |
| 网关节流检测 | gateway-throttle | tenantId | 1h-1d |
| 权限被拒绝诊断 | authorization-manager | correlationId | 1d |

---

## 文件命名规范

```
{场景}-{操作}.md
```

示例：
- `signin-logs.md` - 登录日志查询
- `conditional-access-decode.md` - 条件访问解码
- `mfa-detail.md` - MFA 详细日志

## 参数占位符规范

使用 `{paramName}` 格式定义参数占位符：

| 占位符 | 说明 |
|--------|------|
| `{correlationId}` | 关联 ID (AAD 请求关联 ID) |
| `{tenantId}` | 租户 ID |
| `{userId}` | 用户对象 ID |
| `{deviceId}` | 设备 ID |
| `{objectId}` | 通用对象 ID |
| `{startTime}` | 开始时间 (datetime 格式) |
| `{endTime}` | 结束时间 (datetime 格式) |
| `{trackingId}` | MFA 追踪 ID (等于 ESTS CorrelationId) |

## 时间参数格式

- **绝对时间**: `datetime(2026-01-01T00:00:00.000Z)`
- **相对时间**: `ago(1d)`, `ago(24h)`, `ago(30m)`
- **时间范围**: `between (datetime(...)..datetime(...))`

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
