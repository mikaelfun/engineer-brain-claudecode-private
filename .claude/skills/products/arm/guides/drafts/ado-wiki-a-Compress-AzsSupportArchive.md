---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Utilities.ps1/Compress-AzsSupportArchive"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Utilities.ps1/Compress-AzsSupportArchive"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Compress-AzsSupportArchive

# Synopsis

Creates a zip archive that contains the files and directories from the specified directory

# Parameters

## PATH

Specifies the path to the directory that you wish to compress. All files and subfolders in a directory are added to your archive file by default.

## DESTINATION

Specifies the output location of the archive directory. Path defined should contain the absolute path including the .zip extension.

## COMPRESSIONLEVEL

Specifies how much compression to apply when you are creating the archive file. Faster compression requires less time to create the file, but can result in larger file sizes.
If this parameter is not specified, the command uses the default value, Optimal.

# Examples

## Example 1

```powershell
Compress-AzsSupportArchive -Path C:\Example\Logs -Destination "$(Get-AzsSupportWorkingDirectory)\Logs.zip"
```

## Example 2

```powershell
Compress-AzsSupportArchive -Path C:\Example\Logs -Destination "$(Get-AzsSupportWorkingDirectory)\Logs.zip" -CompressionLevel Optimal
```
