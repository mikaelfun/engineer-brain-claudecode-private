---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Common.ps1/Get-AzsSupportService"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Common.ps1%2FGet-AzsSupportService"
importDate: "2026-04-06"
type: tool-reference
---

# CSSTools Get-AzsSupportService

## Synopsis

Gets services on a specified ComputerName, and sorts them by State, Name. Supports WMI, and WinRM.

## Parameters

### COMPUTERNAME
The remote computer you want to list services on

### NAME
Wildcard search for the provided name

## Examples

```powershell
Get-AzsSupportService -ComputerName "Azs-XRP01"
Get-AzsSupportService -ComputerName "Azs-XRP01" -Name "WinRM"
Get-AzsSupportService -ComputerName "Azs-Node01" -Name "smphost" -UseWinRM
```
