# Disk Azure Stack Edge: Storage & Upload — 排查速查

**来源数**: 3 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: alternate-data-streams, azure-stack-edge, copy-error-665, datadata, error-2998, error-665, readonly, refs, robocopy, storage-gateway

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Copy to Azure Stack Edge via Robocopy fails with ERROR 665 (0x00000299) - The requested operation could not be completed | Azure Stack Edge uses ReFS internally which limits alternate data streams to 128KiB; source files wi | Add /dcopy:x option to Robocopy command to skip copying alternate data streams; files should then copy successfully | 🟢 8.5 | [ADO Wiki] |
| 2 | Robocopy to Azure Stack Edge fails with ERROR 665 (0x00000299): requested operation could not be completed due to file s | Azure Stack Edge uses ReFS internally with 128kiB limit on alternate data streams; source files with | Add /dcopy:x flag to Robocopy command to skip copying alternate data streams | 🟢 8.5 | [ADO Wiki] |
| 3 | Unable to upload files to Azure Stack Edge share; 2998 error in ManifestsPerShare Errors.xml; hcsedgeagentwriter logs sh | The datadata folder on ASE share root has ReadOnly attribute set, blocking the writer process | Create empty non-readonly folder on host; robocopy it to share root with /nodcopy option to reset directory attributes;  | 🟢 8.5 | [ADO Wiki] |

## 快速排查路径

1. Copy to Azure Stack Edge via Robocopy fails with ERROR 665 (0x00000299) - The re → Add /dcopy:x option to Robocopy command to skip copying alternate data streams; files should then co `[来源: ado-wiki]`
2. Robocopy to Azure Stack Edge fails with ERROR 665 (0x00000299): requested operat → Add /dcopy:x flag to Robocopy command to skip copying alternate data streams `[来源: ado-wiki]`
3. Unable to upload files to Azure Stack Edge share; 2998 error in ManifestsPerShar → Create empty non-readonly folder on host; robocopy it to share root with /nodcopy option to reset di `[来源: ado-wiki]`
