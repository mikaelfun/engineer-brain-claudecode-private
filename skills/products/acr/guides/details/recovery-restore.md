# ACR 注册表恢复与还原 — 综合排查指南

**条目数**: 5 | **草稿融合数**: 2 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-a-jarvis-actions.md, ado-wiki-a-technical-advisors-actions.md
**Kusto 引用**: registry-info.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Images were deleted from ACR. Soft delete default retention 
> 来源: ADO Wiki

1. 1) Query deleted repos via Kusto RegistryManifestEvent where Action==DeleteRepository. 2) Get tags from WorkerServiceActivity. 3) Confirm tag/digest with customer. 4) Reach out to TA for image recover

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 2: ARM maintenance during an update ACR request caused an incon
> 来源: ADO Wiki

1. Open an ICM with ACR PG Triage team and request them to review the Master Entity for the affected registry. Use Kusto query on armprodgbl cluster to confirm if the subscription/ACR shows 404 during th

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 3: Customer-initiated deletion of Azure Container Registry. ACR
> 来源: ADO Wiki

1. Recovery steps: 1) Customer creates empty registry with SAME name, same resource group, same region, same subscription, and SAME SKU (Basic=1, Std=2, Premium=3). 2) New registry must be created WITHOU

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: Timeout occurs in non-critical post-restore code (registry s
> 来源: ADO Wiki

1. Do NOT re-run the restore operation. If output contains 'Registry {loginServer} has been restored. Proceeding to do a size recalculation of the registry (non-critical)', the restore succeeded. For TB-

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 5: Accidental deletion of ACR resources (registry or image mani
> 来源: OneNote

1. 1) Customer recreates ACR in same subscription/resource group/name/SKU/Location with geo-replication OFF. 2) Collect deleted ACR resource ID, Location, Registry, and image manifest SHA (for image reco

`[结论: 🟢 8.5/10 — OneNote]`

### Kusto 查询模板

#### registry-info.md
`[工具: Kusto skill — registry-info.md]`

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time >= ago(3d)
| where LoginServerName contains "{registry}.azurecr.cn"
| sort by env_time desc
| project env_time, CreatedTime, SubscriptionId, ResourceGroup, RegistryName, LoginServerName, 
         RegistryId, RegistryLocation, SkuId, AdminUserEnabled, PublicNetworkAccessDisabled, 
         PrivateLinkEndpointEnabled, DataEndpointEnabled, HasAssignedIdentity, ByokEnabled,
         PrivateLinksVersion
| take 1
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time > ago(1d)
| where LoginServerName == "{registry}.azurecr.cn"
| project RegistryName, PublicNetworkAccessDisabled, PrivateLinkEndpointEnabled, 
         DataEndpointEnabled, FirewallRulesEnabled, PublicNetworkAccessSecuredByPerimeter
| take 1
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time > ago(1d)
| where LoginServerName == "{registry}.azurecr.cn"
| project RegistryName, ByokEnabled, HasAssignedIdentity, SoftDeleteEnabled, 
         ContentTrustEnabled, QuarantineEnabled, RetentionEnabled
| take 1
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time > ago(1d)
| where tolower(RegistryName) == "{registryName}"
| project ByokEnabled
```


---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Customer accidentally deleted images or repositories from AC | Images were deleted from ACR. | → Phase 1 |
| ACR is reporting as disabled — cannot login, cannot pull ima | ARM maintenance during an update | → Phase 2 |
| Customer accidentally deleted ACR and needs to recover/undel | Customer-initiated deletion of Azure Con | → Phase 3 |
| ACR registry restore operation shows 'Failed to execute oper | Timeout occurs in non-critical post-rest | → Phase 4 |
| Customer accidentally deleted Azure Container Registry or im | Accidental deletion of ACR resources | → Phase 5 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer accidentally deleted images or repositories from ACR and needs recovery | Images were deleted from ACR. Soft delete default retention is 7 days. Recovery  | 1) Query deleted repos via Kusto RegistryManifestEvent where Action==DeleteRepos | 🟢 8.0 | ADO Wiki |
| 2 | ACR is reporting as disabled — cannot login, cannot pull images, re-enabling adm | ARM maintenance during an update ACR request caused an inconsistency between the | Open an ICM with ACR PG Triage team and request them to review the Master Entity | 🟢 8.0 | ADO Wiki |
| 3 | Customer accidentally deleted ACR and needs to recover/undelete the registry and | Customer-initiated deletion of Azure Container Registry. ACR supports recovery w | Recovery steps: 1) Customer creates empty registry with SAME name, same resource | 🟢 8.0 | ADO Wiki |
| 4 | ACR registry restore operation shows 'Failed to execute operation after 10800 se | Timeout occurs in non-critical post-restore code (registry size recalculation),  | Do NOT re-run the restore operation. If output contains 'Registry {loginServer}  | 🟢 8.0 | ADO Wiki |
| 5 | Customer accidentally deleted Azure Container Registry or image manifests and wa | Accidental deletion of ACR resources (registry or image manifests) | 1) Customer recreates ACR in same subscription/resource group/name/SKU/Location  | 🟢 8.5 | OneNote |
