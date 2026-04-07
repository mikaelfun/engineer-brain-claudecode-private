# AKS Workload Protection with Defender for Containers

> Source: Mooncake POD/AKS/Defender for Container/AKS workload protection
> Status: draft (pending SYNTHESIZE review)

## Architecture Overview

AKS hosting infrastructure uses VMSS. ASC treats each resource separately:
- VMSS = IaaS hosting
- AKS = PaaS
- ASC monitors and recommends for each as separate resources
- Some VMSS recommendations are filtered out for AKS VMSS (appear under "Unavailable assessments")

## Three Protection Layers

### 1. Cluster Audit Log (Azure Defender for AKS — paid)
- Detect suspicious behavior from audit logs

### 2. Container Host Node (Azure Defender for AKS — paid)
- Raw security events from host nodes
- OMS agent auto-provisioning for VMSS has known issues
- May need manual "quick fix" click for provisioning

### 3. Gatekeeper Pod (Azure Policy — free)
- One Gatekeeper pod per cluster
- Each request to AKS API Server is monitored before being persisted
- Deny option to mandate recommendations → workloads secure by default
- Based on [OPA Gatekeeper](https://github.com/open-policy-agent/gatekeeper)

## Enable Azure Policy Add-on

```bash
az aks enable-addons --addons azure-policy --name MyAKSCluster --resource-group MyResourceGroup
```

## References

- [Workload protections for Kubernetes workloads](https://docs.microsoft.com/en-us/azure/security-center/kubernetes-workload-protections)
- [Azure Policy for Kubernetes](https://docs.microsoft.com/en-gb/azure/governance/policy/concepts/policy-for-kubernetes)
- ADO Wiki: [Recommendations for Databricks, AKS and VMSS](https://dev.azure.com/SupportabilityWork/Azure%20Security/_wiki/wikis/Azure%20Security%20Center%20CSS%20wiki/2122/)
