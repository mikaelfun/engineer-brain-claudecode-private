---
title: "How to Find ContainerId/NodeId for Azure DB Services"
source: onenote
sourceRef:
  - "MCVKB/Net/=======10.Tools=======/10.22 How to find out the containerid_nodeid for A.md"
product: networking
tags: [containerid, nodeid, azure-sql, mysql, kusto, slb, jarvis, vfp, mooncake]
21vApplicable: true
---

# How to Find ContainerId/NodeId for Azure DB Services

## Overview
Azure DB services (SQL DB, MySQL) run on internal VMSS nodes. For network troubleshooting (VFP, SLB, host-level), you need the ContainerId and NodeId which are not directly visible.

## Step-by-Step Process

### Step 1: Find the DB Node via Kusto (MonLogin)
Cluster: sqlazurechi2.chinanorth2.kusto.chinacloudapi.cn, Database: MoonCake

```kql
MonLogin
| where TIMESTAMP >= datetime(YYYY-MM-DD HH:MM:SS)
| where TIMESTAMP <= datetime(YYYY-MM-DD HH:MM:SS)
| where logical_server_name =~ '<server-name>' and event == 'process_login_finish'
| where NodeRole == 'DB' and AppName != 'Worker'
| distinct server_name, peer_address, AppName, NodeName, NodeRole
```

Output gives: server_name (FQDN), NodeName (e.g. _DB_10), peer_address (SLB VIP).

### Step 2: Get SLB VIP
Use psping to resolve the server FQDN to its SLB VIP:
```cmd
psping <server-fqdn>
psping <server-internal-fqdn>:<port>
```

### Step 3: Get Container/Node Info via Jarvis SLB Action
Run SLB Jarvis action with the VIP to get VIP-CA mapping:
- Endpoint, DipEndpoints (Port, CaAddress, PaAddress, HostAddress, DipHealth)
- Search CAIpAddress in the output to find ContainerId, ClusterId, HostId

### Step 4: Verify with Kusto (CADDAILY)
```kql
cluster('Vmainsight').database('CAD').CADDAILY
| where PreciseTimeStamp > ago(14d)
| where ContainerId =~ '<container-id>'
| summarize STARTTIME=min(PreciseTimeStamp), ENDTIME=max(PreciseTimeStamp)
    by RoleInstanceName, TenantName, Cluster, Usage_VMSize, ContainerId
| order by ENDTIME desc
| take 1
```

### Alternative: ARR Script (VSAW)
```powershell
.\get-azureip.ps1 -ipaddr <SLB-VIP> -slbdetails
.\get-deploymentkusto.ps1 -containerId <container-id> -cloudenv Mooncake -dashboards VMD,VFP,ASI
```

## Jarvis Dashboards
Once you have ContainerId/NodeId:
- **VM Performance**: Geneva dashboard with ResourceId (VMId) + regional account (AzComputeShoeboxCHINAE2)
- **VFP & Support**: Geneva dashboard with ContainerId + VfpMDMMC account + NodeId
- **ASI (Azure Service Insights)**: azureserviceinsights.trafficmanager.cn - may need manual parameter adjustment for Mooncake

## Notes
- MySQL uses same MonLogin table but NodeRole output differs
- ARR scripts (get-azureip.ps1, get-deploymentkusto.ps1) are pre-installed on VSAW
- ASI link generation by ARR script may not support Mooncake; manually construct URL
