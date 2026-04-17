---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Ingestion/HT: What Agent data types are reaching ODS"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FIngestion%2FHT%3A%20What%20Agent%20data%20types%20are%20reaching%20ODS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# HT: What Agent data types are reaching ODS

## Scenario
Data collected by Log Analytics agents is not showing up on the workspace. After checking agent connectivity, confirm if data is actually reaching ODS. See: Escalating issues to the Log Analytics Ingestion team for data flow understanding.

## Pre-requisites
Access to Jarvis namespace (HT: Get access to ODS telemetry namespace in Jarvis).

## Check which data types have been sent by a specific agent

Select the link based on cloud type:

| Public Clouds | Azure Gov | Mooncake |
|--|--|--|
| https://jarvis-west.dc.ad.msft.net/6D6810FB | https://portal.microsoftgeneva.com/s/1D451BAF | https://portal.microsoftgeneva.com/s/27B59CAE |

Fill in:
1. Workspace region
2. Workspace ID
3. Agent ID, Azure VM resourceID or Azure Arc enabled server resourceID (remove filter to see all agents)
4. Time range (shortest possible, UTC preferred)

## Interpreting the results
Output lists different data types sent by the agent.

Common data types:

| Data type | Friendly name |
|--|--|
| HEALTH_ASSESSMENT_BLOB | Heartbeat |
| GENERIC_PERF_BLOB | Performance data |
| GENERIC_EVENT_BLOB | Windows events |
| CUSTOM_LOG_BLOB | Custom logs |
| LINUX_SYSLOGS_BLOB | Linux syslog |

To get table name for a specific data type: see HT: Find the data type corresponding to a specific table name.
