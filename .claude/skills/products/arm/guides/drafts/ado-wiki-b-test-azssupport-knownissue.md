---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/knownIssues/Azs.Support.KnownIssues.Core.Helper.ps1/Test-AzsSupportKnownIssue"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2FknownIssues%2FAzs.Support.KnownIssues.Core.Helper.ps1%2FTest-AzsSupportKnownIssue"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Test-AzsSupportKnownIssue

# Synopsis

Executes a suite of known issue and infrastructure health checks.

# Parameters

## ROLE

Specify the role you want to execute known issue functions for. If ommitted, it will execute known issue functions for all roles

# Examples

## Example 1

```powershell
Test-AzsSupportKnownIssue
```

## Example 2

```powershell
Test-AzsSupportKnownIssue -Role:Storage
```
