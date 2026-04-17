---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/VM Insights/Troubleshooting Guides/Missing Data TSGs/TSG VM Insights Missing Map Data"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FVM%20Insights%2FTroubleshooting%20Guides%2FMissing%20Data%20TSGs%2FTSG%20VM%20Insights%20Missing%20Map%20Data"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG VM Insights Missing Map Data

## Scenario
User reports an issue where the Map section of VM Insights is not showing data.

## Explanation
The data that populates the Map view in the VM Insights experience is populated by data sent to the tables VMProcess, VMComputer, VMBoundPort and VMConnection tables in the Log Analytics Workspace. This data is collected by the **Dependency Agent**. Without it the Map view will not populate any data. The Dependency Agent is optional with configuration of VM Insights using AMA with the caveat being that Map data will not show.

## Troubleshooting

1. **Validate AMA and Dependency Agent Extensions provisioned successfully**
   - Check if there is a VM Insights DCR and DCR Association to the machine
   - If extensions aren't onboarded correctly: see [VM Insights Troubleshooting](https://learn.microsoft.com/azure/azure-monitor/vm/vminsights-troubleshoot)
   - If onboarded correctly but DCR was modified, missing, or DCR association is missing: offboard and onboard again

2. **Check if Dependency Agent OS/Kernel is Supported**
   - If unsupported OS, then Map data showing limited/no data is expected

3. **Check data flow to Log Analytics Workspace**
   - From the DCR retrieve the Log Analytics Workspace Resource ID
   - Check data going to the tables via ASC
   - Verify guest agent is running (Azure VMs only)
   - Run queries on workspace to check what data is/isn't being collected

4. **Determine next actions based on results:**
   - **No data at all coming in** → Troubleshoot AMA missing heartbeats (Windows or Linux)
   - **Some data (heartbeats, InsightsMetrics) but no VMProcess/VMBoundPort/VMComputer/VMConnection** → Issue with Dependency Agent

5. **For Dependency Agent issues:**
   - Determine how customer onboarded (especially if migrating from Legacy Agent to AMA)
   - Migration may not have updated the Dependency Agent to use AMA for sending data
   - Fix: Remove Dependency Agent via portal and reinstall using Azure CLI
     - [Windows instructions](https://learn.microsoft.com/azure/virtual-machines/extensions/agent-dependency-windows)
     - [Linux instructions](https://learn.microsoft.com/azure/virtual-machines/extensions/agent-dependency-linux)
   - Collect migration process details and report via ICM to VM Insights PG

6. **If machine is sending data but view not visible:**
   - Collect a [browser trace](https://learn.microsoft.com/azure/azure-portal/capture-browser-trace) from Azure Portal to investigate rendering/query issues
