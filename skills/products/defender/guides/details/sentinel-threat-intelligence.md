# DEFENDER Sentinel 威胁情报 — Comprehensive Troubleshooting Guide

**Entries**: 29 | **Draft sources**: 28 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-adls-gen2-federation-tsg.md, ado-wiki-a-calculating-la-workspace-allowance.md, ado-wiki-a-databricks-federation-tsg.md, ado-wiki-a-exclusion-correlation-engine-tsg.md, ado-wiki-a-fabric-federation-tsg.md, ado-wiki-a-mdc-resource-based-usage-calculation.md, ado-wiki-a-mepm-integration-azure-tsg.md, ado-wiki-a-multi-workspace-tsg.md, ado-wiki-a-ti-flat-file-how-to-find-id.md, ado-wiki-a-ti-upload-indicators-api.md
  ... and 18 more
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Threat Intelligence
> Sources: ado-wiki

**1. Using Microsoft Graph API (tiIndicators-post) to delete Threat Intelligence indicators from Microsoft Sentinel fails with error: "'Warning': '199 - Microsoft/Microsoft Defender ATP/405/7', 199 - 'Micr**

- **Root Cause**: The Graph API for TI indicator deletion does not support the 'targetProduct' parameter. By default it targets Microsoft Defender ATP, not Sentinel. Graph API delete endpoints are not ready to delete TI indicators from Sentinel.
- **Solution**: Use the Sentinel-native REST API instead: 1) List indicators via 'Threat Intelligence Indicator - Query Indicators' API (https://learn.microsoft.com/en-us/rest/api/securityinsights/stable/threat-intelligence-indicator/query-indicators), 2) Delete each using 'Threat Intelligence Indicator - Delete' API by indicator name. Alternatively, manually delete from the Threat Intelligence blade in Azure Sentinel portal.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Deleted or revoked Threat Intelligence indicators reappear in the ThreatIntelligenceIndicator table in Log Analytics workspace after being deleted from Microsoft Sentinel**

- **Root Cause**: Sentinel republishes 1/12th of all TI indicators daily (full cycle every 12 days) to keep them available for analytics rules. Creating or deleting each indicator creates a log entry in the ThreatIntelligenceIndicator table. Republishing updates the TimeGenerated field, making it appear as new data.
- **Solution**: Indicators stop being republished only when: 1) They are marked revoked=true, 2) They are deleted via the Sentinel TI API, or 3) Their valid_until date has passed. Verify deletion was successful via the Sentinel REST API. Wait up to 12 days for republishing cycle to complete after proper deletion.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. After removing a TAXII collection ID from the Threat Intelligence TAXII data connector in Microsoft Sentinel, the ThreatIntelligenceIndicator table appears to continue ingesting new data for that coll**

- **Root Cause**: Removing the TAXII collection ID only stops ingestion of new indicators. Previously ingested indicators remain in the workspace and are republished every 12 days (1/12th daily), updating the TimeGenerated field. This makes it appear as if new data is still being ingested from the removed collection.
- **Solution**: Explain to the customer that this is expected behavior due to the TI republishing mechanism. The 'new' data is actually existing indicators being republished. To fully remove indicators: manually delete them from the Threat Intelligence blade in Sentinel. Republishing cost is approximately $2.50 per million events monthly. If customer wants to stop republishing cost, they must delete the actual indicators.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. TAXII data connector in Microsoft Sentinel fails to connect with error: 'One or more errors occurred. (TAXII API root URL or collection id is not valid)' seen in backend telemetry via SecurityInsights**

- **Root Cause**: The TAXII API root URL or collection ID provided in the connector configuration does not conform to the OASIS TAXII v2.0/v2.1 specification, or the TAXII server is not responding correctly at the configured endpoints.
- **Solution**: 1) Verify TAXII URL structure per OASIS spec (https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html). 2) Test connectivity using curl: For TAXII 2.0: `curl -u <user>:<pass> <ApiRoot>/collections/<CollectionId> -H 'Accept: application/vnd.oasis.taxii+json; version=2.0'`. For TAXII 2.1: `curl -u <user>:<pass> <ApiRoot>/collections/<CollectionId> -H 'Accept: application/taxii+json; version=2.1'`. 3) Check backend telemetry with Kusto: `cluster('SecurityInsights').database('SecurityInsightsProd').ServiceFabricDynamicOE | where customData contains '<workspaceId>' | where operationName contains 'TaxiiConnectorHandler'`
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Microsoft Threat Intelligence Analytics rule is not enabled or not showing in Active Rules tab in Sentinel Analytics**

