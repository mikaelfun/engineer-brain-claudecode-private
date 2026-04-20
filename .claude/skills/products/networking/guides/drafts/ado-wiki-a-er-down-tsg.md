---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/ExpressRoute Down"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FHow%20To%2FExpressRoute%20Down"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# ExpressRoute Down TSG

## Scenario

Applies to both **never worked** and **currently down**. Customer may also report "not getting ARPs" or "not getting routes from Azure".

## Internal Scoping & Data Collection (10-15 min)

1. Review customer verbatim for: Subscription ID, Circuit Name, Service Key
2. In ASC: retrieve Service Key, Circuit Name, Service Provider, Location
3. Download DumpRoutingInfo and DumpCircuitInfo
4. Run Configuration and Health Checks in ASC Diagnostics tab

## Customer Scoping & Data Collection

Validate: Subscription ID, VNet Name, Circuit Name/ID, Business Impact, Reproducibility, Timeline

## Verify ExpressRoute State From ASC

Correct state:
```
Circuit State: Enabled
Circuit Provisioning State: Enabled
Service Provider Provisioning State: Provisioned
```

## Check Layer 2 Connectivity (ARP)

Identify MSEE type:
- Cisco: ash-06gmr-cis-* (interface: PortChannel0.12345)
- Juniper: exr01.ash (interface: xe-1/1/9:3.49)
- Arista: exra71.sg1 (interface: Ethernet2/1.2)

### ARP States
- **Incomplete ARP**: Missing MAC from on-premises = Layer 2 issue, engage ISP
- **Complete ARP**: Both MACs present = Layer 2 OK

### Possible ARP Down Causes
- Wrong IP address (CE uses first IP from /30, MSEE uses second)
- Wrong STAG/CTAG mismatch
- Equipment failure between MSEE and PE/CE
- Run DebugBot from ASC

## BGP Peering Down

### BGP MSEE to CE
- Cisco: Check neighbor state in DumpRoutingInfo
- Juniper: State should be "Established"
- Arista: State should be "Established" (Active/Idle = down)

### BGP Down Diagnosis
- Check syslogs: cluster('azphynet.kusto.windows.net').database('azdhmds').SyslogData
- Common cause: Same ASN on local and remote peers (must use 12076)

### BGP MSEE to ExR Gateway
- Check for NSG on gateway subnet (remove if present)
- Check for UDR with default route on gateway subnet (remove)
- Even non-default UDRs can cause issues

## Shared Key / MD5 Hash
- Max 25 alphanumeric characters, no special characters
- Must be configured on both sides
- Syslog: "No MD5 digest" = not configured on customer side
- Syslog: "Invalid MD5 digest" = password mismatch
- Check DumpCircuitInfo: SHARED KEY EXISTS: True

## MSEE Interface Down

Investigation steps:
1. Evaluate traffic impact (redundancy protection)
2. Check maintenance notifications
3. Check automation ICM
4. Sanity check device (admin state, capacity)
5. Check provider issues
6. Check other subinterfaces on same link/provider for concurrent down events
7. Check multiple physical links for same provider
8. Check optical power state

Kusto queries:
```kql
// Interface status
cluster("azphynet").database('azdhmds').InterfaceData
| where deviceHostName contains "exr01.fra32"
| where ifOperStatus != "up"

// Syslog events
cluster('azphynet.kusto.windows.net').database('azdhmds').SyslogData
| where Device contains "exr01.fra32"
| where Message contains "et-1/1/5"
```

## MSEE Diagnostics (DebugBot)

ASC > Diagnostics tab > Create Report
Checks: Ping Test, Private VRF, VNet Gateways (health probe, UDR)
