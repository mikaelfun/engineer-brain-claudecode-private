---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/ad-dmn-services/aad-connect-health-data-freshness
importDate: '2026-04-20'
type: guide-draft
---

# Troubleshoot Data Freshness Alerts in Microsoft Entra Connect Health

## Overview

When Microsoft Entra Connect Health Service has not received data in the last two hours, it generates the alert: **Health service data is not up to date**. This affects:
- Azure AD Sync service
- Microsoft Entra Domain Services (AD DS)
- Active Directory Federation Services (AD FS)

## Prerequisites

- Microsoft Entra Connect installed
- Connect Health agent for the applicable service (AD DS / AD FS / Sync)
- PsExec tool (for Local System context troubleshooting)

## Diagnostic Decision Tree

### Step 1: Check HTTP Proxy Configuration

If SSL inspection is enabled, verify the policy key service endpoint (policykeyservice.dc.ad.msft.net) is in the allow list.

Run connectivity test as regular user:
- Sync: Test-AzureADConnectHealthConnectivity
- If all data types missing, proxy may work for user but not Local System

Run connectivity test as Local System:
- Sync: Test-AzureADConnectHealthConnectivityAsSystem -Role Sync
- AD DS: Test-AzureADConnectHealthConnectivityAsSystem -Role ADDS
- AD FS: Test-AzureADConnectHealthConnectivityAsSystem -Role ADFS

Check Local System proxy settings:
1. Run: PsExec.exe -i -s "start ms-settings:"
2. Navigate to Network & internet > Proxy > Manual proxy setup > Edit
3. Update proxy settings to match current setup
4. Restart services

### Step 2: Verify Performance Counters

Run PowerShell to check performance counter categories exist:
- [System.Diagnostics.PerformanceCounterCategory]::Exists("Processor")
- [System.Diagnostics.PerformanceCounterCategory]::Exists("TCPv4")
- [System.Diagnostics.PerformanceCounterCategory]::Exists("Memory")
- [System.Diagnostics.PerformanceCounterCategory]::Exists("Process")
- For AD DS: also check "DirectoryServices(NTDS)", "Security System-Wide Statistics", "LogicalDisk"

If any return False, run detailed counter check script (see source article).

### Step 3: Check Data Type-Specific Services

**Sync:**
| Data Type | Check |
|-----------|-------|
| PerfCounter | Verify perf counters + Sync Monitoring Service running |
| AadSyncService-* | Verify Sync Insights Service running |

**AD DS:**
| Data Type | Check |
|-----------|-------|
| PerfCounter | Verify perf counters + AD DS Monitoring Service running |
| Adds-TopologyInfo-Json, Common-TestData-Json | Verify AD DS Insights + Monitoring Services running |

**AD FS:**
| Data Type | Check |
|-----------|-------|
| PerfCounter | Verify perf counters + AD FS Monitoring Service running |
| TestResult | Verify AD FS Diagnostics + Monitoring Services running |
| Adfs-UsageMetrics | Verify AD FS Insights Service running |

### Step 4: Collect Agent Logs

Use PsExec.exe -i -s cmd to run command prompt as Local System, then:

1. Stop the relevant service (Monitoring/Insights/Diagnostics)
2. Set ConsoleDebug=true in service config file
3. Run service executable, redirect output to log file
4. Let run 15 minutes, then Ctrl+C and inspect log

Service paths:
- Sync Monitor: C:\Program Files\Microsoft Azure AD Connect Health Sync Agent\Monitor
- AD DS Monitor: C:\Program Files\Azure AD Connect Health Adds Agent\Monitor
- AD FS Monitor: C:\Program Files\Azure AD Connect Health Adfs Agent\Monitor
