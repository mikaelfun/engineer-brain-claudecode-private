---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/ad-dmn-services/aad-connect-health-data-freshness"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshoot Data Freshness Alerts in Microsoft Entra Connect Health

Alert: "Health service data is not up to date" — generated when Connect Health hasn't received data in last 2 hours.

Applies to: Azure AD Sync, Microsoft Entra Domain Services, AD FS.

## Prerequisites

- Microsoft Entra Connect installed
- Connect Health agent for the relevant service (AD DS / AD FS / Sync)
- PsExec tool

## Diagnostic Flow

### 1. HTTP Proxy Issues

- Check if SSL inspection is on → add `policykeyservice.dc.ad.msft.net` to allow list
- Run connectivity test as user: `Test-AzureADConnectHealthConnectivity`
- If data types missing, test as Local System: `Test-AzureADConnectHealthConnectivityAsSystem -Role {Sync|ADDS|ADFS}`
- Check Local System proxy: `PsExec.exe -i -s "start ms-settings:"` → Network & internet → Proxy

### 2. Performance Counter Issues

Check existence:
```powershell
[System.Diagnostics.PerformanceCounterCategory]::Exists("Processor")
[System.Diagnostics.PerformanceCounterCategory]::Exists("TCPv4")
[System.Diagnostics.PerformanceCounterCategory]::Exists("Memory")
[System.Diagnostics.PerformanceCounterCategory]::Exists("Process")
# AD DS additional:
[System.Diagnostics.PerformanceCounterCategory]::Exists("DirectoryServices(NTDS)")
[System.Diagnostics.PerformanceCounterCategory]::Exists("Security System-Wide Statistics")
[System.Diagnostics.PerformanceCounterCategory]::Exists("LogicalDisk")
```

If any return False → run detailed counter check scripts (see source article).

### 3. Data Type Troubleshooting

| Service | Data Type | Fix |
|---------|-----------|-----|
| Sync | PerfCounter | Ensure perf counters exist + Monitoring Service running |
| Sync | AadSyncService-* | Ensure Insights Service running |
| AD DS | PerfCounter | Ensure perf counters exist + Monitoring Service running |
| AD DS | Adds-TopologyInfo/TestData | Ensure both Insights + Monitoring Services running |
| AD FS | PerfCounter | Ensure perf counters exist + Monitoring Service running |
| AD FS | TestResult | Ensure both Diagnostics + Monitoring Services running |
| AD FS | Adfs-UsageMetrics | Ensure Insights Service running |

### 4. Collect Agent Logs

Use `PsExec.exe -i -s cmd` to run as Local System, then:

**Monitoring Agent**: Stop service → set `ConsoleDebug=true` in .config → run exe → capture 15 min → inspect monitor.log

**Insights Agent**: Stop service → run exe with `/console` → capture 15 min → inspect insights.log

**Diagnostics Agent (AD FS only)**: Stop service → run exe with `-Debug` → capture 15 min → inspect diagnostics.log

Service paths:
| Type | Monitor Path | Insights Path |
|------|-------------|---------------|
| Sync | `C:\Program Files\Microsoft Azure AD Connect Health Sync Agent\Monitor` | `...\Insights` |
| AD DS | `C:\Program Files\Azure AD Connect Health Adds Agent\Monitor` | `...\Insights` |
| AD FS | `C:\Program Files\Azure AD Connect Health Adfs Agent\Monitor` | `...\Insights` |
