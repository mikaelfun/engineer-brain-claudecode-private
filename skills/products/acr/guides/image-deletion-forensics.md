# ACR 镜像删除调查与审计 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Investigating ACR image deletion: auth_user_name shows unknown application ID no | The delete/untag action was performed by an ACR Task or 'az acr run' command, wh | 1) Cross-verify in ARM Kusto: query HttpIncomingRequests filtered by subscriptio | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-015] |
| 2 | Customer reports image tags disappearing from ACR - suspected retention policy b | External CI/CD automation (pipeline/script/scheduled job) is deleting tagged ima | Query RegistryManifestEvent in Kusto: 1) Check Delete vs PurgeManifest volumes;  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-049] |
| 3 | Need to list and identify all images/manifests older than a specific date across | No built-in single command to list old images across all repositories. az acr ma | Use shell script: 1) az acr repository list --name <acr> --output tsv > acr.txt, | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-078] |
| 4 | Need to find the client/operator IP address that performed ACR push/pull/delete  | ACR logs the operator IP in RegistryActivity table but it may be PII-masked in K | 1) Query Kusto RegistryActivity table filtering by registry host, time range, an | 🟢 8.5 — OneNote单源+实证 | [acr-onenote-011] |

## 快速排查路径
1. 检查 → The delete/untag action was performed by an ACR Task or 'az  `[来源: ADO Wiki]`
   - 方案: 1) Cross-verify in ARM Kusto: query HttpIncomingRequests filtered by subscriptionId and ACR name aro
2. 检查 → External CI/CD automation (pipeline/script/scheduled job) is `[来源: ADO Wiki]`
   - 方案: Query RegistryManifestEvent in Kusto: 1) Check Delete vs PurgeManifest volumes; 2) Compare WithTag v
3. 检查 → No built-in single command to list old images across all rep `[来源: ADO Wiki]`
   - 方案: Use shell script: 1) az acr repository list --name <acr> --output tsv > acr.txt, 2) Iterate repos wi
4. 检查 → ACR logs the operator IP in RegistryActivity table but it ma `[来源: OneNote]`
   - 方案: 1) Query Kusto RegistryActivity table filtering by registry host, time range, and repository name. 2

> 本 topic 有融合排查指南 → [完整排查流程](details/image-deletion-forensics.md#排查流程)
