# ExpressRoute ARP Table Troubleshooting

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/expressroute-troubleshooting-arp-resource-manager

## Overview

ARP tables validate layer 2 configuration and connectivity for ExpressRoute circuits. Each peering has primary and secondary paths, each with an ARP table.

## Prerequisites

- ExpressRoute circuit fully configured with at least one peering
- Know the /30 IP ranges for each peering
- Get MAC addresses from networking team / connectivity provider
- Azure PowerShell Az module (v1.50+)

## Get ARP Tables

### Azure Private Peering

```powershell
$RG = "<ResourceGroupName>"
$Name = "<CircuitName>"

# Primary path
Get-AzExpressRouteCircuitARPTable -ResourceGroupName $RG -ExpressRouteCircuitName $Name -PeeringType AzurePrivatePeering -DevicePath Primary

# Secondary path
Get-AzExpressRouteCircuitARPTable -ResourceGroupName $RG -ExpressRouteCircuitName $Name -PeeringType AzurePrivatePeering -DevicePath Secondary
```

### Microsoft Peering

```powershell
Get-AzExpressRouteCircuitARPTable -ResourceGroupName $RG -ExpressRouteCircuitName $Name -PeeringType MicrosoftPeering -DevicePath Primary
Get-AzExpressRouteCircuitARPTable -ResourceGroupName $RG -ExpressRouteCircuitName $Name -PeeringType MicrosoftPeering -DevicePath Secondary
```

## Interpreting ARP Tables

### Normal State

```
Age InterfaceProperty IpAddress  MacAddress
 10 On-Prem           10.0.0.1   ffff.eeee.dddd
  0 Microsoft         10.0.0.2   aaaa.bbbb.cccc
```

- On-premises IP last octet = odd number
- Microsoft IP last octet = even number
- Same Microsoft MAC for all peerings (primary/secondary)

### On-Premises / Provider Problem

```
Age InterfaceProperty IpAddress  MacAddress
  0 On-Prem           10.0.0.1   Incomplete
  0 Microsoft         10.0.0.2   aaaa.bbbb.cccc
```

Or only Microsoft entry present. **Action**: Check with connectivity provider.

### Microsoft Side Problem

ARP table for peering doesn't appear at all. **Action**: Open Microsoft support ticket for layer 2 issue.

## Troubleshooting Checklist

1. Verify first IP of /30 subnet is on MSEE-PR interface (Azure uses second IP for MSEE)
2. Check C-Tag (customer) and S-Tag (service) VLAN tags match on MSEE-PR and MSEE pair
3. If layer 3 is provider-managed and ARP tables are blank → refresh circuit config in portal
4. Compare primary vs secondary path ARP tables
5. Check Age field — very high age may indicate stale entries
