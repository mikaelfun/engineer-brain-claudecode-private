# AKS CNI 与 Overlay 网络 — azure-cni — 排查工作流

**来源草稿**: ado-wiki-a-Upgrade-to-Azure-CNI-Cilium-Supportability.md, ado-wiki-a-agic-pod-not-healthy.md, ado-wiki-a-aks-dynamic-pod-ip-allocation.md, ado-wiki-aks-cni-dynamic-ip-cns-prometheus-monitoring.md, ado-wiki-aks-ssh-helper-pod-node-access.md, ado-wiki-b-CLI-correlationID-to-useful-correlationID.md, ado-wiki-b-azure-cni-overlay.md, ado-wiki-byo-cni-with-aks.md, ado-wiki-c-VNet-Scaling-StaticBlock.md, ado-wiki-configuring-timezone-settings-for-a-pod.md, ado-wiki-create-azure-cni-transparent-mode-cluster.md, ado-wiki-d-Hubble-CLI.md, ado-wiki-hubble-relay-pod-tsg.md, ado-wiki-migrate-kubenet-to-cni-overlay-cilium.md, mslearn-packet-capture-pod-level.md, onenote-aks-upgrade-checklist.md, onenote-tcpdump-on-aks-pod.md
**Kusto 引用**: 无
**场景数**: 17
**生成日期**: 2026-04-07

---

## Scenario 1: Upgrade to Azure CNI Powered by Cilium suportability matrix and commands
> 来源: ado-wiki-a-Upgrade-to-Azure-CNI-Cilium-Supportability.md | 适用: 适用范围未明确

### 排查步骤

#### Upgrade to Azure CNI Powered by Cilium suportability matrix and commands


#### Introduction

There are always new IP assignment management (IPAM) modes and dataplane technology supporting Azure Kubernetes Service (AKS). This document targets existing AKS clusters which needs to upgrade to newer IPAM modes and dataplane cilium technology to access the latest features and supportability.
This document provides supportability matrix (IPAM and cilium Data plane) and commands for upgrading an existing AKS cluster to cilium dataplane, by first upgrading to Azure CNI overlay for IPAM modes and then upgrade to Azure CNI powered by Cilium as its dataplane.

#### IPAM and dataplane types in AKS

|| |
|----------------------------------|------------------------------------------------------------------|
|`IPAM(IP Assignment Mgmt) modes`|CNI node subnet (is legacy CNI), CNI overlay, CNI pod subnet, kubenet|
|`Data Plane`|Cilium, Non-Cilium(azure)|

#### Suportability Matrix ofIPAM and cilium Data plane

|`Upgrade to Azure CNI Powered by Cilium  - Supported cases`|
|----------------------------------|
|Upgrade from CNI node subnet(LEGACY CNI)  >> to  CNI  overlay  >>    to   cilium dataplane|
|Upgrade from Kubenet                                              >> to  CNI overlay    >>    to  cilium dataplane|
|Upgrade from CNI overlay                                        >> to  cilium dataplane|
|Upgrade from CNI pod subnet                                >> to  cilium dataplane|

| `Non-Supported cases`   |
|----------------------------------|
| Upgrade from CNI pod subnet                                >> to  CNI overlay  |

#### Commands to  Upgrade to Azure CNI Powered by Cilium from different IPAM modes

**Pre-requisite**: Use Azure CLI versions >= 2.48.1/cloud shell to execute the commands

##### Migrating from a kubenet cluster >>>  to CNI overlay >>>  to Az CNI powered by cilium

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

##### Migrating from Azure CNI pod subnet/CNI overlay cluster   >>> to Az CNI powered by cilium

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

#### Useful links

