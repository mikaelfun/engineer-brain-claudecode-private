---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/App Service Web app Java/Enabling and collecting self-diagnostics logs - Java"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Autoinstrumentation/App%20Service%20Web%20app%20Java/Enabling%20and%20collecting%20self-diagnostics%20logs%20-%20Java"
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
Objective:
How to enable and collect self-diagnostics logging for the Application Insights Java agent. 

Purpose:
When you encounter problems with the application, self-diagnostics logging can help in identifying and diagnosing issues with the Application Insights SDK/agent and allow you to spot and address these issues effectively.


# Workflow
---
<details closed>
<summary><b>How to enable self-diagnostics logging</summary>
<br>

- Before we enable the logging, make sure your Java app has the write permission to the directory that holds the Java agent jar file.

- There are two ways to enable the self-diagnostics logging on Java agent:

<div style="margin:15px">

1. Using applicationinsights.json configuration
2. Using Environment variable

</div>

<br>
<br>
</details>

<div style="margin:15px">
  <details closed>
  <summary>Using applicationinsights.json configuration</summary>
  <br>

- You can paste the snippet below in your json file.

 <div style="margin-left: 20px;">

    {"selfDiagnostics": {
    "destination": "file+console",
    "level": "INFO",
    "file": {
      "path": "applicationinsights.log",
      "maxSizeMb": 5,
      "maxHistory": 1
    }}}    
</div>

- By default, Application Insights Java 3.x logs at level�`INFO`�to both the file�`applicationinsights.log`�and the console, corresponding to above configuration.

In the example above:
*   `level`�can be one of�`OFF`,�`ERROR`,�`WARN`,�`INFO`,�`DEBUG`, or�`TRACE`.
*   `path`�can be an absolute or relative path. Relative paths are resolved against the directory where�`applicationinsights-agent-3.x.x.jar`�is located.

  <br>
  <br>
  </details> </div>

<div style="margin:15px">
<details closed>
<summary>Using Environment variable</summary>
<br>

- You can also set the self-diagnostics�`level`�by using the environment variable�`APPLICATIONINSIGHTS_SELF_DIAGNOSTICS_LEVEL`.

- and custom define the self-diagnostics file location by using the environment variable�`APPLICATIONINSIGHTS_SELF_DIAGNOSTICS_FILE_PATH`.

<br>
</details></div>

<details closed>
<summary><b>How to collect self-diagnostics logs</summary>
<br>

- If you dont specify any path in the json file, the logs are created in the same directory where agent jar is located.

- In App Service environment, the diagnostic log from the codeless extension is generated in /home/LogFiles/ApplicationInsights dir, unless path is specified differently.

<br>
<br>
</details>

<details closed>

<summary><b>Note: When using Java agent programmatically</summary>
<br>

- By default, when enabling Application Insights Java programmatically, the�`applicationinsights.log`�file containing the agent logs are in the directory from where the JVM is launched (user directory).

<br>
<br>
</details>


# Public Documentation
---
Self-Diagnostics logging in Java agent: [Configuration options - Azure Monitor Application Insights for Java - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-config#self-diagnostics)

Latest Java agent: [Releases � microsoft/ApplicationInsights-Java](https://github.com/microsoft/ApplicationInsights-Java/releases)

# Internal References
---
To enable Java agent on your app service - [Enabling autoinstrumentation for a Java web application - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1615828/Enabling-autoinstrumentation-for-a-Java-web-application)
To enable using JVM arg or progamtically - [Configure Azure Monitor Application Insights for Spring Boot - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-spring-boot)

---
Last Modified date: 02/13/2025
Last Modified by: Aman Srivastava (amasriv)