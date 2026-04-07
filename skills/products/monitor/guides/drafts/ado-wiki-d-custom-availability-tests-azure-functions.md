---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Code Samples and Lab Walkthroughs/Code Samples/Create and run custom availability tests using Azure Functions"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FCode%20Samples%20and%20Lab%20Walkthroughs%2FCode%20Samples%2FCreate%20and%20run%20custom%20availability%20tests%20using%20Azure%20Functions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Create and Run Custom Availability Tests Using Azure Functions

## Overview

Create an Azure Function with TrackAvailability() that runs periodically via TimerTrigger. Results are sent to Application Insights for querying and alerting. Allows customized tests beyond the portal UI capabilities, including monitoring apps inside Azure VNETs and in regions where standard Availability Tests are not available.

## Public Documentation

This information including the sample code is available at: [Review TrackAvailability() test results](https://learn.microsoft.com/azure/azure-monitor/app/availability-azure-functions)

## Steps

### 1. Create Timer Triggered Function

- **With existing App Insights resource**: Select "Application Insights" section during creation → "Select existing resource"
- **Without existing resource**: Azure Functions creates one by default

Follow: [Create an Azure Functions resource and Timer triggered function](https://learn.microsoft.com/azure/azure-functions/functions-create-scheduled-function)

### 2. Sample Code (run.csx)

Key configuration items in the sample code:
- `EndpointAddress` — use the endpoint URL from the Connection String of the target App Insights
- `testName` — name for your availability test
- `location` — set via `REGION_NAME` environment variable
- `uri` — website URL to test
- `contentMatch` — string to verify in response body (can be blank)

### 3. Create function.proj

```xml
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <TargetFramework>netstandard2.0</TargetFramework>
    </PropertyGroup>
    <ItemGroup>
        <PackageReference Include="Microsoft.ApplicationInsights.AspNetCore" Version="2.21.0" />
    </ItemGroup>
</Project>
```

### 4. Important Notes

- If using a different App Insights for monitoring vs. collecting availability logs, create a separate environment variable for the instrumentation key (e.g., `APPINSIGHTS_INSTRUMENTATIONKEY1`)
- To monitor private URLs in Azure resources, link the Function App to the same subnet via VNET integration

### 5. Verify Results

- Check the Availability tab in Application Insights
- Custom function tests won't appear in "Add test" but results are visualized in summary view
- Use Logs(Analytics) to query `availabilityResults` table

## Historical Note

This material was previously at https://learn.microsoft.com/azure/azure-monitor/app/availability-azure-functions but has since been pulled. Content sourced from https://github.com/MicrosoftDocs/azure-docs-pr/pull/88908/files
