---
name: activity-log
description: 查询 ARM 活动日志事件
tables:
  - EventServiceEntries
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
  - name: resourceUri
    required: false
    description: 资源 URI
---

# 活动日志查询

## 用途

查询 ARM 活动日志事件（等同于 Azure Portal 活动日志）。用于追踪资源操作、识别操作发起者、查找失败操作。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {startDate} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endDate} | 是 | 结束时间 | 2025-01-02T00:00:00Z |
| {resourceUri} | 否 | 资源 URI | /subscriptions/.../providers/... |

---

## 查询 1: 按订阅和时间范围查询

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where operationName notcontains "Microsoft.Authorization/policies/auditIfNotExists/action"
| where operationName notcontains "Microsoft.Authorization/policies/audit/action"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, subStatus, 
         properties, resourceUri, eventName, operationId, armServiceRequestId
| sort by PreciseTimeStamp asc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries") 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where operationName notcontains "Microsoft.Authorization/policies"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, properties, resourceUri
| sort by PreciseTimeStamp asc
```

---

## 查询 2: 按资源 URI 过滤

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries 
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where resourceUri contains "{resourceUri}"
| where operationName notcontains "Microsoft.Authorization/policies"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, subStatus, 
         properties, resourceUri, eventName
| sort by PreciseTimeStamp asc
```

---

## 查询 3: 查询失败操作

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status contains "Failed"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, subStatus, 
         properties, resourceUri
| sort by PreciseTimeStamp asc
```

### Public Cloud 查询

```kql
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries") 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Failed"
| project PreciseTimeStamp, operationName, correlationId, status, properties, resourceUri
| sort by PreciseTimeStamp asc
```

---

## 查询 4: 查找操作发起者

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where subscriptionId == "{subscription}"
| where resourceUri contains "{resourceName}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
// | where operationName contains "delete"  // 可选：按操作类型过滤
| project PreciseTimeStamp, claims, authorization, properties, resourceUri, operationName, correlationId
| sort by PreciseTimeStamp desc
```

---

## 查询 5: 解析 claims 获取用户信息

### Mooncake 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Succeeded"
| extend claimsJson = parse_json(claims)
| extend upn = tostring(claimsJson["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"])
| extend oid = tostring(claimsJson["http://schemas.microsoft.com/identity/claims/objectidentifier"])
| project PreciseTimeStamp, operationName, resourceUri, upn, oid
| sort by PreciseTimeStamp desc
```

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| PreciseTimeStamp | 精确时间戳 |
| operationName | 操作名称（如 Microsoft.Compute/virtualMachines/write） |
| resourceProvider | 资源提供程序 |
| correlationId | 关联 ID（用于追踪完整操作链） |
| status | 操作状态 (Succeeded/Failed/Started) |
| subStatus | 子状态 |
| properties | 属性（JSON 格式，包含详细信息） |
| resourceUri | 资源 URI |
| claims | 用户身份信息 |
| authorization | 授权信息 |

## 关联查询

- [request-tracking.md](./request-tracking.md) - 完整请求追踪
- [failed-operations.md](./failed-operations.md) - 失败操作查询