- **Root Cause**: The rule template has not been created as an active rule, or the existing rule has been disabled
- **Solution**: Navigate to Sentinel > Analytics > Rule templates, search for 'Microsoft Threat Intelligence Analytics' (filter by Rule Type='Threat Intelligence'), click Create Rule with Status=Enabled. If rule exists in Active Rules but is disabled, right-click to enable it. If no matches appear after 40 minutes, open ICM to USX Threat Intelligence/Threat Intelligence team with WorkspaceID and time window. Note: analytics rule runs every 15 mins; first-time CEF import + rule enable may take 30 mins for matching to begin.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Threat Intelligence Matching Analytics rule is enabled but alerts and incidents are not being generated in Microsoft Sentinel**

- **Root Cause**: CEF logs are not flowing into the workspace or the RequestURL field is not mapped correctly in CommonSecurityLog
- **Solution**: Run KQL: CommonSecurityLog | where TimeGenerated > ago(1h) and not(isempty(RequestURL)) to verify CEF logs with valid RequestURL are ingested. If no results, check CEF connector status and RequestURL field mapping. If logs flow correctly but still no alerts, escalate ICM to USX Threat Intelligence/Threat Intelligence with WorkspaceID, CEF connector enable time, rule enable time, and expected observable details.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. Threat Intelligence Matching Analytics rule is enabled and generates incidents, but the matched indicator is not available in ThreatIntelligenceIndicator Log Analytics table**

- **Root Cause**: The indicator may have expired from Log Analytics (retention ~1 month) or the KQL query time range is too narrow (default 7 days misses older indicators). Indicators from matching are ingested with SourceSystem='MicrosoftTIDetection' and are not re-sent with each match.
- **Solution**: Run KQL: ThreatIntelligenceIndicator | where TimeGenerated > ago(32d) and SourceSystem == 'MicrosoftTIDetection' to search with a 32-day window (indicators expire in ~1 month). If results found, guide customer on searching/filtering indicators in LA. If no results, escalate ICM to USX Threat Intelligence/Threat Intelligence with WorkspaceID, query timestamp, and freshest alert timestamp.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. Customer queries Threat Intelligence indicators via Microsoft Graph Security API but receives empty results despite indicators being uploaded through a TIP or automated process**

- **Root Cause**: Graph Security API serves TI data by TenantID+AppID combination. If indicators were uploaded using one AppID (e.g., automated TIP integration) but queried using a different AppID or user auth token, the API returns empty results. This is by design for data isolation between TI providers.
- **Solution**: Ensure the same Application ID (AppID) registered in AAD is used for both uploading and querying threat intelligence indicators. If an automated process uses a registered app to upload TI, queries must also authenticate with the same app credentials, not a user personal auth token. TI has 1-year retention in Graph backend.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**9. Customer inquires about ThreatIntelligenceIndicator table deprecation, receives notification about transitioning to new TI data model, or requests to extend dual ingestion period for legacy table**

- **Root Cause**: Microsoft is transitioning from legacy ThreatIntelligenceIndicator table to new ThreatIntelIndicators and ThreatIntelObjects tables. Public Preview: March 31 2025, GA: July 31 2025 (exclusive ingestion to new tables), End of dual ingestion: May 31 2026. Billing occurs for both tables during dual ingestion.
- **Solution**: Customer should transition custom content (workbooks, queries, analytic rules) to new ThreatIntelIndicators/ThreatIntelObjects tables by July 31, 2025. To extend dual ingestion: Azure portal -> Sentinel workspace -> Support + Troubleshooting (?) -> New support request -> Technical -> select 'Extend ingestion timeframe for ThreatIntelligenceIndicator table'. Escalate to USX Threat Intelligence/Threat Intelligence PG queue with workspace ID and reason. SAP in DfM: Azure/Microsoft Sentinel/Extend ingestion timeframe for ThreatIntelligenceIndicator table.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**10. Not all TAXII Server values showing in Source filter on Sentinel Threat Intelligence Blade**

