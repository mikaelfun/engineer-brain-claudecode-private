---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/How Tos/Access to File Sync Dashboards_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FHow%20Tos%2FAccess%20to%20File%20Sync%20Dashboards_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Access to Azure File Sync Dashboards

The Azure File Sync Dashboards provide a consolidated view of data and visualizations of performance patterns for File Sync scenarios.

## Access Requirements

> **Note:** Access to the OneIdentity group **"Xfiles Kusto Access"** is required.

- **FTE Engineers:** [Request Access](https://coreidentity.microsoft.com/manage/entitlement/entitlement/xfileskustoa-kwut)
- **Delivery Partners:** Only **Infosys** and **LTIMindtree** have clearance (SFI Initiative restriction).

### DP Access Entitlement

| Name | Description |
|------|-------------|
| [CSS-AzCore-Storage-DP](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/storagekusto-mkm3) | Provides access to various XStore (Storage) Kusto clusters. DPs only. |

> **Warning:** DPs must not request FTE core entitlements (XDAKustoClusterAccess, XStorePartnersKusto).

## Dashboards

**Dashboard link:** [AFS Dashboard](https://portal.microsoftgeneva.com/dashboard/XEEE-Dashboards/FileSync)

| Dashboard | Description |
|-----------|-------------|
| Tiering and Recall | For Sync Tiering and Recall scenarios when Cloud Tiering is enabled |
| Sync Progress & Performance | For tracking Sync Progress (Upload/Download) and Cloud-side Enumeration |
| Server Agent Health | For viewing Agent and Filter details on SEP |
| AFS Management | For viewing AFS Management operations |

Start by entering the Subscription ID, then select the appropriate fields from all available dropdowns.

- [AFS Dashboard Brownbag recording](https://microsoft.sharepoint.com/:v:/t/VMHub/EWTtIF_pw69Ci2OBO7nFaaMB1QiN_ZENtvKu5kSXMChpSA?e=mjHlJO)
