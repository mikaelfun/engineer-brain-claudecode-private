# ACR 平台集成（Web App / Container Apps / Webhook） — 综合排查指南

**条目数**: 5 | **草稿融合数**: 6 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-a-acr-kusto-access.md, ado-wiki-a-troubleshooting-using-asi.md, ado-wiki-acr-escalation-process.md, ado-wiki-a-acr-devops-cases-template.md, ado-wiki-a-acr-feedback-forum-post.md, ado-wiki-a-acr-pg-teams-channel.md
**Kusto 引用**: rp-activity.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: ACR webhooks under spoke model with cross-subscription confi
> 来源: ADO Wiki

1. Use Azure DevOps pipelines instead of ACR webhooks for CI/CD to App Service in ILB ASE. If ACR cannot reach the VNet where ASE resides, webhooks will not work. Ensure webhook target and ACR are in the

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 2: Known bug in Container Apps platform that cannot handle ACR 
> 来源: ADO Wiki

1. Use an ACR with a shorter registry name (under 30 characters). If customer cannot rename, create a new ACR with a shorter name and migrate images. This was a known Container Apps bug (CASE#22051200500

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 3: For admin user: incorrect login server/username/password con
> 来源: MS Learn

1. Admin user: verify credentials in ACR Access keys blade match Web App environment variables. Managed identity: verify AcrPull role assignment exists on the managed identity, check Azure Policy is not 

`[结论: 🔵 6.0/10 — MS Learn]`

### Phase 4: ACR firewall does not include Web App outbound IP addresses 
> 来源: MS Learn

1. Option 1: Add all Web App outbound IPs to ACR firewall (find in Web App Overview > Outbound IP addresses > Show More). Option 2: Configure VNet integration for Web App + ACR private endpoint - enable 

`[结论: 🔵 6.0/10 — MS Learn]`

### Phase 5: CE1 and CN1 Azure regions are being retired; all resources i
> 来源: OneNote

1. Follow Microsoft migration guide: https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/relocation/relocation-container-registry. Note: AKS is NOT impacted (CE1/CN1 never supported

`[结论: 🟢 9.0/10 — OneNote]`

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
| ACR webhook fails to push to App Service with 500 InternalSe | ACR webhooks under spoke model | → Phase 1 |
| Azure Container Apps creation fails after 15-20 minutes with | Known bug in Container Apps | → Phase 2 |
| Azure Web App fails to pull image from ACR with unauthorized | For admin user: incorrect login | → Phase 3 |
| Azure Web App fails to pull from ACR with client IP not allo | ACR firewall does not include | → Phase 4 |
| ACR resources in China East 1 (CE1) and China North 1 (CN1)  | CE1 and CN1 Azure regions | → Phase 5 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR webhook fails to push to App Service with 500 InternalServerError — webhook  | ACR webhooks under spoke model with cross-subscription configuration are not sup | Use Azure DevOps pipelines instead of ACR webhooks for CI/CD to App Service in I | 🟢 8.0 | ADO Wiki |
| 2 | Azure Container Apps creation fails after 15-20 minutes with 'ContainerAppOperat | Known bug in Container Apps platform that cannot handle ACR registry names excee | Use an ACR with a shorter registry name (under 30 characters). If customer canno | 🟢 8.0 | ADO Wiki |
| 3 | Azure Web App fails to pull image from ACR with unauthorized error - admin user  | For admin user: incorrect login server/username/password configured in Web App e | Admin user: verify credentials in ACR Access keys blade match Web App environmen | 🔵 6.0 | MS Learn |
| 4 | Azure Web App fails to pull from ACR with client IP not allowed - Web App outbou | ACR firewall does not include Web App outbound IP addresses in the allow list, a | Option 1: Add all Web App outbound IPs to ACR firewall (find in Web App Overview | 🔵 6.0 | MS Learn |
| 5 | ACR resources in China East 1 (CE1) and China North 1 (CN1) regions need migrati | CE1 and CN1 Azure regions are being retired; all resources in these regions must | Follow Microsoft migration guide: https://learn.microsoft.com/en-us/azure/azure- | 🟢 9.0 | OneNote |
