---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/GA/Process Explorer_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FGA%2FProcess%20Explorer_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Process Explorer for Guest Agent Troubleshooting

Short URL: https://aka.ms/azprocxp

## Scenarios

1. Determine if 3rd-party DLL is loaded in guest agent process
2. Determine if any processes are interfering with guest agent or extensions
3. Determine files loaded and handles owned by processes
4. Check for processes created by other processes or services

Process Explorer shows live information only. Use Process Monitor for recording activity.

## PowerShell Quick Check for 3rd-party Modules

```powershell
# Check WaAppAgent
(get-process waappagent).modules | where {$_.company -ne 'microsoft corporation'} | format-table -autosize modulename,company

# Check WindowsAzureGuestAgent
(get-process windowsazureguestagent).modules | where {$_.company -ne 'microsoft corporation'} | format-table -AutoSize modulename,company

# Export to CSV for customer to share
(get-process waappagent).modules | export-csv .\waappagent.csv
(get-process windowsazureguestagent).modules | export-csv .\windowsazureguestagent.csv
```

Note: Module `prxyqry.dll` can be ignored (not 3rd-party, just missing Company property).

## TSSv2 Alternative

1. Download TSSv2.zip (~60MB) from http://aka.ms/getTSSv2
2. Run from elevated PowerShell: `.\TSSv2.ps1 -sdp perf`
3. Check `<computername>_sym_Process.CSV` for non-Microsoft Corporation modules
4. Check `<computername>_sym_RunningDrivers.CSV` for non-Microsoft drivers

Mellanox driver can be safely ignored.

## Using Process Explorer

### Download

- Sysinternals Suite (~50MB): https://docs.microsoft.com/en-us/sysinternals/downloads/sysinternals-suite
- Process Explorer (~3MB): https://docs.microsoft.com/en-us/sysinternals/downloads/process-explorer
- Live run: `\\live.sysinternals.com\tools\procexp.exe`

### Key Features

- Upper pane: process tree (parent/child relationships)
- Lower pane: DLLs or handles (View > Show lower pane)
- Find Handle or DLL: Find menu > Find Handle or DLL (useful for "file in use" errors)
- Update Speed: View > Update Speed > 0.5 seconds (to catch short-lived processes)
- Green = process created, Red = process killed

### Analysis Tips

- Check for 3rd-party DLLs in process properties call stack
- If 3rd-party modules found in crashing/hanging guest agent, ask customer to temporarily uninstall that software

## Escalation

1. Update SAP to: `Azure/Virtual Machine running Windows/VM Extensions not operating correctly/VM Guest Agent issue (crash, not upgrading, or not connecting)`
2. In Azure Support Center > Escalate case > GA/PA template (ID: oC1C2i)
