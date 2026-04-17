---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Microsoft Identity Manager/MIM 2016 Overview/Service and Portal/Troubleshooting Guides/How to enable service tracing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FMicrosoft%20Identity%20Manager%2FMIM%202016%20Overview%2FService%20and%20Portal%2FTroubleshooting%20Guides%2FHow%20to%20enable%20service%20tracing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
Enabling MIM Service tracing will be useful for advance diagnosing. Please follow the steps below.

**Note**: Before you update the Web.config file, you should take a backup of the original file.

1. Open the following file: 

`...\Microsoft Forefront Identity Manager\2010\Service\Microsoft.ResourceManagement.Service.exe.config`

2. Follow this guidance exactly: 

	
```
<!-- 
	       Full Diagnostics configuration. 
	       
	       Uncomment the following section and replace the default <system.diagnostics> configuration to 
	       enable all trace sources and obtain all available traces for Microsoft.ResourceManagement.Service 
	  -->
```
3. In that enhanced logging section, be sure to modify the path, pointing to some folder where you have write permissions.


	
```
<sharedListeners>
	  <add initializeData="c:\temp\logs\Microsoft.ResourceManagement.Service_tracelog.svclog"
	    type="System.Diagnostics.XmlWriterTraceListener, System, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"
	    name="ServiceModelTraceListener" traceOutputOptions="LogicalOperationStack, DateTime, Timestamp, ProcessId, ThreadId, Callstack">
	    <filter type="" />
	  </add>
	  <add initializeData="c:\temp\logs\Microsoft.ResourceManagement.Service_messages.svclog"
	    type="System.Diagnostics.XmlWriterTraceListener, System, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"
	    name="ServiceModelMessageLoggingListener" traceOutputOptions="LogicalOperationStack, DateTime, Timestamp, ProcessId, ThreadId, Callstack">
	    <filter type="" />
	  </add>
	  <add initializeData="c:\temp\logs\Microsoft.ResourceManagement.Service_tracelog.txt" type="System.Diagnostics.TextWriterTraceListener, System, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"
	    name="Text" traceOutputOptions="DateTime, ThreadId">
	    <filter type="" />
	  </add>
</sharedListeners>
```



