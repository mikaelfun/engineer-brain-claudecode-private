# EOP DKIM 签名验证失败与配置 - Comprehensive Troubleshooting Guide

**Entries**: 8 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-email-authentication-spf-dkim-dmarc.md, mslearn-email-authentication-troubleshoot.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: 3rd-party or on-premises MX modified
> Source: ado-wiki

**Symptom**: DKIM fails with 'body hash did not verify' (dkim=fail body hash fail). Message body was modified after DKIM signature was applied.
**Root Cause**: 3rd-party or on-premises MX modified the message body after DKIM signing -- common causes: URL/link wrapping, external sender warning banners, message signatures/footers.

1. 1) Primary: stop body modifications before DKIM verification at EOP. 2) Alternative: configure trusted ARC sealers if 3rd-party supports ARC (not available in 21V/Mooncake). 3) For EOP-to-3rd-party-to-EOP routing: use ARC or TABL spoof allow for 3rd-party IPs. 4) New Enhanced Filtering improvement: if MX not at EOP + EF enabled + DKIM domain aligns with From but body hash fails, CompAuth set to 'none' instead of 'fail'.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: An intermediate server modified one
> Source: ado-wiki

**Symptom**: DKIM fails with 'signature did not verify' (dkim=fail signature did not verify). A header included in the DKIM signature was modified after signing.
**Root Cause**: An intermediate server modified one of the headers listed in the DKIM-Signature h= value. Subject header is the most common culprit (e.g., prepending [EXTERNAL]).

1. 1) Check h= value in DKIM-Signature header to identify signed headers. 2) Stop header modifications by intermediate servers. 3) Alternative: configure trusted ARC sealers if supported (not available in 21V). 4) For auto-forwarded emails with DKIM domain not aligned with P2 From domain, enable DKIM signing for the vanity domain (not just onmicrosoft.com).

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 3: 1) DKIM 公钥未在 DNS 发布（CNAME/TXT
> Source: mslearn

**Symptom**: 邮件 header 显示 dkim=fail (no key for signature) 或 dkim=fail (signature didn't verify)
**Root Cause**: 1) DKIM 公钥未在 DNS 发布（CNAME/TXT 记录缺失）; 2) 密钥不匹配签名; 3) 消息在传输中被中间服务修改导致签名失效

1. 1) 在 DNS 发布 DKIM 公钥
2. 2) 验证 selector 和 d= 值匹配
3. 3) TTL 设置至少 1 小时
4. 4) 中间服务修改场景配置 trusted ARC sealers
5. 5) 避免签名后修改 DKIM 保护的 header

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 4: 邮件经中间服务（mailing list、转发服务、安全设备）处理时，正文内容在 DKIM 签名后被修改（如添加 footer/disclaimer），导致接收端计算的
> Source: mslearn

**Symptom**: 邮件 header 显示 dkim=fail (body hash fail)，DKIM 签名验证失败，原因是邮件正文在签名后被中间服务修改
**Root Cause**: 邮件经中间服务（mailing list、转发服务、安全设备）处理时，正文内容在 DKIM 签名后被修改（如添加 footer/disclaimer），导致接收端计算的 body hash 与 DKIM 签名中的 hash 不匹配

1. 1) 发件人：确认邮件正文在 DKIM 签名后到离开发送环境期间未被修改；考虑使用 M365 本身添加 footer/disclaimer 而非第三方服务。2) 中间服务：配置为 trusted ARC sealer 以覆盖因修改导致的 DKIM 失败。3) 收件人：配置 trusted ARC sealers，或将消息修改操作（footer/disclaimer/subject）迁移到 M365 执行

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 5: 邮件经中间服务（mailing list、转发服务、安全设备）处理时，DKIM 签名包含的 header（如 Subject:,
> Source: mslearn

**Symptom**: 邮件 header 显示 dkim=fail (Signature didnt verify)，DKIM 签名验证失败，原因是邮件 header 在签名后被中间服务修改
**Root Cause**: 邮件经中间服务（mailing list、转发服务、安全设备）处理时，DKIM 签名包含的 header（如 Subject:, From:, To:）在签名后被修改。DKIM-Signature 的 h= 值标识了被包含在原始 hash 中的 header，修改任何一个都会导致 DKIM 失败

