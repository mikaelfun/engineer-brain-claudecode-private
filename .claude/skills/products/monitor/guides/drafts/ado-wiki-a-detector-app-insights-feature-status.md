---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Detector - App Insights Feature Status"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FDetector%20-%20App%20Insights%20Feature%20Status"
importDate: "2026-04-05"
type: troubleshooting-guide
---

#Overview
___
Applens offers many useful detectors. The App Insights Features Status detector helps CSS determine that autoinstrumentation is toggled 'enabled' and what associated features are enabled or disabled. Enabled does NOT mean autoinstrumentation was successful, that is covered in a different detector.

#Considerations
___
- The Detector works for both Windows and Linux.

#Workflow
___
1. Start Applens: [AppLens](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/579985/AppLens)
1. Navigate to `Configuration and Management` > `App Insight Feature Status`
1. This shows if Application Insights is enabled or not and if yes, what features are enabled along with it like `Profiler`, `Snapshot Debugger`, `SQL Commands`, `Collection Level` (`default or recommended`). In default mode, only essential features are enabled to ensure optimal performance.

   **NOTE:** Enabled here merely means it was toggled to 'Enabled' — it does not mean autoinstrumentation was successful or not. To check the success of autoinstrumentation, see [Detector - Application Insights Auto Instrumentation](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki)

#Public Documentation
___
- [What is autoinstrumentation for Azure Monitor Application Insights?](https://learn.microsoft.com/azure/azure-monitor/app/codeless-overview)
- [Supported environments, languages, and resource providers](https://learn.microsoft.com/azure/azure-monitor/app/codeless-overview#supported-environments-languages-and-resource-providers)

#Internal References
___
- [AppLens](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/579985/AppLens)
- [Detector - Application Insights Auto Instrumentation](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki)
