---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/Manage SDN/Manage gateway connections"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Infrastructure/SDN%20Overview/Manage%20SDN/Manage%20gateway%20connections"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Manage Gateway Connections

## Overview
Gateway connections in SDN environments enable communication between virtual networks and external networks, including the internet and on-premises infrastructure. Essential for hybrid connectivity and secure routing.

## Key Concepts
- **Gateway VMs**: Provide routing, NAT, and VPN capabilities.
- **BGP Support**: Enables dynamic route exchange with external networks.
- **High Availability**: Gateways can be deployed in active-active mode for redundancy.
- **Policy Enforcement**: Integrated with SDN policies for traffic control and segmentation.

## Internal Guidance
- Deploy gateway VMs in pairs for high availability.
- Use BGP where dynamic routing is required; otherwise, configure static routes.
- Monitor gateway health and throughput using SDN diagnostics.
- Document IP configurations, route tables, and NAT rules for each deployment.

## External Reference
https://learn.microsoft.com/en-us/azure/azure-local/manage/gateway-connections
