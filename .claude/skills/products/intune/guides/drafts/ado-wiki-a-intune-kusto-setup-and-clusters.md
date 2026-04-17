---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Tools/Kusto"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FTools%2FKusto"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Intune Kusto Setup and Cluster Reference

## How to Request Kusto Access

1. Navigate to https://coreidentity.microsoft.com/manage/Entitlement/entitlement/intunekustoc-52ol
   - Alternatively: go to https://coreidentity.microsoft.com/ → Entitlements → search for **IntuneKusto-Css**
2. Click on **IntuneKusto-CSS** → **Request membership**
3. Select **For Myself**, ensure corporate account is selected
4. Role: **ReadOnly**
5. Business Justification: "As an Intune Support Engineer, I need access to support Intune CSS Customers"
6. Submit and wait for approval email

## Kusto Explorer Setup

1. Download Kusto Explorer from https://aka.ms/ke
2. Launch Kusto Explorer
3. Right-click **Connections** → **Add connection**
4. Cluster connection: `https://intune.kusto.windows.net` → OK
5. Expand Connections → Intune → Intune and select the second Intune entry to set cluster context

## Kusto Cluster Split (Important)

The original cluster `intune.kusto.windows.net` reached saturation. Logs are now split across regional clusters:

### North America
- `https://IntuneNA1.kusto.windows.net` (West US)
- `https://IntuneNA2.kusto.windows.net` (East US)
- `https://qrybkradxus01pe.westus2.kusto.windows.net` (All except EU)

### Europe
- `https://IntuneEU1.kusto.windows.net` (North Europe)
- `https://IntuneEU2.kusto.windows.net` (West Europe)
- `https://qrybkradxeu01pe.northeurope.kusto.windows.net` (EU only)

### Asia Pacific
- `https://IntuneAP1.kusto.windows.net` (Southeast Asia)
- `https://qrybkradxus01pe.westus2.kusto.windows.net` (All except EU)

### India
- `https://IntuneIN1.centralindia.kusto.windows.net` (Central India)
- `https://qrybkradxus01pe.westus2.kusto.windows.net` (All except EU)

## Cross-Cluster Querying

Queries on any cluster invoke cross-cluster functions fetching results from all clusters automatically.

**Query single cluster (fallback):**
```kql
cluster('intunena1.kusto.windows.net').database('Intune').table('IntuneEvent')
| where env_time > ago(1h)
| summarize count() by env_cloud_name
```

**Query all clusters (cross-cluster):**
```kql
cluster('intune.kusto.windows.net').database('Intune').IntuneEvent
| where env_time > ago(1h)
| summarize count()
```

**Scale Unit Mapping:** Check `KustoClusterToScaleUnitMapping` table in any cluster.

## Learning Resources

- [KQL Cheat Sheet](https://aka.ms/kqlcheatsheet)
- [Kusto Query Tutorial](https://docs.microsoft.com/en-us/azure/data-explorer/kusto/query/tutorial?pivots=azuredataexplorer)
- [Query Samples](https://docs.microsoft.com/en-us/azure/data-explorer/kusto/query/samples?pivots=azuredataexplorer)
- [Cloud Academy KQL Learning Paths](https://cloudacademy.com/library/azure-kusto-query-language-kql-2641/) (activate account first: https://aka.ms/CloudAcademyLearning)
