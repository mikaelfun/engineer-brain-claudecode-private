---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Prometheus alerts (public preview)/How to get Prometheus rule group properties from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FPrometheus%20alerts%20(public%20preview)%2FHow%20to%20get%20Prometheus%20rule%20group%20properties%20from%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Get Prometheus Rule Group Properties from Azure Support Center

## Steps

1. Open ASC from the support request
2. Locate the Prometheus rule group from the left-hand navigation:
   - Use **Resource Group** structure, OR
   - Select providers → expand **microsoft.alertsmanagement** → **prometheusRuleGroups** → click on the rule group name
3. Under the **Properties** tab:
   - **Rule Group Properties** section shows rule group information
   - Each alert rule and recording rule in the group is displayed in its own section
   - **Payload** section shows the full JSON payload of the rule group
