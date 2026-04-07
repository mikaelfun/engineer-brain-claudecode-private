---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/Log Sources For Azure Bastion"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FLog%20Sources%20For%20Azure%20Bastion"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Log Sources For Azure Bastion

[[_TOC_]]

## Log Sources

- **FrontEnd (TomcatAccess) Logs** – Front-end logs for all calls made to Bastion. Includes session setup and response to webclient.
- **Daemon Logs** – Handles the actual RDP/SSH session. Shows RDP/SSH client failures/success.

---

### Kusto Queries

#### Azure Public Cloud

```kusto
cluster('hybridnetworking').database('aznwmds').TomcatAccessLog
| where PreciseTimeStamp >= datetime(2022-03-25 19:25:00)  and PreciseTimeStamp <= datetime(2022-04-27 19:35:00)
| where Tenant == "00000000-0000-0000-0000-000000000000"
```

```kusto
cluster('hybridnetworking').database('aznwmds').DaemonLogs
| where PreciseTimeStamp >= datetime(2022-03-25 19:25:00)  and PreciseTimeStamp <= datetime(2022-04-27 19:35:00)
| where Tenant == "00000000-0000-0000-0000-000000000000"
```

#### Azure Government (Fairfax)

```kusto
cluster('aznwff').database('aznwmds').TomcatAccessLog
| where PreciseTimeStamp >= datetime(2022-03-25 19:25:00)  and PreciseTimeStamp <= datetime(2022-04-27 19:35:00)
| where Tenant == "00000000-0000-0000-0000-000000000000"
```

```kusto
cluster('aznwff').database('aznwmds').DaemonLogs
| where PreciseTimeStamp >= datetime(2022-03-25 19:25:00)  and PreciseTimeStamp <= datetime(2022-04-27 19:35:00)
| where Tenant == "00000000-0000-0000-0000-000000000000"
```

#### Combined Query (Public Cloud)

```kusto
union
(cluster('hybridnetworking').database('aznwmds').DaemonLogs
| where Tenant == "" // Provide Tenant
| where (PreciseTimeStamp >= datetime(2022-05-03 00:00:00) and PreciseTimeStamp <= datetime(2022-05-03 20:00:00))
| where message != " Guacamole protocol violation. Perhaps the version of guacamole-client is incompatible with this version of guacd?"
| where message != " Error reading ""select"": Instruction parse error"
| where message != " Error reading ""select"": End of stream reached while reading instruction"
| where message != " Guacamole connection closed during handshake"
| where message !contains (" Parameter ")),
(cluster('hybridnetworking').database('aznwmds').TomcatAccessLog
| where Tenant == "" // Provide Tenant
| where (PreciseTimeStamp >= datetime(2022-05-03 00:00:00) and PreciseTimeStamp <= datetime(2022-05-03 20:00:00)))
| where caller != "c.m.b.i.h.AzureDiscoveryStrategy"
| where caller != "c.m.b.i.hazelcast.PingMeshListener"
| where caller != "o.a.g.r.f.MDCInsertingSessionIdServletFilter"
| where caller != "o.a.g.h.h.HealthCheckServiceHelper"
| where caller != "c.m.b.discovery.AzureInstaneService"
| project PreciseTimeStamp, RoleInstance, level, httpSessionId, bastionTargetResourceId, bastionProtocol, message
| sort by PreciseTimeStamp
// Facility = Daemon Logs | None = Tomcat
```

#### Bastion Version Specific Tenant (Public Cloud)

```kusto
cluster('hybridnetworking').database('aznwmds').DaemonLogs
| where PreciseTimeStamp >= datetime(2022-04-20 00:00:00)  and PreciseTimeStamp <= datetime(2022-04-23 00:00:00)
| where Tenant == "00000000-0000-0000-0000-000000000000"
| summarize count() by BastionVersion, TIMESTAMP, RoleInstance
```

#### Bastion Version Per Region (Public Cloud)

```kusto
cluster('hybridnetworking').database('aznwmds').DaemonLogs
| where PreciseTimeStamp >= datetime(2022-04-20 00:00:00)  and PreciseTimeStamp <= datetime(2022-04-23 00:00:00)
| summarize count() by BastionVersion, Region
| sort by Region
| render columnchart 
```

---

### Jarvis Logs (Public)

| Log Source | Link |
|---|---|
| TomcatAccessLog | https://jarvis-west.dc.ad.msft.net/D54841CA |
| DaemonLogs | https://jarvis-west.dc.ad.msft.net/4B209C3D |
| LinuxAsmSyslog | https://portal.microsoftgeneva.com/s/23E79434 |

**Jarvis Dashboard (Bastion)**: https://portal.microsoftgeneva.com/s/F8A722BC
- Shows combination of Tomcat logs, Daemon logs, active sessions, resource health check.

### Jarvis Logs (Azure Government)

| Log Source | Link |
|---|---|
| TomcatAccessLog (Fairfax) | https://portal.microsoftgeneva.com/s/CAA72F72 |
| DaemonLogs (Fairfax) | https://portal.microsoftgeneva.com/s/3E7532C7 |

---

### Developer SKU Specific Logs

