---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Utilities.ps1/New-AzsSupportNetworkShare"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Utilities.ps1/New-AzsSupportNetworkShare"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools New-AzsSupportNetworkShare

# Description

Creates a new network share that can be leveraged to copy files in/out of the Azure Stack Hub environment to customer's datacenter

# Synopsis

Creates a new network share directory for AzS Hub CSS to leverage

# Parameters

## DRIVELETTER

Specify the drive letter mapping that you want to create

## REMOTESHAREPATH

Specify the network share that is accessible from the Privileged Endpoint via TCP Port 445

## REMOTESHARECREDENTIALS

Specify the credentials that are used to access the network share location

# Examples

## Example 1

```powershell
New-AzsSupportNetworkShare -DriveLetter z -RemoteSharePath "\\192.168.0.100\share" -RemoteShareCredentials (Get-Credential)
```
