# Monitor Application Insights 自动检测与无代码注入 - Comprehensive Troubleshooting Guide

**Entries**: 61 | **Drafts fused**: 9 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-determine-auto-instrumentation-codeless.md, ado-wiki-a-locate-validate-ikey-codeless-deployment.md, ado-wiki-a-validate-java-autoinstrumentation-applens.md, ado-wiki-a-validate-java-autoinstrumentation-kudu.md, ado-wiki-a-validate-python-autoinstrumentation-applens.md, ado-wiki-b-autoinstrumentation-investigation-for-telemetry-issues.md, ado-wiki-b-requirements-autoinstrumentation-dotnet-core.md, ado-wiki-b-validating-autoinstrumentation-applens.md, ado-wiki-b-validating-autoinstrumentation-kudu.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Application Insights auto-instrumentation on .NET Core Linux App Service shows AppAlreadyInstrumented=true in status JSON — custom SDK telemetry may conflict with auto-instrumentation

**Solution**: Either: (1) disable auto-instrumentation in App Service Application Insights settings and rely on SDK instrumentation, or (2) enable PreemptSdk to stop SDK telemetry flow and yield to auto-instrumentation exclusively

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Application Insights auto-instrumentation conflicts with existing SDK instrumentation on App Service Linux Web App; duplicate or missing telemetry

**Solution**: 1) Navigate to KUDU Advanced Tools → BASH. 2) Check status file: cd LogFiles/ApplicationInsights/status && cat status_*.json. 3) If AppAlreadyInstrumented=true: Option A — disable auto-instrumentation in App Service blade (keep SDK); Option B — enable PreemptSdk to stop SDK custom telemetry and y...

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: App Services Auto Instrumentation (.NET) fails with 'Could not load file or assembly System.Runtime.CompilerServices.Unsafe.dll' after ANT build version update (98.0.7.575 → 98.0.10.735). App Insig...

**Solution**: Option 1: If System.Runtime.CompilerServices.Unsafe.dll is NOT in the \bin folder, remove the <bindingRedirect> for that assembly from web.config, or change it to point to version 4.0.4.1. Option 2: If the dll IS in \bin folder, temporarily set ApplicationInsightsAgent_EXTENSION_VERSION=2.8.37 in...

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: Application Insights auto-instrumentation (App Services attach / VM extension / on-premises agent) stops reporting telemetry after code deployment or when first enabled. Conflicting DLLs detected i...

**Solution**: Remove the conflicting package to let auto-instrumentation attach. If removal is not feasible (e.g. System.Diagnostics.DiagnosticSource is a transitive dependency), switch to manual SDK instrumentation. For .NET Core on App Services, enable 'Interop with Application Insights SDK' to force auto-in...

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: Application Insights auto-instrumentation intermittently stops collecting telemetry after app restart (no code deployment). Telemetry resumes after another restart or re-enabling AI. Memory dump sh...

