# AVD Diagnostic Logs & Data Collection Tools (OneNote)

## Data Collection Tool: MSRD-Collect

> AVD-Collect has been replaced by **MSRD-Collect**. Use MSRD-Collect from now on.

- ADO Wiki: https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/665066/MSRD-Collect
- Script download: https://aka.ms/avd-collect
- Duration: ~10 minutes
- Output: generates logs in local directory

## FSLogix Log Locations

- Tray tool: `C:\Program Files\FSLogix\Apps\frxtray.exe`
- Event logs: `%SystemRoot%\System32\Winevt\Logs\Microsoft-FSLogix*` (4 files)
- Application logs: `%ProgramData%\FSLogix\Logs\` (all files)

## Domain Join Logs

- `C:\Windows\Debug\netsetup.log`
- `C:\WindowsAzure\Logs\Plugins\Microsoft.Compute.JsonADDomainExtension\`

## Portal Trace Collection

When investigating Azure Portal issues (e.g. missing user sessions, incorrect display):

1. Open Azure Portal → navigate to affected WVD blade
2. Press F12 → go to "Network" tab
3. Clear console
4. Refresh the affected tab to reproduce the issue
5. Inspect the response body for VM/user session info
6. Check if the issue is portal-side or API-side
7. If API issue → engage PG via IcM

## Windows Performance Toolkit

- **WPR** (Windows Performance Recorder): ETW-based performance recording tool
  - Doc: https://docs.microsoft.com/en-us/windows-hardware/test/wpt/windows-performance-recorder
- **WPA** (Windows Performance Analyzer): Creates graphs/tables from ETL files
  - Doc: https://docs.microsoft.com/en-us/windows-hardware/test/wpt/windows-performance-analyzer

## Log and Registry Reference

Full reference: https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464429/Log-and-Registry-Locations
