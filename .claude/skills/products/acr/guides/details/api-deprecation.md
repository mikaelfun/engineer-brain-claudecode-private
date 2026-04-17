# ACR ACR API 版本弃用 — 综合排查指南

**条目数**: 2 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**Kusto 引用**: rp-activity.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: ARM PolicyScan service (clientApplicationId: 1d78a85d-813d-4
> 来源: ADO Wiki

1. Run Kusto query on armprodgbl cluster to verify userAgent: if only 'PolicyScan' appears with the known clientApplicationId, no customer action is needed. Query: cluster('armprodgbl.eastus').database('

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 2: Customer is using deprecated ACR API versions that have reac
> 来源: ADO Wiki

1. 1) Migrate to a newer ACR API version listed at https://learn.microsoft.com/azure/templates/microsoft.containerregistry/allversions. 2) If using SDKs, update to latest version at https://azure.github.

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Kusto 查询模板

#### rp-activity.md
`[工具: Kusto skill — rp-activity.md]`

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where LoginServerName == "{registry}.azurecr.cn"
| where env_time > ago(7d)
| order by env_time desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where SubscriptionId == "{subscriptionId}"
| where env_time > ago(1d)
| where Level != "Information"
| project env_time, OperationName, HttpMethod, HttpStatus, Message, ExceptionMessage
| order by env_time desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn" or LoginServerName == "{registry}.azurecr.cn"
| where isnotempty(ExceptionMessage) or isnotempty(error) or Level == "Error"
| project env_time, OperationName, Message, ExceptionMessage, error, error_description
| order by env_time desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(cosmosdb_requestunits)
| summarize 
    TotalRU = sum(cosmosdb_requestunits), 
    AvgRU = avg(cosmosdb_requestunits),
    MaxRU = max(cosmosdb_requestunits),
    RequestCount = count()
  by bin(env_time, 1h)
| order by env_time desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where OperationType contains "Replica" or OperationName contains "Replica"
| project env_time, OperationName, OperationType, Message, DurationMs, 
         ReplicationStorageAccount, ReplicationStorageContainer
| order by env_time desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where env_time > ago(7d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(CacheRuleId) or OperationName contains "Cache"
| project env_time, OperationName, Message, CacheRuleId, 
         TargetRepository, UpstreamRepository, CredentialSetName
| order by env_time desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn" or LoginServerName == "{registry}.azurecr.cn"
| summarize 
    TotalCount = count(),
    SuccessCount = countif(Level != "Error" and isempty(ExceptionMessage)),
    ErrorCount = countif(Level == "Error" or isnotempty(ExceptionMessage)),
    AvgDurationMs = avg(DurationMs)
  by OperationName
| order by TotalCount desc
```


---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Customer receives ACR API deprecation email notification for | ARM PolicyScan service (clientApplicatio | → Phase 1 |
| ACR API calls fail after deprecation date for preview API ve | Customer is using deprecated ACR | → Phase 2 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer receives ACR API deprecation email notification for 2018-02-01-preview  | ARM PolicyScan service (clientApplicationId: 1d78a85d-813d-46f0-b496-dd72f50a3ec | Run Kusto query on armprodgbl cluster to verify userAgent: if only 'PolicyScan'  | 🟢 8.0 | ADO Wiki |
| 2 | ACR API calls fail after deprecation date for preview API versions (2016-06-27-p | Customer is using deprecated ACR API versions that have reached end-of-support | 1) Migrate to a newer ACR API version listed at https://learn.microsoft.com/azur | 🟢 8.0 | ADO Wiki |
