---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Storage.Acs.ps1/Get-AzsSupportSClusterFileSize"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Storage.Acs.ps1/Get-AzsSupportSClusterFileSize"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSSTools Get-AzsSupportSClusterFileSize

## Synopsis
Gets file size in s-cluster from local file path.

## Parameters
- **FILEPATH**: The local file path in s-cluster

## Examples
```powershell
Get-AzsSupportSClusterFileSize -FilePath "C:\ClusterStorage\Volume1\xxx"
```

## Outputs
PSCustomObject
