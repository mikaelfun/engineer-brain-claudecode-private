---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Activity Log Alerts/How to send a test Service Health alert"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FActivity%20Log%20Alerts%2FHow%20to%20send%20a%20test%20Service%20Health%20alert"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Send a Test Service Health Alert

> **Important**: Do not use this capability to test actions in action groups or test behavior of action rules. These can be tested separately using other types of alerts that a customer can configure and generate artificial triggers themselves.

> **Important**: Use this capability sparingly. The team that will be processing these test alerts is the same team that processes real production service health issues so we do not want to consume their resources with a flurry of tests.

## Overview

One of the most important alert rules that a customer can configure is to be notified when an Azure service is experiencing issues that may impact their production solutions. Such issues are referred to as Service Impacting Events (SIEs) or Outages and are identified to customers through the Azure Service Health service.

The Azure Service Health service by itself does not generate an alert but the creation of an Azure Service Health event is also captured in the Azure Activity Log as an event and can therefore fire an alert using a focused activity log alert rule referred to as a service health alert rule.

## Instructions

1. **Collect the following information:**

   | Property | Description |
   |:---------|:------------|
   | Azure subscription | The Azure subscription id |
   | Alert rule resourceId | The Azure resource id of the activity log alert rule to be tested |
   | Scenario details | Event Type, Impacted Service, Impacted Region |

2. **Review the alert configuration in Azure Support Center** to understand exactly how the alert rule is configured and make sure this configuration matches the customer's expectations.

   > **Note**: *Global* is an identified region and applies to issues with services that are not region specific. To alert against such issues, the Global region must be explicitly defined or no regions (aka all regions) defined.

3. **Create an ICM** to the Azure Communications Manager team to request creation of the test event:
   - ICM Template: `https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=m33nAP`

4. **Monitor the ICM** for status updates. Creation of the test service health event will generally be completed within 30 minutes.

5. **Confirm the service health event** was written to the customer's activity log (can take 15-20 minutes to appear in ASC).

6. **Confirm the alert fired** in Azure Support Center.
