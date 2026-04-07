---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/Agentless scanning VM VA/[TSG] Agentless K8s node VA"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Servers%2FVulnerability%20Assessment%2FAgentless%20scanning%20VM%20VA%2F%5BTSG%5D%20Agentless%20K8s%20node%20VA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [TSG] Agentless K8s Node VA

## Overview - How Agentless K8s Node Scanning Works

1. Agentless Scanning platform discovers customer's AKS node pools (VMSS clusters).
2. Platform splits them to underlying VMSS instances and scans each using Worker VM.
3. After scans finish, results are correlated back to the same VMSS cluster (node pool) and sent together to VA service.
4. VA service sends results to Recommendations platform, Security Map, etc.

> **Note:** For AKS managed nodes, if a vulnerability is flagged before the patched node image is available, the only options are to wait or raise a request with the AKS team. Ensure VMSS nodes are restarted or rescaled periodically so they can fetch the latest image once released. Even the latest cluster or node pool versions may not remediate every CVE immediately.

**References:**
- [Public Doc - Agentless k8s node scanning](https://review.learn.microsoft.com/en-us/azure/defender-for-cloud/kubernetes-nodes-overview)

## Kusto Dashboards

- [K8s node VA | Jarvis](https://portal.microsoftgeneva.com/dashboard/RomeR3Prod/CSS%2520dashboards/Agentless%2520VA/K8s%2520node%2520VA)
- [Agentless VA | Jarvis](https://portal.microsoftgeneva.com/dashboard/RomeR3Prod/CSS%2520dashboards/Agentless%2520VA)

## Initial Troubleshooting Steps

### 1. Get Azure VMSS Cluster Resource ID or AKS Cluster Resource ID

- VMSS format: `/subscriptions/{subId}/resourceGroups/{RG}/providers/Microsoft.Compute/virtualMachineScaleSets/{VMSS}/virtualMachines/{VM}`
- AKS format: `/subscriptions/{subId}/resourceGroups/{RG}/providers/Microsoft.ContainerService/managedClusters/{AKS}`

### 2. Check if Agentless is Enabled at Subscription or Resource Level

Use dashboards:
- [MDC-Billing/Plans Dashboard](https://dataexplorer.azure.com/dashboards/dee7f3f7-1f8c-4b09-9518-433be60836eb)

Or KQL query:

```kusto
let SubscriptionId = ""; // Add customer subscription
let shouldCheckSubscription = not(isempty(SubscriptionId));
cluster('Rometelemetrydata').database("RomeTelemetryProd").DefenderPlans
| where TimeStamp >= ago(1d)
| where shouldCheckSubscription == false or Scope has SubscriptionId
| summarize arg_max(TimeStamp, Level, *) by Plan
| project-reorder TimeStamp, RecordCreationTime, Scope, Level, Plan, SubPlan, IsEnabled, Extensions
| sort by Plan
```

### 3. Verify Agentless Platform + VA Service Processing

Navigate to [K8s node VA | Jarvis](https://portal.microsoftgeneva.com/dashboard/RomeR3Prod/CSS%2520dashboards/Agentless%2520VA/K8s%2520node%2520VA) dashboard:

1. Enter VMSS ID / AKS Cluster ID parameter.
2. Enter customer Subscription ID parameter.
3. Go through widgets results top to bottom.
4. Analyze any failures in the processing pipeline.

### 4. Take Action

Determine root cause:
- **Customer misuse** (not onboarded correctly, misunderstood UX) -> Guide customer.
- **Scanning pipeline issue** -> Create IcM with MUST HAVE details:
  - Customer Tenant ID
  - Customer Subscription ID
  - Customer AKS Cluster ID
  - Customer Node Pool ID (VMSS Cluster ID)
  - env_cv of the failed operation (from dashboard query results)
