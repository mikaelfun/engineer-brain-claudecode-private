# EOP Outlook 图片自动下载 - Quick Reference

**Entries**: 2 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | 外部批量发件人（P2 发件域非组织接受域）的邮件中嵌入图片未自动下载显示 | P2 发件地址不在收件人邮箱的安全发件人列表中；OWA/Outlook 默认不为非接受域发件人自动加载远程图片 | 将发件人地址添加到邮箱安全发件人列表（Outlook Safe Senders）；或通过 PowerShell/GPO 批量设置 Set-MailboxJ... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Classic Outlook 中，接受域（accepted domain）的第三方批量发送服务邮件图片未自动显示 | Classic Outlook 要求邮件通过内部认证（X-MS-Exchange-Organization-Aut... | 1) 检查邮件头中 AuthAs 是否为 Internal；2) 确认 P2 发件地址对应组织内可解析的对象（Get-Recipient <SMTPAdd... | 🟢 8.5 | [ADO Wiki] |

## Quick Troubleshooting Path

1. 将发件人地址添加到邮箱安全发件人列表（Outlook Safe Senders）；或通过 PowerShell/GPO 批量设置 Set-MailboxJunkEmailConfiguration；注 `[ADO Wiki]`
2. 1) 检查邮件头中 AuthAs 是否为 Internal；2) 确认 P2 发件地址对应组织内可解析的对象（Get-Recipient <SMTPAddress>）；3) 或将图片加载域添加到 Tr `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/image-download-outlook.md)
