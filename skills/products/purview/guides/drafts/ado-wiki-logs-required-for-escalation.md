---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Processes/Escalation/Escalation Process- Overview/Logs Required for Escalation - General"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Processes/Escalation/Escalation%20Process-%20Overview/Logs%20Required%20for%20Escalation%20-%20General"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Logs Required for Escalation - General

We have observed cases where there is missing logs for ICM/AVA. In order to mitigate issues involving back and forth, please make sure you have verified the logs before escalating the case.

- For Microsoft Data source: refer to [Queries for MS data source](https://eng.ms/docs/cloud-ai-platform/azure-data/azure-data-governance/governance/microsoft-purview/microsoft-purview-troubleshooting-guides/troubleshooting/connector/commonkustologsfor1stpartyconnector)
- For 3rd party data source: refer to [Queries for 3rd party data source](https://eng.ms/docs/cloud-ai-platform/azure-data/azure-data-governance/governance/microsoft-purview/microsoft-purview-troubleshooting-guides/troubleshooting/connector/3pdatasources-initialtroubleshootingguide)

## Scenario-1: Customer is unable to register SHIR successfully

**RCA**: Typically caused by on-prem network issue or service account permission issue.

**Logs required:**
- Report ID
- Network Trace (Netmon)

**Target ICM Queue**: Data Scan

## Scenario-2: Scan via SHIR failed with HTTP error code (4xx, 5xx)

**RCA**: Typically caused by permission or firewall/PE issue.

**Logs required:**
- Report ID
- Fiddler trace (issue is at HTTP layer)
- Check whether target endpoint disabled public network connection

**Target ICM Queue**:
- testconnectivity/credential/source registration → Data Sources
- connectorException or source-specific issue → Data Sources
- All other issues → Data Scan

## Scenario-3: Scan via SHIR failed with common error messages (e.g. Internal server error)

**RCA**: Many different root causes. Case by case analysis required.

**Logs required:**
- Report ID
- Scan run ID
- Data source connection string

**Target ICM Queue**: Data Scan

## Scenario-4: Scan 3P data source via SHIR failed with MIRException

**RCA**: Deep dive into logs required.

**Logs required:**
- Report ID
- Troubleshooting package
- Scan run ID
- Data source connection string
- Run 3P MIRException analysis script

**Target ICM Queue**: Data Sources

## Scenario-5: Performance tuning of scan running via SHIR including scan timeout

**RCA**: Typically because queries to data source are slow or SHIR server running out of resource.

**Logs required:**
- Report ID
- Troubleshooting package
- Scan run ID
- DB server logs (e.g. profiler trace in SQL)
- Perfmon on SHIR server
- Usage of DB server (CPU, Memory)
- Data source connection string

**Target ICM Queue**: Data Scan

**Note**: Support multiple Azure DB sources in one ticket — help identify which exact DB source to fine-tune.

## Scenario-6: Scan succeeded, but assets or schema missing

**RCA**: Typically because some queries to data source failed.

**Logs required:**
- Report ID (if scan via SHIR)
- Troubleshooting package (for 3P data sources)
- Scan run ID
- DB server logs (e.g. profiler trace in SQL)
- Target DB FQDN and auth type
- PBI result if data source is PowerBI

**Target ICM Queue**: Data Sources

## Scenario-7: Asset was not classified

**RCA**: Typically because of data issue, data format issue or product issue.

**Logs required:**
- Sample data from customer
- What classification rule customer expects
- Scan run ID

**Target ICM Queue**: Classification

## Scenario-8: Billing getting higher

**RCA**: Determine whether caused by user activities or product issue.

**Logs required:**
- Follow the TSG: Billing Charge lookup

**Target ICM Queue**: Subject to analysis result

## Scenario-9: Purview API call from client failed

**RCA**: Typically user error — code issue or firewall issue.

**Logs required:**
- Error message and timestamp
- Sample code from customer
- Firewall settings on client machine
- Public network access setting in Purview
- Azure SDK version (if applicable)

**Target ICM Queue**: Data Map

**Note**: Try to reproduce the issue.

## Scenario-10: SHIR crashed during registration or scan

**RCA**: Need to check data in memory.

**Logs required:**
- Scan run ID (if applicable)
- Report ID
- Troubleshooting package (if applicable)
- Memory dump (follow Dump collection TSG)

**Target ICM Queue**: Data Scan

## Scenario-11: Data in insights report not showing as expected

**RCA**: Insights job triggers every 4-6 hours after catalog update, then report refreshes on schedule.

**Logs required:**
- Account ID, region, subscription
- Example asset showing in catalog but not in Insights App

**Target ICM Queue**: Insights

## Scenario-12: Lineage pointing to wrong asset

**Logs required:**
- Account Name, ResourceUri, Region
- GUID or FQDN
- Type of related assets
- Screenshots of current and expected column mapping

**Target ICM Queue**: DataMap

## Log Collection References

### Self-Hosted IR (SHIR) Event Viewer
- Navigate to Event Viewer → Applications and Services Logs → Connectors-Integration Runtime
- Set max log size to 4GB, ensure logging is enabled

### Troubleshooting Package for 3P Data Sources
- Add feature flag: `&feature.ext.datasource={"scanTroubleShootingPackage":true}`
- Refresh page, choose SHIR runtime, enable troubleshooting flag
- Trigger scan and wait for completion
- Find package at: `C:\windows\ServiceProfiles\DIAHostService\AppData\Local\Microsoft\Purview\Troubleshooting`

### Log Validation
1. Kusto log retention is ~3 weeks; collect scan run IDs from recent 1 week
2. Verify Report ID and Scan Result ID match:
   - Find PipelineRunId from ScanningLog
   - Cross-reference with SHIR TraceGatewayLocalEventLog using UserReportId + PipelineRunId
3. For 3P sources, also collect troubleshooting package
4. If scan failed without generating scan result ID, attach `x-ms-correlation-request-id` from F12 network tab

### Network Related
- Follow TSG for TCP/TLS/HTTP issues
- Check whether public endpoint in Purview is disabled and if PE exists for Portal and Ingestion
- Collect: Fiddler Trace, Network Trace (Netmon), Certificate/TLS info

### 3P Data Sources List (Troubleshooting Package Applicable)
BigQuery, Cassandra, PostgreSQL, MongoDB, SAPHANA, Erwin, SAPS4HANA, Hive, Databricks, SAP ECC, Oracle, Salesforce, SAP BW, Looker, MySQL, Snowflake, DB2, Teradata, Redshift, Tableau
