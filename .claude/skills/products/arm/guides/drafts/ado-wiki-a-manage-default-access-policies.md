---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/Manage SDN/Manage default access policies"
sourceUrl: "https://learn.microsoft.com/en-us/azure/azure-local/manage/manage-default-network-access-policies-virtual-machines-23h2"
importDate: "2026-04-06"
type: operational-guide
---

# Manage Default Access Policies

## Overview
Default network access policies define baseline connectivity rules for VMs in SDN.

## Key Concepts
- Default Deny: deny-all policy to minimise exposure.
- Policy Inheritance: defaults overridden by tenant-specific rules.
- Granular Control: scoped to VM groups, subnets, or tags.
- Automation: applied programmatically during provisioning.

## Internal Guidance
- Align defaults with security standards.
- Document exceptions. Use tagging to simplify policy targeting.

## External Reference
https://learn.microsoft.com/en-us/azure/azure-local/manage/manage-default-network-access-policies-virtual-machines-23h2
