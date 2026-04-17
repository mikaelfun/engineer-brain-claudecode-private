# AVD AVD Session Host (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 15 | **Drafts fused**: 1 | **Kusto queries fused**: 3
**Source drafts**: ado-wiki-b-determine-session-host-image-type.md
**Kusto references**: health-check.md, heartbeat.md, session-host.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, KB, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| New AAD DS user login to AVD session host fails with wrong u... | AAD DS security hardening sets NTLM authentication to accept... | Force session host to use NTLMv2 only: set registry HKLM\SYS... |
| Session host fails UrlsAccessibleCheck health check - stuck ... | Firewall blocking outbound traffic to required URLs, or loca... | Add firewall rule allowing outbound TCP 80/443 to required U... |
| Session host VMs going in Unavailable status. Reinstalling a... | RDAgentBootLoader registry missing default agent entry under... | Check registry HKLM\SOFTWARE\Microsoft\RDAgentBootLoader. Cr... |
| Cannot delete session host from host pool after VM deleted | Session host record must be deleted before VM | Drain mode then sign out users then delete session host then... |
| Sxs not getting auto installed post registering the machine ... | The following registry was causing the issue.  HKEY_LOCAL_MA... | On      the affected machine navigate to following registry ... |
| Customers are getting&nbsp;protocol error  (code: 0x112F) du... | This is happening only when customer is  using Nvidia GPU en... | We need to Disable the AVC HW in the  session hosts which ha... |
| Intermittently unable to access Azure Virtual Desktop(AVD) s... | When affected host is in Needs Assistance state, we accessed... | Global Secure Access Client was used on the AVD multi-sessio... |
| The session hosts appear in a 'Shutdown' state under hostpoo... | After reviewing the VNET configuration, it was identified th... | Once VNet encryption was disabled, the session host was able... |

### Phase 2: Detailed Investigation

#### Purpose
> Source: [ado-wiki-b-determine-session-host-image-type.md](guides/drafts/ado-wiki-b-determine-session-host-image-type.md)

The main idea of this article is to help you identify if a Session Host was created from a custom or from a gallery image using **Azure Support Center (ASC)**

### Phase 3: Kusto Diagnostics

#### health-check
> `[Tool: Kusto skill - health-check.md]`

AAD 租户 ID

#### heartbeat
> `[Tool: Kusto skill - heartbeat.md]`

Session Host 名称或 FQDN

#### session-host
> `[Tool: Kusto skill - session-host.md]`

Session Host 名称或 FQDN

### Key KQL Queries

**Query 1:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where HostInstance has "{SessionHostName}"
| where TIMESTAMP >= ago(1d)
| where Name == "SxSStackListenerCheck" 
    or Name == "DomainReachableHealthCheck" 
    or Name == "DomainTrustCheckHealthCheck" 
    or Name == "DomainJoinedCheck" 
    or Name == "FSLogixHealthCheck" 
    or Name == "MonitoringAgentCheck" 
    or Name == "SessionHostCanAccessUrlsCheck" 
    or Name == "RDAgentCanReachRDGatewayURL" 

```

**Query 2:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where AADTenantId == "{AADTenantId}"
| where TIMESTAMP >= ago(1d)
| where Name endswith "Check"
| where ResType != "Success"
| project TIMESTAMP, HostPool, HostInstance, Name, ResType, ResSignature, ResDesc
| order by TIMESTAMP desc
```

**Query 3:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where PreciseTimeStamp > ago(1d)
| where Role == 'RDAgent'
| where Name endswith "Check"
| where AADTenantId != ""
| summarize arg_max(PreciseTimeStamp, ResType) by Env, Ring, HostPool, HostInstance, Name, AADTenantId
| order by Env, Ring, HostPool, HostInstance
```

**Query 4:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where TIMESTAMP >= ago(7d)
| where Name endswith "Check"
| where ResType != "Success"
| summarize FailureCount = count() by bin(TIMESTAMP, 1h), Name
| order by TIMESTAMP desc
```