**Solution**: Restart the application or disable/re-enable Application Insights to re-trigger auto-instrumentation. For persistent issues, switch to manual SDK. Verify via memory dump (lm command to check loaded modules) or App Service auto-instrumentation logs (WebAppsAppInsightsExtension table in Kusto).

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Application Insights auto-instrumentation on .NET Core Linux App Service show... | The application is already instrumented with the Application Insights SDK, ca... | Either: (1) disable auto-instrumentation in App Service Application Insights ... | 8.5 | ADO Wiki |
| 2 | Application Insights auto-instrumentation conflicts with existing SDK instrum... | AppAlreadyInstrumented flag is true in status JSON file (/home/LogFiles/Appli... | 1) Navigate to KUDU Advanced Tools → BASH. 2) Check status file: cd LogFiles/... | 8.5 | ADO Wiki |
| 3 | App Services Auto Instrumentation (.NET) fails with 'Could not load file or a... | New App Insights extension 2.8.44 pulls a newer version of System.Runtime.Com... | Option 1: If System.Runtime.CompilerServices.Unsafe.dll is NOT in the \bin fo... | 8.5 | ADO Wiki |
| 4 | Application Insights auto-instrumentation (App Services attach / VM extension... | Auto-instrumentation variants depend on specific versions of certain NuGet pa... | Remove the conflicting package to let auto-instrumentation attach. If removal... | 8.5 | ADO Wiki |
| 5 | Application Insights auto-instrumentation intermittently stops collecting tel... | Transient DLL loading timing issue: DLLs are dynamically loaded into .NET App... | Restart the application or disable/re-enable Application Insights to re-trigg... | 8.5 | ADO Wiki |
| 6 | App Insights auto-instrumentation conflicts with SDK on App Service Linux; du... | AppAlreadyInstrumented=true in /home/LogFiles/ApplicationInsights/status/stat... | KUDU BASH > cat status_*.json. If AppAlreadyInstrumented=true: disable auto-i... | 8.5 | ADO Wiki |
| 7 | App Service codeless 自动插桩在特定时间窗口停止向 Application Insights 发送遥测数据，随后自行恢复正常 | 应用程序 bin 目录中存在冲突的 System.Diagnostics.DiagnosticSource.dll，导致 App Service 自动插桩... | 通过 AppLens 'Application Insights Java Node and Dot Net Auto Instrumentation' ... | 8.5 | ADO Wiki |
| 8 | .NET Core web app 启用 App Service codeless 自动插桩后，Application Insights 中完全没有遥测数据 | 应用使用的 .NET Core 2.2 框架版本已不再被 App Service 自动插桩支持，插桩扩展无法成功附加 | 升级应用至受支持的 .NET Core 框架版本。可通过 AppLens 自动插桩日志（WebAppsAppInsightsExtension 表，Pro... | 8.5 | ADO Wiki |
| 9 | .NET Full Framework App Service Auto-Instrumentation backed off because confl... | One of the conflicting DLLs (Microsoft.ApplicationInsights, System.Diagnostic... | Use the troubleshooting article https://docs.microsoft.com/azure/azure-monito... | 8.5 | ADO Wiki |
| 10 | App Insights Auto-Instrumentation on App Service shows 'enabled with old vers... | Old auto-instrumentation extension (Microsoft.ApplicationInsights.AzureWebSit... | 1) Clean up old Auto-Instrumentation extension on the App Service Web App (fo... | 8.5 | ADO Wiki |
| 11 | .NET Core App Service Auto-Instrumentation backed off because Microsoft.Appli... | .NET Core auto-instrumentation only backs off when Microsoft.ApplicationInsig... | Use the troubleshooting article https://docs.microsoft.com/azure/azure-monito... | 8.5 | ADO Wiki |
| 12 | Application Insights auto-instrumentation (codeless) stopped working for a sp... | Customer's application deployed with System.Diagnostics.DiagnosticSource.dll ... | 1. In AppLens, open 'Application Insights Java Node and Dot Net Auto Instrume... | 8.5 | ADO Wiki |
| 13 | App Insights auto-instrumentation (codeless) enabled on .NET Core App Service... | .NET Core 2.2 (or other end-of-life .NET framework versions) is no longer sup... | 1. Query WebAppsAppInsightsExtension Kusto table via AppLens 'Application Ins... | 8.5 | ADO Wiki |
| 14 | Spring Boot application using Application Insights Java Agent shows unexpecte... | Both JVM argument auto-instrumentation (javaagent) and programmatic manual in... | Use only ONE instrumentation approach for Spring Boot: either JVM argument au... | 8.5 | ADO Wiki |
| 15 | Net Core Web App logs startup exceptions: 'System.InvalidOperationException: ... | Codeless auto-instrumentation attach is enabled for unsupported .NET Core sce... | 1. Remove or unset 'ASPNETCORE_HOSTINGSTARTUPASSEMBLIES' environment variable... | 8.5 | ADO Wiki |
| 16 | After the February 2021 App Service Web Apps Application Insights Extension u... | Extension v2.8.38 intentionally dropped support for .NET Core 2.0, 2.1, 2.2, ... | Migrate the application to a supported .NET Core version (3.1, 5.0, 6.0+). If... | 8.5 | ADO Wiki |
| 17 | Node.js App Service with Application Insights auto-instrumentation shows '__E... | The Node.js SDK pre-aggregated metrics tallies requests where the client disc... | Disable pre-aggregated metrics using JSON configuration: set 'enableAutoColle... | 8.5 | ADO Wiki |
| 18 | ASP.NET Core app with auto-instrumentation enabled shows Application Insights... | Customer code calls WebHostDefaults.HostingStartupAssembliesKey with custom a... | Append the original ASPNETCORE_HOSTINGSTARTUPASSEMBLIES env var value to the ... | 8.5 | ADO Wiki |
| 19 | App Service web app on old Application Insights private site extension versio... | Old private site extension (Microsoft.ApplicationInsights.AzureWebSites) no l... | Delete the Microsoft.ApplicationInsights.AzureWebSites folder from D:\home\si... | 8.5 | ADO Wiki |
| 20 | ASP.NET Core app on App Service/Function/VM with auto-instrumentation enabled... | App code calls WebHostDefaults.HostingStartupAssembliesKey with custom assemb... | Append original env var value to custom list: .UseSetting(WebHostDefaults.Hos... | 8.5 | ADO Wiki |
| 21 | App Service auto-instrumentation fails. Old Application Insights private site... | Outdated Application Insights private site extension (2.6.5) no longer in use... | Remove via KUDU: Advanced Tools > Debug Console > navigate to D:\home\siteext... | 8.5 | ADO Wiki |
| 22 | Get-ApplicationInsightsMonitoringStatus cmdlet fails with error 'GetOutOfProc... | The cmdlet parses applicationHost.config to report attach status. FTP sites u... | Remove or temporarily rename FTP site entries from applicationHost.config bef... | 8.5 | ADO Wiki |
| 23 | Get-ApplicationInsightsMonitoringStatus cmdlet fails with NullReferenceExcept... | The applicationHost.config XML file contains an <application> entry with appl... | Validate and fix the applicationHost.config file - ensure all <application> e... | 8.5 | ADO Wiki |
| 24 | Status Monitor V1 MSI download fails or scripts using go.microsoft.com/fwlink... | Status Monitor V1 is retired and the download share hosting the MSI has been ... | Upgrade to Application Insights Agent (Status Monitor V2). Update any scripts... | 8.5 | ADO Wiki |
| 25 | After installing Az.ApplicationMonitor module, running Enable-ApplicationInsi... | The PowerShell session still has the old module context cached; the newly ins... | Close the existing PowerShell session and start a new Administrator session, ... | 8.5 | ADO Wiki |
| 26 | .NET Core App Service autoinstrumentation shows 'backed off' or 'failed' stat... | The Application Insights SDK was already manually added/loaded in the applica... | Option 1: Remove the manual Application Insights SDK from the application cod... | 8.5 | ADO Wiki |
| 27 | Application Insights Agent on IIS fails to monitor applications; agent does n... | IIS nested applications are present. The Application Insights Agent does not ... | Remove IIS nested applications or restructure them as separate sites. Verify ... | 8.5 | ADO Wiki |
| 28 | App Service .NET Core autoinstrumentation status shows backed off or failed a... | An existing manually instrumented (classic) Application Insights SDK in the a... | Enable the Interop with Application Insights SDK option in Application Insigh... | 8.5 | ADO Wiki |
| 29 | Java App Service autoinstrumentation producing unexpected behavior, duplicate... | User manually added applicationinsights-agent-#.#.#.jar reference in JAVA_OPT... | In App Service > Settings > Environment Variables, check JAVA_OPTS and CATALI... | 8.5 | ADO Wiki |
| 30 | Python App Service autoinstrumentation is not available or fails to enable on... | Python autoinstrumentation for App Service is only supported on Linux; Window... | Use Linux App Service plan for Python autoinstrumentation. For Windows Python... | 8.5 | ADO Wiki |
| 31 | Python App Service autoinstrumentation not working for container-based (Docke... | Python autoinstrumentation only supports Code publish type; Container publish... | For containerized Python apps, use manual instrumentation with OpenTelemetry ... | 8.5 | ADO Wiki |
| 32 | Duplicate telemetry data appearing in Application Insights for Python App Ser... | Both autoinstrumentation (codeless attach) and manual SDK instrumentation are... | Use only one instrumentation method. Disable autoinstrumentation if manual SD... | 8.5 | ADO Wiki |
| 33 | AppLens App Insights Feature Status detector shows Profiler and Snapshot Debu... | Known false positive in AppLens detector - Profiler and Snapshot Debugger are... | Ignore Profiler and Snapshot Debugger status indicators in AppLens for Python... | 8.5 | ADO Wiki |
| 34 | Java web app autoinstrumentation fails or behaves unexpectedly on App Service... | Startup Command field contains reference to applicationinsights-agent jar (e.... | Remove any java agent reference from the Startup Command field in App Service... | 8.5 | ADO Wiki |
| 35 | Java web app with App Service autoinstrumentation shows unexpected behavior o... | JAVA_OPTS or CATALINA_OPTS environment variables contain reference to applica... | Check App Service > Settings > Environment variables. Remove any reference to... | 8.5 | ADO Wiki |
| 36 | Python Application Insights autoinstrumentation does not work on Windows App ... | Python autoinstrumentation on App Services only supports Linux operating syst... | Use Linux App Service Plan for Python autoinstrumentation. If Windows is requ... | 8.5 | ADO Wiki |
| 37 | Python autoinstrumentation does not activate or fails on App Service with Pyt... | Python autoinstrumentation on App Services only supports Python versions 3.8 ... | Update App Service to use a supported Python version (3.8-3.11) for autoinstr... | 8.5 | ADO Wiki |
| 38 | Duplicate telemetry data appearing in Application Insights for Python web app... | Both autoinstrumentation (enabled via App Service UI) and manual SDK instrume... | Use only ONE instrumentation method: either autoinstrumentation (via App Serv... | 8.5 | ADO Wiki |
| 39 | Python autoinstrumentation does not work for container-based App Service depl... | Python autoinstrumentation on App Services only supports Code publish type. C... | Use Code publish type for App Service deployment to leverage autoinstrumentat... | 8.5 | ADO Wiki |
| 40 | AppLens App Insights Feature Status detector incorrectly shows Profiler and S... | The App Insights Feature Status detector in AppLens does not correctly distin... | Ignore Profiler and Snapshot Debugger status in AppLens for Python apps. Thes... | 8.5 | ADO Wiki |
| 41 | Java App Service autoinstrumentation fails or conflicts when Startup Command ... | Startup Command in App Service General Settings contains reference to old 2.X... | In Azure Portal > App Service > Settings > Configuration > General Settings, ... | 8.5 | ADO Wiki |
| 42 | Java App Service autoinstrumentation agent not working correctly or crashing ... | Preview properties used in the Application Insights configuration (applicatio... | Remove all preview properties from the Application Insights configuration. On... | 8.5 | ADO Wiki |
| 43 | Python App Service autoinstrumentation not working or not collecting telemetr... | Python autoinstrumentation for App Service only supports Python versions 3.8 ... | Verify App Service Python version in Portal > App Service > Settings > Config... | 8.5 | ADO Wiki |
| 44 | Application Insights shows as Enabled in App Service but autoinstrumentation ... | The Enabled status (in AppLens Feature Status detector or Portal) only means ... | Use AppLens 'Application Insights Auto Instrumentation' detector (not Feature... | 8.5 | ADO Wiki |
| 45 | App Service Python app autoinstrumentation status in Kudu (/applicationinsigh... | Unlike .NET apps, the Kudu /applicationinsights page for Python does not diff... | Do not rely solely on Kudu autoinstrumentation status for Python apps. Verify... | 8.5 | ADO Wiki |
| 46 | Python App Service autoinstrumentation status page in Kudu (/applicationinsig... | Unlike .NET apps, the Python autoinstrumentation Kudu status page does not di... | Do not rely on Kudu /applicationinsights status to determine if a Python app ... | 8.5 | ADO Wiki |
| 47 | Custom Track calls (TrackEvent, TrackTrace, TrackMetric) lost or not appearin... | Auto-instrumentation with XDT_MicrosoftApplicationInsights_PreemptSdk=true pr... | Check App Settings for XDT_MicrosoftApplicationInsights_PreemptSdk. If manual... | 8.5 | ADO Wiki |
| 48 | .NET Framework 4.8.1 应用启用 Application Insights 后，看不到任何 SQL 依赖遥测（但 HTTP 依赖和请求遥... | .NET 4.8.1 的 System.Data 命名空间存在回归 Bug：EventSource 配置失败，导致 SQL 事件从不触发；App Insi... | 当前唯一解决方案：降级到 .NET 4.x 旧版本（4.8.0 或更早），或将应用重写为 .NET Core/.NET 5+。.NET Framework... | 7.5 | ADO Wiki |
| 49 | Cannot enable Application Insights autoinstrumentation for .NET Core App Serv... | The .NET Core application is built on a non-LTS (Long Term Support) version. ... | Upgrade the application to a supported .NET Core LTS version. Check https://d... | 7.5 | ADO Wiki |
| 50 | Kudu /applicationinsights status page shows no application running or no inst... | The ASP.NET Core application has not been deployed to the App Service web app... | Ensure the application is deployed to the App Service (e.g. via Visual Studio... | 7.5 | ADO Wiki |
| 51 | AppLens shows autoinstrumentation succeeded (binaries injected successfully) ... | Network connectivity issues preventing telemetry from reaching the Applicatio... | 1) Verify autoinstrumentation status via AppLens detector shows success. 2) C... | 7.5 | ADO Wiki |
| 52 | Java autoinstrumentation configuration not working or causing agent issues wh... | Preview configuration properties used in Application Insights configuration (... | Remove any preview properties from the Application Insights configuration. On... | 7.5 | ADO Wiki |
| 53 | Need to identify the instrumentation method and language from Application Ins... | - | Parse the sdkVersion prefix from requests or other telemetry tables. Examples... | 7.5 | ADO Wiki |
| 54 | Java App Service application or Application Insights autoinstrumentation not ... | App Service web app is configured for one Java version (e.g. Java 8) but the ... | Verify Java version alignment: 1) Check App Service General Settings for conf... | 7.5 | ADO Wiki |
| 55 | No telemetry after enabling autoinstrumentation on App Service because Applic... | Autoinstrumentation detects existing SDK assemblies (Microsoft.ApplicationIns... | Remove the Application Insights SDK NuGet packages from the application. Chec... | 7.5 | MS Learn |
| 56 | ASP.NET Core autoinstrumentation fails silently when application configures A... | Application explicit hosting startup assembly configuration overrides App Ser... | Remove custom hosting startup configuration or explicitly include Microsoft.A... | 7.5 | MS Learn |
| 57 | Java Azure Functions slow startup time after enabling Application Insights au... | Legacy extension settings (XDT_MicrosoftApplicationInsights_Java=1, Applicati... | Remove legacy settings (XDT_MicrosoftApplicationInsights_Java, ApplicationIns... | 7.5 | MS Learn |
| 58 | No telemetry data in workspace-based Application Insights after enabling AKS ... | Deployment not instrumented - missing monitor.azure.com/instrumentation annot... | 1) Verify monitor.azure.com/instrumentation annotation on deployment and repl... | 6.5 | MS Learn |
| 59 | Application Insights Agent (Status Monitor v2) monitoring fails silently; no ... | Conflicting DLLs in app bin folder (Microsoft.ApplicationInsights.dll, System... | Remove conflicting DLLs from app bin folder; use PerfView/Handle.exe/ListDLLs... | 4.5 | MS Learn |
| 60 | Az.ApplicationMonitor module not working with PowerShell 6 or 7 | Module only supports PowerShell 5.1; incompatible with PowerShell 6/7 | Use PowerShell 5.1 side-by-side with newer PowerShell versions for Applicatio... | 4.5 | MS Learn |
| 61 | Application Insights Agent HTTP module not injected when IIS uses shared conf... | Enable command installs to local GAC but shared ApplicationHost.config does n... | Run Enable command on each web server; manually add ManagedHttpModuleHelper m... | 4.5 | MS Learn |
