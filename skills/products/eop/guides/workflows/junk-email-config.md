# EOP 邮箱垃圾邮件配置与限制 — 排查工作流

**来源草稿**: ado-wiki-a-Blocked-Senders.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Junk Email Configuration 问题
> 来源: ado-wiki-a-Blocked-Senders.md | 适用: Mooncake ✅

### 排查步骤
1. 检查邮箱级 Junk Email 配置:
   ```powershell
   Get-MailboxJunkEmailConfiguration -Identity user@contoso.com
   ```
2. 关键属性:
   - `TrustedSendersAndDomains`: 安全发件人列表
   - `BlockedSendersAndDomains`: 阻止发件人列表
3. 已知限制:
   - 列表大小限制: 510KB (包括所有 trusted/blocked 条目的 hash)
   - 超过限制后无法添加新条目
4. Safe Sender 影响 ZAP 行为:
   - Safe Sender list 会干扰 ZAP 执行（邮件已在 Safe Sender 中则不会被 ZAP 移除）

---

## Scenario 2: 使用 Set-MailboxJunkEmailConfiguration 批量管理
> 来源: ado-wiki-a-Blocked-Senders.md | 适用: Mooncake ✅

### 操作步骤
1. 添加安全发件人:
   ```powershell
   Set-MailboxJunkEmailConfiguration -Identity user@contoso.com -TrustedSendersAndDomains @{Add="sender@example.com"}
   ```
2. 添加阻止发件人:
   ```powershell
   Set-MailboxJunkEmailConfiguration -Identity user@contoso.com -BlockedSendersAndDomains @{Add="spammer@example.com"}
   ```
3. 注意: 如果发件人地址已存在于组织中 (Get-Recipient 有输出)，无法通过 PowerShell/OWA 添加到 Safe Senders — 只能通过 Outlook 桌面端或 GPO
