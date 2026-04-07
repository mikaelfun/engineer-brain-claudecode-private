---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/Troubleshooting Guides/AMA Windows: TSG:  Collection - Performance Counters"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/Troubleshooting Guides/AMA Windows: TSG:  Collection - Performance Counters"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AMA Windows: TSG: Collection - Performance Counters

## Scenario
ALL of the following are TRUE:
- Agent is sending Heartbeats consistently (every 1-minute)
- Microsoft-Perf stream exists in an associated DCR
- Customer reports: counters missing in Perf table, not at expected interval, or unexpected values

## Support Area Path
`Azure/Azure Monitor Agent (AMA) on Windows machine/I created a DCR but the data is not in the Log Analytics Workspace/No Windows Perf Counters in Log Analytics Workspace`

## Documentation
- [Azure Monitor Agent - Collect Performance Counters](https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-performance)

## What you will need
- ResourceID of the machine
- Admin access to the operating system
- Access to query destination Log Analytics Workspace

## Logs to Collect
- AMA Troubleshooter for Windows (AgentDataStore\Tables\*.csv, mcsconfig.latest.xml)
- AMA Network Trace

## Troubleshooting Steps

### Step 1: Is there a DCR with correct performance counter data source?
- List associated DCRs
- Verify DCR has Microsoft-Perf stream with correct config
- If not, configure per [public docs](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/data-collection-performance)

### Step 2: Does mcsconfig.latest.xml show desired counters?
- Review agent instruction set for Performance Counters
- If no counters or mismatch → check Configuration TSG (VM or Arc)

### Step 3: Does agent cache show desired counters and expected values?
- Review agent cached data for Performance Counters
- If OK → skip to Step 5
- If not → proceed to Step 4

### Step 4: Does MAEventTable.csv show PDH API errors?
- If NO level 1/2/3 events → escalate
- If YES PDH errors:
  1. Test with typeperf: `typeperf -q` to list available counters
  2. Compare typeperf output with mcsconfig.latest.xml counter names
  3. If names don't match → update DCR with correct counter names
  4. If typeperf produces no results → OS issue, may need to rebuild performance counters
  5. If typeperf works but AMA doesn't → review known issues, escalate if needed
  6. For locale-specific counter names → collab with Windows team

### Step 5: Does QoS table show success?
- Review MAQosEvent.csv for Performance Counters
- If failures → test endpoint connectivity, capture network trace

### Step 6: Does ingestion pipeline show the blob type?
- Check for GENERIC_PERF_BLOB in ingestion pipeline
- If present → escalate
- If not present → capture and review network trace
