---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Health/Connect Health for ADDS/Connect Health for ADDS"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Health%2FConnect%20Health%20for%20ADDS%2FConnect%20Health%20for%20ADDS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Connect Health for ADDS

## Overview
Monitors Windows Server Active Directory Domain Services (AD DS), provides alerts for issues impacting day-to-day AD DS operations, and collects/displays performance metrics.

## Alert Conditions Monitored
1. DC is not advertising
2. DC is quarantined
3. DC replication is broken
4. DC unreachable via LDAP ping
5. DC unable to find a PDC
6. DC unable to find a Global Catalog
7. No Global Catalog Detected
8. DC Time is out of sync
9. Unable to reach local SYSVOL share
10. Netlogon service is not running
11. Kerberos Key Distribution service is not running
12. DFSR/NTFRS service is not running
13. DNS service is not running
14. High CPU Consumption on DC
15. Data hasn't been refreshed in over 2 hours

## Limitations
- Alert thresholds (CPU, RAM) are not configurable and cannot be individually disabled
- Installing both Connect Health for AD DS and ADFS on same server causes data freshness alert (restart both agents to resolve)
- All monitored DCs must have internet access
- Alert SCOPE is the DC raising the error - use portal to determine the target

## GDPR / Data Retention
- Servers with active "Health Service not up to date" Error alerts for 30+ days are disabled and hidden
- Does not apply to Warnings (partial data still received)
- To re-enable: re-register the Health agent

## Scoping and Data Collection

### Installation Logs
`%temp%\AdHealthAddsAgentConfiguration.<date>.log`

### Connectivity Test
```powershell
Test-AzureADConnectHealthConnectivity -Role Adds -ShowResult
```

### Services
- Azure AD Connect Health AD DS Insights Service (AzureADConnectHealthAddsInsights) - collects usage info
- Azure AD Connect Health AD DS Monitoring Service (AzureADConnectHealthAddsMonitor) - monitors for service interruptions

## Troubleshooting

### Data Freshness Alerts
Follow Azure AD Connect Health Data Freshness Alerts Troubleshooting guide.

### Registration Failures
1. Check firewall/proxy requirements: https://aka.ms/aadchrequirements
2. Configure proxy: https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-health-agent-install#configure-azure-ad-connect-health-agents-to-use-http-proxy
3. Self-diagnosis: https://aka.ms/chtestconnectivity

### SSL Handshake Troubleshooting
Modify `C:\Program Files\Azure Ad Connect Health Adds Agent\Monitor\Microsoft.Identity.Health.Adds.MonitoringAgent.Startup.exe.config`:

Replace `<system.diagnostics>` section with verbose System.Net tracing configuration, reproduce the issue, then check `trace.log` in the Monitor folder. Restore original config after.

## Case Handling
- Queue: Identity - Cloud
- Issues surfaced by alerts go to the component owner team (e.g., AD replication → Windows Directory Services T2/T3)
- PG Escalation: KB 3045997
