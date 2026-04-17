---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Check latest available agent version"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Check%20latest%20available%20agent%20version"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Overview
The following commands in AZ CLI or Azure Cloud Shell will output the latest available agent version.

The **--location** parameter value is defaulted to "westus2" in the sample commands. Change the region string to match the region where the target resource is located.

## Scenario: Azure VM

Linux:
```bash
az vm extension image list --latest --location "westus2" --publisher "Microsoft.Azure.Monitor" --name "AzureMonitorLinuxAgent"
```

Windows:
```bash
az vm extension image list --latest --location "westus2" --publisher "Microsoft.Azure.Monitor" --name "AzureMonitorWindowsAgent"
```

## Scenario: Azure VMSS

Linux:
```bash
az vmss extension image list --latest --location "westus2" --publisher "Microsoft.Azure.Monitor" --name "AzureMonitorLinuxAgent"
```

Windows:
```bash
az vmss extension image list --latest --location "westus2" --publisher "Microsoft.Azure.Monitor" --name "AzureMonitorWindowsAgent"
```

## Scenario: Azure Arc

Linux:
```bash
az connectedmachine extension image list --location "westus2" --publisher "Microsoft.Azure.Monitor" --extension-type AzureMonitorLinuxAgent
```

Windows:
```bash
az connectedmachine extension image list --location "westus2" --publisher "Microsoft.Azure.Monitor" --extension-type AzureMonitorWindowsAgent
```

## Scenario: Windows Client
1. [Download the MSI](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-windows-client#install-the-agent)
2. Right click on the .msi file and go to Properties
3. Change to the Details tab and look at the Comments property
