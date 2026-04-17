---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Foundational and Specialist Troubleshooting/Troubleshooting Classic Application Gateways"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Classic%20Application%20Gateways"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to retrieve deployment information for Classic Application Gateway

## Overview

Classic Application Gateway is not viewable from Azure Portal nor shown on ASC under the Microsoft Classic Network Resource provider. This document outlines how to access Classic Application Gateway so you can properly troubleshoot these resources.

**Note**: This article uses the `Azure` classic PowerShell cmdlets. Find installation instructions in the [Azure Documentation](https://docs.microsoft.com/en-us/powershell/azure/servicemanagement/install-azure-ps?view=azuresmps-4.0.0#step-2-install-azure-powershell)

## How to Deploy & Retrieve Info via PowerShell from Customer end

Unlike other RDFE/Classic Azure resources like Classic Azure Virtual Network, that can be deployed from the Azure Portal or through the Azure Marketplace, Azure Classic Application Gateways can only be deployed and configured via ASM PowerShell.

**Documentation**: [Deploy Classic Application Gateway using PowerShell Azure module](https://docs.microsoft.com/bs-latn-ba/azure/application-gateway/application-gateway-create-probe-classic-ps)

**Note**: Classic Application Gateways cannot be viewed from customer's Azure Portal.

The existing classic Application Gateways in an Azure subscription can be retrieved using the following command:

```powershell
Get-AzureApplicationGateway # Lists all application gateways
Get-AzureApplicationGateway -Name contosoAppGw # To list a specific Application Gateway details
```

To fetch the configuration of a specific Application Gateway, use the following command:

```powershell
Get-AzureApplicationGatewayConfig -Name "Classic-AppGW" -ExportToFile "C:\Users\...\ClassicAppWG.xml" | Format-List
```

### Making changes to an existing classic Application Gateway

Export the config to a XML file:

```powershell
Get-AzureApplicationGatewayConfig -Name <ApplicationGateway_Name> -ExportToFile C:\Users\...\gw.xml
```

Make a backup copy of the XML file, then make desired changes. To implement the changes live:

```powershell
Set-AzureApplicationGatewayConfig -Name Prosware_AppGw -ConfigFile C:\Users\...\gw.xml
```

## How to Gather Deployment Information from Azure Backend

Since the information for Azure Classic Application Gateway deployments is not currently available in ASC, pull the deployment information using the following Kusto query:

```kql
cluster("aznw").database("aznwcosmos").ApplicationGatewaysExtendedLatest
| where CustomerSubscriptionId == "<Put CustomerSubscriptionId here>"
| where ResourceUri has "/resourceGroups/Default-Networking/" // To find Classic Application Gateways
| project DeploymentId, DeploymentType, LocationConstraint, State, SkuType, TPName, Lens_IngestionTime, CreatedDateTimeUTC,
ConfigTimestamp, GatewayName, GatewayId, GatewayVersion, GatewaySize, GatewaySubscriptionId, ResourceUri, HostedServiceName,
DnsName, VirtualIPs, VirtualIPsWithDetails, ConfigVersion, Config
```

Use `DeploymentId` or `GatewayId` from the above query to scope down Jarvis Logs and Dashboards.

## Dashboards & Logs

With `GatewayId` and `DeploymentId`, you can pull any Jarvis Logs under the `AppGWT` namespace just like with any other ARM Application Gateway.

- [Gateway Tenant Dashboards](https://portal.microsoftgeneva.com/dashboard/share/A1910DDD)
- [Application Gateway Dashboards](https://portal.microsoftgeneva.com/dashboard/share/6EEA1BC0)

## Contributors

* Oscar Artavia
* Rituraj Choudhary
