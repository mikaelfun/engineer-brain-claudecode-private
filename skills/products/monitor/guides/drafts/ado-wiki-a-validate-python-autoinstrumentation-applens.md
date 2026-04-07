---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/App Service Web app Python/Validating successful autoinstrumentation with AppLens"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAutoinstrumentation%2FApp%20Service%20Web%20app%20Python%2FValidating%20successful%20autoinstrumentation%20with%20AppLens"
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
This guide is for explain how to validate successful autoinstrumentation through AppLens for Pythonbased applications running on App Services. 

AppLens allows CSS to investigate the status instrumentation without asking the customer and provides a means to investigate the issue to provide a higher quality FQR.


# Workflow
---

<details><summary>AppLens Access and Basics</summary>

>

 For details on getting access to AppLens and how to get started with it see:
  - [AppLens](/Application-Insights/How%2DTo/AppLens)


The Applens Overview page shows basic application information like Operating systems, name, resource information, kind and so on. This allows quick determination of key details of the App Service web app, the image shows the app service web app running on Linux (IsLinux = true). The LinuxFxVersion shows a web application was created, currently configured for Python 3.9. 
   - ![image.png](/.attachments/image-9b6056ee-8313-4145-a1e5-e840325855fe.png)

</details>


<details><summary>Using Applens Detectors to validate autoinstrumentation status</summary>

# Using Applens Detectors to validate autoinstrumentation status
-----

>

## Detector: App Insights Feature Status

- see [Detector - App Insights Feature Status](/Application-Insights/How%2DTo/AppLens/Detector-%2D-App-Insights-Feature-Status)

Enabled here merely means it was toggled to 'Enabled' it does not mean autoinstrumentation was successful or not. It provides insight as to which features are enable too. This detector shows Profiler and Snapshot debugger are on, but this is wrong as these features are not support for Python.

   ![image.png](/.attachments/image-c21ded6d-b1d3-4b4c-931f-a3ce9b792c82.png)

## Detector: Application Insights Java, Dot Net, Node, and Python Auto Instrumentation - Linux

- see [Detector - Application Insights Java, Dot Net, Node, and Python Auto Instrumentation - Linux](/Application-Insights/How%2DTo/AppLens/Detector-%2D-Application-Insights-Auto-Instrumentation)

There are multiple detectors with very similar names be sure to be looking at the correct one. 

This is one step further than being 'Enabled'. Enabled only means it is supposed to try and inject the Application Insight binaries into the application's process. If enabled every time the application starts autoinstrumentation will attempt to inject the Application Insight binaries into the application's process and if that is successful or not is what this detector shows.  This detector tells if the binaries were succesfully injected into the application's process or not. If it could not the detector shows 'failed' and it means the SDK binaries back off and did not load. 
Be aware even if autoinstrumentation is successful, it does not mean the telemetry Application Insight is collecting will be sent to the specified Application Insight's Component. There are many networking factors that can prevent the telemetry actually getting to the Component. 

Doing this should match what is seen in the Azure portal and Advanced tools/Kudu.
 
The below screenshot shows autoinstrumentation was successful which means the Application Insight binaries are loaded in the process. 

   - image coming

## Detector: App Settings

- see [Detector - App Settings](/Application-Insights/How%2DTo/AppLens/Detector-%2D-App-Settings)

Verify the "Application Insight Environment Variables" in "App Settings of web application. Navigate to "App Settings" and check the different Environment variables. For more information about each environment variable refer back to the prior Learning Objective: [Enabling Application Insights](/Application-Insights/Learning-Resources/Training/Course-Materials/Autoinstrumentation/App-Service-Web-app-Python/Enabling-Application-Insights). This here to bring awareness these variables can be checked by engineers without asking a customer.

  ![image.png](/.attachments/image-d7a1146d-6916-4352-901e-999bd3edfec1.png)

## Detector: Application Insights Auto Instrumentation

This is the original detector for auotinstrumentation. It only supported .Net applications and should not be used. However, it should still work and has been left for a variety of reasons.
   ![image.png](/.attachments/image-e1a02801-dae0-489b-9ae3-6644883f8149.png)

</details>

>

# Public Documentation
---
- [Enable application monitoring in Azure App Service for .NET, Node.js, Python, and Java applications](https://learn.microsoft.com/azure/azure-monitor/app/codeless-app-service?tabs=python)


# Internal References
---
- [AppLens](/Application-Insights/How%2DTo/AppLens)


---
Last Modified date: October 10, 2024
Last Modified by: Kuldeep Agrawal 



