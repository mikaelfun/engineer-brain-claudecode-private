---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/ALDO Support Processes/Grafana Dashboards"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FALDO%20Support%20Processes%2FGrafana%20Dashboards"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Grafana

Winfield PG selected [Grafana](https://grafana.com/) for Observability dashboards, to better align with upstream engineering teams.

## Winfield Grafana Dashboards

https://grafana-projectwinfield-huatdvg8gmb0hqen.eus.grafana.azure.com/dashboards

## Access Requests

Two groups are required for access to Grafana dashboards, and underlying data:

1. **CoreIdentity** -> [CloudMine-EV](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/cloudmineev-vysd) -> **Reader** role
1. **CoreIdentity** -> [Azure Edge Observability (azureedgeobs-kguy)](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azureedgeobs-kguy) -> **ARCA-PROD-ReadOnly** role
1. Members of **Azure Local Disconnected Ops CSS <aldo-css@microsoft.com>** security group are automatically granted roles to the dashboard.

ARCA-PROD-ReadOnly role is used to grant access to the Grafana dashboard website, and both roles are needed to read the different underlying data sources depending on the dashboard. The underlying data is all managed by [Kusto Endpoints](/Azure-Local-Disconnected-Operations/ALDO-Support-Processes/Kusto-Endpoints) so the same access patterns are required.
