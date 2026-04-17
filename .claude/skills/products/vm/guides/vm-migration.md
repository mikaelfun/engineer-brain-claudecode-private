# VM Vm Migration — 排查速查

**来源数**: 1 | **21V**: 未标注
**条目数**: 3 | **关键词**: migration
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 'File already exists' error when copying files to mounted Azure file share using Windows File Explor... | Files have NTFS Alternate Data Streams which Azure File Shares do not support | Remove alternate data streams before copying: Remove-Item <filepath> -Stream *; ... | 🔵 7.0 | ADO Wiki |
| 2 | Copying files into mounted Azure File Share using Windows File Explorer shows File already exists or... | Source files have Alternate Data Streams (ADS). Azure File Shares do not support... | Check for ADS with Get-Item <file> -Stream *. If streams beyond :$DATA exist, re... | 🔵 7.0 | ADO Wiki |
| 3 | Azure File Sync upload operations fail with error code -2147024891 (Access Denied). Download operati... | Permissions on the System Volume Information (SVI) folder are incorrect; NT AUTH... | Grant SYSTEM full control: run PsExec.exe -s -I -d cmd, then cacls "<drive>:\sys... | 🔵 7.0 | ADO Wiki |

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-migration.md)
