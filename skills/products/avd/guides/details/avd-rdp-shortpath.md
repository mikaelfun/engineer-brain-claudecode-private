# AVD AVD RDP Shortpath - Comprehensive Troubleshooting Guide

**Entries**: 8 | **Drafts fused**: 5 | **Kusto queries fused**: 1
**Source drafts**: ado-wiki-a-rdp-shortpath-public-script.md, ado-wiki-b-custom-shortpath-gpo-setting.md, ado-wiki-b-custom-shortpath-gpo.md, mslearn-rdp-shortpath-troubleshooting.md, onenote-avd-rdp-shortpath.md
**Kusto references**: rdp-core-events.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD on Azure Stack HCI: RDP Shortpath not working | VM has multiple IP addresses and the service selects an inco... | If customer reports this issue, create an ICM for the produc... |
| RDP Shortpath (UDP transport) fails to establish for client ... | Client machine GPO policy is blocking UDP traffic, preventin... | Run Kusto query: cluster('rdsprod.eastus2.kusto.windows.net'... |
| RDP Shortpath (UDP transport) fails to establish from sessio... | Session host VM GPO policy is blocking UDP traffic, preventi... | Run Kusto query: cluster('rdsprod.eastus2.kusto.windows.net'... |
| The RDP short path value for the hostpool changes from &quot... | RDP shortpath value set to NOT DEFINED in the Azure portal b... | The Azure Virtual Desktop (AVD) Product Group team has ackno... |
| The customer is experiencing issues with the configuration o... | Group      Policy Limitations:&nbsp;The GPO settings can dis... | Host      Pool Network Properties:      Use       the settin... |
| The customer is facing issues with configuring UDP ShortPath... | The issue arises due to the way the ICE/STUN protocol evalua... | To resolve the UDP ShortPath over ER issue, follow these ste... |
| ShortpathTransportNetworkDrop error in Log Analytics - UDP c... | UDP has no RST mechanism; loss detected only by timeout | Use avdnettest.exe to verify STUN/TURN connectivity and NAT ... |
| ConnectionBrokenMissedHeartbeatThresholdExceeded - RDP timeo... | RDP heartbeat timeout misconfiguration | Review RDP heartbeat timeout settings |

### Phase 2: Detailed Investigation

#### Does script test on every local interface with IPv4/IPv6 address?
> Source: [ado-wiki-a-rdp-shortpath-public-script.md](guides/drafts/ado-wiki-a-rdp-shortpath-public-script.md)

[Updated Script](https://microsoft.visualstudio.com/RDV/_git/rd-nano?version=GBuser%2Fmilacher%2Frandom-fixes&path=%2Ftools%2Ftest-ice.ps1)

#### Custom Shortpath GPO Setting
> Source: [ado-wiki-b-custom-shortpath-gpo-setting.md](guides/drafts/ado-wiki-b-custom-shortpath-gpo-setting.md)

**Contributors:** Jose Che Murillo

#### Custom Shortpath GPO Setting
> Source: [ado-wiki-b-custom-shortpath-gpo.md](guides/drafts/ado-wiki-b-custom-shortpath-gpo.md)

**Resource Lookup Note:** For more information about RDP Shortpath, review [Internal Only - RDP Shortpath Wiki](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDes

#### AVD RDP Shortpath Troubleshooting Guide
> Source: [mslearn-rdp-shortpath-troubleshooting.md](guides/drafts/mslearn-rdp-shortpath-troubleshooting.md)

> Source: [Troubleshoot RDP Shortpath](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-rdp-shortpath)

#### RDP Shortpath Setup and Connection Flow Guide
> Source: [onenote-avd-rdp-shortpath.md](guides/drafts/onenote-avd-rdp-shortpath.md)

> Source: OneNote - Mooncake POD Support Notebook / AVD / Feature Verification / RDP shortpath

### Phase 3: Kusto Diagnostics

#### rdp-core-events
> `[Tool: Kusto skill - rdp-core-events.md]`

Session Host 名称

### Key KQL Queries

**Query 1:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where ActivityId == "{ActivityId}"
| where TIMESTAMP >= ago(9d)
| project TIMESTAMP, Level, TaskName, Message, ProviderName
| order by TIMESTAMP asc
```

**Query 2:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where TIMESTAMP > ago(3h)
| where HostInstance contains "{SessionHostName}"
| where Level <= 3  // Error, Warning, Critical
| project TIMESTAMP, ActivityId, Level, ProviderName, Message, HostPool
| order by TIMESTAMP desc
```

**Query 3:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where ActivityId == "{ActivityId}"
| where TIMESTAMP >= ago(9d)
| where Message contains "connection" or Message contains "session"
| project TIMESTAMP, Level, TaskName, ProviderName, Message
| order by TIMESTAMP asc
```

**Query 4:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where TIMESTAMP > ago(1d)
| where HostInstance contains "{SessionHostName}"
| where EventId in (1149, 4624, 4625, 21, 22, 23, 24, 25)
| project TIMESTAMP, EventId, Level, ProviderName, Message
| order by TIMESTAMP desc
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | AVD on Azure Stack HCI: RDP Shortpath not working | VM has multiple IP addresses and the service selects an incorrect one for RDP Sh... | If customer reports this issue, create an ICM for the product group to investiga... | 🟢 8.0 | ADO Wiki |
| 2 | RDP Shortpath (UDP transport) fails to establish for client connections; AVD fal... | Client machine GPO policy is blocking UDP traffic, preventing RDP Shortpath from... | Run Kusto query: cluster('rdsprod.eastus2.kusto.windows.net').database('WVD').RD... | 🔵 7.5 | ADO Wiki |
| 3 | RDP Shortpath (UDP transport) fails to establish from session host VM side; UDP ... | Session host VM GPO policy is blocking UDP traffic, preventing RDP Shortpath fro... | Run Kusto query: cluster('rdsprod.eastus2.kusto.windows.net').database('WVD').RD... | 🔵 7.5 | ADO Wiki |
| 4 | The RDP short path value for the hostpool changes from &quot;DISABLED&quot; to &... | RDP shortpath value set to NOT DEFINED in the Azure portal by scaling plan. Know... | The Azure Virtual Desktop (AVD) Product Group team has acknowledged this as a kn... | 🔵 6.5 | KB |
| 5 | The customer is experiencing issues with the configuration of RDP Shortpath for ... | Group      Policy Limitations:&nbsp;The GPO settings can disable RDP Shortpath  ... | Host      Pool Network Properties:      Use       the settings on the Host pool ... | 🔵 6.5 | KB |
| 6 | The customer is facing issues with configuring UDP ShortPath for Azure Virtual D... | The issue arises due to the way the ICE/STUN protocol evaluates multiple routes ... | To resolve the UDP ShortPath over ER issue, follow these steps: Verify VPN Conne... | 🔵 6.5 | KB |
| 7 | ShortpathTransportNetworkDrop error in Log Analytics - UDP connection drops | UDP has no RST mechanism; loss detected only by timeout | Use avdnettest.exe to verify STUN/TURN connectivity and NAT type | 🟡 4.5 | MS Learn |
| 8 | ConnectionBrokenMissedHeartbeatThresholdExceeded - RDP timeout before UDP timeou... | RDP heartbeat timeout misconfiguration | Review RDP heartbeat timeout settings | 🟡 4.5 | MS Learn |
