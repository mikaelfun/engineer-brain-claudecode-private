---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Microsoft Identity Manager/MIM 2016 Overview/Sync Service/Troubleshooting Guides/SharePoint Connector Tracing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FMicrosoft%20Identity%20Manager%2FMIM%202016%20Overview%2FSync%20Service%2FTroubleshooting%20Guides%2FSharePoint%20Connector%20Tracing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Sharepoint Connector Tracing

To enable Sharepoint Connector tracing, you need to modify the miiserver.exe.config file.

1) Please navigate to this folder: `C:\Program Files\Microsoft Forefront Identity Manager\2010\Synchronization Service\BIN\`

2) Make a back-up of the file: `miiserver.exe.config`

3) Open the file in notepad / notepad++

4) Add this section in `<system.diagnostics>`:

```xml
<source name="SharepointConnector.ETW" switchValue="Verbose" switchType="System.Diagnostics.SourceSwitch" \>
<listeners \>
<add initializeData="c:\temp\logs\SharepointConnector.txt" type="System.Diagnostics.TextWriterTraceListener" name="SharepointConnectorEventLogListener" traceOutputOptions="LogicalOperationStack, DateTime, Timestamp,Callstack" \>

<filter type="" \>

<add \>

<listeners \>

<source \>
```

5) restart the `Forefront Identity Manager Synchronization Service` (FIMSynchronizationService / miiserver.exe)

6) Be sure that path: `c:\temp\logs\` exists and it is accessible, that the services can write into that folder
