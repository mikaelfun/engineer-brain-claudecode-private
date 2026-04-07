---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/App Service Web app Java/Validating successful autoinstrumentation with Kudu"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAutoinstrumentation%2FApp%20Service%20Web%20app%20Java%2FValidating%20successful%20autoinstrumentation%20with%20Kudu"
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

1. Navigate to `Azure Portal` > `App Services` > select the Java web application that autoinstrumentation enabled.
1. On the left-hand side, go to the 'Developement tools' section and choose `Advanced Tools` and on the resulting pane choose `Go`:
   - ![image.png](/.attachments/image-fd05ec09-0ccd-4d5d-ba67-c6fa45f7a0c6.png)
1. The prior step will launch a browser session, in that session add `/applicationinsights` to the end of the URL in browser and hit enter, and the following experience will be seen:
   - ![image.png](/.attachments/image-b631935c-d447-400e-b579-146d53af4f78.png)
1. In the above image, the status of the extension shows `Auto-Instrumentation enabled successfully`. If the autoinstrumentation failed for some reason it would be reflected on this page and show a failed status. 
   

# Public Documentation
---
- [Enable application monitoring in Azure App Service for .NET, Node.js, Python, and Java applications](https://learn.microsoft.com/azure/azure-monitor/app/codeless-app-service?tabs=java)


# Internal References
---
- NA

---
Last Modified date: October 10, 2024
Last Modified by: Kuldeep Agrawal 


