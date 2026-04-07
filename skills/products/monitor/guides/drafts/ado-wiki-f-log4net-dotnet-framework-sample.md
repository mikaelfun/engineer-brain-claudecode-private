---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Code Samples and Lab Walkthroughs/Code Samples/Sample App: Send Log4Net telemetry to Application Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Code%20Samples%20and%20Lab%20Walkthroughs/Code%20Samples/Sample%20App%3A%20Send%20Log4Net%20telemetry%20to%20Application%20Insights"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to integrate App Insights and Log4Net (.NET Framework 4.8)

This is a simple walkthrough of a .NET Framework 4.8 website using Log4Net logger objects sending trace data to Application Insights instance.

If you are looking for a sample using ILogger instead, review public docs here: [Application Insights logging with .NET](https://learn.microsoft.com/azure/azure-monitor/app/ilogger)

## Walkthrough steps

1. Open up Visual Studio .NET
1. Create a new ASP.NET Website, use .NET Framework 4.8
1. Create any web app type, for this walkthrough you can use WebForms, and click Create button to finish creating the default ASP.NET template project
1. In the solution explorer, right-click on your project name and select Manage Nuget Packages.
1. In package manager, click the Browse tab and then find and install the latest versions of these three packages:

   - Log4net, version 2.0.15
   - Microsoft.ApplicationInsights, version 2.21.0
   - Microsoft.ApplicationInsights.Log4NetAppender, version 2.21.0
   - Microsoft.ApplicationInsights.WindowsServer, version 2.21.0
   - Microsoft.ApplicationInsights.Web, version 2.21.0

6. In your web.config file, you should now see a new config section handler declared. Look to make sure this is at the top of your web.config file now:

```xml
<configSections>
    <section name="log4net" type="log4net.Config.Log4NetConfigurationSectionHandler, log4net" />
</configSections>
```

7. Also in the web.config file you should see the new App Insights appender automatically added to the `<log4net>` configuration section:

```xml
<log4net>
   <root>
       <level value="ALL" />
       <appender-ref ref="aiAppender" />
   </root>
   <appender name="aiAppender" type="Microsoft.ApplicationInsights.Log4NetAppender.ApplicationInsightsAppender, Microsoft.ApplicationInsights.Log4NetAppender">
      <layout type="log4net.Layout.PatternLayout">
        <conversionPattern value="%message%newline" />
      </layout>
   </appender>
</log4net>
```

8. Add code to setup the Log4Net logger object. Open `global.asax.cs` and add:

```csharp
public class Global : HttpApplication
{
   public static log4net.ILog logger;

   void Application_Start(object sender, EventArgs e)
   {
       RouteConfig.RegisterRoutes(RouteTable.Routes);
       BundleConfig.RegisterBundles(BundleTable.Bundles);

       // Setup Application Insights
       TelemetryConfiguration config = TelemetryConfiguration.Active;
       TelemetryConfiguration.Active.ConnectionString = "InstrumentationKey=<your-ikey>...";

       // Setup log4net logger object
       log4net.Config.XmlConfigurator.Configure();
       logger = log4net.LogManager.GetLogger(this.GetType());
   }
}
```

9. Make calls into the logger in your page code:

```csharp
protected void Page_Load(object sender, EventArgs e)
{
    Global.logger.Info("Logging Hello world!");
    Global.logger.Warn("A warning message");
    Global.logger.Error("An error message");
}
```

10. Build and browse the default web page. Log4net messages will appear as Trace telemetry in the traces/AppTraces tables in Application Insights/Log Analytics.

> **Note**: ALL Log4Net logs get converted to Trace telemetry in Application Insights. If you call `logger.Error()` in Log4Net, that message will show up in the traces table (not exceptions table).