1. 1) 发件人：确保签名 header 从 DKIM 签名到邮件离开环境期间保持不变。2) 中间服务提供商：配置为 trusted ARC sealer 以覆盖因 header 修改导致的 DKIM 失败

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 6: DKIM 签名配置问题分三种情况：1) 未创建 DKIM 签名配置，邮件可能使用默认域设置；2)
> Source: mslearn

**Symptom**: 使用 M365 Admin Center DKIM 诊断工具验证 DKIM 配置，结果显示 No Configuration Created 或 Configured but Possibly Published Incorrectly 或 Created but Not Enabled
**Root Cause**: DKIM 签名配置问题分三种情况：1) 未创建 DKIM 签名配置，邮件可能使用默认域设置；2) 配置已创建但 DNS 中 CNAME 记录未正确发布或发布错误；3) 配置已创建但未启用（toggle 未开启）

1. 1) 未创建：使用 PowerShell New-DkimSigningConfig 创建配置。2) 发布错误：检查 DNS 中 CNAME 记录是否正确指向 Microsoft 公共密钥条目。3) 未启用：在 Defender portal > Email authentication > DKIM 中启用签名。使用 M365 Admin Center Diagnostics 的 Validate DKIM Signing Configuration 工具验证

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 7: DKIM CNAME 记录未在域注册商 DNS 中正确发布，或发布后
> Source: mslearn

**Symptom**: 启用 DKIM 签名后状态显示 CnameMissing 或 NoDKIMKeys，DKIM 未对出站邮件签名，Toggle 无法切换为 Enabled
**Root Cause**: DKIM CNAME 记录未在域注册商 DNS 中正确发布，或发布后 M365 尚未检测到新 CNAME 记录（需要几分钟到数小时传播）

1. 1. 在 Defender portal Email authentication DKIM 页面获取 selector1._domainkey 和 selector2._domainkey 的 CNAME 值；2. 在域注册商创建两条 CNAME 记录；3. 等待 DNS 传播后重新切换 Toggle 为 Enabled；4. PowerShell: Get-DkimSigningConfig 检查 Status 变为 Valid

> :warning: 21Vianet: Not applicable

`[Score: 🔵 5.5/10 - [MS Learn]]`

### Phase 8: DKIM key rotation 设计上需要 4
> Source: mslearn

**Symptom**: DKIM key rotation 执行后新密钥未立即生效，出站邮件仍使用旧 selector 签名，DKIM-Signature header 中 s= 值未改变
**Root Cause**: DKIM key rotation 设计上需要 4 天（96 小时）才能生效，在 RotateOnDate 之前系统仍使用 SelectorBeforeRotateOnDate 对应的旧密钥签名

1. 等待 96 小时让 rotation 生效。通过 Get-DkimSigningConfig 检查 RotateOnDate / SelectorAfterRotateOnDate 确认时间。注意：rotation 进行中无法再次 rotate；若从 1024 升级 2048 bit，需两次 rotation 才能两个 selector 都升级

> :warning: 21Vianet: Not applicable

