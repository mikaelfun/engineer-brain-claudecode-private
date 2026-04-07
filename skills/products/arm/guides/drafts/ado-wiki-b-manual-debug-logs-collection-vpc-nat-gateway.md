---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/Manual debug logs collection for a Kube-OVN VPC NAT Gateway Deployment"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**_Created by: Carlos Natera
Last reviewed: 06/01/26_**

Azure Operator Nexus: Tenant Workload Networking and Kubernetes Architecture Deep Dive
======================================================================================

Introduction
------------

This session [Jun17-Azure Nexus Deep Dive-TenantWorkloadComponents.mp4](https://microsoft.sharepoint.com/teams/NexusEngineering/_layouts/15/stream.aspx?id=%2Fteams%2FNexusEngineering%2FShared%20Documents%2FPlatform%20Design%2FCommon%2FOverview%2FRecordings%5FE%2BP%5FLeadership%5FTeam%5FJune2024%2FJun17%2DAzure%20Nexus%20Deep%20Dive%2DTenantWorkloadComponents%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E2ae4f8a7%2D2fba%2D4a1c%2D8b3a%2Db168d1784037), presented by Alan Meadows as part of the Azure Operator Nexus deep dive series, focuses on tenant workload components, with particular emphasis on Kubernetes-based workloads, their networking models, and how high-level Azure Resource Manager (ARM) constructs are translated into baremetal fabric configuration and X86 compute plumbing. The audience is assumed to be familiar with Azure concepts, but the goal is to build deep understanding of Nexusspecific abstractions, data flows, and operational behaviors relevant to support and troubleshooting. [Timestamp: 00:10]

* * *

Logical Resource Model Overview
-------------------------------

The session begins by recapping the layered responsibility model between customermanaged and systemmanaged components. [Timestamp: 01:12]

### Responsibility Layers

*   Customer-managed
    *   Provider Edge (PE)
    *   Tenant network intent (CIDRs, VLAN ranges, routing expectations)
*   Nexus-managed
    *   Network Fabric (ToR switches, CES switches)
    *   Bare-metal compute
    *   SRIOV Virtual Functions (VFs) allocation and configuration

This separation allows customers to express intent while Nexus automates implementation. [Timestamp: 01:35]

* * *

Kubernetes-Centric Workload Model
---------------------------------

Although Nexus supports both VMs and Kubernetes, Kubernetes clusters are emphasized due to their higher object density and configurability. [Timestamp: 02:26]

### Core Objects

*   Kubernetes Cluster (top-level ARM resource)
*   Agent Pools (AKS-compatible naming; analogous to node pools)
*   Kubernetes Nodes (VMs running on bare metal)

Naming and structure intentionally mirror public AKS APIs, even when internal implementation details differ. This reduces customer cognitive load and API divergence. [Timestamp: 03:15]

* * *

Network Abstractions and Types
------------------------------

Each agent pool can have distinct network configurations, enabling heterogeneous networking within a single cluster. [Timestamp: 04:21]

### L3 Networks

*   Layer 3 fabric-backed networks
*   Include:
    *   CIDR (customer-defined)
    *   Built-in IP Address Management (IPAM)
    *   Association with fabric routing (VRFs)

Used for:

*   Node IP assignment
*   Container IP assignment (depending on plugin type)

[Timestamp: 05:08]

### L2 Networks

*   Raw Layer 2 access networks
*   No IPAM
*   No fabric L3 configuration
*   VLAN-based only

Primarily used when the customer wants full control of IP behavior. [Timestamp: 06:56]

### Trunk Networks

*   Expose a raw interface to the workload
*   Authorize a range of VLANs (e.g., 700800)
*   Can aggregate:
    *   L3 internal networks
    *   L2 isolation domains

Commonly used in telco CNF workloads where VLAN tagging is done inside the container. [Timestamp: 05:45]

* * *

Cloud Service Network (CSN)
---------------------------

*   One CSN per cluster
*   Provides access to platform services:
    *   DNS
    *   NTP
    *   NFS (RWX)

Can be shared across clusters or used 1:1. Used by both VMs and Kubernetes clusters. [Timestamp: 06:26]

* * *

Agent Pool Override Model
-------------------------

Network attachments can be defined:

*   At the cluster level (inherited)
*   Or overridden at the agent pool level

This allows:

*   Different virtual functions (e.g., UPF vs control plane)
*   Independent lifecycle and scaling

Ubiquitous networks:

*   CNI network (present on all nodes)

Optional networks:

*   Shared L3
*   L2 or trunk attachments via Multus

[Timestamp: 09:33]

* * *

Container Network Interface (CNI)
---------------------------------

### Current and Future CNIs

| <br><br>Environment<br><br> | <br><br>CNI<br><br> |
| --- | --- |
| <br><br>Nexus today<br><br> | <br><br>Calico<br><br> |
| <br><br>Future roadmap<br><br> | <br><br>Cilium<br><br> |

Drivers for Cilium:

*   eBPF support (customer-requested, esp. LSEG)
*   Unified handling of:
    *   BGP announcements
    *   L2 VIP / ARP-less LB

Current AT&T deployment uses Calico + MetalLB. Cilium aims to collapse these into a single stack. [Timestamp: 33:00]

* * *

From Logical Intent to Bare-Metal Plumbing
------------------------------------------

A key conceptual shift emphasized throughout the session is:

> Before containers exist, Nexus builds the pipes. [Timestamp: 12:12]

### VM Manufacturing Flow

1.  Scheduler receives VM request (agent pool node)
2.  Finds:
    *   NUMA-aligned CPUs
    *   Huge pages
    *   Available SRIOV VFs
3.  VFs are:
    *   Allocated
    *   VLAN-configured
    *   Mapped to target networks

This process resembles OpenStack or nonSDN VMware networking. [Timestamp: 15:16]

* * *

NUMA Alignment Guarantees
-------------------------

All Nexus VMs (Kubernetes nodes) are:

*   Pinned to a single NUMA node
*   Never span NUMA boundaries

Benefits:

*   Predictable latency
*   Avoids VF/CPU crossNUMA penalties
*   Stable DPDK performance

[Timestamp: 31:26]

* * *

Interface Visibility Inside the Node
------------------------------------

Inside a Kubernetes node VM, operators will see predictable interfaces:

*   `default-cni`
    *   CNI traffic
    *   BGP peering
    *   LoadBalancer service announcements
*   `csn-*`
    *   Cloud Service Network
*   `net-*` (customer networks)
    *   L3 / L2 / trunk
    *   VLAN-tagged

Interfaces are named deterministically to support scripting. [Timestamp: 30:14]

* * *

Plugin Types and Behavioral Differences
---------------------------------------

### OS Device Plugin

*   Interface configured at node OS level
*   Node receives an IP directly
*   Used for:
    *   HostNetwork workloads
    *   Systemd services

Scalability impact:

*   Node IPs consume CIDR space

[Timestamp: 37:09]

### SRIOV / DPDK Plugin

*   Always uses AVF (even for DPDK)
*   Difference is driver binding inside VM
*   Node gets no IP
*   Containers consume IPs

DPDK execution:

*   Nexus pins VM CPUs
*   Customer pins application threads

[Timestamp: 38:06]

* * *

IP Address Management (IPAM)
----------------------------

### Management IPAM

*   Azure requires a customer-provided /19 when creating a Network Fabric Controller
*   Used only for:
    *   Nexus management
    *   Undercloud
    *   Fabric devices

Customers cannot control carveout logic within this block. [Timestamp: 49:44]

### Tenant IPAM

*   Fully customer-defined CIDRs
*   Stored and tracked in the undercloud, not Azure control plane
*   Used for:
    *   Nodes (OS-device plugin)
    *   Pods (SRIOV / L3 networks)

No preregistration with Azure IPAM required. [Timestamp: 47:48]

* * *

L3 Isolation Domains
--------------------

*   Equivalent to VRFs
*   Contain one or more internal networks (VLANs)
*   No eastwest routing between isolation domains

Mapping:

    Isolation Domain (VRF)
      Internal Network (VLAN)
          L3 Network (ARM)
    

[Timestamp: 21:15]

* * *

Multi-Attach VF Pools (Advanced)
--------------------------------

To support CNFs requiring one VF per pod:

*   Same L3 network can be attached multiple times to a cluster
*   Creates a VF pool
*   A single NAD (NetworkAttachmentDefinition) is injected
*   Pods request VFs dynamically from the pool

Behavior mirrors baremetal SRIOV without postdeployment VF allocation. [Timestamp: 51:33]

* * *

Failure and Support-Relevant Insights
-------------------------------------

### Failure Considerations

*   VM scheduling fails if:
    *   Insufficient VFs in target NUMA
    *   CIDR exhausted
    *   Huge pages unavailable
*   Incorrect VLAN range on trunk networks silently drops traffic
*   BGP misconfiguration impacts LoadBalancer service reachability

[Timestamp: 08:38]

* * *

Common Issues & Troubleshooting Tips
------------------------------------

*   Pods not receiving IPs
    *   Check plugin type (OS vs SRIOV)
    *   Validate tenant CIDR capacity
*   DPDK performance issues
    *   Verify CPU pinning inside workload
    *   Confirm NUMA locality
*   Traffic blackholing
    *   Validate VLAN authorization on trunk networks
    *   Confirm isolation domain boundaries

* * *

Key Takeaways
-------------

*   Nexus maps high-level intent to baremetal reality through automation
*   Kubernetes nodes are VMs with deterministic SRIOV networking
*   CNI is central to service reachability and BGP behavior
*   IPAM lives in the undercloud, not Azure
*   No manual onprem network configuration is required postdeployment

* * *

References
----------

*   Azure Operator Nexus documentation
*   AKS API reference (agent pools / node pools)
*   Calico and Cilium CNI documentation
*   MetalLB (for legacy LB scenarios)