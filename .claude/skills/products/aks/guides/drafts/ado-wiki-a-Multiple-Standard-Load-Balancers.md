---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Multiple Standard Load Balancers"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FMultiple%20Standard%20Load%20Balancers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Multiple Standard Load Balancers

[[_TOC_]]

## Overview

AKS currently configures only a single Standard Load Balancer and a single Internal Load Balancer (if required) per cluster. This imposes a number of limits on AKS clusters based on Azure Load Balancer limits, the largest being based on the 300 rules per NIC limitation.

Any IP:port combination in a _frontEndIPConfiguration_ that maps to a member of a backend pool counts as one of the 300 rules for that node. This limits any AKS cluster to a maximum of 300 LoadBalancer service IP:port combinations.

This feature allows the customer to use more than one SLB on a cluster. This is really only useful on very large clusters, where the customer is hitting the limit on the number of LB services you can have on a single SLB.

## Supported command examples

```bash
az aks create --load-balancer-backend-pool-type nodeIP
az aks loadbalancer add/update --cluster-name <cluster_name> -g <resource_group> --name <lb_name> --primary-agent-pool-name <nodepool_name> --allow-service-placement true
az aks loadbalancer add/update --service-namespace-selector "a In b c,d=e,f NotIn g h,i Exists,j DoesNotExist"
az aks loadbalancer delete --cluster-name -g --name <lb_name>
az aks loadbalancer show
az aks loadbalancer list
```

## Supported service annotation

```yaml
service.beta.kubernetes.io/azure-load-balancer-configurations: "lb1,lb2"
```

## High-level design

### Load Balancer management

User can create, update and delete a load balancer configuration through `az aks loadbalancer` commands. The first load balancer configuration must have a name of `kubernetes`. Once the first kubernetes configuration is created, the multi-slb mode is on. To turn off the feature and use legacy single-slb mode, just remove all load balancer configurations. An azure standard load balancer resource will be lazily created when there is an lb-typed service asking for one.

### Node selection rules

When nodes are created, each node will be evaluated to see what load balancer it should be placed into. Valid placement targets will be determined as follows (rules match from top to bottom, first match wins):

- If this node is in an agent pool that is selected as a primary agent pool for a load balancer, that load balancer will be the only potential placement target.
- If the nodeSelectors on any load balancer configurations match this node, then all load balancer configurations that match it will be potential placement targets.
- If no nodeSelectors on any load balancer configurations match this node, then all load balancers that do not have any nodeSelectors will be potential placement targets.
After the list of potential placement targets has been calculated, the node should be placed into the kubernetes backend pool of the load balancer with the fewest number.

### Service selection rules

Users can select a specific load balancer configuration by passing a comma-separated list of configuration names in the annotation `service.beta.kubernetes.io/azure-load-balancer-configurations`.

1. Start with the list of all load balancer configurations.
2. Perform the following steps in parallel:
  2a. Generate the list of configurations listed in the service annotation; if empty, use entire list.
  2b. Generate the list of configurations with a namespaceSelector matching the service's namespace; if no matches, use all with empty namespaceSelector.
  2c. Generate the list of configurations with a labelSelector matching the service; if no matches, use all with empty labelSelector.
3. Calculate the intersection of 2a, 2b, 2c.
4. Select the load balancer with the fewest number of rules.

### ExternalTrafficPolicy Local services

For local services, each one will have a dedicated backend pool named after service.uid. Only nodes hosting service's endpoints are added to the dedicated pool.

### Outbound traffic

This feature does not change any outbound traffic logic. If outbound type is loadBalancer, all traffic will go through the `kubernetes` load balancer from its outbound backend pool.

## Known issues

### Mismatch of operation finish times between aks-rp and cloud-controller-manager

After making changes to a load balancer configuration by `az aks loadbalancer` commands, the aks operation will return successfully after updating the hcp and cloud provider configuration secret. However, cloud-controller-manager still needs some time to reload. To prevent this issue, monitor kubernetes event `EnsuredLoadBalancer` which marks the finish of cloud provider's restart before performing operations related to the new change.