- **Root Cause**: Data not flowing through one or more connected TAXII servers, or source filter not reflecting all connected TAXII server friendly names
- **Solution**: Navigate to Sentinel > Threat Intelligence (Preview). Run KQL: ThreatIntelligenceIndicator | where SourceSystem == '<Friendly name of TAXII server>' to verify data exists for the missing source. If no data returned, check TAXII server connectivity and data flow on Data Connectors page. If data exists but filter still missing, escalate via ICM to USX Threat Intelligence / Threat Intelligence team with Tenant ID, Workspace ID, region info, and screenshots.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**11. Filtering on Sentinel Threat Intelligence Blade is not working as expected**

- **Root Cause**: Backend request processing issue in ResourceProvider service for ThreatIntelligence operations
- **Solution**: Query ServiceFabricDynamicOE in SecurityInsightsProd (securityinsights.kusto.windows.net): filter by applicationName contains 'ResourceProvider', customData contains customer workspace name, operationName contains 'ThreatIntelligence'. Use rootOperationId from matching log to trace full call stack. If issue persists, escalate via ICM to USX Threat Intelligence team with Tenant/Workspace ID, region, and Kusto logs.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**12. Connected TAXII data connector to Sentinel workspace but threat intelligence data is never received or stopped after initial connection**

- **Root Cause**: TAXII server collection may have no new indicators available, or pipeline issue between TAXII server and Sentinel ingestion
- **Solution**: Step 1: Verify on TAXII Data Connectors page - check last indicator received time in table and graph. Step 2: Use CURL to validate TAXII server collection has new indicators - enumerate collections and get objects from collection endpoint, check 'created' and 'modified' timestamps. If no new indicators in collection, inform customer and close. If indicators exist but not in workspace, escalate via ICM to USX Threat Intelligence team with Tenant/Workspace ID, region, connector screenshots, and CURL output.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**13. Threat Intelligence matching analytics rule is enabled but no alerts or incidents are being generated**

- **Root Cause**: CEF logs not flowing into workspace or RequestURL field not mapped correctly in CommonSecurityLog, preventing indicator matching
- **Solution**: Verify rule is enabled. Check CEF log flow: CommonSecurityLog | where TimeGenerated > ago(1h) and not(isempty(RequestURL)). If no results with valid RequestURL, check CEF field mapping. Also verify Syslog and DNS logs. Note: TI matching analytics rule runs every 15 mins. If issue persists, escalate via ICM to USX Threat Intelligence team with WorkspaceID, time window, and expected observable.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**14. Threat Intelligence matching analytics rule generates incidents but matched indicator not found in ThreatIntelligenceIndicator Log Analytics table**

- **Root Cause**: Indicators expire from Log Analytics after approximately 1 month and are not re-sent with each match; default 7-day query range misses older indicators
- **Solution**: Query with extended time range: ThreatIntelligenceIndicator | where TimeGenerated > ago(32d) and SourceSystem == 'Microsoft Threat Intelligence Analytics'. Use 32-day window because indicators expire after ~1 month. If results found, guide customer to search within this timeframe. If no results, escalate via ICM to USX Threat Intelligence team with WorkspaceID, time window, and expected observable.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**15. Unexpected Threat Intelligence indicators from unknown or unintended sources appearing in Microsoft Sentinel workspace, despite no connector configured for that source**

- **Root Cause**: Old TI indicators without expiry dates are automatically re-ingested every 7-10 days; previously removed connectors may have left behind indicator resources that persist indefinitely
- **Solution**: Verify active TI connectors in Sentinel; check indicator creation date and expiry in Threat Intelligence blade; delete unwanted indicators from UI to stop future re-ingestion; use TI Ingestion Rules feature to filter sources; disable/reconfigure associated connectors. Note: cannot determine original ingestion source for very old indicators as logs are not retained long-term
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**16. Deleted TI indicators from Sentinel Threat Intelligence blade but indicator data still present in Log Analytics table**

- **Root Cause**: Deleting indicator resources from the UI only stops future re-ingestion cycles; already-ingested data in Log Analytics workspace is not automatically removed
- **Solution**: Data remains in Log Analytics until manually purged or retention period expires; use Log Analytics purge API to remove specific data if needed; deleting from UI prevents future 7-10 day re-ingestion cycle
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**17. TI flat file import shows not-imported status with no error report available in Sentinel manage imports blade**

