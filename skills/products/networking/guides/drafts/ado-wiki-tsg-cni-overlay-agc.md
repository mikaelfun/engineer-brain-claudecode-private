---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Troubleshooting Guides/TSG: Troubleshooting CNI overlay in Application Gateway for Containers"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG:%20Troubleshooting%20CNI%20overlay%20in%20Application%20Gateway%20for%20Containers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting CNI overlay in Application Gateway for Containers

## Overview

When provisioning Application Gateway for Containers into a cluster that has CNI Overlay or CNI enabled, Application Gateway for Containers will automatically detect the intended network configuration. There are no changes needed in Gateway or Ingress API configuration to specify CNI Overlay or CNI.

This troubleshooting guide outlines the steps to be taken in case the setup does not work as expected.

## Troubleshooting CNI Overlay issues
### Confirm CNI overlay is enabled from AKS

To confirm the AKS cluster is currently using CNI overlay, you can query the cluster Network Profile. `Network Plugin Mode` should be set to `overlay`.

### Confirm ALB version

The minimum ALB controller version required for CNI overlay support is `alb-controller-1.4.12`. You can use `helm list` to check the ALB controller version:

```bash
helm list
```

### Confirm NmAgent version for AKS cluster nodes

The following are the Minimum NmAgent Version for this feature:

| Generation | Minimum NmAgent Version |
|-|-|
| Non-Overlake (Generation <= 7.7) | 3.301.26.86 (Nmagent_rel_3_301_qfe_V2686) |
| Overlake (Generation <= 7.7) | 4.5.0.142 |

You can confirm the NMA version for the AKS cluster nodes using the following Kusto query:

```kql
let customerSubsciption = "<customerSubsciption>";
let AKSManagedVMSSName = "<AKSManagedVMSSName>";
cluster('vmainsight.kusto.windows.net').database('CAD').CAD
| where PreciseTimeStamp >= ago(1d)
| where LastKnownSubscriptionId == customerSubsciption
| where RoleInstanceName contains AKSManagedVMSSName
| distinct LastKnownSubscriptionId, RoleInstanceName, NodeId
| join kind=innerunique cluster('azuredcm').database('AzureDCMDb').dcmInventoryGenerationMappingV3 on NodeId
| project LastKnownSubscriptionId, RoleInstanceName, NodeId, Generation
| join kind=innerunique cluster('Azurecm').database('AzureCM').ServiceVersionSwitch on NodeId
| where ServiceName == "NmAgent"
| extend isOverlake = iif(toreal(Generation) <= 7.7, false, true)
| project LastKnownSubscriptionId, RoleInstanceName, NodeId, Generation, isOverlake, ServiceName, CurrentVersion
```

### Review POD logs for ALB

```bash
kubectl logs -n azure-alb-system --selector app=alb-controller --all-containers=true
```

Filter by overlay-related messages:

```bash
kubectl logs -n azure-alb-system --selector app=alb-controller --all-containers=true --tail=100 | grep "overlay CNI"
```

The following message indicates CNI overlay is working:
```
"message":"Cluster is using overlay CNI, using subnetID \"/subscriptions/.../subnets/xxxx\" for association"
```

> **Important**: Make sure the subnet resourceID matches the Association in the Application Gateway for Containers resource.

Happy path log entries during overlay extension deployment:
1. "Creating overlay extension config with subnet CIDR 10.13.100.0/24"
2. "Waiting for overlay extension config ... to be ready"
3. "Overlay extension config ... is ready"
4. "Cluster is using overlay CNI, using subnetID ... for association"

The following error can be ignored (as long as the success message above is found):
```
"error":"failed to reconcile subnet association: failed to reconcile overlay resources: timed out waiting for overlay extension config to be ready"
"message":"Retrying to process the request."
```

### Confirm custom resource creation

```bash
kubectl get overlayextensionconfigs -A -o yaml
```

> **Important**:
> - Make sure the **extensionIPRange** matches the CIDR range for the Application Gateway subnet
> - The subnet range **has to be a /24**

If the custom resource is missing (region not supported or cluster not enabled for CNI Overlay), manually install:

```bash
kubectl apply -f https://raw.githubusercontent.com/Azure/azure-container-networking/refs/heads/master/crd/overlayextensionconfig/manifests/acn.azure.com_overlayextensionconfigs.yaml
```
