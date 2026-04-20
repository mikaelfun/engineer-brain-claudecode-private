---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/ExpressRoute Direct Down"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FHow%20To%2FExpressRoute%20Direct%20Down"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# ExpressRoute Direct Down TSG

**Note: This article is only relevant for ExpressRoute Direct issues**

## Scenario

Applies to both ExpressRoute Direct **never worked** and **currently down**.

By default, claimed ports are set to "admin down" state. Customer not billed until ports are admin enabled or 45 days from claim.

## Background

ExpressRoute Direct customers physically connect their edge routers directly with MSEE at the peering location. Connections facilitated by co-location provider in Meet-Me Room (MMR).

## LOA (Letter of Authorization)

LOA contains: port bandwidth, colo address, MSEE device/port, rack location, patch panel port in MMR, connector type.

### LOA Escalation
Post to ExpressRoute Teams channel for TA approval when:
- Unable to complete setup with provided LOA
- Port not coming up after patching
- Need additional information

Use ASC template: `ExpressRoute Direct Letter of Authorization (LOA) Escalation`

**Customer MUST have ticket with Service Provider. Customer Order ID or Circuit ID (CCID) required.**

## Physical Connectivity Issues

### Light Levels
- RX = light received on MSEE from customer
- TX = light transmitted by MSEE to customer

**Acceptable ranges by device:**
- Cisco: 0 to -10
- Juniper: 5 to -5
- Arista: 5 to -12

### Line Protocol
- 0 = port down
- 1 = port up

### Admin State
- 0 = Admin down (disabled)
- 1 = Admin up (enabled)

**Enable ports via PowerShell:**
```powershell
$ERDirect = Get-AzExpressRoutePort -Name $Name -ResourceGroupName $ResourceGroupName
$ERDirect.Links[0].AdminState = "Enabled"
Set-AzExpressRoutePort -ExpressRoutePort $ERDirect
$ERDirect.Links[1].AdminState = "Enabled"
Set-AzExpressRoutePort -ExpressRoutePort $ERDirect
```
Note: Both ports must be enabled separately.

## Physical Connectivity Escalation

Escalate if:
- Light Levels outside acceptable range
- Line Protocol is down

Validate admin state enabled before posting to teams.
Use ASC template: `ExpressRoute Direct Physical Connectivity Escalation`

## Jarvis Dashboard

Available for checking port status, light levels, traffic.

## Generate LOA

### Customer:
```powershell
New-AzExpressRoutePortLOA -ExpressRoutePort $ERDirect -CustomerName TestCustomerName -Destination "C:\Users\Downloads"
```

### Support (requires VSAW):
Jarvis Actions > Brooklyn > ExR Direct Port Operations > Generate LOA
