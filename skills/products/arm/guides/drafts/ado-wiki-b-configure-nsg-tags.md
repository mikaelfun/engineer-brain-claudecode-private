---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/Manage SDN/Configure network security groups with tags"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Infrastructure/SDN%20Overview/Manage%20SDN/Configure%20network%20security%20groups%20with%20tags"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Configure Network Security Groups with Tags

## Overview
Tags in Network Security Groups (NSGs) allow administrators to simplify and scale network security rule management by using predefined or custom identifiers instead of static IP addresses.

## Key Concepts
- **System Tags**: Built-in tags like VirtualNetwork, Internet, and LoadBalancer that simplify rule targeting.
- **Custom Tags**: User-defined tags that group IPs or resources for granular control.
- **Tag Structure**: Tags can be applied to source or destination fields in NSG rules to abstract underlying IPs.
- **Extensibility**: Tags can also be used in User Defined Routes (UDRs) for advanced routing scenarios.

## Internal Guidance
- Use system tags for common scenarios to reduce complexity.
- Define custom tags for workload-specific segmentation or tenant isolation.
- Document tag definitions and associated IPs for audit and troubleshooting.
- Validate tag-based rules in test environments before production rollout.

## External Reference
https://learn.microsoft.com/en-us/azure/azure-local/manage/configure-network-security-groups-with-tags
