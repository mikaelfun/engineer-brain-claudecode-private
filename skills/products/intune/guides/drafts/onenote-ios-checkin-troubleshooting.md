# iOS Device Check-in Troubleshooting Guide

> Source: Mooncake POD Support Notebook - iOS Check-in case studies (WV, Deloitte)

## Problem Overview

iOS devices fail to check-in via Company Portal, or Last Check-in time stops updating, causing compliance state not to refresh.

## Historical Cases

### WV Cases

| Case ID | Device ID | Date | Issue | Owner | Solution |
|---------|-----------|------|-------|-------|----------|
| 2512150030005387 | 6da604a8-... | 12/15, 12/17 | Last check-in time not updating | Jaime | Update Company Portal |
| 2601060030004300 | 98174a9c-... | 1/6 | Last check-in stuck on 2025.12.22, portal Sync has no effect | Qi | Update Company Portal |
| 2601130030003324 | c416fcb3-... | 1/9 | Last check-in stuck on 2025.12.14, compliance grace period expired but device still compliant | Daisy | Power saving mode |
| 2601280030001250 | 9af7a259-... | 1/28 | Check status fails with error, reinstall CP didn't help | Xi | Upgrade iOS to 26.3 |
| 2603040040000817 | - | 3/4 | Multiple devices non-compliant, can't login M365 | Daisy | Reinstall + restart |

### Deloitte Cases

| Case ID | Device ID | Date | Issue | Owner | Solution |
|---------|-----------|------|-------|-------|----------|
| 2601260030004360 | dd89e4f6-... | 01-18 ~ 01-31 | iOS 26.2 but portal shows 26.1, check status fails | Eric | Resolved itself |

## Step 1: Confirm Impact Scope

1. Confirm number of affected devices
2. If **multiple devices** affected:
   - Check if APN certificate expired or recently changed (if sync breaks uniformly)
   - Check emails sent to `wihotnot@microsoft.com` for IcM incidents
   - Verify if issue reproduces across same CP + iOS version combinations

## Step 2: Collect Diagnostics

| Info Type | Collection Method |
|-----------|-------------------|
| Intune Device ID | Intune Admin Portal |
| Outlook Diagnostic Log | Must include **Authenticator** and **Company Portal** logs |

## Step 3: Analyze Authenticator Logs

Check for **Power Saving Mode / Low Power Mode** entries:
- Look for "Power Saving Mode" or "Low Power Mode" in log
- Check if Company Portal logs show interruptions during impact timeframe

## Step 4: Query Intune Service Kusto Logs

Verify auto check-in (every 8 hours) responses:

> **Note**: Devices in sleep mode may not respond, so up to 8-hour delay is normal.

```kusto
let deviceid = "<Intune device id>";
let accountid = "<Account id>";
let starttime = datetime(YYYY-MM-DD);
let endtime = datetime(YYYY-MM-DD);
DeviceManagementProvider
| where env_time between (starttime .. endtime)
| where accountId == accountid
| where deviceId == deviceid
| where EventId == 5782  // TraceIOSCommandEvent
| project env_time
| order by env_time asc
| extend PrevTime = prev(env_time)
| extend GapHours = datetime_diff('hour', env_time, PrevTime)
| where isnotnull(PrevTime)
| project env_time, PrevTime, GapHours, GapDays = GapHours / 24.0
| order by env_time asc
```

### Result Interpretation

| GapHours | Assessment |
|----------|-----------|
| <= 8 hours | Normal |
| 8-24 hours | Possible background app restrictions |
| > 24 hours | Abnormal, needs further analysis |

**Conclusion from Step 3+4**: If power saving mode is on AND Kusto shows extended check-in gaps, the root cause is iOS limiting background app execution, delaying Intune check-in responses.

## Step 5: Root Cause Determination

| Scenario | Root Cause | Solution |
|----------|-----------|----------|
| Power saving mode ON + long check-in gaps | iOS restricts background app execution, delaying check-in responses | Disable power saving mode, or add Company Portal to background refresh whitelist |
| Logs show **Check-in Timeout** | Network issue (Intune service never received request) | Check network, proxy, firewall |
| Outdated Company Portal / iOS version | Compatibility issue | Update Company Portal and/or iOS |

## Historical Resolution Summary

| Pattern | Fix |
|---------|-----|
| Most common | Update Company Portal app |
| Power saving related | Disable Low Power Mode |
| Timeout scenario | Re-enroll device, or update iOS, then monitor |
| Persistent issue | Reset device if re-enrollment fails |

## Special Case: Timeout Scenario (Case 2601280030001250)

- **Symptom**: Logs show check-in **timeout**
- **Priority**: Network issue investigation (Intune service received no request)
- **Limitation**: Without iOS Console logs, cannot determine where request was sent
- **Recommendation**: Reproduce with iOS Console logs. For single device: try re-enrollment; if fails, reset device or update iOS first
