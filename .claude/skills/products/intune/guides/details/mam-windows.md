# Intune Windows MAM 与 WIP / Edge — 综合排查指南

**条目数**: 11 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-07

---

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | WIP policy fails to apply with error 0x807C0003 on EDPEnforcementLevel CSP; MDM diagnostic shows ... | Direct Access is enabled on the device, which conflicts with WIP deployment. ... | 1. Disable Direct Access on the device or exclude it from Direct Access policy; 2. Re-sync device... | 🟢 8.5 | ADO Wiki |
| 2 | DFS namespace path (\domain.name) is not recognized as corporate by WIP, but direct FQDN path (\f... | WIP network isolation policy only includes the domain name but not the IP add... | 1. In WIP Advanced settings > Network Perimeters > IPv4/IPv6 ranges, add the IP address range ass... | 🟢 8.5 | ADO Wiki |
| 3 | Firefox, Chrome, WhatsApp desktop or other apps using custom network stack are blocked from acces... | These apps use their own network stack and resolve connections by IP address ... | Add the /*AppCompat*/ string to the WIP Cloud resources setting to stop Windows from automaticall... | 🟢 8.5 | ADO Wiki |
| 4 | WIP without enrollment (WE) policy not applying / device cannot connect to WIP MAM endpoint wip.m... | TCP port 444 is blocked by customer firewall. WIP WE uses port 444/TCP for MA... | Ensure TCP port 444 is allowed through the customer firewall for WIP without enrollment connectiv... | 🔵 7.5 | ADO Wiki |
| 5 | Windows MAM 用户在 Edge Work Profile 创建期间 AAD 设备注册完成后仍被阻止访问受保护资源 | 设备注册和 MAM 注册过程虽然成功完成，但 CA 策略评估存在延迟，导致用户在短时间内仍被 Conditional Access 阻止 | 1. 等待约 1 分钟后在不同标签页中重新导航到目标页面；2. 如持续被阻止，管理员应检查 Intune MAM 策略是否正确应用到该用户；3. 检查 CA 策略配置中 Require app ... | 🔵 7.5 | ADO Wiki |
| 6 | 用户在 Edge 中使用预先存在的未注册账号登录后，永久无法完成 MAM 注册，始终被 Conditional Access 阻止 | 如果 Edge 中存在预先登录但未通过 Heads Up Page 进行设备注册的账号，该账号将永远无法正确注册到 MAM，这是一个已知的产品限制 | 1. 用户需要从 Edge 中移除该工作账号；2. 从 Settings > Accounts > Access work or school 移除组织账号；3. 重新在 Edge 中添加工作账... | 🔵 7.5 | ADO Wiki |
| 7 | MAM Health Check 阻止对话框被关闭后，用户切换到非托管 Edge Profile 再切回托管 Profile 后可绕过保护访问受保护内容 | MAM Health Check 阻止对话框的状态在 Profile 切换时未正确持久化，存在安全漏洞（修复进行中） | 1. 这是已知安全问题，修复将通过 Microsoft Edge 更新发布；2. 临时缓解：教育用户不要在被阻止时切换 Profile；3. 管理员可考虑通过 Conditional Acces... | 🔵 7.5 | ADO Wiki |
| 8 | 启用 MAM 的 Edge Profile 中 BingChat 上下文聊天功能被阻止 | Windows MAM 的 DLP 策略会阻止 BingChat 的 Contextual Chat 功能，这是已知限制而非 bug | 1. 告知客户这是预期行为——MAM 策略会阻止 BingChat 上下文功能；2. 用户可在非托管 Profile 中使用 BingChat；3. 此限制可能在后续 Edge 更新中改进 | 🔵 7.5 | ADO Wiki |
| 9 | WIP is not applying when updating from Office Pro Plus version 1706 or 1707 to version 1708. | Office executables code signed by the wrong CA | Office suite: Non-security updates must be performed for version 1707 and it fixes 1706 issues.Th... | 🔵 7.0 | ContentIdea KB |
| 10 | Customer configured a WIP policy to protect work files copied from Outlook to an external USB dev... | By design in builds prior to 1709. This is fixed in 1709. | To protect work files copied to external devices: 1. From Outlook, right-click on file and select... | 🔵 7.0 | ContentIdea KB |
| 11 | edge://edge-dlp-internals 显示 MAM flags 未启用，手动启用后关闭所有 Edge 实例后不持久 | MAM 未正确注册到设备/用户，导致 DLP 标志无法持久化。可能是设备注册问题或 MAM 策略未正确下发 | 1. 此场景归属 Edge 支持团队（Browser > Microsoft Edge > Edge for Windows）；2. 检查 MamCache.json 文件确认注册状态；3. 检... | 🔵 6.5 | ADO Wiki |