**Query 5:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance has "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Category contains "Heartbeat" or Msg contains "Heartbeat"
| where Category != "Microsoft.RDInfra.Diagnostics.DataSink.RestPipelineSink"
| project PreciseTimeStamp, Level, Category, Role, HostInstance, Msg
| order by PreciseTimeStamp desc
| take 100
```

**Query 6:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance has "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Category contains "Heartbeat"
| project PreciseTimeStamp, HostInstance
| order by PreciseTimeStamp asc
| extend PrevTime = prev(PreciseTimeStamp)
| extend Interval = datetime_diff('second', PreciseTimeStamp, PrevTime)
| where isnotnull(Interval)
| summarize 
    AvgInterval = avg(Interval),
    MaxInterval = max(Interval)
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | New AAD DS user login to AVD session host fails with wrong user name and passwor... | AAD DS security hardening sets NTLM authentication to accept NTLMv2 response onl... | Force session host to use NTLMv2 only: set registry HKLM\SYSTEM\CurrentControlSe... | 🟢 8.5 | OneNote |
| 2 | Session host fails UrlsAccessibleCheck health check - stuck in Needs Assistance ... | Firewall blocking outbound traffic to required URLs, or local hosts file blockin... | Add firewall rule allowing outbound TCP 80/443 to required URLs. Check Hosts fil... | 🟢 8.0 | MS Learn |
| 3 | Session host VMs going in Unavailable status. Reinstalling agents with new regis... | RDAgentBootLoader registry missing default agent entry under HKLM\SOFTWARE\Micro... | Check registry HKLM\SOFTWARE\Microsoft\RDAgentBootLoader. Create the missing age... | 🔵 7.5 | KB |
| 4 | Cannot delete session host from host pool after VM deleted | Session host record must be deleted before VM | Drain mode then sign out users then delete session host then delete VM | 🔵 7.0 | MS Learn |
| 5 | Sxs not getting auto installed post registering the machine to hostpool this mak... | The following registry was causing the issue.  HKEY_LOCAL_MACHINE\SOFTWARE\Micro... | On      the affected machine navigate to following registry path.   HKEY_LOCAL_M... | 🔵 6.5 | KB |
| 6 | Customers are getting&nbsp;protocol error  (code: 0x112F) due to which the remot... | This is happening only when customer is  using Nvidia GPU enabled VMs and enable... | We need to Disable the AVC HW in the  session hosts which has Nvidia GPU enabled... | 🔵 6.5 | KB |
| 7 | Intermittently unable to access Azure Virtual Desktop(AVD) session host using RD... | When affected host is in Needs Assistance state, we accessed it through the Azur... | Global Secure Access Client was used on the AVD multi-session host which is not ... | 🔵 6.5 | KB |
| 8 | The session hosts appear in a 'Shutdown' state under hostpool blade, even though... | After reviewing the VNET configuration, it was identified that VNET encryption w... | Once VNet encryption was disabled, the session host was able to successfully con... | 🔵 6.5 | KB |
| 9 | When you connect through the&nbsp;Windows App web client&nbsp;to an AVD session ... | According to the product groups formal statement, this behavior is caused by a&n... | Resolution 1: Connect using the Windows App desktop version Instead of connectin... | 🔵 6.5 | KB |
| 10 | AVD VM status becomes unavailable with health check status 'DomainTrustCheck' fa... | Wrong DNS setting which cannot resolve the domain controller, resulting in domai... | Check DNS settings and modify to a proper DNS which can resolve the Domain Contr... | 🔵 6.5 | KB |
| 11 | WVD Classic: All session host status changed to 'Shutdown' after OS upgrade (21H... | After OS upgrade, session host failed to register automatically to the host pool... | Uninstall all agent/boot loader/stack programs. Remove session host from host po... | 🔵 6.5 | KB |
| 12 | Session host fails MetaDataServiceCheck health check - can't access IMDS endpoin... | Networking/firewall/proxy blocking IMDS endpoint 169.254.169.254 | Unblock IP 169.254.169.254; ensure HTTP clients bypass web proxy for IMDS; add p... | 🔵 6.5 | MS Learn |
| 13 | AVD connection fails: session host is unhealthy. Zombie/orphan session exists on... | Zombie session not cleaned up after host shutdown. Stale session records in AVD ... | 1) Start host and Log off users in Azure Portal. 2) PowerShell: Remove-AzWvdUser... | 🔵 6.5 | OneNote |
| 14 | Session host config fails during host pool creation - VmSkuNotAvailableInRegion ... | Incompatible VM SKU/region/zone/disk/image/VNet combination | Use Get-AzComputeResourceSku; use PowerShell cmdlet or recreate host pool | 🔵 6.0 | MS Learn |
| 15 | Ephemeral OS disk deployment fails with incorrect DiffDiskPlacement (e.g. NVMe s... | Selecting unsupported placement option such as NVMe causes deployment issues dur... | For AVD session hosts, select Temp Disk placement during deployment; avoid NVMe ... | 🔵 6.0 | MS Learn |
