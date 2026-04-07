# DEFENDER Sentinel Data Lake 与存储 — Comprehensive Troubleshooting Guide

**Entries**: 36 | **Draft sources**: 8 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-sentinel-data-lake-data-management-tsg.md, ado-wiki-b-sentinel-data-lake-auditing-tsg.md, ado-wiki-b-sentinel-data-lake-kql-tsg.md, ado-wiki-b-sentinel-data-lake-notebooks-tsg.md, ado-wiki-b-sentinel-data-lake-onboarding-offboarding-tsg.md, ado-wiki-b-sentinel-data-lake-packaging-manifest-tsg.md, ado-wiki-b-sentinel-data-lake-rbac-tsg.md, ado-wiki-d-search-archive-restoration-preview.md
**Generated**: 2026-04-07

---

## ⚠️ Conflict Notes

- **solution_conflict** (medium): defender-801 vs defender-997
  Judgment: context_dependent — Solutions differ but may apply to different scenarios
  Recommendation: Both preserved with context annotations

## Troubleshooting Flow

### Phase 1: Sentinel Data Lake
> Sources: ado-wiki

**1. Queries using 'cluster' operator fail when connected to the MSG (Microsoft Sentinel Graph) lake in ADX**

- **Root Cause**: The cluster operator is not supported in MSG lake ADX connections. Two unsupported scenarios: 1) cluster() from MSG lake, 2) cluster() referencing ADX database from another cluster.
- **Solution**: Avoid cluster() operator when connected to MSG lake in ADX. Run queries directly on target cluster/database instead of cross-cluster references. Deleting resources can also cause related issues (ref IcM 679659773, 692488628).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. KQL interactive query on Microsoft Sentinel data lake times out or returns data size exceeded error**

- **Root Cause**: Interactive KQL queries on the data lake have an 8-minute timeout and 64MB data size limit. Results are capped at 30,000 rows. Lake queries are generally lower performance than Analytics tier queries.
- **Solution**: For queries exceeding 30,000 rows or hitting timeout/size limits, submit a KQL job instead of running interactive queries. KQL jobs run asynchronously and promote results into a custom table in the Analytics tier. Apply time range filters and WHERE clauses to reduce data scanned for interactive queries.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. KQL query on Sentinel data lake from Azure Data Explorer (ADX) returns empty results or errors**

- **Root Cause**: Sentinel data lake tables are Kusto external tables. When querying from ADX, users must use the external_table() function. Directly querying table names without external_table() will fail or return empty results.
- **Solution**: Use external_table() function when querying from ADX. Example: external_table('SigninLogs') | take 5. Also ensure the correct workspace is selected in the left navigation. The ADX endpoint for connection is: https://api.securityplatform.microsoft.com/lake/kql
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. KQL job output has incorrect TimeGenerated values; original event timestamps are lost after promotion to Analytics tier**

- **Root Cause**: TimeGenerated values older than 2 days are overwritten by Log Analytics during promotion from the data lake to the Analytics tier. Standard columns (TenantId, _TimeReceived, Type, SourceSystem, _ResourceId, _SubscriptionId, _ItemId, _BilledSize, _IsBillable, _WorkspaceId) are also excluded during promotion.
- **Solution**: Write the original event time from TimeGenerated into a separate column before promotion. Example KQL: | project EventTimestamp = TimeGenerated, *. This preserves the original timestamp while allowing Log Analytics to manage TimeGenerated.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. ingestion_time() function or custom functions fail when running KQL queries on Sentinel data lake**

- **Root Cause**: Lake tables are Kusto external tables, so ingestion_time() is not applicable. Using out-of-box or custom functions is not supported in KQL queries on the data lake during public preview. Calling external data via KQL query is also not supported.
- **Solution**: Remove ingestion_time() from queries targeting lake tables. Avoid custom functions; rewrite queries using inline logic. For external data access, use KQL jobs to promote data to Analytics tier first, then join with external data sources there.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Onboarding fails with DL102 error during Microsoft Sentinel data lake provisioning**

- **Root Cause**: DL102 indicates a lack of Azure resources in the region at the time of provisioning. This is a transient regional capacity issue.
- **Solution**: Customer needs to retry the onboarding process. The setup will be reset to enable retry once the resource situation is resolved. This is visible in HAR trace. No action from CSS other than communicating the retry approach.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. Onboarding fails with DL103 error during Microsoft Sentinel data lake provisioning**

