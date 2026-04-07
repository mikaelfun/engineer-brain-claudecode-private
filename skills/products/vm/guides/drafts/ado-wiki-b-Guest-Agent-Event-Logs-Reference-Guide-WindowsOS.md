---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/GA/Guest Agent Event Logs Reference Guide for WindowsOS_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FTSGs%2FGA%2FGuest%20Agent%20Event%20Logs%20Reference%20Guide%20for%20WindowsOS_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Guest Agent Event Logs Reference Guide for Windows OS

This TSG provides a curated list of Windows Event Log entries associated with Azure Guest Agent issues. It captures their source, event IDs, sample messages, and interpretations to aid in root cause identification and resolution.

## Guest Agent & Related Event Logs

| Event ID | Source | Verbatim Message | Trigger / Scenario | Log Location Path |
|----------|--------|-------------------|---------------------|-------------------|
| 7034 | Service Control Manager | The Windows Azure Guest Agent service terminated unexpectedly. | Guest Agent crashed unexpectedly | System |
| 7034 | Service Control Manager | The RdAgent service terminated unexpectedly. | RdAgent crashed unexpectedly | System |
| 7031 | Service Control Manager | The Windows Azure Guest Agent service terminated unexpectedly. It has done this 1 time(s). The following corrective action will be taken in 10000 milliseconds: Restart the service. | Guest Agent crashed, restart triggered | System |
| 7031 | Service Control Manager | The RdAgent service terminated unexpectedly. It has done this 1 time(s). The following corrective action will be taken in 10000 milliseconds: Restart the service. | RdAgent crashed, restart triggered | System |
| 7030 | Service Control Manager | The Windows Azure Guest Agent service is marked as an interactive service. However, the system is configured to not allow interactive services. | Guest Agent service marked as interactive (unsupported) | System |
| 7000 | Service Control Manager | The Windows Azure Guest Agent service failed to start due to the following error: The service did not respond to the start or control request in a timely fashion. | Guest Agent failed to start - timeout (Error 1053) | System |
| 7009 | Service Control Manager | A timeout was reached (30000 milliseconds) while waiting for the Windows Azure Guest Agent service to connect. | Timeout while starting Guest Agent service | System |
| 7036 | Service Control Manager | The Windows Azure Guest Agent service entered the stopped state. | SCM logged Guest Agent service entering "Stopped" state | System |
| 7036 | Service Control Manager | The RdAgent service entered the stopped state. | SCM logged RdAgent service entering "Stopped" state | System |
| 1000 | Application Error | Faulting application name: WindowsAzureGuestAgent.exe, Faulting module name: KERNELBASE.dll | Guest Agent crash — application fault | Application |
| 1000 | Application Error | Faulting application name: RdAgent.exe, Faulting module name: msvcrt.dll | RdAgent crash — application fault | Application |
| 1026 | .NET Runtime | Application: WindowsAzureGuestAgent.exe — Description: The process was terminated due to an unhandled exception. | Guest Agent crash due to unhandled .NET exception | Application |
| 0 | WindowsAzureGuestAgent | Service stopped successfully. | Guest Agent service stopped gracefully | Application |
| 4657 | Microsoft Windows Security-Auditing | A registry value was modified. Subject: SYSTEM. Registry Key: HKLM\SYSTEM\CurrentControlSet\Control\WMI\Autologger\AzureGuestAgent | Agent tracing/diagnostics triggered (expected if audit enabled) | Security |
| 9 | WindowsAzureGuestAgent | Exception processing extension HandlerName... Extension Processing reported to be failed. | Extension error | Microsoft-WindowsAzure-Status/Plugins |

## Log Location Paths

All event logs are located under: `InspectIaaSDisk-logs\device_0\Windows\System32\winevt\Logs\`

- **System logs**: Service Control Manager events (7034, 7031, 7030, 7000, 7009, 7036)
- **Application logs**: Application Error (1000), .NET Runtime (1026), WindowsAzureGuestAgent (0)
- **Security logs**: Registry audit events (4657)
- **Plugin logs**: Extension processing events (9) under `Microsoft-WindowsAzure-Status/Plugins`