- **Root Cause**: Internal server-side error occurred during file processing; not related to indicator data validity
- **Solution**: Retry uploading the file at a later time; if issue persists, open IcM (Owning Service: USX Threat Intelligence, Team: Threat Intelligence) with the file ID obtained from browser dev tools network tab
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**18. TI flat file upload shows success notification but indicators are not visible in Microsoft Sentinel**

- **Root Cause**: The upload success notification only confirms file upload to the service, not successful ingestion into Sentinel; file may still be in in-progress status in the manage imports blade
- **Solution**: Check manage imports blade for actual file ingestion status; file upload notification does not equal ingestion completion; wait for status to change from in-progress to fully-ingested
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**19. TI flat file marked as fully-ingested or partially-ingested in manage imports but indicators not showing in Sentinel indicator grid**

- **Root Cause**: Indicators take approximately 5 minutes to appear in the indicator grid after successful ingestion; if still missing after this period, it indicates a backend processing issue
- **Solution**: Wait ~5 minutes after ingestion completes; if still not visible, open IcM (USX Threat Intelligence / Threat Intelligence) with file ID; specify whether indicators are missing from Sentinel, Log Analytics, or both; verify Log Analytics using KQL: ThreatIntelligenceIndicator | where TimeGenerated > ago(7d) | where SourceSystem == 'fileName'
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**20. Threat Intelligence connector issue that does not match known TAXII or TIP data connector patterns**

- **Root Cause**: Various backend failures in TaxiiConnectorHandler or ResourceProvider service requiring Kusto log investigation
- **Solution**: Query SecurityInsightsProd Kusto: ServiceFabricDynamicOE | where env_time > ago(5d) and resultType == 'Failure' | where customData contains '<workspaceId>' | where operationName contains 'TaxiiConnectorHandler'. Use rootOperationId to get full call stack. Escalate via ICM to USX Threat Intelligence team with Tenant/Workspace ID, region, Kusto logs, and screenshots.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 2: Taxii Export
> Sources: ado-wiki

**1. Cannot export threat intelligence via TAXII Export; connection to destination TAXII server fails or is blocked**

- **Root Cause**: The TAXII export service IPs are not on the customer's firewall allow list
- **Solution**: Provide the customer with the official documentation listing the service IPs that need to be added to the firewall allow list
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. Exported threat intelligence not visible on 'view export history' table; subsequent export operations appear paused**

- **Root Cause**: A previous bulk export operation failed, causing all subsequent bulk operations to be paused until the failed operation is resolved
- **Solution**: Select any TI object and click Export; if warning about failed bulk action appears, click the link to navigate to bulk operations history and delete the failed bulk action. Subsequent exports will then resume
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**3. TAXII server rejects exported threat intelligence objects; export shows Failure/CouldNotDetermine status in LA logs**

- **Root Cause**: Destination TAXII server is not fully STIX/TAXII 2.1 compliant or has custom field mappings (e.g., OpenCTI uses 'score' instead of 'confidence')
- **Solution**: Verify the destination TAXII server's STIX/TAXII 2.1 compliance; configure any server-specific field mappings. Sentinel follows official STIX v2.1 protocol
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**4. MDTI (Microsoft Defender Threat Intelligence) objects fail to export to certain platforms like Cyware**

- **Root Cause**: MDTI objects generated before 23 October 2024 have an incorrect extension format that causes export failure on some platforms
- **Solution**: Only export MDTI objects generated on or after 23 October 2024; older objects with incorrect extensions will fail upon export to platforms like Cyware
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**5. Exported STIX objects rejected by strict TAXII servers (e.g., OpenCTI) due to non-compliant UUID in STIX ID**

- **Root Cause**: TI objects created within Sentinel have STIX IDs that do not conform to UUID v5 standard; strict destination servers reject non-compliant IDs
- **Solution**: Enable the 'transform IDs' export rule in the TI Export connector settings to automatically convert non-compliant IDs to UUID v5 on export. The original ID is retained in external_references of the exported STIX object
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 3: Taxii
> Sources: ado-wiki

**1. Microsoft Sentinel TAXII connector connected to workspace but no data received, or data stopped flowing after initial connection**

