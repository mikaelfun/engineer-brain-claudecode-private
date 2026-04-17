---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Components/Azure Operator Nexus: Standard Networking Architecture Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Components/Azure%20Operator%20Nexus%3A%20Standard%20Networking%20Architecture%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Operator Nexus: Standard Networking Architecture Guide

**Created by: Delkis Rivas** - _Last review: 29-March-2026_

## Executive Summary

The Nexus Network Fabric (NNF) architecture provides scalable, resilient, and high-performance connectivity for compute and aggregation racks in Microsoft's cloud infrastructure. This document details the networking design, MLAG configuration, and port mapping.

## Rack Mapping: NNF to NC

Azure Operator Nexus deployments include one Aggregation Rack (AggRack) and one or more Compute Racks (CompRack1-8).

**Important:** The Aggregation Rack in NNF is often a logical grouping and does not match any physical rack number within the NC deployment.

**Compute rack mapping (canonical):**
- AggRack (NNF) = NC Rack 1 (logical aggregation index)
- CompRack1 (NNF) = NC Rack 2
- CompRack2 (NNF) = NC Rack 3
- ... up to CompRack8 (NNF) = NC Rack 9

## Architecture Overview

### Aggregation Rack (AggRack1)
- **Switches:** Arista DCS-7280DR3A-36-F (optionally DCS-7280DR3AK-36-F)
- **Management:** Arista DCS-7010TX-48-F, OpenGear OM2248-10G-US terminal server
- **Packet Brokers:** Arista DCS-7280DR3K-24-F (NPB1/NPB2)
- **Role:** Central aggregation point for all compute racks

### Compute Racks (CompRack1-8)
- **TORs:** Arista DCS-7280DR3-24-F
- **Management Switch:** Arista DCS-7010TX-48-F per rack

## Topology and Scalability

- **Standard topology:** 1 Aggregation Rack + up to 8 Compute Racks
- Architecture can scale to 1 + 16, but current SKUs/BOMs cap at 8
- Single-rack configurations are lab-only; for customers needing single-rack, use Azure Local Medium

## BMM-to-TOR Connectivity

Dual-socket server = 2 NUMA nodes:
- NIC in **Slot 3** -> PCI-attached to CPU / NUMA 0
- NIC in **Slot 6** -> PCI-attached to CPU / NUMA 1
- TORs operate as MLAG pair, enabling active-active LACP bonding

## Port Model and Sub-Interfaces

Each Dell R760 compute server has 3 NICs (6 ports total). Server-facing TOR ports use 400G to 4x100G breakout:
- TOR switchport: 400G
- Breakout: QSFP-DD (400G) to QSFP56 (4x100G)
- The 4x100G fanout from a single 400G port is distributed across two servers

**Golden wiring rule:**
- All Port1 connections from servers terminate on TOR1
- All Port2 connections from servers terminate on TOR2

### Slot-level wiring:
- **Slot3**: Port1 -> TOR1, Port2 -> TOR2
- **Slot6**: Port1 -> TOR1, Port2 -> TOR2

## MLAG and Port-Channel Design

- **MLAG Group IDs:** Start at 110, increment by 10 (e.g., 110, 120, 130)
- Each MLAG bundles corresponding lanes on TOR-1 and TOR-2 into a Port-Channel
- Peer link between TORs ensures failover and consistency
- NICs from Slot3 and Slot6 are distributed across TOR-1 and TOR-2 for dual-homing

## Rack Uplinks

TOR-to-CE uplinks use **native 400G straight-through links** (AOC or fiber). Breakout cabling applies **only** to server-facing 400G TOR ports.

## Key Design Benefits

- **Performance:** ~800 Gbps per rack, only one hop between racks, non-blocking/low oversubscription
- **Reliability:** No single point of failure; servers dual-homed to two TORs, each TOR connects to both Aggregation switches via MLAG/LACP
- **Scalability:** Scales to 7-8 compute racks per fabric; expansion is simple - add rack, connect cables, automation handles the rest
- **Centralized Management:** All external and inter-rack connectivity flows through AggRack's two CE routers

## Common Pitfall

BMMs labeled Rack 2 (CompRack1) do **NOT** connect to AggRack2. They connect to the TORs in CompRack1, which then uplink to CE1/CE2 in AggRack1.

## Scope Clarification

MLAG/LACP provides redundancy **against TOR failure**. It does NOT eliminate the impact of NIC-local or NUMA-local failures on dual-NUMA servers, where NICs are PCI-attached to specific CPU/NUMA domains.

## Best Practices

- Use Excel BOM for quick mapping
- Validate MLAG IDs and Port-Channels on TORs
- Keep management traffic isolated from tenant LAGs
- **Always reference AggRack1 for compute rack uplinks and troubleshooting**

## References

- [Azure Operator Nexus - Networking concepts](https://learn.microsoft.com/en-us/azure/operator-nexus/concepts-nexus-networking)
- [Azure Operator Nexus SKUs](https://learn.microsoft.com/en-us/azure/operator-nexus/reference-operator-nexus-skus)
