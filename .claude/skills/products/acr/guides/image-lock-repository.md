# ACR 镜像锁定与仓库管理 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot delete ACR repository or images after setting lock attributes (delete-ena | ACR locks exist at three independent levels: Repository, Image by Tag, and Image | 1) Check current lock status at all levels: az acr repository show for repo, --i | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-020] |
| 2 | Deleted ACR repositories still appear in Azure Portal with NAME_UNKNOWN error; C | Azure Portal caching logic retains deleted repository links/information until ca | Wait for Azure Portal cache to refresh (usually minutes). Verify delete succeede | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-055] |
| 3 | Cannot delete empty ACR repository - error: repository name not known to registr | Orphaned metadata left behind when images were previously deleted from the repos | Do not try to delete an empty repository directly. Push a dummy image to the rep | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-009] |
| 4 | ACR repository/image deletion fails with The operation is disallowed on this reg | A lock exists on the repository, manifest, or image tag - the changeableAttribut | 1) Check locks: az acr repository show --name <reg> --repository <repo>. 2) Chec | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-012] |
| 5 | Docker pull fails with manifest unknown: manifest tagged by <tag> is not found | The specified image tag does not exist in the ACR repository - it may have been  | Verify the tag exists: 1) Azure portal: Container registries > Repositories > se | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-017] |

## 快速排查路径
1. 检查 → ACR locks exist at three independent levels: Repository, Ima `[来源: ADO Wiki]`
   - 方案: 1) Check current lock status at all levels: az acr repository show for repo, --image repo:tag for ta
2. 检查 → Azure Portal caching logic retains deleted repository links/ `[来源: ADO Wiki]`
   - 方案: Wait for Azure Portal cache to refresh (usually minutes). Verify delete succeeded via Kusto query on
3. 检查 → Orphaned metadata left behind when images were previously de `[来源: MS Learn]`
   - 方案: Do not try to delete an empty repository directly. Push a dummy image to the repository first, then 
4. 检查 → A lock exists on the repository, manifest, or image tag - th `[来源: MS Learn]`
   - 方案: 1) Check locks: az acr repository show --name <reg> --repository <repo>. 2) Check manifest locks: az
5. 检查 → The specified image tag does not exist in the ACR repository `[来源: MS Learn]`
   - 方案: Verify the tag exists: 1) Azure portal: Container registries > Repositories > select repo > check ta
