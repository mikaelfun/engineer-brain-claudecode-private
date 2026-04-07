---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Check if the Azure VM Guest Agent is running"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FAMA%20Linux%2FHow-To%2FAMA%20Linux%3A%20HT%3A%20Check%20if%20the%20Azure%20VM%20Guest%20Agent%20is%20running"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AMA Linux: Check if Azure VM Guest Agent is Running

## Bash (on VM)
```bash
systemctl status waagent
```

## Azure Support Center (ASC)
```
Azure Support Center > Resource Explorer > Virtual Machine > Properties > Additional Vm Data > Guest Agent Status = "Ready"
```

## Azure Portal
```
Azure Portal > Virtual Machine > Extensions + applications
```

If the VM is powered on (and did not recently start up), the portal will show a warning if the agent is unresponsive.
