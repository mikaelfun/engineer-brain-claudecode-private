# ARM 部署错误排查 — 排查工作流

**来源草稿**: [ado-wiki-b-bicep.md], [mslearn-arm-bicep-what-if-guide.md]
**Kusto 引用**: [deployment-tracking.md], [failed-operations.md], [capacity-check.md]
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Bicep Mooncake 环境错误
> 来源: ado-wiki-b-bicep.md | 适用: Mooncake ✅ / Global ❌

### 排查步骤
1. **确认环境配置**：检查 `bicepconfig.json` 中 `currentProfile` 是否设置为 `AzureChinaCloud`
2. **检查 Bicep 版本**：`az bicep version`
3. **常见错误**：模板中 API endpoint 指向 Global Azure 而非 Mooncake

---

## Scenario 2: 部署失败事件查询
> 来源: failed-operations.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **查询失败事件**：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
   | where subscriptionId == "{subscription}"
   | where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
   | where status == "Failed"
   | where properties notcontains "isComplianceCheck" and properties notcontains "OK" and properties != ""
   | project PreciseTimeStamp, resourceUri, properties, status, level, EventId, eventName,
            eventCategory, operationName, correlationId, claims, tenantId
   | order by PreciseTimeStamp desc
   ```
   `[来源: failed-operations.md — 查询 1]`

2. **解析错误详情**：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
   | where subscriptionId == "{subscription}"
   | where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
   | where status == "Failed"
   | extend errorCode = tostring(parse_json(properties).error.code)
   | extend errorMessage = tostring(parse_json(properties).error.message)
   | project PreciseTimeStamp, resourceUri, operationName, errorCode, errorMessage
   | order by PreciseTimeStamp desc
   ```
   `[来源: failed-operations.md — 查询 6]`

---

## Scenario 3: 容量不足导致部署失败
> 来源: capacity-check.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **查询失败的容量检查**：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').CapacityTraces
   | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
   | where subscriptionId == "{subscription}"
   | where status != "Succeeded" and status != ""
   | project TIMESTAMP, providerNamespace, resourceType, skuName, location, status, message, quotaId
   | order by TIMESTAMP desc
   ```
   `[来源: capacity-check.md — 查询 2]`

2. **判断逻辑**：
   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | SKU 不可用 | 该 SKU 在指定位置不可用 | 更换 SKU 或区域 |
   | 配额不足 | 订阅配额已用尽 | 申请配额增加 |
   | 容量限制 | 区域容量限制 | 联系 Azure 支持 |

---

## Scenario 4: HTTP 失败请求统计
> 来源: failed-operations.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **错误统计概览**：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
   | where subscriptionId == "{subscription}"
   | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
   | where httpStatusCode >= 400 and httpStatusCode != -1
   | summarize count() by httpStatusCode, operationName
   | order by count_ desc
   ```
   `[来源: failed-operations.md — 查询 5]`

2. **常见错误码**：400 Bad Request / 401 Unauthorized / 403 Forbidden / 404 Not Found / 409 Conflict / 429 限流 / 500 内部错误
