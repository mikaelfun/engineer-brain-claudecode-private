# EOP 隔离区操作、通知与释放 — 排查工作流

**来源草稿**: ado-wiki-a-Quarantine-Operations.md, ado-wiki-a-Quarantine-Release-Without-Interaction.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: 批量释放隔离邮件
> 来源: ado-wiki-a-Quarantine-Operations.md | 适用: Mooncake ✅

### 操作方法
1. **Defender Portal** (最多100条)
   - Portal: https://security.microsoft.com/quarantine
   - 使用 Filter 缩小范围 → 选择 → Release
2. **Threat Explorer** (P2/E5)
   - 查询 → 选择结果 → Take action → Move to Inbox
3. **PowerShell**
   ```powershell
   # 按用户释放
   Get-QuarantineMessage -PageSize 500 -QuarantineTypes Bulk,Phish,Spam -RecipientAddress "user@contoso.com" | Release-QuarantineMessage -ReleaseToAll
   # 分页处理 (>1000条)
   Get-QuarantineMessage -PageSize 1000 -Page 1 | Release-QuarantineMessage -ReleaseToAll
   ```
4. 2025年11月变更: 邮件按单个收件人列出，ReleaseToAll 仅对该条目生效

---

## Scenario 2: 找不到隔离邮件
> 来源: ado-wiki-a-Quarantine-Operations.md | 适用: Mooncake ✅

### 排查步骤
1. **已过期**: 检查保留期 (默认15天，在 anti-spam policy 中配置)
2. **Blocked Sender**: 使用 `-IncludeMessagesFromBlockedSenderAddress` 参数或 MDO Message Explorer 诊断
3. **已删除**: 搜索 Unified Audit Log
   - RecordType=Quarantine, Operation=QuarantineDeleteMessage
4. **ETR/AdminOnly**: Transport rule 或 AdminOnlyAccessPolicy 导致的隔离对终端用户不可见

---

## Scenario 3: 隔离通知问题
> 来源: ado-wiki-a-Quarantine-Operations.md | 适用: Mooncake ✅ (部分限制)

### 排查步骤
1. 检查 Quarantine Policy 配置:
   ```powershell
   Get-QuarantinePolicy | fl Name,*ESN*
   # ESNEnabled 必须为 True
   ```
2. 检查全局通知频率:
   ```powershell
   Get-QuarantinePolicy -QuarantinePolicyType GlobalQuarantinePolicy | fl *Frequency*
   ```
3. 设置在投递时固化 — 事后修改不追溯生效
4. 追踪通知投递:
   - 追踪 quarantine@messaging.microsoft.com 的邮件
5. 通知语言由邮箱区域设置决定:
   ```powershell
   Get-MailboxRegionalConfiguration user@contoso.com | fl Language
   ```

---

## Scenario 4: 隔离邮件无用户操作被释放/请求释放
> 来源: ado-wiki-a-Quarantine-Release-Without-Interaction.md | 适用: Mooncake ✅

### 排查步骤
1. 收集释放事件的审计日志
   ```powershell
   $audit = Search-UnifiedAuditLog -StartDate <date> -EndDate <date> -Operations "*quarantine*" -UserIDs User1,User2
   $audit.AuditData | ConvertFrom-Json | Select CreationTime,Operation,NetworkMessageId,UserId
   ```
2. 查找相关隔离通知邮件
   ```powershell
   Get-MessageTraceV2 -SenderAddress quarantine@messaging.microsoft.com -RecipientAddress User1,User2
   ```
3. 检查通知是否被 journal 或外部路由 → 中间服务可能激活了链接
4. 收集 MailItemsAccessed 审计日志 → 查看谁/什么访问了通知邮件
5. 如果是 RESTSystem 应用访问 → 检查 ASC 中的 Application ID
