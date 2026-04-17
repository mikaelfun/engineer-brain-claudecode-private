# AKS Workload Protection with Defender for Containers

> Source: OneNote - Mooncake POD Support Notebook / AKS / Troubleshooting / Defender for Container / AKS workload protection
> Status: guide-draft (pending SYNTHESIZE review)

## Overview

AKS workload protection has 3 pillars:

### 1. Cluster Audit Log (Azure Defender for AKS - paid)
- Detects suspicious behavior from cluster audit logs

### 2. Container Host Node (Azure Defender for AKS - paid)
- Raw security event monitoring
- Auto-provisioning of OMS agent for VMSS still doesn't work - must manually click 'quick fix'
- Short-term fix: VMSS OMS agent auto-provisioning solution (Iron FY21)
- Long-term: Kubernetes native agent (2021Q2)

### 3. Gatekeeper Pod (Azure Policy - free)
- One Gatekeeper pod per cluster
- Monitors every request to AKS API Server before being persisted to cluster
- Deny option to mandate recommendations, ensuring workloads are secure by default

## Enable Azure Policy Add-on

```bash
az aks enable-addons --addons azure-policy --name MyAKSCluster --resource-group MyResourceGroup
```

## Key Notes for Mooncake

- AKS Defender Profile is NOT available in Mooncake (feature gap)
- ASC treats VMSS (IaaS) and AKS (PaaS) as separate resources
- Some VMSS recommendations are filtered out for AKS VMSS (appear under "Unavailable assessments")

## References

- [Workload protections for Kubernetes workloads](https://docs.microsoft.com/en-us/azure/security-center/kubernetes-workload-protections)
- [Azure Policy for Kubernetes](https://docs.microsoft.com/en-gb/azure/governance/policy/concepts/policy-for-kubernetes)
- [Gatekeeper GitHub](https://github.com/open-policy-agent/gatekeeper)
