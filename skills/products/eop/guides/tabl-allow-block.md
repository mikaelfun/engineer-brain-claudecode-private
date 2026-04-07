# EOP 租户允许/阻止列表 (TABL) 管理 - Quick Reference

**Entries**: 10 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Admin unable to add entries to TABL; error or option not available | Missing RBAC or URBAC permissions; Exchange Online Permis... | Verify RBAC permissions. Ensure RBAC or URBAC assigned and EXO Permissions en... | 🔵 7.5 | [ADO Wiki] |
| 2 📋 | URL in TABL but email not blocked/allowed as expected | Incorrect URL entry syntax, especially wildcard usage | Check URL syntax matches valid scenarios. Review wildcard usage per docs. | 🔵 7.5 | [ADO Wiki] |
| 3 📋 | Spoofed sender entries in TABL appear to save but do not persist | Multiple HostedConnectionFilterPolicies; spoof entries on... | Set first policy isDefault=true, delete second policy, re-add entries. | 🔵 7.5 | [ADO Wiki] |
| 4 📋 | Spoofed sender pair in TABL not effective unless using subdomain as infrastru... | Infrastructure domain must match PTR record for connectin... | Use PTR Organization Domain. ping -a <IP> or resolve-dnsname. If PTR=smtp.inb... | 🔵 7.5 | [ADO Wiki] |
| 5 📋 | TABL sender allow/block not working for internal (intra-org) emails | TABL sender allow/block not enabled on IntraOrg messages ... | By design. Use Exchange transport rules for internal mail filtering instead. | 🔵 7.5 | [ADO Wiki] |
| 6 📋 | Cannot add IPv4 address to TABL; only IPv6 accepted | TABL only supports IPv6; IPv4 not supported | Use default connection filter policy for IPv4 addresses. | 🔵 7.5 | [ADO Wiki] |
| 7 📋 | 将域名/邮件地址添加到 TABL Block 后，组织内用户也无法向该域发邮件，收到 NDR 550 5.7.703 | By design：TABL Domains & email addresses 的 Block 条目同时阻止入站... | 如只需阻止入站，使用 anti-spam policy 的 blocked sender/domain list 而非 TABL | 🔵 7.5 | [MS Learn] |
| 8 📋 | TABL 中的 Allow 条目自动消失，触发 alert Removed an entry in Tenant Allow/Block List | Allow entries 自动过期：domains/emails/files/URLs 在过滤系统判定实体安全后... | 如仍需 allow 重新创建。建议通过 Admin Submission 创建 allow 条目以获更持久效果。定期检查 allow 条目状态 | 🔵 7.5 | [MS Learn] |
| 9 📋 | URL 添加到 TABL Allow 后过滤判定被覆盖（允许投递），但 Safe Links 仍然重写该 URL | By design：TABL URL allow 覆盖 filtering verdict 但不阻止 Safe L... | 如不希望 URL 被 Safe Links 重写，需在 Safe Links policy 的 Do not rewrite the following ... | 🔵 7.5 | [MS Learn] |
| 10 📋 | 无法在 TABL 创建包含特殊字符（引号/加号/空格）的邮件地址条目报错，或达到条目数量上限 | 特殊字符需 UTF-8 hex encoding 否则报错。条目上限因 license 而异：无 MDO 1000... | UTF-8 hex encoding 处理特殊字符：%22=双引号, %2B=+, %20=空格。如达上限需升级 license 或清理过期条目 | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Verify RBAC permissions. Ensure RBAC or URBAC assigned and EXO Permissions enabled. `[ADO Wiki]`
2. Check URL syntax matches valid scenarios. Review wildcard usage per docs. `[ADO Wiki]`
3. Set first policy isDefault=true, delete second policy, re-add entries. `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/tabl-allow-block.md)
