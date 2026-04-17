# EOP Safe Attachments (安全附件) 问题 - Quick Reference

**Entries**: 6 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | NDR received when sending email with attachment. Status: 550 5.0.350 One or m... | Common Attachment Filter rejects emails when an attachmen... | Reduce the nesting depth of attachments to below 20 levels. If business justi... | 🔵 7.5 | [ADO Wiki] |
| 2 📋 | 使用 Exclaimer 签名服务和 Safe Attachments Dynamic Delivery 时，邮件附件丢失或延迟数小时 | Exclaimer 通过 transport rule 将邮件路由到外部云处理后再返回 M365。Safe Att... | 编辑 Exclaimer transport rule，在 Do the following 中添加：modify message properties ... | 🔵 7.5 | [MS Learn] |
| 3 📋 | Safe Attachments 配置为 Dynamic Delivery 但附件未被替换为占位符，用户直接看到原始附件或附件丢失 | Dynamic Delivery 在以下场景不支持：public folders、自定义规则路由、archive ... | 对不支持 Dynamic Delivery 的场景改用 Block 动作。Exclaimer 兼容性问题参考 KB4014438 | 🔵 6.5 | [MS Learn] |
| 4 📋 | Safe Attachments policy 设置为 Off 后，收到恶意附件的邮件未被 ZAP 隔离 | 当 Safe Attachments action 设置为 Off 时，ZAP 不会对该收件人隔离邮件，即使后续收... | 不要为大多数用户关闭 Safe Attachments。仅对只接收可信发件人邮件的特定收件人使用 Off。推荐使用 Block 或 Dynamic Del... | 🔵 6.5 | [MS Learn] |
| 5 📋 | SharePoint/OneDrive/Teams 中检测到恶意文件后用户仍能下载该文件 | Safe Attachments for SPO/OneDrive/Teams 默认阻止打开、移动、复制、共享恶意... | 连接 SharePoint Online PowerShell 运行 Set-SPOTenant -DisallowInfectedFileDownloa... | 🔵 6.5 | [MS Learn] |
| 6 📋 | Dynamics 365 server-side sync 中邮件附件丢失，看到名为 ATP Scan in Progress.eml 的附件 | Safe Attachments Dynamic Delivery 产生两封同 message ID 邮件，D36... | 将 Safe Attachments policy action 改为 Block 而非 Dynamic Delivery，确保邮件投递时附件已完整 | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Reduce the nesting depth of attachments to below 20 levels. If business justification exists, file a `[ADO Wiki]`
2. 编辑 Exclaimer transport rule，在 Do the following 中添加：modify message properties - set header X-MS-Excha `[MS Learn]`
3. 对不支持 Dynamic Delivery 的场景改用 Block 动作。Exclaimer 兼容性问题参考 KB4014438 `[MS Learn]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/safe-attachments.md)
