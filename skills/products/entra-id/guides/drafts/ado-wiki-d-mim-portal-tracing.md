---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Microsoft Identity Manager/MIM 2016 Overview/Service and Portal/Troubleshooting Guides/How to enable portal tracing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FMicrosoft%20Identity%20Manager%2FMIM%202016%20Overview%2FService%20and%20Portal%2FTroubleshooting%20Guides%2FHow%20to%20enable%20portal%20tracing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   


In the MIM architecture, the MIM Portal represents the user interface you use to configure your MIM environment. The MIM Portal is implemented as Windows SharePoint Services application and is accessible by using a web browser such as Internet Explorer or Edge.

To understand why your application is behaving poorly, you can use tracing instead of a debugger. This is useful when you need to troubleshoot your RCDC configuration. Enabling MIM portal tracing provides a method to gather more details about the nature of your issue.

The objective of this article is to help you enable MIM portal tracing.

**Note**: Before you update the Web.config file, you should take a backup of the original file.

## Configuring MIM Portal Tracing

1. Open Web.config usually found in the following folder:

`C:\inetpub\wwwroot\wss\VirtualDirectories\80`

2. Add the following elements: 


```
<system.serviceModel>
  <serviceHostingEnvironment aspNetCompatibilityEnabled="true" />
  <!-- Enabled Verbose Tracing for MIM Portal Section 2  Start -->
  <diagnostics wmiProviderEnabled="false">
    <messageLogging logEntireMessage="true" logMalformedMessages="true" logMessagesAtServiceLevel="true" logMessagesAtTransportLevel="true" />
  </diagnostics>
  <!-- Enabled Verbose Tracing for MIM Portal Section 2 End -->
</system.serviceModel>
```


```
<system.diagnostics>
  <sources>
    <!-- Enabled Verbose Tracing for MIM Portal  Start -->
    <source name="System.ServiceModel.MessageLogging" switchValue="Verbose,ActivityTracing">
      <listeners>
        <add type="System.Diagnostics.DefaultTraceListener" name="Default">
          <filter type="" />
        </add>
        <add name="ServiceModelMessageLoggingListener">
          <filter type="" />
        </add>
      </listeners>
    </source>
    <source name="System.ServiceModel" switchValue="Verbose,ActivityTracing" propagateActivity="true">
      <listeners>
        <add type="System.Diagnostics.DefaultTraceListener" name="Default">
          <filter type="" />
        </add>
        <add name="ServiceModelTraceListener">
          <filter type="" />
        </add>
      </listeners>
    </source>
    <source name="Microsoft.ResourceManagement" switchValue="Verbose,ActivityTracing">
      <listeners>
        <add type="System.Diagnostics.DefaultTraceListener" name="Default">
          <filter type="" />
        </add>
        <add name="ServiceModelTraceListener">
          <filter type="" />
        </add>
      </listeners>
     </source>
   <!-- Enabled Verbose Tracing for MIM Portal  End -->
```

  
```
</sources>
  <!-- Enabled Verbose Tracing for MIM Portal  Start -->
  <sharedListeners>
    <add initializeData="C:\Temp\Logs\MIMPortal.Client_messages.svclog"
             type="System.Diagnostics.XmlWriterTraceListener, System, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"
             name="ServiceModelMessageLoggingListener" traceOutputOptions="LogicalOperationStack, DateTime, Timestamp, ProcessId, ThreadId, Callstack">
      <filter type="" />
    </add>
    <add initializeData="C:\Temp\Logs\MIMPortal.Client_tracelog.svclog"
             type="System.Diagnostics.XmlWriterTraceListener, System, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"
             name="ServiceModelTraceListener" traceOutputOptions="LogicalOperationStack, DateTime, Timestamp, ProcessId, ThreadId, Callstack">
      <filter type="" />
    </add>
    <add initializeData="C:\Temp\Logs\MIMPortal.Client.web_TextOutput.txt"
    type="System.Diagnostics.XmlWriterTraceListener, System, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089" name="Text" traceOutputOptions="DateTime, ThreadId">
      <filter type="" />
    </add>
 
  </sharedListeners>
  <trace autoflush="true" />
  <!-- Enabled Verbose Tracing for MIM Portal  End  -->
 
</system.diagnostics>
```

SAMPLE WEBCONFIG file

[web.config.working+tracing-ON.TXT](/.attachments/web.config.working+tracing-ON-ac55c7ee-c381-46cc-8137-f90b2df0ba01.TXT)






