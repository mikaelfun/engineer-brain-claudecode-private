---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/VNet Scaling (StaticBlock)"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/VNet%20Scaling%20%28StaticBlock%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Vnet Scaling (StaticBlock)

[[_TOC_]]

# Overview
Azure CNI VNet Scale improves Azure CNI VNet Scaling limitation. Due to an Azure IP address mapping limitation, Azure CNI VNet has a limit of 64,000 addresses per VNet. While current VNet options are limited by Azure Routing's 64k address mapping limit, Vnet Scale gets around this by assigning Route maps to blocks of IP's rather than individual IPs and brings the potential scale up to a million pods. It is expected that this would only be needed/used on very large clusters.

Azure CNI Swift-StaticBlock (Vnet Scale) is the feature for an overlay network space (similar to Azure Swift CNI) that uses Azure CNI as the network-plugin but uses a feature from the networking team called "Routing Domains". These routing domains will route traffic destined for a pod to the appropriate node by associating the CIDR block the pod belongs to and using the CIDR block route tables to route the traffic correctly. This feature uses the same components as PodSubnet/SWIFT and Overlay (DNC/DNC-RC/CNS/Subnet Hanlder/DNC cleanup service).

# Usage

Example query to ManagedClusterMonitoring to see the usage of Azure CNI Swift (Static Block) clusters. It will have networkPlugin=azure, podSubnetID and podIPAllocationMode=StaticBlock

[kusto](https://dataexplorer.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAA01OPU%2FDMBDd%2BRWHp3RggBGpSFAQ6hBUKRm7XO3DsbB91p2tCsSPx1kixvf9RszoyR1i00oycg6VJWR%2F8wvXhYRgPo5v0%2Fw8nuAJ0PNw73abltSD5VwxZAVT2IWCMbLFGjgndnQ2j2cz1Y7tS%2Be%2FzBYNOpPWqV3USiirf9B%2F4Pi6g%2F0ePjEqbRkh5SaW3oVb%2BcBEALdaUapeQ13A0AOJv1s3tKWEEn4InOWW67DYcuhHheMpYqa1%2FvLdC33f%2BgNW3h1qAwEAAA%3D%3D)
```
ManagedClusterMonitoring
| where TIMESTAMP > ago(1d)
| where msg contains "podipallocationmode\":\"StaticBlock"
| where isTestSubscription(subscriptionID) == false
| where resourceGroupName  !startswith "e2erg-"
| summarize dcount(hcpControlPlaneID) by region
```

# Troubleshooting

## Swift components

Azure CNI Swift StaticBlock uses the same components from Swift (podsubnet). These include CNS (which runs on the customers nodes as a daemonset) and DNC/DNC-RC which run in the CCP.

For more information and troubleshooting steps, including Kusto queries, please refer to the following TSG: https://eng.ms/docs/cloud-ai-platform/azure-core/azure-networking/sdn-dbansal/azure-container-networking/azure-container-networking-tsgs/tsgs/aks-swift/prereqs

## Control Plane

If there is a control plane failure for a swift-staticBlock cluster, there are 2 places to check:

### Subnet-Hanlder

During each agent pool reconciliation, RP will send a PUT request to subnet-handler to write a value in the CosmosDB table, SubnetTokenMap. This value will also include a field called allocationBlockPrefixSize and it should be set to 28.

If there are errors from subnet-handler, check the logs with the ccp ID of the cluster

[kusto](https://dataexplorer.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAAz2MvQ6CMBCAd5/iwoRbC/GHxcSBRAcSE9jNQa9QUu9IW3Xx4cXF+ftpnz1TuiAbT6F+Eae4+cB7okDQXZu67c7NDU6Ao+TabP/MywiDcELHEbJ9YUsyhyNaU9peKaWrHVJVZKu/BJlpSLBgiHSfo3C+xr+Tdw+XQCv1BUBmvimFAAAA)

```
SubnetHandlerEvents
| where TIMESTAMP > ago(1d)
| where log contains "62f3ed78afd3fb000195ae92"
| project parse_json(log)
| limit 100
```

### Node Labels

If nodes are being created, ensure the correct node labels are being applied. CNI Swift - StaticBlock clusters should have the following 2 labels

```
kubernetes.azure.com/podnetwork-type: vnetblock
kubernetes.azure.com/podnetwork-delegationguid: 3726bc87-ad70-4314-b068-6a69dfae84cd
```
**The podnetwork-delegationguid should match the VNet resource GUID of the podSubnet associated with this agentpool**.

## Data Plane

### Pods stuck in ContainerCreating

Will usually have this error message

> Failed to create pod sandbox: rpc error: code = Unknown desc = failed to setup network for sandbox "ad9fa947ca532bbf5c449121c7720ff6b44ddec03b701f5658e6de84692b2548": IPAM Invoker Add failed with error: Failed to get IP address from CNS with error: %w: http request failed: Post "http://localhost:10090/network/requestipconfig": dial tcp 127.0.0.1:10090: connect: connection refused


If pods are not being allocated IPs, first check the NodeNetworkConfiguration CRD, `nodenetworkconfigs.acn.azure.com` has been installed on the cluster.

Then check to see if DNC-RC has created any NNCs. There should be 1 per node.

`k get nnc -A`

If there are no NNCs created, check the DNC-RC logs in ControlPlaneEventsAll for the CCP ID of this cluster and Cloudnet/Container Networking.

[kusto](https://dataexplorer.azure.com/clusters/aksccplogs.centralus/databases/AKSccplogs?query=H4sIAAAAAAAAA0WPO2/CQBCE+/yKlSsiRZGBvCgcCUUUKUBWcI82d2Njcr677G1eUn58bAjQ7cx8I+08Ba8SXOnYY/EJr2nu3MUvfW0hIMOKJsgPFQVlgvcPJDWHhoNkZ87EFXdIkQ327N2knsLeP3Btp/Vrnufj2S1jNjlXquflYl3NlyU9EjdhdLO97DN8K7wlihJiKiJLwmaXgh8NBkRbpAHr1Q5GqRSYNqFqO6yVu3h1KF670BzPpALujioGe/pg72x6lIZJ3PpE2SpYvKDXpv0fqPwGGud/LHNA4SgBAAA=)

```
ControlPlaneEventsAll
| where category == "requestcontroller"
| where ccpNamespace == "62f3ed78afd3fb000195ae92"
| where TIMESTAMP > ago(4h)
| extend  props=parse_json(properties)
| project PreciseTimeStamp, props.log, props.stream, props.pod
| where props_log contains "NodeReconciler"
| take 10
```
If there are NNCs in the cluster, try to get CNS logs from each node. CNS is an addon and runs as a daemonset under the name `azure-cns` in the `kube-system` namespace.

Once the logs from CNS are obtained, send the NNCs and CNS logs to the container networking team.


## Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>