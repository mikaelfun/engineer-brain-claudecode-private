---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Utilities.ps1/Get-AzsSupportActivePSSessionFromWSMan"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Utilities.ps1/Get-AzsSupportActivePSSessionFromWSMan"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportActivePSSessionFromWSMan

# Description

This is a wrapper to Get-WSManInstance

# Synopsis

Display WSMan Connection Info. This allows listing the remote powershell sessions currently connected.

# Parameters

## COMPUTERNAME

The computer name to get the sessions from

## CURRENTSESSION

Show only the current session

## INCLUDESERVICEACCOUNTS

Include service accounts sessions

## USESSL

Connect to WSMan using SSL

# Examples

## Example 1

```powershell
Get-AzsSupportActivePSSessionFromWSMan -ComputerName ServerABC
```

## Example 2

```powershell
Get-AzsSupportActivePSSessionFromWSMan
```
