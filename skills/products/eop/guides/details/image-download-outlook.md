# EOP Outlook 图片自动下载 - Comprehensive Troubleshooting Guide

**Entries**: 2 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-automatic-image-download-in-outlook.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: P2 发件地址不在收件人邮箱的安全发件人列表中；OWA/Outlook 默认不为非接受域发件人自动加载远程图片
> Source: ado-wiki

**Symptom**: 外部批量发件人（P2 发件域非组织接受域）的邮件中嵌入图片未自动下载显示
**Root Cause**: P2 发件地址不在收件人邮箱的安全发件人列表中；OWA/Outlook 默认不为非接受域发件人自动加载远程图片

1. 将发件人地址添加到邮箱安全发件人列表（Outlook Safe Senders）；或通过 PowerShell/GPO 批量设置 Set-MailboxJunkEmailConfiguration；注意：接受域内的地址不建议加入安全发件人列表（防欺骗风险）

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: Classic Outlook 要求邮件通过内部认证（X-MS-Exchange-Organization-AuthAs: Internal），且 P2
> Source: ado-wiki

**Symptom**: Classic Outlook 中，接受域（accepted domain）的第三方批量发送服务邮件图片未自动显示
**Root Cause**: Classic Outlook 要求邮件通过内部认证（X-MS-Exchange-Organization-AuthAs: Internal），且 P2 发件地址必须能解析为组织内的收件人对象；若两个条件不满足则图片不自动下载

1. 1) 检查邮件头中 AuthAs 是否为 Internal；2) 确认 P2 发件地址对应组织内可解析的对象（Get-Recipient <SMTPAddress>）；3) 或将图片加载域添加到 Trusted Sites Internet Zone（GPO 方式：User Configuration > Policies > Administrative Templates > Windows Components > Internet Explorer）；4) 注意：接受域地址避免加入安全发件人防止欺骗；5) 相关 feature request 见 ADO 303213

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| 外部批量发件人（P2 发件域非组织接受域）的邮件中嵌入图片未自动下载显示 | P2 发件地址不在收件人邮箱的安全发件人列表中；OWA/Outlook 默认不为非接受域发件人自动加载远程图片 | -> Phase 1 |
| Classic Outlook 中，接受域（accepted domain）的第三方批量发送服务邮件图片未自动显示 | Classic Outlook 要求邮件通过内部认证（X-MS-Exchange-Organization-AuthAs: Internal），且 P2 | -> Phase 2 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | 外部批量发件人（P2 发件域非组织接受域）的邮件中嵌入图片未自动下载显示 | P2 发件地址不在收件人邮箱的安全发件人列表中；OWA/Outlook 默认不为非接受域发件人自动加载远程图片 | 将发件人地址添加到邮箱安全发件人列表（Outlook Safe Senders）；或通过 PowerShell/GPO 批量设置 Set-MailboxJ... | 🟢 8.5 | [ADO Wiki] |
| 2 | Classic Outlook 中，接受域（accepted domain）的第三方批量发送服务邮件图片未自动显示 | Classic Outlook 要求邮件通过内部认证（X-MS-Exchange-Organization-Aut... | 1) 检查邮件头中 AuthAs 是否为 Internal；2) 确认 P2 发件地址对应组织内可解析的对象（Get-Recipient <SMTPAdd... | 🟢 8.5 | [ADO Wiki] |
