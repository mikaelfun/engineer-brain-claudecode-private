---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Code Samples and Lab Walkthroughs/Code Samples/Entra ID authentication/Entra ID authentication for Application Insights using Managed identity"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FCode%20Samples%20and%20Lab%20Walkthroughs%2FCode%20Samples%2FEntra%20ID%20authentication%2FEntra%20ID%20authentication%20for%20Application%20Insights%20using%20Managed%20identity"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Entra ID Authentication for Application Insights Using Managed Identity

## Overview

Set up a web app hosted in App Services that authenticates with Entra ID via Managed Identity to send telemetry to Application Insights. Recommended approach for applications hosted in Azure (Azure VM, App Services, Azure Functions).

## Workflow

1. Set up a local .NET Core web application using Visual Studio (.NET 6+)
2. Add Application Insights .NET SDK to your local app
3. Publish your app to Azure App Services
4. Test that telemetry is being sent to Application Insights
5. Enable Managed Identity on the App Service resource (Identity blade > System assigned > On)
6. Add code changes to Program.cs:

```csharp
builder.Services.Configure<TelemetryConfiguration>(config =>
{
    var credential = new ManagedIdentityCredential();
    config.SetAzureTokenCredential(credential);
});

builder.Services.AddApplicationInsightsTelemetry(new ApplicationInsightsServiceOptions
{
    ConnectionString = "InstrumentationKey=XXXX;IngestionEndpoint=https://westus2-5.in.applicationinsights.azure.com/;LiveEndpoint=https://westus2.livediagnostics.monitor.azure.com/"
});
```

7. Re-publish the updated changes
8. Assign the **Monitoring Metrics Publisher** RBAC role to the App Service's managed identity on the Application Insights resource (Access Control IAM)
9. Set **Local Authentication** to "Disabled" in Application Insights properties

## Public Documentation

- [How to use managed identities for App Service and Azure Functions](https://learn.microsoft.com/azure/app-service/overview-managed-identity?tabs=portal%2Chttp)
- [Assign Azure roles using the Azure portal](https://learn.microsoft.com/azure/role-based-access-control/role-assignments-portal)
- [Configure and enable Entra ID-based authentication](https://learn.microsoft.com/azure/azure-monitor/app/azure-ad-authentication?tabs=net#configure-and-enable-azure-ad-based-authentication)
