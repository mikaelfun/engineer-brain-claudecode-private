---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Health/General/How to enable debug event log for Health Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Health%2FGeneral%2FHow%20to%20enable%20debug%20event%20log%20for%20Health%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Health For Entra Connect Sync (aka Entra Connect)
1. Run "eventvwr"
2. Enable View -> "Show analytic and Debug Logs"

3. Find log under Applications and Services\ADHealth-Sync\Debug in event viewer
Increase available size to 100 MB -> 100032
And Enable the Event log

4. Run in powershell: `restart-service AzureADConnectHealthSyncMonitor` (step is important to turn pks monitor back on)
5. Refresh view to confirm events are now showing in event viewer

6. Let agent run until DataFreshness alerts are resolved and then re-fire again, indicating that the agent went down (should take at least 2 hours)
7. Save and export event log to monitorlog.evtx

8. Zip the output monitorlog.evtx to monitorlog.zip and share back.
9. If the datafreshness error does come back, and you are feeling generous:

Get a dump file from the Microsoft.Online.Reporting.MonitoringAgent.Startup Process.

9. Check services.msc that the AzureADConnectHealthSyncMonitor service is running and is enabled.

10. To Clear and restart Eventviewer trace "Applications and Services\ADHealth-Sync\Debug" in eventviewer
    Disable and then Re-enable to restart the log.

11. Force kill all instances of processes, collect output of following commands:

```powershell
get-process -name "Microsoft.Identity.Health.AadSync.MonitoringAgent.Startup"
get-process -name "Microsoft.Identity.Health.AadSync.MonitoringAgent.Startup" | Stop-Process -force
get-process -name "Microsoft.Identity.Health.AadSync.MonitoringAgent.Startup"
restart-service      AzureADConnectHealthSyncMonitor
get-process -name "Microsoft.Identity.Health.AadSync.MonitoringAgent.Startup"
```

### How to collect console logs
_while running the aadch for sync monitoring agent using administrative command prompt_

[1] Navigate to monitor directory

cd C:\Program Files\Microsoft Azure AD Connect Health Sync Agent\Monitor

[2] Edit config file in notepad

notepad Microsoft.Identity.Health.AadSync.MonitoringAgent.Startup.exe.config

[3] set ConsoleDebug Key Value to 'true' e.g.: `<add key="ConsoleDebug" value="true" />`
[4] Save .config
[5] Run process and write output to a text file

Microsoft.Identity.Health.AadSync.MonitoringAgent.Startup.exe > monitor.log

(omit "> monitor.log" to show console log in the console)

[6] Let run to collect text log for at least 15 minutes (the minimum upload cycle)

[7] Use ctrl-c in the console to stop

[8] Zip and upload monitor.log to the incident

# Health For ADDS

1. Run "eventvwr"
2. Enable View -> "Show analytic and Debug Logs"

3. Find log under Applications and Services\ADHealth-ADDS\Debug in event viewer
    Increase available size to 100 MB -> 100032
    And Enable the Event log

4. Restart services in powershell:
```powershell
restart-service AzureADConnectHealthAddsInsights

$processes = Get-Process -Name "Microsoft.Identity.Health.Adds.MonitoringAgent.Startup"
$processes | Stop-Process
restart-service AzureADConnectHealthAddsMonitor
```

5. Confirm that logs show under \Debug trace
6. Wait 2 hours to see if data freshness alerts resolve/reactivate
7. If datafreshness alerts reactivate, export and share the \ADHealth-ADDS\Debug .evtx file (Right click -> Save All Events As.)
