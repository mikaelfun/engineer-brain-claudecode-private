---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/IP Based Load Balancer"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FIP%20Based%20Load%20Balancer"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# IP-based Load Balancer

## Overview

IP-based LB feature is enabled by setting `loadBalancerProfile.BackendPoolType` to `nodeIP`. Before this feature, all LB backend pools were NIC-based (VM associated via VMSS API + NIC). NIC-based LB performs badly in:

1. Creating a cluster with >750 nodes
2. Creating the first internal service in a large cluster
3. Scaling out many nodes

With IP-based LB, we attach the private IP of a VM to the LB by calling the LB API directly, without touching the VMSS.

Backend pool type defaults to `nodeIPConfiguration` and can be changed. `nodeIP` is supported since v1.23.0.

```bash
az aks create --load-balancer-backend-pool-type=nodeIP
az aks update --load-balancer-backend-pool-type=nodeIP
```

> The AKS-managed outbound backend pool is still NIC-based, as the outbound rule is not useful for IP-based pools.

## Migration

There should be no service downtime during migration from NIC-based to IP-based backend pool with the migration API provided by NRP.

## Key Differences

- NIC-based: `backendIPConfigurations` references VMSS NIC ipConfigurations
- IP-based: `loadBalancerBackendAddresses` contains `ipAddress` + `virtualNetwork` reference
