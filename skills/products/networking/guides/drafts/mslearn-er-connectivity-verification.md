# ExpressRoute Connectivity Verification Guide

> Source: [Verify ExpressRoute connectivity](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/expressroute-troubleshooting-expressroute-overview)

## Network Topology Reference

1. Customer compute device (server/PC)
2. Customer edge routers (CEs)
3. Provider edge routers (PEs) facing CEs
4. PE-MSEEs (PEs facing Microsoft)
5. MSEEs (Microsoft Enterprise Edge)
6. Virtual network gateway
7. Compute device on Azure VNet

Connectivity models: Cloud exchange colocation, Point-to-point Ethernet, Any-to-any (IPVPN), Direct

## Step 1: Verify Circuit Provisioning and State

**Portal**: Circuit status = **Enabled**, Provider status = **Provisioned**

**PowerShell**:
```powershell
Get-AzExpressRouteCircuit -ResourceGroupName "RG" -Name "Circuit"
# Check: CircuitProvisioningState = Enabled
# Check: ServiceProviderProvisioningState = Provisioned
```

- Circuit status stuck "Not enabled" → Contact Microsoft Support
- Provider status stuck "Not provisioned" → Contact service provider

## Step 2: Validate Peering Configuration

- **Azure private peering**: Traffic to private VNets
- **Microsoft peering**: Traffic to PaaS/SaaS public endpoints

**Portal**: Check peering status, primary/secondary /30 subnets

**PowerShell**:
```powershell
$ckt = Get-AzExpressRouteCircuit -ResourceGroupName "RG" -Name "Circuit"
Get-AzExpressRouteCircuitPeeringConfig -Name "AzurePrivatePeering" -ExpressRouteCircuit $ckt
```

Key checks:
- VlanId, AzureASN, PeerASN match on MSEE and CE/PE-MSEE
- MD5 shared key matches on both sides
- /30 subnet: Microsoft uses 2nd usable IP, on-prem gets 1st usable IP

## Step 3: Validate ARP

- ARP table maps IP ↔ MAC for each interface
- Validates layer 2 connectivity
- Reference: [Getting ARP tables in Resource Manager](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-troubleshooting-arp-resource-manager)

## Step 4: Validate BGP and Routes on MSEE

```powershell
Get-AzExpressRouteCircuitRouteTable -DevicePath Primary -ExpressRouteCircuitName "Circuit" -PeeringType AzurePrivatePeering -ResourceGroupName "RG"
```

- Routes with `Path: 65515` = Azure VNet routes
- Routes with custom ASN path = on-premises routes
- If eBGP state is Active/Idle: verify subnets, VlanId, ASN, PeerASN, MD5

## Step 5: Confirm Traffic Flow

```powershell
Get-AzExpressRouteCircuitStats -ResourceGroupName "RG" -ExpressRouteCircuitName "Circuit" -PeeringType 'AzurePrivatePeering'
```

- Verify PrimaryBytesIn/Out and SecondaryBytesIn/Out are non-zero
- Zero traffic on one path may indicate a path failure

## Step 6: Test Private Peering Connectivity

1. Portal → Circuit → Diagnose and solve problems → Connectivity & Performance issues
2. Select "Issues with Private peering" → "Test private-peering connectivity"
3. Run PsPing from on-prem to Azure during test
4. Interpret ACL match results:
   - Both sent+received on both MSEEs → Healthy
   - Received but no sent → Return-path routing issue
   - Sent but no received → Work with provider
   - One MSEE no matches → That MSEE may be offline

## Step 7: Verify Virtual Network Gateway

- Portal → Circuit → Diagnose and solve problems → Performance Issues
- Check for recent maintenance events
- Consider upgrading [gateway SKU](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-about-virtual-network-gateways#gwsku) for higher throughput
