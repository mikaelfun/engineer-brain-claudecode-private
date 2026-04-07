---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Customer Scenarios/[TSG] How to get similar metric display as customer"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Customer%20Scenarios/%5BTSG%5D%20How%20to%20get%20similar%20metric%20display%20as%20customer"
importDate: "2026-04-06"
type: troubleshooting-guide
status: work-in-progress
---

# [TSG] How to Get Similar Metric Display as Customer

> **Note:** This page is marked as Work In Progress.

## Introduction
When handling Nexus metrics/Azure Monitor cases, customers provide graph displays from Azure portal. To align understanding, replicate the same metric display in Geneva dashboard.

**Benefits:**
1. Confirms sync with customer's complaint
2. Simplifies IcM escalation to PG team

## Determine the Namespace

**Network Cloud** (NAKS cluster, BMM, Storage appliances, Kubernetes, containers):
- Examples: CPU Usage Total, Host Filesystem Usage In Percentage, Nexus Storage Host Latency

**Network Fabrics** (on-premises hardware: TOR, NPB, CE, Management Switches):
- Examples: Temperature Max, BGP Peer Status

## Reference Cases
- 2508060040012547
- 2508200040011176
- 2506170040014426
