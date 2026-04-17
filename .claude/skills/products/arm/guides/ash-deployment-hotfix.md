# ARM Azure Stack Hub 部署与补丁 — 排查速查

**来源数**: 8 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | VM deployment fails when using custom user image created in Azure Stack Hub version 1907 | Bug in Azure Stack Hub 1907 image handling; orchestration issue between IBHU and non-HA VM repair d… | Apply hotfix 1.1907.12.44 (KB 4517473, released Aug 16 2019). Fixes orchestration between IBHU and … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | OEM Firmware updates required for Azure Stack Hub 1908 upgrade fail to install on 1907; false BMC s… | OEM firmware update installation had reliability issues (FRU timeout too short for Scale-Outs excee… | Apply hotfix 1.1907.17.54 (KB 4523826, released Sep 27 2019). Increases FRU timeout for Scale-Outs,… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Non-HA VMs (NonHAVMs) fail to start after an Azure Stack Hub update in version 1907; VMs remain sto… | NonHAVMs initialization issue with guardian certificates; RestoreNonHAVMs process did not handle gu… | Apply hotfix 1.1907.26.70 (KB 4541348, released Feb 25 2020). Fixes NonHAVMs guardian certificate i… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Azure Stack Hub marketplace downloads fail with a certificate validation error | Azure Bridge certificates were missing on WAS (Windows Azure Stack) and XRP VMs, causing certificat… | Apply hotfix 1.1907.30.83 (KB 4562962, released Nov 6 2020). Installs Azure Bridge Certificates on … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Test-AzureStack reports false Fabric Ring health failures (misdiagnosis) in Azure Stack Hub 1907; O… | Test-AzureStack incorrectly diagnosed Fabric Ring health status; alternate signer checking was too … | Apply hotfix 1.1907.7.35 (KB 4515310, released Jul 25 2019). Corrects Test-AzureStack Fabric Ring h… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Azure Stack Hub environments originally deployed before version 1809 are missing OEM-related catego… | Pre-1809 deployments were not provisioned with certain OEM-related CloudParameters categories requi… | Apply hotfix 1.1907.8.37 (KB 4515650, released Aug 2 2019). Adds missing OEM parameter categories t… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Azure Stack Hub admin portal does not display download progress for update packages; download progr… | URP (Update Resource Provider) was not reporting download progress to the admin portal UI; missing … | Apply hotfix 1.1908.11.47 (KB 4535000, released Dec 18 2019). Improves admin portal to show downloa… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Azure Stack Hub 1907 update preparation steps are unreliable or stall; update preparation UX shows … | WaitAndReceiveJob was too permissive of PowerShell states; UX reporting gaps in preparation phase; … | Apply hotfix 1.1907.18.56 (KB 4528552). Multiple preparation UX improvements and reliability fixes … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Apply hotfix 1.1907.12.44 (KB 4517473, released Aug 16 2019). Fixes orchestrati… `[来源: ado-wiki]`
2. Apply hotfix 1.1907.17.54 (KB 4523826, released Sep 27 2019). Increases FRU tim… `[来源: ado-wiki]`
3. Apply hotfix 1.1907.26.70 (KB 4541348, released Feb 25 2020). Fixes NonHAVMs gu… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ash-deployment-hotfix.md#排查流程)
