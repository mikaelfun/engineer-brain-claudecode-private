---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Customer Scenarios/[TSG] Terminal Server Reprovisioning"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Customer%20Scenarios/%5BTSG%5D%20Terminal%20Server%20Reprovisioning"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# [TSG] Terminal Server Reprovisioning

## Introduction
During network device RMA process, customers may request Terminal Server (TS) reprovisioning. Also needed when TS breaks during upgrade.

Reference: [How to replace a terminal server within Azure Operator Nexus Network Fabric](https://learn.microsoft.com/en-us/azure/operator-nexus/howto-replace-terminal-server#microsoft-engineering-support)

## Scenarios

### Normal TS Reprovisioning Request
1. Collect: Subscription ID, Network Fabric ID, TS Serial number
2. Raise **Sev 4** IcM to **Network Fabric Triage** team
3. Confirm with PG that TS is reprovisioned

### Scheduled TS Reprovisioning Request
1. Collect: Subscription ID, Network Fabric ID, TS Serial number
2. Confirm scheduled time meets conditions:
   - **India working hours** or **after 11:00 AM Pacific Time**
   - Request submitted at least **two business days in advance**
3. Raise **Sev 4** IcM to Network Fabric Triage with scheduled time
4. Confirm with PG

### TS Broken During Upgrade
1. Collect: Subscription ID, Network Fabric ID, TS Serial number, Original IcM ID
2. Raise **Sev 3** IcM to Network Fabric Triage (Sev 2 if production impact asserted by customer)
3. Confirm with PG

## How to Get Network Fabric ID
Query the **Resource** table in [NNF Cluster DB](https://dataexplorer.azure.com/clusters/nnf-prod-hub-kusto.eastus/databases/nnf-prod-hub):
```kql
macro-expand isfuzzy=true Global as X (
    X.Resources
    | where * contains "<resource info you have>"
    | where armResource contains "networkFabricId"
)
```

## How to Confirm Reprovisioning Completed
Only reliable method: review a successful **Geneva Action output** shared by PG. Cannot determine from logs or configuration JSON.

## Reference
- IcM: [Incident-659978377](https://portal.microsofticm.com/imp/v5/incidents/details/659978377/summary)
