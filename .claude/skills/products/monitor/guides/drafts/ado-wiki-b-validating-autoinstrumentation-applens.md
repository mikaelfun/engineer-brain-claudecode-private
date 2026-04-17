---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/App Service Web app .Net Core/Validating successful autoinstrumentation with AppLens"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Autoinstrumentation/App%20Service%20Web%20app%20.Net%20Core/Validating%20successful%20autoinstrumentation%20with%20AppLens"
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
This guide is for explain how to validate successful autoinstrumentation through AppLens of .Net Core applications running on App Services. 

AppLens allows CSS to investigate the status instrumentation without asking the customer and provides a means to investigate the issue to provide a higher quality FQR.


# Workflow
---

<details><summary>AppLens Access and Basics</summary>

>

 For details on getting access to AppLens and how to get started with it see:
  - [AppLens](/Application-Insights/How%2DTo/AppLens)


The Applens Overview page shows basic application information like Operating systems, name, resource information, kind and so on. This allows quick determination of key details of the App Service web app, the image shows the app service web app running on Windows (IsLinux = false). In short this provides details related to the web application. 
   - ![image.png](/.attachments/image-3f55f636-b174-4abd-829a-040c607fcf48.png)

</details>


<details><summary>Using Applens Detectors to validate autoinstrumentation status</summary>

# Using Applens Detectors to validate autoinstrumentation status
-----

>

## Detector: App Insights Feature Status

- see [Detector - App Insights Feature Status](/Application-Insights/How%2DTo/AppLens/Detector-%2D-App-Insights-Feature-Status)

Enabled here merely means it was toggled to 'Enabled' it does not mean autoinstrumentation was successful or not. It provides insight as to which features are enable too.

   ![image.png](/.attachments/image-1c898d79-27c5-418b-bb50-ffe118b19ea3.png)

## Detector: Application Insights Java Node and Dot Net Auto Instrumentation

- see [Detector - Application Insights Auto Instrumentation](/Application-Insights/How%2DTo/AppLens/Detector-%2D-Application-Insights-Auto-Instrumentation)

This is one step further than being 'Enabled'. Enabled only means it is supposed to try and inject the Application Insight binaries into the application's process. If enabled everytime the application starts autoinstrumentation will attempt to inject the Application Insight binaries into the application's process and if that is successful or not is what this detector shows.  This detector tells if the binaries were succesfully injected into the application's process or not. If it could not the detector shows 'failed' and it means the SDK binaries back off and did not load. 
Be aware even if autoinstrumentation is successful, it does not mean the telemetry Application Insight is collecting will be sent to the specified Application Insight's Component. There are many networking factors that can prevent the telemetry actually getting to the Component. 

Doing this showing what is seen in the Azure portal and Advanced tools/Kudu.
 
The below screenshot shows autoinstrumentation was successful which means the Application Insight binaries are loaded in the process. 

   ![image.png](/.attachments/image-53422e45-90bc-48f7-8ba8-c8d4ea2dc5a4.png)

## Detector: App Settings

- see [Detector - App Settings](/Application-Insights/How%2DTo/AppLens/Detector-%2D-App-Settings)

Verify the "Application Insight Environment Variables" in "App Settings of web application. Navigate to "App Settings" and check the different Environment variables. For more information about each environment variable refer back to the prior Learning Objective: [Enabling autoinstrumentation for a Java web application](/Application-Insights/Learning-Resources/Training/Course-Materials/Autoinstrumentation/App-Service-Web-app-Java/Enabling-autoinstrumentation-for-a-Java-web-application). This here to bring awareness these variables can be checked by engineers without asking a customer.

  ![image.png](/.attachments/image-7419e690-c747-4606-9702-6373128aa256.png)

## Detector: Application Insights Auto Instrumentation

This is the original detector for auotinstrumentation. It only supported .Net applications and should not be used. However, it should still work and has been left for a variety of reasons.
   ![image.png](/.attachments/image-e1a02801-dae0-489b-9ae3-6644883f8149.png)

</details>

>

# Public Documentation
---
- [Application Monitoring for Azure App Service and Java]()https://learn.microsoft.com/azure/azure-monitor/app/azure-web-apps-java


# Internal References
---
- [AppLens](/Application-Insights/How%2DTo/AppLens)


---
Last Modified date: October 10, 2024
Last Modified by: Kuldeep Agrawal 