- **Root Cause**: No new threat indicators exist in the TAXII server collection after the last import time, or an ingestion pipeline issue on the Sentinel side
- **Solution**: 1) Verify on the TAXII Data Connectors page that indicators are flowing (check last indicator received time). 2) Use CURL to query the TAXII server collection directly (TAXII 2.0: Accept header 'application/vnd.oasis.taxii+json; version=2.0'; TAXII 2.1: 'application/taxii+json; version=2.1'). 3) If no indicators in the collection -> inform customer, close ticket. 4) If indicators exist but not ingested -> open ICM to 'USX Threat Intelligence / Threat Intelligence' team with Tenant ID, Workspace ID, regions, screenshots of data import graph and CURL output. Testing: use Pulsedive free TAXII feed (https://pulsedive.com/api/taxii) with API root https://pulsedive.com/taxii2/api/ and collection 981c4916-ebb2-4567-aece-54ae970c4230
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. TI event feeds from ANOMALI TAXII connector not parsing correctly in Sentinel; Confidence score appears inside ThreatType field instead of as a separate column**

- **Root Cause**: TAXII server uses STIX 2.0 protocol which has no 'confidence' field. The server puts confidence in the 'labels' field, which Sentinel maps to ThreatType. Sentinel sees confidence as NULL/Not Set since STIX 2.0 lacks a dedicated confidence field
- **Solution**: 1) Verify the TAXII protocol version: check JARVIS logs for 'TAXIIClientFactory.TryCreateTAXIIClientAsync' message showing 'succeeded with version=2.0'. 2) Query the server directly via CURL to confirm indicators lack a confidence field in raw STIX 2.0 output. 3) Resolution: customer must use STIX 2.1/TAXII 2.1 which has native 'confidence' (integer 0-100) and 'indicator_types' fields. 4) If server only supports 2.0, this is expected behavior (by design) - confidence will remain embedded in ThreatType
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 4: Interflow
> Sources: ado-wiki

**1. Customer receives MDC security alert referencing Microsoft Threat Intelligence or Threat Intelligence feeds (suspicious IP address alert) and wants to know why the IP is flagged**

- **Root Cause**: The IP address is flagged in the Interflow (internal Microsoft Threat Intelligence) database as a known threat indicator
- **Solution**: FTE-only: Look up the IP at https://aka.ms/interflowweb (request TiUsersCG-Prod role via CoreIdentity if access denied, ~24h wait). Verify isActive=True and review indicator details. Do NOT share provider names (Cymru, OpenPhish) or Interflow details with customer. For suspected false positives: select records, click Give Feedback, submit FP reason - indicators quarantined within minutes. Email sipsapialerts@microsoft.com to follow up. CSG/DP: work with an FTE to perform this lookup.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 5: Connector
> Sources: ado-wiki

**1. Sentinel TAXII Threat Intelligence connector shows Forbidden/Unauthorized, NotFound, or InternalServerError health errors.**

