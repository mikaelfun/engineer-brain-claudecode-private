# EOP Anti-Spam Filtering 排查指南

> Source: mslearn | Status: draft | Date: 2026-04-05

## 概述

Exchange Online Protection (EOP) 使用多层 anti-spam 过滤技术保护所有 M365 云邮箱。

## Spam Filtering Verdicts

| Verdict | SCL | 说明 |
|---------|-----|------|
| Spam | 5-6 | 普通垃圾邮件 |
| High confidence spam | 7-9 | 高置信度垃圾邮件 |
| Phishing | - | 钓鱼邮件 |
| High confidence phishing | - | 高置信度钓鱼（始终隔离，用户不可自行释放）|
| Bulk | BCL | 批量邮件/灰色邮件 |

## Anti-Spam Policy 关键设置

### BCL (Bulk Complaint Level) 阈值
- `MarkAsSpamBulkMail=On` 时，BCL >= 阈值的邮件转换为 SCL 6 (Spam verdict)
- `MarkAsSpamBulkMail=Off` 时，BCL 阈值和动作无效

### 可用动作
- Move to Junk Email folder
- Add X-header / Prepend subject line
- Redirect to email address
- Delete message / Quarantine message
- No action (仅 Bulk verdict)

### ZAP (Zero-hour Auto Purge)
- 邮件投递后仍可追溯处理
- ZAP for phishing 和 ZAP for spam 默认开启，建议保持

## 常见排查场景

### False Positive（合法邮件被拦截）
1. 检查 message header 中的 X-MS-Exchange-Organization-SCL 和 BCL 值
2. 检查 Anti-spam message headers 了解判定原因
3. 通过 Submissions 页面提交 Microsoft 分析
4. 创建 Tenant Allow/Block List 临时允许条目
5. 检查 anti-spam policy 配置是否过严

### False Negative（垃圾邮件未被拦截）
1. 检查是否有 SCL=-1 的 transport rule bypass 了过滤
2. 检查 allowed senders/domains 列表是否过宽
3. 提交 Microsoft 分析并创建 block 条目
4. 考虑启用 Standard/Strict preset security policies

### Intra-Org 邮件过滤
- 默认只对内部邮件应用 High confidence phishing 过滤
- 可配置为 "All phishing and spam messages" 全量过滤

## 参考
- [Anti-spam protection in cloud organizations](https://learn.microsoft.com/defender-office-365/anti-spam-protection-about)
- [Configure anti-spam policies](https://learn.microsoft.com/defender-office-365/anti-spam-policies-configure)
- [Anti-spam message headers](https://learn.microsoft.com/defender-office-365/message-headers-eop-mdo)
