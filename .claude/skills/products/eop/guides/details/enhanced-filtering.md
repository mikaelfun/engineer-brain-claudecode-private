# EOP 增强筛选 (EFC/Skip Listing) 配置 - Issue Details

**Entries**: 5 | **Type**: Quick Reference Only
**Generated**: 2026-04-07

---

### 1. Missed detections, false positives, or policy gaps in dual-use deployment where MX points to third-party SEG before Microsoft 365

- **Root Cause**: Enhanced Filtering for Connectors (EFC) is not configured or incorrectly configured, causing EOP to lose original sender IP and authentication results when mail passes through third-party gateway
- **Solution**: Configure Enhanced Filtering for Connectors to preserve original sender IP and authentication. Run Defender for Office 365 Threat Policy Health Check diagnostic (https://aka.ms/thc) to verify EFC coverage.
- **Score**: 🟢 8.5/10 | **Source**: [ADO Wiki]
- **21Vianet**: Applicable

### 2. Enhanced Filtering (skip listing) defaults to connecting IP instead of skipping it; all previous IPs in received headers are private (10.x/172.16.x...

- **Root Cause**: When every previous IP in the received headers is a private IP, EF cannot determine the original sending IP and defaults to the last valid (connecting) IP. Some on-prem/external MX servers privatize their IPs in headers.
- **Solution**: Fix on-prem/external MX side to include real public IPs in received headers, or use a solution other than skip listing.
- **Score**: 🟢 8.5/10 | **Source**: [ADO Wiki]
- **21Vianet**: Applicable

### 3. Enhanced Filtering EFUsers is populated but skip listing not working for hybrid user

- **Root Cause**: EFUsers applies skip listing only to listed addresses (not users). Secondary proxies must be explicitly listed. In hybrid setups, the coexistence address (user@contoso.mail.onmicrosoft.com) must be specified.
- **Solution**: Add the targetAddress of the MailUser object (e.g. user@contoso.mail.onmicrosoft.com) to EFUsers. If EFUsers is blank, skip listing applies to everyone.
- **Score**: 🟢 8.5/10 | **Source**: [ADO Wiki]
- **21Vianet**: Applicable

### 4. Enhanced Filtering skip listing not applied - no skip listing headers present in message

- **Root Cause**: Message was attributed to a different inbound connector that does not have Enhanced Filtering configured. Many tenants have multiple inbound connectors.
- **Solution**: Verify which inbound connector was applied to the message using the Message Protection Policy Overview diagnostic. Ensure the correct connector has Enhanced Filtering settings.
- **Score**: 🟢 8.5/10 | **Source**: [ADO Wiki]
- **21Vianet**: Applicable

### 5. 复杂路由场景（邮件经第三方服务/on-prem 再到 M365）中 SPF/DKIM/DMARC 认证失败，合法邮件被标记为 spoof

- **Root Cause**: M365 看到的源 IP 是第三方服务/网关的 IP 而非原始发件人 IP，导致 SPF 验证失败；中间服务修改邮件导致 DKIM 失效；缺少 Enhanced Filtering for Connectors 配置
- **Solution**: 1) 在 Defender portal 启用 Enhanced Filtering for Connectors (skip listing); 2) 配置所有可信中间 hop 的 IP; 3) 移除 SCL=-1 的 transport rule; 4) 先用少量用户测试再推广到全组织; 5) 配置 trusted ARC sealers
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable
