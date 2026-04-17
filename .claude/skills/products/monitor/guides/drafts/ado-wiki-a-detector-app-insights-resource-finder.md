---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Detector - App Insights Resource Finder"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FDetector%20-%20App%20Insights%20Resource%20Finder"
importDate: "2026-04-05"
type: troubleshooting-guide
---

#Overview
___
This detector allows the discovery of an Application Insights resource with only a specific data point:
- instrumentation key (ikey)
- application ID (appid)
- subscription ID (subid)
- workspace ID (workspace id)

#Considerations
___
To access this detector for an Application Insight resource that needs to be found, start App Lens using any accessible, known Application Insight resource.

This detector is an alternative to locate an Application Insight resource over the secured, limited access tool 'Mission Control'.

#Troubleshooting Guide (TSG)
___
1. Access AppLens: [AppLens](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/579985/AppLens)
1. Use AppLens without a known resource (use a resource URI of an Application Insights type)
1. The AppLens experience should show Application Insight related detectors on the left
1. Expand the "Configuration and Management" section to expose specific detectors
1. Select the detector named "App Insights Resource Finder"
1. Paste in any of the noted identifiers (ikey, appid, subid, workspace ID) — this will return a specific Application Insights resource or a list of related ones
1. If a list is returned, use a unique identifier with this detector again to get reader-friendly results
1. Key notes:
   - Data is latent (notice at top of results)
   - This detector also exposes the Daily Cap reset time — effectively the Component Info detector

#Public Documentation
___
- N/A

#Internal References
___
- [AppLens](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/579985/AppLens)
- [Locate Application Insights details with only Instrumentation Key or App Insights Name](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki)
- [Detector - App Insights Component Info](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki)

___
Created by: matthofa
Created: January 21, 2025
Last Modified by: matthofa
Last Modified on: January 21, 2025
