---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Invoke-AzsSupportSddcLogCollection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Invoke-AzsSupportSddcLogCollection"
importDate: "2026-04-06"
type: cmdlet-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Invoke-AzsSupportSddcLogCollection

# Synopsis

Invokes Get-SddcDiagnosticInfo independently of Azure Stack Log collection.

# Parameters

## CLUSTER

The cluster name you will be invoking Get-SddcDiagnosticInfo against. Defaults to s-cluster.

## INCLUDEDUMPFILES

Include minidumps and live kernel report dumps.

# Examples

## Example 1

```powershell
Invoke-AzsSupportSddcLogCollection
```

## Example 2

```powershell
Invoke-AzsSupportSddcLogCollection -Cluster s-cluster
```

## Example 3

```powershell
Invoke-AzsSupportSddcLogCollection -Cluster s-cluster -IncludeDumpFiles
```
