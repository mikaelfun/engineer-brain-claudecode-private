---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Utilities.ps1/New-AzsSupportPSSession"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Utilities.ps1/New-AzsSupportPSSession"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools New-AzsSupportPSSession

# Synopsis

Creates a persistent powershell session to an infrastructure node.

# Parameters

## COMPUTERNAME

The computer that you want to create remote pssession to. Will be transformed to FQDN by default.

## NETBIOS

Skips the FQDN transformation and will use NetBIOS name

## FORCE

Re-creates the persistent session.

# Examples

## Example 1

```powershell
New-AzsSupportPSSession -ComputerName "Azs-Node01"
```

## Example 2

```powershell
New-AzsSupportPSSession -ComputerName "Azs-XRP01" -Force
```

## Example 3

```powershell
New-AzsSupportPSSession -ComputerName "Azs-XRP01" -NetBIOS -Force
```
