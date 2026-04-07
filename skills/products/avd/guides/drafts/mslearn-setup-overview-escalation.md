# AVD Troubleshooting Overview & Escalation Tracks

> Source: [Troubleshooting overview, feedback, and support for Azure Virtual Desktop](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-set-up-overview)

## Pre-check

Before troubleshooting, always check:
- [Azure Status Page](https://azure.status.microsoft/status)
- [Azure Service Health](https://azure.microsoft.com/features/service-health/)

## Diagnostic Tools

- **Azure Virtual Desktop Insights** — Azure Monitor workbook dashboard for quick issue identification
- **Log Analytics** — Kusto query-based diagnostic feature for deeper analysis

## Escalation Matrix

| Issue | Action |
|-------|--------|
| VNet / ExpressRoute settings | Azure support → Networking category |
| VM creation (not using ARM templates) | Azure support → Azure Virtual Desktop service |
| ARM template errors | See host pool creation troubleshooting |
| Portal management issues | Azure support → Azure Virtual Desktop |
| PowerShell config management | See AVD PowerShell troubleshooting |
| Host pool / App group config | See AVD PowerShell troubleshooting or Azure support |
| FSLogix Profile Containers | FSLogix troubleshooting guide → Azure support → FSLogix problem type |
| Remote Desktop client malfunction | Client troubleshooting → Azure support → Remote Desktop clients |
| Connected but no feed | See service connection troubleshooting (no feed section) |
| Feed discovery (network) | User contacts network administrator |
| Connecting clients | Service connection → VM configuration troubleshooting |
| Desktop/app responsiveness | Contact product-specific team |
| Licensing errors | Contact product-specific team |
| Third-party auth tools | Verify provider supports AVD scenarios |
| Log Analytics issues | Azure support → diagnostics schema or Log Analytics problem type |
| Microsoft 365 app issues | Microsoft 365 admin center |

## External Resources

- [App Assure](https://learn.microsoft.com/en-us/microsoft-365/fasttrack/windows-and-other-services#app-assure) — free Microsoft service for application compatibility issues
- [Azure Virtual Desktop Tech Community](https://techcommunity.microsoft.com/t5/azure-virtual-desktop/bd-p/AzureVirtualDesktopForum) — feature requests and best practices
