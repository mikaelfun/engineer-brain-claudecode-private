# EOP 发件人允许/阻止列表管理指南

> Source: mslearn | Status: draft | Date: 2026-04-05

## 允许列表方法（推荐度从高到低）

1. **Tenant Allow/Block List** — 域和邮箱地址（含 spoofed senders）
2. **Exchange mail flow rules** — 需同时检查 Authentication-Results (dmarc=pass)
3. **Outlook Safe Senders** — 仅影响单个邮箱
4. **IP Allow List** — Connection Filter Policy 中配置
5. **Anti-spam policy allowed sender/domain lists** — 最不推荐

### 安全警告

- Malware 和 High Confidence Phishing 始终隔离，不受任何 allowlist 影响（Secure by Default）
- Safe Sender list 会干扰 ZAP 执行
- 切勿将 popular domains (microsoft.com) 或 accepted domains 加入 allowed domain list
- 仅用 sender domain 作为 transport rule 条件极度危险（攻击者可伪造域名）

### 关键 Header 标记

| Header 值 | 含义 |
|-----------|------|
| SFV:SFE | Safe Sender bypass |
| SFV:SKN | Transport rule bypass (SCL=-1) |
| IPV:CAL | IP Allow List bypass |

## 阻止列表方法（推荐度从高到低）

1. **Tenant Allow/Block List** — block entry → 邮件标记为 High Confidence Spam (SCL=9)
2. **Outlook Blocked Senders** — 仅影响单个邮箱，header: SFV:BLK
3. **Anti-spam policy blocked sender/domain lists** — 标记为 High Confidence Spam
4. **Exchange mail flow rules** — 设置 SCL=9
5. **IP Block List** — Connection Filter Policy，最后手段

### 最佳实践

- 定期审查所有 allow/block 列表，移除不必要的条目
- 将误判邮件通过 Submissions 提交给 Microsoft 分析
- IP Allow/Block List 各最多 1273 条目
- Anti-spam policy allowed/blocked lists 各最多约 1000 条目
- IPv6 地址仅在 Tenant Allow/Block List 中管理
