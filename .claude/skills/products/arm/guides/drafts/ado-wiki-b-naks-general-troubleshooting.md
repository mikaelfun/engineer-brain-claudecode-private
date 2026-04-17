---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Customer Scenarios/[How To] NAKS General Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Customer%20Scenarios/%5BHow%20To%5D%20NAKS%20General%20Troubleshooting%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---


**Created by: Andrei Ivanuta**

_Last review: 24-March-2026_

[[_TOC_]]

  
## Description


This guide provides a structured entry point for troubleshooting Nexus AKS (NAKS) support cases. It is intended to help CSS engineers quickly determine which layer is failing, identify the first unhealthy custom resource (CR), pair CR state with the correct Kusto evidence, and gather the minimum data required before escalation.

Use this guide to scope the issue and choose the right investigation path. For deep architectural background on how NAKS clusters are created and reconciled, see [NAKS Cluster Creation Flow - Overview](https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2495712/NAKS-Cluster-Creation-Flow).


## Overview


NAKS is a KubeVirt-backed, CAPI-managed Kubernetes service running on the Network Cloud undercloud. Customer requests flow through ARM -> RPaaS -> K-Bridge -> undercloud API server -> nc-aks-operator. The nc-aks-operator creates and reconciles the generic CAPI resources, KubeVirt-specific provider resources, and feature resources that drive cluster lifecycle operations such as create, upgrade, and delete.

---
## Troubleshooting Workflow

Before starting detailed investigation, a minimum [scoping](https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2456328/-How-To-Scope-an-Azure-Operator-Nexus(AON)-SR) must be performed and ensure that bellow data is available. If any of these are missing, collect them first.

- Tenant/Subscription ID
- Undercloud cluster ARM resource ID
- Runtime Version
- Management Version
- NAKS cluster ARM resource ID
- Correlation ID from the failed operation
- Timestamp of when the issue was observed, the scoped one. 

An effective troubleshooting pattern is:

1. Classify the issue type.
2. Confirm whether the request progressed beyond ARM, RPaaS, and K-Bridge into undercloud reconciliation.
3. If it did not, investigate ARM, RPaaS, and K-Bridge.
4. If it did, use Geneva Actions to collect the CR chain.
5. Walk the CR chain to identify the first unhealthy object, then use Kusto to explain why it failed.

  


:::template /.templates/Block/Important.md 
:::
If JIT for Geneva Actions was not requested during case scoping, request it early. Lack of access will slow down the investigation path in later steps.
There is no direct `kubectl` access to the undercloud. Use Geneva Actions for spot checks and Kusto for broader investigation.

:::template /.templates/Block/End.md
:::

---
### Step 1: Determine the Issue Category


Classify the issue first. The category determines which CRs and telemetry streams should be checked first. 

| Category | Customer symptom | Likely failing layer |
|---|---|---|
| Creation failure | Cluster or agent pool stuck in Provisioning or Failed after create | nc-aks-operator -> CAPI -> KubeVirt -> CDI |
| Deletion failure | Cluster stuck in Deleting or Failed after delete | Feature cleanup, finalizers, virt-launcher teardown |
| Upgrade failure | Cluster stuck during upgrade, nodes not rolling | KCP sequencing, MachineDeployment rollout, PDB drain blocking |
| Node health | Node NotReady, evictions, workload impact | BMM, virt-launcher, VMI bootstrap, kubelet |
| Feature provisioning | Feature stuck in Provisioning | Feature controller, in-cluster dependencies |


---
### Step 2: Check ARM Provisioning State

Check the current ARM lifecycle state using the [NAKS resources events](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2331175/NC-Kusto-Repo?anchor=naks-resources-events:) query or the CSS Dashboard.


| State | Meaning | What to do next |
|---|---|---|
| `Accepted` | Request was received but reconciliation has not progressed | Confirm whether the request reached the undercloud or was rejected earlier |
| `Provisioning` | The operation is actively reconciling | Identify which CR or phase is currently blocked |
| `Succeeded` | The requested lifecycle operation completed | Re-scope toward node health, connectivity, or post-provisioning behavior |
| `Failed` | The requested operation failed | Pull `detailedStatusMessage` and find details |

---
### Step 3: Check Custom Resources via Geneva Actions

Step 3 should answer a single question: which object in the reconciliation chain is the first one that is not healthy.


#### Geneva Actions

Before reading the CR body, make sure you have isolated the correct object. Geneva CR outputs are often returned as a `List` wrapper and can include multiple items or extra preamble text. Do not assume the first item in the file or the first error line belongs to the cluster you are troubleshooting. Use `RetrieveInternalNaksInfo` first to get the generated undercloud CR name, then match the target `KubernetesCluster` by both `metadata.annotations.management.azure.com/resourceId` and `metadata.name`. If a dump contains unrelated clusters, ignore them and continue only with the item that matches your target ARM resource and generated CR name.

