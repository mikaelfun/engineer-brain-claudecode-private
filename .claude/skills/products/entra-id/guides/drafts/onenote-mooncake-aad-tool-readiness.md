# Mooncake AAD Troubleshooting Tool Readiness

## CME Account Setup
1. Apply CME account and smartcard: [CME Account and Smart Card Services](https://microsoft.sharepoint.com/teams/CDOCIDM/SitePages/CME-Account-and-Smart-Card-Services.aspx)
2. Offline unblock smartcard: [Unblock Security Key](https://cloudmfa-support.azurewebsites.net/SecurityKeyServices/SecurityKeyUnblock)
3. Request to join group `CME\CSS-MooncakeCME` on [oneidentity.core.windows.net](https://oneidentity.core.windows.net)
4. Periodically reset CME password on oneidentity portal
5. Renew smartcard certificate before expiry

## Portal URLs (Mooncake)
| Portal | URL |
|--------|-----|
| Azure Portal | https://portal.azure.cn |
| Entra Portal | https://entra.microsoftonline.cn |
| Office Portal | https://portal.partner.microsoftonline.cn |
| Intune Portal | https://intune.microsoftonline.cn |
| Azure Support Center | https://aka.ms/azuresupportcentermc |

## SDK Connection Endpoints
| SDK | Command |
|-----|---------|
| Az Module | `Connect-AzAccount -Environment AzureChinaCloud` |
| Az CLI | `az cloud set -n AzureChinaCloud` |
| MsGraph Module | `Connect-MgGraph -ClientId <AppId> -Environment china -Scopes "..." -TenantId <TenantId>` |
| MsOnline | `Connect-MsolService -AzureEnvironment AzureChinaCloud` |

> Note: MsGraph in Mooncake only supports custom application (not Microsoft Graph Command Line Tools app).

## Kusto Cluster Endpoints (Mooncake)
Requires CME\CSS-MooncakeCME group membership. Only Kusto.Explorer app supported (select AAD Auth, use CME smartcard).

| Service | Endpoint |
|---------|----------|
| EvoSTS | https://estscnn2.chinanorth2.kusto.chinacloudapi.cn |
| MSODS | https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn |
| AAD Gateway | https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn |
| B2C | https://cpimmcprod2.chinanorth2.kusto.chinacloudapi.cn |
| AdIbizaUx | https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn |

## Documentation
- Mooncake Doc: https://docs.azure.cn (same structure as public Azure docs)
- [Azure China endpoint comparison full list](https://learn.microsoft.com/en-us/azure/china/resources-developer-guide)

## ASC (Azure Support Center) Notes
- Permission follows CME group
- Mooncake ASC is NOT integrated with Service Desk case ID
- Access via URL + enter Subscription ID directly
- If no subscription ID, use virtual ticket ID and add tenant manually in Tenant Explorer
