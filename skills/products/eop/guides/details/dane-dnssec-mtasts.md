# EOP DANE/DNSSEC/MTA-STS 出站验证 - Issue Details

**Entries**: 8 | **Type**: Quick Reference Only
**Generated**: 2026-04-07

---

### 1. 发送邮件到外部域收到 NDR 4/5.7.321 starttls-not-supported，邮件被退回

- **Root Cause**: 目标邮件服务器不支持 STARTTLS，而 Exchange Online 尝试 SMTP DANE 验证要求 TLS 安全连接。目标服务器未配置 TLS 或配置错误忽略 STARTTLS 命令
- **Solution**: 1) 这是目标邮件服务器的问题。2) 检查目标邮件服务器是否配置为监听 SMTP 流量（端口 25/587）。3) 确认 STARTTLS 支持已启用。4) 如果目标服务器不支持 STARTTLS，需升级到支持的版本。5) 可尝试移除 TLSA 记录后重新测试
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 2. 发送邮件到外部域收到 NDR 4/5.7.322 certificate-expired，邮件被退回

- **Root Cause**: 目标邮件服务器的 X.509 TLS 证书已过期，Exchange Online 的 SMTP DANE 验证要求目标服务器呈现有效的未过期证书
- **Solution**: 目标邮件服务器管理员需：1) 识别与错误关联的 IP 地址的邮件服务器；2) 找到过期证书；3) 从证书提供商续期并安装新证书；4) 更新关联的 TLSA 记录中的证书数据
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 3. 发送邮件到外部域收到 NDR 4/5.7.323 tlsa-invalid，DANE 验证失败

- **Root Cause**: TLSA 记录配置错误。可能原因：1) TLSA 记录内容错误；2) 证书尚未在有效期内（配置了未来生效日期）；3) 目标域正在遭受攻击；4) 其他 DANE 验证失败
- **Solution**: 1) 识别与错误关联的邮件服务器和 TLSA 记录；2) 验证 TLSA 记录配置正确（selector 和证书数据匹配）；3) 检查证书有效期窗口；4) 如果 TLSA 记录有差异，修正后等待 DNS 传播后重新测试。使用 Microsoft Remote Connectivity Analyzer 诊断
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 4. 发送邮件到外部域收到 NDR 4/5.7.324 dnssec-invalid 或 4/5.4.312 DNS query failed，DNSSEC 验证失败

- **Root Cause**: 目标域声明支持 DNSSEC 但 DNSSEC 检查失败。已知限制：当域的 DNSSEC 检查失败时，Exchange Online 可能生成通用 4/5.4.312 DNS query failed 错误而非特定的 5.7.324 代码
- **Solution**: 1) 使用 Microsoft Remote Connectivity Analyzer 对目标域执行 DANE 验证测试；2) 结果会显示是 DNSSEC 问题还是其他 DNS 问题；3) 目标域管理员需联系 DNS 提供商修复 DNSSEC 配置
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 5. 发送邮件到外部域收到 NDR 5.7.325 certificate-host-mismatch，DANE 证书验证失败

- **Root Cause**: 目标 SMTP 服务器呈现的证书的 CN（Common Name）或 SAN（Subject Alternative Name）不匹配 DANE 验证期望的主机名。证书标识与 TLSA 记录或 MX 主机不匹配
- **Solution**: 目标邮件服务器管理员需：1) 检查证书的 CN 和 SAN 是否包含正确的 MX 主机名；2) 确认证书正确安装在对应的邮件服务器上；3) 参考 How SMTP DANE works 文档排查
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 6. 发送邮件到外部域收到 NDR 5.7.5 Remote certificate failed MTA-STS validation

- **Root Cause**: 目标域配置了 MTA-STS (Mail Transfer Agent Strict Transport Security) 策略，但其邮件服务器证书不满足 MTA-STS 要求：证书未链接到受信任的根 CA，或 CN/SAN 不包含 STS 策略中指定的主机名
- **Solution**: 目标域管理员需：1) 确认邮件服务器证书链接到受信任的根 CA；2) 确认证书的 CN 或 SAN 包含 MTA-STS 策略中的主机名条目；3) 参考 Enhancing mail flow with MTA-STS 文档
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 7. 发送邮件到外部域收到 NDR 5.4.8 MX hosts of <domain> failed MTA-STS validation

- **Root Cause**: 目标域配置了 MTA-STS 策略，但其 MX 主机不是策略中指定的预期主机。MTA-STS 策略文件中的 mx 条目与实际 MX 记录不匹配
- **Solution**: 目标域管理员需更新 MTA-STS 策略文件（/.well-known/mta-sts.txt），确保 mx 行包含所有实际使用的 MX 主机名，并更新策略 ID
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 8. 启用 Inbound SMTP DANE with DNSSEC 后邮件流中断，外部发件人无法投递邮件

- **Root Cause**: 三种关键场景：1) SMTP DANE 验证失败；2) DNSSEC 验证失败；3) MX 值配置不正确。已知限制：self-service/viral 域和 onmicrosoft.com 域不支持 Inbound SMTP DANE
- **Solution**: 1) SMTP DANE 验证失败：运行 Disable-SmtpDaneInbound -DomainName <domain> 缓解。2) DNSSEC 验证失败：通过 DNS 提供商禁用 DNSSEC 并开 support ticket 排查。3) MX 值问题：确认 MX 值与 M365 Admin Center > Settings > Domains 中一致，运行 Check health 诊断。使用 Microsoft Remote Connectivity Analyzer 验证配置
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable
