---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/GA/WireServer Architecture_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FGA%2FWireServer%20Architecture_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# WireServer Architecture

Short URL: https://aka.ms/agexwireserver

## Overview

The Wire Protocol is used for VM-to-host communication. The Guest communicates with the Host through IP address **168.63.129.16** (privileged address in Azure).

The VM uses a Pull model to talk to WireServer for:
- Query VM Goal State
- Query Extensions Configuration
- Report VM's current state
- Other VM-host interactions

The Azure Fabric sends Goal State changes (e.g., add extension) to WireServer. The Guest Agent polls WireServer at frequent intervals to detect changes.

WireServer uses DIP (IP Address) to identify the VM. Guest Agent gets WireServer address via DHCP.

WireServer is also used by Guest Agent to bypass proxy (privileged channel through Host) — **HostGAPlugin** on port 32526.

## Quick Connectivity Test

Open a browser and navigate to: `http://168.63.129.16/?comp=Versions`

This should return an XML file with a list of versions.

## Troubleshooting via Host Logs

Collect logs from the Host Node using Host Analyzer. Key log files in the WireServerLogs folder:

| Log File | Content |
|---|---|
| WireServer-timestamp | WireServer process status (running, stopped, crashed) |
| WireMarshal-timestamp | IMDS requests (search by ContainerID) |
| REST-timestamp | All requests to WireServer (GoalState, Versions, IMDS, Telemetry) — search by PA IP (Container IP) |

## HostGAPlugin Kusto Query

```kql
cluster('azcore.centralus.kusto.windows.net').database('Fa').HostGAPluginRestApiLogs
| where TIMESTAMP >= datetime(2025-02-10 18:00) and TIMESTAMP <= datetime(2025-02-11 00:00)
| where NodeId == "<node-id>"
| where ContainerId contains "<container-id>"
| project TIMESTAMP, Message, Operation, HttpStatusCode, "_AuthType_", EventTid, HResult
```

## Correlating with Guest Agent Telemetry

```kql
cluster('azcore.centralus.kusto.windows.net').database('Fa').GuestAgentExtensionEvents
| where TIMESTAMP >= datetime(2025-02-10 18:09) and TIMESTAMP <= datetime(2025-02-10 18:10)
| where ContainerId contains "<container-id>"
| project TIMESTAMP, NodeId, TaskName, OSVersion, GAVersion, TenantName, Name, Version, OpcodeName, Operation, OperationSuccess, Message
```

## Internal Resources

- Guest agent and wireserver communication slide deck
- Linux Agent and Goal State Processing slide deck
- WireProtocol Wiki on Engineering SharePoint
- WireServer Info: https://dev.azure.com/msazure/AzureWiki/_wiki/wikis/AzureWiki.wiki/61889/Wiresever-Info

## Public Resources

- What is IP address 168.63.129.16?: https://docs.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16
