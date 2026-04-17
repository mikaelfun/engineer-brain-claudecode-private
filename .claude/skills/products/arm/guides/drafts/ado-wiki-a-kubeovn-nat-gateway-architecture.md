---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/Kube-OVN NAT Gateway Architecture & Traffic Processing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Rack%20Scale/Readiness/ALRS%20Kube-OVN/Kube-OVN%20NAT%20Gateway%20Architecture%20%26%20Traffic%20Processing"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> **Applies to:** Kube-OVN ≥ 1.12 on OVN ≥ 22.03. The OVN-native NAT path (`OvnEip`, `OvnFip`, `OvnSnatRule`, `OvnDnatRule`) is not available in earlier releases. The iptables-based VPC NAT Gateway path is available from Kube-OVN v1.8+. Examples and CLI output in this article were captured on Kube-OVN v1.15.x.

---

## Table of Contents

- [Audience and reading path](#audience-and-reading-path)
- [Background: the building blocks](#background-the-building-blocks)
  - [What is OVS (Open vSwitch)?](#what-is-ovs-open-vswitch)
  - [What is OVN (Open Virtual Network)?](#what-is-ovn-open-virtual-network)
  - [How they fit together?](#how-do-they-fit-together)
  - [What is a VPC in Kube-OVN?](#what-is-a-vpc-in-kube-ovn)
  - [NAT terminology at a glance](#nat-terminology-at-a-glance)
- [1 - NAT Gateway design in Kube-OVN](#section-1-nat-gateway-design)
  - [1.1 VPC NAT Gateway (iptables-based Pod)](#sec-11-vpc-nat-gateway-iptables-based-pod)
  - [1.2 OVN-native NAT (Logical Router NAT)](#sec-12-ovn-native-nat-logical-router-nat)
  - [1.3 Egress Gateway](#sec-13-egress-gateway)
  - [Design comparison at a glance](#design-comparison-at-a-glance)
- [2 - SNAT, DNAT, and FIP processing for VPC traffic](#section-2-snat-dnat-fip-processing)
  - [2.1 SNAT (outbound source translation)](#sec-21-snat-outbound-source-translation)
  - [2.2 DNAT (inbound destination translation)](#sec-22-dnat-inbound-destination-translation)
  - [2.3 FIP (bidirectional one-to-one mapping)](#sec-23-fip-bidirectional-one-to-one-mapping)
- [3 - Centralized vs. distributed gateway modes](#section-3-centralized-vs-distributed)
  - [3.1 Distributed gateway](#sec-31-distributed-gateway)
  - [3.2 Centralized gateway](#sec-32-centralized-gateway)
  - [3.3 How the VPC NAT Gateway fits in](#sec-33-how-the-vpc-nat-gateway-fits-in)
  - [Side-by-side comparison](#side-by-side-comparison)
- [4 - How logical router policies and NAT rules are generated](#section-4-policy-and-nat-generation)
  - [4.1 VPC ↔ Logical Router mapping](#sec-41-vpc--logical-router-mapping)
  - [4.2 Static routes and policy routes](#sec-42-static-routes-and-policy-routes)
  - [4.3 NAT rule generation — iptables path](#sec-43-nat-rule-generation--iptables-path)
  - [4.4 NAT rule generation — OVN-native path](#sec-44-nat-rule-generation--ovn-native-path)
  - [4.5 natOutgoingPolicyRules (default VPC only)](#sec-45-natoutgoingpolicyrules-default-vpc-only)
- [5 - EIP, FIP, and gateway-selection interactions](#section-5-eip-fip-gateway-selection)
  - [5.1 EIP lifecycle](#sec-51-eip-lifecycle)
  - [5.2 FIP as the bidirectional binding](#sec-52-fip-as-the-bidirectional-binding)
  - [5.3 Gateway selection and its impact on NAT](#sec-53-gateway-selection-and-its-impact-on-nat)
  - [5.4 Interaction diagram](#sec-54-interaction-diagram)
- [6 - Packet-flow walk-throughs](#sec-section-6-packet-flow-walkthroughs)
  - [6.1 Egress: Pod/VM → NAT Gateway → External network](#sec-61-egress-podvm--nat-gateway--external-network)
  - [6.2 Ingress: External network → NAT Gateway → Pod/VM](#sec-62-ingress-external-network--nat-gateway--podvm)
- [7 - Failure scenarios and detection playbook](#section-7-failure-detection)
  - [7.1 NAT table mismatch](#sec-71-nat-table-mismatch)
  - [7.2 Wrong gateway binding](#sec-72-wrong-gateway-binding)
  - [7.3 SNAT miss (external sees internal source IP)](#sec-73-snat-miss-external-sees-internal-source-ip)
  - [7.4 DNAT/FIP ingress failure](#sec-74-dnatfip-ingress-failure)
  - [7.5 Overlap between iptables and OVN NAT paths](#sec-75-overlap-between-iptables-and-ovn-nat-paths)
  - [7.6 Recommended fault drills](#sec-76-recommended-fault-drills)
  - [7.7 MTU and fragmentation](#sec-77-mtu-and-fragmentation)
  - [7.8 Conntrack table exhaustion](#sec-78-conntrack-table-exhaustion)
- [References](#references)
  - [Primary sources (project-official)](#primary-sources-project-official)
  - [Secondary sources (architecture and implementation)](#secondary-sources-architecture-and-implementation)
  - [Foundational protocol references](#foundational-protocol-references)
  - [Related internal articles](#related-internal-articles)
---

<a id="audience-and-reading-path"></a>
## Audience and reading path

This article is aimed at infrastructure and platform engineers who operate Kube-OVN clusters with custom VPCs. If you are investigating why a Pod or VM cannot reach the internet, why an external client cannot reach a service behind a Floating IP, or why SNAT is showing the wrong source address, start at [Section 6](#section-6-packet-flow-walkthroughs) and work backwards to the design sections as needed.

---

<a id="background-the-building-blocks"></a>
## Background: the building blocks

Before diving into NAT Gateway specifics, it helps to have a shared vocabulary. Kubernetes networking with Kube-OVN sits on top of two foundational open-source projects - OVN and OVS - and uses a set of NAT-related concepts that originate in traditional networking but are expressed through Kubernetes Custom Resource Definitions (CRDs).

<a id="what-is-ovs-open-vswitch"></a>
### What is OVS (Open vSwitch)?

Open vSwitch is a production-grade, multilayer virtual switch. It runs as a kernel module (or as a userspace daemon when using DPDK) on every node in the cluster. Think of it as the "physical" switch in your virtual world: it forwards Ethernet frames, enforces OpenFlow rules, handles connection tracking, and performs the actual packet rewriting needed for NAT. In a Kube-OVN cluster, the main integration bridge is called `br-int`, and every Pod veth pair is plugged into it.

<a id="what-is-ovn-open-virtual-network"></a>
### What is OVN (Open Virtual Network)?

OVN is the control plane that sits above OVS. It lets you define logical switches, logical routers, ACLs, NAT rules, and load balancers in a high-level, vendor-neutral model. OVN compiles those high-level definitions down into OpenFlow rules that get pushed to OVS on each node. It consists of:

- **OVN Northbound DB (NB)** - where you describe *what* the virtual network should look like (logical routers, switches, NAT entries, policies).
- **OVN Southbound DB (SB)** - where OVN stores the compiled logical flow tables and real-time chassis/port-binding information.
- **ovn-northd** - the translator that watches the NB DB and writes compiled flows into the SB DB.
- **ovn-controller** - a per-node agent that reads the SB DB and programs OVS accordingly.

In Kube-OVN, the `ovn-central` Deployment hosts the NB DB, SB DB, and ovn-northd. The `ovs-ovn` DaemonSet on every node runs ovn-controller along with OVS daemons.

<a id="how-do-they-fit-together"></a>
### How they fit together?

The diagram below shows the full integration stack - from Kubernetes CRDs at the top, through the OVN control plane, down to the OVS datapath on each node where packets are actually forwarded and rewritten.

![09-ovs-ovn-br-int-integration.png](/.attachments/09-ovs-ovn-br-int-integration-7672d64a-4d3e-4567-8098-3bbfafc69907.png)

*Figure: The CRD → OVN NB → ovn-northd → OVN SB → ovn-controller → OVS br-int pipeline. Each worker node runs its own ovn-controller that subscribes to the Southbound DB and programs OpenFlow rules into the local br-int integration bridge. Pod veth pairs, Geneve tunnel ports, and external provider NICs all attach to br-int.*

<a id="what-is-a-vpc-in-kube-ovn"></a>
### What is a VPC in Kube-OVN?

Each Kube-OVN `Vpc` resource maps to a single OVN **Logical Router**. Multiple VPCs are fully isolated: they can use overlapping IP ranges without conflict because OVN tags traffic with different Datapath IDs inside Geneve (or STT/VXLAN) tunnels. A VPC contains one or more Subnets; each Subnet maps to an OVN **Logical Switch** that connects to the VPC's Logical Router through a Logical Router Port.

<a id="nat-terminology-at-a-glance"></a>
### NAT terminology at a glance

| Term | Plain English | How it appears in Kube-OVN |
|------|--------------|---------------------------|
| **EIP** (External IP) | A routable public-facing IP address that acts as the outward identity for NAT operations. | `IptablesEIP` (gateway-Pod model) or `OvnEip` (OVN-native model). Allocated from an underlay provider-network subnet. |
| **SNAT** (Source NAT) | Rewrites the *source* IP of outgoing packets so that internal Pod addresses are hidden behind an external address. | `IptablesSnatRule` or `OvnSnatRule`. In OVN NB this becomes a NAT entry of type `snat`. |
| **DNAT** (Destination NAT) | Rewrites the *destination* IP (and optionally port) of incoming packets to forward traffic to an internal Pod or VIP. | `IptablesDnatRule` or `OvnDnatRule`. In OVN NB this becomes a NAT entry of type `dnat`. Implemented via OVN router load-balancers. |
| **FIP** (Floating IP) | A one-to-one bidirectional mapping: SNAT on egress and DNAT on ingress, associating a single external IP with a single internal IP. | `IptablesFIPRule` or `OvnFip`. In OVN NB this becomes a NAT entry of type `dnat_and_snat`. |
| **VpcNatGateway** | The Kube-OVN CRD that creates an iptables-based gateway Pod with two NICs (LAN side in the VPC, WAN side on the physical network via Macvlan). | Deploys a StatefulSet-like gateway Pod per VPC; all iptables NAT rules execute inside it. |
| **Logical Router Policy** | An OVN match/action rule on a Logical Router that can drop, allow, or reroute packets based on L2–L4 fields—similar in spirit to `ip rule` on a Linux router. | Configured through `Vpc.spec.policyRoutes` or auto-generated by Kube-OVN controllers. |
| **Gateway Chassis** | The OVN concept of binding an external-facing Logical Router Port to a specific node (chassis), determining where traffic physically enters/leaves the cluster. | Visible in `kubectl ko nbctl show <vpc-lr>` as `gateway chassis: [...]`. |

![01-concept-map.png](/.attachments/01-concept-map-c0f25842-bd22-4f7c-99a2-857f2169ba2a.png)

*Figure 0: Mindmap of the key concepts - control plane, dataplane, NAT models, and traffic directions - covered in this article.*
---

<a id="section-1-nat-gateway-design"></a>
## 1 - NAT Gateway design in Kube-OVN

Kube-OVN offers three distinct mechanisms for connecting a custom VPC to an external network. Understanding which one you are using - or should be using -is the single most important thing to get right before you start debugging.

<a id="sec-11-vpc-nat-gateway-iptables-based-pod"></a>
### 1.1 VPC NAT Gateway (iptables-based Pod)

This is the oldest and most feature-complete approach. Here is how it works at a high level:

1. You create a `VpcNatGateway` resource pointing to a VPC and a Subnet inside that VPC.
2. Kube-OVN deploys a **gateway Pod** (essentially a small Linux router) with two network interfaces:
   - **eth0 (LAN):** connected to the VPC's tenant subnet and assigned the `lanIp` you specify.
   - **net1 (WAN):** attached to the physical/underlay network through a `NetworkAttachmentDefinition` using Macvlan. This is how the Pod gets a real, routable external IP.
3. Inside the gateway Pod, iptables rules handle all NAT translations - SNAT for outgoing traffic, DNAT for incoming, and FIP for bidirectional one-to-one mappings.
4. Static routes in the VPC direct tenant traffic (e.g., `0.0.0.0/0 → lanIp`) toward the gateway Pod.

The CRDs involved are:

| CRD | Purpose |
|-----|---------|
| `VpcNatGateway` | Creates/manages the gateway Pod and its placement |
| `IptablesEIP` | Allocates an external IP on the gateway's WAN interface |
| `IptablesSnatRule` | Maps internal CIDR/IP egress to an EIP via SNAT |
| `IptablesDnatRule` | Maps external IP:port to internal IP:port for inbound access |
| `IptablesFIPRule` | Creates a 1:1 bidirectional NAT mapping |

**Trade-offs:** Maximum feature parity, long battle-tested history. The downside is a single point of failure (the gateway Pod), complexity of Macvlan networking requirements, and iptables overhead at scale.

<a id="sec-12-ovn-native-nat-logical-router-nat"></a>
### 1.2 OVN-native NAT (Logical Router NAT)

This newer approach moves NAT processing *into OVN itself*, eliminating the gateway Pod entirely. Instead:

1. You enable external connectivity on the VPC (`enableExternal: true`) or add `extraExternalSubnets`.
2. The VPC's Logical Router gets an external-facing Logical Router Port (LRP) directly connected to the underlay provider-network subnet.
3. NAT rules are expressed as entries in the OVN NB Logical Router's NAT table - `snat`, `dnat`, or `dnat_and_snat`.
4. OVN compiles these NAT entries into OpenFlow rules on the gateway-chassis node(s).

The CRDs involved are:

| CRD | Purpose |
|-----|---------|
| `OvnEip` | Allocates an external IP from the underlay provider-network subnet. Has types: `nat`, `lrp`, `lsp`. |
| `OvnSnatRule` | Creates an `snat` entry in the Logical Router's NAT table |
| `OvnDnatRule` | Creates a `dnat` entry (implemented via Logical Router load balancer) |
| `OvnFip` | Creates a `dnat_and_snat` entry for bidirectional 1:1 mapping |

**Trade-offs:** Better performance (no extra hop through a gateway Pod), HA through OVN BFD-based failover, and hardware offload compatibility. However, it exposes more OVN-native concepts, so operators need to be comfortable reading `ovn-nbctl` output.

<a id="sec-13-egress-gateway"></a>
### 1.3 Egress Gateway

A third option focused on *outbound-only* traffic. It solves the single-point-of-failure issue of VPC NAT Gateway by supporting horizontal scaling and fast failover. As of v1.15.x, Egress Gateway does not provide ingress (DNAT/FIP) capability, so it is out of scope for this article's NAT deep-dive but worth knowing it exists.

<a id="design-comparison-at-a-glance"></a>
### Design comparison at a glance

![05-nat-gw-architecture.png](/.attachments/05-nat-gw-architecture-cbbbbb56-a32a-4bcd-be7c-48d44cd472c7.png)

*Figure 1: Both NAT implementation paths share the same logical topology - a VPC Logical Router with tenant subnets on one side and external connectivity on the other - but differ in where the NAT translation actually happens.*

---

<a id="section-2-snat-dnat-fip-processing"></a>
## 2 - SNAT, DNAT, and FIP processing for VPC traffic

This section breaks down exactly what happens to a packet during each type of NAT translation, in both implementation models.

<a id="sec-21-snat-outbound-source-translation"></a>
### 2.1 SNAT (outbound source translation)

**What it does:** When a Pod at `192.168.0.5` sends a packet to `8.8.8.8`, the source IP is rewritten to the EIP (say `10.5.204.115`) before the packet hits the physical network. Return traffic addressed to `10.5.204.115` is translated back to `192.168.0.5` using connection-tracking state.

**Iptables model:**
```yaml
kind: IptablesSnatRule
apiVersion: kubeovn.io/v1
metadata:
  name: snat01
spec:
  eip: eips01           # references an IptablesEIP
  internalCIDR: 192.168.0.0/24  # the whole subnet, or a single IP
```
Translation happens in the gateway Pod's POSTROUTING chain. The `internalCIDR` can be a full subnet CIDR or a single Pod IP.

**OVN-native model:**
```yaml
kind: OvnSnatRule
apiVersion: kubeovn.io/v1
metadata:
  name: snat-for-subnet-in-vpc
spec:
  ovnEip: snat-for-subnet-in-vpc
  vpcSubnet: vpc1-subnet1     # or specify vpc + v4IpCidr directly
```
This creates an entry in the OVN NB's NAT table:
```
nat 21d853b0-f7b4-40bd-9a53-31d2e2745739
    external ip: "10.5.204.115"
    logical ip: "192.168.0.0/24"
    type: "snat"
```

<a id="sec-22-dnat-inbound-destination-translation"></a>
### 2.2 DNAT (inbound destination translation)

**What it does:** An external client sends a TCP SYN to `10.5.204.120:8888`. The destination is rewritten to `192.168.0.10:80` (an internal Pod). Return traffic is reverse-translated back through conntrack.

**Iptables model:**
```yaml
kind: IptablesDnatRule
apiVersion: kubeovn.io/v1
metadata:
  name: dnat01
spec:
  eip: eipd01
  externalPort: '8888'
  internalIp: 192.168.0.10
  internalPort: '80'
  protocol: tcp
```

**OVN-native model:**
```yaml
kind: OvnDnatRule
apiVersion: kubeovn.io/v1
metadata:
  name: eip-dnat
spec:
  ovnEip: eip-dnat
  ipName: vpc-1-busybox01.vpc1   # or specify vpc + v4Ip directly
  protocol: tcp
  internalPort: "22"
  externalPort: "22"
```
OVN implements standalone DNAT through Logical Router load-balancer entries, visible in the NB DB. FIP (`dnat_and_snat`) uses the Logical Router NAT table directly rather than a load-balancer.

<a id="sec-23-fip-bidirectional-one-to-one-mapping"></a>
### 2.3 FIP (bidirectional one-to-one mapping)

**What it does:** A Floating IP ties an external address to a single internal address in both directions- outbound packets get their source rewritten (SNAT behavior), inbound packets get their destination rewritten (DNAT behavior). It is conceptually the simplest model for giving a Pod or VM a "public IP."

**Iptables model:**
```yaml
kind: IptablesFIPRule
apiVersion: kubeovn.io/v1
metadata:
  name: fip01
spec:
  eip: eipf01
  internalIp: 192.168.0.10
```

**OVN-native model:**
```yaml
kind: OvnFip
apiVersion: kubeovn.io/v1
metadata:
  name: eip-static
spec:
  ovnEip: eip-static
  ipName: vpc-1-busybox01.vpc1
  type: "centralized"          # or "distributed"
```
This creates a `dnat_and_snat` NAT entry in the logical router:
```
nat 813523e7-c68c-408f-bd8c-cba30cb2e4f4
    external ip: "10.5.204.101"
    logical ip: "192.168.0.2"
    type: "dnat_and_snat"
```

The `type` field on `OvnFip` (`centralized` or `distributed`) controls *where* the NAT translation occurs - see the next section.

---

<a id="section-3-centralized-vs-distributed"></a>
## 3 - Centralized vs. distributed gateway modes

Kube-OVN supports two fundamentally different traffic anchoring strategies. The distinction matters because it determines which node a packet physically exits from, which directly affects external-side source IP visibility, failover behavior, and performance.

<a id="sec-31-distributed-gateway"></a>
### 3.1 Distributed gateway

In distributed mode, **every node acts as a gateway for its own Pods.** When a Pod on Node-2 wants to reach the internet, the packet leaves Node-2 directly through its local `ovn0` NIC and the host's routing stack. With `natOutgoing: true`, the packet is SNAT'd using Node-2's host IP.

- **Pros:** No extra hop, lower latency, no bottleneck node.
- **Cons:** The external source IP varies per-node, so firewall whitelisting becomes harder; every node needs external-network reachability.
- **Scope:** Only applies to overlay subnets *in the default VPC*. Custom-VPC subnets do not support the distributed gateway of the default VPC.

When an `OvnFip` is created with `type: distributed`, the FIP NAT translation happens on the local node where the Pod is running. The packet exits through the local node's external-facing NIC.

<a id="sec-32-centralized-gateway"></a>
### 3.2 Centralized gateway

In centralized mode, **all egress traffic is steered to one or more designated gateway nodes.** Even if a Pod lives on Node-3, its outbound traffic hairpins through Node-1 (the gateway node) before exiting.

- **Pros:** Consistent external source IP (good for whitelisting), simpler external-network topology.
- **Cons:** Extra hop for non-local Pods, potential bottleneck on the gateway node, longer failover in primary-backup mode (minutes versus seconds).
- **Failover:** In primary-backup mode, failover relies on Kubernetes Node Ready status (can take minutes). In ECMP mode (introduced in Kube-OVN v1.12.0, refined in subsequent releases — see the [v1.12 changelog](https://github.com/kubeovn/kube-ovn/releases/tag/v1.12.0)), `kube-ovn-controller` actively probes node health via ping, detecting failures in ~5s and completing failover in 5–10s.

Configuration at the default-VPC subnet level:
```yaml
spec:
  gatewayType: centralized
  gatewayNode: "node1,node2"     # or use gatewayNodeSelectors
  natOutgoing: true
  enableEcmp: true               # optional: use ECMP instead of primary-backup
```

For custom VPCs with OVN-native NAT, the `OvnFip.spec.type: "centralized"` field anchors FIP traffic to the designated gateway-chassis node(s).

<a id="sec-33-how-the-vpc-nat-gateway-fits-in"></a>
### 3.3 How the VPC NAT Gateway fits in

The VPC NAT Gateway (iptables model) is inherently centralized - the gateway Pod runs on a specific node determined by `VpcNatGateway.spec.selector`, and all NAT traffic for that VPC flows through that single Pod. There is no distributed variant of the iptables gateway Pod; if you need distributed behavior in a custom VPC, use the OVN-native NAT path with `type: distributed`.

<a id="side-by-side-comparison"></a>
### Side-by-side comparison

| Aspect | Distributed | Centralized (default-VPC) | VPC NAT Gateway | OVN-native (custom VPC) |
|--------|------------|--------------------------|-----------------|------------------------|
| NAT location | Local node | Gateway node(s) | Gateway Pod | Gateway chassis |
| External IP consistency | Per-node | Per-gateway-node | Per-EIP | Per-EIP |
| Failover | N/A (local) | ECMP or primary-backup | Pod reschedule | BFD + ECMP |
| Custom VPC support | No | No | Yes | Yes |
| Ingress (DNAT/FIP) | Via OvnFip | Via NodePort / LB Service (no native DNAT) | Full DNAT/FIP | Full DNAT/FIP |

---

<a id="section-4-policy-and-nat-generation"></a>
## 4 - How logical router policies and NAT rules are generated

Understanding the chain from *Kubernetes CRD* to *OVN NB entry* to *OVS flow* is essential for effective debugging. Here is the generation model for each path.

<a id="sec-41-vpc--logical-router-mapping"></a>
### 4.1 VPC ↔ Logical Router mapping

Every `Vpc` resource maps to exactly one OVN `Logical_Router`. When `kube-ovn-controller` sees a VPC created, it creates the corresponding Logical Router in the OVN NB DB. Subnets under that VPC become Logical Switches connected via Logical Router Ports.

```
kubectl ko nbctl show vpc1
router 87ad06fd-71d5-4ff8-a1f0-54fa3bba1a7f (vpc1)
    port vpc1-vpc1-subnet1
        mac: "00:00:00:ED:8E:C7"
        networks: ["192.168.0.1/24"]
    port vpc1-external204
        mac: "00:00:00:EF:05:C7"
        networks: ["10.5.204.105/24"]
        gateway chassis: [7cedd14f... 276baccb... fd9f140c...]
```

<a id="sec-42-static-routes-and-policy-routes"></a>
### 4.2 Static routes and policy routes

`Vpc.spec.staticRoutes` generate entries in the Logical Router's routing table. For custom VPCs using external connectivity, you typically need a default route pointing to the physical gateway:

```yaml
spec:
  staticRoutes:
    - cidr: 0.0.0.0/0
      nextHopIP: 10.5.204.254   # physical gateway IP
      policy: policyDst
```

`Vpc.spec.policyRoutes` map directly to OVN Logical Router Policies - these provide finer-grained matching than routes. For example, you can drop traffic matching a specific source/destination pair at a given priority, or reroute it to a different next hop:

```yaml
spec:
  policyRoutes:
    - action: drop
      match: ip4.src==192.168.0.0/24 && ip4.dst==192.168.0.250
      priority: 11
    - action: reroute
      match: ip4.src==192.168.0.0/24
      nextHopIP: 192.168.0.252
      priority: 10
```

> **Standalone article:** additional information on how to check the static or policy based routes is detailed in KB [How to Dump the Routing Table of a Kube-OVN Logical Router - Overview](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2448290/How-to-Dump-the-Routing-Table-of-a-Kube-OVN-Logical-Router).

<a id="sec-43-nat-rule-generation--iptables-path"></a>
### 4.3 NAT rule generation - iptables path

When you create an `IptablesSnatRule` or `IptablesDnatRule`, here is what happens:

1. `kube-ovn-controller` validates the CRD and associates it with the right `VpcNatGateway` and `IptablesEIP`.
2. The controller updates the gateway Pod's configuration (typically through ConfigMap or direct annotation).
3. Inside the gateway Pod, a management process reads the desired NAT state and applies the corresponding `iptables -t nat` rules (PREROUTING for DNAT, POSTROUTING for SNAT).
4. The VPC Logical Router must have a static route pointing the relevant traffic toward the gateway Pod's `lanIp`.

There is **no OVN NB NAT entry** created in this path - all translation happens in the Pod's network namespace.

<a id="sec-44-nat-rule-generation--ovn-native-path"></a>
### 4.4 NAT rule generation - OVN-native path

When you create an `OvnSnatRule`, `OvnDnatRule`, or `OvnFip`:

1. `kube-ovn-controller` validates the CRD, finds the associated `OvnEip` (verifying it is `READY` and of type `nat`), and resolves the target VPC and internal IP.
2. The controller writes a NAT entry into the VPC's Logical Router in the OVN NB DB.
3. `ovn-northd` detects the NB change and compiles new logical flows into the SB DB.
4. `ovn-controller` on the gateway-chassis node(s) programs the corresponding OpenFlow rules in the local `br-int`.
5. Packets matching the NAT rule are rewritten by OVS conntrack actions on the gateway-chassis node.

<a id="sec-45-natoutgoingpolicyrules-default-vpc-only"></a>
### 4.5 natOutgoingPolicyRules (default VPC only)

For the default VPC, the `natOutgoingPolicyRules` field on a Subnet provides granular control over which traffic gets SNAT'd:

```yaml
spec:
  natOutgoing: true
  natOutgoingPolicyRules:
    - action: forward          # skip SNAT
      match:
        srcIPs: 10.0.11.0/30,10.0.11.254
    - action: nat              # apply SNAT
      match:
        srcIPs: 10.0.11.128/26
        dstIPs: 114.114.114.114,8.8.8.8
```

These rules are evaluated in order. The first match wins. If no rule matches and `natOutgoing` is true, traffic is SNAT'd by default. This generates corresponding OVN Logical Router Policy entries with `forward` or `nat` actions.

---

<a id="section-5-eip-fip-gateway-selection"></a>
## 5 - EIP, FIP, and gateway-selection interactions

These three concepts work together to determine the external identity, direction of NAT, and physical path of traffic. Getting any one of them wrong will cause silent failures.

<a id="sec-51-eip-lifecycle"></a>
### 5.1 EIP lifecycle

An EIP allocates a real external IP address from an underlay provider-network subnet and has the following lifecycle:

1. You create the underlay infrastructure: `ProviderNetwork` → `Vlan` → `Subnet` (for example, `external204` with CIDR `10.5.204.0/24`).
2. You create the EIP CRD for your chosen NAT path:
   - **iptables path:** create `IptablesEIP` (used by `VpcNatGateway` gateway-Pod NAT).
   - **OVN-native path:** create `OvnEip` (typically `type: nat` for SNAT/DNAT/FIP).
3. `kube-ovn-controller` allocates an available address from the selected external subnet and sets the EIP object to `READY`.
4. You bind the EIP to translation objects for that same path:
   - **iptables path:** `IptablesSnatRule`, `IptablesDnatRule`, or `IptablesFIPRule`.
   - **OVN-native path:** `OvnSnatRule`, `OvnDnatRule`, or `OvnFip`.

To model the **full** EIP lifecycle, below are the steps for release/deletion actions:

5. You remove dependent translation objects first (path-consistent teardown):
   - **iptables path:** delete `IptablesSnatRule` / `IptablesDnatRule` / `IptablesFIPRule` that reference the EIP.
   - **OVN-native path:** delete `OvnSnatRule` / `OvnDnatRule` / `OvnFip` that reference the EIP.
6. You verify no active references remain (for example, no NAT rule still points at that EIP), then delete the EIP object itself (`IptablesEIP` or `OvnEip`).
7. `kube-ovn-controller` reconciles deletion, removes OVN/iptables realizations, and returns the IP to the external-subnet allocation pool.
8. If the external subnet/provider objects are no longer needed, you can optionally clean them up last (`Subnet`/`Vlan`/`ProviderNetwork`) after confirming no other EIPs depend on them.

**OvnEip types:**
- `nat` - used for SNAT, DNAT, FIP operations.
- `lrp` - used for Logical Router Port connectivity (the VPC ↔ external-network link).
- `lsp` - used in BFD-based ECMP scenarios, providing an OVS internal port on the gateway node as an ECMP next-hop.

If `externalSubnet` is not specified, the default public network is used. To connect a VPC to multiple public networks, use `extraExternalSubnets` in the VPC spec and explicitly specify `externalSubnet` on each EIP.

<a id="sec-52-fip-as-the-bidirectional-binding"></a>
### 5.2 FIP as the bidirectional binding

A FIP ties everything together for a specific workload endpoint:

- **Egress:** Pod `192.168.0.2` → OVN SNAT rewrites source to `10.5.204.101` → external network sees `10.5.204.101`.
- **Ingress:** External sends to `10.5.204.101` → OVN DNAT rewrites destination to `192.168.0.2` → packet delivered to Pod.

FIPs can target Pods (by `ipName` referencing the Pod's IP CRD) or VIPs (by setting `ipType: vip` and pointing to a Vip resource). This is particularly useful for KubeVirt VMs using keepalived, kube-vip, or similar VIP-based HA solutions.

<a id="sec-53-gateway-selection-and-its-impact-on-nat"></a>
### 5.3 Gateway selection and its impact on NAT

The gateway-selection mechanism differs by path:

| Path | What selects the gateway | What it controls |
|------|------------------------|------------------|
| VPC NAT Gateway | `VpcNatGateway.spec.selector` | Which node the gateway Pod runs on |
| OVN-native (centralized) | `ovn-external-gw-config` ConfigMap or node labels (`ovn.kubernetes.io/external-gw=true`) | Which nodes host the gateway-chassis binding for the external Logical Router Port |
| OVN-native (distributed) | N/A (local node) | Traffic exits via local node's external NIC |

If gateway selection is wrong - for example, the gateway Pod is scheduled on a node without physical-network connectivity - NAT rules will exist in the control plane but packets will black-hole or be dropped at the OVS level.

<a id="sec-54-interaction-diagram"></a>
### 5.4 Interaction diagram

![06-eip-fip-gateway-interaction.png](/.attachments/06-eip-fip-gateway-interaction-c02048e0-3bf7-42c2-8c82-6afa967c6792.png)

*Figure 2: The relationship between EIP allocation, FIP binding, and gateway-chassis selection. Arrows show the dependency chain from underlay infrastructure through to packet delivery.*

---

<a id="section-6-packet-flow-walkthroughs"></a>
## 6 - Packet-flow walk-throughs

These are the core diagrams. Each walk-through covers both implementation paths.

<a id="sec-61-egress-podvm--nat-gateway--external-network"></a>
### 6.1 Egress: Pod/VM → NAT Gateway → External network

![02-egress-state.png](/.attachments/02-egress-state-bf3c2503-5ab2-4c76-9ff0-71322125520f.png)

*Figure 3a: High-level state diagram showing the egress decision path—iptables versus OVN-native NAT.*

![07-egress-packet-flow.png](/.attachments/07-egress-packet-flow-d930e8e8-d741-49a7-b257-434fe1317843.png)

*Figure 3b: Detailed egress packet flow for both VPC NAT Gateway (iptables) and OVN-native paths. Dashed 📦 nodes show the L3/L4 packet header (src IP:port, dst IP:port) before and after NAT rewrite — the ✏️ icon marks which field was rewritten. Numbered arrows use shared labels (1, 2, 3, 7) for common hops and suffixed labels (4a/4b, 5a/5b, 6a/6b) for path-specific hops.*

> **Diagram key:** Labels in square brackets (e.g., `[4a]`) map each prose step to its corresponding arrow in the diagrams above. Suffix **a** = iptables path, **b** = OVN-native path.

> **Note:** The two walk-throughs below use different source Pods to illustrate that any Pod in the SNAT CIDR is covered. The iptables example uses Pod `192.168.0.5`; the OVN-native example uses Pod `192.168.0.2`. Both belong to the same `192.168.0.0/24` subnet.

**Step-by-step (iptables path):**

1. `[1]` Pod `192.168.0.5` sends a TCP SYN to `8.8.8.8:443`.
2. `[2]` The packet enters the OVN Logical Switch for the tenant subnet.
3. `[3]` The Logical Switch forwards to the VPC Logical Router, which evaluates route and policy entries.
4. The Logical Router matches the default route (`0.0.0.0/0 → 192.168.0.254`, the gateway Pod's LAN IP).
5. `[4a]` The packet is delivered to the gateway Pod's `eth0` (LAN) interface.
6. `[5a]` Inside the gateway Pod, iptables POSTROUTING chain matches the SNAT rule for `192.168.0.0/24 → EIP 10.5.204.115`. The source IP is rewritten; conntrack creates a tracking entry.
7. `[6a]` The packet exits through the `net1` (WAN/Macvlan) interface onto the physical network.
8. `[7]` The physical gateway forwards the packet toward `8.8.8.8`.

**Step-by-step (OVN-native path):**

1. `[1]` Pod `192.168.0.2` sends a packet to `223.5.5.5`.
2. `[2]` Packet enters the Logical Switch, then the VPC Logical Router.
3. `[3]` The Logical Router evaluates policies and routes.
4. `[4b]` The router matches the NAT entry (`snat`, `external ip: 10.5.204.115`, `logical ip: 192.168.0.0/24`).
5. `[5b]` OVN conntrack rewrites the source IP to `10.5.204.115`.
6. `[6b]` The packet exits through the external Logical Router Port (`vpc1-external204`) bound to the gateway-chassis node. On that node, `ovn-controller` has programmed OVS flows in `br-int` that forward the packet out through the external provider bridge/NIC.
7. `[7]` The physical gateway routes the packet to `223.5.5.5`.

#### L2–L4 deep-dive: egress

The sequence diagram below expands the same egress flow to show every L2 frame header, ARP exchange, Geneve tunnel encapsulation, and MAC rewrite that the overview diagram abstracts away. It assumes the source Pod runs on Node-2 while the NAT gateway (Pod or chassis) is on Node-1.

![07a-egress-l2-l4-detail.png](/.attachments/07a-egress-l2-l4-detail-886f2b75-a8a5-4de0-9376-d6defbca0693.png)

*Figure 3c: Full L2–L4 egress sequence for both paths. Orange band = iptables path; blue band = OVN-native path. ARP exchanges show who answers (OVN logical ARP responder vs. physical router vs. GW Pod Macvlan). Geneve encap/decap steps show outer IP + VNI. Every arrow carries the exact L2 src/dst MAC, L3 src/dst IP, and L4 port tuple at that point in the flow.*

#### Return path (egress reply)

Reply packets follow the same physical path in reverse, with conntrack performing the reverse NAT translation automatically.

![13-egress-return-path.png](/.attachments/13-egress-return-path-5b31c9e4-85be-4362-9fd9-3921832f04b0.png)

*Figure 3d: Egress return path. The external server replies to the EIP; conntrack on the gateway (Pod or chassis) reverse-translates the destination back to the Pod's real IP. Orange band = iptables path; blue band = OVN-native path.*

1. The external server sends a reply packet addressed to the EIP (e.g., `8.8.8.8:443 → 10.5.204.115:49152`).
2. *Iptables path:* The packet arrives at the gateway Pod's `net1` interface. The conntrack entry created during the original SNAT matches, and iptables automatically reverse-translates the destination from the EIP back to the Pod's real IP (`192.168.0.5`). The packet is forwarded via `eth0` into the OVN fabric and delivered to the Pod.
3. *OVN-native path:* The packet arrives at the gateway-chassis node's external NIC and enters `br-int`. OVS conntrack matches the existing entry and reverse-translates the destination IP from `10.5.204.115` back to `192.168.0.5`. The packet is then Geneve-tunneled to the Pod's node and delivered.

<a id="sec-62-ingress-external-network--nat-gateway--podvm"></a>
### 6.2 Ingress: External network → NAT Gateway → Pod/VM

![03-ingress-state.png](/.attachments/03-ingress-state-37f29e78-760b-40e5-9905-9fa07d8e6eac.png)

*Figure 4a: High-level state diagram showing the ingress decision path—iptables versus OVN-native NAT.*

![08-ingress-packet-flow.png](/.attachments/08-ingress-packet-flow-47979ce6-b425-4f8e-a50b-d0e6573ad91e.png)

*Figure 4b: Detailed ingress packet flow for both VPC NAT Gateway (iptables) and OVN-native paths. Dashed 📦 nodes show the L3/L4 packet header before and after NAT rewrite — ✏️ marks rewritten fields. Path A shows a DNAT example (dst IP+port both change); Path B shows an FIP/dnat_and_snat example (dst IP changes, 1:1 mapping). Shared labels (1, 5, 6) and suffixed labels (2a/2b, 3a/3b, 4a) identify hops.*

**Step-by-step (iptables path):**

1. `[1]` External client sends a TCP SYN to `10.5.204.120:8888` (the EIP + external port).
2. `[2a]` The packet arrives at the gateway Pod's `net1` (WAN) Macvlan interface.
3. `[3a]` iptables PREROUTING chain matches the DNAT rule: `10.5.204.120:8888 → 192.168.0.10:80`. The destination is rewritten; conntrack creates a tracking entry.
4. `[4a]` The packet is forwarded through the `eth0` (LAN) interface into the VPC Logical Router.
5. `[5]` The Logical Router routes to the tenant Logical Switch.
6. `[6]` The Logical Switch delivers the packet to the target Pod at `192.168.0.10`.

**Step-by-step (OVN-native path - FIP example):**

1. `[1]` External client sends an ICMP echo request to `10.5.204.101` (the FIP's external IP).
2. `[2b]` The packet arrives at the gateway-chassis node's external NIC, enters `br-int`, and OVS matches it against the OVN `dnat_and_snat` flow.
3. `[3b]` Destination is rewritten: external `10.5.204.101` → logical `192.168.0.2`.
4. `[4b]` The Logical Router routes the rewritten packet toward the tenant subnet.
5. `[5]` The packet enters the tenant Logical Switch.
6. `[6]` The Logical Switch delivers the packet to the Pod at `192.168.0.2`.
6. The Pod responds; on egress the SNAT half of `dnat_and_snat` rewrites the source to `10.5.204.101`.

#### L2–L4 deep-dive: ingress

The sequence diagram below expands the ingress flow with the same level of L2–L4 detail—ARP resolution for EIPs, Geneve tunneling back to the Pod’s node, and every MAC/IP/port rewrite.

![08a-ingress-l2-l4-detail.png](/.attachments/08a-ingress-l2-l4-detail-1f9bdf71-ae9a-451c-835f-7b421aa7d4f0.png)

*Figure 4c: Full L2–L4 ingress sequence for both paths. Orange band = iptables DNAT; blue band = OVN-native FIP (dnat_and_snat). Key difference in ARP: for the iptables path the GW Pod’s Macvlan interface answers ARP for the EIP; for the OVN-native path ovn-controller programs an ARP responder flow in br-int that replies with the external LRP MAC.*
> **Note on MAC addresses:** All MAC addresses in the L2–L4 sequence diagrams (Figures 3c, 4c) are illustrative placeholders (e.g., `aa:bb:cc:00:00:05`, `ff:00:00:gw:gw:01`). In a real cluster, OVN auto-generates MACs for Logical Router Ports and Logical Switch Ports, while physical NICs and Macvlan interfaces use their hardware or configured MACs.

#### Return path (ingress reply)

Reply packets from the Pod must be reverse-translated so the external client sees the EIP/FIP as the source, not the Pod's private IP.

![14-ingress-return-path.png](/.attachments/14-ingress-return-path-5f753fb3-ce4b-4335-bdcb-249d4d1736f8.png)

*Figure 4d: Ingress return path. The Pod replies to the external client; conntrack (iptables) or the dnat_and_snat SNAT half (OVN-native) rewrites the source back to the EIP/FIP. Orange band = iptables path; blue band = OVN-native path.*

1. The Pod sends a reply (e.g., `192.168.0.10:80 → 203.0.113.50:12345`).
2. *Iptables path:* The packet is routed to the gateway Pod. Conntrack matches the DNAT entry and reverse-translates the source IP from `192.168.0.10:80` to `10.5.204.120:8888`. The packet exits through `net1`.
3. *OVN-native path (FIP):* The `dnat_and_snat` entry handles both directions automatically — the SNAT half rewrites the source from `192.168.0.2` to `10.5.204.101`. No separate SNAT rule is needed for FIP return traffic.

> **Key implication:** For standalone DNAT (not FIP), a complementary SNAT rule must exist to handle return traffic. Without it, the Pod's reply will carry its private source IP, and the external client will either drop or ignore it. FIPs (`dnat_and_snat`) handle both directions in a single rule.

---

<a id="section-7-failure-detection"></a>
## 7 - Failure scenarios and detection playbook

Knowing what *can* go wrong, and how to detect it fast, is half the battle. Here are the most common failures we have seen and their diagnostic paths.

<a id="sec-71-nat-table-mismatch"></a>
### 7.1 NAT table mismatch

**Symptom:** A NAT CRD exists (e.g., `OvnSnatRule` shows `READY=true`) but traffic from the tenant subnet exits with the Pod's real IP instead of the EIP, or external traffic to the EIP is silently dropped.

**Root cause:** The CRD was created but either (a) the NB NAT entry was not created, (b) the entry was created but `ovn-northd` failed to compile it into the SB DB, or (c) the gateway-chassis node's `ovn-controller` failed to install the corresponding OVS flows.

**Detection:**
```bash
# 1. Check CRD status
kubectl get osnat snat-for-subnet-in-vpc -o yaml   # look for READY, conditions

# 2. Check OVN NB — does the NAT entry exist?
kubectl ko nbctl lr-nat-list vpc1

# 3. Check OVN SB — did northd compile it?
kubectl ko sbctl dump-flows vpc1 | grep snat

# 4. Check OVS flows on gateway node — did ovn-controller install it?
ssh gateway-node "ovs-ofctl dump-flows br-int | grep nat"
```

<a id="sec-72-wrong-gateway-binding"></a>
### 7.2 Wrong gateway binding

**Symptom:** Traffic black-holes or exits from an unexpected node. External clients see a different source IP than the configured EIP, or cannot reach the EIP at all.

**Root cause:** The gateway-chassis list on the external LRP does not include the correct nodes, or the VpcNatGateway Pod is scheduled on a node without physical network connectivity.

**Detection:**
```bash
# For OVN-native: check gateway-chassis bindings
kubectl ko nbctl show vpc1   # look at "gateway chassis:" on the external port

# For iptables: verify gateway Pod placement
kubectl get pod -n kube-system -l app=vpc-nat-gw-gw1 -o wide

# Verify physical connectivity from the gateway node
ssh gateway-node "ping -c 3 10.5.204.254"   # can we reach the physical gateway?
```

<a id="sec-73-snat-miss-external-sees-internal-source-ip"></a>
### 7.3 SNAT miss (external sees internal source IP)

**Symptom:** External servers or firewalls see the Pod's private IP (`192.168.0.x`) instead of the EIP. This usually means SNAT is not being applied.

**Detection checklist:**
1. Verify the `snat` NAT entry exists and the `logical_ip` CIDR matches the Pod's address.
2. Verify the static route steers traffic toward the correct next-hop (for iptables model, toward `lanIp`; for OVN-native, toward the external gateway IP).
3. Run `ovn-trace` to confirm the SNAT rule is being hit.
4. If using `natOutgoingPolicyRules`, check that the Pod's IP is not matched by a `forward` rule with higher precedence.

<a id="sec-74-dnatfip-ingress-failure"></a>
### 7.4 DNAT/FIP ingress failure

**Symptom:** External clients cannot reach the internal workload through the EIP. Connection times out or is refused.

**Detection checklist:**
1. Verify the EIP is allocated and bound (`kubectl get oeip` or `kubectl get iptables-eip`).
2. Verify the DNAT/FIP entry exists in OVN NB (or in the gateway Pod's iptables).
3. Verify ARP: can the external network resolve the EIP's MAC? (After creating the EIP, ARP is enabled on the gateway's WAN interface.)
4. Verify protocol and port mapping: a mismatch between `externalPort` and `internalPort`, or a wrong protocol (TCP vs UDP), will silently drop traffic.
5. Verify return path: the response from the Pod must be SNAT'd back to the EIP. For FIP this is automatic (`dnat_and_snat`); for standalone DNAT, verify a complementary SNAT rule exists.

<a id="sec-75-overlap-between-iptables-and-ovn-nat-paths"></a>
### 7.5 Overlap between iptables and OVN NAT paths

**Symptom:** Non-deterministic behavior - sometimes NAT works, sometimes it doesn't - or double NAT occurs.

**Root cause:** Both `IptablesEIP`/`IptablesSnatRule` *and* `OvnEip`/`OvnSnatRule` exist for the same VPC endpoint or EIP.

**Detection:**
```bash
# Inventory all NAT objects for the VPC
kubectl get iptables-eip,iptables-snat,iptables-dnat,iptables-fip \
  -o wide | grep vpc1
kubectl get oeip,osnat,odnat,ofip \
  -o wide | grep vpc1

# If any EIP or internal IP appears in both sets, you have an overlap
```

**Resolution:** Pick one model per VPC and remove all CRDs from the other model.

<a id="sec-76-recommended-fault-drills"></a>
### 7.6 Recommended fault drills

| Drill | What you learn |
|-------|---------------|
| Delete one `OvnSnatRule` and immediately check `lr-nat-list` | Confirms controller → NB propagation latency and correctness |
| Change `VpcNatGateway.spec.selector` to point to a wrong node | Confirms how quickly the gateway Pod reschedules and how traffic re-routes |
| Create an `OvnDnatRule` with a deliberately wrong `internalPort` | Confirms that the detection pipeline catches the mismatch via `ovn-trace` or live test |
| Cordon a gateway-chassis node and observe failover | Measures real failover time and verifies BFD/ECMP behavior (OVN-native) |

<a id="sec-77-mtu-and-fragmentation"></a>
### 7.7 MTU and fragmentation

**Symptom:** Small packets (ping, DNS) work fine through the NAT gateway, but large transfers (SCP, HTTP file downloads) stall or time out. TCP connections establish but hang during data transfer.

**Root cause:** Geneve encapsulation adds ~50 bytes of overhead (outer Ethernet 14 + outer IP 20 + UDP 8 + Geneve 8 = 50 minimum, plus optional TLVs). If the underlay MTU is the standard 1500 bytes and the Pod MTU is also 1500, encapsulated packets exceed the underlay MTU and are either silently dropped or fragmented — and many firewalls/NICs drop fragmented UDP.

**Detection:**
```bash
# Check Pod MTU
kubectl exec -it <pod> -- ip link show eth0 | grep mtu

# Check node underlay MTU
ssh node1 "ip link show ens192 | grep mtu"

# Test with DF bit set (should fail if MTU is wrong)
kubectl exec -it <pod> -- ping -M do -s 1400 8.8.8.8

# Check for ICMP "need to frag" being blocked
ssh gateway-node "conntrack -S | grep drop"
```

**Resolution:**
- Set the Kube-OVN Subnet MTU to account for encapsulation overhead: `spec.mtu: 1400` (for Geneve with standard 1500 underlay) or increase the underlay MTU to ≥ 1600 (jumbo frames preferred: 9000).
- Verify that ICMP type 3 code 4 ("Fragmentation Needed") is not blocked by any firewall between nodes — this is required for Path MTU Discovery to function.

<a id="sec-78-conntrack-table-exhaustion"></a>
### 7.8 Conntrack table exhaustion

**Symptom:** New connections through the NAT gateway fail intermittently while existing connections continue to work. Kernel logs may show `nf_conntrack: table full, dropping packet`.

**Root cause:** Every NATed connection (SNAT, DNAT, FIP) creates a conntrack entry. High-traffic workloads — especially those with many short-lived connections (HTTP APIs, DNS resolvers) — can exhaust the conntrack table.

**Detection:**
```bash
# Current conntrack count vs. maximum (on gateway node or GW Pod)
conntrack -C
sysctl net.netfilter.nf_conntrack_max

# Check for drops in kernel counters
dmesg | grep "nf_conntrack: table full"
conntrack -S | grep drop

# For iptables gateway Pod, check inside the Pod:
kubectl exec -n kube-system <gw-pod> -- conntrack -C
kubectl exec -n kube-system <gw-pod> -- sysctl net.netfilter.nf_conntrack_max
```

**Resolution:**
- Increase the maximum: `sysctl -w net.netfilter.nf_conntrack_max=524288` (default is often 65536 or 131072).
- Reduce conntrack timeout for short-lived protocols: `sysctl -w net.netfilter.nf_conntrack_tcp_timeout_time_wait=30`.
- For OVN-native NAT, the conntrack table lives in the OVS kernel datapath on the gateway-chassis node — tune sysctl on that host.

---

<a id="references"></a>
## References

<a id="primary-sources-project-official"></a>
### Primary sources (project-official)

| Source | URL |
|--------|-----|
| Kube-OVN documentation (v1.15.x) | https://kubeovn.github.io/docs/v1.15.x/en/ |
| VPC configuration and NAT Gateway | https://kubeovn.github.io/docs/v1.15.x/en/vpc/vpc/ |
| OVN EIP, FIP, and SNAT | https://kubeovn.github.io/docs/v1.15.x/en/vpc/ovn-eip-fip-snat/ |
| Subnet configuration and gateway modes | https://kubeovn.github.io/docs/v1.15.x/en/guide/subnet/ |
| Default VPC NAT Policy Rule | https://kubeovn.github.io/docs/v1.15.x/en/advance/nat-policy-rule/ |
| Architecture reference | https://kubeovn.github.io/docs/v1.15.x/en/reference/architecture/ |

<a id="secondary-sources-architecture-and-implementation"></a>
### Secondary sources (architecture and implementation)

| Source | URL |
|--------|-----|
| Kube-OVN GitHub repository | https://github.com/kubeovn/kube-ovn |
| DeepWiki: Kube-OVN overview | https://deepwiki.com/kubeovn/kube-ovn/1-overview |
| DeepWiki: NAT Gateway and external connectivity | https://deepwiki.com/kubeovn/kube-ovn/5.4-nat-gateway-and-external-connectivity |

<a id="foundational-protocol-references"></a>
### Foundational protocol references

| Source | URL |
|--------|-----|
| OVN Northbound DB schema (Logical Router, NAT, Policy) | https://man7.org/linux/man-pages/man5/ovn-nb.5.html |
| OVN Architecture | https://man7.org/linux/man-pages/man7/ovn-architecture.7.html |

<a id="related-internal-articles"></a>
### Related internal articles

| Source | URL |
|--------|-----|
| Collect Simultaneous Network Traces Across the Kube-OVN Packet Path in the NAT GW scenario | [[InProgress]Collect Simultaneous Network Traces Across the Kube-OVN Packet Path in the NAT GW scenario - Overview](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2448281/-InProgress-Collect-Simultaneous-Network-Traces-Across-the-Kube-OVN-Packet-Path-in-the-NAT-GW-scenario) |
| How to Dump the Routing Table of a Kube-OVN Logical Router | [How to Dump the Routing Table of a Kube-OVN Logical Router - Overview](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2448290/How-to-Dump-the-Routing-Table-of-a-Kube-OVN-Logical-Router) |
| Using ovn-trace to Simulate NAT Gateway Flows in Kube-OVN | [Using ovn-trace to Simulate NAT Gateway Flows in Kube-OVN - Overview](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2448306/Using-ovn-trace-to-Simulate-NAT-Gateway-Flows-in-Kube-OVN) |
| Kube-OVN VPC NAT Gateway - CRD Interactions and Verification | [Kube-OVN VPC NAT Gateway - CRD Interactions and Verification - Overview](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2448304/Kube-OVN-VPC-NAT-Gateway-CRD-Interactions-and-Verification) |