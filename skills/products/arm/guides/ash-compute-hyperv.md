# ARM Azure Stack Hub 计算与 Hyper-V — 排查速查

**来源数**: 3 | **21V**: 部分
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Non-self-signed Entrust certificate found in the CRP application package manifest on Azure Stack Hu… | Entrust certificate (non-self-signed) incorrectly present in CRP application package manifest. | Run Test-AzsSupportKINonSelfSignedCertInCrpApp from the Azs.Support module. Use -Remediate flag for… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Setting VM LicenseType to value None in Azure Stack Hub 1908 fails; None is not recognized as a val… | CRP (Compute Resource Provider) did not handle LicenseType value None as valid; memory cache issue … | Apply hotfix 1.1908.11.47 (KB 4535000). CRP updated to accept LicenseType None; memory cache for vi… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Azure Stack Hub VMs that were previously resized (without deallocate) on builds 2301-2406 experienc… | Code path issue between CRP and storage infrastructure starting in build 2301 caused temp disk resi… | (1) Upgrade Azure Stack Hub to build 2408 or later (contains fix PR 10194138). (2) After upgrade, r… | 🔵 6.0 — ado-wiki | [ADO Wiki] |

## 快速排查路径
1. Run Test-AzsSupportKINonSelfSignedCertInCrpApp from the Azs.Support module. Use… `[来源: ado-wiki]`
2. Apply hotfix 1.1908.11.47 (KB 4535000). CRP updated to accept LicenseType None;… `[来源: ado-wiki]`
3. (1) Upgrade Azure Stack Hub to build 2408 or later (contains fix PR 10194138). … `[来源: ado-wiki]`
