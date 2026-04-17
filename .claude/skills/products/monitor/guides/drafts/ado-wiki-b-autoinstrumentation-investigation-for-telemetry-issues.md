---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Instrumentation/autoinstrumentation investigation for telemetry issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FInstrumentation%2Fautoinstrumentation%20investigation%20for%20telemetry%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

#Overview
___
This covers investigation efforts around autoinstrumentation scenarios where there is no telemetry being seen in the portal.

#Considerations
___
This material should only be used only after the prior steps in the TSG were completed.

#Step by Step Instructions
___

1. Check the Known issues 
1. Old but conceptually on point refresher: [Code-less Explained for .Net and .Net Core](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/580086/Code-less-Explained-for-.Net-and-.Net-Core)
1. Use an appropriate section below based on where the application is hosted and its steps to continue the investigation:

## Function App investigations

<details><summary>Function App</summary>

- Support for the Azure Functions Auto-instrumentation SDK is owned by the Azure Functions team. As a general rule, they should be engaged when investigating telemetry ingestion issues regarding this integration. See [Support Boundaries](/Application-Insights/Support-Boundaries) for more details.
- To validate the Azure Functions SDK configuration, please see: [Locate host.json file in a Function App](/Application-Insights/How%2DTo/AppLens/Locate-host.json-file-in-a-Function-App)
- For telemetry from a function to ingest into Application Insights, the respective function needs to have executed and ran successfully. Follow this article to validate this is the case: [Determine successful executions from Function App](/Application-Insights/How%2DTo/AppLens/Determine-successful-executions-from-Function-App)
- If the function has executed successfully, consider investigating the Function Logs: [Missing Function Logs in Application Insights](/Application-Insights/How%2DTo/Additional-Reference-Material/Ingestion-References/Missing-Function-Logs-in-Application-Insights)

</details>

## On-premises or Azure Virtual Machines investigations

- Both of these features only work with ASP.Net (Core/Framework) applications running under Internet Information Server (IIS). 
  - Check the URL used to browse to the application, does it end with **.aspx** or something else like **myapp.exe/?mymethod**? The former is an indication of a supported scenario whereas the latter is NOT.

<details><summary>Azure Monitor Application Insights Agent for on-premises servers (Status Monitor)</summary>