- **Root Cause**: DL103 indicates the customer has enabled Azure policies that prevent the creation of Azure managed resources required for the data lake.
- **Solution**: Customer must review and modify their Azure policies to allow creation of managed resources needed for the data lake. The managed identity (prefix msg-resources-) requires Azure Reader role over onboarded subscriptions. Do not delete or remove permissions from this managed identity.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. CAPACITY_UNAVAILABLE error during Sentinel data lake onboarding (HAR shows isEligible:false, errorCode:CAPACITY_UNAVAILABLE)**

- **Root Cause**: Known Issue 1823: capacity constraints in specific regions (West Europe, East US) prevent data lake provisioning. Regional Azure resources are insufficient to support new data lake instances.
- **Solution**: Request CSAM to submit a Unified Action Tracker (UAT) at https://uatracker.microsoft.com/ with: attached milestone with estimated data lake ACR, Tenant ID, environment type (dev/test/prod), technical readiness status, compete situation details, realistic deadline, and business impact. CSS cannot resolve directly; set expectations with customer and CSAM, work toward case closure after UAT is raised.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**9. Data tables not appearing in Microsoft Sentinel data lake after successful onboarding**

- **Root Cause**: Tables require 90-120 minutes to appear in the lake after onboarding. When tables are enabled for the first time or tier switching occurs, the same 90-120 minute delay applies. Auxiliary log tables also transition to data lake integration.
- **Solution**: Wait 90-120 minutes after successful onboarding for tables to appear. Once tables appear, data mirrored to the lake appears at the same time as Analytics tier data. If tables still do not appear after the expected time, check that workspaces are connected to Defender and in the same region as the primary Sentinel workspace.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**10. Customer wants to offboard or rollback Microsoft Sentinel data lake onboarding but cannot self-service**

- **Root Cause**: Data lake offboarding is not self-service; customers cannot perform this action themselves. Offboarding deletes saved queries and all resources provisioned as part of the data lake. After offboarding, re-onboarding is required.
- **Solution**: CSS must open an ICM to MSG Tenant Provisioning / MSG Provisioning - Customer Escalation and Engagement. Include: customer name, reason for offboarding, Tenant ID, subscription to offboard, optional specific workspaces. Attach customer confirmation screenshot acknowledging deletion of saved queries and resources. SLA for rollback is 4 days.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**11. VS Code Create Package Manifest option does not appear in context menu when using Sentinel extension for data lake solution packaging**

- **Root Cause**: Users must right-click on an empty/blank space in the VS Code File Explorer pane, not on an individual file. Clicking on a specific file will not show the Microsoft Sentinel > Create Package Manifest option.
- **Solution**: Right-click on a blank/empty area in the VS Code File Explorer (not on any specific file) and select Microsoft Sentinel > Create Package Manifest. The editor will appear and prompt for a save location.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**12. Packaging fails with error Multiple SC agent files found when creating Sentinel data lake solution package**

- **Root Cause**: The solution directory contains more than one AgentManifest.yaml file. Only one Security Copilot agent manifest is allowed per solution package.
- **Solution**: Ensure only one AgentManifest.yaml file exists in the solution directory. Remove any duplicate agent manifest files before attempting to create the package zip file.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**13. Packaging fails with error No such file or directory PackageManifest.yaml when creating Sentinel data lake solution package**

- **Root Cause**: The PackageManifest.yaml file was deleted from the solution directory (intentionally or accidentally) after initial creation. The packaging process cannot locate the manifest file.
- **Solution**: Ensure the PackageManifest.yaml file remains in the solution directory before creating the package zip. If deleted, re-create it by right-clicking empty space in VS Code File Explorer > Microsoft Sentinel > Create Package Manifest.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**14. Sentinel data lake ADLS Gen2 connector navigation fails; connector instance does not show tables or navigation shows failures with KeyVault access error**

