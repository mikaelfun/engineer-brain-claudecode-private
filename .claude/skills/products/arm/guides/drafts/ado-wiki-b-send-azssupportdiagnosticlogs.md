---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Utilities.ps1/Send-AzsSupportDiagnosticLogs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Utilities.ps1/Send-AzsSupportDiagnosticLogs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Send-AzsSupportDiagnosticLogs

# Synopsis

This functions enable engineers to quickly transfer files off stamp.

# Parameters

## PATH

The source file or folder that you want to move

## OUTPUTPATH

The destination path you want to transfer the file to. This Output path is local system only and designed only if there is an existing mapped network drive.

## OUTPUTSHAREPATH

Used to define a network share path that you want to send the file(s) to. It will execute New-AzsSupportNetworkShare to create a new mapped network drive.

## OUTPUTSHAREPATHCREDS

Credentials used to access the network share location.

## OUTPUTSHAREDRIVELETTER

The drive letter that you want to use to map the network drive to.

# Examples

## Example 1

```powershell
Send-AzsSupportDiagnosticLogs
```

## Example 2

```powershell
Send-AzsSupportDiagnosticLogs -Path "C:\Temp\CSS"
```

## Example 3

```powershell
Send-AzsSupportDiagnosticLogs -Path C:\Temp\CSS -OutputPath X:\Share
```

## Example 4

```powershell
Send-AzsSupportDiagnosticLogs -Path C:\Temp\CSS -OutputSharePath "\\xx.xx.xx.xx\share" -OutputSharePathCreds (Get-Credential) -OutputShareDriveLetter X
```
