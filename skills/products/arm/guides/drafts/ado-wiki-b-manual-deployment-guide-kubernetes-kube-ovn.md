---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/Manual Deployment Guide - Kubernetes v1.33 + Kube-OVN v1.14.11"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**_Created by: Carlos Natera
Last reviewed: 06/01/26_** 

Azure Operator Nexus: Storage, Cloud Services Network, and Time/DNS Architecture Deep Dive
==========================================================================================

Introduction
------------

This document provides a comprehensive technical analysis of an internal engineering deep dive on **Azure Operator Nexus** in [Jun14-Azure Nexus Deep Dive-PlatformDeviceAndStorage.mp4](https://microsoft.sharepoint.com/teams/NexusEngineering/_layouts/15/stream.aspx?id=%2Fteams%2FNexusEngineering%2FShared%20Documents%2FPlatform%20Design%2FCommon%2FOverview%2FRecordings%5FE%2BP%5FLeadership%5FTeam%5FJune2024%2FJun14%2DAzure%20Nexus%20Deep%20Dive%2DPlatformDeviceAndStorage%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E285ff629%2D63e1%2D49e0%2Dbe79%2D01f663cf872c), focusing on storage architecture, the Cloud Services Network (CSN), and core infrastructure services such as DNS, NTP, and file storage. The session is part of a broader Nexus platform series and is primarily presented by Alan, Pete, and other Nexus engineering contributors.
The discussion is highly architectural and operational, addressing **why** specific design decisions were made, **how** components interact in practice, and **what** implications these have for performance, resiliency, security, and supportability in telco and regulated environments. It is intended for Microsoft support engineers with existing Azure expertise who need **deep, Nexus-specific context**.

* * *

Storage Architecture Overview
-----------------------------

### Role of the Storage Appliance

Azure Operator Nexus uses a **single enterprise-grade storage appliance per deployment** to provide persistent storage services to customer workloads [Timestamp: 01:15].
*   Current implementation uses **Pure Storage FlashArray X70** devices [Timestamp: 01:22].
*   The appliance is **bootstrapped as part of Nexus infrastructure provisioning**, alongside bare-metal host configuration and Arc onboarding [Timestamp: 01:15].
Key responsibilities:
*   Block storage for Kubernetes Persistent Volumes (ReadWriteOnce)
*   Underlying block storage for file services (ReadWriteMany via NFS)
*   Volume lifecycle orchestration via Nexus control plane

* * *

### Why a Single Storage Appliance?

A common question addressed is **why Nexus uses a single storage appliance instead of multiple synchronized devices** [Timestamp: 03:47].
Reasons include:
*   FlashArray X70 is a **dual-controller, fully redundant, hot-swappable** system [Timestamp: 04:57].
*   Controllers, power supplies, and NICs can be replaced live without service interruption.
*   iSCSI multipathing across redundant ports ensures resilience to link or interface failure [Timestamp: 05:11].
Real-world production uptime cited:
*   **Five to six nines availability** in AT\&T environments [Timestamp: 05:38].
This design avoids the complexity of multi-device replication while meeting telco-grade reliability requirements.

* * *

Storage Networking and Isolation
--------------------------------

### Management Network Isolation ("Island Network")

The storage appliance management interface is placed on a **strictly isolated, non-routable VLAN** [Timestamp: 26:10].
Key characteristics:
*   No Layer 3 connectivity to the broader fabric
*   Identical static IP configuration across deployments [Timestamp: 03:08]
*   Access limited to Nexus control plane components
Security rationale:
*   Pure storage appliances can natively phone home to Pures support portals [Timestamp: 27:22].
*   They also allow **vendor engineers remote administrative access**, which is unacceptable in Nexus threat models [Timestamp: 27:27].
Mitigation:
*   A tightly controlled **egress proxy** is the only permitted outbound path [Timestamp: 27:58].
*   Customers can disable remote vendor access via ARM API ("remote administrative support") [Timestamp: 28:20].

* * *

### Initial Appliance Provisioning Constraints

Unlike standard Nexus components, the storage appliance **cannot be fully zero-touch provisioned** [Timestamp: 29:04].
Required preconditions:
*   Appliance must be racked, powered, imaged
*   Management IP and credentials must be configured by Pure or OEM staff
*   Nexus cannot bootstrap these steps autonomously
This is considered a known limitation and a driver for evaluating alternative vendors such as Dell [Timestamp: 29:19].

* * *

Block Storage Consumption Model
-------------------------------

### Customer View vs Under-the-Hood Reality

From the customers perspective:
*   They deploy a **Nexus AKS cluster** via ARM
*   No explicit storage resources are requested initially [Timestamp: 08:26]
*   VM OS disks use **local ephemeral storage** on each node [Timestamp: 07:18]
When workloads are deployed:
*   Two Kubernetes StorageClasses are available by default [Timestamp: 09:13]:

| Storage Class Type | Mode | Backing Implementation |
| --- | --- | --- |
| Block | ReadWriteOnce | Pure block volumes via Nexus CSI |
| File | ReadWriteMany | NFS over Pure block volumes |
[Timestamp: 09:19]

* * *

### Nexus CSI Design

Nexus uses a **custom CSI driver**, not Pures native CSI [Timestamp: 11:51].
Reasons:
*   Avoid tight vendor coupling
*   Avoid in-cluster storage stacks (e.g., Portworx) that add complexity and performance overhead [Timestamp: 12:15]
Architecture principles:
*   CSI calls Nexus undercloud services
*   Undercloud provisions volumes via storage appliance API
*   Volumes are attached to VMs as raw disks
*   Kubernetes only ever sees block devices or NFS mounts
This abstraction enables future backend replacement (e.g., Dell PowerStore) without customer awareness [Timestamp: 13:21].

* * *

### Performance Considerations

*   iSCSI traffic runs over **VLANs with SR-IOV virtual functions** [Timestamp: 18:07]
*   No iSCSI hardware offload on Mellanox NICs [Timestamp: 20:04]
*   iSCSI processing is handled by x86 CPUs on the Kubernetes nodes [Timestamp: 20:21]
*   No iSER (RDMA) or NVMe-oF currently, primarily due to time-to-market and customer requirements [Timestamp: 20:42]
Performance expectation:
*   Near-native array performance
*   No additional software layers in the data path [Timestamp: 15:10]

* * *

File Storage via Cloud Services Network (CSN)
---------------------------------------------

### What Is the Cloud Services Network?

The CSN provides **infrastructure services over a direct L2 network** to Nexus clusters and VMs [Timestamp: 38:23].
Characteristics:
*   RFC1918 address space
*   Identical IPs and DNS names across deployments
*   One-to-one or shared model per customer design [Timestamp: 38:43]
Services provided:
*   DNS
*   NTP
*   NFS-based file storage
*   Proxy services (covered in a later session)

* * *

### NFS Architecture

Nexus does **not rely on the storage appliance for NFS** [Timestamp: 40:39].
Instead:
*   Ganesha NFS servers run as **Nexus-managed workloads** on management nodes [Timestamp: 40:46]
*   Backed by Pure block volumes
*   Exposed only on the CSN
Key design details:
*   NFS version: **NFSv4.1** [Timestamp: 41:45]
*   File system: **XFS** [Timestamp: 49:29]
*   HA model:
    *   Two active/passive Ganesha nodes
    *   VIP managed by keepalived
    *   iSCSI persistent reservations ensure single-writer semantics [Timestamp: 44:24]

* * *

### NFS Failover Semantics

Failover behavior is intentionally conservative [Timestamp: 44:18]:
*   30-second grace period blocking I/O
*   Total disruption up to ~60 seconds
*   No remount required post-failover [Timestamp: 47:39]
Known limitations:
*   Stateful NFS semantics can expose edge cases
*   Some workloads (e.g., databases) may encounter issues under failover [Timestamp: 48:30]
This is considered a **stopgap solution** until:
*   Native file-capable storage appliances are available
*   Or Nexus consumes a managed file service (e.g., ACStore-like model) [Timestamp: 44:38]

* * *

DNS Architecture
----------------

DNS resolution follows a layered model [Timestamp: 51:18]:
1.  **systemd-resolved** on bare-metal hosts (caching resolver)
2.  **CoreDNS** inside Kubernetes clusters
3.  Upstream resolvers sourced from Fabric Service
Notable features:
*   Bare-metal hosts can resolve Kubernetes services
*   Pods benefit from cached host-level resolution [Timestamp: 52:09]

* * *

Time Synchronization (NTP & PTP)
--------------------------------

### Design Goals

*   Avoid dependence on customer-provided NTP
*   Enable tight correlation between Azure cloud logs and on-prem logs [Timestamp: 57:50]
*   Support telco and regulated workloads with strict timing requirements

* * *

### Current NTP Model

Time source:
*   Azure virtual machines expose **hypervisor-backed PTP time** [Timestamp: 55:43]
Distribution model:
1.  Azure NTP server (Chrony)  Management nodes
2.  Management nodes peer with each other [Timestamp: 53:45]
3.  Worker nodes sync to management nodes via Kubernetes service [Timestamp: 54:11]
4.  VMs get time via KVM PTP
5.  CSN also exposes NTP endpoint for workloads [Timestamp: 54:38]
Expected accuracy:
*   Target drift: **12 ms** under normal conditions [Timestamp: 57:34]
*   Disconnected drift: ~12 seconds/day [Timestamp: 58:20]

* * *

### Future Direction: PTP

*   PTP required for vRAN and latency-sensitive workloads [Timestamp: 01:00:44]
*   Nexus is evaluating:
    *   OpenShift PTP operator
    *   Hardware timestamping capabilities [Timestamp: 01:01:25]
Goal:
*   Migrate away from dual NTP/PTP models
*   Provide clear SLAs for time accuracy [Timestamp: 01:01:58]

* * *

Failure Scenarios and Resiliency
--------------------------------

### Storage Appliance

*   Single-device failure mitigated via internal redundancy
*   No cross-device sync currently
*   Vendor-induced risk acknowledged (supply chain, provisioning) [Timestamp: 30:01]

* * *

### NFS Failover

*   Designed for availability, not zero disruption
*   Strong guidance required for workload developers [Timestamp: 45:15]

* * *

### Configuration Drift and Break Glass

*   Appliance configuration reconciled by Kubernetes controllers [Timestamp: 32:39]
*   Break-glass access can cause drift or split-brain scenarios
*   No absolute guarantee of reconciliation correctness [Timestamp: 32:50]

* * *

Key Takeaways
-------------

*   Nexus storage is **fully abstracted from customers** via CSI and CSN services.
*   Single storage appliance design relies on **enterprise-grade hardware redundancy**.
*   File services are provided by **Nexus-managed NFS**, not the storage appliance.
*   Management plane isolation is strict due to **third-party device risk**.
*   Time synchronization is a **first-class concern** for supportability and compliance.
*   Several areas (encryption in transit, PTP, appliance bootstrapping) are **known gaps with active roadmap discussion**.

* * *

Common Issues & Troubleshooting Tips
------------------------------------

*   **PVC creation failures**: Verify Nexus CSI health and undercloud connectivity to storage array.
*   **NFS stalls**: Expect up to 60s I/O pause during failover; validate application tolerance.
*   **Time drift issues**: Check management node Chrony status and Kubernetes NTP service resolution.
*   **Unexpected storage behavior**: Investigate possible break-glass configuration drift.
*   **Security concerns**: Confirm remote vendor access proxy state via ARM settings.

* * *

References
----------

*   Pure Storage FlashArray X70 architecture (vendor documentation)
*   Kubernetes CSI specification
*   NFSv4.1 specification (IETF)
*   OpenShift PTP Operator
*   Nexus internal threat model documentation (referenced verbally)