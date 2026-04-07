# VM Vm Identity — 综合排查指南

**条目数**: 2 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-c-AFS-System-Managed-Identity.md](../../guides/drafts/ado-wiki-c-AFS-System-Managed-Identity.md), [ado-wiki-c-managed-identity-smb-howto.md](../../guides/drafts/ado-wiki-c-managed-identity-smb-howto.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: ADO Wiki, OneNote

1. 参照 [ado-wiki-c-AFS-System-Managed-Identity.md](../../guides/drafts/ado-wiki-c-AFS-System-Managed-Identity.md) 排查流程
2. 参照 [ado-wiki-c-managed-identity-smb-howto.md](../../guides/drafts/ado-wiki-c-managed-identity-smb-howto.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Brute force RDP attack over the internet causing C | 1 条相关 | Enable Azure NSG rules to restrict RDP access to known IP ra... |
| Kaspersky antivirus (Kavfswp.exe) interferes with  | 1 条相关 | Remove Kaspersky Security before installing WinGA MSI. Reins... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | RDP shows black screen then disconnects; VM is under brute force RDP attack causing performance degr... | Brute force RDP attack over the internet causing CPU/memory performance spike, e... | Enable Azure NSG rules to restrict RDP access to known IP ranges; enable JIT VM ... | 🟢 8.0 | ADO Wiki |
| 2 | WinGA MSI install fails: Object doesnt support this property or method: Me.Script. | Kaspersky antivirus (Kavfswp.exe) interferes with .wsf/.vbs scripts during MSI i... | Remove Kaspersky Security before installing WinGA MSI. Reinstall Kaspersky after... | 🟢 8.5 | OneNote |

