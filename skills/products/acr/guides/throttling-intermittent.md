# ACR 限流与间歇性错误 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR returns 'too many requests' throttling error during image pull or push opera | Customer exceeds the concurrent request limit for their ACR tier (e.g., 10 concu | 1) Verify throttling with Kusto: cluster('ACR').database('acrprod').RegistryActi | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-021] |
| 2 | Intermittent 503 'Egress is over the account limit' errors during ACR image pull | Internal Azure Storage account used by ACR is experiencing bandwidth throttling. | 1) Verify origin with Kusto: RegistryActivity | where http_response_status == '3 | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-023] |
| 3 | Intermittent 502 Bad Gateway errors during ACR image pull/push operations; 'conn | During image pull, ACR sends 307 redirect to Azure Blob Storage for layer downlo | Retry the pull/push operation — since load balancer distributes across many fron | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-069] |
| 4 | Intermittent HTTP 502 responses from ACR during image pull/push operations. Erro | Azure Storage tenant reboots cause temporary redirect issues in the ACR backend. | Retry the pull/push request. Azure Storage tenants reboot and redirect queries t | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-0150] |

## 快速排查路径
1. 检查 → Customer exceeds the concurrent request limit for their ACR  `[来源: ADO Wiki]`
   - 方案: 1) Verify throttling with Kusto: cluster('ACR').database('acrprod').RegistryActivity | where Precise
2. 检查 → Internal Azure Storage account used by ACR is experiencing b `[来源: ADO Wiki]`
   - 方案: 1) Verify origin with Kusto: RegistryActivity | where http_response_status == '307' | where http_req
3. 检查 → During image pull, ACR sends 307 redirect to Azure Blob Stor `[来源: ADO Wiki]`
   - 方案: Retry the pull/push operation — since load balancer distributes across many front-end nodes, retries
4. 检查 → Azure Storage tenant reboots cause temporary redirect issues `[来源: ADO Wiki]`
   - 方案: Retry the pull/push request. Azure Storage tenants reboot and redirect queries to valid up-time tena

> 本 topic 有融合排查指南 → [完整排查流程](details/throttling-intermittent.md#排查流程)
