# ARM Azure Stack Hub 部署与补丁 — 综合排查指南

**条目数**: 8 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-b-bicep.md, mslearn-arm-bicep-what-if-guide.md
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: VM deployment fails when using custom user image created in Azure Stack Hub ver…
> 来源: ado-wiki

**根因分析**: Bug in Azure Stack Hub 1907 image handling; orchestration issue between IBHU and non-HA VM repair during image-based deployments

1. Apply hotfix 1.
2. 44 (KB 4517473, released Aug 16 2019).
3. Fixes orchestration between IBHU and non-HA VM repair and updates URP to use ScopedRepair action plan.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: OEM Firmware updates required for Azure Stack Hub 1908 upgrade fail to install …
> 来源: ado-wiki

**根因分析**: OEM firmware update installation had reliability issues (FRU timeout too short for Scale-Outs exceeding 6 hours); BMC runner generating false positive saturation alerts

1. Apply hotfix 1.
2. 54 (KB 4523826, released Sep 27 2019).
3. Increases FRU timeout for Scale-Outs, fixes OEM update preparation reliability, and disables false-positive BMC saturation alerts.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Non-HA VMs (NonHAVMs) fail to start after an Azure Stack Hub update in version …
> 来源: ado-wiki

**根因分析**: NonHAVMs initialization issue with guardian certificates; RestoreNonHAVMs process did not handle guardian cert initialization correctly during Azure Stack startup after update

1. Apply hotfix 1.
2. 70 (KB 4541348, released Feb 25 2020).
3. Fixes NonHAVMs guardian certificate initialization; fixes RestoreNonHAVMs initialization issue during Azure Stack update.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Azure Stack Hub marketplace downloads fail with a certificate validation error
> 来源: ado-wiki

**根因分析**: Azure Bridge certificates were missing on WAS (Windows Azure Stack) and XRP VMs, causing certificate validation failure during marketplace download operations

1. Apply hotfix 1.
2. 83 (KB 4562962, released Nov 6 2020).
3. Installs Azure Bridge Certificates on WAS and XRP VMs to resolve marketplace certificate validation errors.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Test-AzureStack reports false Fabric Ring health failures (misdiagnosis) in Azu…
> 来源: ado-wiki

**根因分析**: Test-AzureStack incorrectly diagnosed Fabric Ring health status; alternate signer checking was too restrictive for OEM firmware update scripts

1. Apply hotfix 1.
2. 35 (KB 4515310, released Jul 25 2019).
3. Corrects Test-AzureStack Fabric Ring health diagnosis; skips alternate signer checking for OEM firmware update scripts.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Azure Stack Hub environments originally deployed before version 1809 are missin…
> 来源: ado-wiki

**根因分析**: Pre-1809 deployments were not provisioned with certain OEM-related CloudParameters categories required for OEM compatibility in later versions

1. Apply hotfix 1.
2. 37 (KB 4515650, released Aug 2 2019).
3. Adds missing OEM parameter categories to pre-1809 deployments via BeforeAzureStack inline patch.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Azure Stack Hub admin portal does not display download progress for update pack…
> 来源: ado-wiki

**根因分析**: URP (Update Resource Provider) was not reporting download progress to the admin portal UI; missing telemetry/UI update path for download progress in 1908

1. Apply hotfix 1.
2. 47 (KB 4535000, released Dec 18 2019).
3. Improves admin portal to show download progress of Azure Stack Hub update packages.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Azure Stack Hub 1907 update preparation steps are unreliable or stall; update p…
> 来源: ado-wiki

**根因分析**: WaitAndReceiveJob was too permissive of PowerShell states; UX reporting gaps in preparation phase; multiple preparation step reliability issues

