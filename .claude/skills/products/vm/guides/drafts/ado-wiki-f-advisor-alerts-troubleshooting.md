---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/TSGs/Advisor Alerts not received or not triggered_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Advisor%2FTSGs%2FAdvisor%20Alerts%20not%20received%20or%20not%20triggered_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Advisor Alerts Not Received or Not Triggered

## Summary

This TSG covers situations where Advisor Alerts are not received/not triggered, even though a recommendation is generated and received by customer. Alerts are sent via Action Groups (e.g., email).

## Key Concept: Alert Flow

Advisor generates recommendation -> Activity Log event created -> Alert rule evaluates -> AzNS processes -> Action Group delivers notification

## Troubleshooting Steps

### Step 1: Check AzNS Transmission Status

Check whether Azure Notification Service (AzNS) received a request from Advisor.

**Prerequisites:** Join SG 'AzNS Kusto Viewers' via [IDWeb](https://idweb.microsoft.com/IdentityManagement/aspx/common/GlobalSearchResult.aspx?searchtype=e0c132db-08d8-4258-8bce-561687a8a51e&content=AzNS%20Kusto%20Viewers)

**Cluster:** [aznscluster.southcentralus](https://aznscluster.southcentralus.kusto.windows.net/AzNSPROD)

```kql
cluster('aznscluster.southcentralus.kusto.windows.net').database('AzNSPROD').AzNSTransmissions_All
| where AssociatedGroupId =~ "/subscriptions/<SubID>/resourceGroups/<RG>/providers/microsoft.insights/actionGroups/<ActionGroupName>"
| where CreatedTime > ago(90d)
| project CreatedTime, NotificationId, MechanismType, NotificationState, JobCtxIdType, JobCtxSource, JobCtxDescription, ActionHash
| order by CreatedTime desc
```

**Interpretation:**
- **Alerts found in AzNS but not delivered:** Issue is with AzNS/downstream. Collaborate with Azure Monitoring team (Azure\Alerts and Action Groups).
- **Alerts NOT found in AzNS:** Advisor is not sending the alert. Continue troubleshooting below.

### Step 2: Verify Alert Configuration

- Check alert scope (subscription vs resource group vs single resource)
- Verify Action Group is correctly configured
- Confirm the configured date has passed since setup (30 days for monthly, 7 days for weekly)

Reference: [How to set up an Advisor Alert](https://learn.microsoft.com/en-us/azure/advisor/advisor-alerts-portal)

### Step 3: Understand By-Design Behavior

**Critical:** Advisor alert rules are scoped Activity Log alert rules. Advisor only generates an Activity Log event when a recommendation is **first created**. No subsequent events are generated if the recommendation is updated. This is by design.

## Known Behavior

- Suppression entries remain even if recommendation is resolved or resource deleted
- Suppression entries stay until user reactivates them
- Security recommendations have a TTL of 60 hours

## Escalation

Submit AVA request to Advisor SMEs: [Azure Advisor SME Channel](https://teams.microsoft.com/l/channel/19%3ae676dc5eeb0f4bdb83999d5ec0317f00%40thread.tacv2/MGMT%2520-%2520Advisor%2520and%2520Advisor%2520Score%2520(AVA))
