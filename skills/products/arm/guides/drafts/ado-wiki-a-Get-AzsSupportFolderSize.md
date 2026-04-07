---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Common.ps1/Get-AzsSupportFolderSize"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Common.ps1%2FGet-AzsSupportFolderSize"
importDate: "2026-04-06"
type: tool-reference
---

# CSSTools Get-AzsSupportFolderSize

## Description

This function will show the size of folders and files found in the Path parameter on a infrastructure VM or physical node, then sort by file type and size.

## Synopsis

Get the size of folders and files found in the Path parameter on a infrastructure VM or physical node.

## Parameters

### COMPUTERNAME
The remote computer you want to get folder size on. Skips C:\ClusterStorage on physical nodes.

### PATH
The folder path you want to get folder size on. Default is "C:\"

## Examples

```powershell
Get-AzsSupportFolderSize -Path "C:\temp"
Get-AzsSupportFolderSize -ComputerName "Azs-ERCS01"
Get-AzsSupportFolderSize -ComputerName "Azs-ERCS01" -Path "C:\temp"
Get-AzsSupportFolderSize -ComputerName "Azs-Node01" -Path "C:\"
```
