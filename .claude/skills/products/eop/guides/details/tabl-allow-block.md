# EOP 租户允许/阻止列表 (TABL) 管理 - Comprehensive Troubleshooting Guide

**Entries**: 10 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-tabl-faq.md, mslearn-sender-allow-block-management.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Missing RBAC or URBAC permissions;
> Source: ado-wiki

**Symptom**: Admin unable to add entries to TABL; error or option not available
**Root Cause**: Missing RBAC or URBAC permissions; Exchange Online Permissions not enabled

1. Verify RBAC permissions. Ensure RBAC or URBAC assigned and EXO Permissions enabled.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 2: Incorrect URL entry syntax, especially
> Source: ado-wiki

**Symptom**: URL in TABL but email not blocked/allowed as expected
**Root Cause**: Incorrect URL entry syntax, especially wildcard usage

1. Check URL syntax matches valid scenarios. Review wildcard usage per docs.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 3: Multiple HostedConnectionFilterPolicies; spoof entries only
> Source: ado-wiki

**Symptom**: Spoofed sender entries in TABL appear to save but do not persist
**Root Cause**: Multiple HostedConnectionFilterPolicies; spoof entries only from isDefault=true policy

1. Set first policy isDefault=true, delete second policy, re-add entries.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 4: Infrastructure domain must match PTR
> Source: ado-wiki

**Symptom**: Spoofed sender pair in TABL not effective unless using subdomain as infrastructure
**Root Cause**: Infrastructure domain must match PTR record for connecting IP

1. Use PTR Organization Domain. ping -a <IP> or resolve-dnsname. If PTR=smtp.inbound.contoso.com use contoso.com.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 5: TABL sender allow/block not enabled
> Source: ado-wiki

**Symptom**: TABL sender allow/block not working for internal (intra-org) emails
**Root Cause**: TABL sender allow/block not enabled on IntraOrg messages (by design)

1. By design. Use Exchange transport rules for internal mail filtering instead.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 6: TABL only supports IPv6; IPv4
> Source: ado-wiki

**Symptom**: Cannot add IPv4 address to TABL; only IPv6 accepted
**Root Cause**: TABL only supports IPv6; IPv4 not supported

1. Use default connection filter policy for IPv4 addresses.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 7: By design：TABL Domains & email
> Source: mslearn

**Symptom**: 将域名/邮件地址添加到 TABL Block 后，组织内用户也无法向该域发邮件，收到 NDR 550 5.7.703
**Root Cause**: By design：TABL Domains & email addresses 的 Block 条目同时阻止入站和出站。入站标记为 high confidence phishing 并隔离，出站直接阻止

1. 如只需阻止入站，使用 anti-spam policy 的 blocked sender/domain list 而非 TABL

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 8: Allow entries 自动过期：domains/emails/files/URLs 在过滤系统判定实体安全后 30
> Source: mslearn

**Symptom**: TABL 中的 Allow 条目自动消失，触发 alert Removed an entry in Tenant Allow/Block List
**Root Cause**: Allow entries 自动过期：domains/emails/files/URLs 在过滤系统判定实体安全后 30 天自动删除。Spoofed senders allow 不过期

1. 如仍需 allow 重新创建。建议通过 Admin Submission 创建 allow 条目以获更持久效果。定期检查 allow 条目状态

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 9: By design：TABL URL allow 覆盖
> Source: mslearn

**Symptom**: URL 添加到 TABL Allow 后过滤判定被覆盖（允许投递），但 Safe Links 仍然重写该 URL
**Root Cause**: By design：TABL URL allow 覆盖 filtering verdict 但不阻止 Safe Links URL wrapping，两者是独立机制

1. 如不希望 URL 被 Safe Links 重写，需在 Safe Links policy 的 Do not rewrite the following URLs 列表添加

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 10: 特殊字符需 UTF-8 hex encoding 否则报错。条目上限因
> Source: mslearn

**Symptom**: 无法在 TABL 创建包含特殊字符（引号/加号/空格）的邮件地址条目报错，或达到条目数量上限
**Root Cause**: 特殊字符需 UTF-8 hex encoding 否则报错。条目上限因 license 而异：无 MDO 1000 条，MDO P1 2000 条，MDO P2 15000 条

