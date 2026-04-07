---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Investigating performance issues/Microsoft Entra Application Proxy Connector High CPU Usage, High Memory Consumption"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Microsoft%20Entra%20application%20proxy/Investigating%20performance%20issues/Microsoft%20Entra%20Application%20Proxy%20Connector%20High%20CPU%20Usage%2C%20High%20Memory%20Consumption"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy Connector - High CPU Usage / High Memory Consumption

## Background

The Application Proxy Connector service (MucService / ApplicationProxyConnectorService.exe) may consume excessive memory and/or CPU when overloaded, or due to unexpected issues like memory/handle leaks. Troubleshooting can be complex as the issue may be intermittent. Setting customer expectations is crucial.

## Determine the Issue

In Task Manager or PerfMon, the ApplicationProxyConnectorService.exe process shows high memory or CPU usage.

## Troubleshooting Steps

### 1. Connector Version
Ensure the latest version is installed. [Version history and download](https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-release-version-history). Check version via [this guide](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/436400/Azure-AD-Application-Proxy-How-to-get-the-version-of-the-connector).

### 2. Key Questions
- Since when does the issue happen?
- Any changes around that time (new app, version change, more users)?
- Gradual or sudden onset? Happens outside peak hours?
- Effect on the service / hosting computer?
- Does it self-resolve or require action (service restart / server reboot)?

### 3. Kusto Queries

**Concurrent connections over time:**
```kusto
BootstrapRootOperationEvent
| where env_time > ago(XXh)
| where signalingListenerEndpointConnectorGroup == "CONNECTOR_GROUP_ID"
| extend ConnectorName = extract("'MachineName':(.*)", 1, requestString)
| extend ConnectionLimit = extract(@"ConnectionLimit:'(\d+)", 1, requestString)
| extend CurrentConnections = extract(@"CurrentConnections:'(\d+)", 1, requestString, typeof(int))
| extend CurrentConnections2 = iff(CurrentConnections > -1, CurrentConnections, 0)
| project env_time, CurrentConnections2, ConnectorName, ConnectionLimit
| render linechart
```

> Default connection limit is **200**. Exceeding this for prolonged periods causes GatewayTimeout errors and connector unresponsiveness.

**Check connection limit value:**
```kusto
BootstrapRootOperationEvent
| where env_time > ago(XXh)
| where signalingListenerEndpointConnectorGroup == "CONNECTOR_GROUP_ID"
| extend ConnectorName = extract("'MachineName':(.*)", 1, requestString)
| extend ConnectionLimit = extract(@"ConnectionLimit:'(\d+)", 1, requestString)
| project env_time, ConnectionLimit, ConnectorName
```

**Transaction load on connector group:**
```kusto
let tranTime = datetime("yyyy-mm-ddT00:00:00");
TransactionSummaries
| where TIMESTAMP > tranTime and TIMESTAMP < tranTime + 24h
| where GroupId == "CONNECTOR_GROUP_ID"
| summarize count() by bin(TIMESTAMP, 1s)
| render linechart
```

**Transaction load by connector:**
```kusto
let tranTime = datetime("yyyy-mm-ddT00:00:00");
TransactionSummaries
| where TIMESTAMP > tranTime and TIMESTAMP < tranTime + 24h
| where GroupId == "CONNECTOR_GROUP_ID"
| summarize count() by bin(TIMESTAMP, 1s), ConnectorId
| render linechart
```

**Identify WebSocket apps:**
```kusto
TransactionSummaries
| where TIMESTAMP > ago(xxh)
| where GroupId == "CONNECTOR_GROUP_ID"
| where ExtraResultData contains "BackendWebSocketRequest"
| summarize count() by ApplicationId, bin(TIMESTAMP, 1h)
| render timechart
```

### 4. Strategies (based on Kusto results)

a. Fix non-working connectors in the connector group
b. Add additional connector(s) to the group
c. Create new connector group(s) with 2+ connectors and split apps between them
d. **Isolate** WebSocket or high-error apps to individual connector groups for easier monitoring
e. Schedule periodic connector service restarts (outside business hours) to stabilize

### 5. Workarounds

a. Restart the connector service periodically (outside working hours) on affected servers
b. If this stabilizes the situation, use as temporary workaround
c. Evaluate migrating to **Global Secure Access (Private Access)**

### 6. Test Connector Version

A private connector version may be available for testing, especially if WebSocket apps are involved.

```kusto
TransactionSummaries
| where TIMESTAMP > ago(2d)
| where ExtraResultData == "BackendWebSocketRequest, BackendWebSocketSessionEstablished, BackendWebSocketSessionException(WebSocketException:HttpListenerException)"
  and ConnectorId == "CONNECTOR_ID"
  and ResponseStatusCode == "GatewayTimeout"
  and ExtraResultData == "ConnectorTimeout"
```

Private connector version: available via [SharePoint link](https://microsofteur.sharepoint.com/:f:/t/Community-HybridAuthExperiences/Eg-pI6wI2otDiV_n73Ak8v0BrkPHMDeYPtZv8auZmKN7Qg)

## Increasing DefaultConnectionLimit

Edit the config file:
```
%ProgramFiles%\Microsoft Entra private network connector\MicrosoftEntraPrivateNetworkConnectorService.exe.config
```

Add to appSettings:
```xml
<add key="DefaultConnectionLimit" value="800"/>
```

## Data Collection

1. **Data Collector script** with `-Perfmon` and `-ServiceTraceOn` switches - [link](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/293681/Azure-AD-Application-Proxy-Action-Plan-Templates-for-Data-Collection)
2. **PerfView** for user-mode dump of the process - [link](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/293681/Azure-AD-Application-Proxy-Action-Plan-Templates-for-Data-Collection)

## Escalation Path

Use the **Application Proxy AVA channel**. SMEs may ask to raise an ICM.
