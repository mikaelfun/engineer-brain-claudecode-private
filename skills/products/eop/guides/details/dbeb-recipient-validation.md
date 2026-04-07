# EOP DBEB 边缘阻止与收件人验证 NDR - Issue Details

**Entries**: 10 | **Type**: Quick Reference Only
**Generated**: 2026-04-07

---

### 1. Inbound emails to non-existent recipients rejected with NDR 5.4.1 when DBEB is enabled

- **Root Cause**: Directory-Based Edge Blocking (DBEB) is configured to reject messages sent to invalid recipients at the edge
- **Solution**: Review DBEB configuration; ensure all valid recipients exist in Exchange Online directory; disable DBEB if causing issues with valid mail flow
- **Score**: 🟢 8/10 | **Source**: [OneNote]
- **21Vianet**: Applicable

### 2. 发送邮件收到 NDR 550 5.1.1 至 5.1.20 错误，提示收件人不存在或找不到

- **Root Cause**: 常见原因：1) 收件人邮箱地址拼写错误; 2) Outlook Auto-Complete 缓存中有旧的/无效的收件人条目; 3) 收件人配置了错误的自动转发规则; 4) 域 MX 记录配置错误; 5) 账户被入侵发送了未知邮件
- **Solution**: 1) 确认收件人地址拼写正确; 2) 清除 Outlook Auto-Complete (nickname cache) 中的无效条目; 3) 检查收件人是否有错误的转发规则; 4) 管理员验证域 MX 记录正确指向 *.mail.protection.outlook.com; 5) 检查 Sent Items 排除账户被入侵可能
- **Score**: 🔵 7.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 3. 发送邮件收到 NDR 550 5.1.10，收件人地址不存在或无法找到，或收到大量 backscatter NDR（自己未发送的邮件）

- **Root Cause**: 1) 收件人地址拼写错误或不存在; 2) 收件人配置了错误的转发规则转发到无效地址; 3) Backscatter: 垃圾邮件发送者伪造用户的 From 地址向不存在的收件人发送邮件，NDR 被退回给用户; 4) Accepted domain 配置为 Authoritative 但收件人未在 M365 中创建; 5) MX 记录配置错误
- **Solution**: 1) 删除 Outlook AutoComplete 中的旧条目重新输入地址; 2) 检查收件人 Inbox rules 和 account forwarding 设置; 3) 如为 backscatter → 安全忽略，建议配置 SPF hard fail (-all) 防止被伪造; 4) 管理员检查用户是否存在且有有效 license; 5) 运行 AAD Connect 同步 delta sync; 6) 验证 MX 记录指向 <domain>.mail.protection.outlook.com; 7) 检查 accepted domain 类型和 mail flow rules
- **Score**: 🔵 7.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 4. 外部发件人向 M365 收件人发邮件被拒绝，收到 NDR 5.7.12 Sender was not authenticated by organization

- **Root Cause**: 收件人地址设置为拒绝来自组织外部的邮件。只有该收件人组织的邮件管理员可以更改此设置
- **Solution**: 收件人管理员需检查并修改该收件人（通常是 distribution group/shared mailbox）的 delivery management 设置，允许外部发件人发送。参考 Fix email delivery issues for error code 5.7.12
- **Score**: 🔵 7.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 5. External emails to Dynamic Distribution groups fail with 550 5.4.1 All recipient addresses rejected: Access denied, despite DDG configured to accep...

- **Root Cause**: RecipientType DynamicDistributionGroup does not sync back to Azure AD, so DDG not synced to EOP. ExternalDirectoryObjectId is blank.
- **Solution**: (1) Change DDG Primary SMTP (e.g., DDL@domain.com to DDL1@domain.com). (2) Create static DL with original SMTP address. (3) Set-DistributionGroup -RequireSenderAuthenticationEnabled $false. (4) Add DDG as member to static DL.
- **Score**: 🔵 7/10 | **Source**: [ContentIdea KB]
- **21Vianet**: Applicable

### 6. Hybrid 迁移场景中外部发件人发邮件给 on-premises 收件人收到 NDR 550 5.4.1 Recipient address rejected: Access denied

- **Root Cause**: 管理员在所有 on-prem 收件人同步到 Exchange Online 之前就将 accepted domain 类型从 Internal Relay 改为 Authoritative，启用了 DBEB (Directory-Based Edge Blocking)，导致尚未同步的 on-prem 收件人被 DBEB 拒绝
- **Solution**: 1) 迁移期间保持 accepted domain 类型为 Internal Relay，直到所有收件人都已同步到 M365; 2) 使用 AAD Connect 或手动创建 mail users/mail contacts 将所有 on-prem 收件人同步到 M365; 3) 确认所有收件人都已同步并复制完成后再切换为 Authoritative; 4) MX 记录必须指向 M365 才能使 DBEB 生效; 5) 如有 on-prem mail-enabled public folders 需额外配置
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 7. Hybrid 环境中发往 on-premises dynamic distribution group 的邮件被 DBEB 拒绝，收到 NDR 550 5.4.1

- **Root Cause**: On-premises 创建的 Dynamic Distribution Groups 不会通过 AAD Connect 同步到 Exchange Online，因此 DBEB 将其视为无效收件人并拒绝
- **Solution**: 在 Exchange Online 中创建与 on-prem Dynamic Distribution Group 相同外部邮箱地址的 mail contact 作为代理收件人，使 DBEB 识别该地址为有效收件人
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 8. 发送邮件到 distribution group 收到 NDR 550 5.7.124 Sender not in allowed-senders list，邮件被拒绝

- **Root Cause**: 发件人不在 distribution group 的 allowed senders list 中（直接或通过组成员资格），group 配置了发件人限制。超过 5000 成员的 group 自动限制为仅成员可发送
- **Solution**: 方法一：Group owner 或 admin 在 EAC Recipients Groups Delivery management 中将发件人添加到 allowed senders list。方法二：选择 Allow messages from people inside and outside my organization 移除限制。外部发件人需先创建 mail contact/mail user 代表
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 9. 外部发件人向 distribution group 发邮件收到 NDR 550 5.7.133 Sender not authenticated for group，group 拒绝来自组织外部的邮件

- **Root Cause**: Distribution group 的 Delivery management 设置为仅接受来自组织内部发件人的邮件（默认设置），外部发件人被拒绝
- **Solution**: 方法一：EAC Recipients Groups Settings Delivery management 选择 Allow messages from people inside and outside my organization。方法二：保留限制但将特定外部发件人添加到 allowed senders list（需先创建 mail contact 或 mail user）
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 10. 外部发件人向 Exchange Online mail-enabled public folder 发邮件收到 NDR 5.7.1 RESOLVER.RST.AuthRequired; authentication required

- **Root Cause**: Mail-enabled public folder 默认要求所有发件人经过身份验证（Require that all senders are authenticated），外部/匿名发件人被拒绝
- **Solution**: EAC Public folders 选择该 public folder Edit Mail flow settings Message Delivery Restrictions Accept messages from 取消勾选 Require that all senders are authenticated，选择 All senders Save
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable
