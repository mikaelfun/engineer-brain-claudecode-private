# AKS ACR 认证与 RBAC — connected-registry — 排查工作流

**来源草稿**: ado-wiki-acr-connected-registry-troubleshooting.md, ado-wiki-azure-arc-enabled-kubernetes.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Connected Registry Troubleshooting Guide for CSS
> 来源: ado-wiki-acr-connected-registry-troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

#### Connected Registry Troubleshooting Guide for CSS

#### Overview

A connected registry is an on-premises or remote replica that synchronizes container images and other OCI artifacts with your cloud-based Azure container registry. Use a connected registry to help speed up access to registry artifacts on-premises and to build advanced scenarios.

**Note**: The feature is now in GA.

#### Escalation Path

If an issue cannot be solved with the available troubleshooting, please escalate to ACR with an [ICM](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=A312j1).

#### Prerequisites

- Azure CLI version 2.16.0 or higher
- Azure CLI extensions: connectedk8s (version 1.2.0+) and k8s-extension (version 1.0.0+)
- Existing Azure Arc-enabled Kubernetes-connected cluster
- Agent version 1.5.3 or higher

#### Log Sources

##### Connected Registry Logs

1. Run `kubectl get pod -n connected-registry`
2. Locate the pod named `connected-registry`
3. Run `kubectl logs -n connected-registry [connected registry pod name]`

**Note**: Log level can be edited: `az acr connected-registry update --name [name] --registry [ACR name] --log-level [level]`

##### Connected Registry Trust Distribution Daemonset Logs

Look for a pod titled `connected-registry-containerd-config`. These logs are useful if the Connected Registry pod is not initializing.

Run `kubectl describe -n connected-registry pod/[pod name]` for a high-level health overview.

#### Common Issues

##### Extension creation stuck in state of "Running"

**Possibility 1: PVC Issue**
- Check PVC status: `kubectl get pvc -n connected-registry -o yaml connected-registry-pvc`
- Phase should be "bound". If stuck on "pending", delete and recreate extension
- Check storage classes: `kubectl get storageclass --all-namespaces`
- Fix: recreate with `--config pvc.storageClassName="standard"` or `--config pvc.storageRequest="250Gi"`

**Possibility 2: Bad Connection String**
- Check pod logs for UNAUTHORIZED error
- Regenerate protected-settings-extension.json with new connection string
- Update extension: `az k8s-extension update --config-protected-file protected-settings-extension.json`

##### Extension created, but Connected Registry is not "Online"

**Possibility: Previous connected registry not deactivated**
- Check pod logs for ALREADY_ACTIVATED error
- Fix: `az acr connected-registry deactivate -n [name] -r [ACR name]`
- Pod should be recreated within minutes

---

## Scenario 2: Azure ARC enabled Kubernetes
> 来源: ado-wiki-azure-arc-enabled-kubernetes.md | 适用: 适用范围未明确

### 排查步骤

#### Azure ARC enabled Kubernetes

#### Summary

This document addresses general guidance on handling Azure ARC enable Kubernetes cases, scope of troubleshooting and engaging internal teams (Azure Arc / Other teams) based on the nature of the issue.
First step is to determine ARC enable kubernetes cluster is in Azure or On-Prem, based on those details we can assist the customers accordingly. Understand what distribution of Kubernetes customers use, For Example: EKS, GKE, Azure local, On-Prem or AKS.

#### Arc enabled kubernetes cluster in Azure

If ARC is enabled on AKS cluster, we can start helping the customer by validating AKS cluster connected to Azure ARC. If AKS cluster is connected to azure arc and if customer getting issues for the operations running in azure arc, we can engage ARC team.

1. Resource Id of connected cluster:
    `/Subscriptions/SubscriptionID/ResourceGroups/RGName/providers/Microsoft.Kubernetes/connectedClusters/clustername`
2. Verify AKS cluster connected to Azure ARC successfully:

```bash
az connectedk8s show --name <cluster-name> --resource-group <rg>
az connectedk8s list --resource-group <rg> --output table
```

3. From Azure portal verify k8s distribution, Infrastructure and connection status to azure arc.

4. Verify the namespaces of azure arc, pods and deployments.

If any pods in pending, there might not be sufficient resources on the cluster. If any pod is with Error or CrashLoopBackOff, describe the pod and fetch logs:

```bash
kubectl describe pod <pod-name> -n <namespace-name>
kubectl logs -n azure-arc <pod-name> -c <container-name>
```

Note: For ARO Clusters, use OC commands. Reference: [Connect to ARO Cluster](https://dev.azure.com/otaljund/_git/otaljund-aro-scripts?path=/scripts/connect-aro-as-arc)

5. Troubleshoot connectivity issues by generating logs:

```bash
az connectedk8s troubleshoot -g <rg> -n <cluster-name>
```

6. Public TSG: [Diagnose connection issues](https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/diagnose-connection-issues)

#### Arc enabled kubernetes cluster on Prem or Azure local

If ARC enabled kubernetes cluster is on prem, our support is limited. For Sev-A calls, ask the customer to share connectivity info while engaging appropriate team.

#### Tooling / Detectors

For connected cluster information and errors, check ASC under **Microsoft.Kubernetes/connectedClusters**.

- Check Extension tab to validate if any extensions fail.
- Output of `az -v` to validate CLI extensions installed and versions.
- If AKS Arc on Azure Local, validate all tests pass in Support.AksARC tool: [Support Tool](https://learn.microsoft.com/en-us/azure/aks/aksarc/support-module)

#### SAP for engaging ARC cases

- AKS on Azure Local -> Azure/Azure Kubernetes Service on Azure Local
- AKS Edge Essentials -> Azure/AKS Edge Essentials
- AKS on Windows Server -> Azure/Azure Arc enabled Kubernetes
- AKS cluster in Azure cloud -> Azure/Kubernetes Service (AKS)
- On-premises (unsure of host OS) -> Azure/Azure Arc enabled Kubernetes
- RedHat OpenShift in Azure Cloud -> Azure/Azure RedHat OpenShift
- RedHat OpenShift On-Prem -> Azure/Azure Arc enabled Kubernetes

**Note:** The ARC team does have 24x7 support.

#### References

- [Gears Presentation: Introduction to Azure Arc-Enabled Kubernetes](https://platform.qa.com/resource/hyb-12p-introduction-to-azure-arc-enabled-kubernetes-1854/?context_id=9265&context_resource=lp)
- [Azure Arc-enabled Kubernetes - Overview (Internal Wiki)](https://supportability.visualstudio.com/WindowsSHA/_wiki/wikis/WindowsSHA/386879/Azure-Arc-enabled-Kubernetes)
- [Azure Arc | Microsoft Azure](https://azure.microsoft.com/en-us/products/azure-arc/)
- [Overview of Azure Arc-enabled Kubernetes](https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/overview)
- [AKS enabled by Azure Arc documentation](https://learn.microsoft.com/en-us/azure/aks/aksarc/)

---
