---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/Manage SDN/Manage tenant logical networks"
sourceUrl: "https://learn.microsoft.com/en-us/azure/azure-local/manage/tenant-logical-networks"
importDate: "2026-04-06"
type: operational-guide
---

# Manage Tenant Logical Networks

## Overview
Tenant logical networks provide isolation and control for tenant workloads in SDN.

## Key Concepts
- Logical Networks: IP subnets and VLANs.
- Virtual Networks (VNETs): tenant-specific overlays.
- Isolation & Segmentation: VXLAN/NVGRE encapsulation.
- Network Controller: central provisioning.

## Internal Guidance
- Define logical networks during SDN setup.
- Use consistent naming/tagging. Validate connectivity with test VMs.
- Document IP pools, VLANs, routing policies.

## External Reference
https://learn.microsoft.com/en-us/azure/azure-local/manage/tenant-logical-networks
