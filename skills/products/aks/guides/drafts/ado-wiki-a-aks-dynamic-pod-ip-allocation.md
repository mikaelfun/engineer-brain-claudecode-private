---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/AKS dynamic pod IP allocation"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAKS%20dynamic%20pod%20IP%20allocation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Dynamic pod IP allocation with SWIFT

[[_TOC_]]

## Overview

In a nutshell the dynamic IP allocation feature provides better IP management and utilization compared to normal Azure CNI. The pod IPs are assigned from a dedicated pod CIDR from an azure subnet, and nodes will get IPs from a dedicated node CIDR from a different azure subnet on the same VNET. There have been multiple escalations related to Customer and Support engineer confusion around how the AKS Azure CNI dynamic IP allocation is supposed to work. This documents aims to clarify that with examples and reference to documentation and useful Kusto queries for this subject.

## Feature Components

SWIFT uses Customer subnet to allocate IPs dynamically and provision it on the POD. Similarly, on POD deletion, it releases the IP which can be re-assigned to another POD running on a separate Node. At high level it provides:

- During cluster setup, AKS-RP will get a token for the Subnet (aka Delegated Subnet or POD subnet) from Customer�s VNet. Pod Subnet will be used only to assign IPs for PODs. Worker nodes will get deployed from a different Subnet.
- Delegated Subnet can be shared across different Nodes as well as across different customer clusters deployed on a same VNet.
- SWIFT allocate IPs from this delegated Subnet and provision them to PODs. On POD deletion, it releases the IP which can be reassigned to a different POD running on a different Node or even different Cluster.
- Since POD IPs are from different Subnet than Worker node, different Network policies can be applied to PODs unlike in existing CNI model.

Two main components are deployed on an AKS cluster using Swift networking:

- DNC (deployed on cluster CCP) Azure DNS and DNC RC can be restarted from jarvis function AzureContainerService AKS > Customer Control Plane Operations > CustomerControlPlane - Restart Component.
- CNS (daemonset deployed on cluster nodes) Each node will have a pod with the name azure-cns-xxxx

![Architecture diagram showing all of the involved components for dynamic pod IP allocation.](/.attachments/image-8fea7f92-374b-4338-8766-92d55c82a11c.png)

## Implementation Details

### How the IP allocation works

The key part to understand from the documentation on dynamic pod IP allocation:

> IPs are allocated to nodes in batches of 16. Pod subnet IP allocation should be planned with a minimum of 16 IPs per node in the cluster; nodes will request 16 IPs on startup and will request another batch of 16 any time there are <8 IPs unallocated in their allotment.

This means that pod IPs to subnet IP nodes allocations is not 1 to 1. Nodes will always start allocating 16 pod IPs, and if the free pod IPs goes below 8, another batch of 16 IPs will be requested. It is not possible to allocated IPs one by one for each pod, and this limitation is by design.

## Troubleshooting Guides

### How can we check the current IP allocation

When an AKS cluster has this functionality enabled, a `nodenetworkconfigs.acn.azure.com` CRD object is created in the cluster. Each node of the cluster gets a single object of this type configured. This object holds the requested IP count for the corresponding node and the current status of the IP allocation.

We can check the current allocation count for a node by first listing all of the NNC objects in the cluster (`kubectl get nnc -n kube-system`), finding the one with the same name as our node in question, and then using the `kubectl describe nnc <NODE_NAME>` command. The output from the describe command will be similar to the following (note, the managed fields section has been removed for brevity):