Most useful actions, for more explore [Geneva Actions Repo - Overview](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2449864/Geneva-Actions-Repo)
| Action | What it does |
|---|---|
| [RetrieveInternalNaksInfo](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2449864/Geneva-Actions-Repo?anchor=retrieveinternalnaksinfo) | Returns internal undercloud details for a NAKS cluster, including the undercloud CR name and related metadata |
| [RetrieveNaksCapiResources](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2449864/Geneva-Actions-Repo?anchor=retrievenakscapiresources) | Returns summary or detailed CAPI resources |
| [RetrieveKubernetesCr](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2449864/Geneva-Actions-Repo?anchor=retrievekubernetescr) | Retrieves custom resources and other CRDs depending on selected kind |
| [RetrieveKubernetesResource](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2449864/Geneva-Actions-Repo?anchor=retrievekubernetesresource) | Retrieves built-in Kubernetes resources such as pods, nodes, and secrets |
| [NexusAKSKubernetesClusterSOS](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2449864/Geneva-Actions-Repo?anchor=nexusakskubernetesclustersos) | Returns Nodes, Pods, and Events from the tenant NAKS cluster |
  |[ClusterCapacity](https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2449864/Geneva-Actions-Repo?anchor=clustercapacity)|Returns per-node, per-NUMA allocatable capacity for CPU, memory, hugepages-1Gi, and SRIOV VFs on the undercloud cluster.|

#### Where to Start by Issue Type

| Issue type | Start here | Typical next hop |
|---|---|---|
| Creation | `RetrieveInternalNaksInfo` | `KubeadmControlPlane` or `AgentPool` -. `Machine` -> `KubeVirtMachine` -> `DataVolume` or `VMI` |
| Upgrade | `KubeadmControlPlane` for CP, `MachineDeployment` for workers | `Machine` -> drain and event analysis |
| Deletion | `RetrieveNaksCapiResources` , `RetrieveInternalNaksInfo`, `KubernetesClusterFeature`, then `Machine` or `KubeVirtMachine` cleanup | Finalizers, `virt-launcher` teardown |
| Feature provisioning | `KubernetesClusterFeature` | NCAKSOperator traces and in-cluster dependency checks |




#### Custom Resource Health Reference

| CR Kind | Healthy signal | If unhealthy, check next |
|---|---|---|
| `KubernetesCluster` | `ready=true`, `terminal=false`, expected `provisioningStatus` | `detailedStatusMessage`, child CR state |
| `AgentPool` | `ready=true`, `readyReplicas` matches desired replicas | `machineStates[]`, `MachineDeployment` |
| `KubernetesClusterFeature` | `ready=true`, expected version, not stuck upgrading | Feature controller traces and conditions |
| `KubeadmControlPlane` | Ready replicas match desired replicas | Blocked `Machine` CR for the next control plane node |
| `MachineDeployment` | Desired replicas match ready replicas, Phase=`Running` | If Phase=`ScalingUp` with desired > ready, one or more VMs are stuck. Check `MachineSet`, then individual `Machine` CRs |
| `Machine` | `ready=true`, no failure reason, healthy phase progression. Consistent ages across machines indicate original creation; mixed ages (e.g., 69d and 41d) indicate some were recreated during an upgrade or reprovisioning event | `KubeVirtMachine` |
| `KubeVirtMachine` | `ready=true`, VM STATE=`Running` | If VM STATE=`ErrorUnschedulable`, check `KubernetesEvents` for FailedScheduling constraints. If `WaitForBuild`, check `DataVolume` and CDI |
| `VirtualMachine` | STATUS=`Running`, READY=`True`. Age should match the parent `Machine` age | If STATUS=`ErrorUnschedulable`, same path as `KubeVirtMachine`. If VM age matches `Machine` but VMI age is younger, the VMI was recreated after an eviction |
| `VirtualMachineInstance (VMI)` | `ready=true`, PHASE=`Running`, NODENAME is populated (indicates which BMM hosts the VM) | If PHASE=`Scheduling` with blank NODENAME, the VM was never placed � check `KubernetesEvents` for FailedScheduling. If VMI age is less than VM age, the VMI was recreated (eviction or reschedule) |
| `DataVolume` | `Succeeded` | CDI operator logs and DataVolume events |


:::template /.templates/Block/Note.md 
:::
For `KubeVirtMachine`, `running` is not the same as `ready`. `running` means QEMU started. `ready` means the VM bootstrapped successfully and joined the cluster. Always treat `ready` as the decisive signal.
For node-health investigations, BMM health is a prerequisite. If the underlying BMM is not healthy, Kubernetes-layer troubleshooting will not explain the failure.
:::template /.templates/Block/End.md 
:::

  



