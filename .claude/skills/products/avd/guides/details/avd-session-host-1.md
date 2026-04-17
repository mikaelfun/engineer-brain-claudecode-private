# AVD AVD Session Host (Part 1) - Comprehensive Troubleshooting Guide

**Entries**: 15 | **Drafts fused**: 1 | **Kusto queries fused**: 3
**Source drafts**: ado-wiki-b-determine-session-host-image-type.md
**Kusto references**: health-check.md, heartbeat.md, session-host.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: KB

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD error: we are working on refreshing your token, please t... | Network issues causing user connectivity drop when session c... | Open all dynamic ports on session hosts. Engage networking t... |
| ConnectionFailedAdTrustedRelationshipFailure: service cannot... | RPC communication issue with Domain Controller, blocked dyna... | Open necessary RPC/dynamic ephemeral ports between session h... |
| File association GPO does not work in AVD remote application... | Windows 10/11 multi-session lacks the shell32 DefaultAssocia... | Import the DefaultAssociationsConfiguration registry from Wi... |
| User login to Session Host via RDP/AVD fails with The system... | CrashOnAuditFail registry key at HKLM\System\CurrentControlS... | Change CrashOnAuditFail from 2 to 1 and restart. Back up and... |
| After deployment AVD. VM shown as 'Can't connect' status in ... | Remote Desktop Session Host role is required for server OS.&... | Install Remote Desktop Session Host role on the OS. |
| Issue: Unable to connect to the AVD session. Error: Sign in ... | No space in the OS Disk (C drive). | Allocate Free  space in the OS disk (C Drive)   &nbsp; |
| Need to deploy session hosts name ending with 4 digits | Name post fix of the machine is auto populated like example-... | We were able to create session hosts with naming ending with... |
| The friendly name for assigned application groups in Azure V... | Upon investigation, it was found that the customer is explic... | If the customer does not want the friendly name to be set, t... |

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
| 1 | AVD error: we are working on refreshing your token, please try again after a sho... | Network issues causing user connectivity drop when session cannot talk to the on... | Open all dynamic ports on session hosts. Engage networking to check packet drops... | 🔵 6.5 | KB |
| 2 | ConnectionFailedAdTrustedRelationshipFailure: service cannot add user to Remote ... | RPC communication issue with Domain Controller, blocked dynamic ephemeral ports. | Open necessary RPC/dynamic ephemeral ports between session hosts and DC. | 🔵 6.5 | KB |
| 3 | File association GPO does not work in AVD remote application environment on Wind... | Windows 10/11 multi-session lacks the shell32 DefaultAssociationsProfileHandler ... | Import the DefaultAssociationsConfiguration registry from Windows 2019 or 2022 s... | 🔵 6.5 | KB |
| 4 | User login to Session Host via RDP/AVD fails with The system administrator has l... | CrashOnAuditFail registry key at HKLM\System\CurrentControlSet\Control\LSA was s... | Change CrashOnAuditFail from 2 to 1 and restart. Back up and clear Security logs... | 🔵 6.5 | KB |
| 5 | After deployment AVD. VM shown as 'Can't connect' status in hostpool.&nbsp;  VM ... | Remote Desktop Session Host role is required for server OS.&nbsp; This is not me... | Install Remote Desktop Session Host role on the OS. | 🔵 6.5 | KB |
| 6 | Issue: Unable to connect to the AVD session. Error: Sign in failed. Please check... | No space in the OS Disk (C drive). | Allocate Free  space in the OS disk (C Drive)   &nbsp; | 🔵 6.5 | KB |
| 7 | Need to deploy session hosts name ending with 4 digits | Name post fix of the machine is auto populated like example-01, default behavior... | We were able to create session hosts with naming ending with 4 digits post creat... | 🔵 6.5 | KB |
| 8 | The friendly name for assigned application groups in Azure Virtual Desktop (AVD)... | Upon investigation, it was found that the customer is explicitly setting the fri... | If the customer does not want the friendly name to be set, they need to set&nbsp... | 🔵 6.5 | KB |
| 9 | Users attempting to connect to an Azure Virtual Desktop (AVD) session are encoun... | &nbsp;Issue Analysis- Logs indicate failure in adding users to the Remote Deskto... | Recommended Fixes1.Validate PowerShell Script ExecutionRun the script manually o... | 🔵 6.5 | KB |
| 10 | Customer is trying to add EntraJoined Vms to AVD Hostpool, but it fails with err... | Intune endpoints not reachable over network.&nbsp; There were differences in Win... | Intune End:&nbsp;  Ensure Intune network endpoints are reachable. If there are i... | 🔵 6.5 | KB |
| 11 | The user encounters an error when trying to connect to the Session Host in a Per... | Since this is a Personal Host Pool with the assignment type configured as Direct... | The user successfully connected after being assigned to the Session Host. | 🔵 6.5 | KB |
| 12 | Customer is expecting  a Data collection rule manually created by their platform... | Customer was not creating the DCR using the AVD insights documentation, suggeste... | Recommendations As per the AVD insights documentation, suggested method is To co... | 🔵 6.5 | KB |
| 13 | In Azure Monitor &gt; Insights &gt; Virtual Machines or Azure Virtual Desktop In... | &nbsp;The counter specifiers are missed in back end DCR | The highlighted one if missing, the above scenario happens. | 🔵 6.5 | KB |
| 14 | Unexpected hostname changes occurred on AVD session hosts at the operating syste... | Rename occurred inside the OS (not by AVD). Evidence includes NetSetup.log (Netp... | Verified that AVD service was not responsible for the rename. Provided detailed ... | 🔵 6.5 | KB |
| 15 | When typing in Japanese in the Windows App on ChromeOS, two prediction or input ... | Duplicate predictive input sources This issue occurs because both the source Chr... | &nbsp;Configure input settings to use only Microsoft IME on the destination To r... | 🔵 6.5 | KB |
