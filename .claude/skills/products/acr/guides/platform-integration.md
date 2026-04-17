# ACR 平台集成（Web App / Container Apps / Webhook） — 排查速查

**来源数**: 3 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR webhook fails to push to App Service with 500 InternalServerError — webhook  | ACR webhooks under spoke model with cross-subscription configuration are not sup | Use Azure DevOps pipelines instead of ACR webhooks for CI/CD to App Service in I | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-046] |
| 2 | Azure Container Apps creation fails after 15-20 minutes with 'ContainerAppOperat | Known bug in Container Apps platform that cannot handle ACR registry names excee | Use an ACR with a shorter registry name (under 30 characters). If customer canno | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-064] |
| 3 | Azure Web App fails to pull image from ACR with unauthorized error - admin user  | For admin user: incorrect login server/username/password configured in Web App e | Admin user: verify credentials in ACR Access keys blade match Web App environmen | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-018] |
| 4 | Azure Web App fails to pull from ACR with client IP not allowed - Web App outbou | ACR firewall does not include Web App outbound IP addresses in the allow list, a | Option 1: Add all Web App outbound IPs to ACR firewall (find in Web App Overview | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-019] |
| 5 | ACR resources in China East 1 (CE1) and China North 1 (CN1) regions need migrati | CE1 and CN1 Azure regions are being retired; all resources in these regions must | Follow Microsoft migration guide: https://learn.microsoft.com/en-us/azure/azure- | 🟢 9.0 — OneNote单源+实证 | [acr-onenote-004] |

## 快速排查路径
1. 检查 → ACR webhooks under spoke model with cross-subscription confi `[来源: ADO Wiki]`
   - 方案: Use Azure DevOps pipelines instead of ACR webhooks for CI/CD to App Service in ILB ASE. If ACR canno
2. 检查 → Known bug in Container Apps platform that cannot handle ACR  `[来源: ADO Wiki]`
   - 方案: Use an ACR with a shorter registry name (under 30 characters). If customer cannot rename, create a n
3. 检查 → For admin user: incorrect login server/username/password con `[来源: MS Learn]`
   - 方案: Admin user: verify credentials in ACR Access keys blade match Web App environment variables. Managed
4. 检查 → ACR firewall does not include Web App outbound IP addresses  `[来源: MS Learn]`
   - 方案: Option 1: Add all Web App outbound IPs to ACR firewall (find in Web App Overview > Outbound IP addre
5. 检查 → CE1 and CN1 Azure regions are being retired; all resources i `[来源: OneNote]`
   - 方案: Follow Microsoft migration guide: https://learn.microsoft.com/en-us/azure/azure-resource-manager/man

> 本 topic 有融合排查指南 → [完整排查流程](details/platform-integration.md#排查流程)