#### BastionAgent
- **Namespace**: BrkOmniAgent
- **Tables**:
  - `SessionLogs` – All connection request logs
  - `AgentLogs` – All other logs
  - `PulseLogger` – Health logs (connection status with OmniBrain, NMAgent, version)
- **Recommended filters**: Region, Tenant, nodeId, activityId

Sample query: https://portal.microsoftgeneva.com/s/23B307C8

#### OmniData logging
- **Namespace**: BrkOmniBastion
- **Tables**:
  - `TomcatLogs` – Similar to TomcatAccessLogs
  - `GuacdLogs` – Similar to DaemonLogs
- **Recommended filters**: Region, NamespaceName

Sample query: https://portal.microsoftgeneva.com/s/24672C6C

#### OmniBrain logging
- **Namespace**: BrkOmniBastion
- **Tables**:
  - `OmniBrainsLog` – Connection requests and results
  - `ControlChannel` – Communication between Agent and OmniBrain
- **Recommended filters**: Region, resourceId, bastionId, sessionId

Sample query: https://portal.microsoftgeneva.com/s/28ABF770

---

### Connection Outcome

Filter on `log` column contains `"LogMasterOutcome"` to get final outcome of connection attempt.

Sample: https://portal.microsoftgeneva.com/s/42B8F33D

---

### Jarvis Actions (Diagnostic Prod > Brooklyn > BastionService)

| Action | Description |
|---|---|
| **List Bastions** | Lists bastions for subscription and region; shows ResourceArmId |
| **Get Bastion** | Use ResourceArmId to get Tenant Version, InstanceDnsNames, CreatedTime, VIPAddress |
| **Bastion Connectivity test** | Test connectivity from Bastion host to backend VM (input ARM/NRP GUID, region, protocol, private IP) |
| **Get Bastion Shareable Link** | Input ARM guid and region |

---

### Control Plane Logging

| Source | Description |
|---|---|
| Diagnostic Prod > NRP > FrontendEtwEvents | NRP data for operations and NRP calls to Brooklyn GWM |
| Diagnostic Prod > Brooklyn > BrkGWM > AsyncWorkerLogsTable | Provisioning of Bastion tenants; search for `The ARM operation failed!` |

- **GWM Success**: look for `Deployment succeeded`
- **GWM Error**: search for `The VMSS gateway-deployment failed with error: <Error Stack Trace>`

NRP Example: https://portal.microsoftgeneva.com/BFA89D38
GWM Example: https://portal.microsoftgeneva.com/67E4CE91

---

### Windows RDP Event Logs

**How to access**: VM in ASC → Diagnostics Tab → Inspect IaaS Disk → Create Report → Run Guest Analyzer → Download → Extract → navigate to Log folder.

#### Key Event IDs

| EventID | Log | Description |
|---|---|---|
| 1149 | TerminalServices-RemoteConnectionManager/Operational | User authentication succeeded |
| 261 | TerminalServices-RemoteConnectionManager/Operational | Listener RDP-Tcp received a connection |
| 72 | RemoteDesktopServices-RdpCoreTS/Operational | SendLogonErrorInfoToClient |
| 131 | RemoteDesktopServices-RdpCoreTS/Operational | Server accepted new TCP connection |
| 4624 | Security | Account successfully logged on |
| 4625 | Security | Account failed to log on (check status field) |
| 4778 | Security | Session reconnected to Window Station (Bastion shown in Additional Information) |
| 4779 | Security | Session disconnected from Window Station |
| 21 | TerminalServices-LocalSessionManager/Operational | Session logon succeeded |
| 23 | TerminalServices-LocalSessionManager/Operational | Session logoff succeeded |
| 24 | TerminalServices-LocalSessionManager/Operational | Session disconnected |
| 40 | TerminalServices-LocalSessionManager/Operational | Session disconnected (check reason code) |

**Security EventID 4625** – "The NetLogon component is not active": set NetLogon service to "Automatic".

Full disconnect codes: https://social.technet.microsoft.com/wiki/contents/articles/37870.remote-desktop-client-troubleshooting-disconnect-codes-and-reasons.aspx

---

### Kusto (GatewayManager BastionHostTable)

```kusto
// Get Bastion details by subscription and resource group
['GatewayManager.BastionHostTable'] | where Lens_IngestionTime > ago(1d)
| where RowKey contains "bh_"
| where ResourceGroupName == "dev-totalrewards-rg" and CustomerSubscriptionId contains "00000000-0000-0000-0000-000000000000"
| project ResourceArmId, CustomerSubscriptionId, ResourceGroupName, CreationTime, TenantVersion
```

```kusto
// Find Bastion create/delete failure by Bastion ARM ID
AsyncWorkerLogsTable | where TIMESTAMP > ago(7d)
| where OperationName contains "Bastion" and Message contains "gateway-deployment failed"
| where ServicePrefix contains "wavnet"
| where Message contains "00000000-0000-0000-0000-000000000000" //Replace with bastion Arm Id
| project ActivityId, CustomerSubscriptionId, DeploymentId, Message, ServicePrefix, VirtualNetworkId
```

> **Source**: ADO Wiki - AzureNetworking/Wiki
> **Page**: /Azure Bastion/Log Sources For Azure Bastion
