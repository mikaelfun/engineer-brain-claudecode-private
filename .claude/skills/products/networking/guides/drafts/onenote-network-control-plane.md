# Azure Network Control Plane Architecture Reference

> Source: MCVKB/Net/DHCP workflow/Control plan notes | ID: networking-onenote-044 | Quality: guide-draft

## Purpose
Reference guide for Azure network control plane components, their roles, and inter-dependencies. Essential for understanding VM provisioning network flow and troubleshooting.

## Core Components

### NRP (Network Resource Provider)
- Resource Provider for **all** networking resources (SDN, GW, etc.)
- Exposes networking resources as objects via ARM API
- Provides Access Control, RBAC, quota, and capacity management
- Interacts with other resource providers
- Drives async task completion for user API calls

### RNM (Regional Network Manager)
- **Regional** service
- Manages (Allocate/Update/Release) Virtual Network resources: VNet, NIC, VIP, MAC, NSG, Route Table
- Maintains resources per subscription
- Manages networking resources across region

### NSM (Network State Manager)
- Runs as **Fabric Controller per cluster**
- Network resource management: DIP, VIP, CA allocation
- Node goal state driver
- Network service goal state driver: SLBM, Azure DNS/DDNS

### NMAgent (Network Management Agent)
- Runs on **every Azure node**
- Goal state from NSM is the driver
- Creates rules and programs **VFP** for: Peering, UDRs, NSGs, Private Endpoints, Multi-CA
- Gets gateway routes and adds routing rules
- Provides CA-PA mappings, DHCP and ARP responses

### SLBM (Software Load Balancer Manager)
- Processes HTTP calls from NSM, GWM
- Calculates policy for distribution to Hyper-V hosts and SLB MUXes
- Sends goal state
- Provides health status of SLB infrastructure

### SLB Mux
- Route management through **BGP connection**
- Receives goal state from SLBM and programs policy: LB mapping, SNAT mapping
- Reports health info of Mux/ring node to SLBM

### SLBHP (SLB Health Probe)
- Receives goal state from SLBM
- Programs rules for SLB
- Health probe for DIP through WireServer IP (168.63.129.16)

## Data Flow
```
User API → ARM → NRP → RNM → NSM → NMAgent → VFP
                                  → SLBM → SLB Mux (BGP)
                                         → SLBHP (DIP health)
```

## SLB Ring Diagnostics
Use `get-deploymentkusto.ps1 -tenantName slb-r017-sha-mc -cloudenv Mooncake` to get SLB ring node information for a specific cluster.
