---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/Manage SDN/Configure network security groups on your Azure Local with PowerShell"
sourceUrl: "https://learn.microsoft.com/en-us/azure/azure-local/manage/use-datacenter-firewall-powershell"
importDate: "2026-04-06"
type: operational-guide
---

# Configure Network Security Groups on Azure Local with PowerShell

## Overview
NSGs define and enforce traffic rules for VMs and services. PowerShell provides a scriptable, repeatable way to configure NSGs in Azure Local environments.

## Key Concepts
- NSG Rules: allow/deny based on source, destination, port, protocol.
- PowerShell Cmdlets: create, update, remove NSGs.
- Policy Scope: VM, subnet, or virtual network level.
- Auditing: Scripts can be version-controlled for compliance.

## Internal Guidance
- Standardise NSG deployment across readiness environments.
- Validate rules in test before production.
- Integrate NSG scripts into provisioning workflows.

## External Reference
https://learn.microsoft.com/en-us/azure/azure-local/manage/use-datacenter-firewall-powershell