`[Score: 🔵 5.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| DKIM fails with 'body hash did not verify' (dkim=fail bod... | 3rd-party or on-premises MX modified | -> Phase 1 |
| DKIM fails with 'signature did not verify' (dkim=fail sig... | An intermediate server modified one | -> Phase 2 |
| 邮件 header 显示 dkim=fail (no key for signature) 或 dkim=fail... | 1) DKIM 公钥未在 DNS 发布（CNAME/TXT | -> Phase 3 |
| 邮件 header 显示 dkim=fail (body hash fail)，DKIM 签名验证失败，原因是邮件... | 邮件经中间服务（mailing list、转发服务、安全设备）处理时，正文内容在 DKIM 签名后被修改（如添加 footer/disclaimer），导致接收端计算的 | -> Phase 4 |
| 邮件 header 显示 dkim=fail (Signature didnt verify)，DKIM 签名验证... | 邮件经中间服务（mailing list、转发服务、安全设备）处理时，DKIM 签名包含的 header（如 Subject:, | -> Phase 5 |
| 使用 M365 Admin Center DKIM 诊断工具验证 DKIM 配置，结果显示 No Configur... | DKIM 签名配置问题分三种情况：1) 未创建 DKIM 签名配置，邮件可能使用默认域设置；2) | -> Phase 6 |
| 启用 DKIM 签名后状态显示 CnameMissing 或 NoDKIMKeys，DKIM 未对出站邮件签名，T... | DKIM CNAME 记录未在域注册商 DNS 中正确发布，或发布后 | -> Phase 7 |
| DKIM key rotation 执行后新密钥未立即生效，出站邮件仍使用旧 selector 签名，DKIM-S... | DKIM key rotation 设计上需要 4 | -> Phase 8 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | DKIM fails with 'body hash did not verify' (dkim=fail body hash fail). Messag... | 3rd-party or on-premises MX modified the message body aft... | 1) Primary: stop body modifications before DKIM verification at EOP. 2) Alter... | 🟢 8.5 | [ADO Wiki] |
| 2 | DKIM fails with 'signature did not verify' (dkim=fail signature did not verif... | An intermediate server modified one of the headers listed... | 1) Check h= value in DKIM-Signature header to identify signed headers. 2) Sto... | 🟢 8.5 | [ADO Wiki] |
| 3 | 邮件 header 显示 dkim=fail (no key for signature) 或 dkim=fail (signature didn't v... | 1) DKIM 公钥未在 DNS 发布（CNAME/TXT 记录缺失）; 2) 密钥不匹配签名; 3) 消息在传输... | 1) 在 DNS 发布 DKIM 公钥; 2) 验证 selector 和 d= 值匹配; 3) TTL 设置至少 1 小时; 4) 中间服务修改场景配置... | 🔵 7.5 | [MS Learn] |
| 4 | 邮件 header 显示 dkim=fail (body hash fail)，DKIM 签名验证失败，原因是邮件正文在签名后被中间服务修改 | 邮件经中间服务（mailing list、转发服务、安全设备）处理时，正文内容在 DKIM 签名后被修改（如添加 ... | 1) 发件人：确认邮件正文在 DKIM 签名后到离开发送环境期间未被修改；考虑使用 M365 本身添加 footer/disclaimer 而非第三方服务... | 🔵 7.5 | [MS Learn] |
| 5 | 邮件 header 显示 dkim=fail (Signature didnt verify)，DKIM 签名验证失败，原因是邮件 header 在签名后... | 邮件经中间服务（mailing list、转发服务、安全设备）处理时，DKIM 签名包含的 header（如 Su... | 1) 发件人：确保签名 header 从 DKIM 签名到邮件离开环境期间保持不变。2) 中间服务提供商：配置为 trusted ARC sealer 以... | 🔵 7.5 | [MS Learn] |
| 6 | 使用 M365 Admin Center DKIM 诊断工具验证 DKIM 配置，结果显示 No Configuration Created 或 Conf... | DKIM 签名配置问题分三种情况：1) 未创建 DKIM 签名配置，邮件可能使用默认域设置；2) 配置已创建但 D... | 1) 未创建：使用 PowerShell New-DkimSigningConfig 创建配置。2) 发布错误：检查 DNS 中 CNAME 记录是否正确... | 🔵 7.5 | [MS Learn] |
| 7 | 启用 DKIM 签名后状态显示 CnameMissing 或 NoDKIMKeys，DKIM 未对出站邮件签名，Toggle 无法切换为 Enabled | DKIM CNAME 记录未在域注册商 DNS 中正确发布，或发布后 M365 尚未检测到新 CNAME 记录（需... | 1. 在 Defender portal Email authentication DKIM 页面获取 selector1._domainkey 和 se... | 🔵 5.5 | [MS Learn] |
| 8 | DKIM key rotation 执行后新密钥未立即生效，出站邮件仍使用旧 selector 签名，DKIM-Signature header 中 s=... | DKIM key rotation 设计上需要 4 天（96 小时）才能生效，在 RotateOnDate 之前系... | 等待 96 小时让 rotation 生效。通过 Get-DkimSigningConfig 检查 RotateOnDate / SelectorAfte... | 🔵 5.5 | [MS Learn] |
