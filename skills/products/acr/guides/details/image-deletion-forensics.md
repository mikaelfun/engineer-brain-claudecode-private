# ACR 镜像删除调查与审计 — 综合排查指南

**条目数**: 4 | **草稿融合数**: 5 | **Kusto 查询融合**: 2
**来源草稿**: ado-wiki-a-acr-audit-logs.md, ado-wiki-a-acr-change-analysis.md, ado-wiki-acr-find-user-of-manifest-event.md, ado-wiki-acr-investigate-bulk-image-tag-deletions.md, onenote-acr-kusto-queries.md
**Kusto 引用**: manifest-statistics.md, activity-errors.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: The delete/untag action was performed by an ACR Task or 'az 
> 来源: ADO Wiki

1. 1) Cross-verify in ARM Kusto: query HttpIncomingRequests filtered by subscriptionId and ACR name around the event timestamp. 2) Check targetUri field to identify the operation type: 'az acr run', 'az 

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 2: External CI/CD automation (pipeline/script/scheduled job) is
> 来源: ADO Wiki

1. Query RegistryManifestEvent in Kusto: 1) Check Delete vs PurgeManifest volumes; 2) Compare WithTag vs WithoutTag counts - WithTag>0 confirms automation not retention; 3) Check burst patterns (5m bins)

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 3: No built-in single command to list old images across all rep
> 来源: ADO Wiki

1. Use shell script: 1) az acr repository list --name <acr> --output tsv > acr.txt, 2) Iterate repos with configurable batch sizes, 3) For each repo: az acr manifest list-metadata --name $repo --registry

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: ACR logs the operator IP in RegistryActivity table but it ma
> 来源: OneNote

1. 1) Query Kusto RegistryActivity table filtering by registry host, time range, and repository name. 2) Find correlationid for the operation (look for manifest/tag actions). 3) Use correlationid to quer

`[结论: 🟢 8.5/10 — OneNote]`

### Kusto 查询模板

#### manifest-statistics.md
`[工具: Kusto skill — manifest-statistics.md]`

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(7d)
| where OperationName == "ACR.Layer: ExecuteOperationOnListManifestsAsync"
| where RegistryLoginUri == "{registry}.azurecr.cn"
| extend numManifests = toint(substring(Message, 52, strlen(Message) - 11 - 52))
| summarize numManifests = sum(numManifests) by bin(env_time, 1d), RegistryId, 
         RegistryLoginUri, ImageType
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity 
| where env_time > ago(2d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| extend Count = 1
| distinct Repository, Tag, Digest, Count
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(7d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(Repository)
| summarize 
    TagCount = dcount(Tag),
    DigestCount = dcount(Digest),
    TotalSize = sum(BlobSize),
    LastActivity = max(env_time)
  by Repository
| order by TagCount desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(7d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(ImageType)
| summarize Count = count(), TotalSize = sum(BlobSize) by ImageType, MediaType
| order by Count desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(Repository)
| summarize 
    ActivityCount = count(),
    LastActivity = max(env_time),
    Operations = make_set(OperationName, 5)
  by Repository
| order by LastActivity desc
| take 50
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(7d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(BlobSize) and BlobSize > 0
| summarize 
    TotalSizeGB = round(sum(BlobSize) / 1024 / 1024 / 1024, 2),
    UniqueBlobs = dcount(Digest),
    RepositoryCount = dcount(Repository)
  by bin(env_time, 1d)
| order by env_time desc
```


#### activity-errors.md
`[工具: Kusto skill — activity-errors.md]`

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where activitytimestamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where level == "error"
| where http_request_method != "HEAD"
| project PreciseTimeStamp, vars_name, message, err_message, err_detail, http_request_method, 
         http_response_status, http_request_uri, http_request_remoteaddr, http_request_useragent, 
         correlationid, level
| order by PreciseTimeStamp asc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where correlationid == "{correlationId}"
| project activitytimestamp, message, auth_token_access, correlationid, err_code, err_detail, 
         err_message, http_request_host, http_request_id, http_request_method, http_request_uri, 
         http_response_status, level, service
| order by activitytimestamp asc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where http_request_host == "{registry}.azurecr.cn"
| where level != "info"
| project PreciseTimeStamp, vars_name, message, err_message, err_detail, http_request_method, 
         http_response_status, http_request_uri, http_request_remoteaddr, correlationid, level
| order by PreciseTimeStamp asc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where level == "error"
| summarize ErrorCount = count() by err_code, err_message, http_response_status
| order by ErrorCount desc
```


---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Investigating ACR image deletion: auth_user_name shows unkno | The delete/untag action was performed | → Phase 1 |
| Customer reports image tags disappearing from ACR - suspecte | External CI/CD automation (pipeline/scri | → Phase 2 |
| Need to list and identify all images/manifests older than a  | No built-in single command to | → Phase 3 |
| Need to find the client/operator IP address that performed A | ACR logs the operator IP | → Phase 4 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Investigating ACR image deletion: auth_user_name shows unknown application ID no | The delete/untag action was performed by an ACR Task or 'az acr run' command, wh | 1) Cross-verify in ARM Kusto: query HttpIncomingRequests filtered by subscriptio | 🟢 8.0 | ADO Wiki |
| 2 | Customer reports image tags disappearing from ACR - suspected retention policy b | External CI/CD automation (pipeline/script/scheduled job) is deleting tagged ima | Query RegistryManifestEvent in Kusto: 1) Check Delete vs PurgeManifest volumes;  | 🟢 8.0 | ADO Wiki |
| 3 | Need to list and identify all images/manifests older than a specific date across | No built-in single command to list old images across all repositories. az acr ma | Use shell script: 1) az acr repository list --name <acr> --output tsv > acr.txt, | 🟢 8.0 | ADO Wiki |
| 4 | Need to find the client/operator IP address that performed ACR push/pull/delete  | ACR logs the operator IP in RegistryActivity table but it may be PII-masked in K | 1) Query Kusto RegistryActivity table filtering by registry host, time range, an | 🟢 8.5 | OneNote |
