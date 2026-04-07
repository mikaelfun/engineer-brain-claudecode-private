# ACR 注册表恢复与还原 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer accidentally deleted images or repositories from ACR and needs recovery | Images were deleted from ACR. Soft delete default retention is 7 days. Recovery  | 1) Query deleted repos via Kusto RegistryManifestEvent where Action==DeleteRepos | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-031] |
| 2 | ACR is reporting as disabled — cannot login, cannot pull images, re-enabling adm | ARM maintenance during an update ACR request caused an inconsistency between the | Open an ICM with ACR PG Triage team and request them to review the Master Entity | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-048] |
| 3 | Customer accidentally deleted ACR and needs to recover/undelete the registry and | Customer-initiated deletion of Azure Container Registry. ACR supports recovery w | Recovery steps: 1) Customer creates empty registry with SAME name, same resource | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-076] |
| 4 | ACR registry restore operation shows 'Failed to execute operation after 10800 se | Timeout occurs in non-critical post-restore code (registry size recalculation),  | Do NOT re-run the restore operation. If output contains 'Registry {loginServer}  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-0147] |
| 5 | Customer accidentally deleted Azure Container Registry or image manifests and wa | Accidental deletion of ACR resources (registry or image manifests) | 1) Customer recreates ACR in same subscription/resource group/name/SKU/Location  | 🟢 8.5 — OneNote单源+实证 | [acr-onenote-001] |

## 快速排查路径
1. 检查 → Images were deleted from ACR. Soft delete default retention  `[来源: ADO Wiki]`
   - 方案: 1) Query deleted repos via Kusto RegistryManifestEvent where Action==DeleteRepository. 2) Get tags f
2. 检查 → ARM maintenance during an update ACR request caused an incon `[来源: ADO Wiki]`
   - 方案: Open an ICM with ACR PG Triage team and request them to review the Master Entity for the affected re
3. 检查 → Customer-initiated deletion of Azure Container Registry. ACR `[来源: ADO Wiki]`
   - 方案: Recovery steps: 1) Customer creates empty registry with SAME name, same resource group, same region,
4. 检查 → Timeout occurs in non-critical post-restore code (registry s `[来源: ADO Wiki]`
   - 方案: Do NOT re-run the restore operation. If output contains 'Registry {loginServer} has been restored. P
5. 检查 → Accidental deletion of ACR resources (registry or image mani `[来源: OneNote]`
   - 方案: 1) Customer recreates ACR in same subscription/resource group/name/SKU/Location with geo-replication

> 本 topic 有融合排查指南 → [完整排查流程](details/recovery-restore.md#排查流程)
