---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/Manage SDN/Manage Software Load Balancers"
sourceUrl: "https://learn.microsoft.com/en-us/azure/azure-local/manage/load-balancers"
importDate: "2026-04-06"
type: operational-guide
---

# Manage Software Load Balancers

## Overview
SLBs are a core SDN component for scalable HA traffic distribution.

## Key Concepts
- SLB MUX: handles inbound/outbound traffic.
- Dynamic NAT: external access via port mapping.
- High Availability: resilient failover.
- Policy Integration: routing, firewall, segmentation.

## Internal Guidance
- Use SLBs for HA or external access services.
- Define LB rules/NAT via Network Controller or WAC. Monitor SLB health.

## External Reference
https://learn.microsoft.com/en-us/azure/azure-local/manage/load-balancers
