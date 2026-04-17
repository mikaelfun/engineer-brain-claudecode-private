# ACR Push 失败与存储限制 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Docker/Helm push to ACR succeeds without error but pushed image has no content - | Azure quarantine feature blocks content from being pushed. Quarantine is auto-en | 1) Get ACR resource ID: id=$(az acr show --name <registry> --query id -o tsv). 2 | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-035] |
| 2 | ACR replication stuck in creating or deleting state — delete/create operations n | Backend permission issue: a required role assignment for the ACR first-party app | 1) Check ARM incoming requests (armprodgbl) to find the delete/create correlatio | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-038] |
| 3 | ACR push or pull fails with 'unknown: The operation is disallowed on this regist | The container registry has reached its 40 TiB per-registry storage limit; operat | 1) Verify storage usage: az acr show-usage -r {registryName}. 2) Advise customer | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-039] |
| 4 | Intermittent push failures on geo-replicated ACR when storage is near the limit  | Geo-replication sync delay: when one region's replica reaches the storage limit  | 1) Check storage usage per region. 2) Implement purge/retention to free space be | 🟢 9.0 — ADO Wiki交叉验证 | [acr-ado-wiki-040] |
| 5 | Customer cannot push new images to ACR registry. Push operations fail. | ACR registry has reached the 20TB storage limit. All service tiers (Basic/Standa | Contact ACR PG team to increase the storage limit beyond 20TB (customer pays per | 🟢 9.0 — ADO Wiki交叉验证 | [acr-ado-wiki-0148] |
| 6 | ACR push fails with operation is disallowed - writeEnabled false or storage limi | Either the repository/image/manifest has writeEnabled set to false (locked), or  | 1) Check lock: az acr repository show --name <reg> --repository <repo> - if writ | 🟢 8.0 — MS Learn交叉验证 | [acr-mslearn-021] |

## 快速排查路径
1. 检查 → Azure quarantine feature blocks content from being pushed. Q `[来源: ADO Wiki]`
   - 方案: 1) Get ACR resource ID: id=$(az acr show --name <registry> --query id -o tsv). 2) Disable quarantine
2. 检查 → Backend permission issue: a required role assignment for the `[来源: ADO Wiki]`
   - 方案: 1) Check ARM incoming requests (armprodgbl) to find the delete/create correlationId. 2) Cross-refere
3. 检查 → The container registry has reached its 40 TiB per-registry s `[来源: ADO Wiki]`
   - 方案: 1) Verify storage usage: az acr show-usage -r {registryName}. 2) Advise customer to set up retention
4. 检查 → Geo-replication sync delay: when one region's replica reache `[来源: ADO Wiki]`
   - 方案: 1) Check storage usage per region. 2) Implement purge/retention to free space below 40TiB. 3) If sto
5. 检查 → ACR registry has reached the 20TB storage limit. All service `[来源: ADO Wiki]`
   - 方案: Contact ACR PG team to increase the storage limit beyond 20TB (customer pays per-GB rate for additio

> 本 topic 有融合排查指南 → [完整排查流程](details/push-storage-limit.md#排查流程)
