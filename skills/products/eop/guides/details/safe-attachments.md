# EOP Safe Attachments (安全附件) 问题 - Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-malware-tsg.md, mslearn-anti-malware-common-attachments.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Common Attachment Filter rejects emails
> Source: ado-wiki

**Symptom**: NDR received when sending email with attachment. Status: 550 5.0.350 One or more of the attachments in your email is of a file type that is NOT allowed. Attachment contains nested/embedded attachme...
**Root Cause**: Common Attachment Filter rejects emails when an attachment contains nested attachments with a depth of 20 or more levels, triggering policy violation NDR.

1. Reduce the nesting depth of attachments to below 20 levels. If business justification exists, file an escalation with the antispam team. Check FileTypeAction setting: Reject sends NDR, Quarantine silently quarantines.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 2: Exclaimer 通过 transport rule 将邮件路由到外部云处理后再返回
> Source: mslearn

**Symptom**: 使用 Exclaimer 签名服务和 Safe Attachments Dynamic Delivery 时，邮件附件丢失或延迟数小时
**Root Cause**: Exclaimer 通过 transport rule 将邮件路由到外部云处理后再返回 M365。Safe Attachments 在邮件首次离开 M365 前开始扫描附件，当邮件从 Exclaimer 返回时附件无法正确添加回来（KB4014438）

1. 编辑 Exclaimer transport rule，在 Do the following 中添加：modify message properties - set header X-MS-Exchange-Organization-SkipSafeAttachmentProcessing = 1。这会跳过 Exclaimer 处理前的 Safe Attachments 扫描

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 3: Dynamic Delivery 在以下场景不支持：public folders、自定义规则路由、archive 文件夹、Inbox
> Source: mslearn

**Symptom**: Safe Attachments 配置为 Dynamic Delivery 但附件未被替换为占位符，用户直接看到原始附件或附件丢失
**Root Cause**: Dynamic Delivery 在以下场景不支持：public folders、自定义规则路由、archive 文件夹、Inbox 规则移动、已删除邮件、搜索文件夹出错、启用 Exclaimer、S/MIME 加密、on-premises 收件人

1. 对不支持 Dynamic Delivery 的场景改用 Block 动作。Exclaimer 兼容性问题参考 KB4014438

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 4: 当 Safe Attachments action 设置为
> Source: mslearn

**Symptom**: Safe Attachments policy 设置为 Off 后，收到恶意附件的邮件未被 ZAP 隔离
**Root Cause**: 当 Safe Attachments action 设置为 Off 时，ZAP 不会对该收件人隔离邮件，即使后续收到威胁信号也不处理

1. 不要为大多数用户关闭 Safe Attachments。仅对只接收可信发件人邮件的特定收件人使用 Off。推荐使用 Block 或 Dynamic Delivery

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 5: Safe Attachments for SPO/OneDrive/Teams 默认阻止打开、移动、复制、共享恶意文件，但不阻止下载操作
> Source: mslearn

**Symptom**: SharePoint/OneDrive/Teams 中检测到恶意文件后用户仍能下载该文件
**Root Cause**: Safe Attachments for SPO/OneDrive/Teams 默认阻止打开、移动、复制、共享恶意文件，但不阻止下载操作

1. 连接 SharePoint Online PowerShell 运行 Set-SPOTenant -DisallowInfectedFileDownload $true 阻止恶意文件下载

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 6: Safe Attachments Dynamic Delivery 产生两封同
> Source: mslearn

**Symptom**: Dynamics 365 server-side sync 中邮件附件丢失，看到名为 ATP Scan in Progress.eml 的附件
**Root Cause**: Safe Attachments Dynamic Delivery 产生两封同 message ID 邮件，D365 sync 为避免重复只处理一次，若扫描完成前开始同步则原始附件不会被追踪

1. 将 Safe Attachments policy action 改为 Block 而非 Dynamic Delivery，确保邮件投递时附件已完整

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| NDR received when sending email with attachment. Status: ... | Common Attachment Filter rejects emails | -> Phase 1 |
| 使用 Exclaimer 签名服务和 Safe Attachments Dynamic Delivery 时，邮件... | Exclaimer 通过 transport rule 将邮件路由到外部云处理后再返回 | -> Phase 2 |
| Safe Attachments 配置为 Dynamic Delivery 但附件未被替换为占位符，用户直接看到原... | Dynamic Delivery 在以下场景不支持：public folders、自定义规则路由、archive 文件夹、Inbox | -> Phase 3 |
| Safe Attachments policy 设置为 Off 后，收到恶意附件的邮件未被 ZAP 隔离 | 当 Safe Attachments action 设置为 | -> Phase 4 |
| SharePoint/OneDrive/Teams 中检测到恶意文件后用户仍能下载该文件 | Safe Attachments for SPO/OneDrive/Teams 默认阻止打开、移动、复制、共享恶意文件，但不阻止下载操作 | -> Phase 5 |
| Dynamics 365 server-side sync 中邮件附件丢失，看到名为 ATP Scan in Pr... | Safe Attachments Dynamic Delivery 产生两封同 | -> Phase 6 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | NDR received when sending email with attachment. Status: 550 5.0.350 One or m... | Common Attachment Filter rejects emails when an attachmen... | Reduce the nesting depth of attachments to below 20 levels. If business justi... | 🔵 7.5 | [ADO Wiki] |
| 2 | 使用 Exclaimer 签名服务和 Safe Attachments Dynamic Delivery 时，邮件附件丢失或延迟数小时 | Exclaimer 通过 transport rule 将邮件路由到外部云处理后再返回 M365。Safe Att... | 编辑 Exclaimer transport rule，在 Do the following 中添加：modify message properties ... | 🔵 7.5 | [MS Learn] |
| 3 | Safe Attachments 配置为 Dynamic Delivery 但附件未被替换为占位符，用户直接看到原始附件或附件丢失 | Dynamic Delivery 在以下场景不支持：public folders、自定义规则路由、archive ... | 对不支持 Dynamic Delivery 的场景改用 Block 动作。Exclaimer 兼容性问题参考 KB4014438 | 🔵 6.5 | [MS Learn] |
| 4 | Safe Attachments policy 设置为 Off 后，收到恶意附件的邮件未被 ZAP 隔离 | 当 Safe Attachments action 设置为 Off 时，ZAP 不会对该收件人隔离邮件，即使后续收... | 不要为大多数用户关闭 Safe Attachments。仅对只接收可信发件人邮件的特定收件人使用 Off。推荐使用 Block 或 Dynamic Del... | 🔵 6.5 | [MS Learn] |
| 5 | SharePoint/OneDrive/Teams 中检测到恶意文件后用户仍能下载该文件 | Safe Attachments for SPO/OneDrive/Teams 默认阻止打开、移动、复制、共享恶意... | 连接 SharePoint Online PowerShell 运行 Set-SPOTenant -DisallowInfectedFileDownloa... | 🔵 6.5 | [MS Learn] |
| 6 | Dynamics 365 server-side sync 中邮件附件丢失，看到名为 ATP Scan in Progress.eml 的附件 | Safe Attachments Dynamic Delivery 产生两封同 message ID 邮件，D36... | 将 Safe Attachments policy action 改为 Block 而非 Dynamic Delivery，确保邮件投递时附件已完整 | 🔵 6.5 | [MS Learn] |
