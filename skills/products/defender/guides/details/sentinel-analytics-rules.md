# DEFENDER Sentinel 分析规则与检测 — Comprehensive Troubleshooting Guide

**Entries**: 16 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-asc-asi-alert-analytic-rule-cleanup.md, ado-wiki-a-find-analytic-rule-alert-trigger-playbooks.md, ado-wiki-b-kql-analytic-rules-investigation.md, ado-wiki-c-product-knowledge-binary-drift-detection.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Analytic Rules
> Sources: ado-wiki

**1. Microsoft Sentinel scheduled analytic rule fails to execute or appears with 'AUTO DISABLED' added to the rule name**

- **Root Cause**: The auto-disable policy triggers when: (1) permanent errors occur more than 12 times over 4+ days, (2) after 3 weeks of failures with 100+ errors regardless of error type, or (3) after 60 days of failures with 4+ failures on any error
- **Solution**: Check SentinelHealth data table to query analytic rule health logs (e.g. SentinelHealth | where Status == 'Warning'). Health record Description shows 'Rule failed to run on multiple occasions and has been disabled. See aka.ms/DisabledRule'. Set up monitoring via playbook for email/Teams notifications. Note: SentinelHealth table retention is 30 days. Reference: https://docs.microsoft.com/en-us/azure/sentinel/detect-threats-custom#issue-a-scheduled-rule-failed-to-execute-or-appears-with-auto-disabled-added-to-the-name
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Microsoft Sentinel analytic rule using _GetWatchlist() or Threat Indicator table with a short lookback period (e.g. 5-6 minutes) misses data or returns incomplete/no results**

- **Root Cause**: The analytic rule lookback time range overrides the TimeGenerated filter inside KQL functions like _GetWatchlist(). When the lookback is shorter than the underlying table's refresh interval, the function only sees data within the narrow query window instead of the full table retention, causing data loss.
- **Solution**: Set the analytic rule lookback time to be longer than the refresh interval of the underlying tables (Watchlist, ConfidentialWatchlist, ThreatIndicator). For watchlist-based rules, ensure the lookback covers the full watchlist refresh cycle. Note: analytic rule execution is delayed by 5 minutes by default.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Customer needs to investigate unexpected changes to a Sentinel analytic rule (rule modified, disabled, or settings changed without explanation)**

- **Root Cause**: Analytic rules can be modified by any user with sufficient RBAC permissions. Changes are logged in the SentinelAudit table with caller identity and diff details.
- **Solution**: Query the SentinelAudit table: SentinelAudit | where SentinelResourceType == 'Analytic Rule' | where ExtendedProperties contains '<ruleId>' -- extend CallerName, CallerIpAddress, OriginalResourceState, UpdatedResourceState, ResourceDiffMemberNames to identify who made changes, from where, and what was modified.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Customer cannot find the exact event/row that triggered a specific AlertPerRow analytic rule alert in Sentinel**

- **Root Cause**: In AlertPerRow mode, Sentinel creates one alert per query result row. The alert ExtendedProperties.Query field contains a base64-encoded snapshot of that specific row, separate from OriginalQuery (the user KQL).
- **Solution**: Access the alert ExtendedProperties: 'OriginalQuery' shows the user rule query; 'Query' contains a base64 representation of the exact triggering row. Decode the Query field to retrieve the specific event without needing to re-run the original query with time manipulation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Entities are missing or dropped from Sentinel analytic rule alerts despite being configured in sentinelEntitiesMappings**

- **Root Cause**: Invalid entity JSON format in the sentinelEntitiesMappings column output. Entities with invalid field values (e.g., malformed AadTenantId, missing required fields) are silently dropped during alert creation.
- **Solution**: Check SentinelHealth for PartialSuccess status with code 'EntitiesDroppedDueToMappingIssues'. Validate that each entity in the mapped column follows the correct JSON schema with valid $id, Type, and type-specific fields (e.g., AadTenantId, AadUserId for account entities).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Sentinel scheduled analytic rule fires late or shows IngestionDelay status -- alerts/incidents are triggered later than expected**

