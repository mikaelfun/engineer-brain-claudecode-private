---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Dependencies/AVD/Connectivity/Determine disconnection source for some of the events"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FDependencies%2FAVD%2FConnectivity%2FDetermine%20disconnection%20source%20for%20some%20of%20the%20events"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Determine disconnection source for WVD/AVD events

When a disconnect event happens, it is often difficult to determine from a first look where the disconnect came from: Session Host or Client. Based on lab repros, the examples below show how to distinguish the source using WVD Kusto events.

## 1. Session Host triggered disconnect on UDP

- **First** event reported by **Client**, **second** event (seconds later) by **RDBroker**
- Key pattern: Broker reporting comes a few seconds after Client event

## 2. Session Host triggered disconnect on TCP/Websocket

- Usually **4 events** in order: Gateway, Client, Broker
- Client & Gateway share the same ActivityId, Broker has next index (0100)

## 3. Client machine triggers disconnect on TCP/Websocket

- When client network goes down, error codes indicate client disconnect
- But reported by **Gateway**, NOT the Client
- Only **two** entries visible

## 4. Client machine triggers disconnect on UDP

- When client network breaks on UDP connection
- Report does NOT show Client as source
- Error reported by **Stack**

## How to simulate for lab repro

### Simulate Session Host network interruption:
```powershell
# Cut network NOW
New-NetFirewallRule -DisplayName "SimNetCut" -Direction Outbound -Action Block -Enabled True
New-NetFirewallRule -DisplayName "SimNetCutIn" -Direction Inbound -Action Block -Enabled True

# Schedule cleanup on next boot (self-deleting)
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument `
  "-NoProfile -Command `"Remove-NetFirewallRule -DisplayName 'SimNetCut'; Remove-NetFirewallRule -DisplayName 'SimNetCutIn'; Unregister-ScheduledTask -TaskName 'RemoveNetCut' -Confirm:`$false`""
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName "RemoveNetCut" -Action $action -Trigger $trigger -RunLevel Highest -User "SYSTEM"
```

### Simulate Client network drop:
Just disconnect Wi-Fi or LAN on the client machine.

## Kusto Query: Identify which side dropped first

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
 | parse Packet with PacketTimestamp:string ";" PacketSize:long
 )
 | extend PacketTimestamp = todatetime(PacketTimestamp)
 | extend Leg = case(
 Direction == "Reverse" and Type == "incoming", "SH -> GW",
 Direction == "Reverse" and Type == "outgoing", "GW -> SH",
 Direction == "Direct" and Type == "incoming", "Client -> GW",
 Direction == "Direct" and Type == "outgoing", "GW -> Client",
 "Unknown")
 | summarize arg_max(PacketTimestamp, PacketSize)
 by TIMESTAMP, ActivityId, ConnectionId, Leg
 | project TIMESTAMP, ActivityId, ConnectionId, Leg,
 LastPacketTime = PacketTimestamp, LastPacketSize = PacketSize
 | sort by LastPacketTime asc
 | extend DropOrder = row_number()
)
| sort by DropOrder asc
```

### Reading the results:
- **SH side drop**: SH stopped sending data to GW, connection dropped after ~20 sec (8s warning state, 12s drop)
- **Client side drop**: Client stopped sending data to GW first, then SH-GW leg drops ~29 seconds later
