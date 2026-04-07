---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Tools/Kusto/Audit query with Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Tools/Kusto/Audit%20query%20with%20Kusto"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Kube-Audit logs in Kusto

[[_TOC_]]

## Overview

### What is Kubernetes audit log

Reference: [https://kubernetes.io/docs/tasks/debug-application-cluster/audit/]

Currently in Kusto we have audit policy as RequestResponse.

### Why should we care

Audit log is a good place to identify Kubernetes cluster's historical activity on API level.

It can help us to track down events to understand Kubernetes behavior.

In some cases, Kubernetes can have by-design behavior that doesn't meet customer expectation, or have issues where it doesn't behave as expected. We can provide ground truth to customer to explain the by-design behavior.

### Limitation

* Performance monitoring data works through metric-server and kubelet API, API resources are not involved.
* Audit may not available for all kind of resources according to how the logs are collected.

## Scenarios

### Basics

For a basic query that shows the time, requesting resource URI, verb as per [Kubernetes API resource operations](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/#resource-operations), user information and a complete log for further information.

```txt
cluster("akshuba.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp between (datetime(<starttime>) .. datetime(<endtime>))
| where resourceId has '{AKS_resource_id}'
| where category == 'kube-audit'
| extend Pod = extractjson('$.pod', properties, typeof(string))
| extend Log = extractjson('$.log', properties , typeof(string))
| extend _jlog = parse_json(Log)
| extend requestURI = tostring(_jlog.requestURI)
| extend verb = tostring(_jlog.verb)
| extend user = tostring(_jlog.user.username)
| where verb !in ('get', 'list', 'watch')
//***** basics 
| project PreciseTimeStamp, requestURI, verb, user, Log
| take 100
```

Note that log storage location of ccp logs has been changed from

* [aks](https://aks.kusto.windows.net/) to
* [aksccplogs.centralus](https://aksccplogs.centralus.kusto.windows.net/), then to
* [HubA](https://akshuba.centralus.kusto.windows.net/). The original cluster still works, because the original tables are replaced with functions linking to the new cluster for compatibility. Latest tables will have longer retention for ccp logs.

Latest tables:

| Cluster | Environment | Geography |
|--|--|--|
| [HubIntv2](https://akshubintv2.eastus.kusto.windows.net/) | INTv2 | All |
| [HubA](https://akshuba.centralus.kusto.windows.net/) | Production | All |
| [HubB](https://akshubb.westus3.kusto.windows.net/) | Production | All |
| [HubEUA](https://akshubeua.westeurope.kusto.windows.net/) | Production | EU |
| [HubEUB](https://akshubeub.northeurope.kusto.windows.net/) | Production | EU |

For public cloud, HubA/HubB should behave the same.

Example:

![image.png](/.attachments/image-0dfe7f1b-0ee8-4103-8408-26102c5dee67.png)

### Deployment Replicas

Append the following code right behind the basic query, and command the "***** basics" section

```txt
//***** deployment query
| where properties has @'\/deployments'
| where properties has 'coredns' // coredns for example
| extend replicas = _jlog.responseObject.status.replicas
| extend readyReplicas = _jlog.responseObject.status.readyReplicas
| extend unavailableReplicas = _jlog.responseObject.status.unavailableReplicas
| project PreciseTimeStamp, requestURI, verb, user, replicas, readyReplicas, unavailableReplicas, Log
| take 100
```

Example:

![audit deployment](../../../.attachments/aks-audit-deployment.png)

To switch between different code sections, simply select and use `Ctrl` + `/`

![image.png](/.attachments/image-cc466401-4f6a-4e07-bd58-d5eb19f92708.png)
![image.png](/.attachments/image-3f7b3595-226a-489a-95c4-ad32bdff7c22.png)
![image.png](/.attachments/image-75053c5f-c4d0-4ab0-8270-184567459f10.png)

### Pod Status

```txt
//***** pod status
| where properties has @'\/pods'
| where properties has 'coredns' // coredns for example
| mv-expand podCond = _jlog.requestObject.status.conditions
| extend ownerType = tostring(_jlog.requestObject.metadata.ownerReferences[0].kind)
| extend ownerName = tostring(_jlog.requestObject.metadata.ownerReferences[0].name)
| extend podCondType = tostring(podCond.type)
| extend podCondStatus = tostring(podCond.status)
| extend podCondReason = tostring(podCond.reason)
| extend podCondMessage = tostring(podCond.message)
| project PreciseTimeStamp, requestURI, verb, user, podCondType, podCondStatus, podCondReason, podCondMessage, Log
```

Example:
![audit pod](../../../.attachments/aks-audit-pod.png)

### Endpoints Readiness

```txt
//***** endpoints readiness
| where properties has @'\/endpoints'
| mv-expand epSubsets = _jlog.requestObject.subsets
| mv-expand epSubsetsAddress = epSubsets.addresses, epSubsetsNotReadyAddresses=epSubsets.notReadyAddresses
| extend readyIP = tostring(epSubsetsAddress.ip)
| extend notReadyIP = tostring(epSubsetsNotReadyAddresses.ip)
| project PreciseTimeStamp, requestURI, verb, user,readyIP, notReadyIP, Log
```

Example:
![audit endpoints](../../../.attachments/aks-audit-endpoint.png)

### Node Status

```txt
//***** node status
// | where user != 'nodeclient' // uncomment to filter normal heartbeats
| where properties has @'\/api\/v1\/nodes\/'
| mv-expand nodeCondItem = _jlog.requestObject.status.conditions
| extend nodeCondType = nodeCondItem.type, nodeCondStatus = nodeCondItem.status, nodeCondReason = nodeCondItem.reason, nodeCondMsg = nodeCondItem.message
| project PreciseTimeStamp, requestURI, verb, user, nodeCondType, nodeCondStatus, nodeCondReason, nodeCondMsg, nodeCondItem, Log
```

Example:
![audit nodes](../../../.attachments/aks-audit-node.png)

### Other interesting lab material

Here's some interesting things we can do with audit log queries.

* Tracing user who deleted a namespace
* Tracing a root cause of a pod deletion
* Tracing HPA activities (even though controller-manager log is in most cases good enough)

## Be creative

Eventually we can tinker the query for the particular scenario. In the last section we already have some extensions in action, but that will just be a start place for you to dive deeper into particular issue.

The `_jlog` in the examples are the parsed json with "dynamic" data type in Kusto. We can access it as accessing objects in programming languages such as Javascript. No error is given if the key accessed is not found, this permissive behavior  can be helpful for allowing hetero-structural data displayed in the same query.

### Tidy the Log json for exploring

Reviewing the full Json content is usually the first step of extending.

Below is some methods in common text editors:

* VSCode: Ctrl+Alt+F [https://code.visualstudio.com/docs/languages/json#_formatting]
* Notepad++: Install JSTool from Plugins->Plugins Admin, then formatting with Ctrl+Alt+M

### Follow the Kusto best practice

The [best practice](https://docs.microsoft.com/en-us/azure/kusto/query/best-practices) allows us to work with Kusto safe and green (Hey how many extra watts were wasted?)

### extend and mv-expand

[Extend](https://docs.microsoft.com/en-us/azure/kusto/query/extendoperator) and [mv-expand](https://docs.microsoft.com/en-us/azure/kusto/query/mvexpandoperator) from Kusto is good for extracting dynamic fields into the table. This way we can focus on fields that matters instead of reading "Matrix". Please refer to the above examples for real-world usage.

## Further readings

* [Kusto tutorial](https://docs.microsoft.com/en-us/azure/kusto/query/tutorial?pivots=azuredataexplorer)

## Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Luis Alvarez <lualvare@microsoft.com>
- Enrique Lobo Breckenridge <enriquelo@microsoft.com>
- Ping He <pihe@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Ines Monteiro <t-inmont@microsoft.com>

