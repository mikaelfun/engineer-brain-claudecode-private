# VM Vm Windows Os — 排查速查

**来源数**: 2 | **21V**: 未标注
**条目数**: 3 | **关键词**: windows, os
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure File Sync agent installation fails with error 0x80070080 - SYSTEM account does not have Full C... | SYSTEM account lacks Full Control permissions on the installation folder, possib... | Grant SYSTEM account Full Control on the target installation directory. Check fo... | 🟢 8.0 | ADO Wiki |
| 2 | Black screen on RDP that disconnects after about 1 minute; VM shows high resource/performance usage;... | VM is experiencing a performance spike or virtual memory exhaustion due to appli... | Identify resource-heavy processes via Task Manager or Get-Process. Reduce memory... | 🟢 8.0 | ADO Wiki |
| 3 | SLES migration: suse-migration-sle15-activation not found in package names | SLES 12 Public Cloud module not enabled by default. | SUSEConnect -p sle-module-public-cloud/12/x86_64. For SAP remove sle-ha-release.... | 🔵 7.0 | MS Learn |

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-windows-os.md)
