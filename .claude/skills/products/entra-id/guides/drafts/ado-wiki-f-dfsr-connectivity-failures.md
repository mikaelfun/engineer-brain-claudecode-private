---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/Workflow: DFSR: Looking for Known Solutions/Common Solutions/No Replication/Connectivity failures"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FWorkflow%3A%20DFSR%3A%20Looking%20for%20Known%20Solutions%2FCommon%20Solutions%2FNo%20Replication%2FConnectivity%20failures"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Walkthrough: DFSR Connectivity Failures Between Partners

### Scenario

Two DFSR partners experiencing replication failures where files updated on one server are not replicated to the partner.

### Key Event Log Messages

- **Event ID 5008** (Error): "The DFS Replication service failed to communicate with partner {partner} for replication group {RG}."
  - Additional Info: Error 1722 (The RPC server is unavailable.)
- **Event ID 5014** (Information): "The DFS Replication service is stopping communication with partner {partner} for replication group {RG} due to an error."
  - Additional Info: Error 1726 (The remote procedure call failed.)

### Root Cause

When a file is updated on a server, that partner sends a notification to replication partner(s) so the update may be requested. The downstream server is unable to establish a connection with the upstream server to request the updates. The RPC connection fails either at the endpoint mapper (port 135) or at the dynamic RPC port.

### Troubleshooting Steps

1. **RPCDump**: Query the remote partner's endpoint mapper to verify registered endpoints:
   - Look for the specific dynamic port used by DFSR
   - Check if the port is accessible

2. **Network Captures**: Filter on partner IP and port 135:
   ```
   filter: ipv4.address==<partnerIP> && tcp.port==135
   ```
   - If no endpoint mapper traffic captured, filter just on partner IP
   - Check for TCP SYN retransmits: `Property.TCPSynRetransmit == 1`

3. **Filter on dynamic port**: After identifying the port from endpoint mapper response:
   ```
   filter: ipv4.address==<partnerIP> && tcp.port==<dynamicPort>
   ```

4. **DFSR Debug Logs**: Look for connection failure patterns:
   - `InConnection::ReConnectAsync Failed to connect` with Error 1722
   - `AsyncRpcHandler::ProcessReceive Failed` with Error 1726
   - `DownstreamTransport::EstablishConnection` errors

5. **SDP Package**: Check `DC_DFSR_Info.txt` for connection GUIDs matching event log entries.

### Solution

Restore TCP/IP connectivity between the systems. Often, the network captures along with details such as the specific conversation exhibiting the problem may be provided to the customer's networking support team as proof of the problem.

Common causes:
- Firewall blocking RPC dynamic ports
- Network misconfiguration
- Partner server unreachable
- DNS resolution failures
