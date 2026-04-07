# EOP IP 限流与信誉阻止 (4.7.500/5.7.708/AS codes) - Comprehensive Troubleshooting Guide

**Entries**: 15 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Connection-Filter-Spamhaus.md, ado-wiki-a-delist-microsoft-ips.md, ado-wiki-a-ip-throttle-override-gcc.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Sending IP address throttled by
> Source: onenote

**Symptom**: Emails rejected with NDR 4.7.500 Server busy or 5.7.708 with various AS codes (AS77712/AS77713/AS780082/AS780090/AS71721/AS63/AS66)
**Root Cause**: Sending IP address throttled by EOP real-time reputation system due to poor reputation or lack of reputation (new IP hydration)

1. Run Release Tenant IP Server Busy diagnostic in EOP Diagnostics to whitelist IP for up to 30 days
2. check IP spam percentage via EOP IP Health Diagnostic
3. for AS112201 codes escalate to engineering (diagnostic will not work)

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 2: New sending IP has no
> Source: onenote

**Symptom**: Slow mail delivery to EXO after batch resend from gateway - new sending IP gets deferred with 452 4.5.3 Too many recipients (AS780090) and 451 4.7.500 Access denied, emails delayed 54+ minutes
**Root Cause**: New sending IP has no reputation in EOP; batch resending 25000+ emails triggers aggressive throttling; messages attributed to default inbound connector have much lower throughput limits than dedica...

1. PG adds new IP to allowlist for 1 month to build reputation via ICM
2. ensure messages are attributed to a dedicated Inbound Connector (check RECEIVE line in Extended Message Trace)
3. run Release Tenant IP Server Busy diagnostic
4. avoid mass batch resend - use gradual sending

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 3: Known throttling bug in EOP
> Source: ado-wiki

**Symptom**: Inbound email throttled with 451 4.7.500 Access denied AS112201
**Root Cause**: Known throttling bug in EOP service (Bug 3397879). Long-term fix in progress.

1. Escalate to MDO Escalations team to add tenant to override list. Do NOT add tenant to the engineering work item directly.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 4: Low-reputation IP, typically new customers.
> Source: ado-wiki

**Symptom**: NDR 5.7.708 - IP blocked, traffic not accepted
**Root Cause**: Low-reputation IP, typically new customers.

1. Verify no spam. Release Tenant IP diagnostic.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 5: Source IP changed sending patterns
> Source: ado-wiki

**Symptom**: NDR 4.7.500 - Server busy, gray-listed
**Root Cause**: Source IP changed sending patterns drastically. Probation period.

1. Configure Inbound connector. Release Tenant IP Server Busy diagnostic (14-day exclusion).

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 6: IP banned: degraded reputation, compromise,
> Source: ado-wiki

**Symptom**: NDR 5.7.606-649 - Sender IP banned
**Root Cause**: IP banned: degraded reputation, compromise, or malicious traffic.

1. Self-delist via sender.office.com. If 24h fail, escalate to Antispam Engineering.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 7: Microsoft requires investigation. Delist portal
> Source: ado-wiki

**Symptom**: NDR 5.7.511 - Sender IP banned, self-delist NOT available
**Root Cause**: Microsoft requires investigation. Delist portal unavailable for 5.7.511.

1. Forward full NDR to delist@microsoft.com. 48h response. Escalate with full history if needed.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 8: Sender IP (e.g. 139.219.17.x China
> Source: onenote

**Symptom**: Outbound emails rejected with NDR 550 5.0.350 Address rejected due to sender IP poor reputation
**Root Cause**: Sender IP (e.g. 139.219.17.x China IPs) has poor reputation score in EOP/MDO reputation system

1. File FP escalation via Assist 365 with sender IP and NDR details
2. request IP reputation review and whitelisting
3. Enterprise: EEE uses Get-ManualList to check/add to override list
4. Consumer (hotmail/live/outlook.com): whitelist IP in Surfer/KEStudio

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8/10 - [OneNote]]`

### Phase 9: Transport layer back pressure (not
> Source: onenote

**Symptom**: 451 4.7.500 Access denied without AS code in response - back pressure message not from MDO antispam layer
**Root Cause**: Transport layer back pressure (not MDO/antispam); no AS code behind the 4.7.500 means it originates from Exchange transport, not EOP filtering; typically caused by server load during high-volume se...

1. If no AS code present, this is transport-layer back pressure, not MDO throttling - Release Tenant IP diagnostic will NOT help
2. sending server should implement retry logic (400-series = retry in same SMTP session)
3. if persistent, escalate to Exchange transport engineering via ICM

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8/10 - [OneNote]]`

