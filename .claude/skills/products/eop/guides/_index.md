# EOP Troubleshooting Guide Index

| Guide | Type | Kusto | Keywords | Entries | Confidence |
|-------|------|-------|----------|---------|------------|
| [外发邮件被阻止 - 发件人/租户限制 (5.1.8/5.1.90/5.7.705/5.7.750)](ndr-outbound-sender-blocks.md) | 📋 Fusion | 0 | NDR, 5.1.8, 5.1.90, 5.7.705 | 16 | high |
| [IP 限流与信誉阻止 (4.7.500/5.7.708/AS codes)](ndr-ip-throttling-reputation.md) | 📋 Fusion | 0 | 4.7.500, 5.7.708, AS-code, IP-throttling | 15 | high |
| [外部 IP 黑名单 (Spamhaus/DNSBL) 与 Delist](ip-blocklist-spamhaus.md) | 📋 Fusion | 0 | Spamhaus, DNSBL, IP-blocklist, delist | 6 | high |
| [SPF 认证失败与配置](email-auth-spf.md) | 📋 Fusion | 0 | SPF, permerror, DNS-lookup, temperror | 12 | high |
| [DKIM 签名验证失败与配置](email-auth-dkim.md) | 📋 Fusion | 0 | DKIM, body-hash, signature-verify, CnameMissing | 8 | high |
| [DMARC/CompAuth 与 ARC 信任链](email-auth-dmarc-compauth.md) | 📋 Fusion | 0 | DMARC, CompAuth, ARC, auto-forwarding | 8 | high |
| [仿冒与用户/域名冒充检测](spoofing-impersonation.md) | 📋 Fusion | 0 | spoofing, impersonation, UIMP, SPOOF | 5 | high |
| [合法邮件误判为垃圾邮件/钓鱼 (FP)](false-positive-spam.md) | 📋 Fusion | 0 | false-positive, FP, SCL, quarantine | 10 | high |
| [恶意邮件绕过过滤 (FN) 与投递覆盖](false-negative-bypass.md) | 📋 Fusion | 0 | false-negative, FN, bypass, override | 7 | high |
| [FP/FN 调查与升级流程](fp-fn-escalation.md) | 📋 Fusion | 0 | FP-escalation, FN-escalation, Sonar, FPFN | 4 | high |
| [隔离区操作、通知与释放](quarantine-operations.md) | 📋 Fusion | 0 | quarantine, notification, release, re-quarantine | 9 | high |
| [ZAP 与投递后邮件移动](zap-post-delivery.md) | 📋 Fusion | 0 | ZAP, zero-hour-auto-purge, post-delivery, junk-movement | 5 | high |
| [租户允许/阻止列表 (TABL) 管理](tabl-allow-block.md) | 📋 Fusion | 0 | TABL, Tenant-Allow-Block-List, URL, spoof | 10 | high |
| [连接筛选与 IPv6 入站限制](connection-filter-ipv6.md) | 📋 Fusion | 0 | connection-filter, IP-Allow-List, IPv6, IPV:CAL | 6 | high |
| [增强筛选 (EFC/Skip Listing) 配置](enhanced-filtering.md) | 📊 Quick Ref | 0 | Enhanced-Filtering, EFC, skip-listing, EFUsers | 5 | high |
| [邮箱垃圾邮件配置与限制](junk-email-config.md) | 📋 Fusion | 0 | junk-email, Set-MailboxJunkEmailConfiguration, hash-limit, 510KB | 8 | high |
| [传输规则 (Mail Flow Rules) 问题](transport-rules.md) | 📋 Fusion | 0 | transport-rule, mail-flow-rule, disclaimer, AND-OR-logic | 7 | high |
| [反垃圾邮件策略配置与优先级](anti-spam-policy.md) | 📋 Fusion | 0 | anti-spam-policy, preset-security-policy, BCL, bulk-email | 5 | high |
| [Advanced Delivery 与钓鱼模拟](advanced-delivery-phishsim.md) | 📋 Fusion | 0 | Advanced-Delivery, phishing-simulation, SecOps, IntraOrg | 5 | high |
| [Safe Links (安全链接) 问题](safe-links.md) | 📋 Fusion | 0 | Safe-Links, URL-rewriting, time-of-click, API-only | 5 | high |
| [Safe Attachments (安全附件) 问题](safe-attachments.md) | 📋 Fusion | 0 | Safe-Attachments, Dynamic-Delivery, ZAP, SharePoint | 6 | high |
| [SharePoint/OneDrive 恶意软件检测](spo-odb-malware.md) | 📋 Fusion | 0 | SPO, ODB, malware, MSAV | 4 | high |
| [中继/转发/外发路由与 HRDP](relay-forwarding-outbound.md) | 📋 Fusion | 0 | relay-pool, forwarding, HRDP, SRS | 10 | high |
| [Connector 投递错误 (4xx/TLS/DNS)](connector-delivery-errors.md) | 📊 Quick Ref | 0 | connector, 4.4.312, 4.4.315, 4.4.316 | 9 | high |
| [SMTP AUTH 设备/应用发送与认证](smtp-auth-device-sending.md) | 📋 Fusion | 0 | SMTP-AUTH, 5.7.57, 5.7.64, 5.2.251 | 9 | high |
| [HVE 高量邮件发送 (OAuth/SMTP)](hve-high-volume-email.md) | 📊 Quick Ref | 0 | HVE, OAuth, XOAUTH2, 535-5.7.3 | 6 | high |
| [DANE/DNSSEC/MTA-STS 出站验证](dane-dnssec-mtasts.md) | 📊 Quick Ref | 0 | DANE, DNSSEC, MTA-STS, TLSA | 8 | high |
| [Hybrid 混合部署邮件流](hybrid-mail-flow.md) | 📊 Quick Ref | 0 | hybrid, on-premises, centralized-mail, Exchange-2010 | 15 | high |
| [DBEB 边缘阻止与收件人验证 NDR](dbeb-recipient-validation.md) | 📊 Quick Ref | 0 | DBEB, 5.4.1, 5.1.1, 5.1.10 | 10 | high |
| [21Vianet/Gallatin 功能差异与限制](21v-feature-gaps.md) | 📋 Fusion | 0 | 21v, Gallatin, Assist-365, feature-gap | 5 | high |
| [MDO 门户权限与 UI 问题](mdo-portal-permissions.md) | 📋 Fusion | 0 | portal, permissions, RBAC, URBAC | 6 | high |
| [Backscatter NDR 误判](backscatter-ndr.md) | 📊 Quick Ref | 0 | backscatter, NDR, false-positive, Message-ID | 2 | medium |
| [Outlook 图片自动下载](image-download-outlook.md) | 📋 Fusion | 0 | image-download, outlook, safe-senders, authas-internal | 2 | medium |
| [管理员提交与第三方网关覆盖](admin-submissions-overrides.md) | 📋 Fusion | 0 | submission, organizational-overrides, third-party-gateway, TLS | 2 | medium |
| [升级流程与案例路由](escalation-case-routing.md) | 📋 Fusion | 0 | escalation, ADO, ICM, case-routing | 7 | high |
| [MDO 跨产品功能 (Teams/MDA/Graph)](mdo-cross-product.md) | 📋 Fusion | 0 | Teams, MDA, Graph-API, BCC-alerting | 2 | medium |
| [用户报告与杂项 NDR](user-reporting-misc.md) | 📋 Fusion | 0 | user-reporting, submission, Client-Allow-List, moderation | 2 | medium |

Last updated: 2026-04-07
Total: 37 topics (30 fusion, 7 quick ref)
