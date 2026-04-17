# Monitor Log Analytics 数据摄取与丢失排查 - Comprehensive Troubleshooting Guide

**Entries**: 50 | **Drafts fused**: 22 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-Agent-data-ingestion-troubleshooting-flowchart.md, ado-wiki-a-check-ingestion-errors.md, ado-wiki-a-ingestion-endpoint-global-vs-regional.md, ado-wiki-a-ingestion-heartbeat-aggregation.md, ado-wiki-a-Platform-resource-logs-ingestion-troubleshooting.md, ado-wiki-a-Syslogs-dropped-during-ingestion.md, ado-wiki-b-Custom-Logs-V2-Log-Ingestion-API-TSG.md, ado-wiki-b-Data-ingestion-troubleshooting-flowchart.md, ado-wiki-b-Detecting-partial-data-ingestion-data-drops.md, ado-wiki-b-identify-ingestion-issues.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Log Analytics workspace reached daily cap (daily data volume limit). All additional data sent to the ingestion pipeline is dropped for the remainder of the day.

**Solution**: 1) Verify daily cap hit via Operation table: Operation | where OperationStatus in ('Error','Failed','Warning') | summarize arg_max(TimeGenerated,*) by Detail, OperationStatus. 2) Check daily cap setting in workspace properties. 3) If business-critical, increase or remove the daily cap. 4) ADO Wik...

`[Source: OneNote, Score: 9.0]`

### Step 2: Data dropped in Log Analytics with error: 'The number of custom fields 511 is above the limit of 510 fields per data type'. Custom log or AzureDiagnostics table exceeds custom field limit.

**Solution**: 1) Validate custom fields limit: ADO Wiki 'How-to: Validate if custom fields limit is being reached'. 2) If limit is hit, request PG to increase limit: ADO Wiki 'How-to: Escalate AzureDiagnostic table exception'. 3) Consider switching from AzureDiagnostics mode to resource-specific tables to redu...

`[Source: OneNote, Score: 9.0]`

### Step 3: Diagnostics data missing or incomplete in Log Analytics workspace. Azure resource logs not appearing in expected tables.

**Solution**: Follow escalation flow: 1) Confirm data reached InMem (ADO Wiki: How-to Check if Diagnostics data arrived in InMem). 2) If not in InMem, check ODS quota. 3) Check custom field limit for AzureDiagnostics table. 4) Check for ingestion errors (ADO Wiki: HT How to check for ingestion errors). 5) Chec...

`[Source: OneNote, Score: 9.0]`

### Step 4: High latency or delay in Azure resource logs appearing in Log Analytics workspace. Diagnostics data takes excessively long to become queryable.

**Solution**: 1) Review ingestion time concepts: docs.microsoft.com/azure/azure-monitor/platform/data-ingestion-time. 2) Follow ADO Wiki: How-to Check the latency or delay. 3) For OBO latency, query azureinsights.kusto.windows.net Insights database. 4) For InMem latency, query omsgenevatlm.kusto.windows.net Op...

`[Source: OneNote, Score: 9.0]`

### Step 5: Duplicated entries in custom log table in Log Analytics. Same log lines ingested multiple times with different _ItemId.

**Solution**: Verify duplicates via hash(dynamic_to_json(pack_all())). Calculate duplicate %. Confirm _ItemId differs. Check daily volume. Escalate to PG with ICM. TSG: CSS wiki duplicate records identification.

