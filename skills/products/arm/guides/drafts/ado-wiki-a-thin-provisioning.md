---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/Storage (S2D)/Thin Provisioning"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FInfrastructure%2FStorage%20%28S2D%29%2FThin%20Provisioning"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Thin Provisioning

## Overview
Thin provisioning is a storage allocation strategy that improves efficiency by allocating disk space dynamically based on actual usage, rather than reserving the full capacity upfront.

## Relevance to Readiness
- Disconnected operations
- Infrastructure scalability
- Cost optimization

It helps avoid over-provisioning and supports more agile resource planning.

## Key Concepts
- **Dynamic Allocation**: Storage is assigned as needed, not pre-allocated.
- **Efficiency Gains**: Reduces unused capacity and improves cost control.
- **Monitoring Required**: Overcommitment risks require proactive monitoring.

## Internal Guidance
- Use thin provisioning for test/dev environments or workloads with predictable growth.
- Avoid using it for mission-critical systems unless robust monitoring is in place.
- Coordinate with infra leads when enabling thin provisioning on shared or production resources.

## External Reference
https://learn.microsoft.com/en-us/azure/azure-local/manage/manage-thin-provisioning-23h2
