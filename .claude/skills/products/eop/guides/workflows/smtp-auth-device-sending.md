# EOP SMTP AUTH 设备/应用发送与认证 — 排查工作流

**来源草稿**: ado-wiki-a-Recipient-Rate-Limit.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: 用户被 Recipient Rate Limit (RRL) 阻止 (5.1.90)
> 来源: ado-wiki-a-Recipient-Rate-Limit.md | 适用: Mooncake ✅

### 排查步骤
1. 确认限制类型:
   | 类型 | 说明 | NDR |
   |------|------|-----|
   | Internal | 超过每小时内部收件人限制 | - |
   | External | 超过每小时外部收件人限制 | - |
   | Daily | 超过每日所有收件人限制 | - |
   | RRL | 超过滚动24h服务限制 (10,000) | 5.1.90 |
2. 检查 Outbound Spam Policy 限制:
   ```powershell
   Get-HostedOutboundSpamFilterPolicy | fl Name, RecipientLimitPerDay
   # 值 0 = 默认 (10,000), 不要手动设为 10,000
   ```
3. **SendAs 场景关键**:
   - 发送计数算在认证用户上 (UserA sends as SharedMailbox → 算 UserA)
   - 但策略按 From 地址应用 (SharedMailbox policy)
   - 如果 SharedMailbox 策略限制更低 → UserA 被意外阻止
4. 修复:
   - 确保所有 SendAs 账户共享相同的 outbound spam policy
   - 使用 MDOThreatPolicyChecker 验证策略匹配

---

## Scenario 2: RRL 调查与 SendAs 审计
> 来源: ado-wiki-a-Recipient-Rate-Limit.md | 适用: Mooncake ✅

### 排查步骤
1. 查找 SendAs 权限:
   ```powershell
   Get-DistributionGroup | % {Get-RecipientPermission -AccessRights SendAs $_}
   ```
2. 审计 SendAs 活动:
   ```powershell
   $Start = (Get-Date).AddHours(-48)
   $End = Get-Date
   $UserID = "impacted@contoso.com"
   $audit = Search-UnifiedAuditLog -StartDate $Start -EndDate $End -Operations sendas,sendonbehalf -UserIds $UserID
   $entries = $audit.AuditData | ConvertFrom-Json
   $entries | Select SendAsUserSmtp,ClientIP | Group SendAsUserSMTP,ClientIP | Select Count,Name
   ```
3. 已知问题: SMTP 客户端提交 + MessageCopyForSMTPClientSubmissionEnabled → 消息计数翻倍
4. RRL 阻止 24 小时后自动释放 (或由 Engineering 手动释放)
