---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Host or AVD Agent/Health Check Failures/SxSStack/Agent Upgrade Failure Check"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/465021"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Agent Upgrade Failure Check

## MSRD-Collect
- Review Agent install log
- Review RDAgentBootLoader events in Application Log for errors

## Kusto Queries

### Agent Version Timeline
```kql
//Agent Version
cluster("rdsprod.eastus2").database("WVD").DiagActivity
| union cluster("rdsprodus.eastus2").database("WVD").DiagActivity
| union cluster("rdsprodeu.westeurope").database("WVD").DiagActivity
| where SessionHostName has "vm name"
| where env_time >= ago(5d)
| project env_time, Id, ActRing, SessionHostName, AgentVersion, AgentSxsStackVersion
```

### Agent Upgrade Trace
Use the time frame when agent was upgraded to see trace and find out what happened:
```kql
//Agent Upgrade
cluster("rdsprod.eastus2").database("WVD").RDInfraTrace
| union cluster("rdsprodus.eastus2").database("WVD").RDInfraTrace
| union cluster("rdsprodeu.westeurope").database("WVD").RDInfraTrace
| where HostInstance == "wvd vm"
| where TIMESTAMP >= datetime(start time frame) and TIMESTAMP <= datetime(end time frame)
| where Category == "RDAgent.AgentUpdaterService.AgentBackgroundUpdater"
    or Category == "Microsoft.RDInfra.AgentUpdateTelemetry.Impl.AgentUpdateTelemetryImpl"
    or Category == "Microsoft.RDInfra.RDAgent.Service.AgentDownloadHdlrImpl"
    or Category == "Microsoft.RDInfra.RDAgent.Service.RDAgentUpdateHandler"
    or Category == "Microsoft.RDInfra.RDAgent.Service.AgentUpdateStateImpl"
    or Category == "Microsoft.RDInfra.RDAgent.Service.AgentInstallImpl"
| project TIMESTAMP, ActivityId, Role, Category, HostInstance, Msg
```

## Known Issues

### Upgrade Fails with "Method not found" in Event log
- **Summary**: WVD Agent failed to upgrade/install newer versions. MSI logs shows agent installed successfully but Application event log throws "Method not found" exception, agent resets to old version.
- **Cause**: Missing method exceptions related to .NET Framework incompatibility. Session host has .NET 4.7 instead of required 4.7.2+.
- **Resolution**: [Upgrade .NET to version 4.7.2 or greater](https://support.microsoft.com/en-us/help/4054530/microsoft-net-framework-4-7-2-offline-installer-for-windows)
