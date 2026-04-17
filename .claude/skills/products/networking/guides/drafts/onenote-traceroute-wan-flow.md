# WAN Traceroute and IPFIX Network Flow Analysis

> Source: MCVKB/Net/10.15 | ID: networking-onenote-040 | Quality: guide-draft

## Purpose
Narrow down whether cross-cloud traffic (public Azure <-> Mooncake) is blocked by GFW/ISP, using WAN device traceroute and IPFIX net flow analysis.

## Scope
- **Inbound** (public Azure/global Internet -> Mooncake): Fully supported
- **Outbound** (Mooncake -> public Azure): Traceroute on WANEdge NOT supported; use IPFIX flow + BestTrace

## Inbound Traffic Analysis

### Step 1: Get Source VM Info
Use `get-deploymentkusto.ps1` or Kusto query to get source region, Container/Node/T0 info in public Azure.

### Step 2: Find WAN Device
Use topology service: `https://netperf.osdinfra.net/toposervice/GetAzureTopology?clusterNameList=<CLUSTER>&deviceTypesGroupByBoth=All&upStreamOnly=true`

### Step 3: Run Traceroute
WAN Edge LookingGlass: `https://wanedge.trafficmanager.net/LookingGlass`
- Select source WAN device from the region
- Trace to target Mooncake public IP
- Last MS hop → ISP/GFW boundary visible in subsequent hops

### Step 4: Check IPFIX Net Flow
```kql
cluster('netcapplan').database('NetCapPlan').RealTimeIpfixWithMetadata
| where TimeStamp >= ago(2h)
| where DstIpAddress contains "<mooncake-public-ip>"
| where SrcIpAddress contains "<source-ip>"
| project TimeStamp, RouterName, IngressIfName, EgressIfName, SrcIpAddress, DstIpAddress, DstTransportPort, SrcAs, DstAs, NextHop
```

**Kusto access**: Request via IDWeb group `NetCapPlanKustoViewers` (owner: Sam Goodman)

## Outbound Traffic Analysis

### BestTrace Tool
- Linux: `wget https://cdn.ipip.net/17mon/besttrace4linux.zip`
- Windows: Download from `https://www.ipip.net/product/client.html`
- Requires NSG allowing ICMP inbound + VM must have public IP

### IPFIX for Outbound
Same Kusto query but swap Src/Dst. Note: IPFIX only captures flow on MS backbone devices; if destination is not on public Azure, no flow data available.

## Key Insights
- If IPFIX shows flow on MS WAN device but no return traffic → ISP/GFW blocking
- 21v phynet team can check Mooncake WAN device netflow for further confirmation
- Reference: https://learn.microsoft.com/en-us/azure/virtual-wan/interconnect-china
