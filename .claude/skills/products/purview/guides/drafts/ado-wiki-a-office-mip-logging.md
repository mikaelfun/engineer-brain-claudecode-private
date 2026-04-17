---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MIP SDK/Learn: MIP SDK/Learn: Office MIP Logging"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMIP%20SDK%2FLearn%3A%20MIP%20SDK%2FLearn%3A%20Office%20MIP%20Logging"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Office MIP Logging

Office is moving M365 versions to using the MIP SDK for file encryption/decryption. This replaces the MSIPC client. Office will continue using the MSIPC client for fallback purposes.

Office on Windows legacy MSIPC encryption/decryption functions log their transactions in the MSIPC logs: `%localappdata%\Microsoft\MSIPC\Logs`.

## Office Diagnostic Logging

### Compliance Utility Tool

One may use the [Compliance Utility](https://aka.ms/ComplianceUtility/manual) to configure and collect the Office diagnostic logging.
- [Record a problem](https://github.com/microsoft/ComplianceUtility/blob/main/Manuals/3.2.1/Manual-Win.md#record-problem) will configure for the diagnostic logging.
- [Compress Logs](https://github.com/microsoft/ComplianceUtility/blob/main/Manuals/3.2.1/Manual-Win.md#z-compress-logs---compresslogs-) gathers all the logging (and more!) into a .zip archive.

### Manual Collection

While Office has default logging the MIP SDK activities are not captured there. One must enable advanced Office logging to capture these events.
- This is covered in [Collecting Office IRM Diagnostic Logs (OWiki)](https://www.owiki.ms/wiki/IRM/Microsoft/Documentation/IRM_Troubleshooting_FAQ#Collecting_Office_IRM_Diagnostic_Logs)
- NOTE: When you are finished, be sure to clear the registry values again since logging slows Office down somewhat and consumes disk space.
- NOTE: The registry values below are specified in hexadecimal.
- Launch the application, run through the scenario, then close the app.
- Wait a minute to make sure the logfile buffer is written to disk.
- MSIPC logs will be at `%LOCALAPPDATA%\Microsoft\MSIPC\Logs\*.ipclog`

#### M365 Office builds starting 16.0.10301.10000

```registry
[HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\Common\Logging]
"EnableLogging"=dword:00000001
"DefaultMinimumSeverity"=dword:00000064
```

The log will end up in your temp directory (`%TEMP%`) with a name like `COMPUTERNAME-yyyymmdd-<number>.log`.

### Determine if MIP SDK is being used

The presence of any/all of the following folders indicates the MIP SDK is in use:
- `%localappdata%\Microsoft\Word\MIPSDK\mip`
- `%localappdata%\Microsoft\Excel\MIPSDK\mip`
- `%localappdata%\Microsoft\PowerPoint\MIPSDK\mip`
- `%localappdata%\Microsoft\Outlook\MIPSDK\mip`

Newer versions of the Office apps use:
- `%localappdata%\Microsoft\Office\MIPSDK\`

### Clearing the Cache

Do not clear the cache for every issue. Only clear when:
1. Seeing inconsistent behavior across Office builds
2. Seeing inconsistent behavior between users
3. Using encryption for the first time and it fails or gives an error

To clear the cache:
1. Delete the contents of `%localappdata%\Microsoft\<APPNAME>\MIPSDK\mip` and `%localappdata%\Microsoft\Office\MIPSDK\`
2. Also delete the content of `%LocalAppData%\Microsoft\Office\CLP` folder.
3. Restart the app and retry

## Reading Office MIP Logs

These logs are ULS logs. They may be parsed by any text editor. However there is a ULS specific Microsoft tool.

### Tools

- Download the ULS Viewer from [here](https://www.microsoft.com/en-us/download/details.aspx?id=44020).

### ULS Logs

1. Using the ULS Viewer review each log generated during the logging session.
2. Most MIP items should contain a `MIPLOG` string. This may be used as a filter.
