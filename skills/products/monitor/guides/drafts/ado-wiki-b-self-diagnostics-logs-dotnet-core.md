---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/App Service Web app .Net Core/Enabling and collecting self-diagnostics logs - .NET Core"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Autoinstrumentation/App%20Service%20Web%20app%20.Net%20Core/Enabling%20and%20collecting%20self-diagnostics%20logs%20-%20.NET%20Core"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template/.templates/Common-Header.md
:::

:::template/.templates/Sandbox-Header.md
:::

[[_TOC_]]


#Overview
---

**Objective:**  
Learn how to enable and capture self-diagnostic logs for the Application Insights .NET Core SDK.

**Purpose:**  
If you encounter issues with the Application Insights SDK, self-diagnostic logging offers insight into its internal behavior. These logs are valuable for troubleshooting and help you detect, analyze, and resolve potential problems more effectively.


#Workflow
---

###How to enable self-diagnostics logging:

Open the App Service Kudu page, and navigate to the directory where the App Service Web App is, such as_C:\home\site\wwwroot_ (Windows) or _/home/site/wwwroot_ (Linux). 

Create a new file in and name it to_ApplicationInsightsDiagnostics.json_

You can paste the snippet below in your JSON file:

Windows:

```
{
    "LogDirectory": "C:\\home\\site\\wwwroot",
    "FileSize": 5120,
    "LogLevel": "Verbose"
}
```

**Note:** In JSON, you need to escape the backslash, so make sure to use `\\` instead of `\`. You can try `\` if `\\` is not working.


Linux:

```
{
    "LogDirectory": ".",
    "FileSize": 5120,
    "LogLevel": "Verbose"
}
```
**Note:** Using `"."` as the `LogDirectory` will store the log file in the same directory as this JSON configuration file. Check reference articles for further information.


Configuration parameters:

`LogDirectory`  Directory for the log file.
`FileSize`  Max log size in KB (1MB128MB). Logging stops when this limit is reached.
`LogLevel`  Verbosity of logs. Can be one of `Critical`, `Error`, `Warning`, `Information`, or `Verbose`.  Lower severity levels include higher severity levels.

###How to collect self-diagnostics logging:

You can download the log file from the Kudu console in the directory specified by `LogDirectory`. The file name follows this pattern: `20251003-142852.w3wp.exe.10388.log`.

![image.png](/.attachments/image-48865ddb-7469-42f3-9486-4a09a454e476.png)


#Public Documentation
---

[Self-diagnostics for Application Insights SDKs - Azure | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/enable-self-diagnostics)

#Internal References
---

[Understanding Self-Diagnostics in Application Insights SDK - Overview](https://dev.azure.com/AzureMonitorPOD/Azure%20Monitor%20Wiki%20Sandbox/_wiki/wikis/Azure-Monitor-Wiki-Sandbox.wiki/1578/Understanding-Self-Diagnostics-in-Application-Insights-SDK)

[Enabling Application Insights - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1675109/Enabling-Application-Insights)

[Public Article]
(https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/enable-self-diagnostics)

---
Last Modified date: 16/02/2026
Last Modified by: kuagrawa
