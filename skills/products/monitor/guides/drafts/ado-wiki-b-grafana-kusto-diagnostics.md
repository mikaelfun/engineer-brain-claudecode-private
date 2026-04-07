---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Grafana/How-To/Obtaining Information About Grafana Instance Via Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FManaged%20Grafana%2FHow-To%2FObtaining%20Information%20About%20Grafana%20Instance%20Via%20Kusto"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Obtaining Information About Grafana Instance Via Kusto

## Kusto Cluster

**Cluster**: https://azuregrafana.westus2.kusto.windows.net/

**Access**: Join the TM-GrafanaTelemetry group on [aka.ms/coreidentity](https://aka.ms/coreidentity)

## Sample Queries

### Alert Evaluation Failures
```kusto
grafanaContainer
| where PreciseTimeStamp > ago(7d)
| where Role =~ "AMGNAME"
| where Tenant == "AMGREGION"
| where msg has 'Failed to evaluate rule'
| project-reorder t, msg, traceID, error, rule_uid, logger
```

### Notification Failures
```kusto
grafanaContainer
| where PreciseTimeStamp > ago(7d)
| where Role =~ "AMGNAME"
| where Tenant == "AMGREGION"
| where msg has 'Notify for alerts failed'
| project-reorder t, msg, traceID, err, rule_uid, logger
| sort by TIMESTAMP desc
```

### Query by Trace ID
```kusto
grafanaContainer
| where PreciseTimeStamp >= ago(7d)
| where traceID == "88888888888888888888888888888"
| project TIMESTAMP, traceID, error, err
```

### Image Rendering Errors (snapshots, reports, alert snapshots)
```kusto
grafanaContainer
| where PreciseTimeStamp > ago(3d)
and Role contains "GRAFANA_RESOURCE_NAME"  // don't insert complete resource ID, only the name
and (logger has_any ("report", "render") or isempty(logger))
and msg != "Rendering"
and (msg contains "render" or error contains "render" or isnotempty(error) or isnotempty(message))
| project PreciseTimeStamp, logger, msg, error, err, message, failure, url, stack, level
```

## Notes

- The `rule_uid` column identifies which alert rule is affected
- Match rule_uid with the UID in the alert rule URL: `https://AMGNAME.eus.grafana.azure.com/alerting/grafana/rule_uid/`
- Replace `AMGNAME` with the Grafana resource name and `AMGREGION` with the region
