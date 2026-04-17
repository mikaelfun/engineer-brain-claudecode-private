---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Activity log alert didn't fire when it should (Missed Alert)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20Activity%20log%20alert%20didn%27t%20fire%20when%20it%20should%20(Missed%20Alert)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Activity Log Alert Didn't Fire (Missed Alert)

## Activity log alerts replat
For information on activity log alerts replatform, please refer to the internal slide deck.

**Please note:** Activity log alerts evaluation telemetry retention is limited to 30 days to comply with GDPR requirements.

## Scenario
Question on, or problem with receiving an Activity log alert.

Follow separate guides for:
- Resource health alert issues → Troubleshooting Resource Health alerts
- Service health alert issues → Troubleshooting Service Health alerts

## Information you will need
- The resource id of the Alert rule (selected by customer when opening support request)
  - How to get the ResourceId value of an Azure resource from Azure Support Center
- The timestamp in UTC where alert was expected to fire (provided by customer)

## Troubleshooting

1. **Check evaluation history** — Based on cloud environment:
   - **Public cloud**: Activity log alerts replatformed over LA. Follow "How to analyze Activity Log Alert event evaluation history in Azure Support Center"
   - **Fairfax / Mooncake**: Migration not started yet. Follow sovereign cloud Kusto-based evaluation history guide

2. **If execution history shows alert did fire** → Issue is with notification delivery:
   - Follow "How to get history of fired alerts in Azure Support Center"
   - Follow "How to trace an Azure Notification in Azure Support Center"

3. **If no fired alert indication** → Check activity log events:
   - Follow "How to get Activity Log events from Azure Support Center"
   - For additional fields: "How to get details of an Activity Log event from Azure Support Center"

4. **Compare activity log event payload against alert rule properties**:
   - There should be an exact string match between condition and event on all property fields
   - If match found: Check if alert rule was updated after the investigated timestamp
   - Examine Resource Change History tab or follow Kusto guide for changes older than 14 days
