# Mooncake Entra ID Troubleshooting Tool Readiness

## Overview
Reference guide for all tools, endpoints, portals, and Kusto clusters needed for Entra ID troubleshooting in Azure China (Mooncake/21V).

## CME Account Setup
- Follow [CME Account and Smart Card Services](https://microsoft.sharepoint.com/teams/CDOCIDM/SitePages/CME-Account-and-Smart-Card-Services.aspx)
- Offline smartcard unblock: https://cloudmfa-support.azurewebsites.net/SecurityKeyServices/SecurityKeyUnblock
- Join group: `CME\CSS-MooncakeCME` on https://oneidentity.core.windows.net
- Periodically reset password on https://oneidentity.core.windows.net
- Renew smartcard certificate before expiry

## Azure Support Center (ASC)
- URL: https://aka.ms/azuresupportcentermc
- Permission follows CME group
- Not integrated with Service Desk case ID in Mooncake
- Access via URL + subscription ID; if no subscription ID, use virtual ticket: `vt_9ece87c5-9604-46b3-aad0-a9aa087ecd04` and add tenant manually in Tenant Explorer

## Portal URLs

| Portal | URL |
|---|---|
| Azure Portal | https://portal.azure.cn |
| Entra Portal | https://entra.microsoftonline.cn |
| Office Portal | https://portal.partner.microsoftonline.cn |
| Intune Portal | https://intune.microsoftonline.cn |

## Documentation
- Mooncake Doc: https://docs.azure.cn (same structure as Public Azure docs)

## PowerShell Connection Endpoints

| Module | Command |
|---|---|
| Az module | `Connect-AzAccount -Environment AzureChinaCloud` |
| Az CLI | `az cloud set -n AzureChinaCloud` |
| MsGraph module | `Connect-MgGraph -ClientId <AppId> -Environment china -Scopes "User.Read.All","Group.ReadWrite.All" -TenantId <TenantId>` |
| MsOnline | `Connect-MsolService -AzureEnvironment AzureChinaCloud` |

> **Note**: MsGraph in Mooncake only supports custom application (delegated access with custom app). See [MS Graph custom app docs](https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands?view=graph-powershell-1.0#use-delegated-access-with-a-custom-application-for-microsoft-graph-powershell)

- Full endpoint comparison: [Azure China endpoint list](https://learn.microsoft.com/en-us/azure/china/resources-developer-guide)

## Kusto Clusters (Mooncake)

| Service | Cluster URL |
|---|---|
| EvoSTS | https://estscnn2.chinanorth2.kusto.chinacloudapi.cn |
| MSODS | https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn |
| AAD Gateway | https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn |
| B2C | https://cpimmcprod2.chinanorth2.kusto.chinacloudapi.cn |
| AdIbizaUx | https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn |

> **Note**: Mooncake Kusto clusters are only available with Kusto.Explorer application. Select AAD Authentication and authenticate with CME smartcard.

> **Permission**: Join `CME\CSS-MooncakeCME` group for Kusto access.

## Source
OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > Commercial tool > Troubleshooting Tool Readiness for AAD EEE
