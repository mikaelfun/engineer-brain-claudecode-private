---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Prometheus alerts (public preview)/How to get Prometheus rule group properties from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FPrometheus%20alerts%20(public%20preview)%2FHow%20to%20get%20Prometheus%20rule%20group%20properties%20from%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Get Prometheus Rule Group Properties from Kusto

## Prerequisites

Kusto Explorer with connection to **Azalertsprodweu** cluster.

## Query

Cluster: **Azalertsprodweu** → Database: **Insights**

```kql
let RuleID = "RULEGROUPIDGOESHERE";
AlertRuleTelemtry
| where TIMESTAMP >= ago(7h)
| where RuleType == "Microsoft.AlertsManagement/prometheusRuleGroups"
| where RuleArmId =~ RuleID
| extend Payload = todynamic(JsonPayload)
| evaluate bag_unpack(Payload)
| project TIMESTAMP,RuleArmId,RuleUpdateTimes,RuleCreationTime,rule
```

## Notes

- Rule group payload is listed in the **rule** field
- A snapshot of all rules is taken every 6 hours, so you may get multiple results
- If multiple results, use the one with the latest TIMESTAMP
- Don't change the timestamp condition (`ago(7h)`) as it aligns with the snapshot interval
