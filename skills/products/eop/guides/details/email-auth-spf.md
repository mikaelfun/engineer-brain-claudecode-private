# EOP SPF 认证失败与配置 - Comprehensive Troubleshooting Guide

**Entries**: 12 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-email-authentication-spf-dkim-dmarc.md, ado-wiki-a-quantifying-auth-results-advanced-hunting.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Complex SPF records with many
> Source: ado-wiki

**Symptom**: SPF shows softfail/hardfail (not temperror) but the sender's SPF record appears correct. Sub-entry timeouts in deeply nested SPF includes cause the top-level check to produce a fail result instead ...
**Root Cause**: Complex SPF records with many nested includes (e.g., 6+ levels) cause cumulative DNS lookup time to exceed 500ms. When a sub-entry times out, SPF returns fail (determined by ~all/-all mechanism), n...

1. 1) Use Vamsoft SPF Policy Tester to expand and check total query/response time. 2) Reduce nested include complexity. 3) Increase sub-entry TTLs to >=3600s. 4) For macros in SPF, expand using RFC 4408 section 7.2 or Vamsoft advanced option. 5) Quantify SPF fail rates with Advanced Hunting to determine if escalation is warranted.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: SPF check evaluates the connecting
> Source: ado-wiki

**Symptom**: SPF fails for inbound email when customer MX record does not point to EOP (on-premises/3rd-party filtering in front of EOP). Auth-Results shows spf=fail with the connecting IP belonging to the cust...
**Root Cause**: SPF check evaluates the connecting IP from the on-premises/3rd-party server, not the original sender's IP. The intermediate server IP is not in the sender's SPF record.

1. 1) Enable Enhanced Filtering for Connectors (skip listing) to evaluate SPF against the original sender IP. 2) Lock down Exchange Online to accept mail only from the 3rd-party (Step 4 best practices). 3) Do NOT bypass spam filtering with transport rules. 4) Honor DMARC will apply when Enhanced Filtering is enabled even if MX does not point to EOP.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 3: SPF record has syntax errors
> Source: ado-wiki

**Symptom**: SPF returns permerror for sender domain. Email authentication fails permanently, not intermittently.
**Root Cause**: SPF record has syntax errors OR exceeds the RFC 7208 limit of 10 DNS lookups across all nested includes/redirects/a/mx/ptr/exists mechanisms.

1. 1) Validate SPF syntax with MXToolbox or DMARCIAN. 2) Count total DNS lookups across all nested levels (include, redirect, a, mx, ptr, exists count). 3) To reduce: remove stale entries, replace includes with ip4/ip6, use DKIM for some 3rd-party senders, use transport rules for internal-only senders. 4) If syntax correct and lookups <=10 but permerror persists only in O365 (passes at Gmail/Yahoo), escalate to MDO Escalations with message sample + 3rd-party test results.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 4: Sending domain SPF or DKIM
> Source: ado-wiki

**Symptom**: Inbound emails show SPF=TEMPERROR (DNS Timeout) or DKIM=FAIL (no key for signature) in Authentication-Results header
**Root Cause**: Sending domain SPF or DKIM DNS records have TTL lower than 3600 seconds, causing DNS lookup timeouts in EOP

1. Verify TTL of SPF (TXT) and DKIM (CNAME) records using Resolve-DnsName
2. ensure TTL is set to 3600. If customer controls DNS, set TTL to 3600. For third-party senders with low TTL, note in escalation.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 5: include:spf.protection.outlook.com is missing from the
> Source: ado-wiki

**Symptom**: SPF=TEMPERROR for domains using macro-based SPF records or nested/flattened SPF records
**Root Cause**: include:spf.protection.outlook.com is missing from the main (top-level) SPF TXT record, causing EOP DNS resolution issues with complex SPF configurations

1. Add include:spf.protection.outlook.com at the beginning of the main SPF TXT record. For nested/flattened records, ensure it is in the main TXT record, not a subrecord.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 6: EOP DNS query timeout threshold
> Source: onenote

**Symptom**: Intermittent SPF PermError (invalid SPF mechanism) after Enhanced Filtering configured - occurs sporadically for specific sender domains
**Root Cause**: EOP DNS query timeout threshold is 500ms (1000ms extended); some sender domains DNS servers in APAC region respond in 1000-1600ms exceeding EOP timeout; EOP treats DNS timeout as SPF PermError whic...

