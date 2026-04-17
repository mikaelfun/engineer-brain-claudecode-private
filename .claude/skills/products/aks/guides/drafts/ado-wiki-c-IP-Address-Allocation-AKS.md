---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Networking/Ungrouped/How IP address allocation works in AKS and how to troubleshoot based on IP addresses"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Networking/Ungrouped/How%20IP%20address%20allocation%20works%20in%20AKS%20and%20how%20to%20troubleshoot%20based%20on%20IP%20addresses"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How IP address allocation works in AKS and how to troubleshoot based on IP address

[[_TOC_]]

## Scope

Sometimes, the customers want to know/understand how the IP addresses are allocated for their nodes or pods inside the AKS clusters. They also might state that they have issues with IP addresses assignment or we simply need to troubleshoot things related to IP addresses.

In this Wiki I will:

  Explain how the IP address allocation works for both network plugins, Kubenet and Azure CNI, including an example

  Provide you a very useful Kusto query and based on that example I will show you how to investigate/troubleshooting different scenarios

For any question, clarification, improvement or in case this gets outdated, feel free to contact me on Teams or email: <andbar@microsoft.com>

## Special thanks

Thank you Mohammed Abu Taleb for helping me with the Kusto query provided in this Wiki!

## Theoretical explanation

In an AKS cluster, 5 IP addresses from a subnet will be reserved by Azure.

  x.x.x.0: Network address

  x.x.x.1: Reserved by Azure for the default gateway

  x.x.x.2, x.x.x.3: Reserved by Azure to map the Azure DNS IPs to the VNet space

  x.x.x.255: Network broadcast address

The IP address allocation will be done based on the first range of available IP address/first IP address taking in consideration the number.

### Kubenet model

The first IP address of a node will be .4, then .5 and so on. If a node is deleted, its IP address will not be in use anymore and the next added node can assign it.

Pods receive an IP address from a logically different address space to the Azure virtual network subnet of the nodes. Network address translation (NAT) is then configured so that the pods can reach resources on the Azure virtual network. The source IP address of the traffic is NAT'd to the node's primary IP address. This approach greatly reduces the number of IP addresses that you need to reserve in your network space for pods to use.

### Azure CNI model

The first IP address of a node will be .4 and the next IP addresses will be reserved for node s pods based on the max-pods parameter and so on.

If a node is deleted, its IP address and the ones reserved for the pods will be free and the next added node will get them assigned.

### Practical example for Azure CNI

I create a cluster with Azure CNI 2 nodes and the default max-pods parameter: 30 pods per node. The nodes have the IP addresses .4 and .35. The  gap  between them is reserved for pods because the cluster is using Azure CNI.

![image.png](/.attachments/image-5b9dcc32-2131-43e3-8594-bb2328f07bee.png)

Then I scaled up one more node which got IP address .66.

![image.png](/.attachments/image-c8f0aae0-c23d-400d-8b1f-ed82a5315261.png)

The next step was to delete the instance 1. Now there is a gap for IP addresses .35-.65

![image.png](/.attachments/image-2699c647-5cef-4c72-bed6-8cc6bef0b39a.png)
![image.png](/.attachments/image-f7f855d3-a125-41f7-ad61-3dc87e8857f5.png)

Then I scaled up one more node and instance 3 was added. The IP allocation works like this: it is looking for the next available range. In this case, it was the one used before by instance 1, so instance 3 uses now IP address .35

![image.png](/.attachments/image-1bba2c37-3e1f-4ce4-bc96-bbd26d170971.png)

### How to investigate/troubleshoot this kind of scenario (based on the above practical example)

For many reasons, we might need to troubleshooting this kind of scenario, maybe at a higher level. Further, I will present you a very powerful Kusto query and show you how to investigate, based on my above actions.

```kql
Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://nrp.kusto.windows.net/binrp
union cluster("nrp").database("mdsnrp").FrontendOperationEtwEvent
//| where PreciseTimeStamp > datetime(2020-07-10 00:00:00) and PreciseTimeStamp < datetime(2021-09-29 23:59:59)
| where PreciseTimeStamp > ago(5d)
| where SubscriptionId has "{SubscriptionID}"
| where ResourceGroup contains "{MC_ResourceGroup}"
| where HttpMethod == "PUT"
| project PreciseTimeStamp, Message, ResourceName, ResourceGroup, HttpMethod, OperationId, SubscriptionId, 
EventCode, EventName
```

This will show you a lot of information, but customized properly, it will show you the needed information.

For example, let s check:

1   What used the IP address 10.240.0.35? We will customize the query like this:

```kql
Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://nrp.kusto.windows.net/binrp
union cluster("nrp").database("mdsnrp").FrontendOperationEtwEvent
//| where PreciseTimeStamp > datetime(2020-07-10 00:00:00) and PreciseTimeStamp < datetime(2021-09-29 23:59:59)
| where PreciseTimeStamp > ago(5d)
| where SubscriptionId has "{SubscriptionID}"
| where ResourceGroup contains "{MC_rgip_ip_westeurope}"
| where HttpMethod == "PUT"
| where Message startswith "Assigned ipaddress"
| where Message contains "10.240.0.35"
| project PreciseTimeStamp, Message
```

