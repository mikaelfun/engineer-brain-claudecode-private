---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Networking/Ungrouped/Upgrade to Azure CNI Powered by Cilium suportability matrix and commands"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Networking/Ungrouped/Upgrade%20to%20Azure%20CNI%20Powered%20by%20Cilium%20suportability%20matrix%20and%20commands"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Upgrade to Azure CNI Powered by Cilium suportability matrix and commands

[[_TOC_]]

## Introduction

There are always new IP assignment management (IPAM) modes and dataplane technology supporting Azure Kubernetes Service (AKS). This document targets existing AKS clusters which needs to upgrade to newer IPAM modes and dataplane cilium technology to access the latest features and supportability.
This document provides supportability matrix (IPAM and cilium Data plane) and commands for upgrading an existing AKS cluster to cilium dataplane, by first upgrading to Azure CNI overlay for IPAM modes and then upgrade to Azure CNI powered by Cilium as its dataplane.

## IPAM and dataplane types in AKS

|| |
|----------------------------------|------------------------------------------------------------------|
|`IPAM(IP Assignment Mgmt) modes`|CNI node subnet (is legacy CNI), CNI overlay, CNI pod subnet, kubenet|
|`Data Plane`|Cilium, Non-Cilium(azure)|

## Suportability Matrix ofIPAM and cilium Data plane

|`Upgrade to Azure CNI Powered by Cilium  - Supported cases`|
|----------------------------------|
|Upgrade from CNI node subnet(LEGACY CNI)  >> to  CNI  overlay  >>    to   cilium dataplane|
|Upgrade from Kubenet                                              >> to  CNI overlay    >>    to  cilium dataplane|
|Upgrade from CNI overlay                                        >> to  cilium dataplane|
|Upgrade from CNI pod subnet                                >> to  cilium dataplane|

| `Non-Supported cases`   |
|----------------------------------|
| Upgrade from CNI pod subnet                                >> to  CNI overlay  |  

## Commands to  Upgrade to Azure CNI Powered by Cilium from different IPAM modes

**Pre-requisite**: Use Azure CLI versions >= 2.48.1/cloud shell to execute the commands

### Migrating from a kubenet cluster >>>  to CNI overlay >>>  to Az CNI powered by cilium
  
#### Step a - Disable Network policy on AKS cluster (if any)

``` bash
az aks update --resource-group $RESOURCE_GROUP_NAME  --name $CLUSTER_NAME --network-policy none
 
 "networkProfile":{
         "networkPlugin":"azure",
         "networkPluginMode":"null",
         "networkPolicy":"none",
         "networkDataplane":"azure",
```

Note : Snippet of network profile on the PUT request for reference

#### Step b  Now Migrate from kubenet to Azure CNI in overlay mode

``` bash
az aks update --name $clusterName  --resource-group $resourceGroup  --network-plugin azure  --network-plugin-mode overlay
 
Snippet of N/W profile on the PUT request for reference
 
 "networkProfile":{
         "networkPlugin":"azure",
         "networkPluginMode":"overlay",
         "networkPolicy":"none",
         "networkDataplane":"azure",
```

Note: Since the cluster is already using a private CIDR for pods which doesn't overlap with the VNet IP space, you don't need to specify the --pod-cidr parameter and the Pod CIDR remains the same if the parameter isn't used.

#### Step c  Then Migrate from Az CNI in overlay mode to Az CNI powered by Cilium

``` bash
az aks update --name <clusterName> --resource-group <resourceGroupName>  --network-dataplane cilium --network-policy cilium 

"networkProfile": {
"networkPlugin": "azure", 
"networkPluginMode": "overlay",
 "networkPolicy": "cilium", 
 "networkDataplane": "cilium"
}
```

Note: Now the cluster configuration should reflect the desired state with Cilium as both the dataplane and policy. Use network-dataplane and network-policy in same command

### Migrating from Azure CNI pod subnet/CNI overlay cluster   >>> to Az CNI powered by cilium

#### Step a - Disable Network policy on AKS cluster (if any)

``` bash
az aks update --name <clusterName> --resource-group <resourceGroupName> --network-policy none
```

#### step b: Then Migrate from Az CNI pod subnet to Az CNI powered by Cilium

``` bash
az aks update --name <clusterName> --resource-group <resourceGroupName>  --network-dataplane cilium --network-policy cilium 

"networkDataplane": "cilium",
 "networkMode": null,
 "networkPlugin": "azure",
"networkPluginMode": null,  
 "networkPolicy": "cilium",
```

Note: the cluster configuration should reflect the desired state with Cilium as both the dataplane and policy.

## Useful links

[Upgrade Azure CNI AKS](https://learn.microsoft.com/en-us/azure/aks/upgrade-azure-cni#upgrade-to-azure-cni-powered-by-cilium)
[Config CNI overlay]( https://learn.microsoft.com/en-us/azure/aks/azure-cni-overlay?tabs=kubectl)

## Owner:  [Smita.Sulikal](mailto:smitasulikal@microsoft.com)

## Owner and Contributors

**Owner:** Kavyasri Sadineni <ksadineni@microsoft.com>

**Contributors:**

- Kavyasri Sadineni <ksadineni@microsoft.com>
- Fabian Gonzalez Carrillo <Fabian.Gonzalez@microsoft.com>
- Smita Sulikal <smitasulikal@microsoft.com>
