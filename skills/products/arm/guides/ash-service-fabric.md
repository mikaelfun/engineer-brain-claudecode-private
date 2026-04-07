# ARM Azure Stack Hub Service Fabric — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Stack Hub FabricRingServices contain orphaned and expired certificates for HRP and SBRP after… | HRP and SBRP certificates became orphaned and expired after services migrated to containers. | Run Test-AzsSupportKIOrphanedExpiredCertificate from the Azs.Support module. Use -Remediate to clea… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | DiskRP does not update application manifest parameters after completing Internal Secret Rotation in… | DiskRP service did not refresh application manifest parameters following Internal Secret Rotation; … | Apply hotfix 1.1907.18.56 (KB 4528552, released Oct 29 2019). Fixes DiskRP manifest parameter updat… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Run Test-AzsSupportKIOrphanedExpiredCertificate from the Azs.Support module. Us… `[来源: ado-wiki]`
2. Apply hotfix 1.1907.18.56 (KB 4528552, released Oct 29 2019). Fixes DiskRP mani… `[来源: ado-wiki]`