- **Root Cause**: Data ingestion to Log Analytics was delayed. The analytic rule initially returned 0 results, then re-ran one hour later and found results, confirming logs arrived late. Delay can originate from source provider (high ReceiveLatency = _TimeReceived - TimeGenerated) or LA pipeline (high IngestionLatency = ingestion_time() - _TimeReceived).
- **Solution**: 1) Check SentinelHealth: SentinelHealth | where OperationName=='Scheduled analytics rule run' | where Status!='Success' -- filter by CorrelationId, look for Issue code 'IngestionDelay'. 2) Determine delay source: extend IngestionLatency = ingestion_time() - _TimeReceived, ReceiveLatency = _TimeReceived - TimeGenerated. High ReceiveLatency means source provider issue; high IngestionLatency means LA pipeline issue.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. Sentinel analytic rule was automatically disabled -- rule stops running without manual intervention**

- **Root Cause**: Auto-disable triggers include: target workspace deleted, target table deleted, Sentinel removed from workspace, KQL function modified/removed, permissions to data source changed, data source deleted/disconnected, or in MSSP scenarios the rule creator lost cross-tenant permissions.
- **Solution**: 1) Check rule description for disable reason. 2) Query SentinelHealth: SentinelHealth | where SentinelResourceName startswith 'AUTO DISABLED'. 3) Query SecurityInsightsProd Kusto cluster Span table with alertrules-sync APP_NAME and AutoDisableQueryBasedRule or DisableJobAsync operations to find DisablingMessage. For MSSP, verify rule creator still has valid cross-tenant permissions.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. Sentinel analytic rule entities not appearing in SecurityAlert -- entity mappings configured but entities missing from generated alerts**

- **Root Cause**: V3 entity parsing failure during alert creation. The entity row data does not match the expected schema, causing EntityParserBase to fail with 'Failed to build V3 entity from row' error in backend logs.
- **Solution**: Query SecurityInsightsProd Kusto cluster: Log | where body startswith 'Failed to build V3 entity from row' -- filter by RuleId and WorkspaceId. Parse env_ex_stack for error details. Summarize by errorMessage to identify which entity types/fields cause failures. Fix the analytic rule query to output entity columns matching the expected V3 entity schema.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**9. Sentinel alerts from the same analytic rule are not being grouped into a single incident despite grouping configuration being enabled**

- **Root Cause**: Each alert has a different UniqueGroupingIdentifier (UGI) because the entities differ between alerts. UGI format is RuleId_{entitiesIdentifiers}, so different entity values produce different UGIs preventing grouping.
- **Solution**: Query SecurityInsightsProd Kusto cluster ServiceFabricOperations table: filter by GetUniqueGroupingIdentifier operation, WorkspaceId, and systemAlertIds. Compare uniqueGroupingIdentifier and entitiesIdentifier across alerts. If UGIs differ, alerts have different entities. Review the analytic rule entity mappings and grouping config (groupByEntities, groupByCustomDetails) to ensure consistent entity output.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**10. Customer wants to exceed the 512 scheduled analytic rules limit in Microsoft Sentinel**

- **Root Cause**: Microsoft Sentinel has a default limit of 512 scheduled analytic rules per workspace. This limit is documented in service limits.
- **Solution**: 1) First evaluate if 512+ rules are truly needed. 2) Transition the workspace to a dedicated Log Analytics cluster. 3) Create a support case requesting an increase. 4) Support engineer raises an ICM with PG to double the existing limit on the dedicated cluster.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 2: Asim
> Sources: ado-wiki

**1. When creating a Microsoft Sentinel analytic rule from an ASIM template, customer receives error 'Failed to resolve table or column expression named imProcess/imRegistry/imFileEvent'**

- **Root Cause**: ASIM parsers (imProcess, imRegistry, imFileEvent, etc.) are in preview and require manual deployment by customers. They are not automatically included in the workspace.
- **Solution**: Deploy required ASIM parsers manually using ARM templates. Refer to 'List of Microsoft Sentinel ASIM parsers' documentation at https://docs.microsoft.com/en-us/azure/sentinel/normalization-parsers-list for links to ARM deployment templates.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 3: Watchlist
> Sources: ado-wiki

**1. Watchlist not deleted after delete operation - _GetWatchlist still returns data even though customer deleted the watchlist from UI or API**