- **Root Cause**: MSG Managed Identity does not have access to the customer KeyVault. The ADLS Gen2 federation connector requires KeyVault access to retrieve storage credentials.
- **Solution**: Verify MSG Managed Identity has the required access policy on the KeyVault. Use Kusto query on IngestionManagementLog filtering by TenantId and CorrelationId with SourceFilePath has AdlsGen2Connector and Message has Connection test failed to identify the specific KeyVault access failure.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**15. Sentinel data lake ADLS Gen2 connector navigation fails with Permission Denied or Forbidden error**

- **Root Cause**: The Service Principal used by the federation connector does not have read access to the customer Storage Account.
- **Solution**: Grant the Service Principal read access (Storage Blob Data Reader role) on the target Storage Account. Use Kusto query on IngestionManagementLog with FailureReason == Permission Denied to confirm. Verify the ADLS path is accessible.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**16. ADLS Gen2 federation table discovery returns no tables; delta table discovery fails**

- **Root Cause**: The ADLS path does not contain valid Delta Lake tables. Tables must have a _delta_log directory to be discovered by the federation connector.
- **Solution**: Verify the ADLS path contains Delta Lake format tables with _delta_log directories. Check folder structure in ADLS: container must exist, path must be accessible, and tables must be in Delta format.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**17. ADLS Gen2 federation shortcut creation fails with Connection Id must be provided error**

- **Root Cause**: The Fabric connection was not created during the initial onboarding process. Shortcut creation requires an existing connection to the ADLS Gen2 data source.
- **Solution**: Verify connection exists using Kusto query on IngestionManagementLog filtering for Connection Id must be provided. If connection is missing, retry onboarding. Registration is idempotent so retry will reuse existing resources.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**18. ADLS Gen2 federation external table creation fails with Fabric Details is missing error**

- **Root Cause**: The table was not pre-created in the MSG system before attempting federation. Fabric details must be initialized for the table before external table provisioning.
- **Solution**: Verify table was created via CreateCustomTable API. Check Fabric details initialization using Kusto query on IngestionManagementLog filtering for Get Table and for Fabric Connector.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**19. Sentinel data lake Databricks connector creation fails with authentication error or invalid workspace URL**

- **Root Cause**: The Databricks workspace URL is incorrect or the Service Principal lacks required permissions (Contributor role) on the Databricks workspace.
- **Solution**: 1. Verify Databricks workspace URL is correct. 2. Verify SP has Contributor role on Databricks workspace. 3. Check SP can authenticate to Databricks. 4. Validate catalog name exists in Databricks Unity Catalog (case-sensitive).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**20. Sentinel data lake Databricks table navigation returns empty results or authentication errors when listing tables**

- **Root Cause**: The Databricks catalog or schema specified does not exist, or the Service Principal cannot authenticate to the Databricks workspace to list tables.
- **Solution**: 1. Verify catalog and schema exist in Databricks Unity Catalog UI. 2. Verify schema contains tables. 3. Check token acquisition using Kusto query filtering for Databricks and token. 4. Check JSON response using Kusto query filtering for Received tables JSON.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**21. Databricks mirrored catalog creation fails with already exists error during Sentinel data lake federation**

- **Root Cause**: A mirrored catalog with the same name already exists from a previous onboarding attempt. The Fabric workspace already has this catalog item.
- **Solution**: Check if catalog already exists using Kusto query filtering for Databricks catalog and already exists. Existing catalog can be reused. Verify workspace exists in Fabric portal. Registration is idempotent - retry will reuse existing resources.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**22. Sentinel data lake Fabric connector creation fails with schema validation error; lakehouse validation fails**

- **Root Cause**: The customer Fabric lakehouse is not schema-enabled. Sentinel data lake federation requires schema support on the lakehouse.
- **Solution**: Verify schema support is enabled on the customer lakehouse: go to Fabric portal > Lakehouse Settings > Schema Support. Use Kusto query on IngestionManagementLog filtering for schema-enabled or ValidateSchemaEnabled to check validation results.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**23. Fabric federation table registration fails with Cannot register more than error; too many tables in single registration request**

- **Root Cause**: The registration request contains more than 100 tables. Sentinel data lake Fabric federation has a limit of 100 tables per registration batch.
- **Solution**: Reduce the number of tables per registration request to 100 or fewer. Use Kusto query on IngestionManagementLog filtering for Cannot register more than to confirm the error and see the actual table count received.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**24. Fabric federation external data share creation fails; error creating external data share for Sentinel data lake table**

