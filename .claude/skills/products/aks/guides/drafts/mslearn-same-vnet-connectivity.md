# Troubleshoot Connections to Endpoints in Same Virtual Network

> Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/troubleshoot-connections-endpoints-same-virtual-network)

## Scope

Connections from AKS cluster to:
- VMs or endpoints in same subnet or different subnet
- VMs or endpoints in peered virtual network
- Private endpoints

## Troubleshooting Checklist

### Step 1: Basic Connectivity Test
Verify basic outbound connectivity from pod. See [Basic troubleshooting of outbound AKS cluster connections](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/basic-troubleshooting-outbound-connections).

### Step 2: Private Endpoint
If connection goes through private endpoint, follow [Troubleshoot Azure Private Endpoint connectivity problems](https://learn.microsoft.com/en-us/azure/private-link/troubleshoot-private-endpoint-connectivity).

### Step 3: VNet Peering
If connection uses VNet peering, follow [Troubleshoot connectivity between peered VNets](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-troubleshoot-peering-issues).

### Step 4: Check NSG Rules
1. Portal > Virtual machine scale sets > select instance > Networking
2. Check **Outbound port rules** tab for two NSG rule sets:
   - **Subnet-level NSG** (`<my-aks-nsg>`): custom NSG on AKS subnet
   - **NIC-level NSG** (`aks-agentpool-*-nsg`): managed by AKS
3. Check for custom Deny rules with higher priority blocking traffic
4. Verify required outbound rules per [AKS outbound rules](https://learn.microsoft.com/en-us/azure/aks/outbound-rules-control-egress)

## Key Points
- Default egress is ALLOWED on AKS NSGs
- Custom NSG Deny rules can block traffic directly or indirectly
- AKS does NOT modify egress rules in custom NSGs
