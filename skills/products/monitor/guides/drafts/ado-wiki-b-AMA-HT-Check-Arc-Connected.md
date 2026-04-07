---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Check if an Azure Arc Machine is connected"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Check%20if%20an%20Azure%20Arc%20Machine%20is%20connected"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Azure Portal
```
Azure Portal > Azure Arc > Machines > Select Machine > Overview
```
Check Status field.

## Azure Support Center
```
Azure Support Center > Resource Explorer > Arc Machine > Properties > Status = "Connected"
```

## Azure PowerShell
```powershell
Get-AzConnectedMachine -Name "MyArcMachineName" -ResourceGroupName "MyArcMachineResourceGroupName"
```

## Azure CLI
```bash
az connectedmachine show --name MyArcMachineName --resource-group MyArcMachineResourceGroupName
```

## Command Line (On Arc Machine)
```bash
azcmagent show
```
