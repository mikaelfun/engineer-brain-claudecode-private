---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.VMConnect.ps1/Get-AzsSupportVMConnectConsoleRDPSession"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.VMConnect.ps1/Get-AzsSupportVMConnectConsoleRDPSession"
importDate: "2026-04-06"
type: tool-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportVMConnectConsoleRDPSession

# Description

This function is a simple wrapper of query session and returns a PSCustomObject

# Synopsis

This function is a simple wrapper of query session and returns a PSCustomObject

# Examples

## Example 1

```powershell
Get-AzsSupportVMConnectConsoleRDPSession
```


---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Reset-AzsSupportVMConnectConsoleRDPSession

# Description

This function is a simple wrapper of query session / qwinsta and returs a PSCustomObject

# Synopsis

This function is a simple wrapper of query session / qwinsta and returs a PSCustomObject

# Examples

## Example 1

```powershell
Reset-AzsSupportVMConnectConsoleRDPSession
```


---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Start-AzsSupportVMConnectConsole

# Synopsis

Enables VMConnect console and return a list of virtual machines associated with the subscription. VMConnect is only supported on Azure Stack Hub.

# Parameters

## SUBSCRIPTIONID

The subscription guid

# Examples

## Example 1

```powershell
Start-AzsSupportVMConnectConsole -SubscriptionId "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```


---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Stop-AzsSupportVMConnectConsole

# Synopsis

Stops the VMConnect process and hardens the environment back to the original state
