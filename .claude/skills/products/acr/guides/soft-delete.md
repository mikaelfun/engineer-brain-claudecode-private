# ACR 软删除与恢复冲突 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Docker push to ACR fails with error 'manifest sha256:xxx was soft-deleted, and c | ACR Soft Delete feature prevents pushing an image with the exact same digest as  | Restore the soft-deleted manifest first: az acr manifest restore -r <registry> - | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-080] |
| 2 | ACR import fails with 'Import failed: A soft-deleted image with digest sha256:xx | ACR import operation detects that the target repository has a soft-deleted manif | Restore the soft-deleted image: az acr manifest restore -r <registry> -n <repo>: | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-081] |
| 3 | ACR soft-delete restore fails with 'METADATA_CONFLICT: Tag latest already exists | The tag being restored from the Recycle Bin already exists in the live repositor | Use force restore flag to overwrite the existing tag: az acr manifest restore -r | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-082] |
| 4 | ACR soft-delete commands fail with 'Error: repository not found' on geo-replicat | ACR Soft Delete does NOT support registries with Geo-Replication enabled. Soft-d | Remove geo-replication from the registry to use soft-delete features. This is a  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-083] |

## 快速排查路径
1. 检查 → ACR Soft Delete feature prevents pushing an image with the e `[来源: ADO Wiki]`
   - 方案: Restore the soft-deleted manifest first: az acr manifest restore -r <registry> -n <repo>:<tag>. Afte
2. 检查 → ACR import operation detects that the target repository has  `[来源: ADO Wiki]`
   - 方案: Restore the soft-deleted image: az acr manifest restore -r <registry> -n <repo>:<tag>. After restora
3. 检查 → The tag being restored from the Recycle Bin already exists i `[来源: ADO Wiki]`
   - 方案: Use force restore flag to overwrite the existing tag: az acr manifest restore -r <registry> -n <repo
4. 检查 → ACR Soft Delete does NOT support registries with Geo-Replica `[来源: ADO Wiki]`
   - 方案: Remove geo-replication from the registry to use soft-delete features. This is a known limitation — s
