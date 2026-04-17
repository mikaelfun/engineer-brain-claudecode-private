# Disk Azure Import/Export Service — 排查速查

**来源数**: 3 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: azure-storage-devices, export-job, import-export, import-job, incorrect-files, journal-file, misroute, routing, sap, snapshots

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer receives incorrect files in Azure Import-Export export job; unwanted snapshots fill the drives instead of inten | Customer selected Export all option instead of specific files/containers; all snapshots in storage a | Use Selected containers and blobs or Export from blob list file (XML) option instead of Export all; if using Azure Site  | 🟢 8.5 | [ADO Wiki] |
| 2 | Unable to create Azure Import-Export import job in portal; error related to journal file (.jrn) from waimport.exe tool | Journal file is either incomplete (missing XML output at end) or exceeds the 2MB limit (waimport.exe | Check journal file for complete XML at end; if incomplete: v1 - regenerate with /skipwrite parameter; v2 - recopy data t | 🟢 8.5 | [ADO Wiki] |
| 3 | Case misrouted to Azure Storage Devices queue; common misroutes include PST migration, on-premises data gateway, Azure V | Keywords like gateway, edge, Azure Stack, import-export cause routing confusion with other Azure pro | PST migration via network upload: reroute to Security > Purview > Import Service. On-premises data gateway: reroute to L | 🟢 8.5 | [ADO Wiki] |

## 快速排查路径

1. Customer receives incorrect files in Azure Import-Export export job; unwanted sn → Use Selected containers and blobs or Export from blob list file (XML) option instead of Export all;  `[来源: ado-wiki]`
2. Unable to create Azure Import-Export import job in portal; error related to jour → Check journal file for complete XML at end; if incomplete: v1 - regenerate with /skipwrite parameter `[来源: ado-wiki]`
3. Case misrouted to Azure Storage Devices queue; common misroutes include PST migr → PST migration via network upload: reroute to Security > Purview > Import Service `[来源: ado-wiki]`
