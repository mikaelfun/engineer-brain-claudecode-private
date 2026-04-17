# EOP 外部 IP 黑名单 (Spamhaus/DNSBL) 与 Delist - Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Connection-Filter-Spamhaus.md, ado-wiki-a-Reverse-DNS.md, ado-wiki-a-delist-microsoft-ips.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Sender IP flagged by Spamhaus
> Source: onenote

**Symptom**: Emails rejected because sender IP address is listed on Spamhaus blocklist (CSS/SBL)
**Root Cause**: Sender IP flagged by Spamhaus CSS for suspicious behavior (e.g. Anonymous tag in message header, spam-like sending patterns)

1. Contact Spamhaus CSS team: 1) Go to https://contact-center.spamhaus.org/ select Other questions
2. 2) Provide IP list, business justification, request temporary whitelisting
3. 3) Email css-mmxvi@spamhaus.org for follow-up
4. PG contact: jdellapina@microsoft.com
5. expect 24hr response with case ID

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 2: Mail server HELO domain A
> Source: onenote

**Symptom**: Sending IP blocked by Spamhaus due to DNS configuration issues - HELO greeting does not match sending IP, missing PTR record
**Root Cause**: Mail server HELO domain A record does not resolve to the actual sending IP; missing reverse DNS (PTR) record; HELO/EHLO and PTR must be aligned for mail server identity verification

1. Align HELO/EHLO hostname with DNS: 1) A record of HELO domain must point to sending IP
2. 2) PTR record of sending IP must resolve back to HELO domain
3. 3) Follow https://learn.microsoft.com/en-us/azure/dns/dns-reverse-dns-for-azure-services for PTR setup
4. 4) After DNS fix, request Spamhaus delist via contact-center.spamhaus.org

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 3: Microsoft outbound IP address listed
> Source: ado-wiki

**Symptom**: Outbound email from Microsoft/MDO servers blocked by recipient; SMTP rejection references DNSBL/blocklist for Microsoft IP
**Root Cause**: Microsoft outbound IP address listed on a third-party DNS-based blocklist (DNSBL). May be from HRDP (High-Risk Delivery Pool) or clean pool.

1. 1. Confirm block is for Microsoft IP from actual SMTP response (not MXToolbox)
2. 2. Check if IP is in HRDP
3. 3. Verify current listing status on the DNSBL lookup site
4. 4. If supported DNSBL, pass to FTE queue for delisting
5. if unsupported, escalate to engineering.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 4: IP Allow List does NOT
> Source: ado-wiki

**Symptom**: IP on Allow List but still blocked by Spamhaus
**Root Cause**: IP Allow List does NOT override Spamhaus. Neither Allow List nor Transport Rules help.

1. Customer must delist from Spamhaus directly. For critical enterprise, temporary Manual List override possible.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 5: Connection Filter does not bypass
> Source: ado-wiki

**Symptom**: IP on Allow List but rejected by Microsoft internal services block list
**Root Cause**: Connection Filter does not bypass internal block list even with IP Allow.

1. Sender must delist via https://sender.office.com.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 6: Macro-enabled Excel attachments (.xlsm) sent
> Source: onenote

**Symptom**: Outbound IPs repeatedly listed by Spamhaus daily despite delisting - multi-IP binding with one domain, delisting attempts frequently fail
**Root Cause**: Macro-enabled Excel attachments (.xlsm) sent to large recipient lists trigger Spamhaus spamtrap detection; after initial reputation degradation, missing PTR records prevent successful delisting; Sp...

1. 1) Stop sending macro-enabled attachments externally (use compressed+password-protected delivery if unavoidable)
2. 2) Configure PTR records for ALL outbound IPs
3. 3) Implement SPF/DKIM/DMARC
4. 4) Note: Spamhaus delisting requirements may not reflect original blocking reason - address root cause first
5. 5) Spamhaus does NOT support whitelisting

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8/10 - [OneNote]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Emails rejected because sender IP address is listed on Sp... | Sender IP flagged by Spamhaus | -> Phase 1 |
| Sending IP blocked by Spamhaus due to DNS configuration i... | Mail server HELO domain A | -> Phase 2 |
| Outbound email from Microsoft/MDO servers blocked by reci... | Microsoft outbound IP address listed | -> Phase 3 |
| IP on Allow List but still blocked by Spamhaus | IP Allow List does NOT | -> Phase 4 |
| IP on Allow List but rejected by Microsoft internal servi... | Connection Filter does not bypass | -> Phase 5 |
| Outbound IPs repeatedly listed by Spamhaus daily despite ... | Macro-enabled Excel attachments (.xlsm) sent | -> Phase 6 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Emails rejected because sender IP address is listed on Spamhaus blocklist (CS... | Sender IP flagged by Spamhaus CSS for suspicious behavior... | Contact Spamhaus CSS team: 1) Go to https://contact-center.spamhaus.org/ sele... | 🟢 9 | [OneNote] |
| 2 | Sending IP blocked by Spamhaus due to DNS configuration issues - HELO greetin... | Mail server HELO domain A record does not resolve to the ... | Align HELO/EHLO hostname with DNS: 1) A record of HELO domain must point to s... | 🟢 9 | [OneNote] |
| 3 | Outbound email from Microsoft/MDO servers blocked by recipient; SMTP rejectio... | Microsoft outbound IP address listed on a third-party DNS... | 1. Confirm block is for Microsoft IP from actual SMTP response (not MXToolbox... | 🟢 8.5 | [ADO Wiki] |
| 4 | IP on Allow List but still blocked by Spamhaus | IP Allow List does NOT override Spamhaus. Neither Allow L... | Customer must delist from Spamhaus directly. For critical enterprise, tempora... | 🟢 8.5 | [ADO Wiki] |
| 5 | IP on Allow List but rejected by Microsoft internal services block list | Connection Filter does not bypass internal block list eve... | Sender must delist via https://sender.office.com. | 🟢 8.5 | [ADO Wiki] |
| 6 | Outbound IPs repeatedly listed by Spamhaus daily despite delisting - multi-IP... | Macro-enabled Excel attachments (.xlsm) sent to large rec... | 1) Stop sending macro-enabled attachments externally (use compressed+password... | 🟢 8 | [OneNote] |
