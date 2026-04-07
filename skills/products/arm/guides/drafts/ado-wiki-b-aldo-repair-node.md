---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/Node Management/Repair Node"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FInfrastructure%2FNode%20Management%2FRepair%20Node"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Repair Node

## Overview
The Repair Node process in Azure Local environments is used to restore a cluster node that has become unhealthy or misconfigured. This operation helps re-establish the node's functionality and reintegrate it into the SDN infrastructure without requiring a full rebuild.

## Relevance to Readiness
Understanding how to repair a node is essential for:
- **Operational continuity**: Restores service availability and cluster health with minimal disruption.
- **Disconnected operations**: Enables local recovery of nodes in isolated environments.
- **Infrastructure replication**: Ensures consistent recovery workflows across environments.
- **Incident response**: Supports rapid remediation of node-level issues during readiness or production.

## Key Concepts
- **Node Health**: Nodes may require repair due to configuration drift, certificate issues, or service failures.
- **Repair Scope**: May include reapplying configurations, rejoining the cluster, or restoring certificates.
- **Automation Support**: Repair actions can be triggered via PowerShell or Windows Admin Center.
- **Validation**: Post-repair checks ensure the node is healthy and synchronised with the cluster.

## Internal Guidance
- Identify the root cause of the node issue before initiating repair.
- Use automation scripts to standardise the repair process and reduce manual error.
- Validate time sync, domain membership, and certificate trust during repair.
- Monitor cluster health and workload redistribution after repair.
- Document repair actions and update incident logs for audit and learning.

## External Reference
For detailed technical guidance, refer to the official Microsoft documentation:
https://learn.microsoft.com/en-us/azure/azure-local/manage/repair-server
