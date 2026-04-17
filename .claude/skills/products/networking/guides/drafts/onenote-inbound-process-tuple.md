# Inbound Process Tuple for VNet Peering and SLB Scenarios

> Source: MCVKB/Net/10.17 | ID: networking-onenote-042 | Quality: guide-draft

## Purpose
Run inbound process tuple test when ASC only supports outbound. Needed for troubleshooting traffic path through VNet peering and SLB topologies.

## Prerequisites
- Source and destination VM info from ASC (ContainerId, NodeId, ClusterName, VNet ID, DIP, MAC)
- VNet GRE key from Jarvis RNM action

## Option 1: ASC + Jarvis Action

### Step 1: Dump VM Info from ASC
For both source and destination VMs, collect:
- Network Interfaces, VNet, NSG, Subnet
- DIP, MAC Address, Node IP
- ContainerId, NodeId, ClusterName
- VNet Resource ID and GUID

### Step 2: Get VNet GRE Key
Use Jarvis VNet management action to get GRE key for the destination VNet:
- Look for `GreKey` field in the output
- Also note `LinkRecords` for peering info (RemoteVnetId, AllowGatewayTransit, AllowVnetAccess)

### Step 3: Run Inbound Process Tuple
Use the collected info (source CA/PA, destination CA/PA, GRE keys) to construct the inbound process tuple test via Jarvis action.

## Option 2: Kusto Query Approach
Use Kusto query with ContainerId and encap parameters to trace inbound packet path through VFP rules.

## Key Data Points Needed

| Field | Source VM | Destination VM |
|---|---|---|
| CA (Customer Address) | DIP from NIC | DIP from NIC |
| PA (Provider Address) | Node IP | Node IP |
| VNet GRE Key | From RNM action | From RNM action |
| ContainerId | From ASC | From ASC |
| NodeId | From ASC | From ASC |
