# ARM ARM 部署错误排查 — 综合排查指南

**条目数**: 1 | **草稿融合数**: 2 | **Kusto 查询融合**: 3
**来源草稿**: ado-wiki-b-bicep.md, mslearn-arm-bicep-what-if-guide.md
**Kusto 引用**: deployment-tracking.md, failed-operations.md, capacity-check.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Bicep deployment fails or targets wrong cloud environment (deploying to AzureCl…
> 来源: onenote

**根因分析**: Bicep defaults to AzureCloud profile. Without explicit bicepconfig.json setting currentProfile to AzureChinaCloud, Bicep module registry operations and deployments will target the global Azure endpoints instead of Mooncake endpoints.

1. Create bicepconfig.
2. json in the Bicep files directory with: {"cloud": {"currentProfile": "AzureChinaCloud", "profiles": {"AzureChinaCloud": {"resourceManagerEndpoint": "https://management.
3. chinacloudapi.
4. cn", "activeDirectoryAuthority": "https://login.
5. chinacloudapi.
6. cn"}}, "credentialPrecedence": ["AzureCLI", "AzurePowerShell"]}}.
7. Ensure az cloud set --name AzureChinaCloud or Connect-AzAccount -Environment AzureChinaCloud is done before deployment.

`[结论: 🟢 8.5/10 — [MCVKB/Config Env to Mooncake.md]]`

## Kusto 查询参考

### deployment-tracking.md
`[工具: Kusto skill — deployment-tracking.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').Deployments
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName == "{resourceGroup}"
| project TIMESTAMP, deploymentName, executionStatus, resourceCount, 
         succeededResourceCount, failedResourceCount, durationInMilliseconds
| order by TIMESTAMP desc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Deployments","Deployments")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName == "{resourceGroup}"
| project TIMESTAMP, deploymentName, executionStatus, resourceCount, failedResourceCount
| order by TIMESTAMP desc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').Deployments
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where executionStatus == "Failed" or failedResourceCount > 0
| project TIMESTAMP, deploymentName, resourceGroupName, executionStatus, 
         resourceCount, failedResourceCount
| order by TIMESTAMP desc
```

### failed-operations.md
`[工具: Kusto skill — failed-operations.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Failed"
| where properties notcontains "isComplianceCheck" and properties notcontains "OK" and properties != ""
| project PreciseTimeStamp, resourceUri, properties, status, level, EventId, eventName, 
         eventCategory, operationName, correlationId, claims, tenantId
| order by PreciseTimeStamp desc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries")
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Failed"
| where properties notcontains "isComplianceCheck"
| project PreciseTimeStamp, resourceUri, properties, status, operationName, correlationId
| order by PreciseTimeStamp desc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| where status == "Failed"
| project PreciseTimeStamp, resourceUri, operationName, status, properties
| order by PreciseTimeStamp asc
```

### capacity-check.md
`[工具: Kusto skill — capacity-check.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').CapacityTraces
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, providerNamespace, resourceType, skuName, location, status, message, quotaId
| order by TIMESTAMP asc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("General","CapacityTraces")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, providerNamespace, skuName, location, status, message
| order by TIMESTAMP asc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').CapacityTraces
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where status != "Succeeded" and status != ""
| project TIMESTAMP, providerNamespace, resourceType, skuName, location, status, message, quotaId
| order by TIMESTAMP desc
```

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Bicep deployment fails or targets wrong cloud environment (deploying to AzureCloud instead of Azure… | Bicep defaults to AzureCloud profile. Without explicit bicepconfig.json setting currentProfile to A… | Create bicepconfig.json in the Bicep files directory with: {"cloud": {"currentProfile": "AzureChina… | 🟢 8.5 — onenote+21V适用 | [MCVKB/Config Env to Mooncake.md] |
