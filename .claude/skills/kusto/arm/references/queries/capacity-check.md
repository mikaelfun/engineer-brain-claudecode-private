---
name: capacity-check
description: 查询容量检查操作
tables:
  - CapacityTraces
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: correlationId
    required: false
    description: 关联 ID
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
---

# 容量检查查询

## 用途

查询 ARM 容量检查操作，排查容量相关的分配失败、配额问题。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {correlationId} | 否 | 关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {startDate} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endDate} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

---

## 查询 1: 按 correlationId 查询容量检查

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').CapacityTraces
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, providerNamespace, resourceType, skuName, location, status, message, quotaId
| order by TIMESTAMP asc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("General","CapacityTraces")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, providerNamespace, skuName, location, status, message
| order by TIMESTAMP asc
```

---

## 查询 2: 查询失败的容量检查

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').CapacityTraces
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where status != "Succeeded" and status != ""
| project TIMESTAMP, providerNamespace, resourceType, skuName, location, status, message, quotaId
| order by TIMESTAMP desc
```

---

## 查询 3: 按 SKU 统计容量检查

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').CapacityTraces
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| summarize 
    TotalChecks = count(),
    SuccessChecks = countif(status == "Succeeded"),
    FailedChecks = countif(status != "Succeeded")
    by skuName, location
| order by FailedChecks desc
```

---

## 查询 4: 按位置查询容量问题

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').CapacityTraces
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where location == "{location}"
| where status != "Succeeded"
| project TIMESTAMP, skuName, skuFamily, status, message, resourceCount
| order by TIMESTAMP desc
```

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| skuName | SKU 名称 |
| skuFamily | SKU 系列 |
| location | 位置 |
| status | 容量检查状态 |
| message | 消息（包含错误详情） |
| quotaId | 配额 ID |
| resourceCount | 资源数量 |

## 常见容量检查失败原因

| 原因 | 说明 |
|------|------|
| SKU 不可用 | 该 SKU 在指定位置不可用 |
| 配额不足 | 订阅配额已用尽 |
| 容量限制 | 区域容量限制 |

## 关联查询

- [failed-operations.md](./failed-operations.md) - 失败操作查询
- [activity-log.md](./activity-log.md) - 活动日志查询