#### High-Signal CR Checks


:::template /.templates/Block/Warning.md 
:::

If `status.terminal=true` on the `KubernetesCluster` CR, nc-aks-operator has stopped reconciling. The cluster will not make further progress until the terminal state is cleared by the owning team.

:::template /.templates/Block/End.md
:::


The current mitigation requires DRI action:
 

```bash

kubectl -n nc-system patch kubernetescluster <NAME> --subresource=status \

� --type merge --patch '{"status":{"terminal":false}}'

```

---
### Step 4: Pair CR State with Kusto Evidence

After identifying the first unhealthy CR, use Kusto to determine why that object is unhealthy. Start with the table that matches the failing layer instead of running every query in sequence.

:::template /.templates/Block/Note.md 
:::
The **CRdata** tables broadly mirror the object state returned by Geneva Actions CR retrievals.
:::template /.templates/Block/End.md 
:::


#### Kusto Tables Reference


Detailed queries and additional examples for each of these tables are available in the following [Kusto Repo](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2325970/AON-Kusto-Repo).

All tables are in cluster `ncprod-hub.eastus`, database `NetworkCloud`.

| Table | What it covers | Query by |
|---|---|---|
| `Resources` | ARM resource state snapshots and transitions | eventType, subscriptionId, resourceId, correlationID |
| `KubernetesEvents` | Equivalent of `kubectl get events` on collected telemetry | Resource name, pod, node, CR |
| `NexusAKSOperatorTraces` | nc-aks-operator logs for clusters, agent pools, and features |  CR name |
| `PlatformOperatorTraces` | Tenant networks, undercloud resources, and BMM lifecycle |  CR name |
| `VMOrchestration`| Container logs for NAKS related undercloud pods: virt-launcher, virt-handler, virt-controller, virt-operator and virt-api| VMI name, NKAS name |
| `KubernetesContainers` | Container stdout for pods on the undercloud | Pod name, container name, keywords |
| `NexusAKSControlPlaneProxy` | Dedicated logs for NAKS control plane proxy traffic via nc-aks-proxy | Cluster ID, pod details, keywords |
| `BareMetalMachineCrData` | BMM CR metadata snapshots | BMM name |
| `MachineCrData` | CAPI Machine CR snapshots | Machine name |
| `KubevirtVMCrData` | KubeVirt VM CR snapshots | VM name |

  

#### Query Selection Matrix

  
As a best practice, always search with the full resource name, when you have it. For NAKS resources, that usually means the full generated name with the random suffix, such as the complete `kubernetescluster`, `agentpool`, `machine`, or VM name. Using the full name reduces false matches and makes it much easier to line up CR state, events, and operator traces for the exact failing object.


| If the failing object is | Primary evidence | Secondary evidence |
|---|---|---|
| `KubernetesCluster`, `AgentPool`, `KubernetesClusterFeature` | `Resources`, `KubernetesEvents`, `NexusAKSOperatorTraces` | `KubernetesContainers` |
| `KubeadmControlPlane`, `MachineDeployment`, `Machine`, `KubeVirtMachine` | `MachineCrData` where available, Geneva Actions CR retrievals for the missing CR types, `KubernetesEvents` | `KubernetesContainers` |
| `DataVolume` | `KubernetesEvents`, `KubernetesContainers` with CDI-related logs | `NexusAKSOperatorTraces` |
| `VirtualMachineInstance`, `virt-launcher` | `KubernetesEvents` and/or `VMOrchestration` , `NexusAKSOperatorTraces` | `KubernetesContainers` |
| BMM health | `KubernetesEvents`, `BareMetalMachineCrData` | `PlatformOperatorTraces` |

  
---
### Step 5: Scenario Playbooks

