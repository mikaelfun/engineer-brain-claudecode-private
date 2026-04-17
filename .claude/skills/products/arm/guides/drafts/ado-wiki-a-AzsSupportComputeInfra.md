---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.ps1/Confirm-AzsSupportInfrastructureHost"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.ps1/Confirm-AzsSupportInfrastructureHost"
importDate: "2026-04-06"
type: tool-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Confirm-AzsSupportInfrastructureHost

# Description

Confirm whether the computer name is a valid nodename or not base Infrastructure host defination. Return $ture or $false.

# Synopsis

Confirm whether the computer name is a valid nodename or not base Infrastructure host defination. Return $ture or $false.

# Parameters

## COMPUTERNAME

# Examples

## Example 1

```powershell
Confirm-AzsSupportInfrastructureHost -ComputerName "Azs-Node01"
```


---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Confirm-AzsSupportInfrastructureVM

# Description

Confirm whether the computer name is a valid InfraVM or not base ECE role node defination. Return $ture or $false.

# Synopsis

Confirm whether the computer name is a valid InfraVM or not base ECE role node defination. Return $ture or $false.

# Parameters

## COMPUTERNAME

# Examples

## Example 1

```powershell
Confirm-AzsSupportInfrastructureVM -ComputerName "AzS-ACS01"
```


---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportComputerInformation

# Synopsis

Collects computer information from the specified ComputerName such as Uptime, Localtime, OSVersion, etc. This is a wrapper for Get-ComputerInfo with support for remote computers.

# Parameters

## COMPUTERNAME

The name of the computer to collect information from. If not specified, the local computer is used.

# Examples

## Example 1

```powershell
Get-AzsSupportComputerInformation
```

## Example 2

```powershell
Get-AzsSupportComputerInformation -ComputerName "Azs-Node01"
```


---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportInfrastructureHost

# Synopsis

Gets physical host node information from FailoverClustering.

# Parameters

## NAME

A node name, such as Azs-NODE01

# Examples

## Example 1

```powershell
Get-AzsSupportInfrastructureHost
```
