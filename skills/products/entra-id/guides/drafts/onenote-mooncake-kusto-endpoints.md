# Mooncake Entra ID Kusto Cluster Endpoints & Portal URLs

## Portal URLs (Mooncake/21Vianet)
| Service | URL |
|---|---|
| Azure Portal | https://portal.azure.cn |
| Entra Portal | https://entra.microsoftonline.cn |
| Office Portal | https://portal.partner.microsoftonline.cn |
| Intune Portal | https://intune.microsoftonline.cn |

## PowerShell Endpoints
| Module | Command |
|---|---|
| Az Module | `Connect-AzAccount -Environment AzureChinaCloud` |
| Az CLI | `az cloud set -n AzureChinaCloud` |
| MsGraph | `Connect-MgGraph -ClientId <CustomClientId> -Environment china -Scopes "<scopes>" -TenantId <TenantID>` |
| MsOnline | `Connect-MsolService -AzureEnvironment AzureChinaCloud` |

> **Note**: MsGraph in Mooncake only supports custom application registration. Default Microsoft Graph PowerShell app is NOT available.

## Kusto Cluster Endpoints
Requires CME account + `CME\CSS-MooncakeCME` group membership. Only accessible via Kusto.Explorer with AAD Authentication + CME smartcard.

| Service | Cluster URL |
|---|---|
| EvoSTS | https://estscnn2.chinanorth2.kusto.chinacloudapi.cn |
| MSODS | https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn |
| AAD Gateway | https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn |
| B2C | https://cpimmcprod2.chinanorth2.kusto.chinacloudapi.cn |
| AdIbizaUx | https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn |

## Azure Support Center (Mooncake)
- URL: https://aka.ms/azuresupportcentermc
- Permission follows CME group
- Not integrated with Service Desk case ID
- Enter subscription ID directly, or use virtual ticket `vt_9ece87c5-9604-46b3-aad0-a9aa087ecd04` and add tenant manually

## Documentation
- Mooncake Doc: https://docs.azure.cn (same structure as public Azure docs)
- [Azure China endpoint comparison full list](https://learn.microsoft.com/en-us/azure/china/resources-developer-guide)

## Source
- OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > Troubleshooting Tool Readiness for AAD EEE
