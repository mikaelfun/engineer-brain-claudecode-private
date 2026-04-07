---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/VM Insights/How-To/How to Capture Event Table Logs for Azure Monitor Agent for Windows"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FVM%20Insights%2FHow-To%2FHow%20to%20Capture%20Event%20Table%20Logs%20for%20Azure%20Monitor%20Agent%20for%20Windows"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Capture Event Table Logs for Azure Monitor Agent (Windows)

## Steps

### 1. Locate table2csv.exe

The application is installed with the AMA agent at:
```
C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{AGENT_VERSION}\Monitoring\Agent\table2csv.exe
```
Example: `C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.1.2.0\Monitoring\Agent\table2csv.exe`

> **Note**: Multiple agent versions may be installed. Always use the newest version.

### 2. Navigate to AMA Data Store

Open Command Prompt or PowerShell as Administrator and navigate to:
```
C:\WindowsAzure\Resources\{GUID}.{VMName}.AMADataStore\Tables
```

### 3. Convert and collect logs

Run:
```
{PATH_TO_TABLE2CSV}\table2csv.exe MAEventTable.tsf
```

Example:
```
C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.1.2.0\Monitoring\Agent\table2csv.exe MAEventTable.tsf
```

### 4. Collect the resulting `MAEventTable.csv` file for analysis
