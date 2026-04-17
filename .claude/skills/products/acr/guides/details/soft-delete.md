# ACR 软删除与恢复冲突 — 综合排查指南

**条目数**: 4 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-07

---

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Docker push to ACR fails with error 'manifest sha256:xxx was soft-deleted, and c | ACR Soft Delete feature prevents pushing an image with the exact same digest as  | Restore the soft-deleted manifest first: az acr manifest restore -r <registry> - | 🟢 8.0 | ADO Wiki |
| 2 | ACR import fails with 'Import failed: A soft-deleted image with digest sha256:xx | ACR import operation detects that the target repository has a soft-deleted manif | Restore the soft-deleted image: az acr manifest restore -r <registry> -n <repo>: | 🟢 8.0 | ADO Wiki |
| 3 | ACR soft-delete restore fails with 'METADATA_CONFLICT: Tag latest already exists | The tag being restored from the Recycle Bin already exists in the live repositor | Use force restore flag to overwrite the existing tag: az acr manifest restore -r | 🟢 8.0 | ADO Wiki |
| 4 | ACR soft-delete commands fail with 'Error: repository not found' on geo-replicat | ACR Soft Delete does NOT support registries with Geo-Replication enabled. Soft-d | Remove geo-replication from the registry to use soft-delete features. This is a  | 🟢 8.0 | ADO Wiki |
