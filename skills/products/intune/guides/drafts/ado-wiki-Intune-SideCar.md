---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Intune SideCar"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FIntune%20SideCar"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune SideCar

**Page Owner:** Jason Scott (jascott@microsoft.com)

## Intune Management Extension (SideCar)

SideCar is the internal name for the **Intune Management Extension (IME)** — the agent that extends Windows MDM capabilities on managed devices. IME enables features that are not natively available through the Windows MDM channel, including:

- **PowerShell script execution** and **Remediation scripts**
- **Custom Compliance Policies**
- **Win32 and WinGet app deployment**
- **Application inventory**

## Subpages

| Page | Description |
| ------ | ------------- |
| Windows IME | Full troubleshooting guide for the IME agent on Windows — client details, logs, PowerShell scripts, Win32/WinGet app deployment, and on-demand remediation |
| IC3 Notification Channel | IC3 (Fast Channel) — the new push notification channel replacing WNS for improved reliability and diagnostics |

## Quick Reference

| Item | Details |
| ------ | --------- |
| **Service Name** | `IntuneManagementExtension` |
| **Executable** | `C:\Program Files (x86)\Microsoft Intune Management Extension\Microsoft.Management.Services.IntuneWindowsAgent.exe` |
| **Log Location** | `%ProgramData%\Microsoft\IntuneManagementExtension\Logs` |
| **Registry Root** | `HKLM\SOFTWARE\Microsoft\IntuneManagementExtension` |

## How to Get Help with Cases

For SideCar/IME-related cases, start with the Windows IME troubleshooting guide. If you need further assistance, reach out to the IME scenario owners or escalate through the standard Intune support channels.
