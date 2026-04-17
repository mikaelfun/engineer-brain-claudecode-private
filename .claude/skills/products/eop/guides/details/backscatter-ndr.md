# EOP Backscatter NDR 误判 - Issue Details

**Entries**: 2 | **Type**: Quick Reference Only
**Generated**: 2026-04-07

---

### 1. Valid NDR (bounce message) detected as backscatter by EOP and delivered to recipient's junk folder instead of inbox

- **Root Cause**: EOP backscatter rule checks Message-ID/In-Reply-To headers against EXO format (<guid@*.CHNPR01.prod.partner.outlook.cn>); if Message-ID does not match EXO format, flagged as backscatter. Common triggers: 1) Email sent from iOS native email client (generates own Message-ID format); 2) Internal email in Hybrid Exchange deployment routed through on-premises Exchange first (on-prem generates non-EXO Message-ID format). Known issue: Task 4273311
- **Solution**: Request PG to add tenant to anti-backscatter rule allow list via ICM escalation; reference Known Issue Task 4273311 (Improve NDR BackScatter Fix to not discard valid emails and reject invalid emails); no customer-side workaround available
- **Score**: 🟢 8/10 | **Source**: [OneNote]
- **21Vianet**: Applicable

### 2. 收到大量自己未发送的邮件的 NDR 退信通知（backscatter），用户误以为账户被入侵

- **Root Cause**: 垃圾邮件发送者伪造用户的 From 地址发送邮件，目标邮件服务器将 NDR 退回给伪造的发件人地址。这种无用的 NDR 称为 backscatter，本身并不意味着账户被入侵
- **Solution**: 1) 检查 Sent Items 确认无异常发送的邮件，如无异常则可忽略 backscatter; 2) 如发现异常邮件则按账户被入侵流程处理（重置密码、扫描恶意软件）; 3) 配置 SPF 记录防止域名被伪造; 4) ASF 设置中有 Backscatter NDR 检测选项但在 M365 EXO 环境通常不需要额外配置
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable
