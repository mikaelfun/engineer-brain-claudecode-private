---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Restart-AzsSupportClusterHealthService"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Restart-AzsSupportClusterHealthService"
importDate: "2026-04-06"
type: tool-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Restart-AzsSupportClusterHealthService

# Synopsis

Restarts the cluster health service using appropriate methods depending on stamp version

# Parameters

## CLUSTER

Defaults to management cluster defined in ECE (s-cluster)

# Examples

## Example 1

```powershell
Restart-AzsSupportClusterHealthService
```

## Example 2

```powershell
Restart-AzsSupportClusterHealthService -Cluster "s-cluster"
```


