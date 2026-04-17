---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/App Service Web app Java/Validating successful autoinstrumentation with AppLens"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAutoinstrumentation%2FApp%20Service%20Web%20app%20Java%2FValidating%20successful%20autoinstrumentation%20with%20AppLens"
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
This guide is for explain how to validate successful autoinstrumentation through AppLens of Java-based applications running on App Services. 

AppLens allows CSS to investigate the status instrumentation without asking the customer and provides a means to investigate the issue to provide a higher quality FQR.


# Workflow
---

<details><summary>AppLens Access and Basics</summary>

>

 For details on getting access to AppLens and how to get started with it see:
  - [AppLens](/Application-Insights/How%2DTo/AppLens)


The Applens Overview page shows basic application information like Operating systems, name, resource information, kind and so on. This allows quick determination of key details of the App Service web app, the image shows the app service web app is configured to be a Java 8 application running on Linux. In short this provides most of the details related how the web application itself and discussed previously in [Requirements and considerations for the autoinstrumentation of a Java web app](/Application-Insights/Learning-Resources/Training/Course-Materials/Autoinstrumentation/App-Service-Web-app-Java/Requirements-and-considerations-for-the-autoinstrumentation-of-a-Java-web-app)

It is not totally uncommon for the App Service web app to be configured for one version of the language but another version of the language being deployed to the web app, that is Jave 8 vs Java 7. If it happens then it may be possible that either application itself and or Application Insights won't work properly.
- ![image.png](/.attachments/image-3f55f636-b174-4abd-829a-040c607fcf48.png)

</details>



<details><summary>Using Applens Detectors to validate autoinstrumentation status</summary>

# Using Applens Detectors to validate autoinstrumentation status
-----

>

## Detector: App Insights Feature Status

- see [Detector - App Insights Feature Status](/Application-Insights/How%2DTo/AppLens/Detector-%2D-App-Insights-Feature-Status)

Enabled here merely means it was toggled to 'Enabled' it does not mean autoinstrumentation was successful or not.

   ![image.png](/.attachments/image-00af783e-76ea-4feb-9db3-e6d8a241efaf.png)

## Detector: Application Insights Java Node and Dot Net Auto Instrumentation

- see [Detector - Application Insights Auto Instrumentation](/Application-Insights/How%2DTo/AppLens/Detector-%2D-Application-Insights-Auto-Instrumentation)

This is one step further than being 'Enabled'. Enabled only means it is supposed to try and inject the Application Insight binaries into the application's process. If enabled everytime the application starts autoinstrumentation will attempt to inject the Application Insight binaries into the application's process and if that is successful or not is what this detector shows.  This detector tells if the binaries were succesfully injected into the application's process or not. If it could not the detector shows 'failed' and it means the SDK binaries back off and did not load. 
Be aware even if autoinstrumentation is successful, it does not mean the telemetry Application Insight is collecting will be sent to the specified Application Insight's Component. There are many networking factors that can prevent the telemetry actually getting to the Component. 

Doing this showing what is seen in the Azure portal and Advanced tools/Kudu.
 
The below screenshot shows autoinstrumentation was successful which means the Application Insight binaries are loaded in the process. 

   ![image.png](/.attachments/image-1ef95c76-9b46-4ab5-8a40-fbdfa5e9a174.png)

## Detector: App Settings

- see [Detector - App Settings](/Application-Insights/How%2DTo/AppLens/Detector-%2D-App-Settings)

Verify the `Application Insight Environment Variables` in appsettings of web application. Navigate to `AppSettings` and check the different Environment variables. For more information about each environment variable refer back to the prior Learning Objective: [Enabling autoinstrumentation for a Java web application](/Application-Insights/Learning-Resources/Training/Course-Materials/Autoinstrumentation/App-Service-Web-app-Java/Enabling-autoinstrumentation-for-a-Java-web-application).

  ![image.png](/.attachments/image-9c431950-e39d-4955-849f-9a7e02cef08a.png)

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



