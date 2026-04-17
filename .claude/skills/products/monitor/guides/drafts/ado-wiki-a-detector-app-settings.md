---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Detector - App Settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FDetector%20-%20App%20Settings"
importDate: "2026-04-05"
type: troubleshooting-guide
---

#Overview
___
Applens offers many useful detectors. The App Settings detector helps CSS see the Environment variables an App Service application exposes.

#Considerations
___
- The Detector works for both Windows and Linux.

#Workflow
___
1. Start Applens: [AppLens](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/579985/AppLens)
1. Navigate to `Configuration and Management` > `App Settings`
1. This shows the various variables used by the application. These variables could be here by default as core behavior of App Services, due to enabling Application Insights, or added by the user.

## Variables related to Application Insights and autoinstrumentation

### Java

| **Environment Variable** | **Definition** |
|--|--|
| **APPINSIGHTS_INSTRUMENTATIONKEY** | Contains the instrumentation key for Application Insights, identifies the AI resource for sending telemetry data. |
| **APPLICATIONINSIGHTS_CONNECTION_STRING** | Includes key-value pairs specifying endpoints for various AI services (live metrics, ingestion endpoint). Identifies the AI resource for sending telemetry. |
| **APPINSIGHTS_PROFILERFEATURE_VERSION** | Specifies the version of the Application Insights Profiler feature. |
| **APPINSIGHTS_SNAPSHOTFEATURE_VERSION** | Specifies the version of the Snapshot Debugger feature. |
| **APPLICATIONINSIGHTS_CONFIGURATION_CONTENT** | Allows specifying entire JSON configuration content for AI instead of using a config file. |
| **APPLICATIONINSIGHTSAGENT_EXTENSION_VERSION** | Controls the version of the AI Agent extension. Typically `~2` for Windows and `~3` for Linux. |
| **DIAGNOSTICSERVICES_EXTENSION_VERSION** | Specifies the version of the Diagnostic Services extension (used for enabling AI Profiler). |
| **INSTRUMENTATIONENGINE_EXTENSION_VERSION** | Controls the version of the Instrumentation Engine (binary-rewrite for telemetry collection). |
| **SNAPSHOTDEBUGGER_EXTENSION_VERSION** | Specifies the version of the Snapshot Debugger extension. |
| **XDT_MICROSOFTAPPLICATIONINSIGHTS_BASEEXTENSIONS** | Controls whether SQL and Azure table text will be captured along with dependency calls. Can affect startup time. |
| **XDT_MICROSOFTAPPLICATIONINSIGHTS_MODE** | Used to enable/disable specific modes of AI (recommended or default modes). |
| **XDT_MICROSOFTAPPLICATIONINSIGHTS_PREEMPTSDK** | For ASP.NET Core apps — enables interoperation with the AI SDK allowing extension to send telemetry. |
| **APPLICATIONINSIGHTS_SELF_DIAGNOSTICS_LEVEL** | Controls the level of self-diagnostics for AI. Set to DEBUG level for troubleshooting. |

#Public Documentation
___
- [What is autoinstrumentation for Azure Monitor Application Insights?](https://learn.microsoft.com/azure/azure-monitor/app/codeless-overview)
- [Supported environments, languages, and resource providers](https://learn.microsoft.com/azure/azure-monitor/app/codeless-overview#supported-environments-languages-and-resource-providers)

#Internal References
___
- [AppLens](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/579985/AppLens)
- [Detector - Application Insights Auto Instrumentation](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki)
