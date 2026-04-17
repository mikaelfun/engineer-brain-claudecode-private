---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/Troubleshooting Guides/AMA Windows: TSG: Collection - IIS Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/Troubleshooting Guides/AMA Windows: TSG: Collection - IIS Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AMA Windows: TSG: Collection - IIS Logs

## Scenario
ALL of the following are TRUE:
- Agent is sending Heartbeats consistently (every 1-minute)
- Customer reports: One or more fields are missing or with unexpected value in the W3CIISLog table

## Support Area Path
`Azure/Data Collection Rules (DCR) and Agent (AMA)/I created a DCR but the data is not in the Log Analytics Table/No IIS logs in Log Analytics Workspace`

## Documentation
- [Collect IIS logs from virtual machine with Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-iis)
- [Columns Supported by AMA IIS Log collection](https://learn.microsoft.com/azure/azure-monitor/reference/tables/w3ciislog)

## What you will need
- Resource ID of the Azure Virtual Machine
- Admin access to the virtual machine operating system

## Known Issues
- AMA for Windows Known Issues (tags: AMAforWindows + IIS)
- Known Issue #55228, #71125

## Troubleshooting Steps

### Step 1: Is there a DCR associated with IIS data source?
- List associated DCRs
- Verify DCR has Microsoft-W3CIISLog stream with correct config
- If not, configure per [public docs](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-iis#configure-iis-log-data-source)

### Step 2: Does mcsconfig.latest.xml show desired configuration?
- Review agent instruction set for IIS Logs scenario
- If no IIS config or mismatch → check Configuration TSG (VM or Arc)

### Step 3: Does agent cache show desired counters and expected values?
- Review agent cached data for IIS Log scenario
- If OK → skip to Step 5
- If not → proceed to Step 4

### Step 4: Does MAEventTable.csv show IIS-related errors?
- Error: "Could not open directory c:\inetpub\logs\logfiles\w3svc1 will retry" → validate IIS log files locally
- Other errors → escalate

### Step 5: Does QoS table show success?
- Review MAQosEvent.csv for IIS Logs
- If failures → test endpoint connectivity, capture network trace

### Step 6: Does ingestion pipeline show the blob type?
- Check for ONPREM_IIS_BLOB_V2 in ingestion pipeline
- If present → escalate
- If not present → capture and review network trace
