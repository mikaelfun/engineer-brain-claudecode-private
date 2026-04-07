# ACR 镜像锁定与仓库管理 — 综合排查指南

**条目数**: 5 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-07

---

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot delete ACR repository or images after setting lock attributes (delete-ena | ACR locks exist at three independent levels: Repository, Image by Tag, and Image | 1) Check current lock status at all levels: az acr repository show for repo, --i | 🟢 8.0 | ADO Wiki |
| 2 | Deleted ACR repositories still appear in Azure Portal with NAME_UNKNOWN error; C | Azure Portal caching logic retains deleted repository links/information until ca | Wait for Azure Portal cache to refresh (usually minutes). Verify delete succeede | 🟢 8.0 | ADO Wiki |
| 3 | Cannot delete empty ACR repository - error: repository name not known to registr | Orphaned metadata left behind when images were previously deleted from the repos | Do not try to delete an empty repository directly. Push a dummy image to the rep | 🔵 6.0 | MS Learn |
| 4 | ACR repository/image deletion fails with The operation is disallowed on this reg | A lock exists on the repository, manifest, or image tag - the changeableAttribut | 1) Check locks: az acr repository show --name <reg> --repository <repo>. 2) Chec | 🔵 6.0 | MS Learn |
| 5 | Docker pull fails with manifest unknown: manifest tagged by <tag> is not found | The specified image tag does not exist in the ACR repository - it may have been  | Verify the tag exists: 1) Azure portal: Container registries > Repositories > se | 🔵 6.0 | MS Learn |
