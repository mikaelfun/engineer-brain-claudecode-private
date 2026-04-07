# RMS Connector Troubleshooting

> Source: OneNote — Mooncake POD Support Notebook / Information Protection (AIP) / RMS Connector
> Status: draft (from onenote-extract)

## ADO Wiki Reference
https://dev.azure.com/SupportabilityWork/Azure%20Security/_wiki/wikis/Information%20Protection/1910/RMS-Connector

## Log Locations

### RMS Connector Installation Log
```
%LocalAppData%\Temp\Microsoft Rights Management connector_<date and time>.log
```

### RMS Connector Event Log
- Location: **Event Viewer → Application**
- Source: `Microsoft RMS connector`

### SharePoint MSIPC Log
```
C:\ProgramData\Microsoft\MSIPC\Server
```

### SharePoint Event Log
- **Event Viewer → Application**
- **Event Viewer → Applications and Services Logs → Microsoft → SharePoint Products**
