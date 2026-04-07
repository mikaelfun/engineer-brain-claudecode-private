# EOP DBEB 边缘阻止与收件人验证 NDR - Quick Reference

**Entries**: 10 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Inbound emails to non-existent recipients rejected with NDR 5.4.1 when DBEB i... | Directory-Based Edge Blocking (DBEB) is configured to rej... | Review DBEB configuration; ensure all valid recipients exist in Exchange Onli... | 🟢 8 | [OneNote] |
| 2 | 发送邮件收到 NDR 550 5.1.1 至 5.1.20 错误，提示收件人不存在或找不到 | 常见原因：1) 收件人邮箱地址拼写错误; 2) Outlook Auto-Complete 缓存中有旧的/无效的收... | 1) 确认收件人地址拼写正确; 2) 清除 Outlook Auto-Complete (nickname cache) 中的无效条目; 3) 检查收件人... | 🔵 7.5 | [MS Learn] |
| 3 | 发送邮件收到 NDR 550 5.1.10，收件人地址不存在或无法找到，或收到大量 backscatter NDR（自己未发送的邮件） | 1) 收件人地址拼写错误或不存在; 2) 收件人配置了错误的转发规则转发到无效地址; 3) Backscatter... | 1) 删除 Outlook AutoComplete 中的旧条目重新输入地址; 2) 检查收件人 Inbox rules 和 account forwar... | 🔵 7.5 | [MS Learn] |
| 4 | 外部发件人向 M365 收件人发邮件被拒绝，收到 NDR 5.7.12 Sender was not authenticated by organization | 收件人地址设置为拒绝来自组织外部的邮件。只有该收件人组织的邮件管理员可以更改此设置 | 收件人管理员需检查并修改该收件人（通常是 distribution group/shared mailbox）的 delivery management ... | 🔵 7.5 | [MS Learn] |
| 5 | External emails to Dynamic Distribution groups fail with 550 5.4.1 All recipi... | RecipientType DynamicDistributionGroup does not sync back... | (1) Change DDG Primary SMTP (e.g., DDL@domain.com to DDL1@domain.com). (2) Cr... | 🔵 7 | [ContentIdea KB] |
| 6 | Hybrid 迁移场景中外部发件人发邮件给 on-premises 收件人收到 NDR 550 5.4.1 Recipient address rejec... | 管理员在所有 on-prem 收件人同步到 Exchange Online 之前就将 accepted domai... | 1) 迁移期间保持 accepted domain 类型为 Internal Relay，直到所有收件人都已同步到 M365; 2) 使用 AAD Con... | 🔵 6.5 | [MS Learn] |
| 7 | Hybrid 环境中发往 on-premises dynamic distribution group 的邮件被 DBEB 拒绝，收到 NDR 550 5... | On-premises 创建的 Dynamic Distribution Groups 不会通过 AAD Conn... | 在 Exchange Online 中创建与 on-prem Dynamic Distribution Group 相同外部邮箱地址的 mail cont... | 🔵 6.5 | [MS Learn] |
| 8 | 发送邮件到 distribution group 收到 NDR 550 5.7.124 Sender not in allowed-senders lis... | 发件人不在 distribution group 的 allowed senders list 中（直接或通过组成... | 方法一：Group owner 或 admin 在 EAC Recipients Groups Delivery management 中将发件人添加到 ... | 🔵 6.5 | [MS Learn] |
| 9 | 外部发件人向 distribution group 发邮件收到 NDR 550 5.7.133 Sender not authenticated for ... | Distribution group 的 Delivery management 设置为仅接受来自组织内部发件人的... | 方法一：EAC Recipients Groups Settings Delivery management 选择 Allow messages from... | 🔵 6.5 | [MS Learn] |
| 10 | 外部发件人向 Exchange Online mail-enabled public folder 发邮件收到 NDR 5.7.1 RESOLVER.RS... | Mail-enabled public folder 默认要求所有发件人经过身份验证（Require that a... | EAC Public folders 选择该 public folder Edit Mail flow settings Message Delivery... | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Review DBEB configuration `[OneNote]`
2. 1) 确认收件人地址拼写正确 `[MS Learn]`
3. 1) 删除 Outlook AutoComplete 中的旧条目重新输入地址 `[MS Learn]`
