# Pingmesh Latency Quick Query Guide

> Source: MCVKB/Net/10.11 pingmesh latency query
> Status: draft (from OneNote)

## Overview

Pingmesh measures network latency between Azure nodes. Two methods available:
- **Kusto**: 1-minute interval (finer granularity)
- **Jarvis**: 5-minute interval (easier to use)

## Method 1: Jarvis Dashboard

**URL**: https://jarvis-west.dc.ad.msft.net/A2807BE3

Filters available:
- VNet ID of VM
- Source CA (Customer Address)
- Destination CA
- Container ID

## Method 2: Kusto Query

**Cluster**: `Netperf` (via cross-cluster call)
**Database**: `NetPerfKustoDB`
**Table**: `AzPingMeshServerStatus`

```kql
let Cluster = '<cluster_name>';
let NodeIp = '<node_ip>';
cluster('Netperf').database('NetPerfKustoDB').AzPingMeshServerStatus
| where timestamp >= datetime(<start_time>) and timestamp < datetime(<end_time>)
| where serverIP == NodeIp and ['cluster'] =~ Cluster
| summarize percentile(avgPayloadRTTInMicroseconds, 90) by bin(timestamp, 1min)
| render timechart
```

## Important Notes
- Unit is **microseconds** (not milliseconds)
- Jarvis interval is 5 minutes, Kusto is 1 minute
- Use Node IP and Cluster name as primary filters
