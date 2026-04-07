---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/VM Insights/How-To/Check Which Agent (AMA or Dependency Agent) is Having Issues Through ASC"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FVM%20Insights%2FHow-To%2FCheck%20Which%20Agent%20(AMA%20or%20Dependency%20Agent)%20is%20Having%20Issues%20Through%20ASC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Check Which Agent (AMA or Dependency Agent) is Having Issues Through ASC

## Common Symptoms

- VM Insights does not show as enabled
- Not seeing all data from VM Insights (missing info in Performance or Map tabs)

## Diagnostic Process

### Step 1: Verify VM Guest Agent Status

- In ASC, check `V2Properties` tab under `Additional VM Data` for Guest Agent status - should show as **ready**
- If Guest Agent is in a failed state, involve the VM team before proceeding

### Step 2: Check Extensions

- From the `Extensions` tab, check both VM Extensions and VM Extension Handlers
- Look for errors on Log Analytics (MMA/AMA) or Dependency Agent extensions
- If an extension has errors, troubleshoot that specific extension

### Step 3: Identify the Log Analytics Workspace

If Guest Agent and Extensions are operating successfully:
- Check if LAW is listed in the case, or ask the customer
- Alternative: If VM Disk isn't encrypted, run `Inspect IaaS Disk` report from the `Diagnostics` tab
- Run the 'Monitor-Mgmt' and 'Agents' report to get the Workspace ID

### Step 4: Query the Log Analytics Workspace

Navigate to LAW in ASC, check `Agent Report` tab to identify:
- Agent version (is it latest?)
- Current heartbeat status
- VM Insights solution acquired

### Step 5: Run diagnostic queries

In the `Query Customer Data` tab:

```kusto
// Get Tables VM is Writing to
search 'VMNAME'
| summarize max(TimeGenerated) by $table
```

**Interpreting results:**
- VM not writing to VM tables (VMComputer, VMProcess, VMConnection, VMBoundPort) → **Dependency Agent issue**
- VM not writing to Heartbeat table → **Log Analytics Agent (MMA/AMA) issue**
- VM writing to Heartbeat but not InsightsMetrics → **DCR configuration issue**
