# ARM ARM 缓存同步问题 — 综合排查指南

**条目数**: 7 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**来源草稿**: —
**Kusto 引用**: arm-rp-chain.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Deleted resource still appears in Azure Policy compliance results; clicking sho…
> 来源: ado-wiki

**根因分析**: ARM cache is out of sync. Policy uses Collection GET from RP directly; Portal uses ARM cache which no longer has the resource.

1. Trigger ARM sync for the impacted resource.
2. Confirm via Jarvis Actions: verify resource exists in RP but not in ARM cache, then follow ARM cache synchronization TSG.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure resource tags are out of sync: tag name or value shown in ARM/Portal diff…
> 来源: ado-wiki

**根因分析**: Tags are stored both at the resource provider level (as top-level property) and in the ARM cache. There are two methods to manage tags: (1) as top-level resource property (PUT/PATCH to RP directly), (2) as extension resource Microsoft.Resources/tags (processed by ARM, then ARM patches RP). Synchronization between ARM cache and RP can get out of sync.

1. Verify tag state at both ARM and RP level.
2. If tags were set via extension resource (Portal), ARM sends a PATCH to RP for backward compatibility.
3. If discrepancy exists, re-apply tags via the other method to force sync.
4. For subscription-level tags, only extension resource method is supported.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 3: Tag cannot be deleted with error The tag cannot be deleted. It is associated to…
> 来源: ado-wiki

**根因分析**: The tag is associated to a resource id not found in the ARM cache. The resource may have been deleted but the tag record was not cleaned up.

1. 1) Jarvis Get resources by tag query to find mapped resources.
2. 2) Get resource from URI (From ARM Cache) to check existence.
3. 3) If resource exists on RP: sync resource state with Provisioning state Create (ARM cache sync at resource scope).
4. 4) If resource does not exist: run Jarvis Fix orphan and missing index tags, then retry delete.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Tag cannot be deleted - tag record is out of sync with actual resource tags (re…
> 来源: ado-wiki

**根因分析**: The tag is linked to a resource that exists but the tag is no longer part of its properties. ARM tag index is out of sync.

1. Synchronize resource state with Provisioning state Create using ARM cache synchronization at resource scope.
2. Check for trailing or leading spaces on tag names.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: ARM cache is out of sync with resource provider - resource exists in RP but not…
> 来源: ado-wiki

**根因分析**: ARM maintains a cache of resource state that can become desynchronized from the actual resource provider state

1. Use Jarvis 'Synchronize resource state' action at resource scope.
2. Use provisioning state 'Create' when resource exists in RP but not ARM, or 'Delete' when resource exists in ARM but not RP.
3. Action URL: https://portal.
4. microsoftgeneva.
5. com/EEA553D5.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Customer resources not visible in subscription; resources not showing via Power…
> 来源: ado-wiki

**根因分析**: ARM cache out of sync with Resource Providers

1. Use Jarvis action to run sync operation against the specific resource.
2. For RDFE resources: sync against Microsoft.
3. ClassicStorage RP.
4. For ARM resources: sync against the affected RP.
5. Track sync status via correlationId in Kusto JobTraces table on armprod.
6. net/ARMProd.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Resource exists in Resource Provider but doesn't appear in ARM; or resource app…
> 来源: ado-wiki

**根因分析**: ARM cache is out of sync with the actual Resource Provider state for a specific resource at a specific location

1. Use Jarvis 'Synchronize resource state' action targeting the specific resource and location.
2. Select provisioning state 'Create' if resource exists in RP but not ARM; select 'Delete' if resource exists in ARM but not in RP.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## Kusto 查询参考

### arm-rp-chain.md
`[工具: Kusto skill — arm-rp-chain.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpOutgoingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where targetUri contains "{resourceName}"
| project TIMESTAMP, ActivityId, serviceRequestId, clientRequestId, targetUri, httpMethod, httpStatusCode, hostName
| order by TIMESTAMP desc
```

```kusto
// Public Cloud 查询 - 需要 ARM Prod 权限
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpOutgoingRequests")
// 请联系 ARM 团队申请权限
```

```kusto
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where activityId == "{activityId}"  // 从步骤 1 获取
| project TIMESTAMP, traceLevel, message, callerName
| order by TIMESTAMP asc
```

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Deleted resource still appears in Azure Policy compliance r… | ARM cache is out of sync. Policy uses Collection GET from R… | Trigger ARM sync for the impacted resource. Confirm via Jar… |
| Azure resource tags are out of sync: tag name or value show… | Tags are stored both at the resource provider level (as top… | Verify tag state at both ARM and RP level. If tags were set… |
| Tag cannot be deleted with error The tag cannot be deleted.… | The tag is associated to a resource id not found in the ARM… | 1) Jarvis Get resources by tag query to find mapped resourc… |
| Tag cannot be deleted - tag record is out of sync with actu… | The tag is linked to a resource that exists but the tag is … | Synchronize resource state with Provisioning state Create u… |
| ARM cache is out of sync with resource provider - resource … | ARM maintains a cache of resource state that can become des… | Use Jarvis 'Synchronize resource state' action at resource … |
| Customer resources not visible in subscription; resources n… | ARM cache out of sync with Resource Providers | Use Jarvis action to run sync operation against the specifi… |
| Resource exists in Resource Provider but doesn't appear in … | ARM cache is out of sync with the actual Resource Provider … | Use Jarvis 'Synchronize resource state' action targeting th… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Deleted resource still appears in Azure Policy compliance results; clicking shows Resource Not Foun… | ARM cache is out of sync. Policy uses Collection GET from RP directly; Portal uses ARM cache which … | Trigger ARM sync for the impacted resource. Confirm via Jarvis Actions: verify resource exists in R… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Tag cannot be deleted with error The tag cannot be deleted. It is associated to one or more resourc… | The tag is associated to a resource id not found in the ARM cache. The resource may have been delet… | 1) Jarvis Get resources by tag query to find mapped resources. 2) Get resource from URI (From ARM C… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Tag cannot be deleted - tag record is out of sync with actual resource tags (resource exists but ta… | The tag is linked to a resource that exists but the tag is no longer part of its properties. ARM ta… | Synchronize resource state with Provisioning state Create using ARM cache synchronization at resour… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | ARM cache is out of sync with resource provider - resource exists in RP but not visible in ARM, or … | ARM maintains a cache of resource state that can become desynchronized from the actual resource pro… | Use Jarvis 'Synchronize resource state' action at resource scope. Use provisioning state 'Create' w… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Customer resources not visible in subscription; resources not showing via PowerShell/CLI/REST API; … | ARM cache out of sync with Resource Providers | Use Jarvis action to run sync operation against the specific resource. For RDFE resources: sync aga… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Resource exists in Resource Provider but doesn't appear in ARM; or resource appears in ARM but no l… | ARM cache is out of sync with the actual Resource Provider state for a specific resource at a speci… | Use Jarvis 'Synchronize resource state' action targeting the specific resource and location. Select… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure resource tags are out of sync: tag name or value shown in ARM/Portal differs from what the re… | Tags are stored both at the resource provider level (as top-level property) and in the ARM cache. T… | Verify tag state at both ARM and RP level. If tags were set via extension resource (Portal), ARM se… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
