# DEFENDER Sentinel 分析规则与检测 — Troubleshooting Quick Reference

**Entries**: 16 | **21V**: 15/16 applicable
**Sources**: ado-wiki, mslearn | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/sentinel-analytics-rules.md)

## Symptom Quick Reference

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
| 16 | Defender XDR custom detection rule silently fails to save due to KQL query syntax errors | Detection rule creation fails without detailed validation feedback when query has syntax errors | Run query manually in advanced hunting first to verify syntax and results before creating detecti... | 🔵 5.0 | MS Learn |

## Quick Troubleshooting Path

1. Check SentinelHealth data table to query analytic rule health logs (e.g. SentinelHealth / where Status == 'Warning'). Health record Description shows 'Rule failed to run on multiple occasions and h... `[Source: ADO Wiki]`
2. Deploy required ASIM parsers manually using ARM templates. Refer to 'List of Microsoft Sentinel ASIM parsers' documentation at https://docs.microsoft.com/en-us/azure/sentinel/normalization-parsers-... `[Source: ADO Wiki]`
3. Set the analytic rule lookback time to be longer than the refresh interval of the underlying tables (Watchlist, ConfidentialWatchlist, ThreatIndicator). For watchlist-based rules, ensure the lookba... `[Source: ADO Wiki]`
4. Query the SentinelAudit table: SentinelAudit / where SentinelResourceType == 'Analytic Rule' / where ExtendedProperties contains '<ruleId>' -- extend CallerName, CallerIpAddress, OriginalResourceSt... `[Source: ADO Wiki]`
5. Access the alert ExtendedProperties: 'OriginalQuery' shows the user rule query; 'Query' contains a base64 representation of the exact triggering row. Decode the Query field to retrieve the specific... `[Source: ADO Wiki]`
