---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/Steps to deploy the K8s+Kube-OVN sandbox lab environment in Azure Stack Hub"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**_Created by: Carlos Natera
Last reviewed: 06/01/26_** 

Azure Operator Nexus: Tenant Workload AKS and Network Architecture Deep Dive
============================================================================

Introduction
------------

This internal engineering session [Jun19-Azure Nexus Deep Dive-TenantWorkloadNexusAKSandNetworks.mp4](https://microsoft.sharepoint.com/teams/NexusEngineering/_layouts/15/stream.aspx?id=%2Fteams%2FNexusEngineering%2FShared%20Documents%2FPlatform%20Design%2FCommon%2FOverview%2FRecordings%5FE%2BP%5FLeadership%5FTeam%5FJune2024%2FJun19%2DAzure%20Nexus%20Deep%20Dive%2DTenantWorkloadNexusAKSandNetworks%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E7fcef221%2Db16d%2D4686%2Db196%2Ddccb8bad394c) provides a detailed walkthrough of **Azure Operator Nexus (AON)** tenant workload provisioning, with a strong focus on **networking primitives, Kubernetes (AKS) deployment models, IP address management, Arc integration, and highavailability considerations**.  
The presenters demonstrate the **endtoend customer workflow**, primarily via **CLIdriven ARM resource creation**, while explaining backend orchestration and reconciliation behavior relevant for **support and operations engineers** working with large telco environments. [Timestamp: 00:52]

* * *

Overall Tenant Workload Provisioning Flow
-----------------------------------------

Tenant workloads (VMs or Nexus AKS clusters) require a **strict sequence of ARM resources** to be created before compute can be deployed. The workflow assumes the **Nexus onpremises environment is already deployed and operational**. [Timestamp: 03:22]

### HighLevel Workflow

1.  Create **Fabriclevel networking resources**
2.  Create **Workload (x86) networking resources**
3.  Create **Cloud Service Network (CSN)**
4.  Deploy **AKS on Nexus**

    
```
Customer (ARM/CLI)
       |
       v
    Fabric Resources (VRF, VLAN)
       |
       v
    Workload L3 Network (K8s Bridge Resource)
       |
       v
    Cloud Service Network (DNS, NTP, Proxy)
       |
       v
    Nexus AKS Cluster
```

    

[Timestamp: 03:22]

* * *

Fabric Networking Primitives
----------------------------

### L3 Isolation Domain (VRF)

The **L3 Isolation Domain** represents a **VRF** on the physical fabric. All tenant VLANs (internal networks) are associated with a VRF. [Timestamp: 03:54]
Key characteristics:
*   Dedicated routing table per tenant / use case
*   Required prerequisite before any internal network can be created
*   Mapped 1to1 with fabric routing constructs

* * *

### Internal Network (VLAN)

Internal networks represent **VLANs** created under a VRF. These are fabriclevel constructs and act as the **source of truth for MTU and addressing constraints**. [Timestamp: 04:02]
**Key configuration inputs**
| Property | Description |
| --- | --- |
| IPv4 Prefix | Mandatory |
| IPv6 Prefix | Optional |
| VLAN ID | Customerdefined |
| MTU | Customerselectable (within enforced limits) |
[Timestamp: 04:24]

* * *

### MTU Contract and Enforcement

Nexus enforces a **strict MTU contract** to prevent fragmentation and unpredictable behavior across the shared fabric. [Timestamp: 04:48]
**Key principles**
*   Physical fabric MTU is **greater than any customerconfigurable MTU**
*   Customers may configure up to ~9000 bytes
*   Underlying fabric (e.g., Mellanox, Arista) typically supports ~9126
*   MTU cannot exceed fabric maximum
*   Southbound components always inherit fabric MTU automatically
[Timestamp: 05:55]

> MTU differences **outside the Nexus boundary** (e.g., customer TORs or upstream networks) are **customer responsibility**.

* * *

Workload (x86) Networking
-------------------------

### L3 Network Resource (Workload Network)

After fabric objects exist, a corresponding **workload L3 network** must be created. This resource bridges Azure ARM configuration to the onpremises Kubernetes infrastructure. [Timestamp: 10:03]
**Technical details**
*   Implemented as a **Kubernetes Bridge resource**
*   Deployed via **Azure Resource Bridge** into the undercloud
*   Reconciled by Kubernetes controllers
*   Generates:
    *   NetworkAttachmentDefinitions
    *   IPAM configuration
    *   Network plumbing for workloads
[Timestamp: 10:59]

* * *

### Fabric  Workload Network Relationship

Each workload L3 network must reference:
*   The **Fabric L3 Isolation Domain ID**
*   A specific **subnet (CIDR) defined at the fabric level**
Validation occurs at create time:
*   CIDR mismatch  immediate ARM validation error
*   Explicit and descriptive error messages are returned
[Timestamp: 17:11]

* * *

IP Address Management (IPAM)
----------------------------

### IPAM Architecture

Nexus uses **Metal IP Address Manager** for tenant workload IP allocation. [Timestamp: 15:55]
**Characteristics**
*   IPAM is **selfhosted inside the cluster**
*   Deployed automatically during cluster provisioning
*   Preseeded with customerdefined CIDRs
*   Tracks IP allocation as Kubernetes custom resources

    
```
Fabric CIDR
       |
       v
    IPAM Tree (CRDs)
       |
       v
    Workload Pod / VM IPs
```

    

[Timestamp: 22:38]

* * *

Cloud Service Network (CSN)
---------------------------

### Purpose and Role

A **Cloud Service Network** is mandatory before deploying any VM or AKS workload. [Timestamp: 12:02]
**PerCSN Dedicated Services**
*   DNS endpoints
*   NTP endpoints
*   Egress proxy (FQDN + port allowlists)
These services are:
*   **Tenantisolated**
*   **Not shared** across CSNs
[Timestamp: 12:16]

* * *

Nexus AKS Cluster Deployment
----------------------------

### Cluster Creation Dependencies

AKS cluster creation **does not directly reference fabric resources**. Instead, the linkage is indirect via the workload L3 network. [Timestamp: 13:23]
**Key parameters**
*   Kubernetes version (aligned closely with AKS API)
*   VM SKU
*   Pod CIDRs (IPv4/IPv6)
*   Availability zones (rackscoped)
*   Default CNI network
[Timestamp: 13:45]

* * *

### Availability Zones = Physical Racks

In Nexus, **Availability Zones map to racks**, not Azure regions. [Timestamp: 26:58]
| Concept | Meaning in Nexus |
| --- | --- |
| Availability Zone | Rack |
| AZ antiaffinity | Crossrack placement |
Node objects expose labels indicating rack membership, enabling standard Kubernetes antiaffinity rules. [Timestamp: 29:06]

* * *

High Availability & Failure Scenarios
-------------------------------------

### Control Plane Availability

Nexus AKS control plane VMs use **kubevip** to present a **single highly available API endpoint**. [Timestamp: 44:01]
*   Survives individual master node failures
*   Transparent to kubectl clients
*   No customer reconfiguration required

* * *

### Rack Failure Scenarios

If a rack fails:
*   Pod placement behavior is entirely **Kubernetesdriven**
*   **Soft antiaffinity**  pods rescheduled
*   **Hard antiaffinity**  pods remain unscheduled
Rebalancing after recovery requires **explicit customer tooling** or addons. Nexus does **not modify default Kubernetes behavior**. [Timestamp: 33:01]

* * *

Public vs Internal Connectivity
-------------------------------

There is **no single public network** in telco environments. [Timestamp: 25:24]
**Key principles**
*   Workloads attach to **multiple arbitrary networks**
*   Customers control route advertisement (BGP, communities)
*   ExpressRoute is **managementonly**, not workload data path
*   Internetfacing traffic is customerdefined
[Timestamp: 23:44]

* * *

Azure Arc Integration
---------------------

### Mandatory Arc Enrollment

Azure Arc is **nonoptional** for Nexus AKS clusters. [Timestamp: 42:09]
**Supported access models**
*   Arcbased `kubectl` access
*   Direct CNI network access
*   Local kubeconfig (currently SSHextracted; ARM API coming)
[Timestamp: 43:05]

* * *

### Arc Resource Relationships

Arc resources are:
*   Automatically created
*   Linked from parent Nexus ARM objects
*   Hosted in Microsoftmanaged resource groups (MRGs)
Custom Locations enable:
*   Arc extensions
*   Nexusmanaged addons
[Timestamp: 53:28]

* * *

Support & Operability Considerations
------------------------------------

### Customer Drift & BreakGlass Access

Current nearedge model allows:
*   Root SSH to control plane nodes
*   Potential deletion of Arc agents
*   Full configuration drift
Future direction:
*   Remote control plane
*   Drift detection and reconciliation
*   Scoped or JIT SSH access
*   Readonly root FS with overlay for drift detection
[Timestamp: 49:42]

* * *

Common Issues & Troubleshooting Tips
------------------------------------

*   **CIDR mismatch errors** typically indicate fabric/workload network misalignment
*   MTU issues almost always originate **outside Nexus boundaries**
*   Unscheduled pods after failures usually indicate **hard antiaffinity rules**
*   Arc disconnect issues may be caused by **manual SSH changes**
*   IP allocation failures often stem from **exhausted or misconfigured CIDRs**

* * *

Key Takeaways
-------------

*   Nexus networking is **fabricfirst**, Kubernetessecond
*   MTU enforcement is strict and deliberate
*   IPAM is clusterlocal and Kubernetesnative
*   Availability zones map to **physical racks**
*   Kubernetes behavior is intentionally unmodified
*   Arc is mandatory and foundational
*   Simplicity vs control is a deliberate ongoing tradeoff

* * *

References
----------

*   Metal IP Address Manager project
*   Kubernetes antiaffinity and pod disruption budgets
*   kubevip control plane HA
*   Azure Arc for Kubernetes
*   Azure Operator Service Manager (AOSM)