- **Root Cause**: Forbidden/Unauthorized: TAXII server credentials are invalid or expired. NotFound: TAXII server endpoint URL or collection ID is incorrect. InternalServerError: TAXII server is down.
- **Solution**: Forbidden/Unauthorized: Verify and update credentials for the TAXII server. NotFound: Verify the TAXII server URL and collection ID in connector settings. InternalServerError: Check that the TAXII server is operational. PaymentRequired: Check throttling limits and ensure polling frequency does not exceed them.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer receives MDC security alert referencing Microsoft Threat Intelligence or Threat Intellig... | The IP address is flagged in the Interflow (internal Microsoft Threat Intelligence) database as a... | FTE-only: Look up the IP at https://aka.ms/interflowweb (request TiUsersCG-Prod role via CoreIden... | 🟢 8.5 | ADO Wiki |
| 2 | Sentinel TAXII Threat Intelligence connector shows Forbidden/Unauthorized, NotFound, or InternalS... | Forbidden/Unauthorized: TAXII server credentials are invalid or expired. NotFound: TAXII server e... | Forbidden/Unauthorized: Verify and update credentials for the TAXII server. NotFound: Verify the ... | 🟢 8.5 | ADO Wiki |
| 3 | Microsoft Sentinel TAXII connector connected to workspace but no data received, or data stopped f... | No new threat indicators exist in the TAXII server collection after the last import time, or an i... | 1) Verify on the TAXII Data Connectors page that indicators are flowing (check last indicator rec... | 🟢 8.5 | ADO Wiki |
| 4 | TI event feeds from ANOMALI TAXII connector not parsing correctly in Sentinel; Confidence score a... | TAXII server uses STIX 2.0 protocol which has no 'confidence' field. The server puts confidence i... | 1) Verify the TAXII protocol version: check JARVIS logs for 'TAXIIClientFactory.TryCreateTAXIICli... | 🟢 8.5 | ADO Wiki |
| 5 | Using Microsoft Graph API (tiIndicators-post) to delete Threat Intelligence indicators from Micro... | The Graph API for TI indicator deletion does not support the 'targetProduct' parameter. By defaul... | Use the Sentinel-native REST API instead: 1) List indicators via 'Threat Intelligence Indicator -... | 🟢 8.5 | ADO Wiki |
| 6 | Deleted or revoked Threat Intelligence indicators reappear in the ThreatIntelligenceIndicator tab... | Sentinel republishes 1/12th of all TI indicators daily (full cycle every 12 days) to keep them av... | Indicators stop being republished only when: 1) They are marked revoked=true, 2) They are deleted... | 🟢 8.5 | ADO Wiki |
| 7 | After removing a TAXII collection ID from the Threat Intelligence TAXII data connector in Microso... | Removing the TAXII collection ID only stops ingestion of new indicators. Previously ingested indi... | Explain to the customer that this is expected behavior due to the TI republishing mechanism. The ... | 🟢 8.5 | ADO Wiki |
| 8 | TAXII data connector in Microsoft Sentinel fails to connect with error: 'One or more errors occur... | The TAXII API root URL or collection ID provided in the connector configuration does not conform ... | 1) Verify TAXII URL structure per OASIS spec (https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii... | 🟢 8.5 | ADO Wiki |
| 9 | Microsoft Threat Intelligence Analytics rule is not enabled or not showing in Active Rules tab in... | The rule template has not been created as an active rule, or the existing rule has been disabled | Navigate to Sentinel > Analytics > Rule templates, search for 'Microsoft Threat Intelligence Anal... | 🟢 8.5 | ADO Wiki |
| 10 | Threat Intelligence Matching Analytics rule is enabled but alerts and incidents are not being gen... | CEF logs are not flowing into the workspace or the RequestURL field is not mapped correctly in Co... | Run KQL: CommonSecurityLog / where TimeGenerated > ago(1h) and not(isempty(RequestURL)) to verify... | 🟢 8.5 | ADO Wiki |
| 11 | Threat Intelligence Matching Analytics rule is enabled and generates incidents, but the matched i... | The indicator may have expired from Log Analytics (retention ~1 month) or the KQL query time rang... | Run KQL: ThreatIntelligenceIndicator / where TimeGenerated > ago(32d) and SourceSystem == 'Micros... | 🟢 8.5 | ADO Wiki |
| 12 | Customer queries Threat Intelligence indicators via Microsoft Graph Security API but receives emp... | Graph Security API serves TI data by TenantID+AppID combination. If indicators were uploaded usin... | Ensure the same Application ID (AppID) registered in AAD is used for both uploading and querying ... | 🟢 8.5 | ADO Wiki |
| 13 | Customer inquires about ThreatIntelligenceIndicator table deprecation, receives notification abou... | Microsoft is transitioning from legacy ThreatIntelligenceIndicator table to new ThreatIntelIndica... | Customer should transition custom content (workbooks, queries, analytic rules) to new ThreatIntel... | 🟢 8.5 | ADO Wiki |
| 14 | Not all TAXII Server values showing in Source filter on Sentinel Threat Intelligence Blade | Data not flowing through one or more connected TAXII servers, or source filter not reflecting all... | Navigate to Sentinel > Threat Intelligence (Preview). Run KQL: ThreatIntelligenceIndicator / wher... | 🟢 8.5 | ADO Wiki |
| 15 | Filtering on Sentinel Threat Intelligence Blade is not working as expected | Backend request processing issue in ResourceProvider service for ThreatIntelligence operations | Query ServiceFabricDynamicOE in SecurityInsightsProd (securityinsights.kusto.windows.net): filter... | 🟢 8.5 | ADO Wiki |
| 16 | Connected TAXII data connector to Sentinel workspace but threat intelligence data is never receiv... | TAXII server collection may have no new indicators available, or pipeline issue between TAXII ser... | Step 1: Verify on TAXII Data Connectors page - check last indicator received time in table and gr... | 🟢 8.5 | ADO Wiki |
| 17 | Threat Intelligence matching analytics rule is enabled but no alerts or incidents are being gener... | CEF logs not flowing into workspace or RequestURL field not mapped correctly in CommonSecurityLog... | Verify rule is enabled. Check CEF log flow: CommonSecurityLog / where TimeGenerated > ago(1h) and... | 🟢 8.5 | ADO Wiki |
| 18 | Threat Intelligence matching analytics rule generates incidents but matched indicator not found i... | Indicators expire from Log Analytics after approximately 1 month and are not re-sent with each ma... | Query with extended time range: ThreatIntelligenceIndicator / where TimeGenerated > ago(32d) and ... | 🟢 8.5 | ADO Wiki |
| 19 | Unexpected Threat Intelligence indicators from unknown or unintended sources appearing in Microso... | Old TI indicators without expiry dates are automatically re-ingested every 7-10 days; previously ... | Verify active TI connectors in Sentinel; check indicator creation date and expiry in Threat Intel... | 🟢 8.5 | ADO Wiki |
| 20 | Deleted TI indicators from Sentinel Threat Intelligence blade but indicator data still present in... | Deleting indicator resources from the UI only stops future re-ingestion cycles; already-ingested ... | Data remains in Log Analytics until manually purged or retention period expires; use Log Analytic... | 🟢 8.5 | ADO Wiki |
| 21 | TI flat file import shows not-imported status with no error report available in Sentinel manage i... | Internal server-side error occurred during file processing; not related to indicator data validity | Retry uploading the file at a later time; if issue persists, open IcM (Owning Service: USX Threat... | 🟢 8.5 | ADO Wiki |
| 22 | TI flat file upload shows success notification but indicators are not visible in Microsoft Sentinel | The upload success notification only confirms file upload to the service, not successful ingestio... | Check manage imports blade for actual file ingestion status; file upload notification does not eq... | 🟢 8.5 | ADO Wiki |
| 23 | TI flat file marked as fully-ingested or partially-ingested in manage imports but indicators not ... | Indicators take approximately 5 minutes to appear in the indicator grid after successful ingestio... | Wait ~5 minutes after ingestion completes; if still not visible, open IcM (USX Threat Intelligenc... | 🟢 8.5 | ADO Wiki |
| 24 | Threat Intelligence connector issue that does not match known TAXII or TIP data connector patterns | Various backend failures in TaxiiConnectorHandler or ResourceProvider service requiring Kusto log... | Query SecurityInsightsProd Kusto: ServiceFabricDynamicOE / where env_time > ago(5d) and resultTyp... | 🔵 7.5 | ADO Wiki |
| 25 | Cannot export threat intelligence via TAXII Export; connection to destination TAXII server fails ... | The TAXII export service IPs are not on the customer's firewall allow list | Provide the customer with the official documentation listing the service IPs that need to be adde... | 🔵 5.5 | ADO Wiki |
| 26 | Exported threat intelligence not visible on 'view export history' table; subsequent export operat... | A previous bulk export operation failed, causing all subsequent bulk operations to be paused unti... | Select any TI object and click Export; if warning about failed bulk action appears, click the lin... | 🔵 5.5 | ADO Wiki |
| 27 | TAXII server rejects exported threat intelligence objects; export shows Failure/CouldNotDetermine... | Destination TAXII server is not fully STIX/TAXII 2.1 compliant or has custom field mappings (e.g.... | Verify the destination TAXII server's STIX/TAXII 2.1 compliance; configure any server-specific fi... | 🔵 5.5 | ADO Wiki |
| 28 | MDTI (Microsoft Defender Threat Intelligence) objects fail to export to certain platforms like Cy... | MDTI objects generated before 23 October 2024 have an incorrect extension format that causes expo... | Only export MDTI objects generated on or after 23 October 2024; older objects with incorrect exte... | 🔵 5.5 | ADO Wiki |
| 29 | Exported STIX objects rejected by strict TAXII servers (e.g., OpenCTI) due to non-compliant UUID ... | TI objects created within Sentinel have STIX IDs that do not conform to UUID v5 standard; strict ... | Enable the 'transform IDs' export rule in the TI Export connector settings to automatically conve... | 🔵 5.5 | ADO Wiki |
