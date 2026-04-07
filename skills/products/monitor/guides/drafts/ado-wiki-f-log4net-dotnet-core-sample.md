---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Code Samples and Lab Walkthroughs/Code Samples/Sample App .NET Core: Send Log4Net telemetry to Application Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Code%20Samples%20and%20Lab%20Walkthroughs/Code%20Samples/Sample%20App%20.NET%20Core%3A%20Send%20Log4Net%20telemetry%20to%20Application%20Insights"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to integrate App Insights and Log4Net (.NET Core)

This is a walkthrough of a .NET Core web app using Log4Net logger to send trace data to an Application Insights resource.

## Workflow

1. Open up Visual Studio .NET
2. Create a new .NET Core web app - ASP.NET Core Web App (Razor Pages) project type. See [Tutorial: Get started with C# and ASP.NET Core](https://learn.microsoft.com/visualstudio/get-started/csharp/tutorial-aspnet-core?view=vs-2022)
3. Instrument your application with the classic .NET Core SDK for Application Insights. See [Enable Application Insights server-side telemetry (Visual Studio)](https://learn.microsoft.com/azure/azure-monitor/app/asp-net-core?tabs=netcorenew%2Cnetcore6#enable-application-insights-server-side-telemetry-visual-studio)
4. In NuGet Package Manager, install:
   - Log4net, version 2.0.15
   - Microsoft.ApplicationInsights.Log4NetAppender, version 2.22.0

   You should also see Microsoft.ApplicationInsights.AspNetCore, version 2.22.0 already installed.

5. Add a new configuration file at project root named `log4net.config`:

```xml
<log4net>
    <appender name='aiAppender' type='Microsoft.ApplicationInsights.Log4NetAppender.ApplicationInsightsAppender, Microsoft.ApplicationInsights.Log4NetAppender'>
        <layout type='log4net.Layout.PatternLayout'>
            <conversionPattern value='%message%newline' />
        </layout>
    </appender>
    <root>
        <level value="ALL" />
        <appender-ref ref="aiAppender" />
    </root>
</log4net>
```

6. In `appsettings.json`, ensure the connection string is configured:

```json
{
  "ApplicationInsights": {
    "ConnectionString": "Provide your connection string"
  }
}
```

7. In `Program.cs`, add telemetry configuration:

```csharp
builder.Services.AddApplicationInsightsTelemetry(new ApplicationInsightsServiceOptions
{
    ConnectionString = builder.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"],
    EnableActiveTelemetryConfigurationSetup = true
});
```

8. In a Razor page, log messages using Log4Net:

```csharp
using log4net;
using System.Reflection;

public class PrivacyModel : PageModel
{
    private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

    public void OnGet()
    {
        log.Info("Privacy page visited");
    }
}
```

Last Modified: 02/27/2024
