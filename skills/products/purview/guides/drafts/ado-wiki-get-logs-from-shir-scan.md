---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/How To/Get the logs from Self-Host IR scan"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FHow%20To%2FGet%20the%20logs%20from%20Self-Host%20IR%20scan"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Solution: 
Self Host Logs will not appear in Kusto; this means you will need to look into the event viewer under the  
"Connecters - Integration Runtime" log. 
 
There are Three options on how to get logs from the customer (detailed instructions below). 
1. Send Logs options 
2. Ask them send the event viewer logs. This is painful because you will need to browse through the logs to find the error. Hopefully you'll spot the errors right away - but sometimes it's not an error your looking for. 
3. Powershell to Text. This is the easiest to parse. 
 
 
## Option 1: Send Logs 
1. Ask the Customer to Send Logs in the Integration runtime  
2. A report Id will appear. The customer must send this information. 
3. Wait 20+ minutes and the logs will be in ADF 

```
Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://azuredm.kusto.windows.net/AzureDataMovement 
TraceGatewayLocalEventLog 
| where UserReportId contains "report-id-from-customer" 
```
 
 
## Option 2: UI Approach to get Logs 
 
1. Open the self host console 
2. View the logs from the console View Logs button under the diagnostic window 
3. Event Viewer will popup. Make sure you have the proper item selected. 

 
## Option 3: PowerShell 
 
```
Get-WinEvent -LogName * 
 
Get-WinEvent -LogName "Connectors - Integration Runtime" | Format-List -Property Message 
```
