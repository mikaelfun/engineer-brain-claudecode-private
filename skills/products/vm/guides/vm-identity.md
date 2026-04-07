# VM Vm Identity — 排查速查

**来源数**: 2 | **21V**: 未标注
**条目数**: 2 | **关键词**: identity
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | RDP shows black screen then disconnects; VM is under brute force RDP attack causing performance degr... | Brute force RDP attack over the internet causing CPU/memory performance spike, e... | Enable Azure NSG rules to restrict RDP access to known IP ranges; enable JIT VM ... | 🟢 8.0 | ADO Wiki |
| 2 | WinGA MSI install fails: Object doesnt support this property or method: Me.Script. | Kaspersky antivirus (Kavfswp.exe) interferes with .wsf/.vbs scripts during MSI i... | Remove Kaspersky Security before installing WinGA MSI. Reinstall Kaspersky after... | 🟢 8.5 | OneNote |

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-identity.md)
