---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:C:/Program Files/Git/Azure Local Nexus/Tools and Processes/Geneva Actions Repo"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=C%3A/Program%20Files/Git/Azure%20Local%20Nexus/Tools%20and%20Processes/Geneva%20Actions%20Repo"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Created by: Andrei Ivanuta**

_Last review: 3-March-2026_

[[_TOC_]]

  

# Description

  

This article provides a reference guide for CSS engineers on how to access and use Geneva Actions for Network Cloud (NC) and AFO Network Fabric Automation (NNF) troubleshooting and support operations. It covers access prerequisites, portal navigation, approved actions, and escalation guidance.

  

:::template /.templates/Block/Important.md 
:::
This list covers Geneva Actions known and executed by CSS engineers. The full list of Geneva Actions is larger -- this article is intended only to create visibility and serve as a reference. While work is in progress to add more Geneva Actions to Azure Support Center (ASC), most actions below are only available through a SAW device with your PME account. Actions available in ASC should be executed from ASC.
:::template /.templates/Block/End.md 
:::

  

# Overview

Geneva Actions are predefined extensions that allow authorized users to manage and troubleshoot production resources. Not all actions are available to CSS due to security, operational complexity, or segregation of duties considerations.


There are two types of output format to be aware of when working with Geneva Actions:
- **JSON output** -- Actions that return custom resource output in JSON format. These are queries against the Azure Resource Database.
- **YAML / Kubernetes-style output** -- Actions that return YAML or K8s-like output. These execute against a specific cluster's internal database.

  

# Prerequisites
Geneva Actions require an active Azure VPN connection, specific group memberships, and for Production environment a SAW device and JIT approval.

:::template /.templates/Block/Note.md 
:::
If connected to the internet, SAWs always have an active Azure VPN connection.
:::template /.templates/Block/End.md 
:::

| Prerequisite � � �| PPE environments � � � � � � � � � � � �| Staging / Production environments � � � � � � |
|:------------------|:----------------------------------------|:----------------------------------------------|
| SAW Required? � � | No � � � � � � � � � � � � � � � � � � �| Yes � � � � � � � � � � � � � � � � � � � � � |
| JIT Required? � � | No � � � � � � � � � � � � � � � � � � �| Specific to the action requested � � � � � � �|
| Group Memberships | `TM-nc-redmond` or `AP-afoi-de-redmond` | `TM-nc-pme` or `AP-afoi-de-pme` � � � � � � � |

  

## Claims and JIT Roles

Geneva Actions uses RBAC through claims. Read-only viewer claims do not require JIT; all other claims require a JIT request. CSS engineers typically operate under `NC-PlatformServiceViewer` (no JIT) for read-only actions. Write and operator-level actions require JIT approval.

| Claim � � � � � � � � � � � � � | JIT Required? | Notes � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � �|
|:--------------------------------|:--------------|:-------------------------------------------------------------------------------------------------------|
| NC-PlatformServiceViewer � � � �| No � � � � � �| Standard access group: `REDMOND\TM-nc` / `PME\TM-nc` � � � � � � � � � � � � � � � � � � � � � � � � �|
| NC-PlatformServiceOperator � � �| Yes � � � � � | CSS-approvable JIT � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � |
| NC-PlatformServiceAdministrator | Yes � � � � � | � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � �|
| NC-CustomerServiceViewer � � � �| Yes � � � � � | � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � �|
| NC-CustomerServiceOperator � � �| Yes � � � � � | � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � �|
| NC-CustomerServiceAdministrator | Yes � � � � � | Lockbox-scoped -- requires customer approval � � � � � � � � � � � � � � � � � � � � � � � � � � � � � |
| NC-PackageAdministrator � � � � | Yes � � � � � | � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � �|

For the full JIT request process, approval channels, and step-by-step guidance, see: [JIT Requests for Geneva Actions](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_wiki/wikis/AzureForOperatorsIndustry.wiki/27142/Azure-Portal-Support-Request-and-IcM-Ticketing-Process)

:::template /.templates/Block/Warning.md 
:::
Actions with `Subscription ID (Lockbox Scoped)` parameters are write operations that require both PG and ATT approval. These can only be executed as part of a pre-approved PG TSG.
:::template /.templates/Block/End.md 
:::

# Accessing Geneva Actions

