# Intune VPN 配置 — 综合排查指南

**条目数**: 4 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-07

---

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 'Activate' JIT button is disabled/greyed out in MyWorkspace website for a workspace | MyWorkspace website sometimes fails to enable the JIT activation button; work... | 1) Connect to MSFT-AzVPN-Manual (or usual work VPN). 2) Open the ModernRDP app. 3) Click on the n... | 🟢 8.5 | ADO Wiki |
| 2 | Microsoft Edge on Android 13 ignores PAC setting in per-app VPN profile. Edge does not consume pr... | Android 13 behavior change causes Edge to ignore PAC when VPN established bef... | Disconnect/reconnect VPN while Edge running. For Always-on VPN use airplane mode toggle. Alt: Pos... | 🔵 7.5 | MS Learn |
| 3 | How to deploy a VPN connection so when users open the Settings menu on an iOS device, the type sh... | &nbsp;A custom VPN profile was needed to point to the correct version of Cisc... | To create a custom VPN profile:  Choose your SSO &gt; Put in the server address  Point the bundle... | 🔵 7.0 | ContentIdea KB |
| 4 | Customers will be impacted if they are using F5 Access VPN profiles targeted to iOS. These iOS de... | F5 has announced that F5 Access 2.1 and earlier, also known as F5 Access Lega... | Migrate their iOS devices to Intune on Azure as soon as possible so they can set up VPN profiles ... | 🔵 7.0 | ContentIdea KB |
