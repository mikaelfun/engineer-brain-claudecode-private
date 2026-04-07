---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Windows Azure Diagnostics (WAD)/How-To/HT: Verify if WAD is enabled on cloud service in Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FWindows%20Azure%20Diagnostics%20(WAD)%2FHow-To%2FHT%3A%20Verify%20if%20WAD%20is%20enabled%20on%20cloud%20service%20in%20Azure%20Support%20Center"
importDate: "2026-04-07"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

::: template /.templates/Note-ASCGetPermissions.md
:::

# Instructions
---
:::template /.templates/AzMon-OpenASCFromSupportRequest.md
:::

:::template /.templates/ASC-NavigateToResourceExplorer.md
:::

1. Nativate to Cloud Service under Resource Provider Microsoft.Compute. [How to navigate to a resource in Azure Support Center](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/503141/How-to-navigate-to-a-resource-in-Azure-Support-Center)

2. Under **Properties** tab, click **Extension Profile** to move on extension configuration:
![image.png](/.attachments/image-34882f23-6f4f-4c42-94b7-da7c435412ca.png)

3. Under **Extension Profile**, verify if you can find Extension Name as Microsoft.Insights.VMDiagnosticsSettings_<role name>, if yes, WAD is enabled in Cloud service and you can find WAD details and status, especially take care of the role applied to:
- Applied to worker role:
![image.png](/.attachments/image-ae75b901-3bd1-40c6-83bc-84f667d410c0.png)

- Applied to web role:
![image.png](/.attachments/image-87e4dff8-76ec-428e-b55d-01cd7b99c647.png)

- Detailed settings under Settings field, see below example:
```
<PublicConfig xmlns="http://schemas.microsoft.com/ServiceHosting/2010/10/DiagnosticsConfiguration"> <WadCfg> <DiagnosticMonitorConfiguration overallQuotaInMB="4096" sinks="applicationInsights.errors"> <DiagnosticInfrastructureLogs scheduledTransferLogLevelFilter="Error" /> <Directories scheduledTransferPeriod="PT1M"> <IISLogs containerName="wad-iis-logfiles" /> <FailedRequestLogs containerName="wad-failedrequestlogs" /> </Directories> <PerformanceCounters scheduledTransferPeriod="PT1M"> <PerformanceCounterConfiguration counterSpecifier="\Memory\Available MBytes" sampleRate="PT3M" /> <PerformanceCounterConfiguration counterSpecifier="\Web Service(_Total)\ISAPI Extension Requests/sec" sampleRate="PT3M" /> <PerformanceCounterConfiguration counterSpecifier="\Web Service(_Total)\Bytes Total/Sec" sampleRate="PT3M" /> <PerformanceCounterConfiguration counterSpecifier="\ASP.NET Applications(__Total__)\Requests/Sec" sampleRate="PT3M" /> <PerformanceCounterConfiguration counterSpecifier="\ASP.NET Applications(__Total__)\Errors Total/Sec" sampleRate="PT3M" /> <PerformanceCounterConfiguration counterSpecifier="\ASP.NET\Requests Queued" sampleRate="PT3M" /> <PerformanceCounterConfiguration counterSpecifier="\ASP.NET\Requests Rejected" sampleRate="PT3M" /> <PerformanceCounterConfiguration counterSpecifier="\Processor(_Total)\% Processor Time" sampleRate="PT3M" /> </PerformanceCounters> <WindowsEventLog scheduledTransferPeriod="PT1M"> <DataSource name="Application!*[System[(Level=1 or Level=2 or Level=3)]]" /> <DataSource name="Windows Azure!*[System[(Level=1 or Level=2 or Level=3 or Level=4)]]" /> </WindowsEventLog> <CrashDumps> <CrashDumpConfiguration processName="WaIISHost.exe" /> <CrashDumpConfiguration processName="WaWorkerHost.exe" /> <CrashDumpConfiguration processName="w3wp.exe" /> </CrashDumps> <Logs scheduledTransferPeriod="PT1M" scheduledTransferLogLevelFilter="Error" /> <Metrics resourceId="/subscriptions/xxxx/resourceGroups/TEST-RG/providers/Microsoft.Compute/cloudServices/cloud1" /> </DiagnosticMonitorConfiguration> <SinksConfig> <Sink name="applicationInsights"> <ApplicationInsights>xxxx</ApplicationInsights> <Channels> <Channel logLevel="Error" name="errors" /> </Channels> </Sink> </SinksConfig> </WadCfg> <StorageAccount>xxxx</StorageAccount> <StorageType>TableAndBlob</StorageType> </PublicConfig>
```
