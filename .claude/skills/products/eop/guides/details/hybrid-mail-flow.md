# EOP Hybrid 混合部署邮件流 - Issue Details

**Entries**: 15 | **Type**: Quick Reference Only
**Generated**: 2026-04-07

---

### 1. Public folder 迁移到 Exchange Online 后，发送邮件到 mail-enabled public folder (MEPF) 收到 NDR 554 5.4.14 Hop count exceeded

- **Root Cause**: 两个可能原因：1) Centralized mail transport 已启用（OutboundConnector 的 RouteAllMessagesViaOnPremises=True）；2) Organization level 的 PublicFoldersEnabled 和 PublicFolderMailboxesMigrationComplete 参数配置不正确导致邮件路由循环
- **Solution**: 1) 检查 Get-OutboundConnector 是否启用了 centralized mail transport，如是则通过 HCW 禁用。2) Exchange Online 侧：Set-OrganizationConfig -RemotePublicFolderMailboxes $Null -PublicFoldersEnabled Local。3) On-premises 侧：Set-OrganizationConfig -PublicFolderMailboxesMigrationComplete:$true -PublicFoldersEnabled Remote。4) 检查 MEPF 的 ExternalEmailAddress 配置
- **Score**: 🔵 7.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 2. Hybrid 环境中 unverified domain 的用户主 SMTP 地址显示为 user@contoso.onmicrosoft.com，外部邮件收到 NDR 554 5.4.14 Hop count exceeded

- **Root Cause**: 同步用户到 Exchange Online 时，如果存在未验证的域，主 SMTP 地址会显示为 onmicrosoft.com 格式。这导致邮件路由异常和 NDR
- **Solution**: 在 Microsoft 365 admin center 中添加并验证所有缺失的域名。验证完成后 SMTP 地址将自动更新。如果此方法不适用于业务需求，联系 Support 获取进一步帮助
- **Score**: 🔵 7.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 3. When running the Exchange Hybrid Connectivity Wizard, warning during mail flow connector creation. If ignored, on-premises environment cannot send ...

- **Root Cause**: Certificate subject name does not match any AcceptedDomain in Office 365 tenant, or certificate subject hostname does not belong to an immediate AcceptedDomain verified in the tenant.
- **Solution**: (Preferred) Add the domain used on the certificate to the Office 365 tenant via Settings > Domains. OR Have the certificate re-issued with a name matching an AcceptedDomain. Then re-run the Exchange Hybrid Wizard so TlsSenderCertificateName can be properly set.
- **Score**: 🔵 7/10 | **Source**: [ContentIdea KB]
- **21Vianet**: Applicable

### 4. Incoming external messages pending in Exchange with defer event: 451 4.4.397 Error communicating with target host -> 421 4.3.2 Service not active.

- **Root Cause**: Possibly a decommissioned server still has mounted databases.
- **Solution**: Check for Service Incident, CFL escalations. Consider escalating if none found. Escalation: Transport.
- **Score**: 🔵 7/10 | **Source**: [ContentIdea KB]
- **21Vianet**: Applicable

### 5. Mail sent to EOP / Exchange Online deferred with: 451 4.4.4 Temporary server error. Please try again later ATTR35.

- **Root Cause**: Mail is not being routed to the assigned DNS record of recipient domain.
- **Solution**: Check routing/smart-hosting to EOP/EXO - must use same public IPs as assigned DNS record (e.g., contoso-com.mail.protection.outlook.com). Check local DNS resolution (MX then A record). If MX not pointing to O365, verify 3rd party/on-premises system smart host value.
- **Score**: 🔵 7/10 | **Source**: [ContentIdea KB]
- **21Vianet**: Applicable

### 6. 451 4.4.5 Address domain different from previous accepted address. All recipients must be on the same domain ATTR46.

- **Root Cause**: Message could not be unambiguously attributed to a known sender tenant. ATTR46: sending MTA did not bifurcate mail to different recipient domains. Recipients on different domains are deferred temporarily per SMTP RFC.
- **Solution**: Messages should deliver on subsequent retries. Investigate why sending MTA did not bifurcate. If mail should be attributed to a known tenant, check inbound connector configuration. See KB 3169958.
- **Score**: 🔵 7/10 | **Source**: [ContentIdea KB]
- **21Vianet**: Applicable

### 7. Emails to Exchange Online deferred with: 451 4.4.4 Temporary server error. Please try again later ATTR5.

- **Root Cause**: Tenant is Not mail enabled in EOP due to expired subscription. ViewPoint SOP Validate EOP domain health shows CustomerType as NonMailEnabled.
- **Solution**: (1) Check subscription in ViewPoint > Troubleshooting > Subscription. (2) Request customer to reactivate expired subscription. (3) Confirm tenant state changed to Hosted via SOP re-run.
- **Score**: 🔵 7/10 | **Source**: [ContentIdea KB]
- **21Vianet**: Applicable

### 8. Hybrid 环境启用 centralized mail control 后，spam notifications 被隔离、Allow list 邮件被隔离、quarantine 释放的邮件再次被隔离、SPF 在第二次扫描时失败

