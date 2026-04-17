---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/VM Insights/Troubleshooting Guides/Missing Data TSGs/TSG VM Insights Missing Performance Data"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FVM%20Insights%2FTroubleshooting%20Guides%2FMissing%20Data%20TSGs%2FTSG%20VM%20Insights%20Missing%20Performance%20Data"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG VM Insights Missing Performance Data

## Scenario
User reports an issue where the Performance section of VM Insights is not showing data.

## Explanation
The data that populates the Performance view in the VM Insights experience is populated by data sent to the **InsightsMetrics** table in the Log Analytics Workspace. Without it the Performance view will not populate any visuals and may also ask the user to re-enable VM Insights. When troubleshooting missing performance data, we are only dealing with AMA in this scenario (not Dependency Agent).

## Troubleshooting

1. **Validate AMA Extension provisioned successfully**
   - Check if there is a VM Insights DCR and DCR Association to the machine
   - If extensions aren't onboarded correctly: see [VM Insights Troubleshooting](https://learn.microsoft.com/azure/azure-monitor/vm/vminsights-troubleshoot)
   - If onboarded correctly but DCR was modified, missing, or DCR association is missing: offboard and onboard again

2. **Check data flow to Log Analytics Workspace**
   - From the DCR retrieve the Log Analytics Workspace Resource ID
   - Check data going to the tables via ASC
   - Verify guest agent is running (Azure VMs only)
   - Run queries on workspace to check what data is/isn't being collected

3. **Determine next actions based on results:**
   - **No data at all coming in** → Troubleshoot AMA missing heartbeats:
     - [Windows](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/820689/Troubleshooting-Windows-AMA-Missing-Heartbeats)
     - [Linux](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1001340/Troubleshooting-Linux-AMA-Missing-Heartbeats)
   - **Some data (heartbeats) but no InsightsMetrics performance data** → Troubleshoot AMA missing performance counters:
     - [Windows](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1343750/AMA-Windows-TSG-Collection-Performance-Counters)
     - [Linux](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1070885/Azure-Monitor-Linux-Agent-Performance-Counter-Troubleshooting)

   **Note:** If troubleshooting AMA, modify the SAP accordingly as that will provide the correct TSGs through ASC.

4. **If machine is sending data but view not visible:**
   - Collect a [browser trace](https://learn.microsoft.com/azure/azure-portal/capture-browser-trace) from Azure Portal to investigate
