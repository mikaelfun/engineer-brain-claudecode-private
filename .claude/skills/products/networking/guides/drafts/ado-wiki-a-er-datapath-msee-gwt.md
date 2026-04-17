---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Advanced Troubleshooting/ExpressRoute: About Datapath between MSEE and GWT"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FExpressRoute%3A%20About%20Datapath%20between%20MSEE%20and%20GWT"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Description

This document tries to explain the datapath between MSEE routers and GWT in detail.

## Intended Audience

Azure Networking Support Engineers, Technical Advisors and Embedded Escalation Engineers. **Confidential — do not share outside Microsoft.**

## Introduction

The datapath between MSEEs and GWT has not been fully understood in detail for folks in support, making troubleshooting slightly more difficult. The introduction of UltraPerf gateways has added complexity due to architectural differences.

UltraPerf gateways are the latest addition to the available SKUs for ER Vnet Gateways. They provide improved performance for private peering scenarios over the HighPerf SKU. Customers running an UltraPerf gateway should be able to use all the bandwidth on a 10Gbps circuit with a single Vnet.

Among other differences, UltraPerf gateways don't use GRE encapsulation for their traffic with the MSEEs. They use a different protocol called VxLan.

> **All new gateways, regardless of their SKU, now use VxLan encapsulation.**

## What is VxLan?

VxLan is a modern encapsulation protocol that encapsulates Ethernet traffic, meaning you can have layer 2 connections as an overlay in your datacenter. In Azure's case, this extends the Virtual Network's GatewaySubnet to the MSEEs as a layer 2 tunnel. VxLan uses UDP as transport protocol.

- RFC: [RFC7348](https://tools.ietf.org/html/rfc7348)

## What is GRE?

GRE is an IP protocol used for encapsulating other protocols at layer 3 and above.

- RFC: [RFC2784](https://tools.ietf.org/html/rfc2784), [RFC2890](https://tools.ietf.org/html/rfc2890)

## VxLan and GRE on Azure

Key differences:

- **GRE**: IP protocol type 47, encapsulates other IP traffic → 2-tuple (source IP, destination IP) only. Vnet isolation via unique GRE key.
- **VxLAN**: UDP transport → 5-tuple flow definition. Vnet isolation via VNI (VxLan Network Identifier).

### Where does encapsulation happen in ExpressRoute?

Traffic from on-premises trying to reach resources inside a Vnet needs to be moved from a physical network device (MSEE) to Azure SDN (Vnet). The MSEE has a tunnel interface to each Vnet linked by the customer — either GRE or VxLan based on the Vnet Gateway's SKU.

### GRE Encapsulation Architecture

The IPinGRE tunnel is terminated on the Vnet Gateway's VIP; source IP is the PA of the MSEE.

The Vnet Gateway's VIP is owned by the SLB and configured on relevant MUXes. The **border leaf router uses a 2-tuple hash** (can't use 5-tuple for GRE) to send all traffic to one specific MUX. The MUX then performs a 5-tuple hash on inner headers to distribute traffic equally among all gateway tenant instances while maintaining flow persistence.

### VxLan Encapsulation Architecture

The VxLan tunnel is terminated on the Vnet Gateway's VIP; source IP is the PA of the MSEE.

- **Destination port**: 65330/UDP (Azure ExpressRoute architecture — note: this port is reserved by Azure VNet)
- **Source port**: result of a hash function of the 5-tuple inner header

The **border leaf router uses ECMP** with 5-tuple hash for equal load balancing across MUXes. Each MUX calculates a hash from the 5-tuple of the **outer header** (cannot read inner headers in VxLan), then maps to a specific GWT instance using `hash % number_of_active_GWT_instances`. This ensures even distribution and flow persistence.

## Key Summary

| Protocol | Transport | Tuple | Border Leaf LB | MUX hash |
|----------|-----------|-------|----------------|----------|
| GRE | IP type 47 | 2-tuple | One specific MUX (2-tuple hash) | 5-tuple inner header |
| VxLan | UDP/65330 | 5-tuple | ECMP (5-tuple hash) | 5-tuple outer header |

## Additional Information

- [Full walk-through Demo (90 Minutes)](https://microsoft.sharepoint.com/:v:/t/AzureNetworkingPOD72/EWlhpmUA9PRHra3KtZGCsIoBUip_zk3HHgprThOwT5wNmQ?e=lMir4T)
