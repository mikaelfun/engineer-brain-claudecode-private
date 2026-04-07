---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Tools and Processes/Geneva Actions Repo"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Tools%20and%20Processes/Geneva%20Actions%20Repo"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Geneva Actions Reference Guide

## Overview

Geneva Actions are predefined extensions for managing and troubleshooting production resources. Not all actions are available to CSS.

Output formats:
- **JSON output** - Actions querying Azure Resource Database
- **YAML / Kubernetes-style output** - Actions against cluster internal database

## Prerequisites

| Prerequisite | PPE environments | Staging / Production |
|---|---|---|
| SAW Required? | No | Yes |
| JIT Required? | No | Specific to action |
| Group Memberships | TM-nc-redmond or AP-afoi-de-redmond | TM-nc-pme or AP-afoi-de-pme |

## Claims and JIT Roles

| Claim | JIT Required? | Notes |
|---|---|---|
| NC-PlatformServiceViewer | No | Standard access, read-only |
| NC-PlatformServiceOperator | Yes | CSS-approvable JIT |
| NC-PlatformServiceAdministrator | Yes | |
| NC-CustomerServiceViewer | Yes | |
| NC-CustomerServiceOperator | Yes | |
| NC-CustomerServiceAdministrator | Yes | Lockbox-scoped, requires customer approval |

## Accessing Geneva Actions

1. From SAW, navigate to [Geneva Portal](https://aka.ms/genevaaction)
2. Click Actions > select Public environment
3. Filter by extension (e.g., Network Cloud - Prod, AFO Network Fabric Automation)
4. Check Claims Required under More Options before running

## Network Cloud - Prod (NC) Actions

- **RetrieveInternalNaksInfo** - Read-only (JIT required) - Internal CR-level info for NAKS cluster
- **RetrieveNaksCapiResources** - Read-only (JIT required) - CAPI resources, Summary or Details mode
- **NexusAKSKubernetesClusterSOS** - Read-only (JIT required) - Debugging data (pods, services, nodes, events)
- **RetrieveKubernetesResource** - Read-only (JIT required) - K8s resources by kind
- **RetrieveKubernetesCr** - Read-only (JIT required) - CRs by kind (incl. NAKS features CR)
- **ClusterCapacity** - Read-only (JIT required) - CPU, hugepages, memory, NUMA zones
- **GetBareMetalMachineStatus** - Read-only (no JIT) - BMM info via ARM API

## AFO Network Fabric Automation (NNF) Actions

- **Device RO Command Operation** - Read-only (no JIT) - CLI commands against NNF devices via Admin Service
