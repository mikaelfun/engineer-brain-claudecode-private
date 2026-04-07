---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Detector - Application Insights Auto Instrumentation"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FDetector%20-%20Application%20Insights%20Auto%20Instrumentation"
importDate: "2026-04-05"
type: troubleshooting-guide
---

#Overview
___
Applens offers many useful detectors. The Application Insights Auto Instrumentation detector was developed by the Application Insights PG team to help CSS determine the status of Auto Instrumentation and whether it was able to successfully instrument (inject) the application with the Application Insights binaries for telemetry collection.

#Considerations
___
- Detectors work for both Windows and Linux.

- Supported languages for Windows: .Net, Java, Node
- Supported languages for Linux: .Net, Java, Node, Python

#Workflow
___
1. Start Applens: [AppLens](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/579985/AppLens)
1. In the 'Filter' text in the upper left, type "Application Insights"
1. Expand the Detectors section on the left — two detectors should show under "Configuration and Management":
   - **"Application Insights Auto Instrumentation"** — the predecessor detector, available for fallback support
   - **"Application Insights Auto Instrumentation Java Node and Dot Net Auto Instrumentation"** — the new merged detector for all languages. **This is the recommended detector going forward.**
1. Click on either detector to see results

> **NOTE:** To understand the results of the detector, see Internal References below.

#Public Documentation
___
- [What is autoinstrumentation for Azure Monitor Application Insights?](https://learn.microsoft.com/azure/azure-monitor/app/codeless-overview)
- [Supported environments, languages, and resource providers](https://learn.microsoft.com/azure/azure-monitor/app/codeless-overview#supported-environments-languages-and-resource-providers)

#Internal References
___
- [Interpret AppLens Application Insights Auto Instrumentation Detector output](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki)
