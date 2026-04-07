---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Check if an Azure Virtual Machine (VM) has a managed identity"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Check%20if%20an%20Azure%20Virtual%20Machine%20%28VM%29%20has%20a%20managed%20identity"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Azure Portal
```
Azure Portal > Virtual Machines > Select VM > Identity > System assigned
Azure Portal > Virtual Machines > Select VM > Identity > User assigned
```

## Azure Support Center
```
Azure Support Center > Resource Explorer > Virtual Machine > Properties > Legacy VM Properties > VM Properties > Resource Identity Type contains "SystemAssigned" or "UserAssigned"
```
