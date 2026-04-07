# Defender for Cloud Apps - Anomaly Detection Alert Investigation Guide

> **Source**: [Microsoft Learn - How to investigate anomaly detection alerts](https://learn.microsoft.com/defender-cloud-apps/investigate-anomaly-alerts)
> **Type**: Investigation guide (Track B - guide-draft)
> **Product**: Defender for Cloud Apps (CASB)
> **Date**: 2026-04-05

## Overview

Microsoft Defender for Cloud Apps provides anomaly detection alerts using machine learning. Alerts are non-deterministic and triggered only when behavior deviates from learned baselines. Most detections have a 7-day learning period.

> **Important**: Starting June 2025, legacy anomaly detection policies are being transitioned to a dynamic threat detection model. Legacy policies will be disabled from the Policy Management page.

## Alert Classification Framework

| Classification | Meaning | Action |
|---|---|---|
| **TP** (True Positive) | Confirmed malicious activity | Suspend user, reset password, investigate scope |
| **B-TP** (Benign True Positive) | Suspicious but not malicious (e.g., pen test) | Dismiss alert |
| **FP** (False Positive) | Non-malicious activity | Dismiss alert |

## General Investigation Steps

1. Review all user activities to understand potential threat scope
2. Compare device information with known devices (OS, browser, IP, location)
3. Check for other indicators of compromise (IoC)

## Alerts by MITRE ATT&CK Tactic

### Initial Access

| Alert | Description | Key Investigation |
|---|---|---|
| **Activity from anonymous/TOR IP** | Activity from anonymous proxy IP | Check if user legitimately uses anonymous IPs (e.g., security analyst) |
| **Activity from infrequent country** | Activity from unusual geographic location | Verify if user is traveling; create frequent traveler group to exclude |
| **Activity from suspicious IP** | Access from IP flagged by Threat Intelligence | Confirm activity wasn't by legitimate user; review activity log for that IP |
| **Impossible Travel** | Same user active in two distant locations within impossible timeframe | Check for VPN usage (tag VPN IPs in MCAS); verify corporate IP tagging |
| **Misleading OAuth app name** | App uses foreign chars resembling Latin letters | Review permissions requested; ban if confirmed malicious |

### Execution

| Alert | Description | Key Investigation |
|---|---|---|
| **Multiple storage deletion** | Unusual cloud storage/DB deletions (Azure Blob, S3, Cosmos DB) | Contact user to confirm; check for breach indicators |
| **Multiple VM creation** | Unusual VM creation count vs baseline | Possible crypto mining; suspend user if unauthorized |
| **Suspicious creation in unusual region** | Resource creation in uncommon cloud region | Check if legitimate admin activity |

### Persistence

| Alert | Description | Key Investigation |
|---|---|---|
| **Activity by terminated user** | Terminated employee still accessing resources | Cross-reference HR records; disable all accounts; decommission access |
| **CloudTrail logging changes** | Suspicious changes to AWS CloudTrail | Reverse CloudTrail changes; check what was done while logging was off |
| **Suspicious email deletion** | Hard-delete of emails from unusual connection | Check for inbox forwarding rules; look for hidden rules |
| **Suspicious inbox manipulation** | Rules created to delete/move messages | Check SMTP forwarding rules; review delegated access |

### Privilege Escalation

| Alert | Description | Key Investigation |
|---|---|---|
| **Unusual admin activity** | Uncommon administrative actions by user | Confirm admin wasn't authorized; review config changes |

### Credential Access

| Alert | Description | Key Investigation |
|---|---|---|
| **Multiple failed logins** | Unusual failed sign-in attempts vs baseline | Check if MFA is working; look for brute force patterns |
| **Unusual OAuth credential addition** | Privileged credentials added to OAuth app | App may be compromised; revoke access tokens |
| **Unusual ISP for OAuth app** | OAuth app connecting from unusual ISP | Revoke tokens if confirmed unauthorized |

### Collection / Exfiltration

| Alert | Description | Key Investigation |
|---|---|---|
| **Multiple Power BI report sharing** | Unusual report sharing volume | Remove sharing access; contact Power BI/InfoPro team |
| **Suspicious Power BI sharing** | Report with sensitive info shared externally | Check if published to web or sent to external email |
| **Suspicious inbox forwarding** | Forwarding rule to external address | Check for hidden rules; review Exchange message tracking |
| **Unusual file download** | Unusual download volume from cloud storage | Check sensitivity of downloaded files |
| **Unusual file access** | Unusual access to financial/network data files | Review with resource owner |
| **Unusual file share** | Unusual sharing from cloud storage | Create file policy for similar documents |

### Impact

| Alert | Description | Key Investigation |
|---|---|---|
| **Multiple VM deletions** | Unusual VM deletion count | Could be environment destruction attempt |
| **Ransomware activity** | High rate of uploads/deletions indicating encryption | Check MDE for malicious files; review activity log |
| **Unusual file deletion** | Unusual deletion volume | May indicate ransomware (encrypt originals, delete source) |

## Common Investigation Patterns

### For Compromised Account Suspicion
1. Suspend user immediately
2. Mark as compromised
3. Reset password
4. Scan all devices for malware
5. Review all activity for IoC scope

### For Inbox Compromise
1. Check for SMTP forwarding rules (including hidden ones)
2. Look for new inbox rules with names like "delete all", "...", or empty names
3. Check for increase in sent emails
4. Use MFCMAPI to find hidden rules if needed

### For OAuth App Compromise
1. Review permission levels requested
2. Check which users granted access
3. Consider banning the app
4. Investigate app store reputation (downloads, ratings, publisher)

## Learning Period Reference

| Detection Type | Learning Period |
|---|---|
| Most anomaly detections | 7 days |
| Unusual file access | 21-45 days |
| Unusual ISP for OAuth app | 30 days |

## Automation Tips

- Create Power Automate playbooks to contact users and managers for verification
- Create user groups for frequent travelers to reduce B-TP alerts
- Tag corporate VPN IP ranges in Defender for Cloud Apps
- Use IP tags for known safe IPs to reduce false positives
