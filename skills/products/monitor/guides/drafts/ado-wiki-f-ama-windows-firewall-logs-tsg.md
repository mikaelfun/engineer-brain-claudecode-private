---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/Troubleshooting Guides/Troubleshooting AMA- Windows Firewall Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor+Agents%2FAgents%2FAzure+Monitor+Agent+(AMA)+for+Windows%2FTroubleshooting+Guides%2FTroubleshooting+AMA-+Windows+Firewall+Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting AMA Windows Firewall Logs

## Documentation
- [Collect firewall logs with Azure Monitor Agent](https://learn.microsoft.com/azure/azure-monitor/agents/data-sources-firewall-logs)
- [Troubleshooting for customers](https://learn.microsoft.com/azure/azure-monitor/agents/data-sources-firewall-logs#troubleshoot)

## Troubleshooting Steps

1. **Verify DCR** — Data source and destination configured correctly for Windows Firewall logs
2. **Query LA workspace**:
   ```kql
   WindowsFirewall
   | where TimeGenerated > ago(48h)
   | order by TimeGenerated desc
   ```
3. **Verify firewall logs being created** — See [Verify that firewall logs are being created](https://learn.microsoft.com/azure/azure-monitor/agents/data-sources-firewall-logs#verify-that-firewall-logs-are-being-created)
4. **Collect AMA logs** — Run AgentTroubleshooter if everything appears correct but no data

## IcM Escalation
| Scenario | Path |
|----------|------|
| Windows AMA: firewall logs collection issues | Azure Monitor Data Collection/AMA Windows |
| DCR: create/delete/associate | Azure Monitor Control Service (AMCS)/Triage |