1. From your SAW, navigate to the [Geneva Portal](https://aka.ms/genevaaction).
2. Click **Actions** in the left panel.
3. Select the **Public** environment from the dropdown.
4. In the **Extensions** tab, filter by the relevant extension (e.g., `Network Cloud - Prod` or `AFO Network Fabric Automation`).
5. Select the action group and action you want to run.
6. Check the **Claims Required** under `More Options` (three ellipsis menu) before running an action to confirm JIT requirements.


# Network Cloud - Prod (NC)

These actions are available under the **Network Cloud - Prod** extension in **Geneva Actions Public**.

## RetrieveInternalNaksInfo
> Read-only -- require JIT approval (CSS-approvable) | NexusAKS-specific

Retrieves internal CR-level info in yaml format for a specified Nexus AKS Kubernetes Cluster.
This output includes:
 - kind: KubernetesCluster 
 - kind: AgentPool
 - kind: VirtualMachineInstance

## RetrieveNaksCapiResources
> Read-only -- require JIT approval (CSS-approvable) | NexusAKS-specific

Returns CAPI resources (kubeadmcontrolplane, machinedeployment, machineset, machine, kubevirtmachine), VirtualMachine, VirtualMachineInstance, and virt-launcher pods for a specified NAKS cluster. 
Two modes: 
 - Summary: Provides a simple output of all the CAPI resources and their statuses 
 - Details: Provides yaml output of all the CAPI resources
 

## NexusAKSKubernetesClusterSOS
> Read-only -- require JIT approval (CSS-approvable) | NexusAKS-specific

Returns debugging data from inside a Nexus AKS Kubernetes Cluster. It contains output for get kubectl get command:
 - get all pods
 - get services
 - get nodes
 - get nodes yaml 
 - get events

 

## RetrieveKubernetesResource
> Read-only -- require JIT approval (CSS-approvable) | Cluster-specific
  
Get Kubernetes resources of the specified kind, or if a name is provided, returns the details (-o yaml) about that resource. If the kind is not here, try the RetrieveKubernetesCr action.
### Undercloud pods
Select "pod" for the Kubernetes CRD Kind to retrieve a specific pod -o yaml or a list a pods from undercloud. 

## RetrieveKubernetesCr
> Read-only -- require JIT approval (CSS-approvable) | Cluster-specific
  
Get CRs of the specified kind, or if a name is provided, returns the details (-o yaml) about that CR. If the kind is not here, try the RetrieveKubernetesResource action.
### NAKS features CR
Use kubernetesclusterfeatures.aks.afo-nc.microsoft.com Kubernetes CRD kind to retrieve NAKS features CR.

## ClusterCapacity
> Read-only -- require JIT approval (CSS-approvable) | Cluster-specific

Returns the capacity of a specified cluster: CPU, hugepages, memory, NUMA zones, and `mellanox.com/mlnx_sriov_vfio`.


## GetBareMetalMachineStatus
> Read-only -- no JIT required | Cluster-specific

Fetches information about a Bare Metal Machine from a Platform Operator instance using the ARM API (`Microsoft.NetworkCloud/bareMetalMachine`).


# AFO Network Fabric Automation (NNF)

These actions are available under the **AFO Network Fabric Automation** extension in **Geneva Actions Public**.


## Device RO Command Operation For All Network Fabric Devices
> Read-only -- no JIT required | Per network device(CE, TOR, etc)

Runs CLI commands against NNF devices via the Admin Service. Useful for gathering live device state.
Commonly used commands:
| Command � � � � � � � � � � �| Purpose � � � � � � � � � � � � � � � � � � � � � �|
|:-----------------------------|:---------------------------------------------------|
| `show bfd parameters` � � � �| Review BFD session parameters on fabric devices � �|
| `show bgp Summary` � � � � � | Check BGP neighbor summary and session states � � �|
| `show running-configuration` | Retrieve the current running configuration � � � � |

  

## Get Resource Details
> Read-only -- no JIT required | Use in ASC only! | 

Returns ARM resource details for a given ARM resource ID. Useful for inspecting Network Fabric resource state, configuration, and metadata without needing direct cluster access.

# Reference
[GenevaActionsList.md - Repos](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_git/nc-management-service?path=%2FGenevaActionsList.md&_a=preview)
