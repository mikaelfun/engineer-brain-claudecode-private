---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Advanced Troubleshooting/TSG: ExpressRoute Connection Monitor"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FTSG%3A%20ExpressRoute%20Connection%20Monitor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG: ExpressRoute Connection Monitor

## Overview

Connection Monitor (CM) provides unified and continuous network connectivity monitoring. Customers can create a CM when creating an ER connection or for any existing ER connection.

## Setup Scenarios

1. **Enable while creating ER connection**: Monitoring tab → Check 'Enable monitoring' → select endpoints and Action Group
2. **Enable for existing connection**: ER Connection > Monitoring > Connection Monitor > Add Connection Monitor
3. **View existing monitors**: ER Connection ToC > Connection Monitor (lists all existing CMs)

## Pre-requisites

Ensure before creating a Connection Monitor:
1. `Microsoft.OperationalInsights` RP must be registered for the ER connection subscription
2. Required RBAC on ER connection subscription:
   - `Microsoft.Authorization/*/Read` — fetch role assignments and policy definitions
   - `Network Contributor` — Network Watcher RBAC and alert management
   - `Microsoft.HybridCompute/machines/write` — for on-prem ARC machines
   - `Microsoft.Network/virtualNetworks/write` — for Azure endpoints
   - `Contributor` or `Microsoft.Resources/subscriptions/resourceGroups/write` — if NetworkWatcher not enabled
   - `Microsoft.Resources/deployments/*`
   - `Microsoft.OperationalInsights/workspaces/*`
3. For ARC endpoints: customer must start a **TCP listener** on the configured port, else tests will fail

## Concepts

- **Endpoint types**: On-premise (ARC-enabled servers) and Azure (hub/spoke VNets with ≥1 VM or VMSS)
- **Tests**: Send test traffic between on-prem and Azure endpoints; two categories:
  - `Onprem to Azure`: per ARC server → all Azure endpoints (region-constrained for source)
  - `Azure to Onpremise`: per Azure endpoint → all on-prem endpoints
- **Test data storage**: Log Analytics workspace → tables `NWConnectionMonitorTestResult` and `NWConnectionMonitorPathResult`
- **Test values**: `1` = Pass, `2` = Warning, `3` = Fail

## Frequently Asked Questions

**Q: Difference between ARC endpoints and External Addresses?**
- ARC endpoints: bidirectional tests (ARC server ↔ Azure endpoints)
- External Addresses: unidirectional only (Azure → external IP; no reverse direction)

**Q: Why "source endpoints must be in same region as ExpressRoute connection"?**
Only endpoints in the same region as the ER connection can be used as source in tests. Cross-region endpoints can be destinations but not sources.

**Q: Why are some hub/spoke VNets not listed?**
Only VNets with at least one VM or VMSS are listed.

**Q: Maximum VNets in Azure endpoints?**
Hard limit: 30 VNets. Contact PG if more are needed.

**Q: How many VMs per VNet?**
Maximum 3 VMs selected per VNet. Network Watcher Extension is auto-enabled on them.

**Q: What does dashboard Status mean?**
- `Pass` — All tests passed
- `Fail` — All tests failed
- `Indeterminate` — No test data in Log Analytics (last hour)
- `Warning (x/y)` — Some tests failed; shows count

## Debug Common Errors

| Error | Description / Resolution |
|-------|--------------------------|
| NetworkWatcher Extension / Workspace creation failure | Check customer RBAC; view deployment script logs; check ARM logs with correlation ID |
| `InternalServerError` on CM deployment | Backend issue; check ARM/NRP logs with correlation ID |
| Azure → On-premise test failures | Customer has not started TCP listener on on-prem endpoint; validate with `netstat` |
| Deployment fails due to `AllowSharedKeyAccess` disabled on storage accounts | Policy blocks SAS tokens used during deployment for temp storage/containers; exempt the resource group from the policy, then retry |

## Connection Monitor Alerts

### Default Alert (ExpressRoute CM)

When CM is configured for an ER connection, a default Azure Monitor metric alert is created:
- **Signal**: Test result (Maximum > 2, i.e., any Warning/Fail)
- **Check every**: 1 minute, look-back: 5 minutes
- Alert fires if **any single test** crosses threshold → may be noisy; can be adjusted

### Updating the Default Alert

Navigate: Connection Monitor dashboard → Alerts column → Edit condition

| Requirement | Action |
|-------------|--------|
| Alert when >50% tests failing | Change aggregation to Average |
| Alert per destination | Add `Destination endpoint name` dimension |
| Alert per source-destination pair | Add both Source and Destination endpoint name dimensions |
| Alert for specific destination | Add dimension with specific value |

> ⚠️ Adding dimensions creates separate time series per value → impacts billing.

### Alert on RTT

Signal: `Round Trip Time` → static threshold → add dimensions as needed.

### Alert on Checks Failed Percent

Signal: `Checks Failed Percent` → Aggregation: Average → Threshold: suitable value.

### Alerting When No Data Is Reported

Metric alerts with static thresholds **do NOT fire** when metrics are not emitted (e.g., source VM shut down, Network Watcher extension not running).

Use **Log Analytics-based alerts** to detect absence of data:

```kusto
NWConnectionMonitorTestResult
| where ConnectionMonitorResourceId =~ "/subscriptions/<SubId>/resourcegroups/<Rg>/providers/microsoft.network/networkwatchers/<NWName>/connectionmonitors/<CMName>"
```

Set up a log alert that triggers if no records ingested within a defined time window.

## Resources

- [Network Watcher Connection Monitor TSG](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/143933/Connection-Monitor)
- [ConnectionMonitor documentation](https://learn.microsoft.com/en-us/azure/network-watcher/connection-monitor-overview)
- [Create ConnectionMonitor for ExpressRoute](https://learn.microsoft.com/en-us/azure/expressroute/how-to-configure-connection-monitor)
- [Metric alerts across multiple time series](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-metric-multiple-time-series-single-rule)
- [Create log alert rules](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-create-log-alert-rule)
