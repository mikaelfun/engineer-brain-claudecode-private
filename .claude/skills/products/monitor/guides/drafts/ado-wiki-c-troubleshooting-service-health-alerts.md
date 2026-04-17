---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Service Health alerts"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20Service%20Health%20alerts"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Service Health Alerts

## Scenario
Question on, or problem with receiving a service health alert.

## Concepts
Service health alerts use the Dial-tone service (a highly available independent infrastructure) as a bypass in public cloud. For public cloud, AzNS treats the signal from Dial Tone as primary. For sovereign clouds, the notification to AzNS is triggered by AMP.

## Prerequisites
- Kusto Explorer with connections for AzNS cluster (aznscluster.southcentralus.kusto.windows.net) and ICM cluster (icmcluster.kusto.windows.net)

## Information Needed
- Resource ID of the Alert rule
- Tracking ID of the service health event (e.g., "8N_M-V98")
- Timestamp in UTC where alert was expected to fire

## Troubleshooting

### By Cloud Environment

**Public cloud**: Follow "How to analyze Activity Log Alert event evaluation history in Azure Support Center"

**Fairfax / Mooncake**: Follow "How to analyze Activity Log Alert event evaluation history in Kusto for sovereign clouds"

### If alert did fire but notification not received
Refer to "How to get status of an Azure Service Health Notification from Kusto"

### If no indication of fired alert / condition met

1. **Check subscription inclusion**: Verify customer's subscription was included in the service health event using "How to check if a subscription is impacted by a Service Health event in Kusto"

2. **Check activity log**: Use "How to get Activity Log events from Azure Support Center"
   - If activity log **not available**: Use TSG for investigating Service/Resource Health Issues with Activity logs
   - If alert **fired with delay**: Use TSG for latent service/resource health events
   - If activity log **available**: Compare event payload against alert rule properties

### Common Pitfall: Region Filter Mismatch
Alert rule condition may specify "Global" as impacted region, but "Global" is just a region name — it does NOT cover all Azure regions. Each target region must be explicitly included in the condition filter. For example, if the incident region is "West Europe", "West Europe" must be in the alert rule's `containsAny` list.
