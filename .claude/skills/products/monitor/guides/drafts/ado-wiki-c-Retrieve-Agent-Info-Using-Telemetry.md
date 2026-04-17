---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/How-To/How To: Retrieve basic Agent's information using telemetry"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FHow-To%2FHow%20To%3A%20Retrieve%20basic%20Agent%27s%20information%20using%20telemetry"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How To: Retrieve Basic Agent's Information Using Telemetry

## Introduction
This article helps engineers retrieve basic agent information from telemetry for initial troubleshooting when ASC Diagnostic Data is not available:
- How to locate which Workspace a customer's VM is reporting to (last 24 hours)
- Current agent version installed
- Determine possible connectivity or other potential issues
- Determine Log Analytics Workspace ID where VM is reporting data
- Determine AgentID (Only MMS/OMS)

> **Note**: You must request access to telemetry data. See Kusto Clusters Relevant to Azure Monitor wiki page.

## AMA (Azure Monitor Agent)

Cluster: `cluster('genevaagent.kusto.windows.net').database('AMA')`

### Basic health check
```kql
HealthReport
| where TIMESTAMP > ago(1d)
| where tolower(ResourceId) == tolower("COMPUTER RESOURCE ID HERE")
| limit 10
```

### Agent version and workspace
```kql
HealthReport
| where TIMESTAMP > ago(24h)
| where tolower(ResourceId) == tolower("COMPUTER RESOURCE ID HERE")
| where Ods == true
| extend workspace = tostring(_Ods)
| distinct ResourceId, Ods, AgentVer, workspace
```

If results are missing or attributes return false, it helps quickly determine next actions.

## Terminology
- **AMCS** (Azure Monitor Configuration Service) - Regional service that controls data collection, fetches DCRs
- **IMDS** (Instance Metadata Service) - Provides information about running VMs/scale sets (IMDS) and Arc-enabled servers (HIMDS)
- **ODS** - Refers to the Log Analytics workspace

## MMA/OMS (Log Analytics Agent - LEGACY)

Cluster: `cluster('genevaagent.kusto.windows.net').database('Telemetry')`

```kql
AgentTelemetry
| where TIMESTAMP > ago(24h)
| where tolower(ResourceId) contains 'COMPUTER RESOURCE ID HERE'
```
Shows Agent Version, Agent ID, OS, Workspace ID, and enabled solutions.

## Check Agent Errors

Cluster: `cluster('genevaagent.kusto.windows.net').database('Telemetry')`

```kql
AgentError
| where TIMESTAMP > ago(30d)
| where WorkspaceId contains "WORKSPACE ID HERE"
| where ResourceId contains 'RESOURCE ID HERE'
| project TIMESTAMP, activityName, AgentVersion, ErrorCode, ErrorEventCount, OSType, OSVersion, Region, Message, WorkspaceId, AgentId, ResourceId
| distinct ErrorCode, Message
```

## Check Connectivity Issues (Lost Heartbeats) using AgentQoS

Cluster: `cluster('genevaagent.kusto.windows.net').database('Telemetry')`

```kql
AgentQoS
| where AgentId == "AGENT ID HERE"
| where TIMESTAMP >= now(-30d) and TIMESTAMP <= now()
| where Source == "HEALTH_ASSESSMENT_BLOB"
| summarize sum(toint(BatchCount) * toint(AvgBatchEventCount)) by bin(TIMESTAMP, 1d)
| render timechart
```

## Check Heartbeats/Logs Ingestion into LAW (AMA and MMS/OMS)

Cluster: `cluster('omsgenevatlm.kusto.windows.net').database('GenevaNSProd')`

```kql
let workspaceid = "WORKSPACE HERE";
let resource = "RESOURCE ID HERE";
ProcessedChunk
| where CustomerId == workspaceid
| where TIMESTAMP between (datetime(2023-01-01 00:00)..datetime(2023-02-01 23:59))
| extend vmName = tostring(split(ResourceId, "/")[-1])
| where ResourceId has resource
| where OutputType has "Heartbeat"
| summarize count(), sum(OutputRows) by vmName, OutputType
```
