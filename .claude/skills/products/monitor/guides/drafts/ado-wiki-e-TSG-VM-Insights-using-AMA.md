---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/VM Insights/Troubleshooting Guides/TSG VM Insights using AMA"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FVM%20Insights%2FTroubleshooting%20Guides%2FTSG%20VM%20Insights%20using%20AMA"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG VM Insights using AMA

## Documentation Links

- [Enable VM Insights for Azure Monitor Agent (AMA)](https://docs.microsoft.com/azure/azure-monitor/vm/vminsights-enable-portal#enable-vm-insights-for-azure-monitor-agent)
- [Changes for Azure Monitor Agent](https://docs.microsoft.com/azure/azure-monitor/vm/vminsights-enable-overview#changes-for-azure-monitor-agent)
- [Migrate from Log Analytics Agent](https://docs.microsoft.com/azure/azure-monitor/vm/vminsights-enable-overview#migrate-from-log-analytics-agent)

## FAQ

### Do we support migrating VM Insights from Log Analytics Agent to AMA?
Yes, migrating from Log Analytics to AMA is supported. See the [migration article](https://docs.microsoft.com/azure/azure-monitor/vm/vminsights-enable-overview#migrate-from-log-analytics-agent).

### What happens if data is collected from both LA Agent and AMA agent for a single VM?
Collecting duplicate data from a single machine with both agents can result in:
- Additional ingestion cost from sending duplicate data to the Log Analytics workspace
- The map feature of VM insights may be inaccurate since it does not check for duplicate data

## Troubleshooting

### Check if data is sent by both LA Agent and AMA Agent
Run the following query in Log Analytics:

```kql
Heartbeat
| summarize max(TimeGenerated) by Computer, Category
| sort by Computer
```

If a computer has both agents, it will return two records:
- Azure Monitor Agent → Category: "Azure Monitor Agent"
- Log Analytics Agent → Category: "Direct Agent"

### How to confirm computer is correctly onboarded to VM Insights using AMA
Verify DCR association, AMA extension, and Dependency Agent extension are all correctly configured.

### Dependency data not available after AMA onboarding

**Applicable when:**
- Onboarding was done with a DCR
- System is using AMA, not MMA

**Symptoms:**
- System not appearing on the Map
- No recent data in VMComputer table for the affected system

**Mitigation:**
1. Log into the affected system as a user with Administrator privileges
2. Edit the text file `C:\Program Files\Microsoft Dependency Agent\config\MicrosoftDependencyAgent.properties`
3. Add the line: `amaio.subsystem.enabled=true`
   - This setting tells the Dependency Agent to utilize AMA for sending data to Log Analytics
4. Save the changes
5. Wait 5 minutes