`[Source: OneNote, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Log Analytics workspace reached daily cap (daily data volume limit). All addi... | Workspace configured with a daily cap on billable data. Once the cap is reach... | 1) Verify daily cap hit via Operation table: Operation / where OperationStatu... | 9.0 | OneNote |
| 2 | Data dropped in Log Analytics with error: 'The number of custom fields 511 is... | Each Log Analytics table has a maximum of 500-510 custom fields. When a resou... | 1) Validate custom fields limit: ADO Wiki 'How-to: Validate if custom fields ... | 9.0 | OneNote |
| 3 | Diagnostics data missing or incomplete in Log Analytics workspace. Azure reso... | Data pipeline issue in ODS or InMem components of the Log Analytics ingestion... | Follow escalation flow: 1) Confirm data reached InMem (ADO Wiki: How-to Check... | 9.0 | OneNote |
| 4 | High latency or delay in Azure resource logs appearing in Log Analytics works... | Latency can occur in ODS or InMem pipeline components. Need to determine whic... | 1) Review ingestion time concepts: docs.microsoft.com/azure/azure-monitor/pla... | 9.0 | OneNote |
| 5 | Duplicated entries in custom log table in Log Analytics. Same log lines inges... | Known platform issue in Log Analytics ingestion pipeline. _ItemId differs bet... | Verify duplicates via hash(dynamic_to_json(pack_all())). Calculate duplicate ... | 9.0 | OneNote |
| 6 | Custom log table (V1, Data Collector API) gets automatically re-created after... | Customer's application or pipeline is still sending data via Data Collector A... | Inform customer they must STOP ingesting data to the table before deleting it... | 8.5 | ADO Wiki |
| 7 | Custom log V1 table unexpectedly migrated to V2 and cannot be reverted | If a V1 custom log's schema is edited via the 'Tables' blade → 'Edit schema' ... | Inform customer this is expected behavior. The migration is irreversible. Not... | 8.5 | ADO Wiki |
| 8 | TimeGenerated values differ between Log Analytics workspace query results and... | Log Analytics pipeline adjusts TimeGenerated if the value is >2 days before r... | Use data collection transformation to preserve original TimeGenerated: add 's... | 8.5 | ADO Wiki |
| 9 | TimeGenerated values differ between Log Analytics workspace and exported data... | LA pipeline adjusts TimeGenerated if >2 days before received time or >1 day i... | Use transformation: source / extend TimeGenerated_original = TimeGenerated. C... | 8.5 | ADO Wiki |
| 10 | Application Insights daily cap not honored — data continues to ingest past th... | Application is using instrumentation key (IKey) only, which routes telemetry ... | Migrate the application from instrumentation key to connection string so tele... | 8.5 | ADO Wiki |
| 11 | Azure Monitor data ingestion fails from a resource (web app/function app) wit... | The resource is not using the Private DNS zones established by AMPLS and the ... | 1. Run nslookup from the resource to confirm it returns a public IP. 2. Verif... | 8.5 | ADO Wiki |
| 12 | String values in dynamic fields (customDimensions/Properties) auto-converted ... | By design. Kusto dynamic type auto-parses strings matching datetime formats i... | No platform fix. Workaround: break datetime regex by adding prefix chars (e.g... | 8.5 | ADO Wiki |
| 13 | Telemetry data stops appearing in Application Insights at a certain point dur... | Application Insights daily cap (quota) was reached causing ingestion service ... | Increase daily cap limit in Application Insights settings; investigate root c... | 8.5 | ADO Wiki |
| 14 | Application Insights daily cap exceeded significantly despite being configure... | Application uses iKey-only config with global ingestion endpoint (dc.services... | Migrate to connection strings with regional endpoint addresses for accurate d... | 8.5 | ADO Wiki |
| 15 | Application Insights daily cap shows slight overage with ingestion slightly a... | By design since March 2023 fast-capping feature; overage limit is max(DailyCa... | Expected behavior since March 2023; overage bounded by max(DailyCap*1.1, Dail... | 8.5 | ADO Wiki |
| 16 | Application Insights telemetry ingestion fails or data stops appearing after ... | Application is configured with instrumentation key only, sending telemetry to... | 1) Migrate from instrumentation key to connection string (uses regional endpo... | 8.5 | ADO Wiki |
| 17 | After migrating from instrumentation key to connection string, Application In... | The application or OS is forcing TLS 1.0/1.1 for outbound connections. Applic... | 1) For .NET: check OS, .NET runtime version, and whether app code forces spec... | 8.5 | ADO Wiki |
| 18 | Failures or Performance blade shows metric-based data (charts, counts) but lo... | Log Analytics workspace reached configured daily cap. Metrics and logs have d... | Check if underlying Log Analytics workspace daily cap was reached. Metric ing... | 8.5 | ADO Wiki |
| 19 | Availability test names missing from portal, metrics chart shows no data, or ... | Common causes: incorrect time range filter (default 24h), Daily Cap reached p... | Check time range filter, verify Daily Cap status, ensure Log Analytics worksp... | 8.5 | ADO Wiki |
| 20 | Customer inquires about billing charges or costs associated with Snapshot Deb... | - | No subscription billing charges for Snapshot Debugger. No charges for ingesti... | 8.5 | ADO Wiki |
| 21 | HttpError_NameResolutionFailure errors in OBO pipeline (ODSPostTelemetry tabl... | The target Log Analytics workspace has been deleted, so the workspace DNS nam... | 1) Check if workspace exists in ASC or query: cluster('oibeftprdflwr.kusto.wi... | 8.5 | ADO Wiki |
| 22 | HttpError_NameResolutionFailure errors in OBO pipeline after customer deleted... | When a workspace is deleted and recreated with the same name, a NEW workspace... | Customer must recreate or edit the existing diagnostic settings to point to t... | 8.5 | ADO Wiki |
| 23 | HttpError_NameResolutionFailure errors in OBO pipeline. Workspace exists and ... | Workspace DNS records ({workspaceId}.ods.opinsights.azure.com) are missing or... | 1) Validate DNS: run PowerShell 'nslookup {workspaceId}.ods.opinsights.azure.... | 8.5 | ADO Wiki |
| 24 | Data not being ingested in NorthStar pipeline for a specific data type. Targe... | The correct transform version for the data type is not deployed in the NorthS... | 1) Query LogTrace in omsgenevatlm/GenevaNSProd: let datatype_id = '<DATA_TYPE... | 8.5 | ADO Wiki |
| 25 | Logs stopped flowing to Log Analytics workspace. Customer has Free tier or a ... | The workspace daily cap was reached, causing ingestion to be suspended (DataI... | Validate daily cap status via: 1) ASC insights (shows current OverQuota statu... | 8.5 | ADO Wiki |
| 26 | Daily cap limit is not honored: ingestion continues well beyond configured da... | Control Plane status flag fails to propagate to ingestion pipeline in time, s... | As of Jan 2026, PG has mitigated with a redesigned flow. Do NOT raise ICMs fo... | 8.5 | ADO Wiki |
| 27 | Need to determine when each Log Analytics table last received data to identif... | No built-in portal view showing last record timestamp per table. | Run KQL on workspace or ASC Query Customer Data: search * / summarize max(Tim... | 8.5 | ADO Wiki |
| 28 | Data fails to ingest into AzureDiagnostics table due to hitting the 500 colum... | AzureDiagnostics table has a hard limit of 500 columns per workspace. PG has ... | 1) Confirm 500-column limit reached (wiki: Validate if custom fields limit is... | 8.5 | ADO Wiki |
| 29 | Log ingestion or query failures after TLS 1.0/1.1 retirement enforcement for ... | Azure Monitor Logs enforces TLS 1.2+ for queries starting July 1, 2025 and fo... | Transition to TLS 1.2+: https://learn.microsoft.com/en-us/azure/azure-monitor... | 8.5 | ADO Wiki |
| 30 | Log Analytics daily cap is exceeded well beyond the configured amount, especi... | The daily cap mechanism had a design limitation where it could not stop data ... | Issue mitigated with redesigned flow from PG side (Jan 2026 update). Daily ca... | 8.5 | ADO Wiki |
| 31 | When using custom tables with ingestion-time transformation, records arrive w... | The destination custom table schema does not contain columns matching the fie... | Ensure the destination custom table schema contains custom columns matching a... | 8.5 | ADO Wiki |
| 32 | HTTP Data Collector API: Operation table shows error Custom log is V2, Worksp... | The table was migrated to Custom Logs V2 schema (or created as CLV2), which l... | Migrate the data ingestion from HTTP Data Collector API to the Log Ingestion ... | 8.5 | ADO Wiki |
| 33 | Duplicate records in Log Analytics workspace where _ItemId is the same across... | Ingestion pipeline re-ingested data from staging areas to prevent data loss d... | This is a known pipeline behavior. Escalate to Kusto-LogAnalytics Backend PG ... | 8.5 | ADO Wiki |
| 34 | Customer reports truncated or trimmed data in Log Analytics workspace table f... | Input field from data source exceeds Log Analytics field size limit (32KB def... | 1) Check Workspace Insights, Operation table, or _LogOperation function for t... | 8.5 | ADO Wiki |
| 35 | Azure Activity Logs not appearing in Log Analytics workspace query results de... | Customer is using the deprecated Log Analytics Activity Log Data Connector (l... | 1) Identify the data source: check if AzureActivity data has 'Category'/'Oper... | 8.5 | ADO Wiki |
| 36 | Azure Activity Logs missing from Log Analytics workspace - all data or specif... | Diagnostic Setting may not exist for the subscription, may not include the re... | 1) Verify Diagnostic Setting exists for subscription and targets correct work... | 8.5 | ADO Wiki |
| 37 | Customer reports resource log data not being received in their Log Analytics ... | The Log Analytics workspace has reached its daily cap (over quota). When the ... | Check if the workspace daily cap was reached using ASC. If over quota, advise... | 8.5 | ADO Wiki |
| 38 | Customer unable to ingest custom metrics into Azure Monitor via REST API | Custom metric ingestion is handled by Geneva Monitoring/Ingestion Gateway, no... | 1) Review Azure custom metrics REST API documentation (https://learn.microsof... | 8.5 | ADO Wiki |
| 39 | Some Application Insights telemetry types suddenly stop flowing while other t... | Partial deployment — not all application binaries/services were updated simul... | Use 'Aggregate by Parsed SDK Names' or 'Aggregate by Raw SDK Names' in ASC In... | 7.5 | ADO Wiki |
| 40 | Customer reports missing telemetry data but ASC ingestion charts show no data... | Ingestion latency — data successfully reached the Application Insights ingest... | Use the 'Query Customer Data' tab in ASC to query the Application Insights ta... | 7.5 | ADO Wiki |
| 41 | Customer reports incomplete or truncated data in one or more columns of their... | Data is being trimmed because the InMem column size limit is 32KB. Fields exc... | Query ActivityCompletedEvent in omsgenevainmemprod.eastus Kusto cluster (Oper... | 7.0 | ADO Wiki |
| 42 | AzureDiagnostics data is dropped with 'InvalidDataFormat' error in the Operat... | The Resource Provider is sending malformed JSON payload to Log Analytics via ... | Query ActivityCompletedEvent in omsgenevainmemprod.eastus (OperationInsights_... | 7.0 | ADO Wiki |
| 43 | AzureDiagnostics data from Microsoft Storage resource provider is dropped wit... | Known issue with Microsoft Storage resource provider sending logs with invali... | This is a known Storage RP issue. Create a collaboration task to Storage CSS ... | 7.0 | ADO Wiki |
| 44 | New fields added to AzureDiagnostics table by resource providers are collapse... | AzureDiagnostics table schema is locked as part of migration to dedicated tab... | 1. Run KQL query against ActivityCompletedEvent in omsgenevainmemprod.eastus ... | 6.0 | ADO Wiki |
| 45 | Data ingestion fails for a custom log table in Log Analytics workspace; new c... | Custom table has reached the 500 column limit per Log Analytics workspace table | For V1 custom tables: raise an IcM to PG via ASC to request column increase (... | 6.0 | ADO Wiki |
| 46 | AzureDiagnostics or custom log table stops ingesting data or is missing from ... | The workspace has reached the 500 custom field limit (default) for the table.... | Option 1: Delete unnecessary custom fields via undocumented API - GET customF... | 6.0 | ADO Wiki |
| 47 | After a subscription is suspended and reactivated, Log Analytics workspace st... | Control Plane receives SubscriptionSuspended flag from ARM + Billing and stop... | Running a resource sync will NOT help. This requires a manual fix by PG. Use ... | 6.0 | ADO Wiki |
| 48 | Customer reports the MicrosoftInsightsAzureActivityLog table is missing from ... | The MicrosoftInsightsAzureActivityLog table was deprecated on 01/02/2022. It ... | Advise customer to use the AzureActivity table instead. The data is already b... | 6.0 | ADO Wiki |
| 49 | Log Analytics queries show 1-2 minute latency between data changes/ingestion ... | By design: Kusto clusters backing Log Analytics use a weak consistency model.... | This is expected behavior. Refer customer to: https://learn.microsoft.com/azu... | 6.0 | ADO Wiki |
| 50 | Customers ingesting high volume of custom logs via Log Analytics Agent experi... | Design limitation of the InMem component (InMemoryTransferManagerRole) respon... | Issue was resolved with Stage 1 (Feb 2021) and Stage 2 (Sept 2021) fixes depl... | 6.0 | ADO Wiki |