1. Apply hotfix 1.
2. 56 (KB 4528552).
3. Multiple preparation UX improvements and reliability fixes including stricter PowerShell state handling in WaitAndReceiveJob.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| VM deployment fails when using custom user image created in… | Bug in Azure Stack Hub 1907 image handling; orchestration i… | Apply hotfix 1.1907.12.44 (KB 4517473, released Aug 16 2019… |
| OEM Firmware updates required for Azure Stack Hub 1908 upgr… | OEM firmware update installation had reliability issues (FR… | Apply hotfix 1.1907.17.54 (KB 4523826, released Sep 27 2019… |
| Non-HA VMs (NonHAVMs) fail to start after an Azure Stack Hu… | NonHAVMs initialization issue with guardian certificates; R… | Apply hotfix 1.1907.26.70 (KB 4541348, released Feb 25 2020… |
| Azure Stack Hub marketplace downloads fail with a certifica… | Azure Bridge certificates were missing on WAS (Windows Azur… | Apply hotfix 1.1907.30.83 (KB 4562962, released Nov 6 2020)… |
| Test-AzureStack reports false Fabric Ring health failures (… | Test-AzureStack incorrectly diagnosed Fabric Ring health st… | Apply hotfix 1.1907.7.35 (KB 4515310, released Jul 25 2019)… |
| Azure Stack Hub environments originally deployed before ver… | Pre-1809 deployments were not provisioned with certain OEM-… | Apply hotfix 1.1907.8.37 (KB 4515650, released Aug 2 2019).… |
| Azure Stack Hub admin portal does not display download prog… | URP (Update Resource Provider) was not reporting download p… | Apply hotfix 1.1908.11.47 (KB 4535000, released Dec 18 2019… |
| Azure Stack Hub 1907 update preparation steps are unreliabl… | WaitAndReceiveJob was too permissive of PowerShell states; … | Apply hotfix 1.1907.18.56 (KB 4528552). Multiple preparatio… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VM deployment fails when using custom user image created in Azure Stack Hub version 1907 | Bug in Azure Stack Hub 1907 image handling; orchestration issue between IBHU and non-HA VM repair d… | Apply hotfix 1.1907.12.44 (KB 4517473, released Aug 16 2019). Fixes orchestration between IBHU and … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | OEM Firmware updates required for Azure Stack Hub 1908 upgrade fail to install on 1907; false BMC s… | OEM firmware update installation had reliability issues (FRU timeout too short for Scale-Outs excee… | Apply hotfix 1.1907.17.54 (KB 4523826, released Sep 27 2019). Increases FRU timeout for Scale-Outs,… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Non-HA VMs (NonHAVMs) fail to start after an Azure Stack Hub update in version 1907; VMs remain sto… | NonHAVMs initialization issue with guardian certificates; RestoreNonHAVMs process did not handle gu… | Apply hotfix 1.1907.26.70 (KB 4541348, released Feb 25 2020). Fixes NonHAVMs guardian certificate i… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Stack Hub marketplace downloads fail with a certificate validation error | Azure Bridge certificates were missing on WAS (Windows Azure Stack) and XRP VMs, causing certificat… | Apply hotfix 1.1907.30.83 (KB 4562962, released Nov 6 2020). Installs Azure Bridge Certificates on … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Test-AzureStack reports false Fabric Ring health failures (misdiagnosis) in Azure Stack Hub 1907; O… | Test-AzureStack incorrectly diagnosed Fabric Ring health status; alternate signer checking was too … | Apply hotfix 1.1907.7.35 (KB 4515310, released Jul 25 2019). Corrects Test-AzureStack Fabric Ring h… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Azure Stack Hub environments originally deployed before version 1809 are missing OEM-related catego… | Pre-1809 deployments were not provisioned with certain OEM-related CloudParameters categories requi… | Apply hotfix 1.1907.8.37 (KB 4515650, released Aug 2 2019). Adds missing OEM parameter categories t… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure Stack Hub admin portal does not display download progress for update packages; download progr… | URP (Update Resource Provider) was not reporting download progress to the admin portal UI; missing … | Apply hotfix 1.1908.11.47 (KB 4535000, released Dec 18 2019). Improves admin portal to show downloa… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Azure Stack Hub 1907 update preparation steps are unreliable or stall; update preparation UX shows … | WaitAndReceiveJob was too permissive of PowerShell states; UX reporting gaps in preparation phase; … | Apply hotfix 1.1907.18.56 (KB 4528552). Multiple preparation UX improvements and reliability fixes … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