### Phase 10: 源 IP 发送模式突变（发送量远超历史模式），触发 EOP graylisting/IP
> Source: mslearn

**Symptom**: 发件人收到 NDR 451 4.7.500-699 (ASxxx) 错误，邮件被退回
**Root Cause**: 源 IP 发送模式突变（发送量远超历史模式），触发 EOP graylisting/IP throttling 机制

1. 配置 EOP inbound connector 标识可信发件服务器：1) on-prem relay 场景配置 connector from email server to M365
2. 2) 第三方服务场景配置 secure mail flow connector。新发件人需要建立发送历史后自动恢复。不建议从 onmicrosoft.com 域发送大量邮件

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 11: 发件人源 IP 被 Microsoft 365
> Source: mslearn

**Symptom**: 外部发件人向 M365 收件人发邮件被退回，收到 NDR 550 5.7.606-649 Access denied, banned sending IP
**Root Cause**: 发件人源 IP 被 Microsoft 365 blocked senders list 列入黑名单，可能因发送垃圾邮件、钓鱼邮件或被入侵发送恶意邮件

1. 1) 访问 Office 365 Anti-Spam IP Delist Portal (https://sender.office.com/)
2. 2) 输入收到 NDR 的邮箱地址和被封锁的 IP 地址
3. 3) 提交后查收确认邮件并点击确认链接
4. 4) 在 portal 中选择 Delist IP
5. 5) 解除后最多 24 小时生效
6. 6) 确保后续邮件不含恶意内容否则会再次被封

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 12: Microsoft 需要对该 IP 的邮件流量进行额外调查，常见于严重违规或反复被封锁的 IP
> Source: mslearn

**Symptom**: 外部发件人收到 NDR 550 5.7.511 Access denied, banned sender，无法使用 delist portal 自助解除
**Root Cause**: Microsoft 需要对该 IP 的邮件流量进行额外调查，常见于严重违规或反复被封锁的 IP 地址

1. 1) 将收到的完整 NDR（包含错误代码和 IP 地址）转发到 delist@microsoft.com
2. 2) Microsoft 将在 48 小时内联系提供后续步骤
3. 3) 不能使用 https://sender.office.com/ 自助解除

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 13: Microsoft 365 从源 IP 检测到可疑活动，对该
> Source: mslearn

**Symptom**: 外部发件人邮件被临时拒绝，收到 451 4.7.550 Access denied, please try again later
**Root Cause**: Microsoft 365 从源 IP 检测到可疑活动，对该 IP 实施临时限流（throttling），邮件在评估期间被暂缓接收

1. 1) 这是临时限制，Microsoft 评估完成后会自动解除
2. 2) 发件人应检查是否有异常发送行为（账户被入侵、配置错误导致循环发送等）
3. 3) 确保 DNS 反向解析（PTR 记录）正确配置
4. 4) 避免使用私有 IP 地址范围（192.168.x.x, 10.x.x.x, 172.16-31.x.x）

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 14: 发件人 IP 同时被添加到了 inbound connector
> Source: mslearn

**Symptom**: 外部邮件服务器发邮件被拒绝，收到 NDR 5.7.1 Unable To Relay: Blocked by Customer Allow list，但 NDR 中未显示具体 blocklist 名称
**Root Cause**: 发件人 IP 同时被添加到了 inbound connector 和 Connection Filtering 的 IP Allow List 中。当 IP 同时存在于 connector 和 IP Allow List 时，如果该 IP 被某个 RBL (real-time blocklist) 列入，NDR 不会显示具体的 blocklist 名称

