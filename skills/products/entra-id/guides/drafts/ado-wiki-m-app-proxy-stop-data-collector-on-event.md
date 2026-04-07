---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy - Stopping Data Collector Script on event occurrence in the event log"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20-%20Stopping%20Data%20Collector%20Script%20on%20event%20occurrence%20in%20the%20event%20log"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Background

There are issues that cannot be replicated at will. The customer must spend lots of time with the data collection waiting for the error happens. In some cases the customer stops the data collector script too late and the support must realize that the new data has overwritten the data we wanted to catch in the circular buffer of the logs.

## Goal

This article gives you a simple example what steps must be taken to stop the data collection by the Microsoft Entra Application Proxy Connector Data Collector when a specific event is recorded it the event log.

## Important

+ Starting version 15 the Data Collector script supports the feature stopping on stop.txt
+ Before you use this approach, please ensure: the computer hosting the connector has enough free memory (at least 4 GB) and there is enough hard disk place (10 GB or more) on the drive where the collected data will be stored.
+ The service trace (-ServiceTraceOn) is not written into a circular buffer.
+ To avoid memory leaks and other problems the customer should monitor (check periodically) the computers running the data collection. It's recommended to stop and restart the data collection every day.
+ The continuous data collection might cause performance issues
+ The customer must be informed about all above

## Example

1. Create the directory for storing the data. Like C:\MSLOGS
2. Ensure that the SYSTEM account has Write permission on the folder.
3. Create a batch file called stop.bat

`copy NUL C:\MSLOGS\stop.txt`

4. Start the data collection in PowerShell like `.\ME-AP-tracingV21.ps1 -Path C:\MSLOGS -ServiceTraceOn` (**Only if needed!**) and press a key to start capturing.
5. Start the **Event Viewer** and locate the event you want to catch. Do a right click on it and chose **Attach Task To This Event...** in the context menu.
6. Click through the wizard:
   - Ensure **Start a program** is specified
   - At **Program / Script** add the batch file path like C:\MSLOGS\stop.bat
   - Click **Finish**
7. Once the event gets raised, the file stop.txt gets created and the data collection stops in 20 seconds at the latest.
8. If the task is not needed anymore, you can remove or disable it in **Task Scheduler** anytime.