[Upgrade Azure CNI AKS](https://learn.microsoft.com/en-us/azure/aks/upgrade-azure-cni#upgrade-to-azure-cni-powered-by-cilium)
[Config CNI overlay]( https://learn.microsoft.com/en-us/azure/aks/azure-cni-overlay?tabs=kubectl)

#### Owner:  [Smita.Sulikal](mailto:smitasulikal@microsoft.com)

#### Owner and Contributors

**Owner:** Kavyasri Sadineni <ksadineni@microsoft.com>

**Contributors:**

- Kavyasri Sadineni <ksadineni@microsoft.com>
- Fabian Gonzalez Carrillo <Fabian.Gonzalez@microsoft.com>
- Smita Sulikal <smitasulikal@microsoft.com>

---

## Scenario 2: AGIC: Troubleshooting AGIC Pod Not Healthy
> 来源: ado-wiki-a-agic-pod-not-healthy.md | 适用: 适用范围未明确

### 排查步骤

#### AGIC: Troubleshooting AGIC Pod Not Healthy

#### Step 1: Describe the AGIC Pod

```bash
kubectl describe pod -l app=ingress-appgw -n kube-system
```

CSS: Use Jarvis Action → CustomerCluster - Run kubectl describe.

Check:
- **Pod status**: Should be "Running"
- **Container state**: Should be "Running" (check last state and exit code)
- **Pod conditions**: All should be "True"
- **Events**: Last event should be "Started container ingress-appgw-container"

#### Step 2: Check AGIC Pod Logs

```bash
kubectl logs -f -l app=ingress-appgw -n kube-system
```

For CrashLoopBackOff, check previous container logs:
```bash
kubectl logs -p -f -l app=ingress-appgw -n kube-system
```

CSS: Jarvis Action → CustomerCluster - Get pods log.

Look for:
- AGIC error codes (ref: AzureNetworking wiki/218967)
- AGIC/AppGW integration issues (see integration guide)

#### Common Issues

##### AGIC Pod Pending

Pod stuck in Pending = Kubernetes Scheduler cannot assign to a node (usually insufficient resources).

Check `kubectl describe` events for scheduler messages.
Ref: https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/#example-debugging-pending-pods

##### AGIC Pod Crashing/Unhealthy

If assigned to node but not Running:
1. Check last container exit code (common codes: https://komodor.com/learn/exit-codes-in-containers-and-kubernetes-the-complete-guide/)
2. Check pod logs for error/warning messages
3. Check integration issues (ARM connectivity, auth, AppGW state)

---

## Scenario 3: Troubleshooting Flow
> 来源: ado-wiki-a-aks-dynamic-pod-ip-allocation.md | 适用: 适用范围未明确

### 排查步骤

##### How can we check the current IP allocation

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

##### Retrieving metrics from the azure-cns pods

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

##### Useful Kusto queries

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

##### Applens detector

There is an Applens detector that can help diagnose this issue, it is called "Pod Subnet Full". For example:

![AppLens detector for a Pod Subnet is Full condition.](/.attachments/image-fd1aa0a3-9800-466b-87f5-55ab0fa9ef09.png)

##### Resource health dashboard

We can also check on the Resource health dashboard <https://portal.microsoftgeneva.com/health> at the specific region for subnet full alerts. For example:

![Geneva dashboard for monitoring health by underlay, including events where the DNC would report subnet is full.](/.attachments/image-971441fa-460a-4db7-96a3-446a4ad4cede.png)

##### ASI Support ticket insights

Another place where we can look for subnet full error is with the ASI support ticket insights (`https://asi.azure.ms/services/Compute%20Supportability/pages/Support%20Tickets?supportId=<SUPPORT_TICKET_NUMBER>`), just have to replace `<SUPPORT_TICKET_NUMBER>` with the corresponding support case number. For example:

![ASI Support Ticket Insights page, with the insights table filtered to show the SubnetFull event.](/.attachments/image-8dfb2b76-65d3-49d3-aff5-d392326acc7a.png)

##### How to mitigate the issue if the pod subnet is full

When the Pod subnet is full or the nodes are not able to get any more IPs request due to not enough IPs available in the subnet, the simplest thing is to reduce the amount of pods if possible. Another option is to create a new pod subnet on the same VNET, and then create a new node pool using this new Pod subnet.

---

## Scenario 4: AKS Azure CNI Dynamic IP Allocation & CNS Metrics Monitoring
> 来源: ado-wiki-aks-cni-dynamic-ip-cns-prometheus-monitoring.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Azure CNI Dynamic IP Allocation & CNS Metrics Monitoring

#### Summary

Azure CNI Dynamic IP Allocation (Swift) provides better IP management by allocating pod IPs from a dedicated pod subnet, separate from node IPs. This guide covers the architecture, IP allocation mechanism, monitoring with Prometheus/Grafana, and troubleshooting pod subnet exhaustion.

#### Key Components

- **DNC** (Delegated Network Controller): deployed on cluster CCP
- **CNS** (Container Network Service): daemonset deployed on cluster nodes

#### IP Allocation Mechanism

- IPs are allocated to nodes in **batches of 16**
- Nodes request 16 IPs on startup, request another batch when < 8 IPs unallocated
- Not possible to allocate IPs one-by-one (by design)
- Pod subnet can be shared across different nodes and clusters on the same VNet

#### Checking IP Allocation

##### Using kubectl

```bash
#### List NodeNetworkConfig objects (one per node)
kubectl -n kube-system get nnc

#### Describe specific node's NNC
kubectl -n kube-system describe nnc <NODE_NAME>

#### Check pod IPs assigned from pod subnet on a specific node
kubectl get po -o wide -A | grep <NODE_NAME> | grep '<POD_SUBNET_NETWORK>'
```

##### Using azure-cns Metrics

azure-cns pods expose metrics on `:10092/metrics`:

```bash
#### Get azure-cns pod IPs
kubectl -n kube-system get po -l k8s-app=azure-cns -o wide

#### Query metrics from a node or test pod
curl -s <AZURE-CNS_POD_IP>:10092/metrics | grep 'cx_ipam_'
```

Key metrics:
- `cx_ipam_available_ips` — IPs reserved but not assigned to Pods
- `cx_ipam_pod_allocated_ips` — IPs assigned to Pods
- `cx_ipam_total_ips` — Total IPs reserved from Subnet
- `cx_ipam_max_ips` — Maximum IPs the Node can reserve
- `cx_ipam_batch_size` — Batch size for IP allocation

#### Prometheus + Grafana Setup

##### Install kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

Create `values.yaml`:
```yaml
prometheus:
  prometheusSpec:
    podMonitorSelectorNilUsesHelmValues: false
    probeSelectorNilUsesHelmValues: false
    ruleSelectorNilUsesHelmValues: false
    serviceMonitorSelectorNilUsesHelmValues: false
```

```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace -f values.yaml
```

##### PodMonitor for azure-cns

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: azure-cns
  namespace: kube-system
spec:
  podMetricsEndpoints:
  - port: metrics
  selector:
    matchLabels:
      k8s-app: azure-cns
```

Verify with Prometheus query: `count ({job="kube-system/azure-cns"}) by (__name__)`

##### Grafana Dashboard

Import from: https://raw.githubusercontent.com/Azure/azure-container-networking/master/cns/doc/examples/metrics/grafana.json

> Note: Current Grafana template does not handle multiple Pod CIDRs correctly.

#### Kusto Queries for DNC Logs

##### Check address allocation issues

```kusto
let queryNamespace = "<CLUSTER_CCPNAMESPACE>";
let queryFrom = datetime("...");
let queryTo = datetime("...");
union ControlPlaneEvents, ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (queryFrom .. queryTo)
| where category == "dnc" or category == "requestcontroller"
| where namespace == queryNamespace
| project TIMESTAMP, properties
| where properties contains "addresses in" or properties contains "fail"
```

##### Check subnet capacity exceeded

```kusto
// Same base query, filter:
| where properties contains "subnet capacity exceeded"
| sort by TIMESTAMP desc
| take 5
```

##### Check shared pod subnet across clusters

```kusto
AgentPoolSnapshot
| where TIMESTAMP > ago(1d)
| where podSubnetId != ""
| summarize dcount(id) by podSubnetId
| where dcount_id > 1
```

#### Diagnostic Tools

- **AppLens**: "Pod Subnet Full" detector
- **Geneva Resource Health**: Check region-level subnet full alerts at https://portal.microsoftgeneva.com/health
- **ASI Support Ticket Insights**: https://asi.azure.ms — search by support ticket number for subnet full errors

#### Mitigation: Pod Subnet Full

1. Reduce pod count to release IPs
2. Create new pod subnet on same VNet with larger address space
3. Add new nodepool with `--pod-subnet-id` pointing to new subnet
4. Delete stuck ContainerCreating pods to reschedule on new nodepool

```bash
#### Create new subnet
az network vnet subnet create -g $NET_RG --vnet-name $VNET --name podsubnet2 --address-prefixes 10.242.0.0/24

#### Add nodepool with new pod subnet
az aks nodepool add --cluster-name $CLUSTER -g $RG -n nodepool2 \
  --max-pods 250 --node-count 2 \
  --vnet-subnet-id $NODE_SUBNET_ID \
  --pod-subnet-id $NEW_POD_SUBNET_ID

#### Reschedule stuck pods
for POD in $(kubectl get po | grep ContainerCreating | awk '{print $1}'); do kubectl delete po $POD; done
```

#### References

- Public doc: https://learn.microsoft.com/en-us/azure/aks/configure-azure-cni-dynamic-ip-allocation
- Internal doc: https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg/swift-azure-cni
- Metrics examples: https://github.com/Azure/azure-container-networking/tree/master/cns/doc/examples/metrics

---

## Scenario 5: Connecting to AKS Nodes through a Helper Pod
> 来源: ado-wiki-aks-ssh-helper-pod-node-access.md | 适用: 适用范围未明确

### 排查步骤

#### Connecting to AKS Nodes through a Helper Pod

#### Summary and Goals

This kubectl plugin script deploys a helper pod that facilitates a remote connection to another Node/Pod through SSH Private Key. It deploys a default nginx pod, installs OpenSSH, uploads the private key from local, and executes SSH connectivity.

#### Prerequisites

- A **bash** instance
- A working AKS cluster with **kubectl** configured
- AKS cluster installed with `--generate-ssh-key`
- Private key (`id_rsa`) available locally

#### Implementation

```bash
#!/bin/bash

#### Define the name of the SSH Pod
sshpod="sshpod2"
ssh_key="./id_rsa"
pod_image="nginx"

if [[ $# -ne 1 ]]; then
  echo "Usage: kubectl ssh_nodeshell <node-name>"
else
  # Getting the IP Address of the Node
  nodeIP=$(kubectl get node $1 -o wide | awk '{print $6}' | tail -n +2)
  echo "Connecting to $nodeIP"
  echo "Creating SSH Host Pod"
  kubectl run $sshpod --image=$pod_image
  echo "Waiting for Pod to be deployed"
  sleep 5
  kubectl exec -it $sshpod -- apt update
  echo "Install OpenSSH"
  kubectl exec -it $sshpod -- apt install ssh -y
  kubectl cp $ssh_key $sshpod:/tmp
  kubectl exec -it $sshpod -- ssh -o "StrictHostKeyChecking no" -i /tmp/id_rsa azureuser@$nodeIP
  echo "Done"
fi
```

Usage:
```bash
kubectl-sshnode <nodeName>
```

#### Involved Components

- nginx Pod
- OpenSSH
- SSH Private Key

---

## Scenario 6: Linking CLI correlation IDs to ARM correlation IDs
> 来源: ado-wiki-b-CLI-correlationID-to-useful-correlationID.md | 适用: 适用范围未明确

### 排查步骤

#### Linking CLI correlation IDs to ARM correlation IDs


#### Summary

Currently when you run a CLI operation the correlation ID is not associated directly with the PUT operation so finding the failure can be tricky.

Here's how you go from a CLI provided correlation ID on a GET to the needed PUT.

#### Details

Sample AKS attempt/failure

```bash
brett@Azure:~$ az group create -n tmp-aks-test -l westus2
 {
 "id": "/subscriptions/<>/resourceGroups/tmp-aks-test",
  "location": "westus2",
  "managedBy": null,
  "name": "tmp-aks-test",
   "properties": {
    "provisioningState": "Succeeded"
   },
   "tags": null
  }
brett@Azure:~$ az aks create -g tmp-aks-test -n tmp -s standard_b1ms
Deployment failed. Correlation ID: 997c163e-fa3b-4c73-837a-3e86bf0e9e26. Operation failed with status: 200. Details: Resource state Failed
```

This correlation ID is for a GET operation rather than the PUT we normally would work with in a create/update call.

```txt
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where correlationId == "{correlationID}"
| where TaskName != "HttpIncomingRequestStart"
| where PreciseTimeStamp between (datetime(2017-11-08)..datetime(2017-11-09))
| project operationName, targetUri, operationName, targetUri
```

Output: `GET/SUBSCRIPTIONS/PROVIDERS/MICROSOFT.CONTAINERSERVICE/LOCATIONS/OPERATIONS/ https://management.azure.com/subscriptions/<>/providers/Microsoft.ContainerService/locations/westus2/operations/b074b8c6-1139-41b5-9711-7a69b5c753a2?api-version=2016-03-30`

We can check the targetURI for the operation GUID that is being check and this is how we'll get to the PUT we need.

And here we can see the correlation ID for the PUT operation.

```txt
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where serviceRequestId == "{serviceRequestID}"
| where PreciseTimeStamp between (datetime(2017-11-08)..datetime(2017-11-09))
| project operationName, correlationId
```

Output: `PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.CONTAINERSERVICE/MANAGEDCLUSTERS/`

And then look up associated failures:

```txt
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","EventServiceEntries")
| where correlationId == "{correlationID}"
| where status == "Failed"
| where PreciseTimeStamp between (datetime(2017-11-08)..datetime(2017-11-09))
| project resourceUri, properties

resourceUri properties
 /subscriptions/<>/resourcegroups/tmp-aks-test/providers/Microsoft.ContainerService/managedClusters/tmp {"statusMessage":"{\"status\":\"Failed\",\"error\":{\"code\":\"ResourceOperationFailure\",\"message\":\"The resource operation completed with terminal provisioning state 'Failed'.\",\"details\":[{\"code\":\"ProvisioningInternalError\",\"message\":\"resources.DeploymentsClient#Get: Failure responding to request: StatusCode=404 -- Original Error: autorest/azure: Service returned an error. Status=404 Code=\\\"DeploymentNotFound\\\" Message=\\\"Deployment 'b074b8c6-1139-41b5-9711-7a69b5c753a2' could not be found.\\\"\"}]}}"}
```

In this case the error for this PUT is not too actionable. This is because like ACS AKS submits a deployment from the RP so the original correlation ID is not the correlation ID that is used for the deployment of the nested resources in AKS. Similar to How to get the ACS internal template correlation Id

To get the nested correlationID/deployment within Kusto you can use the following:

Still using our original operationID/serviceRequestID:

```txt
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where targetUri contains "{deployments/xxxxxxxx}"
| where httpMethod == "PUT"
| where TaskName != "HttpIncomingRequestStart"
| where PreciseTimeStamp between (datetime(2017-11-08)..datetime(2017-11-09))
| project operationName, correlationId, targetUri

operationName correlationId targetUri
 PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.RESOURCES/DEPLOYMENTS/ 68461f1a-ed06-406e-9071-730eb44fac3e https://management.azure.com/subscriptions/<>/resourcegroups/MC_tmp-aks-test_tmp_westus2/providers/Microsoft.Resources/deployments/b074b8c6-1139-41b5-9711-7a69b5c753a2?api-version=2016-09-01
```

Then check this correlation ID for something more actionable. This correlation ID would also be used for investigating other RPs involved in the create - CRP/NRP/SRP

```txt
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","EventServiceEntries")
| where correlationId == "68461f1a-ed06-406e-9071-730eb44fac3e"
| where status == "Failed"
| project resourceUri, properties

resourceUri properties
/subscriptions/<>/resourcegroups/MC_tmp-aks-test_tmp_westus2/providers/Microsoft.Resources/deployments/b074b8c6-1139-41b5-9711-7a69b5c753a2 {"statusCode":"BadRequest","serviceRequestId":null,"statusMessage":"{\"error\":{\"code\":\"InvalidTemplate\",\"message\":\"Deployment template validation failed: 'The provided value 'standard_b1ms' for the template parameter 'agentpool1VMSize' at line '1' and column '1765' is not valid. The parameter value is not part of the allowed value(s): 'Standard_A0,Standard_A1,Standard_A10,Standard_A11,Standard_A1_v2,Standard_A2,Standard_A2_v2,Standard_A2m_v2,Standard_A3,Standard_A4,Standard_A4_v2,Standard_A4m_v2,Standard_A5,Standard_A6,Standard_A7,Standard_A8,Standard_A8_v2,Standard_A8m_v2,Standard_A9,Standard_B1ms,Standard_B1s,Standard_B2ms,Standard_B2s,Standard_B4ms,Standard_B8ms,Standard_D1,Standard_D11,Standard_D11_v2,Standard_D11_v2_Promo,Standard_D12,Standard_D12_v2,Standard_D12_v2_Promo,Standard_D13,Standard_D13_v2,Standard_D13_v2_Promo,Standard_D14,Standard_D14_v2,Standard_D14_v2_Promo,Standard_D15_v2,Standard_D16_v3,Standard_D16s_v3,Standard_D1_v2,Standard_D2,Standard_D2_v2,Standar...
```

#### Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Luis Alvarez <lualvare@microsoft.com>
- Enrique Lobo Breckenridge <enriquelo@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Ines Monteiro <t-inmont@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>

---

## Scenario 7: Troubleshooting Flow
> 来源: ado-wiki-b-azure-cni-overlay.md | 适用: 适用范围未明确

### 排查步骤

Detailed troubleshooting flow with Kusto queries, CNI component explanations, and potential failure points:
https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg/azure-cni-overlay

---

## Scenario 8: AKS BYO CNI
> 来源: ado-wiki-byo-cni-with-aks.md | 适用: 适用范围未明确

### 排查步骤

#### AKS BYO CNI

[TOC]

---

#### PREFACE

This feature is for advanced customers, who want to manage the Pod Networking themselves. The support around this feature is limited.

#### Testing

Before setting up the Cluster and CNI, plan the IP addressing for the cluster. Because once the cluster is created, most of the networking parameters cannot be modified.

Ensure that you have the latest CLI version installed, or upgrade it before running the commands using `az upgrade`.

More details: <https://docs.microsoft.com/en-us/azure/aks/use-byo-cni?tabs=azure-cli#cluster-creation-steps>

##### Initial Values

```txt
Location:   eastus
Node Count:  1 (Using just 1 node count so that the configuration would be easy. Remember that setting up CNI will have to be done on all the worker nodes)
Service CIDR: 10.20.0.0/16 (Virtual range for the Services)
DNS Service IP: 10.20.0.10
```

##### Cluster Creation

```bash
az group create -l eastus -n cni-rg
az aks create -l eastus -n cni-cluster -g cni-rg --network-plugin none --node-count 1 --dns-service-ip 10.20.0.10 --service-cidr 10.20.0.0/16 --pod-cidr 10.25.0.0/16
```

##### CNI Installation

SSH to all worker nodes and configure networking:

```bash
#### Install OS dependencies
sudo apt-get update
sudo apt-get -y install socat conntrack ipset

#### Download binaries
wget -q --show-progress --https-only --timestamping https://github.com/containernetworking/plugins/releases/download/v0.9.1/cni-plugins-linux-amd64-v0.9.1.tgz https://storage.googleapis.com/kubernetes-release/release/v1.21.0/bin/linux/amd64/kube-proxy

#### Create Directories
sudo mkdir -p /etc/cni/net.d /opt/cni/bin /var/lib/kube-proxy

#### Install Binaries
sudo tar -xvf cni-plugins-linux-amd64-v0.9.1.tgz -C /opt/cni/bin/
chmod +x kube-proxy
sudo mv kube-proxy /usr/local/bin/

#### Configure CNI Networking
POD_CIDR=10.25.0.0/16

#### Create bridge network
cat <<EOF | sudo tee /etc/cni/net.d/10-bridge.conf
{
    "cniVersion": "0.4.0",
    "name": "bridge",
    "type": "bridge",
    "bridge": "cnio0",
    "isGateway": true,
    "ipMasq": true,
    "ipam": {
        "type": "host-local",
        "ranges": [
          [{"subnet": "${POD_CIDR}"}]
        ],
        "routes": [{"dst": "0.0.0.0/0"}]
    }
}
EOF

#### Create loopback interface
cat <<EOF | sudo tee /etc/cni/net.d/99-loopback.conf
{
    "cniVersion": "0.4.0",
    "name": "lo",
    "type": "loopback"
}
EOF

#### Configure kube-proxy
cat <<EOF | sudo tee /var/lib/kube-proxy/kube-proxy-config.yaml
kind: KubeProxyConfiguration
apiVersion: kubeproxy.config.k8s.io/v1alpha1
clientConnection:
  kubeconfig: "/var/lib/kube-proxy/kubeconfig"
mode: "iptables"
clusterCIDR: "10.25.0.0/16"
EOF

#### Create kube-proxy.service file
cat <<EOF | sudo tee /etc/systemd/system/kube-proxy.service
[Unit]
Description=Kubernetes Kube Proxy
Documentation=https://github.com/kubernetes/kubernetes
[Service]
ExecStart=/usr/local/bin/kube-proxy \\
  --config=/var/lib/kube-proxy/kube-proxy-config.yaml
Restart=on-failure
RestartSec=5
[Install]
WantedBy=multi-user.target
EOF

#### Start the Service
sudo systemctl daemon-reload
sudo systemctl enable kube-proxy
sudo systemctl start kube-proxy
```

##### Validation

Node should be in `Ready` state and all pending Pods should be deployed.

##### DNS Resolution issue from the Pods

Issue: DNS Resolution fails inside pods. `nslookup` returns `reply from unexpected source` with pod IP instead of expected kube-dns ClusterIP.

**Solution**: Load `br_netfilter` kernel module:

```bash
sudo modprobe br_netfilter
sudo sh -c 'echo "br_netfilter" > /etc/modules-load.d/br_netfilter.conf'
```

This module is required to enable transparent masquerading and to facilitate VxLAN traffic for communication between Kubernetes pods across the cluster.

---

## Scenario 9: Vnet Scaling (StaticBlock)
> 来源: ado-wiki-c-VNet-Scaling-StaticBlock.md | 适用: 适用范围未明确

### 排查步骤

#### Vnet Scaling (StaticBlock)


#### Overview
Azure CNI VNet Scale improves Azure CNI VNet Scaling limitation. Due to an Azure IP address mapping limitation, Azure CNI VNet has a limit of 64,000 addresses per VNet. While current VNet options are limited by Azure Routing's 64k address mapping limit, Vnet Scale gets around this by assigning Route maps to blocks of IP's rather than individual IPs and brings the potential scale up to a million pods. It is expected that this would only be needed/used on very large clusters.

Azure CNI Swift-StaticBlock (Vnet Scale) is the feature for an overlay network space (similar to Azure Swift CNI) that uses Azure CNI as the network-plugin but uses a feature from the networking team called "Routing Domains". These routing domains will route traffic destined for a pod to the appropriate node by associating the CIDR block the pod belongs to and using the CIDR block route tables to route the traffic correctly. This feature uses the same components as PodSubnet/SWIFT and Overlay (DNC/DNC-RC/CNS/Subnet Hanlder/DNC cleanup service).

#### Usage

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

#### Troubleshooting

#### Swift components

Azure CNI Swift StaticBlock uses the same components from Swift (podsubnet). These include CNS (which runs on the customers nodes as a daemonset) and DNC/DNC-RC which run in the CCP.

For more information and troubleshooting steps, including Kusto queries, please refer to the following TSG: https://eng.ms/docs/cloud-ai-platform/azure-core/azure-networking/sdn-dbansal/azure-container-networking/azure-container-networking-tsgs/tsgs/aks-swift/prereqs

#### Control Plane

If there is a control plane failure for a swift-staticBlock cluster, there are 2 places to check:

##### Subnet-Hanlder

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

##### Node Labels

If nodes are being created, ensure the correct node labels are being applied. CNI Swift - StaticBlock clusters should have the following 2 labels

```
kubernetes.azure.com/podnetwork-type: vnetblock
kubernetes.azure.com/podnetwork-delegationguid: 3726bc87-ad70-4314-b068-6a69dfae84cd
```
**The podnetwork-delegationguid should match the VNet resource GUID of the podSubnet associated with this agentpool**.

#### Data Plane

##### Pods stuck in ContainerCreating

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


#### Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>

---

## Scenario 10: Configuring timezone settings for a pod
> 来源: ado-wiki-configuring-timezone-settings-for-a-pod.md | 适用: 适用范围未明确

### 排查步骤

#### Configuring timezone settings for a pod

#### Context

Customers often ask about how to change the timezone on their AKS cluster nodes. Even though it is technically possible to change the timezone on worker nodes, this would cause worker nodes to use a different timezone from the one used by the master nodes, and so it would break the AKS cluster.

The customer's real goal is usually to change the timezone used by their workloads (containers), which is also the timezone displayed in container logs. So it is usually enough to change the timezone used by the pods instead of the nodes themselves.

**NOTE: This applies only to Linux based PODs. Until now we haven't found a way to achieve the same on Windows based images.**

#### Option 1: TZ Environment Variable

Set 'TZ' environment variable at POD definition:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-dif-timezone
spec:
  containers:
  - name: nginx-dif-timezone
    image: nginx
    env:
    - name: TZ
      value: "America/New_York"
```

#### Option 2: Volume Mount /etc/localtime

Mount the appropriate timezone file from the host node:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: alpine
spec:
  containers:
  - name: alpine
    image: alpine
    volumeMounts:
    - name: timezone-config
      mountPath: /etc/localtime
  volumes:
    - name: timezone-config
      hostPath:
        path: /usr/share/zoneinfo/Asia/Kolkata
```

#### Option 3: k8tz Admission Controller

Deploy k8tz to inject timezones into Pods and CronJobs:

```bash
helm repo add k8tz https://k8tz.github.io/k8tz/
helm install k8tz k8tz/k8tz --set timezone=Europe/London
```

CLI usage:

```bash
#### to a file
k8tz inject --strategy=hostPath test-pod.yaml > injected-test-pod.yaml

#### or directly to kubectl
k8tz inject --timezone=Europe/London test-pod.yaml | kubectl apply -f -

#### inject to all existing deployments in current namespace
kubectl get deploy -oyaml | k8tz inject - | kubectl apply -f -
```

NOTE: The injection process is idempotent.

#### Check Available Timezones

List contents of `/usr/share/zoneinfo/` on the worker node.

---

## Scenario 11: Troubleshooting Flow
> 来源: ado-wiki-create-azure-cni-transparent-mode-cluster.md | 适用: 适用范围未明确

### 排查步骤

##### 1. Register preview feature

```bash
az feature register --namespace "Microsoft.ContainerService" --name "AKSNetworkModePreview"
az feature list -o table --query "[?contains(name, 'Microsoft.ContainerService/AKSNetworkModePreview')].{Name:name,State:properties.state}"
```

##### 2. Create resource group, VNet and subnet

##### 3. Get bearer token

```bash
az account get-access-token --query accessToken -o tsv
```

##### 4. Send PUT request via Postman or REST client

URI: `https://<region>.management.azure.com/subscriptions/<subId>/resourceGroups/<rgName>/providers/Microsoft.ContainerService/managedClusters/<clusterName>?api-version=2020-11-01`

Key payload section — networkProfile must include `"networkMode": "transparent"`:

```json
{
  "networkPlugin": "azure",
  "serviceCidr": "10.2.0.0/24",
  "dnsServiceIP": "10.2.0.10",
  "dockerBridgeCidr": "172.17.0.1/16",
  "outboundType": "loadBalancer",
  "loadBalancerSku": "standard",
  "networkMode": "transparent"
}
```

##### 5. Verify cluster

Switch request to GET with same URI to confirm cluster creation and networkMode.

---

## Scenario 12: Troubleshooting Flow
> 来源: ado-wiki-d-Hubble-CLI.md | 适用: 适用范围未明确

### 排查步骤

##### 0. Check that Retina/Cilium Pod is running

Non-cilium cluster:
```shell
kubectl get pods -n kube-system -l k8s-app=retina
```

Cilium cluster:
```shell
kubectl get pods -n kube-system -l k8s-app=cilium
```

##### 1. Check Hubble Resources

![](../../images/network-observability/hubble-resources.png)

#### 1.1. Check Hubble Relay Pod

See [troubleshooting steps for Hubble Relay](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Monitoring/Network-Observability-\(Kappie\)/Advanced/Hubble-Relay).

#### 1.2. Check that the TLS secrets exist

```shell
kubectl get secrets -n kube-system | grep hubble
```

There should be the three secrets in image above.

Note when they were created. They must be less than 1095 days old.

##### 2. Acquire secrets

***Obtain secrets with discretion***. See our public documentation ([aka.ms/acns](https://aka.ms/acns)) for more info.

##### 3. Make sure Hubble CLI is configured

Config needs the following values:
- `tls: true`
- `tls-server-name: instance.hubble-relay.cilium.io`
- tls cert files set to correct paths

```shell
hubble config view
```

![](../../images/network-observability/hubble-config-view.png)

See our public documentation ([aka.ms/acns](https://aka.ms/acns)) for how to set these.

---

## Scenario 13: Troubleshooting Flow
> 来源: ado-wiki-hubble-relay-pod-tsg.md | 适用: 适用范围未明确

### 排查步骤

##### Check Hubble Relay Pod

Check that the Hubble Relay pod is running:

```shell
kubectl get po -n kube-system | grep hubble-relay
```

##### Pod Restarts

If there have been restarts, get previous logs:

```shell
kubectl logs --timestamps -p -n kube-system <hubble-relay pod>
```

Sometimes Hubble Relay Pod restarts when failing to receive peer change notification. This is OK if it is intermittent:

```
level=warning msg="Error while receiving peer change notification; will try again after the timeout has expired" connection timeout=30s error="rpc error: code = Unavailable desc = error reading from server: read tcp 10.224.1.235:56358->10.0.197.139:80: read: connection reset by peer" subsys=hubble-relay
...
level=info msg="Stopping server..." subsys=hubble-relay
level=warning msg="Error while receiving peer change notification; will try again after the timeout has expired" connection timeout=30s error="rpc error: code = Canceled desc = context canceled" subsys=hubble-relay
level=info msg="Server stopped" subsys=hubble-relay
```

##### Pod is Running

If the Pod is running, get current logs to check for issues. Look for warnings, errors, etc.:

```shell
kubectl logs --timestamps -n kube-system <hubble-relay pod>
```

#### Check that the Pod is Discovering Nodes

You should see logs like the following for all the nodes. Note the "address" (node IP) and "name" (node name like aks-nodepool1-22539176-vmss000001):
```
level=info msg="Received peer change notification" change notification="name:\"hgregory-04-30-euap2/aks-nodepool1-22539176-vmss000001\" address:\"10.224.0.4\" type:PEER_ADDED tls:{server_name:\"aks-nodepool1-22539176-vmss000001.hgregory-04-30-euap2.hubble-grpc.cilium.io\"}" subsys=hubble-relay
level=info msg="Received peer change notification" change notification="name:\"hgregory-04-30-euap2/aks-nodepool1-22539176-vmss000003\" address:\"10.224.1.246\" type:PEER_ADDED tls:{server_name:\"aks-nodepool1-22539176-vmss000003.hgregory-04-30-euap2.hubble-grpc.cilium.io\"}" subsys=hubble-relay
level=info msg="Received peer change notification" change notification="name:\"hgregory-04-30-euap2/aks-nodepool1-22539176-vmss000000\" address:\"10.224.0.253\" type:PEER_ADDED tls:{server_name:\"aks-nodepool1-22539176-vmss000000.hgregory-04-30-euap2.hubble-grpc.cilium.io\"}" subsys=hubble-relay
```

---

## Scenario 14: How to Migrate AKS Cluster from Kubenet with Calico to Azure CNI Overlay with Cilium
> 来源: ado-wiki-migrate-kubenet-to-cni-overlay-cilium.md | 适用: 适用范围未明确

### 排查步骤

#### How to Migrate AKS Cluster from Kubenet with Calico to Azure CNI Overlay with Cilium

#### Prerequisites

- Azure CLI installed
- Contributor or Owner role on the AKS cluster and resource group
- No active workloads that cannot tolerate node pool changes

#### Migration Steps

##### Step 1: Validate Current Configuration

```bash
az aks show --resource-group <RG> --name <CLUSTER> \
  --query "{networkPlugin:networkProfile.networkPlugin, networkPolicy:networkProfile.networkPolicy}"
```

##### Step 2: Disable Calico (CRITICAL)

> **Important:** Migration WILL FAIL if Calico is not disabled first.

```bash
az aks update --resource-group <RG> --name <CLUSTER> --network-policy none
```

This removes Calico pods and DaemonSets but **does not remove CRDs**. If CRDs remain, delete them manually after confirming all Calico/tigera-operator pods are gone.

Reference: https://learn.microsoft.com/en-us/azure/aks/use-network-policies#uninstall-azure-network-policy-manager-or-calico

##### Step 3: Migrate to Azure CNI Overlay

```bash
az aks update --resource-group <RG> --name <CLUSTER> \
  --network-plugin azure --network-plugin-mode overlay
```

##### Step 4: Apply Cilium Network Policy (Optional)

```bash
az aks update --resource-group <RG> --name <CLUSTER> --network-policy cilium
```

#### Verification

```bash
az aks show --resource-group <RG> --name <CLUSTER> \
  --query "{networkPlugin:networkProfile.networkPlugin, networkPolicy:networkProfile.networkPolicy}"
```

#### Key Observations

- Migration fails if networkPolicy=calico is enabled during upgrade
- CRDs remain after uninstall; manual cleanup may be required
- Successful migration when: networkPolicy=None → networkPlugin=azure with overlay mode in one step
- Ensure workloads are running on new node pools before deleting old ones

#### References

- https://learn.microsoft.com/en-us/azure/aks/upgrade-azure-cni#upgrade-to-azure-cni-overlay
- https://learn.microsoft.com/en-us/azure/aks/use-network-policies#uninstall-azure-network-policy-manager-or-calico

---

## Scenario 15: Troubleshooting Flow
> 来源: mslearn-packet-capture-pod-level.md | 适用: 适用范围未明确

### 排查步骤

##### 1. Identify the pod

```bash
kubectl get pods -A
#### or for specific namespace:
kubectl get pods -n <namespace>
```

##### 2. Connect to the pod

```bash
kubectl exec <pod-name> -it -- /bin/bash
```

##### 3. Install tcpdump (if needed)

```bash
#### Debian/Ubuntu based
apt-get update && apt-get install tcpdump

#### Alpine based
apk add tcpdump
```

##### 4. Capture packets

```bash
tcpdump -s 0 -vvv -w /capture.cap
```

##### 5. Copy capture file to local

```bash
#### Exit the pod shell first, then:
kubectl cp <pod-name>:/capture.cap capture.cap
```

---

## Scenario 16: AKS 升级注意事项与最佳实践
> 来源: onenote-aks-upgrade-checklist.md | 适用: Mooncake ✅

### 排查步骤

#### AKS 升级注意事项与最佳实践

> **来源**: MCVKB 18.34 | 日期: 2021-12-09 (更新 2024-12-17)
> **适用**: Mooncake AKS 所有版本

---

#### 升级前检查清单

##### 1. 版本选择
- 查看 [AKS Kubernetes 发布日历](https://docs.microsoft.com/zh-cn/azure/aks/supported-kubernetes-versions#aks-kubernetes-release-calendar)
- **不要跨版本升级**（如 1.18 → 1.20，应逐步升级）
- 支持策略：N-2 及以上版本在支持范围内；低于 N-3 无法获得支持
- N+2 版本 GA 后，第 N 个版本进入 EOS

##### 2. 资源检查
```bash
kubectl top nodes
kubectl top pods --all-namespaces
```
- 资源占用 **>80%** → 先 `kubectl scale` 或手动 scale up 一个节点再升级

##### 3. IP 地址检查（Azure CNI）
```bash
#### 确认剩余 IP 数量足够（升级过程中节点 surge）
#### 参考：https://docs.azure.cn/zh-cn/aks/configure-azure-cni#plan-ip-addressing-for-your-cluster
```

##### 4. PodDisruptionBudget（PDB）
```bash
kubectl get poddisruptionbudgets --all-namespaces
#### 如有 PDB，升级前先临时删除，升级完再恢复
```

##### 5. Subscription Quota
- 确认 vCPU / 公共 IP 等 quota 足够（surge 节点需要额外资源）

##### 6. Container Runtime 变更（1.19.11）
- 从 1.19.11 之前升级到 1.19.11+ → containerd 替换 Docker
- 参考：[容器运行时配置](https://docs.azure.cn/zh-cn/aks/cluster-configuration#container-runtime-configuration)

---

#### 升级命令

##### 单节点池集群
```bash
az aks upgrade \
  --resource-group <RG> \
  --name <ClusterName> \
  --kubernetes-version <target-version>
```

##### 多节点池集群
```bash
#### 1. 先升级 control plane
az aks upgrade --resource-group <RG> --name <ClusterName> \
  --kubernetes-version <target-version> --control-plane-only

#### 2. 逐个升级 node pool
az aks nodepool upgrade \
  --resource-group <RG> --cluster-name <ClusterName> \
  --name <nodepoolName> --kubernetes-version <target-version>
```

---

#### 升级后验证

```bash
kubectl get nodes
kubectl get pods --all-namespaces | grep -v Running
```

---

#### 参考链接

- [升级 AKS 集群](https://docs.microsoft.com/zh-cn/azure/aks/upgrade-cluster)
- [升级节点池](https://docs.microsoft.com/zh-cn/azure/aks/use-multiple-node-pools#upgrade-a-node-pool)
- [AKS 支持的 Kubernetes 版本](https://docs.microsoft.com/zh-cn/azure/aks/supported-kubernetes-versions)

---

## Scenario 17: Troubleshooting Flow
> 来源: onenote-tcpdump-on-aks-pod.md | 适用: Mooncake ✅

### 排查步骤

1. **Identify target node**: `kubectl get pods -o wide` to find which node the pod runs on

2. **Enter node shell**: `kubectl node-shell <node-name>` or `kubectl debug node/<node-id> -it --image=mcr.azk8s.cn/aks/fundamental/base-ubuntu:v0.0.11` then `chroot /host`

3. **Find container ID**: `crictl ps` — find the target pod's container ID (first column)

4. **Get PID**:
   ```bash
   crictl inspect --output go-template --template '{{.info.pid}}' <container-id>
   ```

5. **Enter pod network namespace**:
   ```bash
   nsenter -n -t <PID>
   ```

6. **Change to writable directory** (avoid permission denied):
   ```bash
   cd /var/tmp
   ```

7. **Start capture**:
   ```bash
   tcpdump -i eth0 port 3306 -w capture.pcap
   ```

---
