# Purview SHIR 安装注册与运行时 -- Comprehensive Troubleshooting Guide

**Entries**: 38 | **Drafts fused**: 13 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-change-log-level-k8s-shir.md](..\guides/drafts/ado-wiki-change-log-level-k8s-shir.md), [ado-wiki-collect-logs-shir-k8s.md](..\guides/drafts/ado-wiki-collect-logs-shir-k8s.md), [ado-wiki-collect-process-monitor-logs.md](..\guides/drafts/ado-wiki-collect-process-monitor-logs.md), [ado-wiki-get-logs-from-shir-scan.md](..\guides/drafts/ado-wiki-get-logs-from-shir-scan.md), [ado-wiki-on-premise-sql-shir-log-filter.md](..\guides/drafts/ado-wiki-on-premise-sql-shir-log-filter.md), [ado-wiki-shir-connectivity.md](..\guides/drafts/ado-wiki-shir-connectivity.md), [ado-wiki-shir-k8s-setup.md](..\guides/drafts/ado-wiki-shir-k8s-setup.md), [ado-wiki-shir-k8s-upgrade-delete.md](..\guides/drafts/ado-wiki-shir-k8s-upgrade-delete.md), [ado-wiki-shir-log-collection.md](..\guides/drafts/ado-wiki-shir-log-collection.md), [ado-wiki-shir-proxy-registration.md](..\guides/drafts/ado-wiki-shir-proxy-registration.md), [ado-wiki-shir-reportid-sanity-check.md](..\guides/drafts/ado-wiki-shir-reportid-sanity-check.md), [ado-wiki-shir-setup.md](..\guides/drafts/ado-wiki-shir-setup.md), [ado-wiki-shir-troubleshooting-package.md](..\guides/drafts/ado-wiki-shir-troubleshooting-package.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-collect-logs-shir-k8s.md, ado-wiki-change-log-level-k8s-shir.md

1. Limitation & Impact `[source: ado-wiki-change-log-level-k8s-shir.md]`
2. Prerequisite `[source: ado-wiki-change-log-level-k8s-shir.md]`
3. Steps to change Log Level `[source: ado-wiki-change-log-level-k8s-shir.md]`
4. Steps to clean up existing logs `[source: ado-wiki-change-log-level-k8s-shir.md]`
5. Changing Log Level `[source: ado-wiki-collect-logs-shir-k8s.md]`
6. Command for SHIR log uploading `[source: ado-wiki-collect-logs-shir-k8s.md]`
7. Kusto table for SHIR log in K8s `[source: ado-wiki-collect-logs-shir-k8s.md]`
8. Collect Process Monitor Logs (SHIR) `[source: ado-wiki-collect-process-monitor-logs.md]`
9. When to Use `[source: ado-wiki-collect-process-monitor-logs.md]`
10. Download Process Monitor (https://learn.microsoft.com/en-us/sysinternals/downloads/procmon), unzip on SHIR machine `[source: ado-wiki-collect-process-monitor-logs.md]`

### Phase 2: Data Collection (KQL)

```kusto
TaskHostingEvent
| where LogUploadId has "<log-upload-id>"

OperatorOps
| where LogUploadId has "<log-upload-id>"

ComputeDefaultLogEvent
| where LogUploadId has "<log-upload-id>"
```
`[tool: ado-wiki-collect-logs-shir-k8s.md]`

```kusto
TraceGatewayLocalEventLog
| where UserReportId =="06c039b9-3fb8-4b29-88ec-7b5d772a535c"
| where LocalMessage contains "SQL2017" //If you know the SQL instance name 
| project PreciseTimeStamp, LocalMessage
| where LocalMessage contains "ExecutionDataScanActivity"
| order by PreciseTimeStamp desc
```
`[tool: ado-wiki-on-premise-sql-shir-log-filter.md]`

```kusto
database("babylonMdsLogs").Scan_Results
| where scanResultId == "<run-id>"
| project TIMESTAMP, scanResultId, resultType, TotalScanTimeTakenInMinutes, assetsDiscovered, dataSourceType, AccountName
| limit 1
```
`[tool: ado-wiki-shir-log-collection.md]`

```kusto
cluster('azuredmprod').database('AzureDataMovement').TraceGatewayLocalEventLog
| where UserReportId == '<report-id>'
| where LocalTimestamp > <scan-start-time-UTC>
| where LocalTimestamp < <scan-finish-time-UTC>
| where * contains "<scan-run-id>"
| project LocalTimestamp, LocalTraceLevel, LocalMessage
| order by LocalTimestamp asc
```
`[tool: ado-wiki-shir-log-collection.md]`

```kusto
cluster("https://azuredmprod.kusto.windows.net").database("AzureDataMovement").
TraceGatewayLocalEventLog
| where LocalMessage contains <activityId>
| summarize by UserReportId
```
`[tool: ado-wiki-shir-reportid-sanity-check.md]`

```kusto
cluster("https://azuredmprod.kusto.windows.net").database("AzureDataMovement").
TraceGatewayLocalEventLog
| where UserReportId == <reportId>
| where LocalMessage has "Integration Runtime node event" or LocalMessage has "Integration Runtime node event logs have been uploaded to Microsoft with ReportId"
| project LocalMessage
```
`[tool: ado-wiki-shir-reportid-sanity-check.md]`

```kusto
cluster("https://azuredmprod.kusto.windows.net").database("AzureDataMovement").
TraceGatewayLocalEventLog
| where UserReportId == reportId
| where LocalMessage contains <activityId>
| project LocalTimestamp, LocalMessage, ActivityId
```
`[tool: ado-wiki-shir-reportid-sanity-check.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Scan save fails with error: The version of the linkedservice is not supported — ... | LinkedService API failure during scan save process; SHIR ver... | Install private build of SHIR (whitelisted for tenant); uninstall old SHIR with ... |
| SHIR scan fails with error 9011: Could not establish trust relationship for the ... | Target data source certificate is not trusted by the SHIR ma... | 1) Run MMC on SHIR machine → Add Certificates snap-in (Computer account). 2) Che... |
| Data source missing or scan fails via Self-hosted Integration Runtime (SHIR): co... | DNS resolution failure, firewall/NSG blocking, SHIR connecti... | 1) nslookup to verify FQDN DNS. 2) telnet to check port (firewall/NSG if fails).... |
| Customer is unable to register SHIR successfully in Purview | Typically caused by on-prem network issue or service account... | Collect Report ID + Network Trace (Netmon). Escalate to Data Scan ICM queue. |
| ADF copy activity using SHIR does not generate lineage; FIPS enabled on SHIR mac... | FIPS enabled on SHIR machine prevents MD5 hashing used for l... | Disable FIPS on SHIR: Local Security Policy -> Security Options -> System crypto... |
| ADF copy lineage status 'CannotConnect': SHIR cannot reach Purview endpoint | SHIR machine lacks network connectivity to Purview endpoint;... | Add firewall rules for SHIR to reach Purview. Check copy activity output -> repo... |
| Scan failure with DLL not found error on Self-Hosted Integration Runtime (SHIR) ... | Missing DLL in SHIR version 5.41.8901.3 (known bug) | Re-install the Integration Runtime; workaround available since IR version 5.41.8... |
| Scan fails with Reading Scan Configuration Data failed or Decrypting Scan Config... | Connectivity issue between scan executor and configuration b... | Investigate connectivity issues. If using Self-Hosted IR (SHIR), check SHIR conn... |

`[conclusion: 🟢 8.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Scan save fails with error: The version of the linkedservice is not supported — during SHIR scan con... | LinkedService API failure during scan save process; SHIR version compatibility i... | Install private build of SHIR (whitelisted for tenant); uninstall old SHIR with keep-data or use new... | 🟢 8.0 | ado-wiki |
| 2 | SHIR scan fails with error 9011: Could not establish trust relationship for the SSL/TLS secure chann... | Target data source certificate is not trusted by the SHIR machine. The certifica... | 1) Run MMC on SHIR machine → Add Certificates snap-in (Computer account). 2) Check Trusted Root Cert... | 🟢 8.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FSelf-Hosted%20IR%20in%20Windows%2FCould%20not%20establish%20trust%20relationship%20for%20the%20TLS%20secure%20channel) |
| 3 | Data source missing or scan fails via Self-hosted Integration Runtime (SHIR): connectivity errors, s... | DNS resolution failure, firewall/NSG blocking, SHIR connectivity issues, or sche... | 1) nslookup to verify FQDN DNS. 2) telnet to check port (firewall/NSG if fails). 3) Event Viewer: Co... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FEEEs+Section%2FCoPilot+Troubleshooting+Guides+(AI+generated+TSGs)+-+Need+further+review%2FData+Source+missing+issue) |
| 4 | Customer is unable to register SHIR successfully in Purview | Typically caused by on-prem network issue or service account permission issue | Collect Report ID + Network Trace (Netmon). Escalate to Data Scan ICM queue. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Processes/Escalation/Escalation%20Process-%20Overview/Logs%20Required%20for%20Escalation%20-%20General) |
| 5 | ADF copy activity using SHIR does not generate lineage; FIPS enabled on SHIR machine interferes with... | FIPS enabled on SHIR machine prevents MD5 hashing used for lineage reporting | Disable FIPS on SHIR: Local Security Policy -> Security Options -> System cryptography: FIPS -> Disa... | 🔵 7.0 | ado-wiki |
| 6 | ADF copy lineage status 'CannotConnect': SHIR cannot reach Purview endpoint | SHIR machine lacks network connectivity to Purview endpoint; firewall blocking | Add firewall rules for SHIR to reach Purview. Check copy activity output -> reportLineageToCatalog -... | 🔵 7.0 | ado-wiki |
| 7 | Scan failure with DLL not found error on Self-Hosted Integration Runtime (SHIR) version 5.41.8901.3 | Missing DLL in SHIR version 5.41.8901.3 (known bug) | Re-install the Integration Runtime; workaround available since IR version 5.41.8901.3 | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FScan%20Known%20Issue%20List) |
| 8 | Scan fails with Reading Scan Configuration Data failed or Decrypting Scan Configuration Data failed ... | Connectivity issue between scan executor and configuration blob storage, prevent... | Investigate connectivity issues. If using Self-Hosted IR (SHIR), check SHIR connectivity troubleshoo... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FScan%20fails%20with%20an%20error%2FReading%20Scan%20Configuration%20failed) |
| 9 | Scan fails with error: 'Content: Catalog Not Found, or is an invalid state' when using Self-Hosted I... | Outdated SHIR version incompatible with ingestion config service endpoint | Upgrade SHIR to version > 5.8.7866.8 to mitigate the issue | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Scanning/Scan%20fails%20with%20an%20error/Scan%20failed%20with%20error%3A%20Content%3A%20Catalog%20Not%20Found%2C%20or%20is%20an%20invalid%20state) |
| 10 | Scan fails with Internal System Error; SHIR logs show 'Module atlas-ingestion-write initialize faile... | Corrupted SHIR installation causing missing assemblies | Uninstall current SHIR and install latest version from https://www.microsoft.com/en-us/download/deta... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Scanning/Scan%20fails%20with%20an%20error/Scan%20fails%20with%20Internal%20System%20Error%20and%20Connectivity%20Troubleshooting%20Scripts) |
| 11 | Unable to complete scan of on-premise SQL Server Named Instance with System Error, connectivity test... | Known issue in Integration Runtime 4.xxx when connecting to SQL Server Named Ins... | Upgrade Integration Runtime to version 5.1.7655.1 or higher. Verify DataScan agent version >= 252 in... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FScan%20fails%20with%20an%20error%2FUnable%20to%20complete%20scan%20of%20on-premise%20SQL.%20Data%20connection%20tested%20successfully) |
| 12 | Snowflake scan URL mismatch: JDBC driver translates underscores to hyphens in Snowflake account URL ... | Snowflake JDBC driver version 3.13.25+ behavior change translates underscores (_... | Create DNS entry for the hyphenated version to match the original underscore version (e.g. DNS for i... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FSnowflake%20troubleshooting) |
| 13 | Customer cannot set custom scan level when using Self-Hosted Integration Runtime (SHIR) in Purview. ... | By design limitation. Scan level support is not implemented for SHIR connector; ... | Use Azure IR (public connections) or Managed VNet IR (private connections) if scan level customizati... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Feb%20FR%20Known%20Issues) |
| 14 | Oracle scans in Purview require Java 11 (EOL). Java 21 is not supported for SHIR-based Oracle scans. | Purview SHIR for Oracle scans only supports Java 11; Java 21 not yet validated. | Must use Java 11. FR-2785 logged for Java 21 support. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Feb%20FR%20Known%20Issues) |
| 15 | Azure SQL level scans not supported with SHIR. Only Azure IR or Managed IR supported. | Level scan for Azure SQL not implemented for SHIR. | Use Azure IR (public) or Managed IR with MPE (private). FR-2796. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Feb%20FR%20Known%20Issues) |
| 16 | Scan fails with FIPS-related error when using SHIR on a machine with FIPS enabled | SHIR scan does not support FIPS-enabled machines; cryptographic operations confl... | See: https://learn.microsoft.com/en-us/purview/catalog-private-link-troubleshoot#resolution-4. May n... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Jan%20FR%20Known%20Issues) |
| 17 | Parquet files schema and classification missing after successful scan using SHIR. Error: System.DllN... | Bug in older SHIR versions caused jvm.dll loading failure even when Java was pro... | Upgrade Self-Hosted Integration Runtime to version 5.28.8488.1 or later. Release note fix: fixed bug... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/Parquet files schema %26 classification are missing from assets after successful scan) |
| 18 | Oracle scan fails with Error 3804: Unable to access the data source with the given credentials and/o... | Generic error — actual root cause hidden in SHIR event viewer logs; common cause... | Check SHIR Event Viewer > Application and Service Logs > Connectors Integration Runtime; scroll thro... | 🔵 7.0 | ado-wiki |
| 19 | SAP ECC scan fails with internal server error or Error 3818 Connector Exception — JRE out of memory ... | SHIR machine has insufficient RAM for SAP ECC scanning; JRE exhausted memory or ... | Scale up SHIR machine to at least 128GB RAM; use Kusto TraceGatewayLocalEventLog queries to verify m... | 🔵 7.0 | ado-wiki |
| 20 | Snowflake scan fails or stuck in queue; SHIR logs show OCSP certificate revocation warning using fai... | OCSP-based certificate revocation checking fails for Snowflake HTTPS endpoint; S... | Add insecureMode=true in JDBC URL parameters in Snowflake connection (safe to enable); alternatively... | 🔵 7.0 | ado-wiki |
| 21 | MongoDB scan fails with Error 3818 Connector Exception: No available collections to import. Underlyi... | Known bug in Windows SHIR where the Java CLASSPATH becomes too long for the Wind... | Use Kubernetes (K8s) SHIR instead of Windows SHIR to run the scan. PG confirmed this is a known bug ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FConnectors%2FMongoDB%20connection%20issues%2FMongoDB%20scan%20failure%20with%20Error%203818%20-%20Connector%20Exception) |
| 22 | Self-Hosted Integration Runtime (SHIR) fails to register on new on-prem machine. Event Viewer shows:... | Firewall blocking HTTPS (TLS) traffic to Purview cloud endpoint (*.frontend.clou... | 1) Check Event Viewer → Application and Service Log → Integration Runtime for Critical/Error. 2) Cap... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FSelf-Hosted%20IR%20in%20Windows%2FFail%20to%20register%20SHIR%20service) |
| 23 | Delete self-hosted or managed VNet integration runtime fails with 400 BadRequest: The document canno... | Leaked linked services that were generated when creating Scan still reference th... | 1) Confirm with customer if they already changed to another IR or deleted the Scan. 2) If not yet ch... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FSelf-Hosted%20IR%20in%20Windows%2FIR%20(integration%20runtime)%20cannot%20be%20deleted%20due%20to%20referenced%20by%20other%20resources) |
| 24 | SQL on-prem scans using SHIR 5.51 complete successfully but ingest zero assets. Logs show FileLoadEx... | SHIR 5.51 dependency issue with Microsoft.Bcl.AsyncInterfaces assembly causing i... | Upgrade to latest SHIR version 5.63. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Known%20Issues) |
| 25 | SHIR version 5.50 expired on March 4, 2026 causing all scans to stop working. | SHIR version 5.50 reached its expiry date. | Upgrade manually to a newer SHIR version. Engineering working internally to extend expiry till June ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Known%20Issues) |
| 26 | K8s SHIR registration/de-registration fails using IRCTL 1.4.0 with certificate error: x509: certific... | Certificate verification issue in IRCTL version 1.4.0. | Upgrade to IRCTL 1.4.1 which includes fix. Attach case to ICM 21000000914207. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Known%20Issues) |
| 27 | SQL scan via SHIR fails with 'This implementation is not part of the Windows Platform FIPS validated... | FIPS mode is enabled on the self-hosted integration runtime machine, blocking re... | Disable FIPS mode on the self-hosted integration runtime server | 🔵 7.0 | [MS Learn](https://learn.microsoft.com/purview/data-gov-classic-private-link-troubleshoot) |
| 28 | SHIR can't connect to cloud service / SSL/TLS trust relationship error: 'Could not establish trust r... | Root CA of service server certificate not trusted on SHIR machine, or proxy repl... | 1) Install DigiCert Global Root G2 certificate if missing. 2) Ensure service cert chain is trusted. ... | 🔵 7.0 | [MS Learn](https://learn.microsoft.com/purview/scanning-shir-troubleshooting) |
| 29 | PowerBI scan using Azure IR does not support Private Endpoints; scan fails when Purview account uses... | Azure IR for PowerBI scans does not support Private Endpoint connections (known ... | Use Self-Hosted Integration Runtime (SHIR) as workaround for PowerBI scans with private endpoints. R... | 🔵 6.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Feb%20FR%20Known%20Issues) |
| 30 | Scan fails with StorageException 404 Not Found: 'Unable to setup config overrides for this scan' | Older version of self-hosted integration runtime (< 5.9.7885.3) cannot communica... | Upgrade self-hosted integration runtime to version 5.9.7885.3 or later | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/data-gov-classic-private-link-troubleshoot) |
| 31 | Purview scans that previously worked are now failing | Credential rotation, Azure Policy preventing Storage account updates, or outdate... | 1) Update scan credentials if rotated. 2) Create Azure Policy exception using Purview exception tag ... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/troubleshoot-connections) |
| 32 | JDK error (UserErrorJreNotFound) when scanning data sources using SHIR | Java Runtime Environment not installed or wrong version/architecture on SHIR mac... | Install recommended JDK version matching SHIR architecture (64-bit JRE for 64-bit IR). Verify regist... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/scanning-shir-troubleshooting) |
| 33 | OutOfMemoryException (OOM) error when running scan with self-hosted IR | High memory usage from concurrent scan activity or insufficient memory on the SH... | Check resource usage on SHIR machine, ensure no other heavy software is running concurrently, and co... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/scanning-shir-troubleshooting) |
| 34 | SHIR error: 'Could not load file or assembly System.ValueTuple, Version=4.0.2.0' | System.ValueTuple.dll not found in GAC, Shared, or Gateway folder of the Integra... | Copy System.ValueTuple.dll from C:\Program Files\Microsoft Integration Runtime\4.0\Gateway\DataScan ... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/scanning-shir-troubleshooting) |
| 35 | Self-hosted IR goes offline with 'Authentication Key is not assigned yet' | SHIR node or logical SHIR in Purview portal was deleted, or a clean uninstall wa... | Check if Configurations file exists at %programdata%\Microsoft\Data Transfer\DataManagementGateway. ... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/scanning-shir-troubleshooting) |
| 36 | SHIR certificate error: 'Failed to change intranet communication encryption mode... private key miss... | User account has low privilege for private key access, or certificate was genera... | Use account with appropriate privileges. Import certificate with: certutil -importpfx FILENAME.pfx A... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/scanning-shir-troubleshooting) |
| 37 | SHIR registration error after changing service account: 'Integration Runtime (Self-hosted) node has ... | When service account is changed, permissions on dependent resources (folders, re... | Check DIAHostService sign-in account permissions on %programdata%\Microsoft\Data Transfer\DataManage... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/scanning-shir-troubleshooting) |
| 38 | SHIR certificate error 103: 'Failed to grant Integration Runtime service account the access of to th... | Certificate uses KSP (key storage provider) storage, which is not supported by S... | Use CSP certificates. Convert with: certutil -CSP 'CSP or KSP' -ImportPFX FILENAME.pfx, or use opens... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/scanning-shir-troubleshooting) |