- **Root Cause**: Delete operation writes logs in LAW marking each Watchlist ItemStatus from Create to Delete. If the delete operation did not complete successfully, or the LAW has not yet ingested the delete status logs, _GetWatchlist function (which filters for ItemStatus=Create) will still return stale data
- **Solution**: 1) Check Activity Logs for microsoft.securityinsights/watchlists/delete operation completion using ARMProd Kusto query or Azure Activity Logs dashboard. 2) Run LAW query: union Watchlist, ConfidentialWatchlist | where WatchlistAlias == alias | project-reorder TimeGenerated, _DTItemStatus to verify _DTItemStatus=Delete entries exist. 3) If delete was confirmed but watchlist persists, wait 24 hours then escalate via ICM with workspace details and screenshots
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 4: Analytic Rule
> Sources: ado-wiki

**1. Error when creating or updating Sentinel analytic rule via REST API (Management API), possibly etag mismatch or unexpected fields in request body**

- **Root Cause**: For new rules: including name, etag, or type in the request body causes conflicts (name comes from the URL id, type is determined by kind, etag is generated during creation). For existing rules: using a stale etag value because etag changes with each update.
- **Solution**: For creating new rules: exclude name, etag, and type from the request body - name is derived from the URL path, type from the kind property, and etag is assigned at creation. For updating existing rules: first perform a GET to retrieve the current etag, then include only the current etag in the PUT request body. Reference: https://docs.microsoft.com/en-us/rest/api/securityinsights/alertrules/createorupdate. Experts: Dan Chang and Shannon.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 5: Content Hub
> Sources: ado-wiki

**1. Analytic rules and hunting queries not visible after executing Content Hub centralization tool; installed/created content disappears from view**

- **Root Cause**: Alert rules created from legacy gallery content lack metadata that Content Hub uses to track installed templates. Gallery content does not have metadata, so Content Hub cannot find them. All gallery content is now migrated to come from Solutions.
- **Solution**: Delete the existing active alert rules that were created from gallery content and recreate them from the Solutions source (ensure rule template source is not gallery content). This ensures proper metadata tracking by Content Hub.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 6: Multi Workspace
> Sources: ado-wiki

**1. Custom detection rules or link-to-incident only works on primary workspace in Sentinel USX multi workspace - cannot create custom detections or link incidents on secondary workspaces**

- **Root Cause**: By design custom detections with Sentinel/alerts tables (AlertInfo, AlertEvidence) only allowed on primary workspace. Secondary workspace link-to-incident only works for queries with Sentinel-only data (no XDR joins)
- **Solution**: Switch to primary workspace using workspace selector and retry. For secondary workspaces link-to-incident queries must contain only Sentinel data. This is a current design limitation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 7: Defender Xdr
> Sources: mslearn

**1. Defender XDR custom detection rule silently fails to save due to KQL query syntax errors**