```yaml
Name:         aks-nodepool1-27709767-vmss000000
Namespace:    kube-system
Labels:       kubernetes.azure.com/podnetwork-delegationguid=aac92896-9eb5-403a-8c24-0daeed483dd6
              kubernetes.azure.com/podnetwork-subnet=podsubnet
              managed=true
              owner=aks-nodepool1-27709767-vmss000000
Annotations:  <none>
API Version:  acn.azure.com/v1alpha
Kind:         NodeNetworkConfig
Metadata:
  Creation Timestamp:  2023-03-06T18:30:46Z
  Finalizers:
    finalizers.acn.azure.com/dnc-operations
  Generation:  1
  Owner References:
    API Version:           v1
    Block Owner Deletion:  true
    Controller:            true
    Kind:                  Node
    Name:                  aks-nodepool1-27709767-vmss000000
    UID:                   019f8982-7c2c-4647-9da5-1e20619b130a
  Resource Version:        724
  UID:                     1f14d503-f40d-41f9-bc42-8320f73b8d07
Spec:
  Requested IP Count:  16
Status:
  Network Containers:
    Assignment Mode:  dynamic
    Default Gateway:  10.241.0.1
    Id:               b0edc2a7-0f27-40da-9dd9-3905e84cdaae
    Ip Assignments:
      Ip:                  10.241.0.6
      Name:                13d5971b-97b7-401c-b662-d71cff78abd6
      Ip:                  10.241.0.11
      Name:                2af2b34a-2142-484d-bbdc-89a0ccf927fe
      Ip:                  10.241.0.8
      Name:                93e80b7d-3ab5-4196-a528-db09a20ec4e8
      Ip:                  10.241.0.10
      Name:                c55b4b89-55c3-4bc4-a4e7-b26725dfb608
      Ip:                  10.241.0.18
      Name:                1bf2753c-a193-40f5-ace3-b20c18c85b20
      Ip:                  10.241.0.14
      Name:                7a9bee5a-f91c-44ab-afb6-4b5a4052022e
      Ip:                  10.241.0.9
      Name:                95dd24ac-ecab-4158-b1df-b99d71ba7e54
      Ip:                  10.241.0.16
      Name:                c290e1f8-6593-4c85-87ad-710f07d1eb7b
      Ip:                  10.241.0.12
      Name:                ce9b8e3c-2d1f-43a1-8bf7-72e450fc8f37
      Ip:                  10.241.0.20
      Name:                16690ac2-fb45-4ba3-b5c8-55a18a8d32e6
      Ip:                  10.241.0.15
      Name:                3339f8bb-53fd-49c7-abe4-116ce9d803af
      Ip:                  10.241.0.19
      Name:                7df88459-0739-45b0-91f5-d8126a796e6b
      Ip:                  10.241.0.17
      Name:                0e2861d8-431d-43e6-917c-c0c54ec97fc0
      Ip:                  10.241.0.7
      Name:                31bbe32f-5eb0-4420-ad42-c3278174099b
      Ip:                  10.241.0.13
      Name:                d360b298-4bad-4459-8be9-cba2a9c95cfb
      Ip:                  10.241.0.5
      Name:                f6519455-b49c-4082-b86c-0cf56302f1b4
    Node IP:               10.240.0.5
    Primary IP:            10.241.0.4
    Resource Group ID:     net-cnidi-rg
    Subcription ID:        801b6a06-167f-4cff-9a66-61cb3c5b39f5
    Subnet Address Space:  10.241.0.0/26
    Subnet ID:             podsubnet
    Subnet Name:           podsubnet
    Type:                  vnet
    Vnet ID:               aks-di-vnet
  Scaler:
    Batch Size:                 16
    Max IP Count:               250
    Release Threshold Percent:  150
    Request Threshold Percent:  50
Events:
  Type    Reason      Age   From                   Message
  ----    ------      ----  ----                   -------
  Normal  CreatingNC  8m4s  dnc-rc/nnc-reconciler  Creating new NC b0edc2a7-0f27-40da-9dd9-3905e84cdaae for node 640630cb57387400018ef971_aks-nodepool1-27709767-vmss000000
  Normal  UpdatedNC   8m3s  dnc-rc/nnc-reconciler  Published NC b0edc2a7-0f27-40da-9dd9-3905e84cdaae
```

> **Important:**
The describe contains this data:

```yaml
Spec:
  Requested IP Count:  32
Status:
  Assigned IP Count:  32
```