1. UTF-8 hex encoding 处理特殊字符：%22=双引号, %2B=+, %20=空格。如达上限需升级 license 或清理过期条目

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Admin unable to add entries to TABL; error or option not ... | Missing RBAC or URBAC permissions; | -> Phase 1 |
| URL in TABL but email not blocked/allowed as expected | Incorrect URL entry syntax, especially | -> Phase 2 |
| Spoofed sender entries in TABL appear to save but do not ... | Multiple HostedConnectionFilterPolicies; spoof entries only | -> Phase 3 |
| Spoofed sender pair in TABL not effective unless using su... | Infrastructure domain must match PTR | -> Phase 4 |
| TABL sender allow/block not working for internal (intra-o... | TABL sender allow/block not enabled | -> Phase 5 |
| Cannot add IPv4 address to TABL; only IPv6 accepted | TABL only supports IPv6; IPv4 | -> Phase 6 |
| 将域名/邮件地址添加到 TABL Block 后，组织内用户也无法向该域发邮件，收到 NDR 550 5.7.703 | By design：TABL Domains & email | -> Phase 7 |
| TABL 中的 Allow 条目自动消失，触发 alert Removed an entry in Tenant ... | Allow entries 自动过期：domains/emails/files/URLs 在过滤系统判定实体安全后 30 | -> Phase 8 |
| URL 添加到 TABL Allow 后过滤判定被覆盖（允许投递），但 Safe Links 仍然重写该 URL | By design：TABL URL allow 覆盖 | -> Phase 9 |
| 无法在 TABL 创建包含特殊字符（引号/加号/空格）的邮件地址条目报错，或达到条目数量上限 | 特殊字符需 UTF-8 hex encoding 否则报错。条目上限因 | -> Phase 10 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Admin unable to add entries to TABL; error or option not available | Missing RBAC or URBAC permissions; Exchange Online Permis... | Verify RBAC permissions. Ensure RBAC or URBAC assigned and EXO Permissions en... | 🔵 7.5 | [ADO Wiki] |
| 2 | URL in TABL but email not blocked/allowed as expected | Incorrect URL entry syntax, especially wildcard usage | Check URL syntax matches valid scenarios. Review wildcard usage per docs. | 🔵 7.5 | [ADO Wiki] |
| 3 | Spoofed sender entries in TABL appear to save but do not persist | Multiple HostedConnectionFilterPolicies; spoof entries on... | Set first policy isDefault=true, delete second policy, re-add entries. | 🔵 7.5 | [ADO Wiki] |
| 4 | Spoofed sender pair in TABL not effective unless using subdomain as infrastru... | Infrastructure domain must match PTR record for connectin... | Use PTR Organization Domain. ping -a <IP> or resolve-dnsname. If PTR=smtp.inb... | 🔵 7.5 | [ADO Wiki] |
| 5 | TABL sender allow/block not working for internal (intra-org) emails | TABL sender allow/block not enabled on IntraOrg messages ... | By design. Use Exchange transport rules for internal mail filtering instead. | 🔵 7.5 | [ADO Wiki] |
| 6 | Cannot add IPv4 address to TABL; only IPv6 accepted | TABL only supports IPv6; IPv4 not supported | Use default connection filter policy for IPv4 addresses. | 🔵 7.5 | [ADO Wiki] |
| 7 | 将域名/邮件地址添加到 TABL Block 后，组织内用户也无法向该域发邮件，收到 NDR 550 5.7.703 | By design：TABL Domains & email addresses 的 Block 条目同时阻止入站... | 如只需阻止入站，使用 anti-spam policy 的 blocked sender/domain list 而非 TABL | 🔵 7.5 | [MS Learn] |
| 8 | TABL 中的 Allow 条目自动消失，触发 alert Removed an entry in Tenant Allow/Block List | Allow entries 自动过期：domains/emails/files/URLs 在过滤系统判定实体安全后... | 如仍需 allow 重新创建。建议通过 Admin Submission 创建 allow 条目以获更持久效果。定期检查 allow 条目状态 | 🔵 7.5 | [MS Learn] |
| 9 | URL 添加到 TABL Allow 后过滤判定被覆盖（允许投递），但 Safe Links 仍然重写该 URL | By design：TABL URL allow 覆盖 filtering verdict 但不阻止 Safe L... | 如不希望 URL 被 Safe Links 重写，需在 Safe Links policy 的 Do not rewrite the following ... | 🔵 7.5 | [MS Learn] |
| 10 | 无法在 TABL 创建包含特殊字符（引号/加号/空格）的邮件地址条目报错，或达到条目数量上限 | 特殊字符需 UTF-8 hex encoding 否则报错。条目上限因 license 而异：无 MDO 1000... | UTF-8 hex encoding 处理特殊字符：%22=双引号, %2B=+, %20=空格。如达上限需升级 license 或清理过期条目 | 🔵 6.5 | [MS Learn] |