- **Root Cause**: Detection rule creation fails without detailed validation feedback when query has syntax errors
- **Solution**: Run query manually in advanced hunting first to verify syntax and results before creating detection rule
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Microsoft Sentinel scheduled analytic rule fails to execute or appears with 'AUTO DISABLED' added... | The auto-disable policy triggers when: (1) permanent errors occur more than 12 times over 4+ days... | Check SentinelHealth data table to query analytic rule health logs (e.g. SentinelHealth / where S... | 🟢 8.5 | ADO Wiki |
| 2 | When creating a Microsoft Sentinel analytic rule from an ASIM template, customer receives error '... | ASIM parsers (imProcess, imRegistry, imFileEvent, etc.) are in preview and require manual deploym... | Deploy required ASIM parsers manually using ARM templates. Refer to 'List of Microsoft Sentinel A... | 🟢 8.5 | ADO Wiki |
| 3 | Microsoft Sentinel analytic rule using _GetWatchlist() or Threat Indicator table with a short loo... | The analytic rule lookback time range overrides the TimeGenerated filter inside KQL functions lik... | Set the analytic rule lookback time to be longer than the refresh interval of the underlying tabl... | 🟢 8.5 | ADO Wiki |
| 4 | Customer needs to investigate unexpected changes to a Sentinel analytic rule (rule modified, disa... | Analytic rules can be modified by any user with sufficient RBAC permissions. Changes are logged i... | Query the SentinelAudit table: SentinelAudit / where SentinelResourceType == 'Analytic Rule' / wh... | 🟢 8.5 | ADO Wiki |
| 5 | Customer cannot find the exact event/row that triggered a specific AlertPerRow analytic rule aler... | In AlertPerRow mode, Sentinel creates one alert per query result row. The alert ExtendedPropertie... | Access the alert ExtendedProperties: 'OriginalQuery' shows the user rule query; 'Query' contains ... | 🟢 8.5 | ADO Wiki |
| 6 | Entities are missing or dropped from Sentinel analytic rule alerts despite being configured in se... | Invalid entity JSON format in the sentinelEntitiesMappings column output. Entities with invalid f... | Check SentinelHealth for PartialSuccess status with code 'EntitiesDroppedDueToMappingIssues'. Val... | 🟢 8.5 | ADO Wiki |
| 7 | Sentinel scheduled analytic rule fires late or shows IngestionDelay status -- alerts/incidents ar... | Data ingestion to Log Analytics was delayed. The analytic rule initially returned 0 results, then... | 1) Check SentinelHealth: SentinelHealth / where OperationName=='Scheduled analytics rule run' / w... | 🟢 8.5 | ADO Wiki |
| 8 | Sentinel analytic rule was automatically disabled -- rule stops running without manual intervention | Auto-disable triggers include: target workspace deleted, target table deleted, Sentinel removed f... | 1) Check rule description for disable reason. 2) Query SentinelHealth: SentinelHealth / where Sen... | 🟢 8.5 | ADO Wiki |
| 9 | Sentinel analytic rule entities not appearing in SecurityAlert -- entity mappings configured but ... | V3 entity parsing failure during alert creation. The entity row data does not match the expected ... | Query SecurityInsightsProd Kusto cluster: Log / where body startswith 'Failed to build V3 entity ... | 🟢 8.5 | ADO Wiki |
| 10 | Sentinel alerts from the same analytic rule are not being grouped into a single incident despite ... | Each alert has a different UniqueGroupingIdentifier (UGI) because the entities differ between ale... | Query SecurityInsightsProd Kusto cluster ServiceFabricOperations table: filter by GetUniqueGroupi... | 🟢 8.5 | ADO Wiki |
| 11 | Watchlist not deleted after delete operation - _GetWatchlist still returns data even though custo... | Delete operation writes logs in LAW marking each Watchlist ItemStatus from Create to Delete. If t... | 1) Check Activity Logs for microsoft.securityinsights/watchlists/delete operation completion usin... | 🟢 8.5 | ADO Wiki |
| 12 | Error when creating or updating Sentinel analytic rule via REST API (Management API), possibly et... | For new rules: including name, etag, or type in the request body causes conflicts (name comes fro... | For creating new rules: exclude name, etag, and type from the request body - name is derived from... | 🟢 8.5 | ADO Wiki |
| 13 | Customer wants to exceed the 512 scheduled analytic rules limit in Microsoft Sentinel | Microsoft Sentinel has a default limit of 512 scheduled analytic rules per workspace. This limit ... | 1) First evaluate if 512+ rules are truly needed. 2) Transition the workspace to a dedicated Log ... | 🟢 8.5 | ADO Wiki |
| 14 | Analytic rules and hunting queries not visible after executing Content Hub centralization tool; i... | Alert rules created from legacy gallery content lack metadata that Content Hub uses to track inst... | Delete the existing active alert rules that were created from gallery content and recreate them f... | 🟢 8.5 | ADO Wiki |
| 15 | Custom detection rules or link-to-incident only works on primary workspace in Sentinel USX multi ... | By design custom detections with Sentinel/alerts tables (AlertInfo, AlertEvidence) only allowed o... | Switch to primary workspace using workspace selector and retry. For secondary workspaces link-to-... | 🟢 8.5 | ADO Wiki |
| 16 ⚠️ | Defender XDR custom detection rule silently fails to save due to KQL query syntax errors | Detection rule creation fails without detailed validation feedback when query has syntax errors | Run query manually in advanced hunting first to verify syntax and results before creating detecti... | 🔵 5.0 | MS Learn |
