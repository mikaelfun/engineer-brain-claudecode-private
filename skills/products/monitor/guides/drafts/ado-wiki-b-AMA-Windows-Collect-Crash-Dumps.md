---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Collect crash dumps"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Collect%20crash%20dumps"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
When the application is crashing, our Product Group (PG) will likely require crash dumps to investigate the root cause.

[Collecting User-Mode Dumps - Win32 apps | Microsoft Learn](https://learn.microsoft.com/en-us/windows/win32/wer/collecting-user-mode-dumps)

# PowerShell
1. Configure the system to create crash dumps

```
# 1. Define and Create the Physical Folder
# We expand the variable first to ensure the folder is created in the actual user path
$targetFolder = "C:\CrashDumps"

if (-not (Test-Path $targetFolder)) {
    New-Item -Path $targetFolder -ItemType Directory -Force | Out-Null
    Write-Host "Created physical folder: $targetFolder" -ForegroundColor Cyan
}

# 2. Define the Registry Path
$registryPath = "HKLM:\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps"

# 3. Create the Registry Key if it doesn't exist
if (-not (Test-Path $registryPath)) {
    New-Item -Path $registryPath -Force | Out-Null
    Write-Host "Created registry key: $registryPath" -ForegroundColor Cyan
}

# 4. Set the Registry Values
Set-ItemProperty -Path $registryPath -Name "DumpFolder" -Value "C:\CrashDumps" -Type ExpandString
Set-ItemProperty -Path $registryPath -Name "DumpCount" -Value 10 -Type DWord
Set-ItemProperty -Path $registryPath -Name "DumpType" -Value 2 -Type DWord

Write-Host "Success! Registry configured and folder verified." -ForegroundColor Green
```

2. Verify crash dumps were created
```
$targetFolder = "C:\CrashDumps"
Get-ChildItem $targetFolder
```

3. Remove the crash dump configuration

```
# 1. Define the Registry Path
$registryPath = "HKLM:\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps"

# 2. Remove the Registry Key and all its values
if (Test-Path $registryPath) {
    Remove-Item -Path $registryPath -Recurse -Force
    Write-Host "Removed registry key: $registryPath" -ForegroundColor Yellow
} else {
    Write-Host "Registry key not found. Nothing to delete." -ForegroundColor Gray
}

# 3. Optional: Remove the physical folder
# WARNING: This will delete any existing .dmp files inside that folder.
$targetFolder = "C:\CrashDumps"

if (Test-Path $targetFolder) {
    # Check if the folder is empty before deleting, or just force it:
    Remove-Item -Path $targetFolder -Recurse -Force
    Write-Host "Deleted physical folder and any contained dumps: $targetFolder" -ForegroundColor Yellow
}

Write-Host "Rollback complete. Windows Error Reporting is back to default behavior." -ForegroundColor Green
```