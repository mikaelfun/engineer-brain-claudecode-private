---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/GA/Procmon_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FGA%2FProcmon_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Process Monitor (Procmon) for Guest Agent Troubleshooting

Short URL: https://aka.ms/azprocmon

## Scenarios

- "File Not Found" errors — Procmon tracks file and registry access
- Suspected 3rd-party software/DLL interference
- Processes interfering with Guest Agent or extensions
- Missing permissions (Access Denied in file access)

## Download

- Sysinternals Suite (~50MB): https://docs.microsoft.com/en-us/sysinternals/downloads/sysinternals-suite
- Process Monitor (~3MB): https://docs.microsoft.com/en-us/sysinternals/downloads/procmon

## Collecting a Trace

1. Prepare VM for issue reproduction
2. Run procmon.exe as admin, start capture (leave filter dialog as-is)
3. Wait for error (max 5-7 minutes to avoid memory pressure)
4. Stop capture, File > Save (PML format)
5. Zip the .PML file

Note: Procmon can collect boot-time traces for startup issues.

## Guest Agent Process Names

| Service Name | Display Name | Process Name |
|---|---|---|
| RdAgent | RdAgent | WaAppAgent.exe |
| Windows Azure Guest Agent | WindowsAzureGuestAgent | WindowsAzureGuestAgent.exe |

WindowsAzureTelemetryService was deprecated after version 2.7.41491.971 (functionality moved to RdAgent).

## Filtering Strategies

1. **Show only changes**: Filter for `Category is Write`
2. **Include filters**: Filter by specific process names (WaAppAgent.exe, WindowsAzureGuestAgent.exe)
3. **Exclude filters**: Exclude irrelevant processes

### Permissions Issues

Filter on Result column for "DENIED" to find Access Denied errors. Check if customer modified default permissions or uses low-privileged service account.

### 3rd-party Interference

Look for unusual patterns:
- 3rd-party files being accessed by guest agent installer (e.g., ExtremeCopy.exe called by msiexec.exe)
- .NET profiler injected into Installutil.exe (used by guest agent for service installation)
- Antivirus DLLs (Kaspersky, Symantec) injected into processes

**Important**: Avoid blaming 3rd-party software purely based on presence. Have customer uninstall and test reproduction.

## BUFFER OVERFLOW Result

STATUS_BUFFER_OVERFLOW is normal — program requests variable-length data with insufficient buffer, system reports required size, program retries with correct size. Usually not relevant for troubleshooting.

## Common Result Codes

| Result | Meaning |
|---|---|
| SUCCESS | Operation succeeded |
| ACCESS DENIED | Security descriptor doesn't grant requested rights |
| NAME NOT FOUND | Object doesn't exist |
| SHARING VIOLATION | Object already opened with incompatible sharing mode |
| BUFFER TOO SMALL | Same as BUFFER OVERFLOW, rarely significant |
| KEY DELETED | Operation on registry key marked for deletion |

## Escalation

1. Update SAP: `Azure/Virtual Machine running Windows/VM Extensions not operating correctly/VM Guest Agent issue (crash, not upgrading, or not connecting)`
2. Azure Support Center > Escalate case > GA/PA template (ID: oC1C2i)
