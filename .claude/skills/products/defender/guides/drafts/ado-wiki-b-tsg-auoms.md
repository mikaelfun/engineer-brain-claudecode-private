---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Archive/Microsoft Monitoring Agent (MMA)/Linux OMS and auoms TSG/[TSG] AUOMS"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FArchive%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%2FLinux%20OMS%20and%20auoms%20TSG%2F%5BTSG%5D%20AUOMS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AUOMS Troubleshooting Guide

## What to Collect if There Is a Suspected Issue with auoms or OMSAuditdPlugin

| What to collect | How to collect | Why collect? |
|---|---|---|
| WORKSPACE_ID and AGENT_GUID | `sudo cat /etc/opt/microsoft/omsagent/conf/omsadmin.conf` | Needed to find auoms metrics in the database |
| /var/log/messages* | `sudo bash -c "tar cf var-log.tar /var/log/messages* /var/log/syslog*"` | Contains auoms and auomscollect log messages |
| /var/log/syslog* | (included in above command) | |
| /var/opt/microsoft/omsconfig/* | `sudo bash -c "tar cf omsconfig-log.tar /var/opt/microsoft/omsconfig"` | Contains DSC module log messages (including nxOMSAuditdPlugin) |
| /etc/opt/microsoft/auoms/* | `sudo bash -c "tar cf auoms-config.tar /etc/opt/microsoft/auoms"` | Config files help identify potential configuration issues |
| Output of auomsctl status | `sudo /opt/microsoft/auoms/bin/auomsctl status` | Provides status of auoms process |
| CPU consumption info (if CPU issue) | `pidstat 30` (run at least 90 seconds) | Shows what processes are consuming CPU |
| IO consumption info (if IO issue) | `sudo pidstat -d 30` (run at least 90 seconds) | Shows what processes are consuming IO |

## How to Prevent execve Audit Events

1. Create a file named `000local.rules` with the contents:
   ```
   -A never,exit -F arch=b32 -S execve,execveat
   -A never,exit -F arch=b64 -S execve,execveat
   ```
2. Copy the file to `/etc/opt/microsoft/auoms/rules.d`

**NOTE:** Do not edit files directly in the `/etc/opt/microsoft/auoms/rules.d` directory — changes may be partially read causing auoms errors. If the customer only wants to block execve events for a specific user, add `-F uid=<username>` to the above audit rules.

## How to Check the Number of auditd Logs Consumed

1. Download the MDE analyser:
   ```bash
   ./mde_support_tool.sh -d
   ```
2. Check the file `auditd_log_analysis.txt`

**Important Notes:**
- auoms has nothing to do with MDE; MDE Analyser is an independent tool
- MDE analyser only analyses auditd IO — if auoms runs without auditd, use `pidstat -d 30` instead

## auoms Logs in Kusto (LinuxAuditMetrics)

```kusto
union
cluster('https://romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').LinuxAuditMetrics,
cluster('https://romeeus.eastus.kusto.windows.net').database('ProdRawEvents').LinuxAuditMetrics
| where AzureResourceSubscriptionId == "{subscriptionId}"
```
> ⚠️ auoms logs retain for **30 days** only.

## How to Add a Process to the Allowlist (Exclude from auditd Monitoring)

```bash
vi /etc/audit/rules.d/audit.rules
```
Add:
```
-a never,exclude -F path=/file_to_exclude -k exclude_file
```
Save with `:wq!`
