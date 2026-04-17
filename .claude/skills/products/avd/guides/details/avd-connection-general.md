# AVD AVD 连接通用 - Comprehensive Troubleshooting Guide

**Entries**: 11 | **Drafts fused**: 9 | **Kusto queries fused**: 4
**Source drafts**: ado-wiki-a-determine-disconnection-source.md, ado-wiki-a-w365-avd-error-code-mapping.md, ado-wiki-b-avd-vs-mstsc-connection-flows.md, ado-wiki-b-connection-failed-no-resources.md, ado-wiki-cloudpc-redeploying.md, ado-wiki-cloudpc-restart-oce.md, ado-wiki-connection-flows-websocket-and-udp.md, ado-wiki-dump-cloudpc.md, ado-wiki-rename-cloudpc.md
**Kusto references**: connection-tracking.md, gateway-broker.md, rdp-core-events.md, user-activity.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, OneNote, KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Could not connect to remote PC because of a security error | Allow log on through Remote Desktop Services policy misconfi... | Fix the security policy to include appropriate user groups |
| AVD RemoteApp keeps asking for credentials when launching se... | Expected behavior. When all RemoteApps close, shared session... | By design. Workaround: Keep at least one RemoteApp open to m... |
| HTTP 5xx server error when using Windows 365 Power Platform ... | Backend service issues, service deployment/configuration pro... | 1) Retry operation after a few minutes for transient issues.... |
| CTRL+ALT+DEL and CTRL+ALT+END keyboard shortcuts trigger on ... | By design, keyboard shortcuts like CTRL+ALT+DEL do not propa... | On the destination remote server, create a shortcut: C:\Wind... |
| VPN disconnect on Cloud PC; manual reconnect works | VPN IKEV2 changes default route or End Existing Traffic sett... | Use split tunneling; exempt core RD traffic |
| VPN disconnect; reconnect fails until CPC reboot | VPN tunnel blocks all traffic preventing AVD endpoint access | Allow required W365 endpoints through VPN; use split tunneli... |
| WVD gateway error. Kusto shows Failed to add user to Remote ... | UPN translation fails in cross-domain trust scenarios. | Use actual domain UPN instead of email account. |
| Few users unable to login to AAD joined AVD VMs. Error: 'Sig... | Duplicate UPN entries for affected user accounts in on-prem ... | Remove duplicate UPN entries in on-prem AD and reset passwor... |

### Phase 2: Detailed Investigation

#### Determine disconnection source for WVD/AVD events
> Source: [ado-wiki-a-determine-disconnection-source.md](guides/drafts/ado-wiki-a-determine-disconnection-source.md)

When a disconnect event happens, it is often difficult to determine from a first look where the disconnect came from: Session Host or Client. Based on lab repros, the examples below show how to distin

*Contains 1 KQL query template(s)*

#### ado-wiki-a-w365-avd-error-code-mapping.md
> Source: [ado-wiki-a-w365-avd-error-code-mapping.md](guides/drafts/ado-wiki-a-w365-avd-error-code-mapping.md)

|WVD Error Code|CPC Error Code  |Error Description  |Recommendation  |

#### Connection Flows
> Source: [ado-wiki-b-avd-vs-mstsc-connection-flows.md](guides/drafts/ado-wiki-b-avd-vs-mstsc-connection-flows.md)

> ⚠️ **注意**: 此页面来自 Sandbox/Outdated 区域，为 RDS AAD Auth (PROTOCOL_RDSAAD) 功能的早期开发文档，内容可能已过期。

#### Connection Failed / No Resources Available — Session Host Troubleshooting Decision Tree
> Source: [ado-wiki-b-connection-failed-no-resources.md](guides/drafts/ado-wiki-b-connection-failed-no-resources.md)

> ⚠️ **注意**: 此页面来自 Sandbox/Outdated 区域，为早期 WVD/AVD session host 不可用的排查决策树。内容可能已过期，请结合最新排查指南验证。

*Contains 1 KQL query template(s)*

#### CloudPC Redeploying via OCE API
> Source: [ado-wiki-cloudpc-redeploying.md](guides/drafts/ado-wiki-cloudpc-redeploying.md)

When facing RDP connection difficulties or application access issues on a Cloud PC, redeploying may help. Azure shuts down the VM, moves it to a new node, and powers it back on retaining all configura

*Contains 1 KQL query template(s)*

#### JIT Access Preparation
> Source: [ado-wiki-cloudpc-restart-oce.md](guides/drafts/ado-wiki-cloudpc-restart-oce.md)

> **Stop**: This information should only be followed by WCX PMs and SaaF teams. These steps do not apply to CSS.

#### WebSocket connection flow:
> Source: [ado-wiki-connection-flows-websocket-and-udp.md](guides/drafts/ado-wiki-connection-flows-websocket-and-udp.md)

[Session Connectivity - Overview](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1386415/Session-Connectivity)

#### Cloud PC / AVD Dump Collection Scenarios
> Source: [ado-wiki-dump-cloudpc.md](guides/drafts/ado-wiki-dump-cloudpc.md)

## Scenario 1: Cloud PC/VM No Boot or Stuck on Restarting

*Contains 1 KQL query template(s)*

#### Rename CloudPC (OCE API)
> Source: [ado-wiki-rename-cloudpc.md](guides/drafts/ado-wiki-rename-cloudpc.md)

> This information should only be followed by WCX PMs and SaaF teams. These steps do not apply to CSS.

### Phase 3: Kusto Diagnostics

#### connection-tracking
> `[Tool: Kusto skill - connection-tracking.md]`

连接活动 ID (从 DiagActivity 获取)

#### gateway-broker
> `[Tool: Kusto skill - gateway-broker.md]`

连接活动 ID

#### rdp-core-events
> `[Tool: Kusto skill - rdp-core-events.md]`

Session Host 名称

#### user-activity
> `[Tool: Kusto skill - user-activity.md]`

时间范围 (默认 8h)

### Key KQL Queries

**Query 1:**
```kql
//Last Packets (Last per Leg)
macro-expand isfuzzy=true force_remote=true AVD_Prod as X
(
 X.RDInfraTrace
 | where ActivityId == "<activity-id>"
 | where Msg contains "Last 10"
 | parse Msg with "[" ConnectionId:string "] " Direction:string " Last 10  " Type:string " packets: " PacketData:string
 | mv-apply Packet = split(PacketData, "],[") to typeof(string) on (
 extend Packet = replace_string(replace_string(Packet, "[", ""), "]", "")
 | parse Packet with PacketTimestamp:string ";" PacketSize:l
```

**Query 2:**
```kql
// Get RDInfraTrace using Activity ID and only show errors and warnings
// [Query not fully documented in source]
```

**Query 3:**
```kql
let GetDataFrom = (clusterName:string)
{
cluster(clusterName).database('WVD').RDAgentMetadata
| join kind=leftouter (
cluster('cpcdeedprptprodgbl.eastus2.kusto.windows.net').database('Reporting').DeviceEntity_MV
) on $right.DeviceResourceId == $left.AzureResourceId
| where HostInstance contains "<Managed Device Name>"
| top 1 by Timestamp desc
| project UniqueId, TenantId, HostInstance
};
GetDataFrom('rdsprodus.eastus2') | union GetDataFrom('rdsprodeu.westeurope') | union GetDataFrom('rdsprodgb.
```

**Query 4:**
```kql
cluster('azurecm.kusto.windows.net').database('AzureCM').LogContainerSnapshot
| where PreciseTimeStamp between (_startTime .. _endTime)
| where virtualMachineUniqueId has_any (vmid)
| project PreciseTimeStamp, nodeId, containerId, virtualMachineUniqueId, AvailabilityZone, Region
```

**Query 5:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where ActivityId == "{ActivityId}"
| where PreciseTimeStamp > ago(2d)
| project PreciseTimeStamp, Level, Category, Role, HostInstance, HostPool, Msg
| order by PreciseTimeStamp asc
```

**Query 6:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where ActivityId == "{ActivityId}"
| where PreciseTimeStamp > ago(2d)
| where Level <= 3  // Critical, Error, Warning
| project PreciseTimeStamp, Level, Category, Role, HostInstance, HostPool, Msg
| order by PreciseTimeStamp asc
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Could not connect to remote PC because of a security error | Allow log on through Remote Desktop Services policy misconfigured | Fix the security policy to include appropriate user groups | 🟢 8.0 | MS Learn |
| 2 | AVD RemoteApp keeps asking for credentials when launching second RemoteApp after... | Expected behavior. When all RemoteApps close, shared session enters Disconnected... | By design. Workaround: Keep at least one RemoteApp open to maintain Active sessi... | 🟢 8.0 | OneNote |
| 3 | HTTP 5xx server error when using Windows 365 Power Platform connector actions or... | Backend service issues, service deployment/configuration problems, or transient ... | 1) Retry operation after a few minutes for transient issues. 2) If persists, cre... | 🔵 7.5 | ADO Wiki |
| 4 | CTRL+ALT+DEL and CTRL+ALT+END keyboard shortcuts trigger on Cloud PC instead of ... | By design, keyboard shortcuts like CTRL+ALT+DEL do not propagate through nested ... | On the destination remote server, create a shortcut: C:\Windows\explorer.exe she... | 🔵 7.5 | ADO Wiki |
| 5 | VPN disconnect on Cloud PC; manual reconnect works | VPN IKEV2 changes default route or End Existing Traffic setting | Use split tunneling; exempt core RD traffic | 🔵 7.5 | ADO Wiki |
| 6 | VPN disconnect; reconnect fails until CPC reboot | VPN tunnel blocks all traffic preventing AVD endpoint access | Allow required W365 endpoints through VPN; use split tunneling | 🔵 7.5 | ADO Wiki |
| 7 | WVD gateway error. Kusto shows Failed to add user to Remote Desktop Users group:... | UPN translation fails in cross-domain trust scenarios. | Use actual domain UPN instead of email account. | 🔵 6.5 | KB |
| 8 | Few users unable to login to AAD joined AVD VMs. Error: 'Sign in failed. Please ... | Duplicate UPN entries for affected user accounts in on-prem AD synced via Azure ... | Remove duplicate UPN entries in on-prem AD and reset passwords for affected user... | 🔵 6.5 | KB |
| 9 | Few users unable to login to AAD joined AVD VMs. Error: Sign in failed. Please c... | Duplicate UPN entries for the affected user accounts in on-prem AD synced to Azu... | Remove the duplicate UPN entries in on-prem AD and reset the password for the af... | 🔵 6.5 | KB |
| 10 | Customer has Azure monitor for AVD set up and has LA queries configured to send ... | Expected behavior. | Resolution : &nbsp;   It is      expected for AVD agent to disconnect &amp; re-c... | 🔵 6.5 | KB |
| 11 | User Unable to connect to AVD with Below Error.  &quot;A user account restrictio... | User was part of too many security groups. &nbsp; When same user tried connectin... | Customer removed the user from few unnecessary security group that fixed the iss... | 🔵 6.5 | KB |
