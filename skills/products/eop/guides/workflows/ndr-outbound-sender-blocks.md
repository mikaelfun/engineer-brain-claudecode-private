# EOP 外发邮件被阻止 - 发件人/租户限制 (5.1.8/5.1.90/5.7.705/5.7.750) — 排查工作流

**来源草稿**: ado-wiki-a-Blocked-Senders.md, ado-wiki-a-investigate-fraud-recover-mail-flow.md
**场景数**: 8
**生成日期**: 2026-04-07

---

## Scenario 1: 用户因 Outbound Spam 被限制 (5.1.8)
> 来源: ado-wiki-a-Blocked-Senders.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 运行 **Validate Sender Health** 诊断，获取最后一条被限制的 Network Message ID
   - 输出: `OutboundSpamLast24Hours` / `OutboundMailLast24Hours` / `OutboundSpamPercent`
2. 运行 `Get-BlockedSenderAddress -SenderAddress <email>` 确认限制状态
3. 运行 **Extended Message Trace**，检查 Custom Data 中的 SCL、DIR、SFV 判定
4. 检查 X-Forefront-Antispam-Report header: `DIR:OUT, SCL>=5`
5. 判断限制原因:
   - 账户被入侵 → 执行 compromised account 恢复流程
   - Outbound spam policy 限制过低 → 调整 policy 或将用户加入正确 policy scope
   - SharedMailbox / Send As 场景 → 确保 policy 同时覆盖发送者和共享邮箱

### 解除限制
- Portal 路径: Security Portal → Email & collaboration → Review → Restricted entities
- 解除后 1 小时内恢复发送；若数小时后仍无法发送 → 检查 Service Health → 升级到 AntiSpam Engineering

---

## Scenario 2: 超出每日收件人速率限制 (5.1.90 / 5.2.0)
> 来源: ado-wiki-a-Blocked-Senders.md, ado-wiki-a-Recipient-Rate-Limit.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 检查诊断输出中的限制类型:
   - `InternalRecipientCountToday` / `ExternalRecipientCountToday` / `ExceedingLimitType`
2. 确认 Outbound Spam Policy 的 RecipientLimitPerDay 配置:
   ```powershell
   Get-HostedOutboundSpamFilterPolicy | fl Name, RecipientLimitPerDay
   ```
   - 值 0 = 默认 10,000/天 — **不要手动设置 10,000**
3. 确定 24h 计数器开始时间 → 24h 后自动解除
4. 检查账户是否被入侵
5. 教育客户 Exchange Online 发送限制，推荐第三方 bulk relay 服务

### SendAs 场景排查
```powershell
# 检查 SendAs 权限
Get-DistributionGroup | % {Get-RecipientPermission -AccessRights SendAs $_}

# 审计 SendAs 活动
Search-UnifiedAuditLog -StartDate (Get-Date).AddHours(-48) -EndDate (Get-Date) -Operations sendas,sendonbehalf -UserIds "user@contoso.com"
```

### 关键信息
- RRL 按 **authenticated user** 计算，不按 From address
- SendAs 场景中，消息计入实际发送者（UserA），但策略按 From address (SharedMailboxZ) 应用
- 目前管理员无法手动覆盖 RRL — 24h 后自动释放或由 Engineering 处理
- 升级路径: https://aka.ms/errl

---

## Scenario 3: 未注册域发送被阻止 (5.7.750)
> 来源: ado-wiki-a-Blocked-Senders.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 运行 **Validate Domain Health** 诊断 → 识别 `UnprovisionedDomainBlock`
2. 运行 **Get Message Trace** + Network Message ID → 确认发件人域
3. 查看 **Top Senders** 报告: `https://security.microsoft.com/reportv2?id=TopSenderRecipientsATP`
4. 判断发送域是否应为 Accepted Domain:
   - 是 → 添加到 M365 Accepted Domains
   - 否 → 检查是否被入侵
5. 安全后释放:
   - 运行 **Diag: Release Tenant Unregistered Domains**
   - 运行 **Diag: Validate Domain Health**

---

## Scenario 4: IP 被阻止 (5.7.708)
> 来源: ado-wiki-a-Blocked-Senders.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 此错误通常来自低信誉 IP（新客户常见）
2. 检查从该 IP 发送的邮件样本，确认无 spam/phish
3. 运行 **Diag: Release Tenant IP Not Accepting Traffic**

---

## Scenario 5: 租户超阈值 (5.7.705)
> 来源: ado-wiki-a-investigate-fraud-recover-mail-flow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **先排查是否欺诈** — 检查多项指标:
   - Case 描述为空、联系人邮件无效/外部、租户名称可疑
   - 仅 1-2 个商业 License、域名为 .ml/.tk TLD
   - 电话号码国家与租户不匹配、组织地址无效
2. 欺诈决策:
   | 情况 | 行动 |
   |------|------|
   | 确认欺诈 | 停止通信，DfM collab → CFAR |
   | 疑似欺诈 | 停止通信，DfM collab → CFAR 调查 |
   | 非欺诈 | 继续恢复流程 |
3. 恢复流程:
   - 调查客户是否故意发送 bulk、误操作还是被入侵
   - 运行 **Validate EOP Domain Health** 诊断
   - 收集 2 周 Exchange/Defender 门户日志
   - 按 compromised account 指南修复
   - 沟通：释放不保证不会再次被阻止，必须停止通过服务发送 bulk

---

## Scenario 6: 灰名单 / Server Busy (4.7.500)
> 来源: ado-wiki-a-Blocked-Senders.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 确认发送模式是否有异常变化（新发件人/发送量突增）
2. 如果从 on-premises 中继 → 配置 Inbound EOP Connector
3. 如果通过第三方路由 → 配置 Partner Connector
4. 设置 connector 后监控是否停止限流
5. 运行 **Diag: Release Tenant IP Server Busy** → 提供 14 天排除期

> 诊断不替代 Connector 需求，仅作为辅助措施

---

## Scenario 7: 外发转发被限制 (5.7.520)
> 来源: ado-wiki-a-Blocked-Senders.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 检查 Outbound Spam Policy 的 AutoForwardingMode:
   ```powershell
   Get-HostedOutboundSpamFilterPolicy | fl Name, AutoForwardingMode
   ```
   - `Automatic` (自 2021 起等同 Off) / `On` / `Off`
2. 查看自动转发报告: `https://admin.exchange.microsoft.com/#/reports/autoforwardedmessages`
3. Portal 路径: M365 Defender → Email & collaboration → Policies & rules → Threat policies → Anti-spam → Outbound Spam
4. 建议：默认策略设为 Off，仅在自定义策略中对特定用户/组/域设为 On

---

## Scenario 8: 发送 IP 被全局封禁 (5.7.606-649 / 5.7.511)
> 来源: ado-wiki-a-Blocked-Senders.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 收集 MTA SMTP 日志中的错误信息
2. **5.7.606-649**: 引导客户自助 delist → https://sender.office.com/
   - 若 24h 内自助 delist 无效 → 升级到 Antispam Engineering
3. **5.7.511**: 客户需转发完整 NDR 到 `delist@microsoft.com`
   - Microsoft 48h 内回复
   - 若客户已收到工单号仍需协助 → 验证 IP context → 升级到 Antispam Analysts
4. **RAVE 诊断无法解除此类封禁**
