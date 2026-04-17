---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Support Boundaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Alerts/Support%20Boundaries"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Alerts Support Boundaries

## Alerts Interpretation

Azure Monitor Alerts depend on logs and metrics. Key principle: Monitor CSS knows how to interpret why an alert did/didn't fire (threshold, timespan analysis), but may not know what a specific RP metric measures. Work collaboratively with RP teams.

**Engage Resource Provider for:**
- What does RP's metric measure? What's healthy value?
- Which metric to use for health evaluation?
- Service Health alert didn't fire because PG didn't label subscription as impacted
- Interpretation of AAD Sign In Logs / risky sign-ins

**Important**: Even if RP needs engagement, consider whether transferring the case is best for customer. Monitor knowledge may be needed for threshold configuration, ASC log analysis, and reproductions.

## Azure Resource Graph Alerts (including Quota Alerts)

**ARG CSS handles:**
- ARG data concerns (latency, missing, partial)
- Explaining ARG data and alert firing logic (ARG data only)
- Raising throttling limit for managed identity

**Monitor CSS handles:**
- Alert functionality issues, CRUD operations
- LA data/query troubleshooting (if ARG joined to LA)

**Resource Provider CSS handles:**
- When certain quotas will be logged to create alerts
- ARG alert logic questions for specific resource types

**Quota Alert UI**: No team owner; collect browser trace, open ICM to CCE Apps - Azure Portal Extension.

## Built-In Azure Monitor Alerts

Services onboarded: Azure Backup/Site Recovery, Azure Stack Edge, Azure Local, Data Box Gateway, Event Grid, SCOM Managed Instance, Azure Quota Alerts (Preview).

**Onboarded service CSS handles:**
- Classic alerting + migration, Built-In UI, functionality (firing issues), content questions, advisory

**Monitor CSS handles:**
- Alert processing rules with Built-In Alerts (no direct action groups except Event Grid)
- Platform functionality only if RP investigation indicates platform issue

**Note**: Data Box Gateway and Azure Stack Edge CSS teams have NOT received training — issues go straight to PG via ICM.

## Security Alerts and Incidents

Security Alerts (Defender for Cloud, Sentinel) do NOT use Azure Monitor Alerts platform. Separate mechanism for emails/actions. Supported by Security CSS teams.

**SAPs**: Azure/Microsoft Defender for Cloud/Security Alerts management, Azure/Microsoft Sentinel/Incidents, Azure/Microsoft Sentinel/Analytics rules.

## Azure Advisor

Recommendation Digest uses Action Groups without Monitor alerting platform.

**Advisor CSS**: Digest CRUD/UI, logic, Activity Log writing
**Monitor CSS**: Action Group behavior/functionality, CRUD/UI

## Cost Management (ASMS)

Budget Alerts can optionally use Action Groups.

**ASMS CSS**: Cost alerting CRUD/UI, logic, email notification (non-action-group), budget alert not invoking action groups
**Monitor CSS**: Action Group behavior/functionality when configured with Budget Alerts

**Routing**: Do NOT manually route to ASMS. Autoroute via SAP: Azure/Billing/Cost Management/I need assistance with alerts, budgets or forecasted cost.

**Kusto Query for Budget Alert Action Group Investigation:**
```kusto
let startTime = datetime(2024-08-17 16:00);
let endTime = datetime(2024-08-17 23:00);
let subscriptionId = "";
cluster('aznscluster.southcentralus').database('AzNSPROD').AzNSTransmissions_All
| where CreatedTime between(startTime..endTime)
| where AssociatedGroupId contains strcat("/subscriptions/", subscriptionId)
| where JobCtxSource =~ "AIP Budget Notification Service"
```

## Azure Service Notification Direct Emails

Sent by Azure CXP via Service Health, Direct Email, or Iridias (internal only).

**Owning service CSS handles**: Content clarifications, why subscriptions received/didn't receive emails, impacted resources
**Communications Manager team**: Why specific users received/didn't receive emails (CRI to Service: Azure Communications Manager, Team: Communication Manager)

**Note**: Billing notifications only via direct email. Security/privacy via direct email, Service Health, or both.

## ICM Action (Azure Monitor Incident Action)

Not directly supported by CSS (internal customer feature). Have customer email icmsupport@microsoft.com.
**If issue is with the alert itself** (not the ICM action), treat as normal alerts case.
