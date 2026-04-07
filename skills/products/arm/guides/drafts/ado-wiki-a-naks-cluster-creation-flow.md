---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Components/NAKS Cluster Creation Flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FComponents%2FNAKS%20Cluster%20Creation%20Flow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# NAKS Cluster Creation Flow

**Created by: Andrei Ivanuta** - _Last review: 12-March-2026_

## Description

This document explains how Nexus AKS cluster creation flows from the pre-undercloud ARM and RPaaS path into undercloud webhook validation, CAPI resource generation, KubeVirt VM provisioning, and feature creation.

For operational troubleshooting, see the companion [NAKS General Troubleshooting Guide](https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2495724/-How-To-NAKS-General-Troubleshooting-Guide).

## Key Concepts

### CAPI (Cluster API)
Open-source Kubernetes project for declarative cluster lifecycle management. Uses provider model:
- **Infrastructure provider** - manages compute (KubeVirt VMs)
- **Bootstrap provider** - generates cloud-init scripts (kubeadm)
- **Control plane provider** - manages control plane lifecycle

### KubeVirt
CNCF project extending Kubernetes to manage VMs alongside containers. Key CRDs:
- `VirtualMachine` (VM) - desired state
- `VirtualMachineInstance` (VMI) - running instance
- `DataVolume` - disk image import and storage

### nc-aks-operator
Main orchestration layer for NAKS cluster creation. Accepts customer cluster requests, validates, and generates CAPI + KubeVirt + feature CRs.

## Pre-Undercloud Request Flow

```
Customer (CLI / Portal)
  -> ARM (Azure Resource Manager)
  -> RPaaS (Resource Provider As A Service)
     NC-RP webhook validation (schema + business logic)
  -> Kubernetes Bridge (converts ARM REST to K8s CR via Liquid template)
  -> Undercloud API Server
  -> nc-aks-operator webhook (K8s-level validation)
  -> Kubernetes Cluster CR created -> nc-aks-operator reconciles
```

**Key points:**
- Custom Location drives routing from ARM to RPaaS to K8s Bridge
- Two layers of webhook validation: NC-RP level (ARM) + nc-aks-operator (undercloud)
- Azure resource can exist even if undercloud provisioning fails
- Status syncs back through RPaaS bridge resource-sync path

## Phase 1: Webhook Validation
Request arrives at undercloud api-server -> nc-aks-operator webhook validates -> Kubernetes Cluster CR created

## Phase 2: Control Plane Creation
nc-aks-operator creates 6 CRs: KubeadmControlPlane, Cluster, KubeVirt Cluster, KubeVirt Machine Template, Health Checks.

**Important:** Control plane nodes are provisioned **one at a time** (sequential). KCP controller waits for each node to be healthy before deploying next.

Flow: KCP -> KubeadmConfig + Machine -> Bootstrap Secret -> KubeVirt Machine -> VM + DataVolume -> CDI imports image -> virt-controller creates VMI -> virt-handler starts VM -> status propagates back up.

**KubeVirtMachine states:**
- `running` = QEMU is running, but VM may NOT have bootstrapped
- `ready` = VM bootstrapped AND joined the NAKS cluster

## Phase 3: Agent Pool Creation
Agent pool nodes are provisioned **in parallel** (unlike control plane). Each pool maps to its own MachineDeployment.

Flow: Agent Pool CR -> Machine Deployment -> Machine Set -> Machine CRs -> KubeVirt VMs -> CDI -> VMI -> bootstrap -> status propagates back.

## Phase 4: Feature Creation
After all agent pools ready, creates Feature CRs. Required features include: `azure-arc-k8sagents`, `calico`, `cloud-provider-kubevirt`, `ipam-cni-plugin`, `metallb`, `multus`, `node-local-dns`, `sriov-dp`.

**Note:** Cluster creation can fail after nodes are up but before features are installed.

## References
- [nc-aks source docs](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_git/nc-aks?path=/docs/naks-cluster-creation-flow.md)
