---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.GuestLogCollection.ps1/Invoke-AzsSupportGuestLogCollection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.GuestLogCollection.ps1/Invoke-AzsSupportGuestLogCollection"
importDate: "2026-04-06"
type: tool-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Invoke-AzsSupportGuestLogCollection

# Synopsis

Generates a guest log collection for a virtual machine.

# Parameters

## SUBSCRIPTIONID

The subscription guid that contains the VM

## VMNAME

The name of the VM to collect logs from

# Examples

## Example 1

```powershell
Invoke-AzsSupportGuestLogCollection -SubscriptionId "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" -VMName "MyVM01"
```