1. Add the spoofed sender to Spoof Intelligence allow list (external sender type) in SCC portal
2. this bypasses SPF check for known legitimate senders that consistently trigger DNS timeout

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8/10 - [OneNote]]`

### Phase 7: Email from microsoft.com routed through
> Source: onenote

**Symptom**: Emails from microsoft.com to 21V mailbox fail SPF check - SPF Fail for microsoft.com domain
**Root Cause**: Email from microsoft.com routed through third-party relay (ttsenmta7.ttasia.com) before reaching 21V EOP; relay IP not in microsoft.com SPF record causing SPF fail; this is by-design behavior - SPF...

1. Recipient (21V tenant) must configure Enhanced Filtering for Connectors on Inbound Connector to allow EOP to trace back to original sending IP past the relay
2. PG confirmed this is by-design, sender-side fix not applicable

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8/10 - [OneNote]]`

### Phase 8: Sending domain is not on
> Source: ado-wiki

**Symptom**: SPF/DKIM DNS timeout failure rate exceeds 0.1-0.2% for specific sending domains even after TTL and SPF record corrections
**Root Cause**: Sending domain is not on the AntispamRetrySpfWithExtendedTimeouts retry list in ECS (Experimentation Configuration Service)

1. Check ECS configuration (Substrate/EOP_Antispam config 1423964, ExtendedtimeoutV3 column) for the domain/GUID. If not present and failures persist, escalate to MDO Engineering with: Advanced Hunting results, domain list, headers, DNS output, retry list status.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 9: 发送服务器 IP 未在域的 SPF 记录中授权。常见子原因：1)
> Source: mslearn

**Symptom**: 邮件 header 显示 spf=fail 或 spf=softfail，导致 DMARC 也失败
**Root Cause**: 发送服务器 IP 未在域的 SPF 记录中授权。常见子原因：1) SPF 记录缺少合法源 IP; 2) spf=permerror 表示 SPF 记录超过 10 次 DNS lookup; 3) spf=temperror 表示 DNS 解析临时故障

1. 1) 更新 SPF 记录包含所有合法源 IP
2. 2) 简化 SPF 记录移除不必要的 include
3. 3) 修正语法错误
4. 4) DNS 临时故障时增大 TTL 至少 1 小时

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 10: SPF TXT 记录中 include: 语句过多导致
> Source: mslearn

**Symptom**: SPF TXT 记录配置错误导致 SPF 验证 permerror 失败，邮件被退回提示 exceeded hop count 或 required too many lookups
**Root Cause**: SPF TXT 记录中 include: 语句过多导致 DNS 查询超过 10 次限制

1. 1) 在线工具检查 DNS lookup 次数
2. 2) 减少 include: 将不受控服务移到子域
3. 3) 用 ip4:/ip6: 替代部分 include:
4. 4) 每域只保留一个 SPF 记录
5. 5) TTL 至少 3600 秒

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 11: 21Vianet 运营的 M365 使用不同的 SPF
> Source: mslearn

**Symptom**: M365 21Vianet 环境中 SPF 配置错误，使用了 Global 版 include:spf.protection.outlook.com 导致 SPF 验证失败
**Root Cause**: 21Vianet 运营的 M365 使用不同的 SPF include 域名，使用 Global 版导致邮件源不匹配

1. 21Vianet: v=spf1 include:spf.protection.partner.outlook.cn -all
2. GCC High: v=spf1 include:spf.protection.office365.us -all
3. Global: v=spf1 include:spf.protection.outlook.com -all

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 12: Sender domain SPF record does
> Source: contentidea-kb

**Symptom**: Legitimate email messages quarantined by EOP. received-spf: Fail (protection.outlook.com: domain does not designate IP as permitted sender).
**Root Cause**: Sender domain SPF record does not include sending IP. Advanced Spam Filter Policy option MarkAsSpamSpfRecordHardFail is turned on, causing SPF=fail emails to be marked as SPAM.

