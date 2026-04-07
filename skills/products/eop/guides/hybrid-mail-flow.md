# EOP Hybrid 混合部署邮件流 - Quick Reference

**Entries**: 15 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Public folder 迁移到 Exchange Online 后，发送邮件到 mail-enabled public folder (MEPF) 收... | 两个可能原因：1) Centralized mail transport 已启用（OutboundConnecto... | 1) 检查 Get-OutboundConnector 是否启用了 centralized mail transport，如是则通过 HCW 禁用。2) ... | 🔵 7.5 | [MS Learn] |
| 2 | Hybrid 环境中 unverified domain 的用户主 SMTP 地址显示为 user@contoso.onmicrosoft.com，外部邮... | 同步用户到 Exchange Online 时，如果存在未验证的域，主 SMTP 地址会显示为 onmicroso... | 在 Microsoft 365 admin center 中添加并验证所有缺失的域名。验证完成后 SMTP 地址将自动更新。如果此方法不适用于业务需求，联... | 🔵 7.5 | [MS Learn] |
| 3 | When running the Exchange Hybrid Connectivity Wizard, warning during mail flo... | Certificate subject name does not match any AcceptedDomai... | (Preferred) Add the domain used on the certificate to the Office 365 tenant v... | 🔵 7 | [ContentIdea KB] |
| 4 | Incoming external messages pending in Exchange with defer event: 451 4.4.397 ... | Possibly a decommissioned server still has mounted databa... | Check for Service Incident, CFL escalations. Consider escalating if none foun... | 🔵 7 | [ContentIdea KB] |
| 5 | Mail sent to EOP / Exchange Online deferred with: 451 4.4.4 Temporary server ... | Mail is not being routed to the assigned DNS record of re... | Check routing/smart-hosting to EOP/EXO - must use same public IPs as assigned... | 🔵 7 | [ContentIdea KB] |
| 6 | 451 4.4.5 Address domain different from previous accepted address. All recipi... | Message could not be unambiguously attributed to a known ... | Messages should deliver on subsequent retries. Investigate why sending MTA di... | 🔵 7 | [ContentIdea KB] |
| 7 | Emails to Exchange Online deferred with: 451 4.4.4 Temporary server error. Pl... | Tenant is Not mail enabled in EOP due to expired subscrip... | (1) Check subscription in ViewPoint > Troubleshooting > Subscription. (2) Req... | 🔵 7 | [ContentIdea KB] |
| 8 | Hybrid 环境启用 centralized mail control 后，spam notifications 被隔离、Allow list 邮件被隔... | Exchange Online 或 on-premises 未配置 cross-premises header p... | 1) 验证 outbound connector RouteAllMessagesViaOnPremises=$true, inbound connect... | 🔵 6.5 | [MS Learn] |
| 9 | Hybrid 启用 centralized mail transport 后，从 on-prem 发给 Exchange Online 收件人的邮件被 F... | By design: 转发消息副本被视为 originated from on-premises，mail rou... | 此为 by design 行为无法更改。如需所有外发邮件经 on-prem，需在 on-prem 端配置转发或 DL membership，而非依赖 Ex... | 🔵 6.5 | [MS Learn] |
| 10 | Exchange 2010 hybrid 环境中 M365 发送的邮件被 on-premises 拒绝，发件人收到 NDR，且 NDR 频率随时间增加 | M365 EOP IP 地址变更后，on-premises Exchange 2010 receive conne... | 重新运行 Hybrid Configuration Wizard 自动更新 IP（推荐），或手动更新 on-prem receive connector ... | 🔵 6.5 | [MS Learn] |
| 11 | 发送邮件收到 NDR 554 5.4.6 (on-premises) 或 5.4.14 (Exchange Online) Hop count excee... | 多种原因：1) hybrid connector 使用 DNS routing 而非 smart host rou... | 1) 重新运行 Hybrid Configuration Wizard; 2) 确认 hybrid connector 使用 smart host rou... | 🔵 6.5 | [MS Learn] |
| 12 | Hybrid 或 Standalone EOP 环境中 EOP 检测到的垃圾邮件到达 on-premises 邮箱的 Inbox 而非 Junk Emai... | On-premises Exchange 未配置 mail flow rules 识别 EOP spam filt... | 在 on-premises Exchange 创建 3 条 transport rules 匹配 X-Forefront-Antispam-Report ... | 🔵 6.5 | [MS Learn] |
| 13 | 运行 Hybrid Configuration Wizard (HCW) 时收到证书不匹配警告，忽略后 on-prem 发邮件收到 NDR 550 5.7... | On-premises 证书 subject name 的域名未在 M365 tenant 中注册为 accept... | 方法一（推荐）：将证书域名添加到 M365 tenant（Settings > Domains）；方法二：使用匹配 accepted domain 的新证... | 🔵 6.5 | [MS Learn] |
| 14 | Proofpoint 作为第三方邮件网关向 Exchange Online 投递邮件时出现长时间延迟（1 小时以上），Proofpoint 日志出现 Co... | Proofpoint 默认不限制每连接消息数，但 Exchange Online 每连接仅维持 20 分钟。超时后... | 1) 设置 Proofpoint Maximum Number of Messages per SMTP Connection 为 199（起始值），仍有... | 🔵 6.5 | [MS Learn] |
| 15 | Proofpoint 将 Exchange Online 公共 IP 标记为 bad host，Sendmail 日志显示 stat=Deferred 且... | Proofpoint HostStat 功能默认开启。Exchange Online 仅使用 2-3 个公共 IP... | 禁用 Proofpoint HostStat 功能（确保每次重试间隔都尝试所有目标）。Proofpoint Cloud Service 需联系 Proof... | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. 1) 检查 Get-OutboundConnector 是否启用了 centralized mail transport，如是则通过 HCW 禁用。2) Exchange Online 侧：Set-O `[MS Learn]`
2. 在 Microsoft 365 admin center 中添加并验证所有缺失的域名。验证完成后 SMTP 地址将自动更新。如果此方法不适用于业务需求，联系 Support 获取进一步帮助 `[MS Learn]`
3. (Preferred) Add the domain used on the certificate to the Office 365 tenant via Settings > Domains.  `[ContentIdea KB]`
