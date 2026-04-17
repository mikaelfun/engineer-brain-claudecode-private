# Purview DLP 策略与告警 -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Drafts fused**: 3 | **Kusto queries fused**: 2
**Source drafts**: [mslearn-dlp-policy-tip-har-diagnostic.md](..\guides/drafts/mslearn-dlp-policy-tip-har-diagnostic.md), [onenote-dlp-blocked-email-jarvis.md](..\guides/drafts/onenote-dlp-blocked-email-jarvis.md), [onenote-dlp-sharepoint-rule-match-jarvis.md](..\guides/drafts/onenote-dlp-sharepoint-rule-match-jarvis.md)
**Kusto references**: [dlm-policy-sync.md](../../kusto/purview/references/queries/dlm-policy-sync.md), [dlp-jarvis-urls.md](../../kusto/purview/references/queries/dlp-jarvis-urls.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: mslearn-dlp-policy-tip-har-diagnostic.md

1. DLP Policy Tip HAR Diagnostic Guide `[source: mslearn-dlp-policy-tip-har-diagnostic.md]`
2. When to Use `[source: mslearn-dlp-policy-tip-har-diagnostic.md]`
3. How It Works `[source: mslearn-dlp-policy-tip-har-diagnostic.md]`
4. The text typed by the user `[source: mslearn-dlp-policy-tip-har-diagnostic.md]`
5. The recipients of the email `[source: mslearn-dlp-policy-tip-har-diagnostic.md]`
6. The DLP policies that apply `[source: mslearn-dlp-policy-tip-har-diagnostic.md]`
7. Diagnostic Steps `[source: mslearn-dlp-policy-tip-har-diagnostic.md]`
8. Step 1: Collect HAR Trace `[source: mslearn-dlp-policy-tip-har-diagnostic.md]`
9. Open browser Developer Tools (F12) `[source: mslearn-dlp-policy-tip-har-diagnostic.md]`
10. Go to Network tab, enable "Preserve log" `[source: mslearn-dlp-policy-tip-har-diagnostic.md]`

### Phase 2: Data Collection (KQL)

```kusto
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let timediff_minutes = datetime_diff('minute', endtime, starttime);
let policy_sync_log = iff(isempty(tenantid), "Need a tenant ID to fullfil geneva link",
    strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", starttime,
           "&offset=", timediff_minutes,
           '&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=UnifiedPolicyMonitoringInfoLogEvent&conditions=[["TenantId","%3D%3D","', tenantid,
           '"],["ClientCorrelationId","contains","', correlationid,
           '"]]&kqlClientQuery=source%0A|%20project%20env_time,%20activityId,%20operationId,%20ObjectId,%20Workload,%20PolicyScenario%20,ClientCorrelationId,%20Stage,%20Status,%20CustomData,%20Latency%0A|%20extend%20Pipeline%20%3D%20iif(ObjectId%20%3D%3D%20"00000000-0000-0000-0000-000000000000",%20"FileSync",%20"ObjectSync")'));
print policy_sync_log
```
`[tool: Kusto skill -- dlm-policy-sync.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| DLP policy with China Resident Identity Card (PRC) SIT at High confidence does n... | Built-in China Resident Identity Card SIT has two patterns: ... | Set DLP policy instance confidence level to Medium instead of High if you want t... |
| DLP policy tips not showing in Outlook/OWA despite policy being configured | Multiple causes: policy status mismatch (shows Test it out f... | 1) Ensure only one rule per SIT instance count. 2) Enable MailTips: Outlook > Op... |
| Endpoint DLP policy not syncing to device: configuration status shows Not update... | Microsoft Defender Antivirus always-on protection or behavio... | 1) Check device configuration in Purview portal > Settings > Device onboarding >... |

`[conclusion: 🔵 7.5/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | DLP policy with China Resident Identity Card (PRC) SIT at High confidence does not trigger - only 18... | Built-in China Resident Identity Card SIT has two patterns: Pattern 1 (High conf... | Set DLP policy instance confidence level to Medium instead of High if you want to detect bare 18-dig... | 🔵 7.5 | MCVKB/Sensitive information type_ China Resident Identit.md |
| 2 | DLP policy tips not showing in Outlook/OWA despite policy being configured | Multiple causes: policy status mismatch (shows Test it out first), duplicate rul... | 1) Ensure only one rule per SIT instance count. 2) Enable MailTips: Outlook > Options > Mail > MailT... | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/data-loss-prevention/data-loss-prevention-policy-tips) |
| 3 | Endpoint DLP policy not syncing to device: configuration status shows Not updated or Not available | Microsoft Defender Antivirus always-on protection or behavior monitoring not ena... | 1) Check device configuration in Purview portal > Settings > Device onboarding > Devices. 2) Enable ... | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/purview/dlp-edlp-tshoot-sync) |