- **Root Cause**: Invalid source path (customer lakehouse path does not exist), insufficient permissions to create share, or recipient UAMI/Service Principal not configured. Recipient tenant ID should be AME tenant (33e01921-4d64-4f8c-a055-5bdaffd5e33d).
- **Solution**: 1. Verify source paths exist in customer lakehouse. 2. Check recipient principal is configured using Kusto query filtering for recipientServicePrincipalId or UAMI. 3. Verify provider tenant = customer tenant, recipient tenant = AME tenant. 4. If >100 paths, split into multiple shares.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**25. Fabric federation batch registration partially fails; some tables succeed while others fail with workspace/lakehouse mismatch**

- **Root Cause**: Tables in the batch have different customer workspace or lakehouse IDs. All tables in a batch registration must target the same workspace and lakehouse. Tables may already be federated under different external data shares.
- **Solution**: 1. Ensure all tables in the batch target the same customer workspace and lakehouse. 2. Check for mixed states using Kusto query filtering for already federated under. 3. Verify schema grouping worked correctly. 4. Check individual table results to identify which succeeded/failed.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**26. Data not appearing in Microsoft Sentinel data lake after completing setup and onboarding**

- **Root Cause**: Data lake mirroring has a propagation delay of 90-120 minutes after initial onboarding. For new connectors or DCR updates, changes take up to 30 minutes to reflect.
- **Solution**: Wait 90-120 minutes after initial data lake onboarding for data to appear. For new connectors or DCR updates, wait up to 30 minutes. Check Table Management to confirm tier settings and retention are correctly configured. Note: historical data is NOT backfilled.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**27. Certain logs found in Analytics tier but missing from Sentinel data lake; historical data not appearing in data lake**

- **Root Cause**: Data lake mirroring does not backfill historical data. Mirroring starts only from the time of data lake enablement. Pre-existing data in Analytics tier is not copied to the lake.
- **Solution**: Inform customer that historical data prior to data lake enablement is not available in the lake. Only data ingested after enablement is mirrored. Archived data in Analytics remains available through Search and Restore.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**28. Cannot edit table retention period or storage tier settings in Sentinel data lake Table Management**

- **Root Cause**: User lacks the required permissions. Contributor-level access (Log Analytics Contributor or Defender XDR Data manage roles) is needed to modify table settings. Reader-level roles can only view data.
- **Solution**: Grant the user Contributor-level access: either Log Analytics Contributor or Defender XDR Data (manage) role. To change settings: Table Management > Select table > Click Manage table > Adjust settings > Save. Note: for XDR tables, setting retention >30 days enables Table Management setting.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 2: Data Lake
> Sources: mslearn

**1. Sentinel data lake KQL query times out at Gateway**

- **Root Cause**: Long-running queries without time range filters cause excessive data scanning and exceed the allowed execution timeout
- **Solution**: Add time filters (e.g. where TimeGenerated > ago(1d)) and apply additional filters to reduce the data volume. Optimize query structure to minimize computation
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Sentinel data lake KQL query fails with Unsupported function ingestion_time()**

- **Root Cause**: The ingestion_time() function is not supported in Sentinel data lake KQL queries. It is only available in standard Log Analytics and Azure Data Explorer
- **Solution**: Remove ingestion_time() from the query. Use TimeGenerated or other available timestamp columns as alternatives for data lake queries
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. Sentinel data lake KQL interactive query fails with Query execution has exceeded the allowed limits (500K row limit)**

- **Root Cause**: KQL interactive queries in the Sentinel data lake are limited to 500000 rows. Queries returning more rows exceed this limit
- **Solution**: Run the query as a KQL job instead of an interactive query, or use Notebooks for large result sets. Alternatively, add filters to reduce the result set below 500K rows
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**4. Sentinel data lake KQL query returns 401-Unauthorized error**

- **Root Cause**: Authentication token is invalid or expired, or the user does not have necessary permissions to query the specified database in the data lake
- **Solution**: Reauthenticate to refresh the token and verify that the user has the correct RBAC roles for the Sentinel data lake database
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**5. Sentinel data lake KQL job fails with schema mismatch: query output does not match destination table**

