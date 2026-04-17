---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/App Service Web app .Net Core/Validating successful autoinstrumentation with Kudu"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Autoinstrumentation/App%20Service%20Web%20app%20.Net%20Core/Validating%20successful%20autoinstrumentation%20with%20Kudu"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

:::template /.templates/Sandbox-Header.md
:::


[[_TOC_]]


# Overview
---
This document serves as a guide for validating successful autoinstrumentation of java web applications running on App Services. This validation process looks at this validation using the Azure Portal.


# Workflow
---

This approach uses the "Advanced Tools" feature commonly referred to as "Kudu".

1. In the Azure Portal go to "App Services" and select the .Net Core web application that autoinstrumentation enabled.
1. On the left-hand side, go to the "Developement tools" section and choose "Advanced Tools" and on the resulting pane choose "Go":
   - ![image.png](/.attachments/image-4ebfb5f3-75cc-4827-bbd9-014ad3b2cfc4.png)
1. The prior step will launch a browser session, in that session add "/applicationinsights" to the end of the URL in browser and hit enter, and the following experience will be seen:
   - ![image.png](/.attachments/image-2f9130a6-d11a-4cd6-a2c8-f87e55656b47.png)   
1. In the above image, the status of the extension shows "Auto-Instrumentation enabled successfully". If the autoinstrumentation failed for some reason it would be reflected on this page and show a failed status, see the image below. Here it failed and "autoinstrumenation" backed off due to the fact the SDK was detected and loaded within the application.
   - ![image.png](/.attachments/image-ee96f12e-4525-4aff-8760-800a324249a8.png)
1. **Note:** The image below is displayed when the application is not running, or an ASP .NET is not yet deployed to the web app. In Step #5 of the Build section of this lab an ASP.Net core application was deployed from Visual Studio to the web. The experience below would occur if this page was accessed prior to deployment.
   - ![image.png](/.attachments/image-b4f9b079-3b63-42b4-8fea-8e4f32e5319b.png)

# Public Documentation
---
- [Enable application monitoring in Azure App Service for .NET, Node.js, Python, and Java applications](https://learn.microsoft.com/azure/azure-monitor/app/codeless-app-service?tabs=aspnetcore)
- [Troubleshoot Application Insights auto-instrumentation](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/telemetry/auto-instrumentation-troubleshoot)

# Internal References
---
- NA

---
Last Modified date: October 15, 2024
Last Modified by: Matthofa


