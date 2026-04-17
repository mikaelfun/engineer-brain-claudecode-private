---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/Troubleshooting Guides/Sentinel Windows AMA connector missing Security Event Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor+Agents%2FAgents%2FAzure+Monitor+Agent+(AMA)+for+Windows%2FTroubleshooting+Guides%2FSentinel+Windows+AMA+connector+missing+Security+Event+Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Sentinel Windows AMA Connector Missing Security Event Logs

## Scope
Windows Security Events collected via **Sentinel Security Events connector** into **SecurityEvent** table using AMA for Windows.
- If customer uses standard Windows Event DCR → data goes to **Event** table (different flow).

## SAP Path
Azure/Azure Monitor Agent (AMA) on Windows machine/I created a DCR but the data is not in the Log Analytics Workspace/No Security event logs in Log Analytics Workspace

## Data Collection
Run **AgentTroubleshooter.exe** ASAP — collect `AgentTroubleshooterOutput.zip`. If missing → update agent to latest version first.

## Scoping Questions

1. **Security Events really missing?** — Query: `SecurityEvent | where _ResourceId contains "machineName"` (use _ResourceId not Computer for forwarded events)
2. **AMA installed?** — Verify via ASC Extensions tab
3. **Agent version** — From AgentTroubleshooterOutput TroubleshooterLogs.txt, ASC, or Portal
4. **Heartbeating?** — `Heartbeat | where Computer contains "ServerName" | where Category contains "Azure Monitor Agent" | where TimeGenerated > ago(10m)`
5. **DCR name** — Verify DCR exists and is associated with VM via ASC
6. **xPath query** — Document exact xPath queries in DCR windowsEventLogs section
7. **Workspace ID** — Compare workspace IDs between DCR destination and agent config (`AgentDataStore\Mcs\mcsconfig.*.xml`, `configchunks`)

## Troubleshooting Steps

1. **DCR contains Security Event data source?** — Check windowsEventLogs with `Microsoft-SecurityEvent` stream
2. **DCR downloaded by agent?** — Check `AgentDataStore\Mcs\configchunks\` folder; empty/missing → config download failure
3. **xPath query valid?** — Verify syntax and filter criteria match expected events
4. **Event Forwarding?** — For forwarded events, _ResourceId = collector agent, Computer = source machine
5. **Agent service running?** — Check MonitoringHost.exe and HealthService
6. **Network connectivity** — Verify ODS endpoint reachable, check for proxy/firewall issues

## Key Config Paths (Windows)
- Agent config: `AgentDataStore\Mcs\mcsconfig.*.xml`
- DCR chunks: `AgentDataStore\Mcs\configchunks\`
- Agent logs: via AgentTroubleshooter output

## IcM Escalation
| Scenario | Path |
|----------|------|
| Windows AMA: install/uninstall, no heartbeat, missing data, text/IIS logs | Azure Monitor Data Collection/AMA Windows |
| DCR: create/delete/associate | Azure Monitor Control Service (AMCS)/Triage |
