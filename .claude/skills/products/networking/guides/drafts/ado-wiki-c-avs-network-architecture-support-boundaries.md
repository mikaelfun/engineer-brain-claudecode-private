---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/AVS private cloud network architecture and support boundaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/AVS%20private%20cloud%20network%20architecture%20and%20support%20boundaries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure VMware Solution (AVS) Private Cloud Network Architecture and Support Boundaries

## Overview

This article provides an overview of the Azure VMware Solution (AVS) private cloud network architecture and outlines the support boundaries between AVS, Azure Networking, and the customer.

## AVS Private Cloud Network Architecture

Primary physical components that make up the AVS network architecture:

- ESXi hosts
- ToRs: Compute leaf [CLF01/02] routers
- T1 and T2 Spine [SP01/02] routers
- L3Edges: Edge leaf [ELF01/02] routers
- Dedicated MSEEs [01gmr/02gmr]

## AVS Support Boundaries

### Components supported by the AVS team

- NSX Virtual Networking components
- AVS ESXi host
- AVS underlay components [CLF, Spine, ELF]
- AVS dedicated MSEEs

> **Note:** If a packet capture is required on AVS D-MSEEs, AVS team will handle it as it is not within the boundaries of Azure Networking team [IcM will be required, and assistance will be requested by AVS engineer to ExpressRoute Ops].

### Components supported by the Azure Networking team

- Azure Network services including Azure VNGs [ExR and VPN]
- Azure MSEEs
- Azure Firewall
- NVA [3rd party vendor might be engaged]
- Azure Route Server
- vWAN components... etc.

### Customer responsibility

- Service Provider [provider vendor engagement]
- Customer on-prem network [including physical and/or virtual network components]