1. 1) 从 Connection Filtering 的 IP Allow List 中移除该外部邮件服务器的 IP
2. 2) 移除后再次发送测试邮件，此时 NDR 会包含具体的 blocklist 名称
3. 3) 根据 blocklist 名称联系对应的 RBL 提供商申请解除
4. 4) 最佳实践：仅将 on-premises IP 添加到 connector 设置中，不要同时添加到 IP Allow List

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 15: 发件人的源邮件服务器 IP 地址被列入 Microsoft 的
> Source: mslearn

**Symptom**: 外部发件人收到 NDR 5.7.1 Service unavailable; Client host [IP] blocked using Blocklist 1，邮件被 EOP 拒绝
**Root Cause**: 发件人的源邮件服务器 IP 地址被列入 Microsoft 的 IP blocklist（通常因为该 IP 此前发送了垃圾邮件或恶意邮件）

1. 发件人将 NDR 完整邮件转发到 delist@microsoft.com 请求移除。也可使用 delist portal (https://sender.office.com) 自助提交移除请求。Admin 侧可检查 Connection filter policy 是否有 IP Allow List 覆盖

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Emails rejected with NDR 4.7.500 Server busy or 5.7.708 w... | Sending IP address throttled by | -> Phase 1 |
| Slow mail delivery to EXO after batch resend from gateway... | New sending IP has no | -> Phase 2 |
| Inbound email throttled with 451 4.7.500 Access denied AS... | Known throttling bug in EOP | -> Phase 3 |
| NDR 5.7.708 - IP blocked, traffic not accepted | Low-reputation IP, typically new customers. | -> Phase 4 |
| NDR 4.7.500 - Server busy, gray-listed | Source IP changed sending patterns | -> Phase 5 |
| NDR 5.7.606-649 - Sender IP banned | IP banned: degraded reputation, compromise, | -> Phase 6 |
| NDR 5.7.511 - Sender IP banned, self-delist NOT available | Microsoft requires investigation. Delist portal | -> Phase 7 |
| Outbound emails rejected with NDR 550 5.0.350 Address rej... | Sender IP (e.g. 139.219.17.x China | -> Phase 8 |
| 451 4.7.500 Access denied without AS code in response - b... | Transport layer back pressure (not | -> Phase 9 |
| 发件人收到 NDR 451 4.7.500-699 (ASxxx) 错误，邮件被退回 | 源 IP 发送模式突变（发送量远超历史模式），触发 EOP graylisting/IP | -> Phase 10 |
| 外部发件人向 M365 收件人发邮件被退回，收到 NDR 550 5.7.606-649 Access denie... | 发件人源 IP 被 Microsoft 365 | -> Phase 11 |
| 外部发件人收到 NDR 550 5.7.511 Access denied, banned sender，无法使用... | Microsoft 需要对该 IP 的邮件流量进行额外调查，常见于严重违规或反复被封锁的 IP | -> Phase 12 |
| 外部发件人邮件被临时拒绝，收到 451 4.7.550 Access denied, please try aga... | Microsoft 365 从源 IP 检测到可疑活动，对该 | -> Phase 13 |
| 外部邮件服务器发邮件被拒绝，收到 NDR 5.7.1 Unable To Relay: Blocked by Cu... | 发件人 IP 同时被添加到了 inbound connector | -> Phase 14 |
| 外部发件人收到 NDR 5.7.1 Service unavailable; Client host [IP] b... | 发件人的源邮件服务器 IP 地址被列入 Microsoft 的 | -> Phase 15 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Emails rejected with NDR 4.7.500 Server busy or 5.7.708 with various AS codes... | Sending IP address throttled by EOP real-time reputation ... | Run Release Tenant IP Server Busy diagnostic in EOP Diagnostics to whitelist ... | 🟢 9 | [OneNote] |
| 2 | Slow mail delivery to EXO after batch resend from gateway - new sending IP ge... | New sending IP has no reputation in EOP; batch resending ... | PG adds new IP to allowlist for 1 month to build reputation via ICM; ensure m... | 🟢 9 | [OneNote] |
| 3 | Inbound email throttled with 451 4.7.500 Access denied AS112201 | Known throttling bug in EOP service (Bug 3397879). Long-t... | Escalate to MDO Escalations team to add tenant to override list. Do NOT add t... | 🟢 8.5 | [ADO Wiki] |
| 4 | NDR 5.7.708 - IP blocked, traffic not accepted | Low-reputation IP, typically new customers. | Verify no spam. Release Tenant IP diagnostic. | 🟢 8.5 | [ADO Wiki] |
| 5 | NDR 4.7.500 - Server busy, gray-listed | Source IP changed sending patterns drastically. Probation... | Configure Inbound connector. Release Tenant IP Server Busy diagnostic (14-day... | 🟢 8.5 | [ADO Wiki] |
| 6 | NDR 5.7.606-649 - Sender IP banned | IP banned: degraded reputation, compromise, or malicious ... | Self-delist via sender.office.com. If 24h fail, escalate to Antispam Engineer... | 🟢 8.5 | [ADO Wiki] |
| 7 | NDR 5.7.511 - Sender IP banned, self-delist NOT available | Microsoft requires investigation. Delist portal unavailab... | Forward full NDR to delist@microsoft.com. 48h response. Escalate with full hi... | 🟢 8.5 | [ADO Wiki] |
| 8 | Outbound emails rejected with NDR 550 5.0.350 Address rejected due to sender ... | Sender IP (e.g. 139.219.17.x China IPs) has poor reputati... | File FP escalation via Assist 365 with sender IP and NDR details; request IP ... | 🟢 8 | [OneNote] |
| 9 | 451 4.7.500 Access denied without AS code in response - back pressure message... | Transport layer back pressure (not MDO/antispam); no AS c... | If no AS code present, this is transport-layer back pressure, not MDO throttl... | 🟢 8 | [OneNote] |
| 10 | 发件人收到 NDR 451 4.7.500-699 (ASxxx) 错误，邮件被退回 | 源 IP 发送模式突变（发送量远超历史模式），触发 EOP graylisting/IP throttling 机制 | 配置 EOP inbound connector 标识可信发件服务器：1) on-prem relay 场景配置 connector from email... | 🔵 7.5 | [MS Learn] |
| 11 | 外部发件人向 M365 收件人发邮件被退回，收到 NDR 550 5.7.606-649 Access denied, banned sending IP | 发件人源 IP 被 Microsoft 365 blocked senders list 列入黑名单，可能因发送垃... | 1) 访问 Office 365 Anti-Spam IP Delist Portal (https://sender.office.com/); 2) ... | 🔵 6.5 | [MS Learn] |
| 12 | 外部发件人收到 NDR 550 5.7.511 Access denied, banned sender，无法使用 delist portal 自助解除 | Microsoft 需要对该 IP 的邮件流量进行额外调查，常见于严重违规或反复被封锁的 IP 地址 | 1) 将收到的完整 NDR（包含错误代码和 IP 地址）转发到 delist@microsoft.com; 2) Microsoft 将在 48 小时内联... | 🔵 6.5 | [MS Learn] |
| 13 | 外部发件人邮件被临时拒绝，收到 451 4.7.550 Access denied, please try again later | Microsoft 365 从源 IP 检测到可疑活动，对该 IP 实施临时限流（throttling），邮件在评... | 1) 这是临时限制，Microsoft 评估完成后会自动解除; 2) 发件人应检查是否有异常发送行为（账户被入侵、配置错误导致循环发送等）; 3) 确保 ... | 🔵 6.5 | [MS Learn] |
| 14 | 外部邮件服务器发邮件被拒绝，收到 NDR 5.7.1 Unable To Relay: Blocked by Customer Allow list，但 ... | 发件人 IP 同时被添加到了 inbound connector 和 Connection Filtering 的... | 1) 从 Connection Filtering 的 IP Allow List 中移除该外部邮件服务器的 IP; 2) 移除后再次发送测试邮件，此时 ... | 🔵 6.5 | [MS Learn] |
| 15 | 外部发件人收到 NDR 5.7.1 Service unavailable; Client host [IP] blocked using Blockli... | 发件人的源邮件服务器 IP 地址被列入 Microsoft 的 IP blocklist（通常因为该 IP 此前发... | 发件人将 NDR 完整邮件转发到 delist@microsoft.com 请求移除。也可使用 delist portal (https://sender... | 🔵 6.5 | [MS Learn] |