- **Root Cause**: Column names, count, or data types in the KQL job output differ from the destination table schema, e.g. string vs datetime type mismatch
- **Solution**: 1) Compare job query output columns with destination table schema; 2) Update query to align column names, order, and data types; 3) If needed, update the table schema; 4) Test query in KQL editor before submitting as job
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**6. Sentinel data lake KQL jobs return partial/missing results**

- **Root Cause**: Cold storage 15-min ingestion latency; short lookback queries unavailable data
- **Solution**: Set end time to now()-15m; overlap lookback with job frequency
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 3: Restore
> Sources: ado-wiki

**1. Sentinel Restore job fails because data from the target table is already restored - error when attempting to restore archived/basic log table**

- **Root Cause**: A previous restore job already created a SourceTableName_RandomNumber_RST table for the same source table. Azure Monitor only allows one active restore per table at a time
- **Solution**: Delete the existing SourceTableName_RandomNumber_RST table using the delete action in the Restoration tab, then submit a new restore job. Note restore limitations: min 2 days of data, data must be >14 days old, max 60TB per restore, max 4 restores/week/workspace, max 2 concurrent restores
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 4: Antivirus
> Sources: mslearn

**1. MDAV full scan failing due to memory issues - memory consumption exceeding constraints**

- **Root Cause**: Large number of cab/zip archive files on machine causing excessive memory usage during archive scanning
- **Solution**: Clean up unused cab/zip files; implement AV exclusions for specific paths; see recommended AV exclusions for Configuration Manager
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Sentinel Restore job fails because data from the target table is already restored - error when at... | A previous restore job already created a SourceTableName_RandomNumber_RST table for the same sour... | Delete the existing SourceTableName_RandomNumber_RST table using the delete action in the Restora... | 🟢 8.5 | ADO Wiki |
| 2 | Queries using 'cluster' operator fail when connected to the MSG (Microsoft Sentinel Graph) lake i... | The cluster operator is not supported in MSG lake ADX connections. Two unsupported scenarios: 1) ... | Avoid cluster() operator when connected to MSG lake in ADX. Run queries directly on target cluste... | 🟢 8.5 | ADO Wiki |
| 3 | KQL interactive query on Microsoft Sentinel data lake times out or returns data size exceeded error | Interactive KQL queries on the data lake have an 8-minute timeout and 64MB data size limit. Resul... | For queries exceeding 30,000 rows or hitting timeout/size limits, submit a KQL job instead of run... | 🟢 8.5 | ADO Wiki |
| 4 | KQL query on Sentinel data lake from Azure Data Explorer (ADX) returns empty results or errors | Sentinel data lake tables are Kusto external tables. When querying from ADX, users must use the e... | Use external_table() function when querying from ADX. Example: external_table('SigninLogs') / tak... | 🟢 8.5 | ADO Wiki |
| 5 | KQL job output has incorrect TimeGenerated values; original event timestamps are lost after promo... | TimeGenerated values older than 2 days are overwritten by Log Analytics during promotion from the... | Write the original event time from TimeGenerated into a separate column before promotion. Example... | 🟢 8.5 | ADO Wiki |
| 6 | ingestion_time() function or custom functions fail when running KQL queries on Sentinel data lake | Lake tables are Kusto external tables, so ingestion_time() is not applicable. Using out-of-box or... | Remove ingestion_time() from queries targeting lake tables. Avoid custom functions; rewrite queri... | 🟢 8.5 | ADO Wiki |
| 7 | Onboarding fails with DL102 error during Microsoft Sentinel data lake provisioning | DL102 indicates a lack of Azure resources in the region at the time of provisioning. This is a tr... | Customer needs to retry the onboarding process. The setup will be reset to enable retry once the ... | 🟢 8.5 | ADO Wiki |
| 8 | Onboarding fails with DL103 error during Microsoft Sentinel data lake provisioning | DL103 indicates the customer has enabled Azure policies that prevent the creation of Azure manage... | Customer must review and modify their Azure policies to allow creation of managed resources neede... | 🟢 8.5 | ADO Wiki |
| 9 | CAPACITY_UNAVAILABLE error during Sentinel data lake onboarding (HAR shows isEligible:false, erro... | Known Issue 1823: capacity constraints in specific regions (West Europe, East US) prevent data la... | Request CSAM to submit a Unified Action Tracker (UAT) at https://uatracker.microsoft.com/ with: a... | 🟢 8.5 | ADO Wiki |
| 10 | Data tables not appearing in Microsoft Sentinel data lake after successful onboarding | Tables require 90-120 minutes to appear in the lake after onboarding. When tables are enabled for... | Wait 90-120 minutes after successful onboarding for tables to appear. Once tables appear, data mi... | 🟢 8.5 | ADO Wiki |
| 11 | Customer wants to offboard or rollback Microsoft Sentinel data lake onboarding but cannot self-se... | Data lake offboarding is not self-service; customers cannot perform this action themselves. Offbo... | CSS must open an ICM to MSG Tenant Provisioning / MSG Provisioning - Customer Escalation and Enga... | 🟢 8.5 | ADO Wiki |
| 12 | VS Code Create Package Manifest option does not appear in context menu when using Sentinel extens... | Users must right-click on an empty/blank space in the VS Code File Explorer pane, not on an indiv... | Right-click on a blank/empty area in the VS Code File Explorer (not on any specific file) and sel... | 🟢 8.5 | ADO Wiki |
| 13 | Packaging fails with error Multiple SC agent files found when creating Sentinel data lake solutio... | The solution directory contains more than one AgentManifest.yaml file. Only one Security Copilot ... | Ensure only one AgentManifest.yaml file exists in the solution directory. Remove any duplicate ag... | 🟢 8.5 | ADO Wiki |
| 14 | Packaging fails with error No such file or directory PackageManifest.yaml when creating Sentinel ... | The PackageManifest.yaml file was deleted from the solution directory (intentionally or accidenta... | Ensure the PackageManifest.yaml file remains in the solution directory before creating the packag... | 🟢 8.5 | ADO Wiki |
| 15 | Sentinel data lake ADLS Gen2 connector navigation fails; connector instance does not show tables ... | MSG Managed Identity does not have access to the customer KeyVault. The ADLS Gen2 federation conn... | Verify MSG Managed Identity has the required access policy on the KeyVault. Use Kusto query on In... | 🟢 8.5 | ADO Wiki |
| 16 | Sentinel data lake ADLS Gen2 connector navigation fails with Permission Denied or Forbidden error | The Service Principal used by the federation connector does not have read access to the customer ... | Grant the Service Principal read access (Storage Blob Data Reader role) on the target Storage Acc... | 🟢 8.5 | ADO Wiki |
| 17 | ADLS Gen2 federation table discovery returns no tables; delta table discovery fails | The ADLS path does not contain valid Delta Lake tables. Tables must have a _delta_log directory t... | Verify the ADLS path contains Delta Lake format tables with _delta_log directories. Check folder ... | 🟢 8.5 | ADO Wiki |
| 18 | ADLS Gen2 federation shortcut creation fails with Connection Id must be provided error | The Fabric connection was not created during the initial onboarding process. Shortcut creation re... | Verify connection exists using Kusto query on IngestionManagementLog filtering for Connection Id ... | 🟢 8.5 | ADO Wiki |
| 19 | ADLS Gen2 federation external table creation fails with Fabric Details is missing error | The table was not pre-created in the MSG system before attempting federation. Fabric details must... | Verify table was created via CreateCustomTable API. Check Fabric details initialization using Kus... | 🟢 8.5 | ADO Wiki |
| 20 | Sentinel data lake Databricks connector creation fails with authentication error or invalid works... | The Databricks workspace URL is incorrect or the Service Principal lacks required permissions (Co... | 1. Verify Databricks workspace URL is correct. 2. Verify SP has Contributor role on Databricks wo... | 🟢 8.5 | ADO Wiki |
| 21 | Sentinel data lake Databricks table navigation returns empty results or authentication errors whe... | The Databricks catalog or schema specified does not exist, or the Service Principal cannot authen... | 1. Verify catalog and schema exist in Databricks Unity Catalog UI. 2. Verify schema contains tabl... | 🟢 8.5 | ADO Wiki |
| 22 | Databricks mirrored catalog creation fails with already exists error during Sentinel data lake fe... | A mirrored catalog with the same name already exists from a previous onboarding attempt. The Fabr... | Check if catalog already exists using Kusto query filtering for Databricks catalog and already ex... | 🟢 8.5 | ADO Wiki |
| 23 | Sentinel data lake Fabric connector creation fails with schema validation error; lakehouse valida... | The customer Fabric lakehouse is not schema-enabled. Sentinel data lake federation requires schem... | Verify schema support is enabled on the customer lakehouse: go to Fabric portal > Lakehouse Setti... | 🟢 8.5 | ADO Wiki |
| 24 | Fabric federation table registration fails with Cannot register more than error; too many tables ... | The registration request contains more than 100 tables. Sentinel data lake Fabric federation has ... | Reduce the number of tables per registration request to 100 or fewer. Use Kusto query on Ingestio... | 🟢 8.5 | ADO Wiki |
| 25 | Fabric federation external data share creation fails; error creating external data share for Sent... | Invalid source path (customer lakehouse path does not exist), insufficient permissions to create ... | 1. Verify source paths exist in customer lakehouse. 2. Check recipient principal is configured us... | 🟢 8.5 | ADO Wiki |
| 26 | Fabric federation batch registration partially fails; some tables succeed while others fail with ... | Tables in the batch have different customer workspace or lakehouse IDs. All tables in a batch reg... | 1. Ensure all tables in the batch target the same customer workspace and lakehouse. 2. Check for ... | 🟢 8.5 | ADO Wiki |
| 27 | Data not appearing in Microsoft Sentinel data lake after completing setup and onboarding | Data lake mirroring has a propagation delay of 90-120 minutes after initial onboarding. For new c... | Wait 90-120 minutes after initial data lake onboarding for data to appear. For new connectors or ... | 🟢 8.5 | ADO Wiki |
| 28 | Certain logs found in Analytics tier but missing from Sentinel data lake; historical data not app... | Data lake mirroring does not backfill historical data. Mirroring starts only from the time of dat... | Inform customer that historical data prior to data lake enablement is not available in the lake. ... | 🟢 8.5 | ADO Wiki |
| 29 | Cannot edit table retention period or storage tier settings in Sentinel data lake Table Management | User lacks the required permissions. Contributor-level access (Log Analytics Contributor or Defen... | Grant the user Contributor-level access: either Log Analytics Contributor or Defender XDR Data (m... | 🟢 8.5 | ADO Wiki |
| 30 ⚠️ | MDAV full scan failing due to memory issues - memory consumption exceeding constraints | Large number of cab/zip archive files on machine causing excessive memory usage during archive sc... | Clean up unused cab/zip files; implement AV exclusions for specific paths; see recommended AV exc... | 🔵 6.0 | MS Learn |
| 31 ⚠️ | Sentinel data lake KQL query times out at Gateway | Long-running queries without time range filters cause excessive data scanning and exceed the allo... | Add time filters (e.g. where TimeGenerated > ago(1d)) and apply additional filters to reduce the ... | 🔵 6.0 | MS Learn |
| 32 ⚠️ | Sentinel data lake KQL query fails with Unsupported function ingestion_time() | The ingestion_time() function is not supported in Sentinel data lake KQL queries. It is only avai... | Remove ingestion_time() from the query. Use TimeGenerated or other available timestamp columns as... | 🔵 6.0 | MS Learn |
| 33 ⚠️ | Sentinel data lake KQL interactive query fails with Query execution has exceeded the allowed limi... | KQL interactive queries in the Sentinel data lake are limited to 500000 rows. Queries returning m... | Run the query as a KQL job instead of an interactive query, or use Notebooks for large result set... | 🔵 6.0 | MS Learn |
| 34 ⚠️ | Sentinel data lake KQL query returns 401-Unauthorized error | Authentication token is invalid or expired, or the user does not have necessary permissions to qu... | Reauthenticate to refresh the token and verify that the user has the correct RBAC roles for the S... | 🔵 6.0 | MS Learn |
| 35 ⚠️ | Sentinel data lake KQL job fails with schema mismatch: query output does not match destination table | Column names, count, or data types in the KQL job output differ from the destination table schema... | 1) Compare job query output columns with destination table schema; 2) Update query to align colum... | 🔵 6.0 | MS Learn |
| 36 ⚠️ | Sentinel data lake KQL jobs return partial/missing results | Cold storage 15-min ingestion latency; short lookback queries unavailable data | Set end time to now()-15m; overlap lookback with job frequency | 🔵 6.0 | MS Learn |
