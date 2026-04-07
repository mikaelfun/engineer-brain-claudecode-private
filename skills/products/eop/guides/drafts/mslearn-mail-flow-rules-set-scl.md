# Mail Flow Rules 设置 SCL — Spam Filtering 控制指南

> Source: https://learn.microsoft.com/exchange/security-and-compliance/mail-flow-rules/use-rules-to-set-scl
> ID: eop-mslearn-047 | Quality: guide-draft

## 概述

通过 mail flow rules (transport rules) 设置 SCL (Spam Confidence Level) 可以：
- 在 spam filtering 扫描前预标记邮件为 spam/high confidence spam
- 让特定邮件跳过 spam filtering

## SCL 值与对应行为

| SCL 值 | 含义 | 默认行为 |
|--------|------|----------|
| -1 (Bypass) | 跳过 spam filtering | 投递到 Inbox |
| 0-4 | 送入 spam filtering 进一步处理 | 由 spam filtering 决定 |
| 5-6 | 标记为 Spam | 移至 Junk（默认策略）或 Quarantine（Strict） |
| 7-9 | 标记为 High confidence spam | 移至 Junk（默认）或 Quarantine（Standard/Strict） |

## 关键限制

### Bypass spam filtering 不能绕过的情况
- **HPHISH (High confidence phishing)** — bypass 不允许 HPHISH 到达 Inbox（除非 MX 不指向 M365）
- **Malware** — 始终被扫描，无法通过 SCL bypass

### 当 MX 不指向 M365 时
- Bypass spam filtering 规则**允许** HPHISH 邮件到达 Inbox
- 这是因为 Secure by Default 在 MX 不指向 M365 时不生效

## 最佳实践

1. **不要用 mail flow rules bypass SecOps 或 phishing simulation** — 使用 Advanced Delivery Policy
2. **Bypass 规则应使用多个条件** — 不要只匹配 sender address/domain
3. **第三方过滤服务场景** — 优先使用 Enhanced Filtering for Connectors 而非 bypass rules
4. **SCL=6 用于 on-prem hybrid** — cloud spam verdict 传递到 on-prem 需在 on-prem 创建 transport rule 设 SCL=6

## 配置步骤 (EAC)

1. EAC → Mail flow → Rules → Add a rule → Create a new rule
2. Apply this rule if: 选择匹配条件
3. Do the following: Modify the message properties → Set the spam confidence level (SCL)
4. 选择目标 SCL 值

## 常见排查场景

- **合法邮件被误标 spam**: 检查是否有 transport rule 不当设置 SCL 5+
- **垃圾邮件绕过过滤**: 检查是否有 transport rule 设置 SCL=-1 (bypass) 范围过宽
- **第三方过滤 + EOP 双重扫描**: 应使用 Enhanced Filtering for Connectors 而非 SCL bypass

## 21V 适用性
✅ 适用（mail flow rules 和 SCL 设置在 21V 完全可用）