1. Contact remote domain to fix SPF record. Workaround: Add sender to allow sender list.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7/10 - [ContentIdea KB]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| SPF shows softfail/hardfail (not temperror) but the sende... | Complex SPF records with many | -> Phase 1 |
| SPF fails for inbound email when customer MX record does ... | SPF check evaluates the connecting | -> Phase 2 |
| SPF returns permerror for sender domain. Email authentica... | SPF record has syntax errors | -> Phase 3 |
| Inbound emails show SPF=TEMPERROR (DNS Timeout) or DKIM=F... | Sending domain SPF or DKIM | -> Phase 4 |
| SPF=TEMPERROR for domains using macro-based SPF records o... | include:spf.protection.outlook.com is missing from the | -> Phase 5 |
| Intermittent SPF PermError (invalid SPF mechanism) after ... | EOP DNS query timeout threshold | -> Phase 6 |
| Emails from microsoft.com to 21V mailbox fail SPF check -... | Email from microsoft.com routed through | -> Phase 7 |
| SPF/DKIM DNS timeout failure rate exceeds 0.1-0.2% for sp... | Sending domain is not on | -> Phase 8 |
| 邮件 header 显示 spf=fail 或 spf=softfail，导致 DMARC 也失败 | 发送服务器 IP 未在域的 SPF 记录中授权。常见子原因：1) | -> Phase 9 |
| SPF TXT 记录配置错误导致 SPF 验证 permerror 失败，邮件被退回提示 exceeded hop... | SPF TXT 记录中 include: 语句过多导致 | -> Phase 10 |
| M365 21Vianet 环境中 SPF 配置错误，使用了 Global 版 include:spf.prote... | 21Vianet 运营的 M365 使用不同的 SPF | -> Phase 11 |
| Legitimate email messages quarantined by EOP. received-sp... | Sender domain SPF record does | -> Phase 12 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | SPF shows softfail/hardfail (not temperror) but the sender's SPF record appea... | Complex SPF records with many nested includes (e.g., 6+ l... | 1) Use Vamsoft SPF Policy Tester to expand and check total query/response tim... | 🟢 8.5 | [ADO Wiki] |
| 2 | SPF fails for inbound email when customer MX record does not point to EOP (on... | SPF check evaluates the connecting IP from the on-premise... | 1) Enable Enhanced Filtering for Connectors (skip listing) to evaluate SPF ag... | 🟢 8.5 | [ADO Wiki] |
| 3 | SPF returns permerror for sender domain. Email authentication fails permanent... | SPF record has syntax errors OR exceeds the RFC 7208 limi... | 1) Validate SPF syntax with MXToolbox or DMARCIAN. 2) Count total DNS lookups... | 🟢 8.5 | [ADO Wiki] |
| 4 | Inbound emails show SPF=TEMPERROR (DNS Timeout) or DKIM=FAIL (no key for sign... | Sending domain SPF or DKIM DNS records have TTL lower tha... | Verify TTL of SPF (TXT) and DKIM (CNAME) records using Resolve-DnsName; ensur... | 🟢 8.5 | [ADO Wiki] |
| 5 | SPF=TEMPERROR for domains using macro-based SPF records or nested/flattened S... | include:spf.protection.outlook.com is missing from the ma... | Add include:spf.protection.outlook.com at the beginning of the main SPF TXT r... | 🟢 8.5 | [ADO Wiki] |
| 6 | Intermittent SPF PermError (invalid SPF mechanism) after Enhanced Filtering c... | EOP DNS query timeout threshold is 500ms (1000ms extended... | Add the spoofed sender to Spoof Intelligence allow list (external sender type... | 🟢 8 | [OneNote] |
| 7 | Emails from microsoft.com to 21V mailbox fail SPF check - SPF Fail for micros... | Email from microsoft.com routed through third-party relay... | Recipient (21V tenant) must configure Enhanced Filtering for Connectors on In... | 🟢 8 | [OneNote] |
| 8 | SPF/DKIM DNS timeout failure rate exceeds 0.1-0.2% for specific sending domai... | Sending domain is not on the AntispamRetrySpfWithExtended... | Check ECS configuration (Substrate/EOP_Antispam config 1423964, Extendedtimeo... | 🔵 7.5 | [ADO Wiki] |
| 9 | 邮件 header 显示 spf=fail 或 spf=softfail，导致 DMARC 也失败 | 发送服务器 IP 未在域的 SPF 记录中授权。常见子原因：1) SPF 记录缺少合法源 IP; 2) spf=p... | 1) 更新 SPF 记录包含所有合法源 IP; 2) 简化 SPF 记录移除不必要的 include; 3) 修正语法错误; 4) DNS 临时故障时增大... | 🔵 7.5 | [MS Learn] |
| 10 | SPF TXT 记录配置错误导致 SPF 验证 permerror 失败，邮件被退回提示 exceeded hop count 或 required to... | SPF TXT 记录中 include: 语句过多导致 DNS 查询超过 10 次限制 | 1) 在线工具检查 DNS lookup 次数; 2) 减少 include: 将不受控服务移到子域; 3) 用 ip4:/ip6: 替代部分 inclu... | 🔵 7.5 | [MS Learn] |
| 11 | M365 21Vianet 环境中 SPF 配置错误，使用了 Global 版 include:spf.protection.outlook.com 导致... | 21Vianet 运营的 M365 使用不同的 SPF include 域名，使用 Global 版导致邮件源不匹配 | 21Vianet: v=spf1 include:spf.protection.partner.outlook.cn -all; GCC High: v=... | 🔵 7.5 | [MS Learn] |
| 12 | Legitimate email messages quarantined by EOP. received-spf: Fail (protection.... | Sender domain SPF record does not include sending IP. Adv... | Contact remote domain to fix SPF record. Workaround: Add sender to allow send... | 🔵 7 | [ContentIdea KB] |
