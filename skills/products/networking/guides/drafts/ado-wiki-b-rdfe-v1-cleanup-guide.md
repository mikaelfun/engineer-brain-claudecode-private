---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/RDFE V1 Application Gateway Cleanup Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/RDFE%20V1%20Application%20Gateway%20Cleanup%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# RDFE V1 Application Gateway Cleanup Guide

Customers requesting deletion of their RDFE V1 Application Gateways can follow these steps.

## How to Identify the Gateway

### If AppGW Resource URI is unknown
1. In Jarvis Actions → Brooklyn > Application Gateways > **List Application Gateways**
2. Provide the subscription ID
3. For RDFE gateways, set **Region** to **Global**
4. Identify the AppGW no longer in use from the results

### If AppGW Resource URI is known
1. In Jarvis Actions → Brooklyn > Application Gateways > **Get Application Gateway**
2. Provide subscription ID and application gateway name
3. Leave the **Resource Group** field empty
4. For RDFE gateways, set **Region** to **Global**

## How to Delete (Cleanup)

1. Install the legacy Azure PowerShell Service Management module:
   - [Installing the Azure PowerShell Service Management module](https://learn.microsoft.com/en-us/powershell/azure/servicemanagement/install-azure-ps?view=azuresmps-4.0.0)
   - Note: These cmdlets are for legacy ASM (Azure Service Manager) resources; ASM is scheduled for retirement.

2. Run the following PowerShell commands:

```powershell
# Login to account and set proper subscription
Add-AzureAccount
Get-AzureSubscription
Select-AzureSubscription -SubscriptionId SubscriptionId -Default

# Get the list of application gateways in the subscription
Get-AzureApplicationGateway

# Remove the desired application gateway
Remove-AzureApplicationGateway -Name NameofGateway
```

Reference: [Remove-AzureApplicationGateway](https://learn.microsoft.com/en-us/powershell/module/servicemanagement/azure/remove-azureapplicationgateway?view=azuresmps-4.0.0)

## Contributor
- Gitanjali Verma
