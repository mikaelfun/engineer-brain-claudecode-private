---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Data ingestion troubleshooting flowchart"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FData%20ingestion%20troubleshooting%20flowchart"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Data Ingestion Troubleshooting Flowchart

> **Note**: This flowchart does NOT include information for the NorthStar pipeline. Only use it when the data type is being sent via INMEM. If unsure which pipeline, follow HT: Determine which pipeline is processing a given data type.

## Prerequisites
- Clear understanding of the issue
- Data type (Perf, Heartbeat, AzureDiagnostics, etc.)
- ResourceID or computer name
- Workspace ID and region
- Time interval of the issue

## Flowchart Decision Tree

### Step 1: Check Known Issues/Outages
- Is it a known issue? -> Proceed per wiki article or outage info

### Step 2: Determine Data Type Source
- **ODS (Agent or HTTP Data Collection API)** -> Go to ODS branch
- **OBO (Azure platform and resource logs)** -> Go to OBO branch

### ODS Branch - Data Missing
1. Are ALL agent data types missing?
   - **Yes** -> Follow Agents Troubleshooting Guides / Agents PG escalation
   - **No / Not sure** -> Is the relevant data type reaching ODS?
     - **Yes** -> Check daily cap limit -> Check InMem for ingestion errors
       - Documented ingestion error? -> Follow wiki instructions
       - Not documented? -> Engage Ingestion PG
     - **No** -> Follow Agents TSG

### ODS Branch - Data Latency
1. Run Latency Analysis in Azure Support Center
   - Latency detected? -> Follow instructions from Latency Analysis output
   - No latency? -> If time interval is correct, no issue

### OBO Branch - Data Missing
1. Check if data is reaching OBO (Kusto query)
   - **Yes** -> Check InMem for ingestion errors (same as ODS path)
   - **No** -> Engage the Resource Provider team

### OBO Branch - Data Latency
1. Run Latency Analysis in ASC
   - Latency detected? -> Check OBO latency
     - OBO latency found? -> Engage Resource Provider team
     - No OBO latency? -> Engage Ingestion PG
   - No latency? -> No issue
