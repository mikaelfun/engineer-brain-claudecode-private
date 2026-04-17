# VM Performance Metrics Dashboard (Jarvis Shoebox)

> Source: OneNote MCVKB 2.7 | Draft - pending SYNTHESIZE review

## Overview
Jarvis dashboard for viewing CPU/Disk/Network/Memory metrics of Azure VMs. Useful when FiveMinutesCounter is unavailable.

## Setup Steps

1. **Find the correct Shoebox account** for the VM's region:

```kql
cluster('Azurecm').database('AzureCM').LogClusterSnapshot
| where TIMESTAMP >= ago(1h)
| where shoeboxMdmAccountName contains ("computeshoebox")
| summarize by shoeboxMdmAccountName, Region
```

2. **Mooncake region mapping:**

| Shoebox Account | Region |
|---|---|
| AzComputeShoeboxCHINAN2 | chinan2 |
| AzComputeShoeboxCHINAE2 | chinae2 |
| AzComputeShoeboxCHINANORTH | chinanorth |
| AzComputeShoeboxCHINAEAST | chinaeast |

3. **Get ResourceId** from ASC VM properties

4. **Construct Jarvis URL** - replace account and ResourceId in the dashboard link

## Dashboard Links
- ARM VMs: `https://jarvis-west.dc.ad.msft.net/dashboard/share/FDEB1850`
- Classic (ASM) VMs: `https://jarvis-west.dc.ad.msft.net/dashboard/share/51404979`
  - Modify: Account, DeploymentId, RoleId (VM name), RoleInstanceId (VM name)

## Tips
- For Mooncake: replace Hot Path Account value directly in sample link
- Remove ResourceId completely and re-add to apply changes
