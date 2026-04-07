---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Static Egress Gateway IP"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Static%20Egress%20Gateway%20IP"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Static Egress Gateway IP

[[_TOC_]]

## Overview

Static Egress Gateway provides an efficient way for pods in an AKS cluster to have configurable egress IPs different from the default cluster outbound.

To enable Static Egress Gateway, cx need to first create or update an AKS cluster with `--enable-static-egress-gateway` flag to install the addon components. Then cx need to create one or more Gateway nodepools for traffic routing. They need to specify `--mode Gateway` (this is the 3rd mode, other than `System` and `User`) and `--gateway-prefix-size` (default to 31) in their nodepool creation command.

Static Egress Gateway addon components are implemented in upstream project [Azure/kube-egress-gateway](https://github.com/Azure/kube-egress-gateway) while rp is responsible for Gateway agentpool provisioning and addon integration.

Resources:

- [PRD](https://microsoft.sharepoint.com/:w:/r/teams/azurecontainercompute/_layouts/15/Doc.aspx?sourcedoc=%7BD25D940B-8296-49E7-8AA2-E2C66C6F6EB4%7D&file=Static%20Egress%20Gateway%20PRD.docx&action=default&mobileredirect=true)
- [Design Doc](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/625071/Static-Egress-Gateway-Design-Doc)
- [Component Wiki](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/598115/Area-Static-Egress-Gateway)

---

## Feature Enabled or Not

To check whether a cluster has static egress gateway feature enabled or nor, check whether `networkProfile.staticEgressGatewayProfile.enabled` is set in the ManagedCluster properties:

```json
  "networkProfile": {
    ...
    "ipFamilies": [
      "IPv4"
    ],
    ...
    "staticEgressGatewayProfile": {
      "enabled": true  # this should be set to true
    }
  },`
```

To check whether an agentpool is in Gateway mode, and check its gateway prefix size, check its `mode` is set to `Gateway` and `gatewayProfile.publicIpPrefixSize` in the agentpool properties:

```json
  ...
  "name": "gwnp", # name of the ap
  "mode": "Gateway", # mode should be set as Gateway
  "gatewayProfile": {
    "publicIpPrefixSize": 31 # this is the gateway public IP prefix size
  }
  ...
```

From ASI:

![ASI-static-egress.png](/.attachments/ASI-static-egress-0b259efc-8f29-4b6c-b799-7fc4f213955a.png)

---

## Gateway Agentpool Provisioning

Gateway-mode agentpool (we will use Gateway agentpool for short) provisioning is pretty much same as the system/user mode agentpool. The minor differences include:

1. Gateway ap nodes have k8slabel `kubernetes.azure.com/mode` set to `Gateway`.
2. Gateway ap vmss has vmss tag `aks-managed-gatewayIPPrefixSize` set to the number specified in `--gateway-prefix-size` argument, expected to be within `[28, 31]`.
3. Gateway ap nodes have taint `{
"effect": "NoSchedule",
"key": "kubernetes.azure.com/mode",
"value": "gateway"
}` to prevent workload from being scheduled on them.
4. Gateway ap instance upgrader follows the max-unavailable logic: always take down 5% of nodes for upgrade, see [vmssgatewayinstancesupgrader.go](https://msazure.visualstudio.com/CloudNativeCompute/_git/aks-rp?path=%2Fresourceprovider%2Fserver%2Fmicrosoft.com%2Fasyncoperationsprocessor%2Foperations%2Fmanagedcluster%2Fclusterupgrader%2Fvmssgatewayinstancesupgrader.go&version=GBmaster&_a=contents)

In case there's issue provisioning a Gateway agentpool, refer to rp `AsyncContextActivity` log for details.

---

## Addon Components

Static Egress Gateway is composed of 3 main components:

- `kube-egress-gateway-controller-manager` deployment running in CCP namespace, responsible to provision VMSS secondary IPConfigs and gateway loadBalancer.
- `kube-egress-gateway-daemon-manager` daemonSet running on overlay **Gateway ap nodes** only, responsible to setup traffic routing schemes on each gateway node.
- `kube-egress-gateway-cni-manager` daemonSet running on overlay **System/User ap nodes** only, responsible to install cni plugin binary, configuration file, and communicate as proxy between `kube-egress-gateway-cni` and apiserver.
  `kube-egress-gateway-cni` is a chained CNI plugin that is invoked after the main CNI plugin (e.g. AzureCNI). It's responsible to provision the wireguard interface and peer, routes and iptables rules in the pod network namespace.

`kube-egress-gateway-controller-manager` pods run in CCP namespace, you can check the log from kusto:

```sql
https://dataexplorer.azure.com/clusters/akshuba.centralus/databases/AKSccplogs?query=H4sIAAAAAAAAAwsuSSzJTHZNL0otLnbOzyspys%2FJSS3iqlEoz0gtSlUIKEpNzixODcnMTQ0uScwtULBTSEzP1zBK0QQADdHhfjkAAAA%3D

StaticEgressController
| where PreciseTimeStamp > ago(2d)
```

`kube-egress-gateway-daemon-manager` and `kube-egress-gateway-cni-manager` pods run in `aks-static-egress-gateway` namespace in overlay. We do not collect their logs to kusto at the moment.

Static Egress Gateway controllers reconcile based on a bunch of CRs:

- `staticgatewayconfigurations.egressgateway.kubernetes.azure.com`:
  This is the only CRD cx should be aware of. Cx create staticgatewayconfigurations manually to provision an egress gateway. staticgatewayconfiguration objects are namespaced and should be placed in the same namespace where the pods that use the egress gateway are.
- `gatewaylbconfigurations.egressgateway.kubernetes.azure.com`:
  Internal CRD. Used to reconcile LB resources. Created with the same namespace/name as the staticgatewayconfiguration objects.
- `gatewayvmconfigurations.egressgateway.kubernetes.azure.com`:
  Internal CRD. Used to reconcile VM secondary IPConfigs. Created with the same namespace/name as the staticgatewayconfiguration objects.
- `gatewaystatuses.egressgateway.kubernetes.azure.com`:
  For troubleshooting purposes, each gateway node is associated with a gatewaystatus object to list the ready staticgatewayconfigurations and peers provisioned on the node.
- `podendpoints.egressgateway.kubernetes.azure.com`:
  For each pod annotated to use a staticgatewayconfiguration, a podendpoint object with the same namespace/name as the pod is created. Gateway daemon monitors this object and sets up wireguard peer on the Gateway nodes.

You can check `kube-audit` log for the CRUD of these CR objects.

---

## Network Connectivity

There are multiple factors that affect network connectivity. If all pods in CCP and overlay are running properly, then need to follow this [upstream troubleshooting guide](https://github.com/Azure/kube-egress-gateway/blob/main/docs/troubleshooting.md) to investigate further.

---

## Private IP Support

Private IP support refers to having static _private_ IPs for each gateway configuration. The setup is mostly the same with the only difference from the user's perspective being the use of VirtualMachine node pool type on the Gateway pool.

When a static gateway configuration is created, the field for `provisionPublicIPs` can be set to false. This will create a set of private IPs from the gateway's subnet based on the prefix size (the same way the number of public IPs get created based on the prefix size). The IPs can be read from the status of the CRD. Those will be static for the lifetime of the StaticGatewayConfiguration.

Under the hood there are a few notable differences:

### AKS-RP NICAllocator

The reason VirtualMachines are required is because we need to keep the private IPs around as a node pool scales up/down which can't be done in VMSS. With VirtualMachines, the NICs are created and managed separately from the VMs. When a gateway pool with type=VMs is created, then the number of VMs is based on `count` but the number of NICs is based on the gateway prefix size. For example, if a VM gateway pool is created with prefixSize=30 and count=2 then 2 VMs will be created but 4 NIC resources are created. This allows static allocation of private IPs, independent of the number of current nodes.

This also means that the NIC suffix id is not guaranteed to match the suffix id of the VM it is attached to. There is a [nicAllocator](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=/resourceprovider/sharedlib/vms/operator/nic.go&version=GBmaster&line=50&lineEnd=51&lineStartColumn=1&lineEndColumn=1&lineStyle=plain&_a=contents) in RP that gets called from the VM reconciler to assign available NICs to new VMs or release NICs when VMs scale down.

There would need to be changes made if we allowed auto-scaling a gateway node pool, but for now the only supported way to scale a gateway node pool is via RP.

### Gateway Controller handles public IPs

The upstream gateway controller handles creating/deleting public IPs out of a public IP prefix. This is in contrast to VMSS where the public IP prefix can be added to the VMSS profile and then CRP will handle the allocation of public IPs to each instance.

The gateway controller is where most of the changes went when we added private IP support - that code is here: <https://github.com/Azure/kube-egress-gateway/blob/382fb91a4902ccb2863ed691cb45620c1ad419b9/controllers/manager/agentpoolvms.go#L50>

---

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>
- Jordan Harder <joharder@microsoft.com>