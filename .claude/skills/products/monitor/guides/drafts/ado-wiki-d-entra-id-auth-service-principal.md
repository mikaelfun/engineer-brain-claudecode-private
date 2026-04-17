---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Code Samples and Lab Walkthroughs/Code Samples/Entra ID authentication/Entra ID authentication for Application Insights using Service Principal"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FCode%20Samples%20and%20Lab%20Walkthroughs%2FCode%20Samples%2FEntra%20ID%20authentication%2FEntra%20ID%20authentication%20for%20Application%20Insights%20using%20Service%20Principal"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Entra ID Authentication for Application Insights Using Service Principal

## Overview

Set up a local client that authenticates with Entra ID via Service Principal to send telemetry to Application Insights. Recommended for on-prem applications only; for Azure-hosted apps, use Managed Identity instead.

## Sample Code

```csharp
using Azure.Identity;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Extensibility;

var configuration = TelemetryConfiguration.CreateDefault();
configuration.ConnectionString = "CONNECTION STRING GOES HERE";
var credential = new ClientSecretCredential(tenantId: "XXXX", clientId: "XXXX", clientSecret: "XXXX");
configuration.SetAzureTokenCredential(credential);
var telemetryClient = new TelemetryClient(configuration);

telemetryClient.TrackEvent("Event test sent with ad auth + service principal");
telemetryClient.TrackTrace("Trace test sent with ad auth + service principal");
```

NuGet packages required: `Azure.Identity`, `Microsoft.ApplicationInsights`

## Workflow

1. Set up local client (console app in Visual Studio)
2. Create Service Principal:
   - Entra ID > App registrations > New registration
   - Set Redirect URI as 'Web' with value `https://monitor.azure.com`
   - Copy client ID and tenant ID
   - Create client secret (save the secret value immediately)
3. Update code with Service Principal credentials
4. Assign **Monitoring Metrics Publisher** RBAC role to the Service Principal on the Application Insights resource
5. Set **Local Authentication** to "Disabled" in Application Insights properties

## Known Issue: AADSTS53003 from Home/Remote

When running against the internal Microsoft tenant from a remote/home location:

**Error**: `AADSTS53003: Access has been blocked by Conditional Access policies. The access policy does not allow token issuance.`

**Cause**: Microsoft's Conditional Access policy blocks SPN token issuance from outside the physical corporate network.

**Solution**: Connect to **MSFT-AzVPN-Manual** VPN first. See [aka.ms/AzureVPN](https://aka.ms/AzureVPN).

## Public Documentation

- [Create an Entra ID app and service principal in the portal](https://learn.microsoft.com/azure/active-directory/develop/howto-create-service-principal-portal)
- [Assign Azure roles using the Azure portal](https://learn.microsoft.com/azure/role-based-access-control/role-assignments-portal)
- [Configure and enable Entra ID-based authentication](https://learn.microsoft.com/azure/azure-monitor/app/azure-ad-authentication?tabs=net#configure-and-enable-azure-ad-based-authentication)
