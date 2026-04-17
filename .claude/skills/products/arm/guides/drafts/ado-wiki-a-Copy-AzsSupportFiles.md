---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Utilities.ps1/Copy-AzsSupportFiles"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Utilities.ps1/Copy-AzsSupportFiles"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Copy-AzsSupportFiles

# Synopsis

Copies files from the remote computer to the local working directory file path location (Get-AzsSupportWorkingDirectory).

# Parameters

## FROMCOMPUTER

Specifies the computer object from which a remote file is being copied. When you use this parameter, the Path parameters refer to the local path on the remote machine.

## PATH

Specifies, as a string array, the path to the items to copy. Wildcard characters are permitted. If omitted, defaults to the Azs Support working directory.
