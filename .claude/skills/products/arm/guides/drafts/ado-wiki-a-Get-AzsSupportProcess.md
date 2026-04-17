---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Common.ps1/Get-AzsSupportProcess"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Common.ps1%2FGet-AzsSupportProcess"
importDate: "2026-04-06"
type: tool-reference
---

# CSSTools Get-AzsSupportProcess

## Synopsis

Gets processes on a remote computer, and sorts them by Name, ProcessID. Supports WMI, WinRM, and Tasklist /SVC.

## Parameters

### COMPUTERNAME
The remote computer you want to list processes on

### NAME
Wildcard search for the given name against both the Process Name and Process CommandLine args

### PROCESSID
Process ID (PID) for a known process on the remote computer

## Examples

```powershell
Get-AzsSupportProcess -ComputerName "Azs-XRP01"
Get-AzsSupportProcess -ComputerName "Azs-XRP01" -Name "svchost"
Get-AzsSupportProcess -ComputerName "Azs-XRP01" -Name "svchost" -UseWinRM
Get-AzsSupportProcess -ComputerName "Azs-XRP01" -ProcessId 1234
Get-AzsSupportProcess -ComputerName "Azs-XRP01" -UseTasklist
```
