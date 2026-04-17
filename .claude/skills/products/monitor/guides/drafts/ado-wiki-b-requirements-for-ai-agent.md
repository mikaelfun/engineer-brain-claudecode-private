---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/ASP.Net on-premises agent/Requirements for the Application Insights Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Autoinstrumentation/ASP.Net%20on-premises%20agent/Requirements%20for%20the%20Application%20Insights%20Agent"
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
This article lists out the pre-requisites for the Application Insights Agent installation. 

# Workflow
---
## Pre-requisites before installation: 
1. No IIS nested configurations, see [reference](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/agent/status-monitor-v2-troubleshoot#iis-nested-applications)

   IIS nested applications are essentially applications that are nested within another application in the IIS hierarchy. This is achieved by making a folder an application or adding a virtual folder that points to another application.

   Each nested application can have its own web.config file and can be set up as an application rather than just a virtual directory within the parent  application. However, it�s important to note that nested applications can inherit configuration values from the parent application�s web.config.

   An easy way to identify if a customer is running nested application is by opening IIS Manager and looking under 'Sites'. If you see a similar nested-like layout involving different apps, this may serve as an indication to confirm if nested apps are in place or not. 

   <IMG  src="https://www.eidias.com/image/fetch?hash=XWS7CTf3k7wy0JgV6KIIFi%252f0eyRTTvoxtqBU6iE4ewo%253d&amp;name=IIS-Nested web apps_thumb.jpg"  alt="IIS-Nested web apps"/>

1. No IIS shared configuration, see [reference and workaround](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/agent/status-monitor-v2-troubleshoot#conflict-with-iis-shared-configuration)

   IIS Shared Configuration is a feature that allows multiple IIS servers to share the same configuration files. This feature is particularly useful when managing multiple servers or building a web farm.

   Here�s how it works:
   - All configuration data is stored in a central location.
   - Each IIS server reads the configuration data from that central location.
   - This ensures that all servers are using the same configuration, reducing the risk of errors and inconsistencies.   

   To verify is shared configuration in enabled, go to IIS manager and look for the Shared Configuration option, as shown below: 

   <IMG  src="https://learn.microsoft.com/iis/manage/managing-your-configuration-settings/shared-configuration_264/_static/image2.jpg"  alt="Screenshot of I I S Manager with Shared Configuration icon selected."/>

   Click on that option and validate if it looks something like the below: 

   <IMG  src="https://learn.microsoft.com/iis/manage/managing-your-configuration-settings/shared-configuration_264/_static/image4.jpg"  alt="Screenshot of Actions pane in Shared Configuration with Export Configuration dot dot dot highlighted."/>

   If the option 'Enable shared configuration' is unchecked, this means it is not in place. 

   If you can't find the Shared Configuration in IIS, it may be because this feature was introduced on IIS 7 and the IIS version running on that specific version is older than that. In that case, this shouldn't be a concern for the Application Insights Agent enrollment. 

1. An existing Application Insights resource. Store the connection string for this resource as it will be used later on this article
1. PowerShell version needs to be 5.1, see [reference](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/agent/status-monitor-v2-troubleshoot#powershell-versions)

   One can validate the version of PowerShell running on a host via the following command: 

   ```powershell
   $PSVersionTable
   ```

   ![image.png](/.attachments/image-4928ca19-efa0-492c-92e9-d90dc3fae40f.png)
�
1. On an Administrator PowerShell session, run the following cmdlets, as indicated on this [reference](https://learn.microsoft.com/azure/azure-monitor/app/application-insights-asp-net-agent?tabs=getting-started#installation-prerequisites): 


   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
   Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force
   Set-PSRepository -Name "PSGallery" -InstallationPolicy Trusted
   Install-Module -Name PowerShellGet -Force
   ```

   ![image.png](/.attachments/image-4a49a036-4fd0-4b3c-9c1c-8b954e56647d.png)

# Public Documentation
---
- [Instructions](https://learn.microsoft.com/azure/azure-monitor/app/application-insights-asp-net-agent?tabs=getting-started#instructions)
- [How to nest applications in IIS](https://www.eidias.com/blog/2019/2/21/how-to-nest-applications-in-iis)
- [Shared Configuration with IIS 7](https://learn.microsoft.com/iis/manage/managing-your-configuration-settings/shared-configuration_264)

# Internal References
---
- N/A

---
Last Modified date: 5/29/2024
Last Modified by: nzamoralopez
