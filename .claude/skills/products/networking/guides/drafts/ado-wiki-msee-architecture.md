---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/Microsoft Enterprise Edge (MSEE)"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FFeatures%20and%20Functions%2FMicrosoft%20Enterprise%20Edge%20(MSEE)"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Microsoft Enterprise Edge (MSEE) Architecture

## Overview

MSEE refers to the edge devices used in Azure ExpressRoute circuits. Microsoft uses Cisco, Juniper, and Arista vendors for MSEE devices.

## Architecture (MSEEv2)

Components:
- Multi-Tenancy for Express Route Gateway
- VXLAN replaces GRE as tunneling protocol between MSEE and Azure Cloud
- Programmable edge for operational flexibility
- Route service for private and public peering

## VxLAN vs GRE

### GRE (Generic Routing Encapsulation)
- IP protocol type 47
- 2-tuple (source IP, destination IP)
- Uses GRE key for VNet isolation
- RFC 2784, 2890

### VxLAN (Virtual Extensible LAN)
- Uses UDP for transport
- 5-tuple capable
- Uses VNI (VxLAN Network Identifier) for VNet isolation
- RFC 7348

**All new gateways, regardless of SKU, now use VxLAN encapsulation.**

## Datapath: MSEE to Gateway

- MSEE has a tunnel interface to each VNet linked by the customer
- Tunnel type (GRE or VxLAN) depends on VNet Gateway SKU
- UltraPerf gateways use VxLAN (not GRE)
- Standard/HighPerf historically used GRE but new deployments use VxLAN

## Troubleshooting

### Identifying Encapsulation Type
- Check ASC Gateway Dashboard > GatewayTenantHealth
- ParentExpressRouteGatewayId = all zeros: standard vNet gateway
- ParentExpressRouteGatewayId = valid GUID: virtual hub gateway

### Performance Issues
- Use ExpressRoute Gateway Jarvis Dashboard for data path and control plane diagnostics