- [Deploy the Application Insights Agent for on-premises servers](https://learn.microsoft.com/en-us/azure/azure-monitor/app/classic-api?tabs=dotnet#deploy-the-application-insights-agent-for-on-premises-servers) 
   - See the first "NOTE" in this section as to the requirements.
- Review troubleshooting specific [documentation](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/status-monitor-v2-troubleshoot)
- Self-diagnostics: Collect ETW logs using PerfView. PerfView traces are most useful when the collection is running during to the process startup.
   - The Application Insights ETW providers are imperative to any data collection. Find all providers here: [Capture PerfView](/Application-Insights/How%2DTo/Diagnostics-and-Tools/Tools/Capture-PerfView)
   - If a customer is unwilling to install PerfView, the agent comes with a built-in cmdlet: [Start-ApplicationInsightsMonitoringTrace](https://learn.microsoft.com/en-us/azure/azure-monitor/app/application-insights-asp-net-agent?tabs=api-reference#start-applicationinsightsmonitoringtrace)
- Multiple IIS apps using different connection strings: [How to configure Application Insights Agent using instrumentation key map](/Application-Insights/How%2DTo/Additional-Reference-Material/SDK-and-Agents-References/How-to-configure-Application-Insights-Agent-using-instrumentation-key-map)

</details>

<details><summary>Azure Monitor Application Insights Agent on Azure VMs and VMSS (extension)</summary>

- [Deploy the Application Insights Agent for virtual machines (VMs) and virtual machine scale sets](https://learn.microsoft.com/en-us/azure/azure-monitor/app/classic-api?tabs=dotnet#deploy-the-application-insights-agent-for-virtual-machines-vms-and-virtual-machine-scale-sets)
   - See the first paragraph of this section and the requirements.
- Review troubleshooting specific [documentation](https://learn.microsoft.com/en-us/azure/azure-monitor/app/azure-vm-vmss-apps?tabs=portal#troubleshooting)
- Self-diagnostics: Collect ETW logs using PerfView. Ensure Application Insights ETW providers are explicitly set.

</details>

## App Services investigation

1. Verify the scenario is supported: [Autoinstrumentation for Azure Monitor Application Insights - Supported environments](https://learn.microsoft.com/en-us/azure/azure-monitor/app/codeless-overview#supported-environments-languages-and-resource-providers)

1. Verify for any recent code deployments: [Deployments](/Application-Insights/How%2DTo/AppLens/Deployments). 
   - Especially relevant when telemetry was working before and all of the sudden stopped.
   - If deployment time matches when telemetry stopped, it shows evidence the issue is driven by a change on the app.

1. Validate the app settings `APPLICATIONINSIGHTS_CONNECTION_STRING` and `APPINSIGHTS_INSTRUMENTATIONKEY`. 
   - Both should match the Application Insights resource where data is expected.
   - App settings are found in the Environment Variables blade.
   - Some settings can be inspected through AppLens: [Detector - App Settings](/Application-Insights/How%2DTo/AppLens/Detector-%2D-App-Settings)
   - Changes to app settings: [Identify changes in environment variables](/Application-Insights/How%2DTo/AppLens/Identify-changes-in-environment-variables)

1. Verify the status of automatic instrumentation: [Detector - Application Insights Auto Instrumentation](/Application-Insights/How%2DTo/AppLens/Detector-%2D-Application-Insights-Auto-Instrumentation). 
   - If autoinstrumentation is backing off, it's likely because of a conflicting DLL. See: #65322

1. If more details are required after the detector: [Inspect App Service auto-attach logs](/Application-Insights/How%2DTo/AppLens/Inspect-App-Service-autoinstrumentation-logs)

1. Framework-specific troubleshooting:

<details><summary>App Service running .NET Framework</summary>

- Review troubleshooting specific [documentation](https://learn.microsoft.com/azure/azure-monitor/app/azure-web-apps-net#troubleshooting)
- Self-diagnostics: [dot-Net Framework](/Application-Insights/How%2DTo/Diagnostics-and-Tools/Application-Insights-Diagnostic-Logs/dot%2DNet-Framework)

</details>

<details><summary>App Service running .NET Core</summary>

- Review [Windows](https://learn.microsoft.com/azure/azure-monitor/app/azure-web-apps-net-core?tabs=Windows%2Cwindows#troubleshooting) and [Linux](https://learn.microsoft.com/azure/azure-monitor/app/azure-web-apps-net-core?tabs=Windows%2Clinux#troubleshooting) troubleshooting documentation
- Automatic instrumentation is only supported for most recent versions of .NET Core. See: #30206
- **Key fix**: If autoinstrumentation backoff occurs on .NET Core, enabling app setting "Interop with Application Insights SDK" forces autoinstrumentation to take effect even when conflicting binaries are detected.
- Self-diagnostics: [dot-Net Core](/Application-Insights/How%2DTo/Diagnostics-and-Tools/Application-Insights-Diagnostic-Logs/dot%2DNet-Core)

</details>

<details><summary>App Service running Java</summary>

- Review troubleshooting specific [documentation](https://learn.microsoft.com/azure/azure-monitor/app/azure-web-apps-java#troubleshooting)
- Self-diagnostics: [Java Agent](/Application-Insights/How%2DTo/Diagnostics-and-Tools/Application-Insights-Diagnostic-Logs/Java-Agent)

</details>

<details><summary>App Service running Node.js</summary>

- Review [Windows](https://learn.microsoft.com/azure/azure-monitor/app/azure-web-apps-nodejs?tabs=windows#troubleshooting) and [Linux](https://learn.microsoft.com/azure/azure-monitor/app/azure-web-apps-nodejs?tabs=linux#troubleshooting) troubleshooting documentation
- Self-diagnostics: [Nodejs](/Application-Insights/How%2DTo/Diagnostics-and-Tools/Application-Insights-Diagnostic-Logs/Nodejs)

</details>

<details><summary>App Service running Python</summary>

- Review troubleshooting specific [documentation](https://learn.microsoft.com/azure/azure-monitor/app/azure-web-apps-python#troubleshooting)
- Self-diagnostics: [Python](/Application-Insights/How%2DTo/Diagnostics-and-Tools/Application-Insights-Diagnostic-Logs/Python)

</details>

#Public Documentation
___
- [Deploy the Application Insights Agent for VMs and VMSS](https://learn.microsoft.com/en-us/azure/azure-monitor/app/classic-api?tabs=dotnet#deploy-the-application-insights-agent-for-virtual-machines-vms-and-virtual-machine-scale-sets)
- [Deploy the Application Insights Agent for on-premises servers](https://learn.microsoft.com/en-us/azure/azure-monitor/app/classic-api?tabs=dotnet#deploy-the-application-insights-agent-for-on-premises-servers)
- [Autoinstrumentation supported environments](https://learn.microsoft.com/en-us/azure/azure-monitor/app/codeless-overview#supported-environments-languages-and-resource-providers)

#Internal References
___
- [Code-less Explained for .Net and .Net Core](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/580086/Code-less-Explained-for-.Net-and-.Net-Core)
