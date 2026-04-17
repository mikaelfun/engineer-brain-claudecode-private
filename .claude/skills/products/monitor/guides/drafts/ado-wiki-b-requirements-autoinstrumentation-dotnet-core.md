---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/App Service Web app .Net Core/Requirements for autoinstrumention of .Net Core web apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Autoinstrumentation/App%20Service%20Web%20app%20.Net%20Core/Requirements%20for%20autoinstrumention%20of%20.Net%20Core%20web%20apps"
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
Understand the basic requirements to use the autoinstrumentation feature of a .Net Core Azure Web app. 

"Autoinstrumentation" is the current official term by Microsoft to mean "codeless", "codeless attach" or "automatic instrumentation".

Understanding the requirements are key to saving time and effort troubleshooting scenarios that are or are NOT supported. Being able to identify unsupported scenarios early allows proper expectations to be set and drive an overall better support experience.

This material does **not** focus on container web apps, the Publish type of "container".


# Workflow
---
The first requirement is the .Net Core version. Only applications built on supported languages will offer the option to turn on Application Insights or autoinstrument the application. 

The requirements for .Net Core supported versions are documented here, [Enable autoinstrumentation monitoring](https://learn.microsoft.com/azure/azure-monitor/app/azure-web-apps-net-core?tabs=Windows%2Cwindows#enable-autoinstrumentation-monitoring) but it only calls out the fact only Long Term Support (LTS) versions are supported. 

.Net Core LTS is like any software, and it has versions too and only some of those versions are actually supported. The specific supported versions available here, [.NET and .NET Core Support Policy](https://dotnet.microsoft.com/platform/support/policy/dotnet-core) and this link is nested within the prior link above. 

The supported .Net Core LTS versions should match up to the web app creation experience and the choices it offers:
-  ![image.png](/.attachments/image-2734ee7c-20da-4070-bbde-bdef3ac93aba.png)

**NOTE:** 
At that the time of creating this material the autoinstrumentation of .Net Core applications on Azure App Services relies on the classic Application Insights .Net Core SDK. 

At some point in the future this will transition to use OpenTelemetry, see the "note" here: [Application monitoring for Azure App Service and ASP.NET Core](https://learn.microsoft.com/azure/azure-monitor/app/azure-web-apps-net-core?tabs=Windows%2Cwindows). To be clear the note goes on to say and shares a linke, *"For more information, see [Enable Azure Monitor OpenTelemetry for .NET, Node.js, Python and Java applications](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-enable?tabs=aspnetcore#enable-azure-monitor-opentelemetry-for-net-nodejs-python-and-java-applications)"* The link takes the user to a manual instrumentation guidance.

# Public Documentation
---
- [Enable application monitoring in Azure App Service for .NET, Node.js, Python, and Java applications](https://learn.microsoft.com/azure/azure-monitor/app/codeless-app-service?tabs=aspnetcore)
- [Supported environments, languages, and resource providers](https://learn.microsoft.com/azure/azure-monitor/app/codeless-overview#supported-environments-languages-and-resource-providers)
- [.NET and .NET Core Support Policy](https://dotnet.microsoft.com/platform/support/policy/dotnet-core)

# Internal References
---
- [Language Resource](/Application-Insights/References/Language-Resource)


---
Last Modified date: September 18th, 2024
Last Modified by: matthofa
