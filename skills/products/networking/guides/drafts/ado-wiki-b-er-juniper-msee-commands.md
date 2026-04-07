---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Advanced Troubleshooting/MSEE Commands By Device/Juniper MSEE Commands"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FMSEE%20Commands%20By%20Device%2FJuniper%20MSEE%20Commands"
importDate: "2026-04-06"
type: troubleshooting-guide
sensitivity: internal-only
---

> ⚠️ **INTERNAL ONLY — Do NOT share commands or output with customers.**

# Juniper MSEE Commands

## Description

This is for advanced troubleshooting only. These commands should not be used for initial investigation into an ExpressRoute circuit issue.

The following commands are for Juniper MSEE devices. Must be run from a vsaw device via Jarvis Actions.

- MSEE = Microsoft Enterprise Edge Router
- CE = Customer Edge

## Interface Checks

Find interface/subinterface info in Dump Circuit:
```
DEVICE NAME: exr03.chg PA: 10.2.146.130 TYPE: JunosMSEE
PORT NAME: xe-0/1/10:0          <-- Interface/Port (include the :0)
SUBINTERFACE NAME: xe-0/1/10:0.11  <-- Sub Interface
```

### Getting MAC Address (Juniper ARP Not Showing Microsoft Side - Issue #30578)

If customer cannot see ARP from Microsoft side, obtain MSEE interface MAC address via Jarvis and share **only the MAC address** (no additional info). Confirm with TA before sharing.

## Rate Limiting

Juniper uses filters (firewall rules) and policers attached to sub-interface:

- **Bandwidth-limit**: circuit bandwidth in bps with 20% buffer
- **Burst-Size-Limit**: allows short bursting above average rate

Commands:
- `show configuration firewall family inet filter rate-limit-private-<servicekey>-v4 | display set`
- `show configuration firewall policer rate-limit-<servicekey> | display set`
- `show configuration interface <subinterface>` — confirms policer is applied

## ICMP/Ping Tests

Two ping modes:
- **Normal**: max `count 50` (do not exceed 100)
- **Rapid**: `rapid count 1000` — faster, uses icmpv4-rate-limit

### Expected drops with Rapid ping
With `count 100 size 1350 rapid`, ~3% drop is **expected behavior** due to Juniper icmpv4-rate-limit:
```
set system internet-options icmpv4-rate-limit packet-rate 1000
set system internet-options icmpv4-rate-limit bucket-size 5
```

Key ping scenarios:
- MSEE subinterface → CE (Normal and Rapid)
- MSEE subinterface ↔ MSEE tunnel interface
- MSEE subinterface → ExR GW (IN_0 and IN_1)

Tunnel format: `fti0.<vlan>`, e.g., `fti0.528`

If unexpected drops → engage TA via Teams with all Jarvis links.

## BFD

`show bfd session detail` filtered by CE IP.

## MACSec

If ARP goes down after enabling MACSec → check MACSec session table via Jarvis.

## BGP Private Peering

### VRF Neighbor Summary
`show bgp summary` filtered by VRF.

### Key Commands
- Advertised routes MSEE → CE: `show route advertising-protocol bgp <CE-IP> table <vrf>.inet.0`
  - For Microsoft Peering (no VRF): table = `inet.0`
- Advertised routes CE → MSEE: `show route receive-protocol bgp <CE-IP> table <vrf>.inet.0`
- All routes by VRF: `show route table <vrf>.inet.0`
- Detailed neighbor: include `detail` flag

### Note on Table Names
- Private Peering: add `.inet.0` to VRF name (found in Dump Circuit)
- Microsoft Peering: use `inet.0` only

## BGP IPv6 Private Peering

- Validate IPv6 route table: `show route table <vrf>.inet6.0`
- All routes from IPv6 VRF: `show route receive-protocol bgp <CE-IPv6> table <vrf>.inet6.0`

## BGP Microsoft Peering

- Summary: `show bgp neighbor <peer-ip> summary`
- Advertised routes with route filters
- Received prefixes from CE

## VRF Configuration

`show configuration routing-instances <vrf>` — full VRF config.

## CPU Utilization

`show system processes extensive` — breakdown by:
- **User**: user-space processes (RPD, daemons)
- **Background**: background processes
- **Kernel**: kernel processes
- **Interrupt**: interrupt handling
- **Idle**: unused CPU

## ARP

`show arp interface <subinterface>` — ARP entries for specific sub-interface.

## Light Levels

**Acceptable range: -5 dBm to 5 dBm (Rx or Tx)**

Note: Anything below -10 dBm requires ExpressRoute operations team investigation.

`show interfaces diagnostics optics <interface>` via Jarvis.

If light levels outside range → engage TA in ExpressRoute Teams channel with all Jarvis links.

## Show Running Configuration

- Without SAW/VSAW: `https://coretools.azurefd.net/#/device/config?target=<msee-name>`
- With SAW/VSAW: Via Jarvis Actions
