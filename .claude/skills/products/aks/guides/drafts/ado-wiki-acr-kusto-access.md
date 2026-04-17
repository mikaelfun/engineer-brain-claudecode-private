---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/Platform and Tooling/Tools/Kusto/ACR Kusto Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FKusto%2FACR%20Kusto%20Access"
importDate: "2026-04-05"
type: reference-guide
---

# ACR Kusto Access

The Azure Container Registry team maintains Kusto clusters for troubleshooting and diagnostics.

## Kusto Cluster Endpoints

| Environment | Cluster URL |
|-------------|-------------|
| Public | `acr.kusto.windows.net` |
| Fairfax (USGov) | `acrff.kusto.usgovcloudapi.net` |
| Mooncake (China) | `acrmc2.chinaeast2.kusto.chinacloudapi.cn` |

## Access Management

Access is managed via MyAccess group **"ACR Kusto Access"**.

- Request access at https://myaccess
- Search for project "ACR Kusto Access"
- Access auto-expires and requires periodic renewal

## Mooncake Notes

- **Important**: Client Security must be set to **dSTS-Federated**
- Kusto Cluster Connection: `acrmc2.chinaeast2.kusto.chinacloudapi.cn`

## Contact

- ACR Kusto Admins: Krater-Admins@microsoft.com
