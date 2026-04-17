---
name: arm-rp-chain
description: 追踪 ARM 到资源提供程序的调用链
tables:
  - HttpOutgoingRequests
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: resourceName
    required: true
    description: 资源名称
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
---

# ARM-RP 调用链追踪

## 用途

追踪 ARM 发送到资源提供程序（RP）的请求，获取 ActivityId 用于关联 CRP 等 RP 日志。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {resourceName} | 是 | 资源名称 | my-vm |
| {startDate} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endDate} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

---

## 步骤 1: 从 ARM 获取 ActivityId

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpOutgoingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where targetUri contains "{resourceName}"
| project TIMESTAMP, ActivityId, serviceRequestId, clientRequestId, targetUri, httpMethod, httpStatusCode, hostName
| order by TIMESTAMP desc
```

### Public Cloud 查询

> ⚠️ **注意**: Public Cloud ARM 集群当前无访问权限，以下查询仅供参考。

```kql
// Public Cloud 查询 - 需要 ARM Prod 权限
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpOutgoingRequests")
// 请联系 ARM 团队申请权限
`````

---

## 步骤 2: 使用 ActivityId 查询 CRP (Mooncake)

使用步骤 1 获取的 `ActivityId` 查询 CRP 日志：

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where activityId == "{activityId}"  // 从步骤 1 获取
| project TIMESTAMP, traceLevel, message, callerName
| order by TIMESTAMP asc
```

---

## 步骤 2 (替代): 使用 ActivityId 查询 CRP (Public Cloud)

```kql
// cluster('azcrp.kusto.windows.net').database('crp_allprod') // Public Cloud - 需要权限.ContextActivity
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where activityId == "{activityId}"
| project TIMESTAMP, traceLevel, message, callerName
| order by TIMESTAMP asc
```

---

## 完整链路查询示例

### Mooncake - 从 ARM 到 CRP 的完整追踪

```kql
// 步骤 1: 获取 ARM 出站请求的 ActivityId
let armOutgoing = 
    cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpOutgoingRequests
    | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
    | where subscriptionId == "{subscription}"
    | where targetUri contains "{resourceName}"
    | where hostName contains "compute"  // CRP 主机
    | project TIMESTAMP, ActivityId, targetUri, httpStatusCode;
// 步骤 2: 使用 ActivityId 查询 CRP
let activityIds = armOutgoing | project ActivityId;
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where activityId in (activityIds)
| project TIMESTAMP, activityId, traceLevel, message
| order by TIMESTAMP asc
```

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| ActivityId | 活动 ID（关键字段，用于关联 RP 日志） |
| serviceRequestId | 服务请求 ID |
| targetUri | 目标 URI |
| hostName | 目标 RP 主机名 |
| httpStatusCode | HTTP 状态码 |

## 常见 RP 主机名

| hostName 包含 | 资源提供程序 |
|---------------|-------------|
| compute | Microsoft.Compute (CRP) |
| network | Microsoft.Network |
| containerservice | Microsoft.ContainerService (AKS) |
| storage | Microsoft.Storage |

## 关联查询

- [request-tracking.md](./request-tracking.md) - 完整请求追踪
- [activity-log.md](./activity-log.md) - 活动日志查询
