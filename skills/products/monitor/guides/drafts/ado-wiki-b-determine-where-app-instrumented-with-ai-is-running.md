---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/General References/Determine Where an application instrumented with Application Insights is Running"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/General%20References/Determine%20Where%20an%20application%20instrumented%20with%20Application%20Insights%20is%20Running"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Determine Where an Application Instrumented with Application Insights is Running

## Overview

Determine where the application instrumented with Application Insights is running is important as it will dictate future actions.

## Considerations

Understanding where the instrumented application is running is crucial for data collection that may be required.
Data collection tasks vary differently for a Web App hosted in Azure App Services versus one running on-premises. This will be the case for collecting:
- IIS/HTTP logs
- network trace
- memory dump

*Regardless of the method and findings, validating the resulting data with the customer in the FQR is critical.*

**NOTE:** Remember there can always be more than one app reporting to the same Application Insights component.

The key point is to leverage available resources to better explain the issue and the surrounding details, and share that information with the customer allowing them to correct our findings.

## Step by Step Instructions

### DFM

- The Customer Statement section may include the name of the resource and the location of the application.
- The Customer Statement section may actually show a resource instrumented with Application Insights rather than the Application Insights resource, check the `-ResourceUri:`.
- The `-ResourceUri` shows the resource provider and the name of the resource. For example:
  ```
  /subscriptions/<subscriptionId>/resourceGroups/<rgName>/providers/Microsoft.Web/sites/CodelessAttachSamples
  ```
  - `/providers/` shows: `Microsoft.Web/sites` → this means it is an App Service Web or Function app running in Azure.
  - `/sites/` followed by the name of the web app or function (e.g., `CodelessAttachSamples`)
- Use AppLens to get more details such as knowing if it is a function or a web app and the ikey being used.

### ASC

- Expand Resource Explorer and group by Resource Provider → navigate to `microsoft.web` → check if there is a subtype under sites with a matching name to the Application Insights component.
- Use AppLens and its detectors to validate.

**Querying Customer Data tab:**
- Query the `requests` table and look at `cloud_RoleName` — this often translates to the Azure App Service Web app name, that can be used in AppLens.
- Query the `requests` table and look at the `url` column — it will show the domain name(s) of the applications sending data. For example, if all domain names show `http://myappname.centralus.cloudapp.azure.com`, it would indicate an Azure VM running IIS hosting a web app.

**Notes:**
- `cloud_RoleName` is typically the app service web app or function name.
- `cloud_RoleInstance` is typically either an instance of an app service resource or even machine or container instance.
- `sdkVersion` can show what language and instrumentation method (auto or manual).
