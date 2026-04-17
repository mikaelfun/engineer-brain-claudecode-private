---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Advanced Troubleshooting/MSEE Commands By Device/Arista MSEE Commands"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FMSEE%20Commands%20By%20Device%2FArista%20MSEE%20Commands"
importDate: "2026-04-06"
type: troubleshooting-guide
sensitivity: internal-only
---

> ⚠️ **INTERNAL ONLY — Do NOT share commands or output with customers.**

# Arista MSEE Commands

## Description

This is for advanced troubleshooting only. These commands should not be used for initial investigation into an ExpressRoute circuit issue.

The following commands are for Arista MSEE devices. Must be run from a vsaw device via Jarvis Actions.

- MSEE = Microsoft Enterprise Edge Router
- CE = Customer Edge

## Interface Checks

Find interface/subinterface info in Dump Circuit:
```
PORT NAME: Ethernet17/2          <-- Interface/Port
SUBINTERFACE NAME: Ethernet17/2.3  <-- Sub Interface
DEVICE NAME: exra03.bom30 PA: 10.20.88.71 TYPE: Arista
```

- **Interface**: Jarvis link template — Brooklyn > ExR Diagnostic Operation > Run Show Command
- **Sub Interface**: Same as above with subinterface name

## ICMP/Ping Tests

Brooklyn > ExR Diagnostic Operations > Run Ping Command
- Device Name: `<MSEE Device Name>`
- VRF Name: `<VRF>`
- Destination IP Address: `<Dst IP>`
- Optional: `repeat 100` or `source <MSEE IP> repeat 100 size 1000`

Key ping scenarios:
- MSEE subinterface → CE
- Tunnel Interface → CE
- MSEE subinterface ↔ MSEE tunnel interface
- MSEE subinterface → ExpressRoute GW (IN_0 and IN_1)

If ping drops are seen → engage TA via Teams with all Jarvis links.

## BFD

Command: `show bfd peers detail` filtered by CE IP, on the VRF interface.

## BGP Private Peering

### VRF Neighbor Summary
Shows BGP neighbor state for a specific VRF:
- `Active` → BGP session is down
- `Idle` → interface administratively down
- Number → count of prefixes received

### Key Commands
- Advertised routes from MSEE → CE
- Advertised routes from CE → MSEE
- All routes learned via BGP for a specific VRF
- Best Route Selection VRF
- Neighbor Advanced Detail

## BGP IPv6

Use VRF-based BGP IPv6 unicast command via Jarvis.

## BGP Route Flaps

Shows routes learned within the last minute. Routes with very short "Up/Down" timers indicate flapping. Route flapping increases CPU utilization and affects Gateway Tenant performance.

Signs of flapping:
- Route entry with very low timer (< 1 minute)
- Route intermittently absent from routing table

## VRF All Routes

Shows all routes in a specific VRF routing table.

## BGP Microsoft Peering

Command: `show ip bgp neighbors <peer ip>`

## Current Logs

Pulls last 7–8 minutes of MSEE syslog. For historical logs → see Log Sources For Azure ExpressRoute wiki.

## CPU Utilization

Command: `show process top` — monitors CPU usage of MSEE processes.

## ARP

- All ARP entries: `show arp`
- Filter by VRF/Interface: `show arp vrf <vrf> interface <intf>`

## Light Levels

Acceptable Tx and Rx light levels: **-10 dBm to 0 dBm**

Commands: `show interfaces transceiver` for Ethernet; for Port Channel, first find active members.

If light levels outside range → engage TA in ExpressRoute Teams channel with all Jarvis links.

## Show Running Configuration

- Without SAW/VSAW: `https://coretools-prod-eastus.azurewebsites.net/#/device/config?target=<msee-name>`
- With SAW/VSAW: Via Jarvis Actions (shows VRF-specific running config)
