# Intune Security Baseline 与策略冲突 — 综合排查指南

**条目数**: 5 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-Security-Baselines.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Security Baselines
> 来源: ADO Wiki — [ado-wiki-Security-Baselines.md](../drafts/ado-wiki-Security-Baselines.md)

**Security Baselines — Troubleshooting Guide**
**Overview**
- Windows 10/11 MDM Security Baseline
- Microsoft Defender for Endpoint baseline
- Microsoft 365 Apps for Enterprise
- Microsoft Edge Baseline
- Windows 365 Security Baseline

**Scoping Questions**
1. Full error description
2. Steps to reproduce
3. PolicyID, example userID and deviceID
4. Device management type (Intune enrolled, co-managed, tenant attached, MDE attached)
5. Whether it ever worked and last change before issue

**Support Boundaries**

**Troubleshooting**

**Assignment States**
- **Succeeded**: Policy applied
- **Conflict**: Two settings on same device, admin must review
- **Error**: Policy failed, error code links to explanation
- **Pending**: Device hasn't checked in
- **Not applicable**: Device can't receive policy (e.g., OS version too old)

**Conflicts**
```kusto
```

**Errors**
- Review CSP pre-requirements for each security setting
- KB: [How to configure Security Baselines](https://internal.evergreen.microsoft.com/en-us/topic/47625e81-41a4-d0d2-6fa2-93e0adbd3d59)

**Pending**
1. Confirm device last check-in is recent
2. Force sync and verify status updates
3. Confirm user/device is direct member of assigned group
... (详见原始草稿)

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 部署 Security Baseline 后无法通过 RDP 远程访问 PC，或 Miracast 投屏功能被阻止 | Security Baseline 默认启用了限制性安全设置，可能阻止 RDP 或 Miracast 相关功能 | RDP 问题参考: https://internal.evergreen.microsoft.com/en-us/topic/a1703643-7bcc-5cc6-810a-80299e59ce... | 🟢 8.5 | ADO Wiki |
| 2 | Security baseline shows 'Pending' status; device never receives the policy | Device hasn't checked in with Intune, or user/device is not in the effective ... | 1) Confirm device last check-in is recent (force sync if needed). 2) Verify user/device is direct... | 🟢 8.5 | ADO Wiki |
| 3 | Security baseline profile shows 'Pending' status — device not receiving or applying security base... | Device may not have checked in recently, or user/device is not a direct membe... | 1) Confirm device last check-in status is recent and force sync 2) Confirm user/device is direct ... | 🟢 8.5 | ADO Wiki |
| 4 | Endpoint security policy conflicts with security baselines or device configuration profiles — sam... | Managing the same setting on the same device through multiple policy types (e... | 1) Develop a plan for using multiple policy types to minimize conflict risk 2) All policy types (... | 🟢 8.5 | ADO Wiki |
| 5 | If a customer created a security baseline between 12/15 and 12/17 and were not flighted into the ... | Security baselines was shipped too early, and customers could see and create ... | Request flighting of Security Baselines through the normal flighting request process. The flighti... | 🔵 7.0 | ContentIdea KB |
