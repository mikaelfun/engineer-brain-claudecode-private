---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/SecurityGroup Enforcement & ACL Deep-Dive"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**_Created by: Carlos Natera
Last reviewed: 06/01/26_** 

# Azure Operator Nexus: Tenant Workload Networking, IPAM, and Load Balancing Deep Dive

  

## Introduction

This session [Jun18-Azure Nexus Deep Dive-TenantWorkloadSetupAndNetworkConfigs.mp4](https://microsoft.sharepoint.com/teams/NexusEngineering/_layouts/15/stream.aspx?id=%2Fteams%2FNexusEngineering%2FShared%20Documents%2FPlatform%20Design%2FCommon%2FOverview%2FRecordings%5FE%2BP%5FLeadership%5FTeam%5FJune2024%2FJun18%2DAzure%20Nexus%20Deep%20Dive%2DTenantWorkloadSetupAndNetworkConfigs%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E8a096aa9%2D7e65%2D4737%2D8cc3%2Da5092e5bf2f0) continues an internal Azure Operator Nexus deep dive, resuming around slide 45, and focuses on **tenant workload network setup and configuration** within Nexus-managed AKS clusters. The presenters walk through how physical networks are surfaced to workloads, how network attachment definitions (NADs) are generated, how IP address management (IPAM) works across layers, and how ingress/egress and load balancing are implemented using BGP-based mechanisms. The material is aimed at understanding **customer-facing configuration, automation, and support-relevant behavior** rather than UI workflows.?

[Timestamp: 00:03]

  

---

  

## Network Attachments and Automation in AKS Clusters

  

### Physical Network Attachments in Virtual Machines

Nexus automates the injection of physical network attachments into tenant AKS clusters. Each AKS node VM receives virtual functions (VFs) backed by physical NICs, allowing high-performance networking to be exposed consistently across all nodes.?

[Timestamp: 01:01]

  

Key characteristics:

- Physical NICs are passed through as VFs into the VM.

- Inside the VM, standard Linux drivers are used; no device is directly mapped into containers.

- Containers receive interfaces via Linux network namespaces mapped from the VM.?

[Timestamp: 03:59]

  

---

  

## SR-IOV Device Plugin (SR-IOV DP) Configuration

  

### Resource Pooling with SR-IOV DP

Nexus automatically injects an SR-IOV Device Plugin configuration into each AKS cluster. This allows customers to **pool similarly defined networks** (e.g., multiple VLAN-backed L3 networks) and expose them as schedulable resources.?

[Timestamp: 02:08]

  

Example scenario:

- VLAN 527 and VLAN 530 each attached four times.

- Results in a pool of VFs available on every AKS node.

- Pods can request from this pool without ?burning? a VF per pod, unlike raw SR-IOV usage.?

[Timestamp: 02:23]

  

### Device Plugin Behavior

Despite the name, the SR-IOV DP functions as a **generic netdevice plugin**:

- It enumerates network interfaces visible via `ip link`.

- Interfaces are exposed as allocatable Kubernetes resources.

- No dependency on PCI IDs; operates at a higher abstraction.?

[Timestamp: 03:33]

  

---

  

## Driver Model and Kernel Integration

  

### NIC Drivers

- Nexus uses the **upstream MLX5 (Mellanox) driver**, backported into the Azure Linux / Mariner HCI kernel.

- No out-of-tree Mellanox drivers are used.

- These drivers align with Azure?s kernel driver bundle, ensuring consistency with Azure SKUs.?

[Timestamp: 05:12]

  

This reduces stability risks and improves support alignment with Azure driver practices.?

[Timestamp: 11:53]

  

---

  

## Friendly Interface Naming and Supportability

  

### Interface Naming Strategy

Nexus upstreamed support into SR-IOV DP to allow **friendly interface names** rather than raw PCI IDs.?

[Timestamp: 07:44]

  

Advantages:

- Interfaces are named after the Nexus L3 network (e.g., `VLAN527`).

- Names are injected during VM startup via `netplan`.

- Avoids issues with PCI ID divergence across nodes.

- Dramatically improves troubleshooting and human readability.?

[Timestamp: 08:33]

  

Support benefit:

- Engineers can correlate network definitions directly to interfaces on AKS nodes.

- Reduces the need for external mapping documentation.?

[Timestamp: 11:20]

  

---

  

## Network Attachment Definitions (NADs)

  

### Automatic NAD Generation

For each attached network, Nexus generates a **Kubernetes NetworkAttachmentDefinition (NAD)**.?

[Timestamp: 09:07]

  

Inputs include:

- Network type (L2/L3).

- Whether Nexus IPAM is enabled for containers.

- Additional ARM-provided configuration flags.?

[Timestamp: 09:33]

  

Workloads reference the NAD by name in their pod specs. Friendly naming allows applications to stay portable and environment-agnostic.?

[Timestamp: 10:10]

  

---

  

## IP Address Management (IPAM)

  

### Unified IPAM Across Layers

Nexus provides a **single IPAM system** spanning:

1. Bare metal management interfaces

2. Virtual machine VF interfaces

3. Container (pod) interfaces?

[Timestamp: 15:00]

  

This avoids fragmented IP management and ensures address reuse is centrally controlled.

  

### IPAM Architecture

- Built on **Metal3 IPAM**, integrated with Kubernetes.

- Backed by undercloud storage.

- Shared across compute layers.?

[Timestamp: 15:48]

  

For container use:

- IPAM is exposed via a Nexus AKS IPAM plugin.

- Accessible through an endpoint on the Cloud Services Network (CSN).

- Behaves similarly to a metadata service.?

[Timestamp: 16:10]

  

---

  

## Cloud Services Network (CSN)

  

### Purpose and Capabilities

Beyond shared storage, the CSN provides a **mandatory proxy service** for outbound connectivity.?

[Timestamp: 17:26]

  

Why it matters:

- Most Nexus deployments have **no direct Internet access**.

- No default NAT or unrestricted egress.

- Customers must explicitly allow outbound destinations.?

[Timestamp: 17:58]

  

---

  

## Proxy Architecture

  

### Two-Tier Proxy Model

Nexus uses a dual-proxy design:?

[Timestamp: 21:51]

  

1. **Edge Proxy (CSN-local)**

?? - Runs adjacent to AKS nodes.

?? - Single-tenant, cluster-specific.

?? - Customer-controlled via ARM:

???? - Allowed FQDNs

???? - Ports

???? - Protocols?

?? [Timestamp: 22:18]

  

2. **Upstream Proxy (Azure)**

?? - Provides scalable egress to Azure and public endpoints.

?? - Shared within a tenant but not across tenants.?

?? [Timestamp: 22:37]

  

### Implementation Details

- Edge proxy: Squid (being replaced due to lifecycle concerns).

- Upstream proxy: Envoy.

- Configuration orchestration is Microsoft-owned.?

[Timestamp: 29:10]

  

Security considerations:

- No inbound access via CSN.

- Proxy-to-proxy authentication is limited today.

- Whitelisting is enforced by pre-allocated IP ranges.

- Threat models reviewed with Microsoft security leadership.?

[Timestamp: 24:35]

  

---

  

## Default CNI Network

  

### CNI Network ID

AKS clusters specify a **default CNI network** via ARM/Bicep parameters.?

[Timestamp: 31:10]

  

This network:

- Becomes the **default route** for AKS nodes.

- Hosts the pod CNI.

- Is used for:

? - East?west pod traffic

? - External load balancer announcements via BGP?

? [Timestamp: 31:35]

  

* * *

East?West Traffic and Calico
----------------------------

### Calico Mesh and BGP

*   Calico mesh is enabled.
*   Every AKS node peers with every other node.
*   Routes for pod CIDRs are exchanged dynamically.\ [Timestamp: 32:57]
This ensures rapid east?west connectivity without centralized forwarding.

* * *

Load Balancing Model
--------------------

### Service Exposure

Kubernetes Services of type `LoadBalancer` trigger **BGP announcements** to the Nexus fabric.\ [Timestamp: 40:24]
Characteristics:
*   No L7 load balancer.
*   Pure L3 ECMP-based forwarding.
*   Customer controls:
    *   Whether all nodes announce VIPs
    *   Or only nodes hosting the workload\ [Timestamp: 40:51]

### MetalLB Role

*   Used solely for **IPAM allocation**.
*   Not performing traffic steering.\ [Timestamp: 41:42]

* * *

BGP Failure Detection and BFD
-----------------------------

### Route Convergence

*   Standard BGP convergence: ~1?2 seconds.
*   BFD accelerates route withdrawal to sub-second ranges.\ [Timestamp: 43:18]

### BFD Integration

*   Implemented via maintained Bird template modifications.
*   Not upstream in Calico.
*   Driven by telco requirements (e.g., AT\&T).\ [Timestamp: 35:55]
Support implication:
*   Fast failover for node or pod loss.
*   Clients may see TCP resets or timeouts and must retry.\ [Timestamp: 45:11]

* * *

Public VIP Allocation
---------------------

### Address Source

*   Customers define address pools within the **CNI network configuration**.
*   VIPs are allocated automatically or explicitly from those pools.
*   Addresses are announced northbound per customer fabric policy.\ [Timestamp: 48:20]
This supports multiple clusters using different northbound paths and routing policies.\ [Timestamp: 50:15]

* * *

Key Takeaways
-------------

*   Nexus automates NADs, SR-IOV DP, and IPAM injection into tenant AKS clusters.
*   Friendly interface naming greatly improves operability and supportability.
*   A unified IPAM system spans bare metal, VMs, and containers.
*   The Cloud Services Network enforces tightly controlled outbound access via a dual-proxy model.
*   Load balancing is L3 ECMP-based using BGP announcements; no L7 appliance is involved.
*   BFD is critical for telco-grade convergence but is currently custom-integrated.

* * *

Common Issues & Troubleshooting Tips
------------------------------------

*   **Interface confusion**: Verify friendly names map correctly to Nexus L3 networks (`ip link`).\ [Timestamp: 11:23]
*   **IP exhaustion**: Check Metal3 IPAM pools across all three layers.\ [Timestamp: 15:26]
*   **Egress blocked**: Confirm FQDN/port is allowed on the CSN proxy ARM resource.\ [Timestamp: 22:24]
*   **Slow failover**: Validate BFD settings and Bird template deployment.\ [Timestamp: 43:49]

* * *

References
----------

*   Azure Operator Nexus architecture documentation (internal)
*   Metal3 IPAM
*   Calico BGP and mesh networking
*   Envoy Proxy
*   Squid Proxy (legacy, being phased out)