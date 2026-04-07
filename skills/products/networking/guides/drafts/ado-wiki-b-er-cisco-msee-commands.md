---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Advanced Troubleshooting/MSEE Commands By Device/Cisco MSEE Commands"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FMSEE%20Commands%20By%20Device%2FCisco%20MSEE%20Commands"
importDate: "2026-04-06"
type: troubleshooting-guide
sensitivity: internal-only
---

> ⚠️ **INTERNAL ONLY — Do NOT share commands or output with customers.**

# Cisco MSEE Commands

## Description

This is for advanced troubleshooting only. These commands should not be used for initial investigation into an ExpressRoute circuit issue.

The following commands are for Cisco MSEE devices. Must be run from a vsaw device via Jarvis Actions.

- MSEE = Microsoft Enterprise Edge Router
- CE = Customer Edge

## Interface Checks

- **Interface**: `show interface <interface>`
- **Sub Interface**: `show interface <sub-interface>`

## Rate Limiting

Cisco uses a policy-map applied to the sub-interface:

- **CIR (Committed Information Rate)**: same as circuit bandwidth in bps with 20% buffer
- **Burst-Size (bc)**: configurable burst in milliseconds of class bandwidth

Commands:
- `show run policy-map RL-<servicekey> | sec class` — shows rate limiting policy
- `show run interface <sub-interface>` — confirms policy is applied

## ICMP/Ping Tests

Brooklyn > ExR Diagnostic Operations > Run Ping Command (same as Arista).

### Expected ICMP drops on Cisco

With `repeat 1000 size 1000`, Cisco may show ~2% packet loss due to **CCoP (Control Plane Policing)** policy on all Cisco devices. This is **expected behavior**, not an issue. CCoP protects the control plane against DoS attacks.

Example normal output: `Success rate is 98 percent (981/1000)`

Key ping scenarios:
- MSEE subinterface → CE
- Tunnel Interface → CE (may show 100% drop — expected)
- MSEE subinterface ↔ MSEE tunnel interface
- MSEE subinterface → ExpressRoute GW

If unexpected ping drops → engage TA via Teams with all Jarvis links.

## BFD

`show bfd neighbors` filtered by CE IP.

## BGP Private Peering

### VRF Neighbor Summary
- `Active` → BGP session down
- `Idle` → administratively down
- Number → prefixes received

### Key Commands
- Advertised routes MSEE → CE
- Advertised routes CE → MSEE (⚠️ watch for customer re-advertising Azure routes back)
- All routes by VRF
- Best Route Selection: `show ip bgp vpnv4 vrf <vrf> <prefix>`
- Neighbor Advanced Detail: `show ip bgp vpnv4 vrf <vrf> neighbor <ip>`

## BGP Route Flaps

### Identification
`show ip route vrf <vrf>` — shows routes learned within last minute; very low timers → flapping.

Also run `show ip bgp vpnv4 vrf <vrf#>` to see all routes received (vs Dump Routing which shows only final accepted routes).

### Route Re-advertisement Loop (Known Issue #12541)
**Symptom**: Routes continuously flapping, causing high Gateway Tenant CPU utilization.

**Root Cause**: Customer re-advertising Azure routes back to Azure:
1. Azure advertises route → customer learns it
2. Customer re-advertises back to Azure
3. Azure stops advertising (now learned from customer)
4. Customer stops re-advertising
5. Azure re-advertises → loop repeats

**Identification**: Look for prefix marked with `e` (external) in `show ip bgp vpnv4 vrf` output.

**Resolution**: Customer must fix their route policy to not re-advertise Azure-learned routes back to Azure.

## BGP IPv6

`show ip bgp vpnv6 unicast vrf <vrf>`

## VRF All Routes

`show ip route vrf <vrf>` — all routes in VRF.

## BGP Microsoft Peering

`show ip bgp neighbors <peer ip>`

## Current Logs

Last 7–8 minutes of syslog. For historical logs → Log Sources For Azure ExpressRoute wiki.

## CPU Utilization

`show proc cpu` — monitors MSEE CPU usage.

## ARP

- All ARP entries: `show arp`
- Filter by VRF: `show ip arp vrf <vrf>`

## Light Levels

Acceptable Tx and Rx: **-10 dBm to 0 dBm**

For Ethernet interface (e.g., TenGigabitEthernet2/3/0):
- Command: `show hw-module subslot #/# transceiver # status`

For Port Channel — find active members first, then run per-member transceiver check.

If light levels outside range → engage TA in ExpressRoute Teams channel.

## Show Running Configuration

- Without SAW/VSAW: `https://coretools.azurefd.net/#/device/config?target=<msee-name>`
- With SAW/VSAW: `show run vrf <vrf>` via Jarvis Actions
