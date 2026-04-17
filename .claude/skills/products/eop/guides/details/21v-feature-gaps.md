# EOP 21Vianet/Gallatin 功能差异与限制 - Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: onenote-21v-eop-feature-gaps.md, onenote-21v-eop-readiness-portals.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Feature gap: Assist 365 diagnostic
> Source: onenote

**Symptom**: Assist 365 Spam Verdict Reason diagnostic tool returns no results for 21v (Gallatin) EOP tenants
**Root Cause**: Feature gap: Assist 365 diagnostic tool and tenant explorer do not support 21v Exchange Online tenants; Spam Verdict Reason tool is not available in Gallatin environment

1. Use alternative diagnostic methods for 21v: 1) EXO PowerShell (Connect-ExchangeOnline -ExchangeEnvironmentName o365china)
2. 2) Message trace in EAC portal (admin.exchange.microsoftonline.cn)
3. 3) Message header analysis (mha.azurewebsites.net or mxtoolbox.com/EmailHeaders.aspx)
4. 4) X-Forefront-Antispam-Report header for spam verdict

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 2: 21v/Gallatin environment does not support
> Source: onenote

**Symptom**: Assist 365 SPAM Verdict Reason diagnostic tool and tenant explorer not available for 21v (Gallatin) EXO tenants - cannot use automated diagnostics to look up spam filter rule details
**Root Cause**: 21v/Gallatin environment does not support Assist 365 diagnostic tools; tenant explorer is unavailable in sovereign cloud

1. Manually inspect X-Forefront-Antispam-Report header from message headers to get SFS rule IDs
2. look up rule definitions in IPAntispamRule git repo (o365exchange.visualstudio.com/O365 Core/_git/IPAntispamRule)
3. search processorID for detailed condition/action definitions

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 3: 21V Gallatin environment lacks backend
> Source: onenote

**Symptom**: User reported settings page visible in 21V SCC portal but backend infrastructure unavailable - settings cannot be saved or used
**Root Cause**: 21V Gallatin environment lacks backend infrastructure for user reported settings feature; UI page not disabled despite backend unavailability (Bug 5529973); no ETA for fix as no funding allocated t...

1. Inform customer this is a known UI bug in 21V - the feature is not available
2. reference Bug 5529973
3. no workaround - user reported message submission not supported in 21V

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8/10 - [OneNote]]`

### Phase 4: Quarantine API not supported in
> Source: onenote

**Symptom**: Cannot access quarantine messages via API in 21V (Gallatin) - Quarantine API not available; MessageTrace API requires specific 21V endpoint and permissions
**Root Cause**: Quarantine API not supported in 21V environment (pending PG - Issue 4866394); MessageTrace reporting API available but requires Exchange Administrator role on the app registration and 21V-specific ...

1. Use MessageTrace Report API: 1) Register app in Azure AD, assign Exchange administrator role
2. 2) Get token: POST https://login.chinacloudapi.cn/{tenantID}/oauth2/v2.0/token with scope https://partner.outlook.cn/.default
3. 3) GET https://partner.outlook.cn/ecp/reportingwebservice/reporting.svc/MessageTrace
4. 4) Filter by date: $filter=(StartDate eq datetime'YYYY-MM-DD') and (EndDate eq datetime'YYYY-MM-DD')
5. 5) Pagination: $top=2000&$skiptoken=2000
6. Quarantine API: track Issue 4866394

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8/10 - [OneNote]]`

### Phase 5: Button availability depends on client
> Source: ado-wiki

**Symptom**: Report Message or Report Phishing button missing or not working in Outlook
**Root Cause**: Button availability depends on client type (Outlook Desktop vs OWA) and admin configuration in Microsoft 365 admin center; messaging policy settings may not be applied correctly

1. 1) Confirm admin has configured Report Message correctly in admin center. 2) Determine scope by client: Missing in Desktop only but works in OWA -> Outlook Desktop team. Missing in OWA only -> Exchange Online team. Missing or working in all clients -> MDO scope. 3) Note: reporting not available on mobile clients or shared channels (known limitations).

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Assist 365 Spam Verdict Reason diagnostic tool returns no... | Feature gap: Assist 365 diagnostic | -> Phase 1 |
| Assist 365 SPAM Verdict Reason diagnostic tool and tenant... | 21v/Gallatin environment does not support | -> Phase 2 |
| User reported settings page visible in 21V SCC portal but... | 21V Gallatin environment lacks backend | -> Phase 3 |
| Cannot access quarantine messages via API in 21V (Gallati... | Quarantine API not supported in | -> Phase 4 |
| Report Message or Report Phishing button missing or not w... | Button availability depends on client | -> Phase 5 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Assist 365 Spam Verdict Reason diagnostic tool returns no results for 21v (Ga... | Feature gap: Assist 365 diagnostic tool and tenant explor... | Use alternative diagnostic methods for 21v: 1) EXO PowerShell (Connect-Exchan... | 🟢 9 | [OneNote] |
| 2 | Assist 365 SPAM Verdict Reason diagnostic tool and tenant explorer not availa... | 21v/Gallatin environment does not support Assist 365 diag... | Manually inspect X-Forefront-Antispam-Report header from message headers to g... | 🟢 9 | [OneNote] |
| 3 | User reported settings page visible in 21V SCC portal but backend infrastruct... | 21V Gallatin environment lacks backend infrastructure for... | Inform customer this is a known UI bug in 21V - the feature is not available;... | 🟢 8 | [OneNote] |
| 4 | Cannot access quarantine messages via API in 21V (Gallatin) - Quarantine API ... | Quarantine API not supported in 21V environment (pending ... | Use MessageTrace Report API: 1) Register app in Azure AD, assign Exchange adm... | 🟢 8 | [OneNote] |
| 5 | Report Message or Report Phishing button missing or not working in Outlook | Button availability depends on client type (Outlook Deskt... | 1) Confirm admin has configured Report Message correctly in admin center. 2) ... | 🔵 7.5 | [ADO Wiki] |