Use the category selected in Step 1 and the failing CR identified in Step 3 to narrow the investigation. This section is intentionally brief: it highlights the fastest next check and then points to scenario-specific guidance where deeper workflow already exists:
[Overview | Network Cloud TSGs](https://eng.ms/docs/cloud-ai-platform/microsoft-specialized-clouds-msc/msc-edge/linux-edge-large/afoi-network-cloud/network-cloud-tsgs/doc/tenant-cluster/naks/geneva-actions)
[Azure Local Nexus - Overview](https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2190815/Azure-Local-Nexus)

#### Creation Failures

Validate the expected creation order: Kubernetes Cluster CR -> Control plane creation -> Agent pool creation -> Feature creation.
When pairing this guide with the companion creation-flow document, map the failure to one of those four phases first: webhook validation, control plane creation, agent pool creation, or feature creation.

| Pattern | Likely cause | Focus area |
|---|---|---|
| Request never reaches undercloud | RP validation failure or RPaaS/K8sBridge/Proxy issue | ARM, RPaaS, K-Bridge traces |
| Request reached the undercloud but was rejected | NexusAKSOperator validation | NAKS container controller logs |
| Control plane node never becomes ready | CDI import failure, scheduling issue, or bootstrap failure | `KubeadmControlPlane` -> `Machine` -> `KubeVirtMachine` -> `DataVolume` or `VMI` |
| VM is running but node never joins | Bootstrap, certificate, or network path issue | cloud-init path |
| Agent pool replicas remain unready | Same VM pipeline as control plane, but parallelized | `MachineDeployment` and child `Machine` CRs |

  

#### Deletion Failures

Validate the expected deletion order: features -> agent pools -> control plane.

| Pattern | Likely cause | Focus area |
|---|---|---|
| Features stuck deleting | Feature cleanup issue | Feature CR conditions and operator traces |
| `virt-launcher` pods stuck in `Terminating` | Pod teardown blocked, including known CNI-related cleanup failures | `KubernetesEvents`, affected pod names, BMM host context |


  

#### Upgrade Failures


| Pattern | Likely cause | Focus area |
|---|---|---|
| Control plane upgrade not rolling | One unhealthy replacement node blocking sequential progress | `KubeadmControlPlane` and the next failing `Machine` |
| Worker upgrade blocked during drain | Customer PDB preventing eviction | Kubernetes events for drain, cordon, and PDB messages |
| Upgrade reports success but old nodes remain | `MachineSet` or rollout issue | Node age, `MachineDeployment`, `MachineSet` |
| Replacement nodes fail with image pull issues | Image availability or registry connectivity issue | CDI container errors, CDI or registry path |


#### Feature Provisioning

1. Start with `KubernetesClusterFeature` state and conditions.
2. Check `NexusAKSOperatorTraces` for feature-controller reconciliation errors.
3. Remember that some features depend on in-cluster components and network reachability, including `nc-aks-proxy`.

| Pattern | Likely cause | Focus area |
|---|---|---|
| Feature stuck in provisioning | Feature controller or dependency failure | Feature CR state and operator traces |
| `azure-arc-k8sagents` deletion blocked | Known feature cleanup bug when delete is issued before feature variables are fully populated | Feature CR state, operator traces, and KI-specific mitigation guidance |
| CCM-related deployment issue | In-cluster dependency or networking path not satisfied | Feature reconciliation and proxy-dependent connectivity |
| Cluster remains failed indefinitely after feature issue | `terminal=true` stopped reconciliation | Requires owning team intervention |


#### Node Health Issues
:::template /.templates/Block/Important.md 
:::
Do not treat `Cannot migrate VMI: PVC is not shared` as a root cause on Nexus. This is expected behavior for local boot-disk storage.

NAKS worker VMs use `local-path` StorageClass with `ReadWriteOnce` access mode for their root disk. This creates a PersistentVolume that is physically bound to a specific BMM node via volume node affinity. Once the PVC is created, the VM can only ever be scheduled on that one node.
:::template /.templates/Block/End.md 
:::

1. Check which BMM hosts the node, and verify BMM health first.
2. If the BMM is healthy, confirm whether the `virt-launcher` pod is running.
3. If the VM is running, confirm whether the VMI and node ever became ready.  



  
---
## Escalate to SME or Engineering

If you are stalled on troubleshooting or the customer requires an official RCA statement, escalate only after collecting the minimum evidence needed to identify the failing layer.

### Data Gathering Checklist

- [ ] NAKS cluster ARM resource ID
- [ ] Correlation ID for the failed operation
- [ ] Precise timestamp for when the issue started
- [ ] Subscription ID and resource group
- [ ] Provisioning state from `Resources`
- [ ] `detailedStatusMessage` from the `KubernetesCluster` CR
- [ ] `terminal` flag state
- [ ] CR snapshot for `KubernetesCluster`, `KubeadmControlPlane`, `AgentPool`, and `KubernetesClusterFeature`
- [ ] Operator traces filtered to the affected CR and time window
- [ ] `KubernetesEvents` for affected nodes, VMs, or pods
- [ ] BMM health evidence if the issue is node-related
- [ ] Summary of actions already taken and timestamps for each action

  
---

##Reference
[Nexus Troubleshooting Toolkit - Overview](https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2211083/Nexus-Troubleshooting-Toolkit)
[Support Request Management Procedures - Overview](https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2190838/Support-Request-Management-Procedures)
[Nexus IcM creation and management process - Overview](https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2190836/Nexus-IcM-creation-and-management-process)

