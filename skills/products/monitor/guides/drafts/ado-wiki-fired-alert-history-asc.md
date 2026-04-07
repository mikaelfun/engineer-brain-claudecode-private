---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/All Alerts/How to get history of fired alerts in Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FAll%20Alerts%2FHow%20to%20get%20history%20of%20fired%20alerts%20in%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Get History of Fired Alerts in Azure Support Center

## Prerequisites
- Obtain ASC permissions
- Navigate to the desired alert rule in ASC (see: "How to get alert rule details from Azure Support Center")

## Steps

1. Open Azure Support Center and navigate to the desired alert rule.

2. Click on the **Fired Alerts** tab.

3. Populate the **Start Time (UTC)** and **End Time (UTC)** date/time pickers, then click **Run**.

4. Review the **Summary** section:

   | Grouping | Description |
   |----------|-------------|
   | Total Alerts | Total number of alerts processed (fired or resolved) |
   | Alerts Fired | Number of alerts that fired |
   | Alerts Resolved | Number of alerts that were resolved |
   | Notification Failures | Number of alert fires/resolved where notification processing failed |

5. Review the **Alert Run Details** section for each alert:

   | Property | Description |
   |----------|-------------|
   | Alert ID | Unique alert instance identifier |
   | Alert Fire Time | UTC timestamp of when the alert fired |
   | Notification Time | Timestamp of notification processing completion |
   | Condition | Alert condition (Fired or Resolved) |
   | AMP Confirmed | Whether alert was confirmed by Alert Management Platform (includes CorrelationId) |
   | AMP Status | Status of AMP processing |
   | Action Groups from Alert Config | Links to action groups used by the alert rule |
   | Action Rules | Links to action rules applied to processing |
   | Notification Status | Summary of notification processing by AzNS |
   | Notification Data | JSON blob with detailed notification action results between AMP and AzNS |

**Key Field**: Notification Data is the most important field for investigating notification issues - it shows each notification action and its status separately.
