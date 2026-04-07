---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/ASP.Net on-premises agent/Enabling configuration for the Application Insights Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Autoinstrumentation/ASP.Net%20on-premises%20agent/Enabling%20configuration%20for%20the%20Application%20Insights%20Agent"
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
This article covers the installation and enabling process for the Application Insights Agent. 

# Workflow
---
## Installation process:

1. Install the Az.ApplicationMonitor PowerShell module:

   ```powershell
   Install-Module -Name Az.ApplicationMonitor -AllowPrerelease -AcceptLicense
   ```

1. After installing the module, you'll need to close the existing PowerShell session and start a new one so that the new module is imported. Otherwise, you might see an error similar to the one below: 

   ![image.png](/.attachments/image-84d52f49-8309-41ec-b416-43af73ad6d4f.png)

1. As you start the new Administrator PowerShell session, import the recently installed module into the session: 

   ```powershell
   Import-Module -Name Az.ApplicationMonitor
   ```

1. Enable the agent: 

   ```
   Enable-ApplicationInsightsMonitoring -ConnectionString 'InstrumentationKey=XXXX-XXXX-XXXX-XXXX;IngestionEndpoint=...' -AcceptLicense
   ```

   <div style="border:0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;background-color:#add8e6">
       <font color="black">
           <b>Note:</b> 
        Replace the value of -ConnectionString with the connection string of your own Application Insights resource.                 
         <br>
       </font>
   </div>

   <div style="border:0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;background-color:#add8e6">
       <font color="black">
           <b>Note:</b> 
        This cmdlet will cause a restart on your IIS service.                   
         <br>
       </font>
   </div>

   As the cmdlet finishes, you should be able to see a similar output generated: 

   ![image.png](/.attachments/image-160f75cc-8cbf-485b-af7d-00b38d071330.png)

   Take note of the highlighted output, as they surface the changes the agent introduces to be able to inject the SDK binaries into the IIS hosting processes running the apps. 
   
   From the output above, we can see the enabling process makes changes to the `applicationHost.config` file under `C:\Windows\System32\inetsrv\config`, installs important DLLs under `C:\Program Files\WindowsPowerShell\Modules\Az.ApplicationMonitor\2.0.0\content\Runtime` and also modifies the following registry keys: 

   
   ```
   Computer\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\IISADMIN
   Computer\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\W3SVC
   Computer\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\WAS
   ```

   ![image.png](/.attachments/image-5f0f30e0-8a7b-4214-aa92-8f902476c285.png)

   ![image.png](/.attachments/image-c9661852-3fa9-497f-8235-4464e00329bc.png)

   ![image.png](/.attachments/image-841dbc73-1b0c-4411-8ae0-a429c3e3c818.png)

   ![image.png](/.attachments/image-d12685d1-eab2-428d-9047-5c3bc92abf82.png)


1. Generate HTTP requests to your application. Go to IIS Manager, drop-down the Sites option and select your website. Then, select the 'Browse' option on the far right: 

   <IMG  src="https://dev.azure.com/Supportability/6f9dfd80-6071-4f7b-8bf9-c97214ca68cf/_apis/git/repositories/bebfc12e-d2ce-4ed1-8a64-d64c20264fd2/Items?path=/.attachments/image-1e6638eb-668d-438b-bd46-3fd3029b308e.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>

1. Validate telemetry arrives to your Application Insights resource: 

   ![image.png](/.attachments/image-f08b0e52-a5f9-4c60-a8ca-24a403f19fe5.png)

   ![image.png](/.attachments/image-96b880f2-c5f3-457d-8132-727ff0a39339.png)


# Public Documentation
---
- [Instructions](https://learn.microsoft.com/azure/azure-monitor/app/application-insights-asp-net-agent?tabs=getting-started#instructions)


# Internal References
---
- N/A

---
Last Modified date: 5/29/2024
Last Modified by: nzamoralopez
