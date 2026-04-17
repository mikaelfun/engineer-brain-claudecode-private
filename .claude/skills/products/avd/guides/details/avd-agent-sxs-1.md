# AVD AVD Agent 与 SxS Stack (Part 1) - Comprehensive Troubleshooting Guide

**Entries**: 15 | **Drafts fused**: 8 | **Kusto queries fused**: 2
**Source drafts**: ado-wiki-a-agent-cant-talk-to-broker.md, ado-wiki-a-geneva-monitoring-agent.md, ado-wiki-a-sxs-stack-manual-reinstall.md, ado-wiki-b-agent-upgrade-failure-check.md, ado-wiki-b-avd-listener-check.md, ado-wiki-b-geneva-monitoring-agent-check.md, ado-wiki-b-reinstall-avd-applications.md, ado-wiki-geneva-agent-troubleshooter.md
**Kusto references**: heartbeat.md, session-host.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, KB, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Event ID 3277 with INVALID_FORM - agent cannot connect to br... | Firewall or DNS settings blocking broker endpoints (BrokerRe... | Verify connectivity to broker endpoints by checking registry... |
| Event ID 3703 - 'RD Gateway Url is not accessible'; agent un... | Firewall or proxy blocking required AVD gateway URLs | Unblock required URLs from Safe URL List. Run Required URL C... |
| Event ID 3277 with ENDPOINT_NOT_FOUND - broker can't find en... | No active session host VMs in host pool, or all exceeded max... | Verify VM is powered on and not removed from host pool; chec... |
| RDAgentBootLoader or Remote Desktop Agent Loader stopped run... | Boot loader unable to install agent properly; agent service ... | Start Remote Desktop Agent Loader service via Services conso... |
| Event ID 3277 with INVALID_REGISTRATION_TOKEN or EXPIRED_MAC... | Registration key is expired or invalid | Generate new registration key, update registry (HKLM:\SOFTWA... |
| Event ID 3019 - agent can't reach web socket transport URLs | Network blocking web socket transport URLs required by AVD | Unblock URLs from Safe URL List. Check network trace logs to... |
| Event ID 3277 with InstallationHealthCheckFailedException - ... | Terminal server toggled registry key for stack listener, dis... | Check if stack listener is working; if not, manually uninsta... |
| Session host VMs stuck in Upgrading or Unavailable state | Agent or side-by-side stack didn't install successfully | Reinstall SxS network stack: stop RDAgentBootLoader, uninsta... |

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
| 1 | Event ID 3277 with INVALID_FORM - agent cannot connect to broker | Firewall or DNS settings blocking broker endpoints (BrokerResourceIdURI and Brok... | Verify connectivity to broker endpoints by checking registry keys under HKLM:\SO... | 🟢 8.0 | MS Learn |
| 2 | Event ID 3703 - 'RD Gateway Url is not accessible'; agent unable to reach gatewa... | Firewall or proxy blocking required AVD gateway URLs | Unblock required URLs from Safe URL List. Run Required URL Check tool. For Azure... | 🟢 8.0 | MS Learn |
| 3 | Event ID 3277 with ENDPOINT_NOT_FOUND - broker can't find endpoint to connect | No active session host VMs in host pool, or all exceeded max session limit, or a... | Verify VM is powered on and not removed from host pool; check max session limit ... | 🟢 8.0 | MS Learn |
| 4 | RDAgentBootLoader or Remote Desktop Agent Loader stopped running on session host... | Boot loader unable to install agent properly; agent service not running | Start Remote Desktop Agent Loader service via Services console. If it stops afte... | 🔵 7.0 | MS Learn |
| 5 | Event ID 3277 with INVALID_REGISTRATION_TOKEN or EXPIRED_MACHINE_TOKEN in Applic... | Registration key is expired or invalid | Generate new registration key, update registry (HKLM:\SOFTWARE\Microsoft\RDInfra... | 🔵 7.0 | MS Learn |
| 6 | Event ID 3019 - agent can't reach web socket transport URLs | Network blocking web socket transport URLs required by AVD | Unblock URLs from Safe URL List. Check network trace logs to identify where AVD ... | 🔵 7.0 | MS Learn |
| 7 | Event ID 3277 with InstallationHealthCheckFailedException - stack listener not w... | Terminal server toggled registry key for stack listener, disabling it | Check if stack listener is working; if not, manually uninstall and reinstall the... | 🔵 7.0 | MS Learn |
| 8 | Session host VMs stuck in Upgrading or Unavailable state | Agent or side-by-side stack didn't install successfully | Reinstall SxS network stack: stop RDAgentBootLoader, uninstall SxS Network Stack... | 🔵 7.0 | MS Learn |
| 9 | The issue experienced is lack of session connectivity to the AVD Session Hosts a... | For an issue like this, there could be multiple causes:  Unsupported SKUs: AVD d... | Taking into account the possible causes for this issue written above, let's take... | 🔵 6.5 | KB |
| 10 | -&gt; Customer had the below error message suddenly every time customer tries to... | RdpAvenc.dll&nbsp;was broken and causing the connection error | Re-installed SXS-Stack as below documentation and issue was resolvedhttps://dev.... | 🔵 6.5 | KB |
| 11 | Abstract  WindowsApp for iOS dose not recognize 106 Japanese Keyboard.   Symptom... | From Bug 57670273: [iOS] WindowsApp for iOS dose not recognize 106 Japanese Keyb... | Change the following registry. HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Contr... | 🔵 6.5 | KB |
| 12 | Abstract  Windows App that version is&nbsp;2.0.704.0 crashes at the boot time.Th... | This symptom is investigating the IcM&nbsp;that is&nbsp;https://portal.microsoft... | The fixed version of Windows AppThis problem has been fixed in the version 2.0.7... | 🔵 6.5 | KB |
| 13 | Event ID 3389 with MissingMethodException during agent update - agent reverts to... | .NET Framework version installed on VM is lower than 4.7.2 | Upgrade .NET Framework to version 4.7.2 or later | 🔵 6.5 | MS Learn |
| 14 | Multiple AVD session hosts become unhealthy simultaneously across several host p... | Network connectivity disruption between session hosts and AVD RDBroker WebSocket... | 1) Reboot affected session hosts to recover immediately. 2) Ensure firewall/prox... | 🔵 6.0 | OneNote |
| 15 | Event ID 3277 with InstallMsiException - agent installer fails | Another MSI installer already running, or Group Policy blocking msiexec.exe (Win... | Wait for other installer to finish, or check RSOP for 'Turn off Windows Installe... | 🔵 6.0 | MS Learn |