Output:

```text
2021-02-07 15:33:59.9617264 

Assigned ipaddress 10.240.0.35 to ipconfig /subscriptions/SubscriptionID/resourceGroups/MC_rgip_ip_westeurope/providers/Microsoft.Network/networkInterfaces/|providers|Microsoft.Compute|virtualMachineScaleSets|aks-nodepool1-16552129-vmss|virtualMachines|1|networkInterfaces|aks-nodepool1-16552129-vmss/ipConfigurations/ipconfig1
```

```text
2021-02-07 15:59:19.0816620

Assigned ipaddress 10.240.0.35 to ipconfig /subscriptions/SubscriptionID/resourceGroups/MC_rgip_ip_westeurope/providers/Microsoft.Network/networkInterfaces/|providers|Microsoft.Compute|virtualMachineScaleSets|aks-nodepool1-16552129-vmss|virtualMachines|3|networkInterfaces|aks-nodepool1-16552129-vmss/ipConfigurations/ipconfig1
```

As we can see, we have two entries:

-one for aks-nodepool1-16552129-vmss000001 which was created the same time with the cluster

-one for aks-nodepool1-16552129-vmss000003 which I scaled up and got the IP address used by aks-nodepool1-16552129-vmss000001 before. That IP address was taken by aks-nodepool1-16552129-vmss000003 because it was the first available. Also, the range 10.240.0.36-10.240.0.65 will be reserved for pod s IP addresses. We will check that in example 2.

2   What IP addresses are used by a specific machine (including its pod): aks-nodepool1-16552129-vmss000003? We will customize the query like this:

```kql
Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://nrp.kusto.windows.net/binrp
union cluster("nrp").database("mdsnrp").FrontendOperationEtwEvent
//| where PreciseTimeStamp > datetime(2020-07-10 00:00:00) and PreciseTimeStamp < datetime(2021-09-29 23:59:59)
| where PreciseTimeStamp > ago(5d)
| where SubscriptionId has "{SubscriptionID}"
| where ResourceGroup contains "{MC_rgip_ip_westeurope}"
| where HttpMethod == "PUT"
| where Message startswith "IpConfigsBeingAssigned"
| where Message contains "/subscriptions/baa1edbb-xxxx-xxxx-xxx-ef510ec/resourceGroups/MC_RG/providers/Microsoft.Network/networkInterfaces/|providers|Microsoft.Compute|virtualMachineScaleSets|aks-nodepool1-16552129-vmss|virtualMachines|3"
| project PreciseTimeStamp, Message
```

Output (I will provide the PreciseTimeStamp, the output of a line as example and a screenshot with last which shows the instance, ipconfig and the IP address itself because the output is big and I don t want to make this Wiki full of logs):

```text
2021-02-07 15:59:19.0819736

IpConfigsBeingAssigned : 

 IpconfigID : PrivateIPAddress : IPAddressVersion

/subscriptions/SubscriptionID/resourceGroups/MC_rgip_ip_westeurope/providers/Microsoft.Network/networkInterfaces/|providers|Microsoft.Compute|virtualMachineScaleSets|aks-nodepool1-16552129-vmss|virtualMachines|3|networkInterfaces|aks-nodepool1-16552129-vmss/ipConfigurations/ipconfig31 : 10.240.0.65 : IPv4
```

![image.png](/.attachments/image-59558cfa-7aab-459b-a7a2-ce330ecf78bf.png)

These scenarios are not the only ones you can use the above Kusto query. Feel free to use it and identify the best way it might fit your needs.

You can get back to me on Teams or email (<andbar@microsoft.com>) in case you find any other scenario that worth to be mentioned. Also, feel free to reach for any question, clarification, improvement or in case this gets outdated.

## Reference links

IP addresses reserved by Azure

<https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq#are-there-any-restrictions-on-using-ip-addresses-within-these-subnets>

Kubenet

<https://docs.microsoft.com/en-us/azure/aks/configure-kubenet>

<https://docs.microsoft.com/en-us/azure/aks/concepts-network#kubenet-basic-networking>

Azure CNI

<https://docs.microsoft.com/en-us/azure/aks/configure-azure-cni>

<https://docs.microsoft.com/en-us/azure/aks/concepts-network#azure-cni-advanced-networking>

## Owner and Contributors

**Owner:** Kavyasri Sadineni <ksadineni@microsoft.com>

**Contributors:**

- Kavyasri Sadineni <ksadineni@microsoft.com>
- Luis Alvarez <lualvare@microsoft.com>
- Enrique Lobo Breckenridge <enriquelo@microsoft.com>
- Andrei Barbu <andbar@microsoft.com>
