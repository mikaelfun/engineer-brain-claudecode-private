# AVD AVD Agent 与 SxS Stack (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 10 | **Drafts fused**: 8 | **Kusto queries fused**: 2
**Source drafts**: ado-wiki-a-agent-cant-talk-to-broker.md, ado-wiki-a-geneva-monitoring-agent.md, ado-wiki-a-sxs-stack-manual-reinstall.md, ado-wiki-b-agent-upgrade-failure-check.md, ado-wiki-b-avd-listener-check.md, ado-wiki-b-geneva-monitoring-agent-check.md, ado-wiki-b-reinstall-avd-applications.md, ado-wiki-geneva-agent-troubleshooter.md
**Kusto references**: heartbeat.md, session-host.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD session host deployment completed but no session host ap... | Outbound network restricted - AVD agent cannot reach broker.... | Check: 1) ARM deployment status for errors. 2) Application e... |
| AVD agent cannot connect to broker through proxy. Session ho... | Proxy is configured for user accounts but not for the LocalS... | Configure proxy for LocalSystem and NetworkService using bit... |
| AVD session host marked as unhealthy/unavailable. Agent hear... | Agent heartbeat: If broker misses multiple heartbeats, VM is... | Check agent heartbeat via Kusto (RDInfraTrace table, Categor... |
| AVD VMs not joining host pool after provisioning. VMs create... | Transient network issue between session host VNet and AVD co... | 1. Verify connectivity with WVDAgentURLTool.exe. 2. Check re... |
| Session host fails MonitoringAgentCheck - Geneva Agent not f... | Remote Desktop Services Infrastructure Geneva Agent not inst... | Verify Geneva Agent installed (check Apps & Features); unins... |
| Stack listener not working on Windows 10 2004 - rdp-tcp/rdp-... | Registry keys fReverseConnectMode or fEnableWinStation not s... | Set fReverseConnectMode=1 and fEnableWinStation=1 in registr... |
| O_REVERSE_CONNECT_STACK_FAILURE error - SxS stack not instal... | Side-by-side stack not installed on session host VM | RDP as local admin and reinstall SxS stack via host pool reg... |
| NAME_ALREADY_REGISTERED error when registering session host | Session host VM name is a duplicate of an existing registrat... | Remove session host from host pool, create new VM with uniqu... |

### Phase 2: Detailed Investigation

#### Agent Can't Talk to Broker - Troubleshooting Guide
> Source: [ado-wiki-a-agent-cant-talk-to-broker.md](guides/drafts/ado-wiki-a-agent-cant-talk-to-broker.md)

## Step 1: Collect MSRD-Collect

*Contains 2 KQL query template(s)*

#### Scenarios:
> Source: [ado-wiki-a-geneva-monitoring-agent.md](guides/drafts/ado-wiki-a-geneva-monitoring-agent.md)

The Geneva Monitoring platform enables services to do Monitoring, Diagnostics and Analytics at scale. It is designed to support the requirements of services built on Azure, AutoPilot, Pilotfish or GFS

#### SxS Stack Manual Reinstall Guide
> Source: [ado-wiki-a-sxs-stack-manual-reinstall.md](guides/drafts/ado-wiki-a-sxs-stack-manual-reinstall.md)

> **Use this ONLY as a last resort**, if every other troubleshooting attempt failed. Discuss with an SME before proceeding.

#### Agent Upgrade Failure Check
> Source: [ado-wiki-b-agent-upgrade-failure-check.md](guides/drafts/ado-wiki-b-agent-upgrade-failure-check.md)

- Review RDAgentBootLoader events in Application Log for errors

*Contains 2 KQL query template(s)*

#### AVD Listener Check (SxSStack Health Check)
> Source: [ado-wiki-b-avd-listener-check.md](guides/drafts/ado-wiki-b-avd-listener-check.md)

## Determine if WVD listener and RDP listener is working on local computer

#### ado-wiki-b-geneva-monitoring-agent-check.md
> Source: [ado-wiki-b-geneva-monitoring-agent-check.md](guides/drafts/ado-wiki-b-geneva-monitoring-agent-check.md)

<div id='cssfeedback-start'></div>

#### AVD Classic
> Source: [ado-wiki-b-reinstall-avd-applications.md](guides/drafts/ado-wiki-b-reinstall-avd-applications.md)

<table style="margin-left:.34in">

#### Geneva Agent Troubleshooter
> Source: [ado-wiki-geneva-agent-troubleshooter.md](guides/drafts/ado-wiki-geneva-agent-troubleshooter.md)

## 1. Access Geneva Agent Troubleshooter

### Phase 3: Kusto Diagnostics

#### heartbeat
> `[Tool: Kusto skill - heartbeat.md]`

Session Host 名称或 FQDN

#### session-host
> `[Tool: Kusto skill - session-host.md]`

Session Host 名称或 FQDN

### Key KQL Queries

**Query 1:**
```kql
cluster("rdsprod.eastus2").database("WVD").RDOperation
| union cluster("rdsprodus.eastus2").database("WVD").RDOperation
| union cluster("rdsprodeu.westeurope").database("WVD").RDOperation
| where HostInstance == "<VM NAME>"
| where Name contains "broker"
| where PreciseTimeStamp >= ago(1d)
| where ResType != "Success"
| project PreciseTimeStamp, ActivityId, HostInstance, Role, Name, ResType, ResSignature, ResDesc
```

**Query 2:**
```kql
cluster("rdsprod.eastus2").database("WVD").RDInfraTrace
| union cluster("rdsprodus.eastus2").database("WVD").RDInfraTrace
| union cluster("rdsprodeu.westeurope").database("WVD").RDInfraTrace
| where HostInstance == "<VM NAME>"
| where PreciseTimeStamp >= ago(1d)
| where Role == "RDAgent" and Msg contains "System.Net.Websockets"
| project PreciseTimeStamp, ActivityId, Level, Category, Role, HostInstance, Msg
```

**Query 3:**
```kql
//Agent Version
cluster("rdsprod.eastus2").database("WVD").DiagActivity
| union cluster("rdsprodus.eastus2").database("WVD").DiagActivity
| union cluster("rdsprodeu.westeurope").database("WVD").DiagActivity
| where SessionHostName has "vm name"
| where env_time >= ago(5d)
| project env_time, Id, ActRing, SessionHostName, AgentVersion, AgentSxsStackVersion
```

**Query 4:**
```kql
//Agent Upgrade
cluster("rdsprod.eastus2").database("WVD").RDInfraTrace
| union cluster("rdsprodus.eastus2").database("WVD").RDInfraTrace
| union cluster("rdsprodeu.westeurope").database("WVD").RDInfraTrace
| where HostInstance == "wvd vm"
| where TIMESTAMP >= datetime(start time frame) and TIMESTAMP <= datetime(end time frame)
| where Category == "RDAgent.AgentUpdaterService.AgentBackgroundUpdater"
    or Category == "Microsoft.RDInfra.AgentUpdateTelemetry.Impl.AgentUpdateTelemetryImpl"
    or 
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
| 1 | AVD session host deployment completed but no session host appears in host pool. ... | Outbound network restricted - AVD agent cannot reach broker. Or PS DSC extension... | Check: 1) ARM deployment status for errors. 2) Application event logs for WVD-Ag... | 🟢 8.0 | OneNote |
| 2 | AVD agent cannot connect to broker through proxy. Session host shows unavailable... | Proxy is configured for user accounts but not for the LocalSystem/NetworkService... | Configure proxy for LocalSystem and NetworkService using bitsadmin: 'bitsadmin /... | 🟢 8.0 | OneNote |
| 3 | AVD session host marked as unhealthy/unavailable. Agent heartbeat mechanism: age... | Agent heartbeat: If broker misses multiple heartbeats, VM is marked unhealthy an... | Check agent heartbeat via Kusto (RDInfraTrace table, Category contains 'Heartbea... | 🟢 8.0 | OneNote |
| 4 | AVD VMs not joining host pool after provisioning. VMs created successfully but f... | Transient network issue between session host VNet and AVD control plane. RD Agen... | 1. Verify connectivity with WVDAgentURLTool.exe. 2. Check required URL list. 3. ... | 🔵 7.5 | OneNote |
| 5 | Session host fails MonitoringAgentCheck - Geneva Agent not functioning | Remote Desktop Services Infrastructure Geneva Agent not installed, has multiple ... | Verify Geneva Agent installed (check Apps & Features); uninstall older versions ... | 🔵 7.0 | MS Learn |
| 6 | Stack listener not working on Windows 10 2004 - rdp-tcp/rdp-sxs not in Listen st... | Registry keys fReverseConnectMode or fEnableWinStation not set to 1 under HKLM\S... | Set fReverseConnectMode=1 and fEnableWinStation=1 in registry for matching stack... | 🔵 6.5 | MS Learn |
| 7 | O_REVERSE_CONNECT_STACK_FAILURE error - SxS stack not installed | Side-by-side stack not installed on session host VM | RDP as local admin and reinstall SxS stack via host pool registration | 🔵 6.5 | MS Learn |
| 8 | NAME_ALREADY_REGISTERED error when registering session host | Session host VM name is a duplicate of an existing registration | Remove session host from host pool, create new VM with unique name, re-register | 🔵 6.0 | MS Learn |
| 9 | DownloadMsiException - agent fails to download/install | Insufficient disk space on session host VM for RDAgent installation | Free up disk space by deleting unused files or increase storage capacity of sess... | 🔵 6.0 | MS Learn |
| 10 | DisableRegistryTools registry key prevents agent from installing SxS stack - ins... | DisableRegistryTools=1 set in HKU\DEFAULT, HKU\S-1-5-18, or HKCU policies preven... | Remove DisableRegistryTools key from all three locations, uninstall affected SxS... | 🔵 6.0 | MS Learn |
