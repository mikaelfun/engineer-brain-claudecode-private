---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Networking/Ungrouped/Network Isolated Cluster"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Networking/Ungrouped/Network%20Isolated%20Cluster"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Network Isolated Cluster

[[_TOC_]]

## Overview

**Status:** Public Preview
**Public documentation**: <https://aka.ms/aks/network-isolated-cluster>

## Training Video

[Network Isolated Cluster Deep Dive.mp4](https://microsoft.sharepoint.com/:v:/t/AzureCSSContainerServicesTeam/EXSRJsmzFkBJnEvhZEjd-NYBuS-PJQByJuhhn-L8QbWk2w?e=zfGi5p&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D)

## Limitation

- k8s version >= 1.30
- does not support kubenet
- only supports ubuntu
- does not support older VHD version and custom image
- does not support public cluster v1
- does not support VMAS

##  Support Scope

1. fail to pull images from managed ACR
2. Cluster unable to upgrade/scale due to network egress issue

###  Unsupported s2 scenario

1. BYO ACR incorrect configuration. Can verify by connecting to the ACR from a VM. If it fails, it should be customer error.
1. We do not support anonymous access to ACR for now.
1. We allowed byo vnet + byo acr + any addons, however, it will be customer's own responsibility to setup the network to ensure connection to the required endpoints, such as AAD, arm endpoint.

###  Addon compabilities

- For managed vnet, we already block all addons. If miss any addon and recieve the incident, please transfer to Security team.
- For BYO vnet, we do not block any addons. But it will be customer's own responsibility to handle to network to connect to the endpoint that the addon requires. Though it might already outside the support range, considering sometimes customer may still requiring assistance, we take some examples on how customer can solve their addon issues.

## Gathering Info

- CSE cluster-provision.log

### Network isolated cluster type

We have type "none" and "block".

- `none` means we by default do not provide customer egress network. However, customer can still define their own network like BYO vnet / subnet.
- If it is `block`, we do not allow BYO VNET, and use NSG to block egress.

### ASI

#### Verify cluster enabled network isolated cluster

![asi-ni-enable.png](/.attachments/asi-ni-enable-48e6c322-35fa-47e5-ade3-58440a2e7b19.png)

#### Verify if the cluster is BYO ACR or Managed ACR

![asi-ni-details.png](/.attachments/asi-ni-details-f06647a5-d16f-48a3-9a68-7cd9e4ee6215.png)

### ASC

Access the VMSS disk inspect to download the node log

### Geneva action

Download node and cse log via geneva action

### Kusto query

#### general QOS

```k
let queryFrom = datetime("2024-09-19T04:43:45.734Z");
let queryTo = datetime("2024-09-20T04:43:45.734Z");
let queryFeatureName = "Bootstrap Artifact Source Cache";
let query = "\"enableBootstrapArtifactSourceCache\":\"true\"";

let interval=(queryTo - queryFrom)/100;
aks_prod_qos_op_all(queryFrom, queryTo, "")
| where propertiesBag has query
| summarize totalRequests = count(), totalErr = countif(isServiceFailure(resultType, resultCode, resultSubCode)) by bin(TIMESTAMP, interval)
| project TIMESTAMP, qos = (1. - percent(totalErr, totalRequests)) * 100
```

####  Get CSE log

- Customer option:  

1. ssh into vmss via bastion  
2. cat /logs/azure/cluster-provisioning.log

- PG option

1. Check operation failure via Async log, it will report the last few lines of errors
2. if the log does not show useful log, use geneva action to download the node log

- Support Engineer

1. Use Azure Support Center(ASC) to download node log

#### operation failure

```k
union AsyncQoSEvents, AsyncContextlessActivity, AsyncContextActivity
| where operationID == "cc03f208-932c-4ed5-99dd-cf5aade23f22"
```

Pay attention to cse error and bootstrapprofile related error.

## Common Errors

### Frontend errors

| Error | Rca | Solution |
| --- | --- | --- |
| Network isolated cluster is not allowed since feature flag %q is not registered. | feature flag is required during preview | register feature flag |
| BootstrapProfile with artifact source %q is not valid. Allowed values are 'Direct', 'Cache' | invalid request | make sure the request body bootstrapProfile.artifactSource is 'Direct' or 'Cache' |
| BootstrapProfile artifact source cannot be changed from 'Cache' to 'Direct' | we do not support change from Cache to Direct | |
| BootstrapProfile container registry id must be empty when artifact source is 'Direct' | bad request | customer shoud not define the containerRegistryId and artifact source=Direct at the same time |
| BootstrapProfile container registry id is not allowed to modify if it is managed registry | bad request | customer is using managed acr, we do not allow change the managed acr id |
| BootstrapProfile managed container registry is only allowed when VNET is managed | bad request | |
| BootstrapProfile Bring Your Own(BYO) container registry is only allowed when VNET is custom | bad Request | |
| BootstrapProfile Bring Your Own(BYO) container registry %q does not exist | customer pass one acr id that not exists | it only happens for BYO scenario |
| BootstrapProfile Bring Your Own(BYO) container registry %q does not enable anonymous pull access | byo acr does not enable anonymous access | let customer change the acr configuration |

### CSE Failed

The CSE Error code should between 206 to 210. Please check the cluster provision log or async log. If it mentions `oras pull xxx` failed. Create an ICM.
Quickest mitigation is to let customer disable network isolated cluster.

If the error is about 'connect xxx failed', please create an ICM for this. Quick mitigation is still disable network isolated cluster or customer setup their own firewall to pass the fqdn.

| Error | Rca | solution |
| --- | --- | --- |
| CSE failure with error 207 | kubernetes-node binary download error | check if related kubernetes-node version exists in mcr, if not exists, contact Security team for immediate fix |
| CSE failure with error 208 | kubelet credential provider download error | same as 206, but for credential provider |
| CSE failure with error 209 | WASM shims download error | same as 206, but this package plan to deprecate |
| CSE failure with error 210 | reserved error not in use for now | |
| CSE failure with error 211 | network timeout to acr | incorrect private endpoint configuration to access acr. Can double confirm via directly ping acr through vm |
| CSE failure with error 212 | kubelet ideneity has no permission to access acr | make sure kubelet identity has acr pull permission to the boostrap acr |

### Cluster Image pull failed

We by design leverage [ACR cache rule](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-artifact-cache?pivots=development-environment-azure-portal) as the solution for image pull. And we provide two modes, BYO ACR and managed ACR.

1. check the cluster if it is BYO ACR or managed ACR via ASI.
1. If it is BYO ACR, we need customers themselves to check their ACR, cache rule and private endpoint. Can also try to connect the ACR from node.
1. If it is Managed ACR, we by default only support MCR images. If the image pull failure is about other registry, then it is customer error. Customer need go to the ACR to create their own cache rule.
1. If it is Managed ACR and fail to pull MCR images, please let customer to check if the ACR and PE named with keyword `bootstrap` exists. If not, please reconcile the cluster.
1. There exists one known issue, for managed ACR, if customer delete the cache rule, cluster reconcile will not bring it back. Mitigation is to remove the ACR and then reconcile or ask customer to add the cache rule.
1. If the issue is still not resolved, create an ICM.

### Cluster image cannot pull after update existed cluster to network isolated cluster or change the private ACR resource id

1. This is by design, customer needs to reimage the node to update the kubelet configuration in cse.

### Node Not Ready with error related to CNI plugin

1. Azure CNI plugin is not installed via CSE. It is installed via daemonset azure-cns.
1. Check if the pod azure-cns under kube-system is running. The pod may have image pull failure due to incorrect ACR configuration. If so, please check the image pull failed guide.
1. If the azure-cns is crashing, collect log and create an ICM.
1. If azure-cns is running, however, node is still not ready. The node ready reason might not be related to network isolated feature. Please check the node not ready reason first.

### ACR, cache rule, private endpoint and private DNS zone is deleted by accident

If the cache rule is deleted from the managed ACR by accident, the mitigation is to delete the ACR and reconcile the cluster.
If ACR or private endpoint or private DNS zone is deleted by accident, the mitigation is just to reconcile the cluster.

### AAD endpoint related, e.g. Azure Workload Identity

- Option 1, if customer has their own firewall, whitelist the aad endpoint in their firewall.
- Option 2, [Use service tag](https://learn.microsoft.com/en-us/azure/virtual-network/service-tags-overview#available-service-tags) and [service endpoint](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-service-endpoints-overview) for AAD. In the nsg in customer's vnet, add AzureActiveDirectory in the outbound rule. In vnet service endpoint add `Azure Active Directory`

### Need connection to customer managed resources like azure key vault, container insight

- Option 1 (recommend), setup one private endpoint in the vnet to connect to the resource. e.g. [monitoring addon](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/kubernetes-monitoring-private-link)
- Option 2, if the related resource support service endpoint, add service endpoint in the vnet.

## Partner Info

| Team | Description |
| - | - |
| Azure Container Registry | This feature uses Azure Container Registry as pull through cache |

## Owner and Contributors

**Owner:** Kavyasri Sadineni <ksadineni@microsoft.com>

**Contributors:**

- Kavyasri Sadineni <ksadineni@microsoft.com>
- Jordan Harder <Jordan.Harder@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
- Vijay Rodrigues (VIJAYROD) <vijayrod@microsoft.com>
- Jeff Martin <jemartin@microsoft.com>
