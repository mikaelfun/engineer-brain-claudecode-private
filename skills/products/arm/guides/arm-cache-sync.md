# ARM ARM 缓存同步问题 — 排查速查

**来源数**: 7 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Deleted resource still appears in Azure Policy compliance results; clicking shows Resource Not Foun… | ARM cache is out of sync. Policy uses Collection GET from RP directly; Portal uses ARM cache which … | Trigger ARM sync for the impacted resource. Confirm via Jarvis Actions: verify resource exists in R… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Tag cannot be deleted with error The tag cannot be deleted. It is associated to one or more resourc… | The tag is associated to a resource id not found in the ARM cache. The resource may have been delet… | 1) Jarvis Get resources by tag query to find mapped resources. 2) Get resource from URI (From ARM C… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Tag cannot be deleted - tag record is out of sync with actual resource tags (resource exists but ta… | The tag is linked to a resource that exists but the tag is no longer part of its properties. ARM ta… | Synchronize resource state with Provisioning state Create using ARM cache synchronization at resour… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | ARM cache is out of sync with resource provider - resource exists in RP but not visible in ARM, or … | ARM maintains a cache of resource state that can become desynchronized from the actual resource pro… | Use Jarvis 'Synchronize resource state' action at resource scope. Use provisioning state 'Create' w… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Customer resources not visible in subscription; resources not showing via PowerShell/CLI/REST API; … | ARM cache out of sync with Resource Providers | Use Jarvis action to run sync operation against the specific resource. For RDFE resources: sync aga… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Resource exists in Resource Provider but doesn't appear in ARM; or resource appears in ARM but no l… | ARM cache is out of sync with the actual Resource Provider state for a specific resource at a speci… | Use Jarvis 'Synchronize resource state' action targeting the specific resource and location. Select… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure resource tags are out of sync: tag name or value shown in ARM/Portal differs from what the re… | Tags are stored both at the resource provider level (as top-level property) and in the ARM cache. T… | Verify tag state at both ARM and RP level. If tags were set via extension resource (Portal), ARM se… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Trigger ARM sync for the impacted resource. Confirm via Jarvis Actions: verify … `[来源: ado-wiki]`
2. 1) Jarvis Get resources by tag query to find mapped resources. 2) Get resource … `[来源: ado-wiki]`
3. Synchronize resource state with Provisioning state Create using ARM cache synch… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/arm-cache-sync.md#排查流程)
