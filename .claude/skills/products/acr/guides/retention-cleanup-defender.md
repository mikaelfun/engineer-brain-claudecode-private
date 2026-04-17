# ACR 保留策略、清理与 Defender 扫描 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR retention policy for untagged manifests does not delete certain untagged man | ACR retention policy does not support MediaType v1 manifests or OCI image indexe | 1) Verify manifest MediaType using Kusto query on RegistryManifestEvent. 2) Ensu | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-054] |
| 2 | Untagged images in ACR still appear as vulnerable in Microsoft Defender for Clou | Untagging an image only removes the tag reference — the underlying image manifes | 1) List untagged manifests: az acr manifest list-metadata --registry <acr> --nam | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-056] |
| 3 | Microsoft Defender for Cloud fails to scan ACR images with error 'The container  | ARM audience token authentication (authentication-as-arm) is disabled on the ACR | Enable ARM audience token authentication: az acr config authentication-as-arm up | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-071] |
| 4 | ACR storage usage does not decrease after running acr purge to delete many image | ACR uses layer deduplication - multiple manifests can reference the same layers. | This is by design. Storage reduction is less than expected when deleted images s | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-011] |

## 快速排查路径
1. 检查 → ACR retention policy does not support MediaType v1 manifests `[来源: ADO Wiki]`
   - 方案: 1) Verify manifest MediaType using Kusto query on RegistryManifestEvent. 2) Ensure Docker/BuildKit i
2. 检查 → Untagging an image only removes the tag reference — the unde `[来源: ADO Wiki]`
   - 方案: 1) List untagged manifests: az acr manifest list-metadata --registry <acr> --name <repo> --query "[?
3. 检查 → ARM audience token authentication (authentication-as-arm) is `[来源: ADO Wiki]`
   - 方案: Enable ARM audience token authentication: az acr config authentication-as-arm update -r <acr> --stat
4. 检查 → ACR uses layer deduplication - multiple manifests can refere `[来源: MS Learn]`
   - 方案: This is by design. Storage reduction is less than expected when deleted images share layers with rem

> 本 topic 有融合排查指南 → [完整排查流程](details/retention-cleanup-defender.md#排查流程)
