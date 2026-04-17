---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy - Stopping Data Collector Script on string match in the trace log"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20-%20Stopping%20Data%20Collector%20Script%20on%20string%20match%20in%20the%20trace%20log"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Background

There are issues that cannot be replicated at will. The customer must spend lots of time with the data collection waiting for the error happens. In some cases the customer stops the data collector script too late and the support must realize that the new data has overwritten the data we wanted to catch in the circular buffer of the logs.

## Goal

This article gives you a simple example what steps must be taken to stop the data collection by the Microsoft Entra private network connector Data Collector when a call stack contains a specific string in the trace file.

After the Microsoft Entra Application Proxy Service has started it always opens a new log file under `$env:ProgramData\Microsoft\Microsoft Entra Private Network Connector\Trace\`. The format of the file name is `MicrosoftEntraPrivateNetworkConnector_GUID.log`. Call stacks handled by the service will be written into the log file.

## Typical Error Pattern in Trace Log

```
MicrosoftEntraPrivateNetworkConnectorService.exe Error: 0 : Relay service host for endpoint '...' entered into faulted state. Starting timer to create new service host.
MicrosoftEntraPrivateNetworkConnectorService.exe Error: 0 : Error occured while trying to start the connector listener '...'. Current State: 'Faulted', Exception: 'System.ServiceModel.CommunicationException: Unable to reach cwap-eur1-dwc2.servicebus.windows.net HTTP (80, 443) ...'
```

## Important

+ Starting version 15 the Data Collector script supports the feature stopping on stop.txt
+ Before you use this approach, please ensure: the computer hosting the connector has enough free memory (at least 4 GB) and there is enough hard disk place (10 GB or more) on the drive where the collected data will be stored.
+ The service trace (-ServiceTraceOn) is not written into a circular buffer.
+ To avoid memory leaks and other problems the customer should monitor (check periodically) the computers running the data collection. It's recommended to stop and restart the data collection every day.
+ The continuous data collection might cause performance issues
+ The customer must be informed about all above

## Using the MEPCTraceStopv1.ps1 Script

+ The script must be run in PowerShell prompt (not PowerShell ISE)
+ The PowerShell prompt must be run as administrator
+ The script must be configured correctly. If possible, assist your customer with this.

## Steps

1. Create the directory for storing the data (e.g. C:\MSLOGS)
2. Download MEPCTraceStopv1.zip and extract into C:\MSLOGS
3. Start data collection: `.\ME-AP-tracingVXX.ps1 -Path C:\MSLOGS -ServiceTraceOn` (**Only if needed!**)
4. Open a new PowerShell prompt as administrator and navigate to C:\MSLOGS
5. Edit `MEPCTraceStopv1.ps1`:
   - Set `$dataCollectorDirandFile` to `"C:\MSLOGS\stop.txt"`
   - Set `$stopString` to the unique string to match, e.g. `"System.ServiceModel.CommunicationException: Unable to reach"`
6. Run `.\MEPCTraceStopv1.ps1`
7. The script can be stopped by keypress or it will stop once it detects the matching call stack in the log. Detection interval is 30 sec. It creates stop.txt to stop the Data Collector.
