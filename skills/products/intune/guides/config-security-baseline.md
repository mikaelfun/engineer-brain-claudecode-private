# Intune Security Baseline 与策略冲突 — 排查速查

**来源数**: 2 | **21V**: 全部适用
**条目数**: 5 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 部署 Security Baseline 后无法通过 RDP 远程访问 PC，或 Miracast 投屏功能被阻止 | Security Baseline 默认启用了限制性安全设置，可能阻止 RDP 或 Miracast 相关功能 | RDP 问题参考: https://internal.evergreen.microsoft.com/en-us/topic/a1703643-7bcc-5cc6-810a-80299e59ce... | 🟢 8.5 | ADO Wiki |
| 2 | Security baseline shows 'Pending' status; device never receives the policy | Device hasn't checked in with Intune, or user/device is not in the effective ... | 1) Confirm device last check-in is recent (force sync if needed). 2) Verify user/device is direct... | 🟢 8.5 | ADO Wiki |
| 3 | Security baseline profile shows 'Pending' status — device not receiving or applying security base... | Device may not have checked in recently, or user/device is not a direct membe... | 1) Confirm device last check-in status is recent and force sync 2) Confirm user/device is direct ... | 🟢 8.5 | ADO Wiki |
| 4 | Endpoint security policy conflicts with security baselines or device configuration profiles — sam... | Managing the same setting on the same device through multiple policy types (e... | 1) Develop a plan for using multiple policy types to minimize conflict risk 2) All policy types (... | 🟢 8.5 | ADO Wiki |
| 5 | If a customer created a security baseline between 12/15 and 12/17 and were not flighted into the ... | Security baselines was shipped too early, and customers could see and create ... | Request flighting of Security Baselines through the normal flighting request process. The flighti... | 🔵 7.0 | ContentIdea KB |

## 快速排查路径
1. RDP 问题参考: https://internal.evergreen.microsoft.com/en-us/topic/a1703643-7bcc-5cc6-810a-80299e59ceae。Miracast 问题参考: https://internal.evergreen.microsof `[来源: ADO Wiki]`
2. 1) Confirm device last check-in is recent (force sync if needed). 2) Verify user/device is direct member of assigned group. 3) Check Azure deviceId/ob `[来源: ADO Wiki]`
3. 1) Confirm device last check-in status is recent and force sync 2) Confirm user/device is direct member of assigned group 3) Verify Azure deviceId/obj `[来源: ADO Wiki]`
4. 1) Develop a plan for using multiple policy types to minimize conflict risk 2) All policy types (security baselines, device configuration, endpoint se `[来源: ADO Wiki]`
5. Request flighting of Security Baselines through the normal flighting request process. The flighting tag is �EnableSecurityBaseline� `[来源: ContentIdea KB]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/config-security-baseline.md#排查流程)
