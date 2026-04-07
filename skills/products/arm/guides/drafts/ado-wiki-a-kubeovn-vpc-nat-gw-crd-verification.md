---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/Kube-OVN VPC NAT Gateway - CRD Interactions and Verification"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Rack%20Scale/Readiness/ALRS%20Kube-OVN/Kube-OVN%20VPC%20NAT%20Gateway%20-%20CRD%20Interactions%20and%20Verification"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> A concise runbook for engineers working with the Kube-OVN **VPC NAT Gateway** (iptables path). Covers `VpcNatGateway`, `IptablesEIP`, `IptablesSnatRule`, `IptablesDnatRule`, and `IptablesFIPRule` - with inventory commands, a CRD correlation table, YAML specs, validation checklists, and teardown procedures. OVN-native NAT (`OvnEip` / `OvnSnatRule` / `OvnFip`) is included as a reference for environments that use that path instead.

---

## Table of Contents

- [When to use this KB](#when-to-use-this-kb)
- [Background: two VPC NAT paths](#sec-background)
- [1 - Inventory commands](#sec-1-inventory)
- [2 - CRD correlation table](#sec-2-correlation-table)
- [3 - VpcNatGateway: the gateway Pod](#sec-3-vpcnatgateway)
- [4 - IptablesEIP: external IP allocation](#sec-4-iptables-eip)
- [5 - IptablesSnatRule, IptablesDnatRule, IptablesFIPRule](#sec-5-iptables-nat-rules)
  - [5.1 IptablesSnatRule - outbound SNAT](#sec-51-snat)
  - [5.2 IptablesDnatRule - inbound port-forward](#sec-52-dnat)
  - [5.3 IptablesFIPRule - 1:1 floating IP](#sec-53-fip)
- [6 - CRD dependency map](#sec-6-dependency-map)
- [7 - OVN-native NAT reference](#sec-7-ovn-native-ref)
- [8 - Validation checklist](#sec-8-validation)
- [9 - Teardown order](#sec-9-teardown)
- [Troubleshooting](#troubleshooting)
  - [IptablesEIP not reachable from outside](#sec-t-iptables-eip-unreachable)
  - [NAT rule READY but traffic not translated](#sec-t-nat-not-working)
  - [Mixing iptables and OVN-native objects](#sec-t-mixing-paths)
- [Command reference](#command-reference)

---

<a id="when-to-use-this-kb"></a>
## When to use this KB

Use this KB when you need to:

- Confirm all VPC NAT Gateway CRD objects are deployed and healthy.
- Verify that a `VpcNatGateway` and its associated EIP/SNAT/DNAT/FIP rules are realized inside the gateway Pod.
- Document the current NAT state for a change record or incident.
- Understand the difference between the iptables gateway path and the OVN-native NAT path.

---

<a id="sec-background"></a>
## Background: two VPC NAT paths

Kube-OVN provides two independent, mutually exclusive paths for VPC external NAT:

| Path | Where NAT executes | Key CRDs | OVN NB entry? |
|------|--------------------|----------|---------------|
| **Iptables gateway Pod** *(this KB)* | Dedicated gateway Pod (user-space iptables) | `VpcNatGateway`, `IptablesEIP`, `IptablesSnatRule`, `IptablesDnatRule`, `IptablesFIPRule` | No — rules live inside the Pod |
| **OVN-native NAT** *(reference only)* | OVN Logical Router (kernel OVS conntrack) | `OvnEip`, `OvnSnatRule`, `OvnDnatRule`, `OvnFip` | Yes — `lr-nat-list` / LB |

> **Rule:** never mix both paths for the same EIP or internal workload. Pick one per VPC NAT endpoint.

---

<a id="sec-1-inventory"></a>
## 1 - Inventory commands

```bash
# ── Iptables gateway objects ──────────────────────────-
kubectl get vpc-nat-gw -o wide
kubectl get iptables-eip -o wide
kubectl get iptables-snat -o wide
kubectl get iptables-dnat -o wide
kubectl get iptables-fip -o wide

# ── OVN-native objects (if used in this environment) ──-
kubectl get oeip -o wide
kubectl get ofip -o wide
kubectl get osnat -o wide
kubectl get odnat -o wide
```

Check gateway Pod health and applied iptables rules:

```bash
kubectl get pods -l app=vpc-nat-gw -o wide
kubectl exec -it <vpc-nat-gw-pod> -- iptables -t nat -L -nv
```

---

<a id="sec-2-correlation-table"></a>
## 2 - CRD correlation table

| CRD Object | Purpose | Expected Realization | Confirm |
|------------|---------|---------------------|---------|
| `VpcNatGateway` | Provisions the gateway Pod; anchors all iptables NAT objects | Gateway Pod `Running`; Pod attached to VPC subnet | Pod status `Running`; `kubectl get vpc-nat-gw` shows `READY` |
| `IptablesEIP` | Allocates a routable external IP for iptables-path NAT | Secondary IP on the Pod's uplink interface | `READY=true`; `V4IP` populated; `ip addr` inside Pod shows the IP |
| `IptablesSnatRule` | Outbound SNAT — rewrites source IP for an internal CIDR | `MASQUERADE` / SNAT rule in Pod's `nat` table | `READY=true`; rule visible in `iptables -t nat -L` inside Pod |
| `IptablesDnatRule` | Inbound port-forward from external port to internal Pod | DNAT rule in Pod's `nat` table | `READY=true`; port mapping visible in `iptables -t nat -L` |
| `IptablesFIPRule` | 1:1 bidirectional floating IP mapping | DNAT + SNAT (or MASQUERADE) rules for the IP pair | `READY=true`; both directions visible in `iptables -t nat -L` |
| `OvnEip` (type: `nat`) | External IP for OVN-native SNAT / DNAT / FIP | Bound to `external_ip` of an OVN NB NAT entry | `READY=true`; `v4Ip` correct; entry in `lr-nat-list` |
| `OvnFip` | OVN-native 1:1 bidirectional mapping | `dnat_and_snat` entry in OVN LR NAT table | `READY=true`; correct IPs in `kubectl ko nbctl lr-nat-list <vpc>` |
| `OvnSnatRule` | OVN-native outbound SNAT | `snat` entry in OVN LR NAT table | `READY=true`; CIDR and EIP match spec |
| `OvnDnatRule` | OVN-native inbound DNAT | OVN LR load-balancer entry (not in `lr-nat-list`) | `READY=true`; VIP → backend in `kubectl ko nbctl list load_balancer` |

---

<a id="sec-3-vpcnatgateway"></a>
## 3 - VpcNatGateway: the gateway Pod

`VpcNatGateway` provisions a dedicated NAT gateway Pod attached to your custom VPC. All iptables NAT objects are anchored to a `VpcNatGateway` instance via its name.

```yaml
apiVersion: kubeovn.io/v1
kind: VpcNatGateway
metadata:
  name: gw1
spec:
  vpc: vpc1
  subnet: vpc1-subnet1
  lanIp: 192.168.0.254         # static IP for the gateway Pod inside the VPC
  externalSubnets:
    - external204
```

Verify:

```bash
kubectl get vpc-nat-gw gw1 -o wide
kubectl get pods -l app=vpc-nat-gw,vpc-nat-gw=gw1 -o wide
```

The gateway Pod must be `Running` before any EIP, SNAT, DNAT, or FIP rules can take effect.

---

<a id="sec-4-iptables-eip"></a>
## 4 - IptablesEIP: external IP allocation

`IptablesEIP` allocates a routable external IP from the provider-network subnet. The controller adds it as a secondary IP on the gateway Pod's uplink interface.

```yaml
apiVersion: kubeovn.io/v1
kind: IptablesEIP
metadata:
  name: eip-gw1-snat
spec:
  natGwDp: gw1                 # must match the VpcNatGateway name
  externalSubnet: external204
```

Verify:

```bash
kubectl get iptables-eip eip-gw1-snat -o wide

# Confirm IP is present on the Pod's uplink
GW_POD=$(kubectl get pod -l app=vpc-nat-gw,vpc-nat-gw=gw1 -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $GW_POD -- ip addr show
```

Expected: `READY=true`, `V4IP` populated from the external subnet, and the IP visible on the uplink interface inside the Pod.

---

<a id="sec-5-iptables-nat-rules"></a>
## 5 - IptablesSnatRule, IptablesDnatRule, IptablesFIPRule

All three types reference a `VpcNatGateway` (via the EIP's `natGwDp`) and an `IptablesEIP`. The controller writes the corresponding iptables/nftables rules into the gateway Pod — **no OVN NB entry is created**.

<a id="sec-51-snat"></a>
### 5.1 IptablesSnatRule - outbound SNAT

Rewrites the source IP of all outbound traffic from `internalCIDR` to the EIP:

```yaml
apiVersion: kubeovn.io/v1
kind: IptablesSnatRule
metadata:
  name: snat-gw1-subnet1
spec:
  eip: eip-gw1-snat
  internalCIDR: 192.168.0.0/24
```

<a id="sec-52-dnat"></a>
### 5.2 IptablesDnatRule - inbound port-forward

Forwards `EIP:externalPort` to an internal Pod at `internalIp:internalPort`:

```yaml
apiVersion: kubeovn.io/v1
kind: IptablesDnatRule
metadata:
  name: dnat-gw1-ssh
spec:
  eip: eip-gw1-ssh
  protocol: tcp
  externalPort: "2222"
  internalIp: 192.168.0.10
  internalPort: "22"
```

<a id="sec-53-fip"></a>
### 5.3 IptablesFIPRule - 1:1 floating IP

Maps an EIP to exactly one internal IP in both directions:

```yaml
apiVersion: kubeovn.io/v1
kind: IptablesFIPRule
metadata:
  name: fip-gw1-vm01
spec:
  eip: eip-gw1-vm01
  internalIp: 192.168.0.20
```

Verify all rules are applied inside the Pod:

```bash
GW_POD=$(kubectl get pod -l app=vpc-nat-gw,vpc-nat-gw=gw1 -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $GW_POD -- iptables -t nat -L -nv --line-numbers
```

---

<a id="sec-6-dependency-map"></a>
## 6 - CRD dependency map

```
ProviderNetwork → Vlan → Subnet (external204)
                              │
                              ▼
                        IptablesEIP  ──── spec.natGwDp ────▶  VpcNatGateway Pod
                       /     |      \                          (iptables rules inside)
                      ▼      ▼       ▼
         IptablesSnatRule  IptablesDnatRule  IptablesFIPRule
```

Key constraints:
- `VpcNatGateway` Pod must be `Running` before any rule takes effect.
- Each `IptablesEIP` belongs to exactly one `VpcNatGateway`.
- An EIP can only be used by one NAT rule object at a time.

---

<a id="sec-7-ovn-native-ref"></a>
## 7 - OVN-native NAT reference

If this environment uses the OVN-native path instead of the iptables gateway, the relevant CRDs are `OvnEip`, `OvnSnatRule`, `OvnDnatRule`, and `OvnFip`. Rules are realized as entries in the OVN Northbound DB Logical Router NAT table, not inside a Pod.

Quick verification:

```bash
kubectl ko nbctl lr-nat-list <vpc>    # shows snat + dnat_and_snat entries
kubectl ko nbctl list load_balancer   # shows OvnDnatRule entries (realized as LB)
kubectl ko nbctl show <vpc>           # topology, gateway chassis, attached LBs
```

For full OVN-native coverage, see the companion KB: *KB-Kube-OVN-Logical-Router-Route-Table-Dump*.

---

<a id="sec-8-validation"></a>
## 8 - Validation checklist

**VpcNatGateway**
- [ ] `kubectl get vpc-nat-gw` shows `READY=true`
- [ ] Gateway Pod is `Running` and scheduled on the expected node

**IptablesEIP**
- [ ] `READY=true` and `V4IP` is populated from the expected external subnet
- [ ] IP is present on the Pod's uplink: `ip addr show` inside the Pod

**SNAT / DNAT / FIP rules**
- [ ] All rule objects show `READY=true`
- [ ] `iptables -t nat -L -nv` inside the Pod shows the expected rules

**Traffic**
- [ ] Egress from VPC subnet: source IP observed as EIP (for SNAT / FIP)
- [ ] Ingress to EIP: connection reaches the internal Pod (for DNAT / FIP)

---

<a id="sec-9-teardown"></a>
## 9 - Teardown order

Always delete bottom-up to avoid reconciliation errors:

```
1. Delete IptablesSnatRule / IptablesDnatRule / IptablesFIPRule
2. Confirm rules are gone from the Pod:  iptables -t nat -L -nv
3. Delete IptablesEIP
4. Delete VpcNatGateway
5. (Optional) Delete external Subnet / Vlan / ProviderNetwork
   only if nothing else depends on them
```

```bash
kubectl delete iptables-snat snat-gw1-subnet1
kubectl delete iptables-dnat dnat-gw1-ssh
kubectl delete iptables-fip fip-gw1-vm01

GW_POD=$(kubectl get pod -l app=vpc-nat-gw,vpc-nat-gw=gw1 -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $GW_POD -- iptables -t nat -L -nv   # confirm rules removed

kubectl delete iptables-eip eip-gw1-snat eip-gw1-ssh eip-gw1-vm01
kubectl delete vpc-nat-gw gw1
```

---

<a id="troubleshooting"></a>
## Troubleshooting

<a id="sec-t-iptables-eip-unreachable"></a>
### IptablesEIP not reachable from outside

**Symptoms:** All objects show `READY=true`, but the EIP does not respond from outside the cluster.

```bash
# 1. Confirm the gateway Pod is Running
kubectl get pod -l app=vpc-nat-gw,vpc-nat-gw=<gw-name> -o wide

# 2. Confirm the EIP is present on the Pod's uplink interface
GW_POD=$(kubectl get pod -l app=vpc-nat-gw,vpc-nat-gw=<gw-name> -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $GW_POD -- ip addr show

# 3. Confirm iptables rules are applied
kubectl exec -it $GW_POD -- iptables -t nat -L -nv --line-numbers

# 4. Check controller logs for EIP binding errors
kubectl -n kube-system logs -l app=kube-ovn-controller --tail=50 | grep -i iptables-eip
```

Common causes:
- EIP not added as a secondary IP on the uplink — controller reconciliation error.
- Upstream router has no ARP or route for the EIP subnet — verify provider-network routing.

<a id="sec-t-nat-not-working"></a>
### NAT rule READY but traffic not translated

**Symptoms:** Rule shows `READY=true`, iptables rule exists, but traffic is not being NATed.

```bash
# Check ip_forward is enabled inside the Pod
kubectl exec -it $GW_POD -- sysctl net.ipv4.ip_forward

# Check conntrack table for the flow
kubectl exec -it $GW_POD -- conntrack -L | grep <internal-ip>

# Check iptables rule ordering (earlier ACCEPT rules can bypass NAT)
kubectl exec -it $GW_POD -- iptables -t nat -L -nv --line-numbers
kubectl exec -it $GW_POD -- iptables -L FORWARD -nv
```

Common causes:
- `ip_forward` disabled inside the Pod namespace.
- An earlier ACCEPT rule in the FORWARD chain bypasses NAT.
- Subnet routing not pointing default gateway to the VpcNatGateway `lanIp`.

<a id="sec-t-mixing-paths"></a>
### Mixing iptables and OVN-native objects

**Symptoms:** Non-deterministic NAT, double NAT, or asymmetric traffic.

```bash
kubectl get iptables-eip,oeip -o wide | grep <vpc-name-or-subnet>
```

If the same external or internal IP appears in both sets, there is an overlap. Pick one path per VPC endpoint and remove all objects from the other path.

---

<a id="command-reference"></a>
## Command reference

```bash
# ── Inventory ──────────────────────────────────────────────────────────────
kubectl get vpc-nat-gw -o wide
kubectl get iptables-eip -o wide
kubectl get iptables-snat -o wide
kubectl get iptables-dnat -o wide
kubectl get iptables-fip -o wide

# OVN-native (if used)
kubectl get oeip,osnat,odnat,ofip -o wide

# ── Gateway Pod inspection ─────────────────────────────────────────────────
GW_POD=$(kubectl get pod -l app=vpc-nat-gw,vpc-nat-gw=<gw-name> -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $GW_POD -- iptables -t nat -L -nv --line-numbers
kubectl exec -it $GW_POD -- ip addr show
kubectl exec -it $GW_POD -- conntrack -L

# ── OVN-native NB verification ─────────────────────────────────────────────
kubectl ko nbctl lr-nat-list <vpc>              # snat + dnat_and_snat
kubectl ko nbctl list load_balancer             # OvnDnatRule LB entries
kubectl ko nbctl show <vpc>                     # topology + gateway chassis

# ── Teardown ───────────────────────────────────────────────────────────────
kubectl delete iptables-snat <name>
kubectl delete iptables-dnat <name>
kubectl delete iptables-fip <name>
kubectl delete iptables-eip <name>
kubectl delete vpc-nat-gw <name>
```
