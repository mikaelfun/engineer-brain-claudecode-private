# ACR ACR Tasks 与构建 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR tasks not being triggered or failing to complete with no actionable output | ACR task run failures can be caused by various issues including build configurat | Run Kusto query on cluster('ACR').database('acrprod').BuildHostTrace filtered by | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-019] |
| 2 | Customer needs to purge/clean up ACR images but cannot use ACR Tasks due to netw | ACR purge runs as an ACR Task by default, which requires network bypass if the r | Download ACR CLI binary from https://github.com/azure/acr-cli and run purge comm | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-042] |
| 3 | ACR Tasks fail with error: 'ACR Tasks requests for the registry {registryName} a | ACR temporarily paused ACR Tasks runs from subscriptions using Azure trial/free  | 1) Advise customer to upgrade to a paid subscription. 2) If customer needs acces | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-043] |
| 4 | ACR Continuous Patching cssc-patch-image task fails at push-image step with cach | CSSC (Continuous Patching) workflows are not supported on repositories that cont | Switch to Artifact sync based cache rules, or run CSSC workflow on a different r | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-065] |
| 5 | ACR Continuous Patching cssc-patch-image task fails with 'image not found in MCR | The Copa tooling image required for patching is not available in Microsoft Conta | Contact upstream team (azcu-publishing@microsoft.com) or raise a PR on GitHub (m | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-066] |
| 6 | ACR Task fails to run when the registry has public access disabled (network-rest | ACR Task requires system-assigned managed identity and trusted service configura | 1) Enable 'Allow trusted Microsoft services to access this container registry' o | 🟢 8.5 — OneNote单源+实证 | [acr-onenote-002] |
| 7 | Customer wants to use ACR Task dedicated agent pools in Mooncake (Azure China) | Feature gap — ACR Task agent pools have not been deployed to Mooncake Cloud | No workaround currently available. Inform customer this is a known Mooncake limi | 🟢 9.0 — OneNote单源+实证 | [acr-onenote-006] |
| 8 | Need to import container images from Azure Blob Storage into ACR (no direct dock | Images stored as tar archives in blob storage need a multi-step import process v | Use ACR Task with multi-step YAML: 1) curl to download tar from blob (with SAS t | 🟢 8.5 — OneNote单源+实证 | [acr-onenote-010] |

## 快速排查路径
1. 检查 → ACR task run failures can be caused by various issues includ `[来源: ADO Wiki]`
   - 方案: Run Kusto query on cluster('ACR').database('acrprod').BuildHostTrace filtered by Tag containing '<ac
2. 检查 → ACR purge runs as an ACR Task by default, which requires net `[来源: ADO Wiki]`
   - 方案: Download ACR CLI binary from https://github.com/azure/acr-cli and run purge commands locally on own 
3. 检查 → ACR temporarily paused ACR Tasks runs from subscriptions usi `[来源: ADO Wiki]`
   - 方案: 1) Advise customer to upgrade to a paid subscription. 2) If customer needs access with free credits:
4. 检查 → CSSC (Continuous Patching) workflows are not supported on re `[来源: ADO Wiki]`
   - 方案: Switch to Artifact sync based cache rules, or run CSSC workflow on a different repository that does 
5. 检查 → The Copa tooling image required for patching is not availabl `[来源: ADO Wiki]`
   - 方案: Contact upstream team (azcu-publishing@microsoft.com) or raise a PR on GitHub (microsoft/mcr repo, e

> 本 topic 有融合排查指南 → [完整排查流程](details/acr-tasks-build.md#排查流程)
