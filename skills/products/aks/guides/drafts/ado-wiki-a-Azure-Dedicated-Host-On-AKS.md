---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Azure Dedicated Host On AKS"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Azure%20Dedicated%20Host%20On%20AKS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Dedicated Host on AKS

## Description

Azure Dedicated Host is a service that provides physical servers - able to host one or more virtual machines - dedicated to one Azure subscription. It will now be supported in AKS as an option at cluster create and once created with that feature option have the ability to add in additional node pools from those hosts.

### Support Boundary

* Any AKS reason a cluster could not be deployed?
* Any AKS related reason a node pool could not be added to a cluster?

### Basic Flow

- Cluster Deployed Successfully?
  - Yes -> Node pool/vmss instance unable to be added?
    - Yes -> Standard troubleshooting does not expose the issue? -> Escalate
    - No -> Escalate
  - No -> Errors in ARMProd or elsewhere that might indicate the reason that can be solved?
    - No -> Escalate

### Escalation Paths

#### The following scenarios may require an ICM to be filed against _AzureRT/ CRP Core Service_

[AzureRT/ CRP Core Service Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=z2j2W1)

* Unable to deploy a cluster using a Dedicated Host
* Unable to add a node pool or instance using a Dedicated Host

### Verified Learning Resources

| Resource | Description |
|------|------|
| [TSG](https://eng.ms/docs/cloud-ai-platform/azure/azure-core-compute/control-plane-bburns/azure-kubernetes-service/azure-kubernetes-service/doc/tsg/aks-dedicatedhostgroup) | Troubleshooting TSG |