- Requested means the number of IPs the node requested from the subnet.
- Assigned IP count: is the number of IPs from the requested number that were actually asigned. Requested 32 obtained 32.

IP Assignments are not necesarily PODs in running state. Those listed are just reservations. The actual number of pods using IPs can be obtained with commands shown below.

If we list all pods, and then filter by node <NODE_NAME> and by IP with pod subnet address space, we can get a basic idea of the pod IPs currently assigned vs the allocated.

```bash
kubectl get pod -A -o wide| grep <nodename> | grep -v <duplicateips>
The idea is to remove IPs that appear several times in the list of pods using the same IP.
```

![Output of the get pods command showing the currently assigned IPs that correspond to the list present in the NNC describe.](/.attachments/image-322bdc94-d1a4-4c7d-9c92-da5fb1e6cf01.png)

### Retrieving metrics from the azure-cns pods

As documented in Azure/azure-container-networking GitHub repo (<https://github.com/Azure/azure-container-networking/tree/master/cns/doc/examples/metrics>), the azure-cns pods (daemonset created as part of SWIFT networking setup) expose metrics over `:10092/metrics`. We can scrape the metrics from the endpoint by running a curl command from any of the nodes or helper pod: `curl -s <AZURE-CNS_POD_IP>:10092/metrics | grep 'cx_ipam_'`

For example:

![Output from the curl command showing Prometheus metrics exposed by the Azure CNS pods on their metrics endpoint and path.](/.attachments/image-2c6a6c74-9a91-4a93-8a24-af2298f073f2.png)

From there we can see the status of:

- cx_ipam_available_ips (IPs reserved by the Node but not assigned to Pods yet)
- cx_ipam_batch_size
- cx_ipam_current_available_ips
- cx_ipam_expect_available_ips
- cx_ipam_max_ips (maximum IPs the Node can reserve from the Subnet)
- cx_ipam_pending_programming_ips
- cx_ipam_pending_release_ips
- cx_ipam_pod_allocated_ips (IPs assigned to Pods on the Node)
- cx_ipam_requested_ips
- cx_ipam_total_ips (IPs reserved by the Node from the Subnet)

For more consistent scraping, visualization/dashboarding, and alerting, a system like Prometheus and Grafana could be used. The implementation of this is out of the scope of this article, however using a PodMonitor object in Prometheus, we can configure it to scrape the metrics from the azure-cns pods and expose the collected metris to Grafana for visualization.

If this path is implemented, a prebuild Grafana dashboard for Azure CNS can be found at <https://raw.githubusercontent.com/Azure/azure-container-networking/master/cns/doc/examples/metrics/grafana.json>.

### Useful Kusto queries

We can check the DNC logs with the following Kusto query, and also filter to check for address allocation issues:

```sql
let queryNamespace = "{CLUSTER_CCPNAMESPACE}";
let queryFrom = datetime("2023-03-02T13:01:00Z");
let queryTo = datetime("2023-03-02T13:15:00Z");
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp between (queryFrom .. queryTo) 
| where category == "dnc" or category == "requestcontroller"
| where namespace == "queryNamespace"
| project TIMESTAMP, properties
| where properties contains "addresses in" or properties contains "fail"
```

For example:

[dnc-query-sample](https://dataexplorer.azure.com/clusters/aksccplogs.centralus/databases/AKSccplogs?query=H4sIAAAAAAAAA3WQT0vDQBDF74V+h2FPLdSy/V+VHEQqeGgpNCdvm83TRpPduDu1Dfjh3VRKoijM6TG/N29eDqb3A1y1UQV8qTQoIjGfyvlE6mS2mCwXUynlaInn68VI3HY7+YV4cLYIy6licFagJ8ZyPLmSYebxWN7Iep5Ev43E9l9g1AYOJrOG7q1hZ/NtrgxWHzDsB39oG2t2e4vEnoi6nU867uFAWwedecThzo5VUVICPgKGek324fCSqt8idYj3Yl1FUSgiNVqQdT9Fh4B51t9RcjjR0KapMfpVbL1UOvsKzRQ/rle7+G69HdRSCccZfOPSaFRfUZnxJPwhMaFIrYJZxhXhpIEU6fm6t44pqRpjSuH1+S1Wb6DZF8VDstXpAQAA)

```sql
let queryNamespace = "{CLUSTER_CCPNAMESPACE}";
let queryFrom = datetime("2023-03-06T20:00:00Z");
let queryTo = datetime("2023-03-06T21:00:00Z");
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp between (queryFrom .. queryTo) 
| where category == "dnc" or category == "requestcontroller"
| where namespace == "queryNamespace"
| project TIMESTAMP, properties
| where properties contains "subnet capacity exceeded"
| sort by TIMESTAMP desc 
| take 5
```

![Image showing the results of the DNC Kusto query that indicates the subnet used for pod IP allocation is out of space.](/.attachments/image-340f4c1d-be77-476c-84b5-18f5807bb32e.png)

We can also check the assignation status:

[dnc-query-sample2](https://dataexplorer.azure.com/clusters/aksccplogs.centralus/databases/AKSccplogs?query=H4sIAAAAAAAAA3WQT0sDMRTE74V+h0dOLWib/q9KDyIVPLQUuidv2WS00d1kTVLbBT+82UrZVSq80zC/N8NkCPSxhyvXIocvhAQtiE3HfDriMp3MRvPZmHM+mOPlZjZgd+1WdiYenc2jWYmAoHN02JAPR9c83jQZ8lte3TPrNpHE/gsMmsDeaGvowZrgbLbJhMHyEyb4qwva2prtziK1R6J264sOOzjQxkFqjyTmbIPIC0oRDoChTt291zu36jZIGeu9WlfSIg6hjGRk3W/RIWI+yJ8qGRyraVPPuPgzbGUqnH2DDJQ8rZbb5H61uaqkAi5o+Har3z//qVWqcoQ2npjfpyZOKUV8p0NJOEpAQTXyL3JCKQfvo6bNyeutC5SWdQ1S8PI0QhDvoMk3P+L/0RcCAAA=)

```sql
let queryNamespace = "{CLUSTER_CCPNAMESPACE}";
let queryFrom = datetime("2023-03-06T20:00:00Z");
let queryTo = datetime("2023-03-06T21:00:00Z");
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp between (queryFrom .. queryTo) 
| where category == "dnc" or category == "requestcontroller"
| where namespace == "queryNamespace"
| project TIMESTAMP, properties
//| where properties contains "subnet capacity exceeded"
| where properties contains "addresses in"
| sort by TIMESTAMP desc 
| take 5
```

![Image showing the results of the DNC Kusto query that indicates the subnet has a specific IP count currently in use out of the overall subnet CIDR.](/.attachments/image-abc57fc0-b88f-42b2-9fb5-1d20aaa4b15e.png)

From there we can see that 55 addresses have been allocated from the subnet 10.241.0.0/26 that has a total of 62 IPs - the GW IP (10.241.0.1) - broadcast address == 60.
Since nodes can only request in batches of 16 IPs, node of the nodes will be able to request more IPs.

Another issue that can affect the pod subnet IPs availability is when the pod subnet is being shared with multiple clusters. We can use the following Kusto query to review that:

[Sample query for podsubnet use in multiple nodepools](https://dataexplorer.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAA3WQQWsCMRCF7%2F6K1JNCs0l21e4eWvBQigdF0HvJJlGDmtnOJNpKf3zXKsWDvQwM75s3vDdeuxDnALtF0A1tIHa%2B2XHj0LHlZPq6WI6nc%2FbC9Bp6yvb%2FtAbsItXBxYllBkLUPhDrCko1GfRN9BBI1KXJh0NZ8Cp%2FqvlAFxUvq1HOy1WrFIXVlXQCHUFC494QUkNCn5B%2FaL7%2F5FKWih9xy43huG54%2B4xLJRqEg7cOSUy9QSBYxWzm4hFwKw4eY9K76%2Fqf2eHqRL8B7lJSnUE6g3pLXA66HSHuZX94Zl0ls1yqrFDZaCDy0QWltN9r9CfHrIEUYs%2FbPqu%2Fbo9vLC%2FMu7dt1aot2XqKPpjIzC5RdDjTe%2FfIQjt%2FAEJoCTevAQAA)

```sql
cluster("Aks").database("AKSprod").AgentPoolSnapshot
| where TIMESTAMP > ago(1d)
| where podSubnetId != ""
| summarize dcount(id) by podSubnetId
| where dcount_id > 1
```

Alternate query:

```sql
AgentPoolSnapshot
| where TIMESTAMP > ago(1d)
| where podSubnetId contains "<customer-subnet-resource-id>"
//| where podSubnetId != "10.201.31.64/26"
//| summarize dcount(id) by podSubnetId
//| where dcount_id > 1
| distinct clusterName, name
```

```sql
cluster("Aks").database("AKSprod").AgentPoolSnapshot
| where TIMESTAMP > ago(2d)
| where podSubnetId contains "{POD_SUBNET_URI}"
| summarize dcount(id) by resource_id, name
```

### Applens detector

There is an Applens detector that can help diagnose this issue, it is called "Pod Subnet Full". For example:

![AppLens detector for a Pod Subnet is Full condition.](/.attachments/image-fd1aa0a3-9800-466b-87f5-55ab0fa9ef09.png)

### Resource health dashboard

We can also check on the Resource health dashboard <https://portal.microsoftgeneva.com/health> at the specific region for subnet full alerts. For example:

![Geneva dashboard for monitoring health by underlay, including events where the DNC would report subnet is full.](/.attachments/image-971441fa-460a-4db7-96a3-446a4ad4cede.png)

### ASI Support ticket insights

Another place where we can look for subnet full error is with the ASI support ticket insights (`https://asi.azure.ms/services/Compute%20Supportability/pages/Support%20Tickets?supportId=<SUPPORT_TICKET_NUMBER>`), just have to replace `<SUPPORT_TICKET_NUMBER>` with the corresponding support case number. For example:

![ASI Support Ticket Insights page, with the insights table filtered to show the SubnetFull event.](/.attachments/image-8dfb2b76-65d3-49d3-aff5-d392326acc7a.png)

### How to mitigate the issue if the pod subnet is full

When the Pod subnet is full or the nodes are not able to get any more IPs request due to not enough IPs available in the subnet, the simplest thing is to reduce the amount of pods if possible. Another option is to create a new pod subnet on the same VNET, and then create a new node pool using this new Pod subnet.

## References

- Public doc: [https://learn.microsoft.com/en-us/azure/aks/configure-azure-cni-dynamic-ip-allocation](https://learn.microsoft.com/en-us/azure/aks/configure-azure-cni-dynamic-ip-allocation)
- Internal doc: [Swift-Azure-Cni](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg/swift-azure-cni)
- Metrics options: [https://github.com/Azure/azure-container-networking/tree/master/cns/doc/examples/metrics](https://github.com/Azure/azure-container-networking/tree/master/cns/doc/examples/metrics)
- High level architecture: [AKS on Swift high level architercture](https://microsoft.sharepoint.com/:w:/r/teams/WAG/AzureNetworking/_layouts/15/Doc.aspx?sourcedoc=%7BBDEA2781-97D8-45A6-A6C6-17E21ECAB4C4%7D&file=AKS_on_Swift_HighLevelArchitecture.docx&action=default&mobileredirect=true)
- Azure Container Networking GitHub repo: <https://github.com/Azure/azure-container-networking/tree/master/cns/doc/examples/metrics>
- Azure CNS Grafana dashboard: <https://raw.githubusercontent.com/Azure/azure-container-networking/master/cns/doc/examples/metrics/grafana.json>

## Owner and Contributors

**Owner:** Carlos Luis Porras <Carlos.Porras@microsoft.com>
**Contributors:**

- Luis Alvarez <lualvare@microsoft.com>
