# Petri's Get-IntuneManagementExtensionDiagnostics Tool

## Overview
PowerShell tool that analyzes Intune IME logs and presents events in a timeline view with HTML output.

## Installation
```powershell
Save-Script Get-IntuneManagementExtensionDiagnostics -Path ./
```
GitHub: https://github.com/petripaavola/Get-IntuneManagementExtensionDiagnostics

## Usage

### Analyze Log File
```powershell
.\Get-IntuneManagementExtensionDiagnostics.ps1 -LogFile "C:\Temp\Logs"
```
Generates HTML timeline; hover over app entries to see detection rules.

### Interactive Log Viewer
```powershell
.\Get-IntuneManagementExtensionDiagnostics.ps1 -ShowLogViewerUI
```
Provides detailed, friendly information view.

## Capabilities
- Win32 app deployment timeline analysis
- PowerShell script execution tracking
- ESP (Enrollment Status Page) tracking
- Detection rule visualization on hover

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Windows TSG > Win32_IME_PowerShell Script TSG
