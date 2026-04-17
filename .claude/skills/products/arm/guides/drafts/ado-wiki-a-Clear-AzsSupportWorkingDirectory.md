---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Utilities.ps1/Clear-AzsSupportWorkingDirectory"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Utilities.ps1/Clear-AzsSupportWorkingDirectory"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Clear-AzsSupportWorkingDirectory

# Synopsis

Clears the contents of the current working directory.

# Parameters

## COMPUTERNAME

Remote computer name that you want to execute the function against

## INFRASTRUCTURENODES

Switch to trigger the cleanup across all infrastructure virtual machines and baremetal nodes

## EXCLUDE

Specifies, as a string array, an item or items that this cmdlet excludes in the operation.
The value of this parameter qualifies the Path parameter. Enter a path element or pattern, such as *.txt. Wildcard characters are permitted.
