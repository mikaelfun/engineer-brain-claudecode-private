# EOP 连接筛选与 IPv6 入站限制 - Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Connection-Filter-Spamhaus.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: EFC enabled: original CIP not
> Source: ado-wiki

**Symptom**: IP Allow List stops working after enabling Enhanced Filtering for Connectors (EFC)
**Root Cause**: EFC enabled: original CIP not evaluated against Allow/Block list. Gateway IPs skipped.

1. Add original source (skip-listed) IPs to Allow only. Check Auth-Results or X-MS-Exchange-ExternalOriginalInternetSender.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: Connection Filter only supports IPv4.
> Source: ado-wiki

**Symptom**: Cannot add IPv6 to Connection Filter IP Allow/Block List
**Root Cause**: Connection Filter only supports IPv4.

1. Use Tenant Allow/Block List for IPv6. TABL not available in 21Vianet.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 3: 两种场景导致 IP Allow List 不生效：1)
> Source: mslearn

**Symptom**: 已将发件人 IP 添加到 Connection Filtering 的 IP Allow List，但邮件仍被 spam 过滤
**Root Cause**: 两种场景导致 IP Allow List 不生效：1) IP 同时配置在 on-premises IP-based inbound connector 中，且 M365 组织和第一个接触邮件的 M365 服务器在同一 datacenter forest 内——此时 IPV:CAL 被添加但仍执行 spam 过滤; 2) 包含 IP Allow List 的组织和第一个接触邮件的服务器在不同 ...

1. 1) 检查邮件 header 中 X-Forefront-Antispam-Report 是否包含 IPV:CAL
2. 2) 如遇上述场景，创建 mail flow rule：条件='sender IP address is in range'，操作='Set SCL to Bypass spam filtering'
3. 3) 先用 Test 模式验证规则效果
4. 4) 确认 IP Allow List 中的条目正确，使用 Get-HostedConnectionFilterPolicy -Identity Default 验证
5. 5) IPv6 地址需在 Tenant Allow/Block List 中管理，不支持 IP Allow List

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 4: M365 租户未启用 anonymous inbound email
> Source: mslearn

**Symptom**: 外部发件人通过 IPv6 发送邮件被拒绝，收到 550 5.2.1 Service unavailable, does not accept email over IPv6
**Root Cause**: M365 租户未启用 anonymous inbound email over IPv6 功能，默认可能未开启

1. 通过 Microsoft 365 admin center 提交支持请求，申请 opt in 启用 IPv6 inbound email 功能

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 5: 发送方 IPv6 地址没有有效的反向 DNS 查找
> Source: mslearn

**Symptom**: 通过 IPv6 发送邮件被延迟，收到 450 4.7.25 sending IPv6 address must have reverse DNS record
**Root Cause**: 发送方 IPv6 地址没有有效的反向 DNS 查找 (PTR) 记录，EOP 要求 IPv6 发件方必须配置 PTR 记录

1. 为发送服务器的 IPv6 地址配置有效的 PTR 反向 DNS 记录，使 EOP 能通过 IPv6 地址解析到域名

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 6: 通过 IPv6 发送的邮件要求发送域必须通过 SPF 或
> Source: mslearn

**Symptom**: 通过 IPv6 发送邮件被延迟，收到 450 4.7.26 message sent over IPv6 must pass either SPF or DKIM validation
**Root Cause**: 通过 IPv6 发送的邮件要求发送域必须通过 SPF 或 DKIM 验证，当前发件方两者均未通过

1. 为发送域配置正确的 SPF 记录（包含 IPv6 发送源）和/或 DKIM 签名，确保至少一项验证通过

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| IP Allow List stops working after enabling Enhanced Filte... | EFC enabled: original CIP not | -> Phase 1 |
| Cannot add IPv6 to Connection Filter IP Allow/Block List | Connection Filter only supports IPv4. | -> Phase 2 |
| 已将发件人 IP 添加到 Connection Filtering 的 IP Allow List，但邮件仍被 s... | 两种场景导致 IP Allow List 不生效：1) | -> Phase 3 |
| 外部发件人通过 IPv6 发送邮件被拒绝，收到 550 5.2.1 Service unavailable, do... | M365 租户未启用 anonymous inbound email | -> Phase 4 |
| 通过 IPv6 发送邮件被延迟，收到 450 4.7.25 sending IPv6 address must h... | 发送方 IPv6 地址没有有效的反向 DNS 查找 | -> Phase 5 |
| 通过 IPv6 发送邮件被延迟，收到 450 4.7.26 message sent over IPv6 must... | 通过 IPv6 发送的邮件要求发送域必须通过 SPF 或 | -> Phase 6 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | IP Allow List stops working after enabling Enhanced Filtering for Connectors ... | EFC enabled: original CIP not evaluated against Allow/Blo... | Add original source (skip-listed) IPs to Allow only. Check Auth-Results or X-... | 🟢 8.5 | [ADO Wiki] |
| 2 | Cannot add IPv6 to Connection Filter IP Allow/Block List | Connection Filter only supports IPv4. | Use Tenant Allow/Block List for IPv6. TABL not available in 21Vianet. | 🔵 7.5 | [ADO Wiki] |
| 3 | 已将发件人 IP 添加到 Connection Filtering 的 IP Allow List，但邮件仍被 spam 过滤 | 两种场景导致 IP Allow List 不生效：1) IP 同时配置在 on-premises IP-based... | 1) 检查邮件 header 中 X-Forefront-Antispam-Report 是否包含 IPV:CAL; 2) 如遇上述场景，创建 mail ... | 🔵 6.5 | [MS Learn] |
| 4 | 外部发件人通过 IPv6 发送邮件被拒绝，收到 550 5.2.1 Service unavailable, does not accept email ... | M365 租户未启用 anonymous inbound email over IPv6 功能，默认可能未开启 | 通过 Microsoft 365 admin center 提交支持请求，申请 opt in 启用 IPv6 inbound email 功能 | 🔵 6.5 | [MS Learn] |
| 5 | 通过 IPv6 发送邮件被延迟，收到 450 4.7.25 sending IPv6 address must have reverse DNS record | 发送方 IPv6 地址没有有效的反向 DNS 查找 (PTR) 记录，EOP 要求 IPv6 发件方必须配置 PT... | 为发送服务器的 IPv6 地址配置有效的 PTR 反向 DNS 记录，使 EOP 能通过 IPv6 地址解析到域名 | 🔵 6.5 | [MS Learn] |
| 6 | 通过 IPv6 发送邮件被延迟，收到 450 4.7.26 message sent over IPv6 must pass either SPF or ... | 通过 IPv6 发送的邮件要求发送域必须通过 SPF 或 DKIM 验证，当前发件方两者均未通过 | 为发送域配置正确的 SPF 记录（包含 IPv6 发送源）和/或 DKIM 签名，确保至少一项验证通过 | 🔵 6.5 | [MS Learn] |
