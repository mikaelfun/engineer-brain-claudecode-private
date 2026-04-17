---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Check if an Azure Arc Machine has an extension in its config"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Check%20if%20an%20Azure%20Arc%20Machine%20has%20an%20extension%20in%20its%20config"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Overview
An extension name is customizable, so this is not a reliable field to use to verify if a specific extension is part of an Azure Machine's configuration. Instead, we should use the extension type and extension publisher.

- Azure Monitor Windows (Publisher = Microsoft.Azure.Monitor | Type = AzureMonitorWindowsAgent)
- Azure Monitor Linux (Publisher = Microsoft.Azure.Monitor | Type = AzureMonitorLinuxAgent)

In this how-to, we are not necessarily interested in whether or not the extension status is successful, but rather that the Azure Resource Manager (ARM) is aware that the extension should be installed (that it is present in the configuration).

## Azure Portal
```
Azure Portal > Azure Arc > Machines > Select Arc Machine > Extensions > Type
```

## Azure Support Center
```
Azure Support Center > Resource Explorer > Arc Machine > extensions > Properties > Extension Properties
```

## Resource JSON
```
Azure Portal > Azure Arc > Machines > Select Arc Machine > Overview > JSON View
```

Each resource where an extension is installed will reflect this in the Resource JSON data along with properties/settings related to that extension.

## Azure Resource Graph
```
Azure Support Center > Select Subscription (at top of tree view on left) > ARG Query Editor
```

Sample query:
```kusto
resources
| where id startswith "<vm-resource-id>"
| where type contains "extension"
```

In the results section, we can see the properties of the extension - similar to what we would see in the Resource JSON.