- **Root Cause**: Exchange Online 或 on-premises 未配置 cross-premises header promotion (X-MS-Exchange-Organization-Cross-Premises-Headers-Promoted 缺失)，邮件经 on-prem 路由回 M365 时被二次扫描且 spam 判定不被信任
- **Solution**: 1) 验证 outbound connector RouteAllMessagesViaOnPremises=$true, inbound connector CloudServicesMailEnabled=$true; 2) On-prem 创建 RemoteDomain (contoso.onmicrosoft.com) 并设置 TrustedMailOutboundEnabled=$true TrustedMailInboundEnabled=$true; 3) 验证 header 中出现 X-MS-Exchange-Organization-Cross-Premises-Headers-Promoted
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 9. Hybrid 启用 centralized mail transport 后，从 on-prem 发给 Exchange Online 收件人的邮件被 ForwardingSmtpAddress 转发给外部收件人时，未经 on-prem 路由直接从 M365 发出

- **Root Cause**: By design: 转发消息副本被视为 originated from on-premises，mail routing logic 不会送回 on-prem。同样适用于 Exchange Online DL 中含外部收件人场景
- **Solution**: 此为 by design 行为无法更改。如需所有外发邮件经 on-prem，需在 on-prem 端配置转发或 DL membership，而非依赖 Exchange Online 端
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 10. Exchange 2010 hybrid 环境中 M365 发送的邮件被 on-premises 拒绝，发件人收到 NDR，且 NDR 频率随时间增加

- **Root Cause**: M365 EOP IP 地址变更后，on-premises Exchange 2010 receive connector 中配置的 IP 地址未自动更新，来自新 IP 的 M365 邮件被 on-prem 拒绝
- **Solution**: 重新运行 Hybrid Configuration Wizard 自动更新 IP（推荐），或手动更新 on-prem receive connector 的 RemoteIPRanges。注意：Exchange 2013+ 无需此 receive connector
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 11. 发送邮件收到 NDR 554 5.4.6 (on-premises) 或 5.4.14 (Exchange Online) Hop count exceeded - possible mail loop

- **Root Cause**: 多种原因：1) hybrid connector 使用 DNS routing 而非 smart host routing; 2) 启用 RouteAllMessagesViaOnPremises 但缺少 On-premises 类型 connector 或 connector 被 scope 到 accepted domains; 3) accepted domain 配置错误导致路由循环
- **Solution**: 1) 重新运行 Hybrid Configuration Wizard; 2) 确认 hybrid connector 使用 smart host routing 且指向 on-prem Exchange FQDN; 3) 确认 On-premises 类型 connector 未被 scope 到 accepted domain; 4) 验证 accepted domain 配置
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 12. Hybrid 或 Standalone EOP 环境中 EOP 检测到的垃圾邮件到达 on-premises 邮箱的 Inbox 而非 Junk Email 文件夹

- **Root Cause**: On-premises Exchange 未配置 mail flow rules 识别 EOP spam filtering verdict headers (X-Forefront-Antispam-Report: SFV:SPM/SKS/SKB)，导致 on-prem 不知道邮件已被 cloud 标记为 spam
- **Solution**: 在 on-premises Exchange 创建 3 条 transport rules 匹配 X-Forefront-Antispam-Report 中的 SFV:SPM/SFV:SKS/SFV:SKB，action 设 SCL=6。确认 mailbox junk email rule 已启用且 SCLJunkThreshold 配置正确（默认 4，SCL>=5 移至 Junk）
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 13. 运行 Hybrid Configuration Wizard (HCW) 时收到证书不匹配警告，忽略后 on-prem 发邮件收到 NDR 550 5.7.64 Relay Access Denied ATTR36

- **Root Cause**: On-premises 证书 subject name 的域名未在 M365 tenant 中注册为 accepted domain，导致 EOP 无法验证邮件来源归属
- **Solution**: 方法一（推荐）：将证书域名添加到 M365 tenant（Settings > Domains）；方法二：使用匹配 accepted domain 的新证书重新签发并安装到 Exchange Server，然后重新运行 HCW
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 14. Proofpoint 作为第三方邮件网关向 Exchange Online 投递邮件时出现长时间延迟（1 小时以上），Proofpoint 日志出现 ConnectionReset 错误

- **Root Cause**: Proofpoint 默认不限制每连接消息数，但 Exchange Online 每连接仅维持 20 分钟。超时后断开连接触发 ConnectionReset，Proofpoint 将 EOP 标记为 bad host 后长时间不重试
- **Solution**: 1) 设置 Proofpoint Maximum Number of Messages per SMTP Connection 为 199（起始值），仍有 ConnectionReset 则继续降低。2) 相应增加 queue runners 数量保持吞吐量。3) 清除 HostStatus 文件中的 Exchange Online 主机名/IP
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 15. Proofpoint 将 Exchange Online 公共 IP 标记为 bad host，Sendmail 日志显示 stat=Deferred 且消息长时间不重试

- **Root Cause**: Proofpoint HostStat 功能默认开启。Exchange Online 仅使用 2-3 个公共 IP（负载均衡到数百台服务器），一旦某 IP 出现少量 ConnectionReset，HostStat 将其标记为 bad 并长时间阻止重试
- **Solution**: 禁用 Proofpoint HostStat 功能（确保每次重试间隔都尝试所有目标）。Proofpoint Cloud Service 需联系 Proofpoint Support 禁用。同时将消息重试间隔设为 1 分钟（如仅发往 Exchange Online）
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable
