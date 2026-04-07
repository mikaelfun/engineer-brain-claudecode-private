---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Tools/Capture a System.Net trace"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FTools%2FCapture%20a%20System.Net%20trace"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

System&#46;Net traces can be used if you need to capture request and SSL-decrypted response payload details from a .NET Framework application, and customer will not allow you to install Fiddler onto their web server. 

## What are System&#46;Net Traces
----
System&#46;Net is a namespace in .NET that hosts objects and methods used to submit and receive response payloads in and out of a web server. There is a logging feature in this namespace that can dump out network wire level details into a text log file which give you access to unencrypted request and response details without having to install a 3rd party product (Fiddler) on a customer's web server. 

Below is a sample portion of a trace output file. Notice IP connection details, TLSStream information about what hostname we are connecting to, what request is getting made to what URL, if it's a POST, GET, PUT, etc:

```
System.Net Information: 0 : [18880] Connection#37154453 - Created connection from 172.16.2.134:52399 to 52.140.108.97:443.
    ProcessId=6624
    ThreadId=30
    DateTime=2023-03-09T06:23:52.1178092Z
System.Net Information: 0 : [18880] TlsStream#47214812::.ctor(host=centralindia-0.in.applicationinsights.azure.com, #certs=0, checkCertificateRevocationList=False, sslProtocols=None)
    ProcessId=6624
    ThreadId=30
    DateTime=2023-03-09T06:23:52.1178092Z
System.Net Information: 0 : [18880] Associating HttpWebRequest#3388266 with ConnectStream#63380417
    ProcessId=6624
    ThreadId=30
    DateTime=2023-03-09T06:23:52.1178092Z
System.Net Information: 0 : [18880] HttpWebRequest#3388266 - Request: POST /v2/track HTTP/1.1

    ProcessId=6624
    ThreadId=30
    DateTime=2023-03-09T06:23:52.1178092Z
System.Net Information: 0 : [18880] ConnectStream#63380417 - Sending headers
{
Content-Type: application/x-json-stream
Content-Encoding: gzip
Host: centralindia-0.in.applicationinsights.azure.com
Content-Length: 2445
Expect: 100-continue
Connection: Keep-Alive
}.
    ProcessId=6624
    ThreadId=30
    DateTime=2023-03-09T06:23:52.1178092Z
System.Net Information: 0 : [18880] SecureChannel#3706292::.ctor(hostname=centralindia-0.in.applicationinsights.azure.com, #clientCertificates=0, encryptionPolicy=RequireEncryption)
    ProcessId=6624
    ThreadId=30
    DateTime=2023-03-09T06:23:52.1178092Z
```

## When to collect System&#46;Net traces 
---
The instrumented application must have our App Insights .NET SDK loaded. Collect this trace when customers do not want to install Fiddler on their servers, but you still need to see the raw decrypted HTTP request and response payloads made by our SDKs to various Application Insights endpoints: Ingestion, Live Metrics, etc. 

System&#46;Net traces can also be used to troubleshoot SSL certificate related issue as you can see the certificate details passed between the client and server during TLS negotiation. 

## How to collect System&#46;Net traces

### Step 1: Check permissions

When the .NET runtime generates a text file to hold the trace output, the process identity hosting your web application must have permissions to write to the directory where we want to output the file. 

Notice the `initializeData` setting in the config below. It is set to c:\temp\SysNetTrace.log. The w3wp.exe process identity, or whatever exe the customers web app is running as, must have write permissions to that directory. 

If you just supply a file name, and not add a path, for instance just set `initializeData` to "SysNetTrace.log" then you can find this log written to the same directory as your executable, so for windows that would typically be C:\Windows\System32\inetsrv\ directory. 

NOTE: App Services Tip

For .NET Framework apps running in Azure App Services or WebApps follow these steps to prepare for System.Net traces

* [Open Kudu](https://learn.microsoft.com/azure/app-service/resources-kudu) for the app service
* Use PowerShell or Cmd and create a new directory for system.net trace files to get written to. C:\home\LogFiles\SysNetTraces 
  * Note: the drive letter may change from C:\ to D:\ depending on your deployment, adjust accordingly 
* Next edit the web.config file to turn on system.net tracing. Within Kudu edit the web.config file, typically found in c:\home\site\wwwroot\web.config using the instructions below. For App Service the _initializeData_ setting should point to the path where your trace file will get written to, for example: "C:\home\LogFiles\SysNetTraces\SysNetTrace.log".  Again pay attention if this needs to be C:\ or D:\ drive for your deployed app service. 

### Step 2: Modify the web.config file

Below is the configuration you need to add to web.config to turn on System.Net tracing. 

  >**NOTE**: System&#46;Net tracing can add 5% performance impact while enabled. 
* Make sure the customer doesn't already have a <system.diagnostics> section within the web.config file already
* This XML needs to be a child element of the <configuration></configuration> root element. I recommend pasting in this configuration just above the closing "</configuration>" at the bottom of the web.config file
* Once you save changes to the web.config file, it forces an [app domain reload](https://learn.microsoft.com/previous-versions/ackhksh7(v=vs.140)?redirectedfrom=MSDN#configuration-changes-cause-a-restart-of-the-application-domain). Make sure customers are aware this occurs when saving changes to the web.config file. 
* For Azure App Services, you can use (C: or D:) drive \home\LogFiles\ path for the intializeData parameter. For instance c:\home\LogFiles\SysNetTrace.log
 
```xml
<system.diagnostics>
   <sharedListeners>
       <add name="sysnet" 
         initializeData="c:\temp\SysNetTrace.log" 
         type="System.Diagnostics.TextWriterTraceListener" 
         traceOutputOptions="ThreadId, ProcessId, DateTime" />
   </sharedListeners>
   <sources>
       <source name="System.Net" tracemode="includehex" maxdatasize="1024">
           <listeners>
               <add name="sysnet"/>
           </listeners>
       </source>
       <source name="System.Net.Sockets">
           <listeners>
               <add name="sysnet"/>
           </listeners>
       </source>
       <source name="System.Net.HttpListener">
           <listeners>
               <add name="sysnet"/>
           </listeners>
       </source>
       <source name="System.Net.Cache">
           <listeners>
               <add name="sysnet"/>
           </listeners>
       </source>
   </sources>
   <switches>
       <add name="System.Net" value="Verbose"/>
       <add name="System.Net.Sockets" value="Verbose"/>
       <add name="System.Net.HttpListener" value="Verbose"/>
       <add name="System.Net.Cache" value="Verbose"/>
   </switches>
   <trace autoflush="true"/>
</system.diagnostics>

```

### Step 3: Tracing is enabled, repro the problem

Tracing is enabled and events are now getting written to the SysNetTrace.log file. Reproduce whatever web requests you are investigating. 

For Live Metrics investigations, it helps to also start a simultaneous F12/HAR trace [from the browser](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/610620/Capture-a-Network-Trace?anchor=har-trace)

### Step 4: Revert web.config file changes

You can delete the <system.diagnostics></system.diagnostics> section, or just \<\!-- comment --\> it out, and save the changes to the web.config file again to turn it off. Copy the SysNetTrace.log file from customers server and review contents to see the payloads. 1024 bytes of each request and response will be logged into the file. 

Do NOT let customers leave System&#46;Net tracing on, it is not circular buffer, so it will chew up all available memory on disk. 

**Note**: Additional information for possible System.Net tracing output for .NET Core apps, outside of the available [http logging](/Application-Insights/How%2DTo/Diagnostics-and-Tools/Tools/Capture-HTTP-Logging-in-.NET-Core): It looks like there are event provider in a couple of classes, so you could try using dotnet-trace to collect data, [Networking events - .NET](https://learn.microsoft.com/dotnet/fundamentals/networking/telemetry/events#consume-events-from-outside-the-process). For example: 

    dotnet-trace collect --providers System.Net.Http,System.Net.Security,System.Threading.Tasks.TplEventSource:0x80:4 --process-id 1234


## References
---
* [How to: Configure network tracing](https://learn.microsoft.com/dotnet/framework/network-programming/how-to-configure-network-tracing)