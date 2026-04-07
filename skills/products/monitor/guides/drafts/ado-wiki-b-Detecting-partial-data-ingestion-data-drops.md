---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Ingestion pipeline/TSG: Detecting partial data ingestion, data drops, and where to route the ICM"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FIngestion%20pipeline%2FTSG%3A%20Detecting%20partial%20data%20ingestion%2C%20data%20drops%2C%20and%20where%20to%20route%20the%20ICM"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TSG: Detecting Partial Data Ingestion, Data Drops, and ICM Routing

## Key Definitions

### Data Gap vs Missing Data vs Partial Data
- **Missing Data**: Data was configured (e.g., Diagnostics) but NEVER showed up. Not a data gap.
- **Data Gap**: Data was flowing steadily, then went missing for a period, then reappeared on its own.
- **Partial Data**: Only a subset of data from the source is missing while other data still flows.

### Proving Partial Data Ingestion
To prove partial data, you must show:
1. Missing data on the workspace side
2. Surrounding data that DID get ingested (proves the "gap" was skipped/dropped)
3. Complete log from the agent/source side for comparison

## ICM Routing Rules

### Two Main Data Source Types
1. **Agent-Based** (Windows Agent, Linux Agent)
2. **RP-Based** (Storage RP, Recovery Services RP, Event Hubs RP, etc.)

### Routing Decision
- **Agent-generated data** (Heartbeats, Perf, CustomLogs): Present evidence of partial data to **Log Analytics Ingestion PG via ICM**
- **Non-agent data (Azure RP)**:
  1. Identify the specific resource generating the problem data
  2. Open collaboration task with the team owning the resource
  3. Provide evidence that the RP is sending partial data
  4. Request the collab engineer to investigate and open ICM if needed

> **Only open ICM to Log Analytics Ingestion team if evidence shows MMA is sending partial data.** All other data sources start with the Resource Provider team.

## Verification Strategies
1. Locate the data source and capture evidence showing events before/after the gap
2. Check for Ingestion Volume Rate Limit issues
