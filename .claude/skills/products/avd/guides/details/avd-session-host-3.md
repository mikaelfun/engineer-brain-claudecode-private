# AVD AVD Session Host (Part 3) - Comprehensive Troubleshooting Guide

**Entries**: 6 | **Drafts fused**: 1 | **Kusto queries fused**: 3
**Source drafts**: ado-wiki-b-determine-session-host-image-type.md
**Kusto references**: health-check.md, heartbeat.md, session-host.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Cannot add AVD session host using Windows Server 2019 Datace... | Windows Server 2019 Datacenter marketplace offer not availab... | Workaround: Create VM separately then register to host pool ... |
| When publishing Edge browser as RemoteApp in AVD, users can ... | Browser RemoteApp runs on session host with full file system... | Configure Group Policy URLBlocklist to block file:// URLs. F... |
| AVD session randomly reconnects 1-2 times per hour. Backend ... | Client intermittently loses connectivity to WVD service URLs... | 1) Whitelist all WVD URLs on client firewall. 2) Whitelist A... |
| Multiple AVD session hosts become unhealthy simultaneously a... | Network connectivity disruption between session hosts and AV... | 1) Reboot affected session hosts to recover immediately. 2) ... |
| Azure Monitor configuration workbook for AVD fails with 'Dep... | The Azure Monitor configuration workbook for AVD may pass in... | Instead of using the configuration workbook, manually config... |
| AVD connection failure with error ConnectionFailedAdTrustedR... | NSG rules blocked network communication between session host... | Add service tag VirtualNetwork to NSG inbound/outbound rules... |

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
| 1 | Cannot add AVD session host using Windows Server 2019 Datacenter from marketplac... | Windows Server 2019 Datacenter marketplace offer not available in customer subsc... | Workaround: Create VM separately then register to host pool manually with PowerS... | 🔵 6.5 | OneNote |
| 2 | When publishing Edge browser as RemoteApp in AVD, users can access session host ... | Browser RemoteApp runs on session host with full file system access. No default ... | Configure Group Policy URLBlocklist to block file:// URLs. For Edge: Microsoft.P... | 🔵 6.5 | OneNote |
| 3 | AVD session randomly reconnects 1-2 times per hour. Backend log: connection clos... | Client intermittently loses connectivity to WVD service URLs. AVD heartbeat: 1 p... | 1) Whitelist all WVD URLs on client firewall. 2) Whitelist Azure IP ranges: Azur... | 🔵 6.0 | OneNote |
| 4 | Multiple AVD session hosts become unhealthy simultaneously across several host p... | Network connectivity disruption between session hosts and AVD RDBroker WebSocket... | 1) Reboot affected session hosts to recover immediately. 2) Ensure firewall/prox... | 🔵 6.0 | OneNote |
| 5 | Azure Monitor configuration workbook for AVD fails with 'Deployment template val... | The Azure Monitor configuration workbook for AVD may pass incorrect parameter ty... | Instead of using the configuration workbook, manually configure performance coun... | 🔵 6.0 | OneNote |
| 6 | AVD connection failure with error ConnectionFailedAdTrustedRelationshipFailure a... | NSG rules blocked network communication between session host VNET and domain con... | Add service tag VirtualNetwork to NSG inbound/outbound rules to allow traffic be... | 🔵 6.0 | OneNote |
