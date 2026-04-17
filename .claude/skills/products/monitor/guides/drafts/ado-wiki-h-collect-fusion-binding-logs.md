---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Tools/Collect Fusion Binding Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FTools%2FCollect%20Fusion%20Binding%20Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]



# Introduction
---
Fusion Binding Logging is a powerful feature for diagnosing assembly loading failures in ASP.NET applications. This guide will walk you through enabling Fusion Binding Logging. 

.NET will probe for a referenced dll in order to locate it and pull it into memory of the running process. If that probing fails for any reason then you typically get an exception like the following: 

_System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.ApplicationInsights, Version=2.21.0.431, Culture=neutral, PublicKeyToken=31bf3856ad364e35' or one of its dependencies. The system cannot find the file specified._

```
1 exceptions: 0x0000025e967b1b00 
    In Generation: 0 from .NET v4.8.4645.00
    HResult: 0x80070002
    Type: System.IO.FileNotFoundException
    Message: Could not load file or assembly 'Microsoft.ApplicationInsights, Version=2.21.0.431, Culture=neutral, PublicKeyToken=31bf3856ad364e35' or one of its dependencies. The system cannot find the file specified.
    Stack Trace:
    SP               IP               Function
    000000d035cfd910 0000000000000000 Microsoft.ApplicationInsights.Redfield.Lightup.Lightup.LoadAndInitializeApplicationInsightsSDK(Microsoft.ApplicationInsights.RedfieldIISModule.Contracts.InstrumentationSettings, System.String)

1 exceptions: 0x0000025e967b2068 
    In Generation: 0 from .NET v4.8.4645.00
    HResult: 0x80131604
    Type: System.Reflection.TargetInvocationException
    Message: Exception has been thrown by the target of an invocation.
      Inner Exception: 0x0000025e967b1b00
    Stack Trace:
    SP               IP               Function                                                                                                                                                                                        Source
    000000d035cfe0b0 0000000000000000 System.RuntimeMethodHandle.InvokeMethod(System.Object, System.Object[], System.Signature, Boolean) 
    000000d035cfe0b0 00007ffadd17c0ed System.Reflection.RuntimeMethodInfo.UnsafeInvokeInternal(System.Object, System.Object[], System.Object[])                                                                                       f:\dd\ndp\clr\src\BCL\system\reflection\methodinfo.cs @ 761
    000000d035cfe120 00007ffadd17b927 System.Reflection.RuntimeMethodInfo.Invoke(System.Object, System.Reflection.BindingFlags, System.Reflection.Binder, System.Object[], System.Globalization.CultureInfo)                          f:\dd\ndp\clr\src\BCL\system\reflection\methodinfo.cs @ 735
    000000d035cfe1a0 00007ffadd93a7c4 Microsoft.ApplicationInsights.RedfieldIISModule.RedfieldIISModule.CallLighupInit(System.Type, Microsoft.ApplicationInsights.RedfieldIISModule.Contracts.InstrumentationSettings, System.String) 
    000000d035cfe200 00007ffadd939264 Microsoft.ApplicationInsights.RedfieldIISModule.RedfieldIISModule.LoadAppInsightsLightupHttpModuleTypeIfNotLoaded() 
    000000d035cfe2b0 00007ffadd9357a5 Microsoft.ApplicationInsights.RedfieldIISModule.RedfieldIISModule.Init(System.Web.HttpApplication) 
    000000d035cfe320 00007ffadde20dff Microsoft.AppInsights.IIS.ManagedHttpModuleHelper.MulticastHttpModule.Init(System.Web.HttpApplication) 
```

Fusion binding logging was designed to specifically assist in troubleshooting these failed attempts to load in a referenced or dependent DLL. 

# Fusion Binding Logging in Azure App Service
---
To enable Fusion Binding Logging, follow these steps:

1. Navigate to the **Azure Portal**.
2. Select **Configuration** for your App Service.
3. In the **Application Settings** section, add a new setting with the key `WEBSITE_FUSIONLOGGING_ENABLED` and set the value to `1`.
4. Click **Save** to apply the changes.

**Note:** Saving the application setting will cause a restart of the app on all instances. It is recommended to perform this action during off-peak hours to minimize impact.

## Understanding Fusion Logs
---
With Fusion Binding Logging enabled, any assembly loading failure will result in detailed logs that can be used to troubleshoot the issue. These logs will include information about the specific assembly, its version, and the expected location.

![image.png](/.attachments/image-12501278-b311-49f9-ad71-13e51313a810.png)

## Best Practices
---
- **Use Sparingly:** Fusion Binding Logging should be used temporarily for troubleshooting purposes as it can impact the performance of your application.
- **Disable After Use:** Remember to disable Fusion Binding Logging by removing the `WEBSITE_FUSIONLOGGING_ENABLED` setting once the necessary information has been gathered.
- **Repro locally**: If customer can reproduce the same FileNotFoundException while debugging the application locally, then use [fuslogvw.exe tool(Fuslogvw.exe (Assembly Binding Log Viewer)](https://learn.microsoft.com/en-us/dotnet/framework/tools/fuslogvw-exe-assembly-binding-log-viewer) from Visual Studio to collect fusion binding logs. 

## Conclusion
---
Fusion Binding Logging is an invaluable tool for developers and support engineers to pinpoint the root causes of assembly loading issues. By following the steps outlined above, you can effectively utilize this feature to maintain the health and performance of your ASP.NET applications on Azure App Service.
á
## References
---
* [Troubleshoot ASP.NET assembly loading failures using Fusion Logging](https://azure.github.io/AppService/2020/09/16/Fusion-Logging-for-ASP.NET-Apps.html)