---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Code Samples and Lab Walkthroughs/Code Samples/Entra ID authentication/Entra ID authentication for Application Insights using local dev environment"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FCode%20Samples%20and%20Lab%20Walkthroughs%2FCode%20Samples%2FEntra%20ID%20authentication%2FEntra%20ID%20authentication%20for%20Application%20Insights%20using%20local%20dev%20environment"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Entra ID Authentication for Application Insights Using Local Dev Environment

## Overview

Set up a local client that authenticates with Entra ID via DefaultAzureCredential() while running from Visual Studio, to send telemetry to Application Insights. Recommended for local development and testing via an IDE.

For on-prem production: use Service Principal. For Azure-hosted apps: use Managed Identity.

## Sample Code

```csharp
using Azure.Identity;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Extensibility;

TelemetryConfiguration.Active.ConnectionString = "REPLACE WITH YOUR CONNECTION STRING";
var credential = new DefaultAzureCredential();
TelemetryConfiguration.Active.SetAzureTokenCredential(credential);
var tc = new TelemetryClient(TelemetryConfiguration.Active);

while (true)
{
    tc.TrackEvent("Event 123");
}
```

NuGet packages required: `Azure.Identity`, `Microsoft.ApplicationInsights`

## Workflow

1. Set up local console app in Visual Studio
2. Ensure you are logged into Visual Studio with your Azure account (Tools > Options > Azure Service Authentication)
3. Assign **Monitoring Metrics Publisher** RBAC role to the same user account on the Application Insights resource (Access Control IAM)
4. Set **Local Authentication** to "Disabled" in Application Insights properties
5. Telemetry should now ingest after successful authentication

## Public Documentation

- [Create an Entra ID app and service principal in the portal](https://learn.microsoft.com/azure/active-directory/develop/howto-create-service-principal-portal)
- [Assign Azure roles using the Azure portal](https://learn.microsoft.com/azure/role-based-access-control/role-assignments-portal)
- [Configure and enable Entra ID-based authentication](https://learn.microsoft.com/azure/azure-monitor/app/azure-ad-authentication?tabs=net#configure-and-enable-azure-ad-based-authentication)
- [DefaultAzureCredential](https://github.com/Azure/azure-sdk-for-net/tree/main/sdk/identity/Azure.Identity#enable-interactive-authentication-with-defaultazurecredential)
