# EOP Safe Links (安全链接) 问题 - Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-URL-Click-Alerts.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: The URL rewriting is caused
> Source: ado-wiki

**Symptom**: URLs are being rewritten and customer cannot access sign-on page; URL shows mcasproxy.cdn.mcas.ms in browser
**Root Cause**: The URL rewriting is caused by MDA (Defender for Cloud Apps) Reverse Proxy / Conditional Access App Control, not by MDO Safe Links

1. 1) Verify URL contains mcasproxy.cdn.mcas.ms - this confirms MDA proxy, not Safe Links. 2) Collect network trace if unclear. 3) Route case to MDA team (SAP: Azure/Microsoft Defender for Cloud Apps). This is NOT an MDO/Safe Links issue.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 2: Causes: other thread recipient clicked
> Source: ado-wiki

**Symptom**: Alert: potentially malicious URL click detected but user did not click
**Root Cause**: Causes: other thread recipient clicked wrapped URL, third-party scanned it, URL shared elsewhere, Safe Links rewrite on shared mailbox.

1. Check IPs via MicrosoftIPs tool. EOP/APC -> escalate to Engineering. Other -> customer investigates.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 3: Safe Links 设计限制：不支持 mail-enabled public
> Source: mslearn

**Symptom**: Safe Links 未对 mail-enabled public folders、RTF 格式邮件或 S/MIME 签名邮件中的 URL 提供保护
**Root Cause**: Safe Links 设计限制：不支持 mail-enabled public folders、RTF/TNEF 格式、S/MIME 签名邮件中的 URL 扫描

1. 了解 Safe Links 保护范围限制。对于 RTF 邮件建议发件人使用 HTML 格式。S/MIME 签名邮件中链接不受保护是已知限制

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 4: API-only 模式依赖客户端在点击时调用 SafeLinks API。不支持 API
> Source: mslearn

**Symptom**: Safe Links 配置为 API-only 模式（Do not rewrite URLs），用户在非支持客户端中点击恶意链接未被拦截
**Root Cause**: API-only 模式依赖客户端在点击时调用 SafeLinks API。不支持 API 的客户端无法触发点击时检查

1. 对需要广泛保护的场景启用 URL rewriting（默认行为）而非 API-only 模式。URL rewriting 在邮件投递时重写 URL，不依赖客户端支持

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 5: 在 MDO 之前使用其他服务对 URL 进行包装/重写，Safe
> Source: mslearn

**Symptom**: 第三方链接包装服务导致 Safe Links 无法正确扫描或验证 URL
**Root Cause**: 在 MDO 之前使用其他服务对 URL 进行包装/重写，Safe Links 收到已包装 URL 无法正确解析原始 URL

1. 确保 Safe Links 是链接保护链中最后一环，或移除第三方链接包装服务。如必须使用第三方，将其包装域添加到 Do not rewrite 列表

> :warning: 21Vianet: Not applicable

`[Score: 🔵 5.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| URLs are being rewritten and customer cannot access sign-... | The URL rewriting is caused | -> Phase 1 |
| Alert: potentially malicious URL click detected but user ... | Causes: other thread recipient clicked | -> Phase 2 |
| Safe Links 未对 mail-enabled public folders、RTF 格式邮件或 S/MIM... | Safe Links 设计限制：不支持 mail-enabled public | -> Phase 3 |
| Safe Links 配置为 API-only 模式（Do not rewrite URLs），用户在非支持客户端... | API-only 模式依赖客户端在点击时调用 SafeLinks API。不支持 API | -> Phase 4 |
| 第三方链接包装服务导致 Safe Links 无法正确扫描或验证 URL | 在 MDO 之前使用其他服务对 URL 进行包装/重写，Safe | -> Phase 5 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | URLs are being rewritten and customer cannot access sign-on page; URL shows m... | The URL rewriting is caused by MDA (Defender for Cloud Ap... | 1) Verify URL contains mcasproxy.cdn.mcas.ms - this confirms MDA proxy, not S... | 🔵 7.5 | [ADO Wiki] |
| 2 | Alert: potentially malicious URL click detected but user did not click | Causes: other thread recipient clicked wrapped URL, third... | Check IPs via MicrosoftIPs tool. EOP/APC -> escalate to Engineering. Other ->... | 🔵 7.5 | [ADO Wiki] |
| 3 | Safe Links 未对 mail-enabled public folders、RTF 格式邮件或 S/MIME 签名邮件中的 URL 提供保护 | Safe Links 设计限制：不支持 mail-enabled public folders、RTF/TNEF ... | 了解 Safe Links 保护范围限制。对于 RTF 邮件建议发件人使用 HTML 格式。S/MIME 签名邮件中链接不受保护是已知限制 | 🔵 6.5 | [MS Learn] |
| 4 | Safe Links 配置为 API-only 模式（Do not rewrite URLs），用户在非支持客户端中点击恶意链接未被拦截 | API-only 模式依赖客户端在点击时调用 SafeLinks API。不支持 API 的客户端无法触发点击时检查 | 对需要广泛保护的场景启用 URL rewriting（默认行为）而非 API-only 模式。URL rewriting 在邮件投递时重写 URL，不依赖... | 🔵 6.5 | [MS Learn] |
| 5 | 第三方链接包装服务导致 Safe Links 无法正确扫描或验证 URL | 在 MDO 之前使用其他服务对 URL 进行包装/重写，Safe Links 收到已包装 URL 无法正确解析原始... | 确保 Safe Links 是链接保护链中最后一环，或移除第三方链接包装服务。如必须使用第三方，将其包装域添加到 Do not rewrite 列表 | 🔵 5.5 | [MS Learn] |
