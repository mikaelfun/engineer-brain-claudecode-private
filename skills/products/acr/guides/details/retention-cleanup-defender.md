# ACR 保留策略、清理与 Defender 扫描 — 综合排查指南

**条目数**: 4 | **草稿融合数**: 1 | **Kusto 查询融合**: 1
**来源草稿**: mslearn-acr-vulnerability-scanning.md
**Kusto 引用**: manifest-statistics.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: ACR retention policy does not support MediaType v1 manifests
> 来源: ADO Wiki

1. 1) Verify manifest MediaType using Kusto query on RegistryManifestEvent. 2) Ensure Docker/BuildKit is up-to-date to push v2 manifests. 3) Avoid using az acr import for images that need retention polic

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 2: Untagging an image only removes the tag reference — the unde
> 来源: ADO Wiki

1. 1) List untagged manifests: az acr manifest list-metadata --registry <acr> --name <repo> --query "[?tags==null].digest" -o tsv. 2) Purge untagged images: az acr run --cmd 'acr purge --filter <repo>:.*

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 3: ARM audience token authentication (authentication-as-arm) is
> 来源: ADO Wiki

1. Enable ARM audience token authentication: az acr config authentication-as-arm update -r <acr> --status enabled. If blocked by Azure Policy ('Container registries should disable authentication with ARM

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: ACR uses layer deduplication - multiple manifests can refere
> 来源: MS Learn

1. This is by design. Storage reduction is less than expected when deleted images share layers with remaining images. To maximize space recovery, delete all images that share common base layers, or delet

`[结论: 🔵 6.0/10 — MS Learn]`

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


---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ACR retention policy for untagged manifests does not delete  | ACR retention policy does not | → Phase 1 |
| Untagged images in ACR still appear as vulnerable in Microso | Untagging an image only removes | → Phase 2 |
| Microsoft Defender for Cloud fails to scan ACR images with e | ARM audience token authentication (authe | → Phase 3 |
| ACR storage usage does not decrease after running acr purge  | ACR uses layer deduplication - | → Phase 4 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR retention policy for untagged manifests does not delete certain untagged man | ACR retention policy does not support MediaType v1 manifests or OCI image indexe | 1) Verify manifest MediaType using Kusto query on RegistryManifestEvent. 2) Ensu | 🟢 8.0 | ADO Wiki |
| 2 | Untagged images in ACR still appear as vulnerable in Microsoft Defender for Clou | Untagging an image only removes the tag reference — the underlying image manifes | 1) List untagged manifests: az acr manifest list-metadata --registry <acr> --nam | 🟢 8.0 | ADO Wiki |
| 3 | Microsoft Defender for Cloud fails to scan ACR images with error 'The container  | ARM audience token authentication (authentication-as-arm) is disabled on the ACR | Enable ARM audience token authentication: az acr config authentication-as-arm up | 🟢 8.0 | ADO Wiki |
| 4 | ACR storage usage does not decrease after running acr purge to delete many image | ACR uses layer deduplication - multiple manifests can reference the same layers. | This is by design. Storage reduction is less than expected when deleted images s | 🔵 6.0 | MS Learn |
