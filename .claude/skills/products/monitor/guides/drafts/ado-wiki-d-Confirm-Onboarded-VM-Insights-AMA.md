---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/VM Insights/How-To/How to confirm computer is correctly onboarded to VM Insights using Azure Monitor Agent (AMA)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FVM%20Insights%2FHow-To%2FHow%20to%20confirm%20computer%20is%20correctly%20onboarded%20to%20VM%20Insights%20using%20Azure%20Monitor%20Agent%20(AMA)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Confirm Computer is Correctly Onboarded to VM Insights using AMA

## Verification Steps

### 1. Check AMA Extension Status

Navigate to the VM/VMSS/Arc-enabled server in Azure Support Center.

- **VM**: Click VM → Extensions tab → Look for `Microsoft.Azure.Monitor.AzureMonitorLinuxAgent` or `AzureMonitorWindowsAgent` → Confirm **Display Status** = "Provisioning succeeded"
- **VMSS**: Expand VMSS → virtualMachines → Click VM → Extensions tab → Same check
- **Arc Server**: Expand Arc server → extensions → Look for AzureMonitorWindowsAgent/LinuxAgent → Confirm **Instance Status Code** = "success"

> **Note**: Extensions are provisioned as part of VM startup and disassociated upon stopping. If no extensions listed, confirm VM is running.

### 2. Get Azure Resource ID

Retrieve the Azure resourceId of the VM/VMSS/Arc server from ASC.

### 3. Verify DCR Association

Confirm that a Data Collection Rule (DCR) is associated to the Azure resourceId.

### 4. Verify Guest Performance Configuration (Performance Tab)

On the DCR Properties blade, under Data Sources, confirm `performanceCounters`:
```json
{
    "performanceCounters": [
        {
            "streams": ["Microsoft-InsightsMetrics"],
            "samplingFrequencyInSeconds": 60,
            "counterSpecifiers": ["\\VmInsights\\DetailedMetrics"],
            "name": "VMInsightsPerfCounters"
        }
    ]
}
```

> **Note**: `samplingFrequencyInSeconds` can be customized by the customer. Different values won't affect onboarding but may cause unpredictable chart results (optimized for 60s).

### 5. Verify Map Configuration (Map Tab)

On the DCR Properties blade, under Data Sources, confirm `extensions`:
```json
{
    "extensions": [
        {
            "streams": ["Microsoft-ServiceMap"],
            "extensionName": "DependencyAgent",
            "extensionSettings": {},
            "name": "DependencyAgentDataSource"
        }
    ]
}
```

> **Note**: This configuration only present if Map (Processes and dependencies) is enabled.

### 6. Verify LAW Destination

Confirm the target Log Analytics workspace is correct in the `logAnalytics` destinations section.

### 7. Verify Data Flows

Confirm data flows include:
- `Microsoft-InsightsMetrics` → `VMInsightsPerf-Logs-Dest`
- `Microsoft-ServiceMap` → `VMInsightsPerf-Logs-Dest` (if Map enabled)
