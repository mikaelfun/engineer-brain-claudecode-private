# DEFENDER Sentinel 事件调查与 Hunting — Comprehensive Troubleshooting Guide

**Entries**: 37 | **Draft sources**: 10 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-alerts-incidents-telemetry.md, ado-wiki-a-how-to-export-incident.md, ado-wiki-a-m365-defender-incident-integration-tsg.md, ado-wiki-a-r3-microsoft-graph-for-security-support.md, ado-wiki-b-hunting-custom-graph-tsg.md, ado-wiki-b-mdc-advanced-hunting-tables-tsg.md, ado-wiki-b-r1-network-alerts-investigation.md, ado-wiki-b-support-boundaries-advanced-hunting.md, ado-wiki-b-xdr-m365d-advanced-hunting-tsg.md, ado-wiki-d-dns-alerts-investigation.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Sentinel Graph
> Sources: ado-wiki

**1. View blast radius menu item is greyed out in Microsoft Sentinel incident investigation graph**

- **Root Cause**: Tenant is not onboarded to Sentinel Lake & Graph, or user lacks required XDR permissions and Exposure Management read permissions
- **Solution**: Verify tenant is onboarded to Sentinel Lake & Graph. Ensure user has XDR permissions/scopes and Exposure Management read permissions. If permissions were just assigned, wait up to 2 hours for propagation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. No blast radius found message when clicking View blast radius on a node in incident investigation graph**

- **Root Cause**: No progression paths within the organization were found based on currently available data for the selected node. Some nodes (grouped nodes) do not support the blast radius menu option.
- **Solution**: Try a different node to spot lateral movements across entities. If nodes are grouped, toggle off 'Group similar nodes' to view all nodes separately and enable the menu item on individual nodes.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Hunting graph in Microsoft Sentinel is empty or not presented after accessing Advanced Hunting**

- **Root Cause**: Multiple possible causes: 1) Tenant not onboarded to Sentinel Lake & Graph, 2) Graph still being built (up to 24h after initial onboarding), 3) No Defender products deployed/provisioned, 4) Insufficient Defender XDR scope permissions
- **Solution**: 1) Verify Sentinel Lake & Graph onboarding. 2) Wait up to 24h for initial graph build. 3) Deploy Defender products. 4) Check XDR scoping permissions with Security Administrator. 5) Define critical assets to improve graph coverage.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Pre-defined hunting scenario shows 'No paths exist' notification and loading spinner disappears without presenting graph results**

- **Root Cause**: Filters applied to the queries are returning no matching data. May also show 'No paths exist between the specified entities'.
- **Solution**: Clear all filters using the 'Clear' button and re-run the scenario. If notification persists, no data supports visualization. Try different entity combinations. If problem persists, file support ticket.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Custom Graphs: Unable to access custom graphs in tenant - cannot find Graph panel or compute pool in Microsoft Sentinel VS Code extension**

- **Root Cause**: Tenant not onboarded to Custom Graphs during Gated Public Preview, or using outdated VS Code extension, or wrong compute pool selected
- **Solution**: 1) Validate tenant onboarded to Custom Graphs. 2) Install latest Microsoft Sentinel VS Code extension. 3) Select Graph compute pool (Graph pool 32 vcores) not generic notebook pools. Limits: 90 ephemeral/month, 5 persisted, 1500 queries/month on persisted, 4 concurrent ephemeral, 90min session timeout.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Custom Graphs: Notebook session fails to start, cells do not run, or session times out in Microsoft Sentinel VS Code extension**

- **Root Cause**: Wrong compute pool selected (generic notebook pool instead of Graph pool), Spark session initialization delay, or session timed out due to inactivity (>20 minutes)
- **Solution**: 1) Select Graph compute pool (Graph pool 32 vcores). 2) Restart Spark session via first notebook cell. 3) Wait up to 5 min for initialization. 4) Avoid inactivity >20 min. For building timeout (>90min), limit data volume and precompute transformations.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. Data risk graph tab not visible in Microsoft Purview Data Security Investigations (DSI) or Insider Risk Management (IRM)**

- **Root Cause**: Tenant not onboarded to Sentinel Lake and Graph. Onboarding status can be verified via Geneva Actions (Sentinel Graph Provisioning Operations Group > Check SG Tenant). Lake_USX must show Succeeded.
- **Solution**: 1) Check recommended actions in IRM/DSI for onboarding steps. 2) Verify via Geneva Actions: Lake_USX=Succeeded, Graph_DSI/Graph_IRM=Succeeded. If Lake_USX failed, ICM to MSG Tenant Service. Graph_DSI_Optional/Graph_IRM_Optional=Creating has 24h SLA. If onboarding steps missing, tenant may not be eligible.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. Purview DSI/IRM graph is empty or not showing data after onboarding to Sentinel Lake and Graph**

- **Root Cause**: Multiple causes: 1) Recently onboarded - data takes up to 24h, 2) No relevant SharePoint/OneDrive activity in last 30 days, 3) Graph snapshot or Spark job failure, 4) Office Activity connector not enabled
- **Solution**: 1) Wait up to 24h post-onboarding (7 days initial, expanding to 30). 2) Only SharePoint/OneDrive supported. 3) Check Geneva Actions for Graph_DSI_Optional/Graph_IRM_Optional status; if Creating >24h or Failed, ICM to Graph Builder Service. 4) Ensure Office Activity connector enabled. 5) For ENTRA data, configure diagnostic settings. 6) If all correct, ICM to Graph Builder Service.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**9. Cannot see Purview DSI/IRM graph - empty state indicating no access or missing permissions**

- **Root Cause**: User not in required Purview role group. DSI requires 'Purview Data Security Investigations Investigator'. IRM requires 'Purview Insider Risk Management Investigators'.
- **Solution**: Add user to appropriate role group. Only users with sufficient access (e.g., global admin) can see onboarding steps. Note: Sentinel CSS does not support Purview - check Support Boundaries for MSG for collaboration/transfer.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**10. Discrepancies in node information between blast radius view and Hunting or Exposure maps in Microsoft Sentinel Graph**

- **Root Cause**: Cross-team data differences between Sentinel Graph and MSEM (Microsoft Security Exposure Management) components. Known limitation.
- **Solution**: Engage the MSEM team for investigation. Refer to Support Boundaries page for MSG. IcM escalation paths: MSEM Ownership Matrix, Sentinel PG Dev lookup, or Defender Incidents.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**11. Custom Graphs: Error 2201 MissingSASTokenErrorCode - Can't access table graph_kernel in Microsoft Sentinel**

- **Root Cause**: Authorization failure accessing graph kernel table. SAS token missing or expired.
- **Solution**: Retry the operation. Check error logs in VS Code Output pane (Microsoft Sentinel channel). Search CorrelationIDs in Kusto: cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs') - GatewayEvent | where CorrelationId == $CorrelationId.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 2: Advanced Hunting
> Sources: ado-wiki

**1. Customer reports missing data in MDC Advanced Hunting CloudAuditEvents table for specific Azure subscriptions, AWS accounts, or GCP projects**

- **Root Cause**: MDC Advanced Hunting data is scoped per subscription/account/project level, not tenant level. Data only appears for subscriptions where the relevant MDC bundle (ARM, Containers, etc.) is enabled. If the bundle is not enabled on a specific subscription, data will be missing by design.
- **Solution**: 1. Verify data arrival: query CloudAuditEvents with customer TenantId in TeamX InvestigationData cluster (both eastus and westeurope). 2. Check MDC bundle enablement: query GetCurrentEnvironments() in MDCGlobalData to see paying accounts and Plans. 3. Ensure customer has enabled the correct MDC plan (ARM bundle for ARM events, Containers bundle for AKS/EKS/GKE events) on the specific subscription/account/project.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Unable to select cloud resource entity as affected entity when creating a custom detection alert in Advanced Hunting**

- **Root Cause**: Cloud resource affected entity type is not yet supported in Advanced Hunting custom detections. This is a known product limitation currently being worked on by the engineering team.
- **Solution**: Inform customer this is a known limitation. As a workaround, use a User or SPN (Service Principal) affected entity instead of cloud resource entity when creating custom detection alerts.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. A column is visible in Advanced Hunting in the Microsoft 365 Defender security portal but not visible in Log Analytics via the Sentinel/Export Setting**

- **Root Cause**: The column was added to the Advanced Hunting Tables schema repository (InE.HuntingService VirtualSchema) but the corresponding Sentinel/LogAnalytics KQL schema repository (AM-CMS-Artifacts NGSchemas) was not updated by the table provider
- **Solution**: Trace the schema change in the Advanced Hunting repo (InE.HuntingService) using Blame to find the column mapping (e.g. ColumnHeaderEmailSize -> VirtualColumn). Confirm the column is missing in the Sentinel KQL schema (AM-CMS-Artifacts/content/NGSchemas/Sentinel/KQL). Contact the respective table provider and the person who made the change to align schemas. If the column exists in both repos, propagation may take a few weeks.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. MessageUrlInfo, MessageEvents, and MessagePostDeliveryEvents Advanced Hunting tables are not available in Log Analytics or through the XDR connector**

- **Root Cause**: These Advanced Hunting tables are not currently supported by the XDR connector and cannot be exported to Log Analytics; support is on the future roadmap
- **Solution**: No current workaround. These tables are on the roadmap to be added to the XDR connector. Inform the customer this is a known limitation and monitor for future updates.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. User cannot see any Sentinel content (tables, queries, functions) in Microsoft 365 Defender Advanced Hunting page**

- **Root Cause**: Tenant is not eligible or opted-in to Sentinel in M365D, or user is not exposed to the Sentinel workload, or error in onboarding status/permission check
- **Solution**: 1) Verify tenant eligibility using Kusto query on cluster('wcdprod').database('TenantsStoreReplica').TenantsV2 checking SentinelMtpConfigured, SentinelOptedIn, SentinelIsEligible are all true. 2) Check browser TenantContext API call for IsSentinelActive=true and non-empty MtpPermissions. 3) Check if issue is specific to Advanced Hunting or portal-wide. 4) Check onboarding errors via InETraceEvent query filtering UsxTenantContextProvider.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Sentinel tables are not showing up in Microsoft 365 Defender Advanced Hunting schema panel**

- **Root Cause**: Tables may be removed from the Sentinel workspace, intentionally filtered from M365D schema, or there is an error loading schema from Log Analytics
- **Solution**: 1) Verify tenant/user eligibility per permission checks. 2) Check if tables exist in Sentinel workspace. 3) Try querying the table directly (some tables are hidden from schema but queryable). 4) Check schema loading errors via InETraceEvent query filtering LogAnalyticsSchemaProvider with LevelId < 3.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. KQL query containing Sentinel tables or functions fails with error in Microsoft 365 Defender Advanced Hunting portal**

- **Root Cause**: Query uses unsupported tables/functions/operators in M365D (e.g. adx(), workspace() operators), or query is throttled by Advanced Hunting CPU quota, or query resources exceeded
- **Solution**: 1) Verify query works in Sentinel workspace first. 2) Check Known Issues for unsupported features: adx() operator, workspace() operator. 3) Expand functions to check for unsupported operators inside. 4) Check throttling via InETraceEvent query for 'User-submitted query was throttled'. 5) Check full error via HuntingKustoQueriesLog query joining KustoQueriesLog. Narrow lookback time and optimize query operators.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. CloudStorageAggregatedEvents table in Advanced Hunting shows no data or is missing for the customer**

- **Root Cause**: The Defender for Storage per storage account plan is not enabled on the subscription level. CloudStorageAggregatedEvents requires this specific plan to be active.
- **Solution**: Ensure the Defender for Storage per storage account plan is enabled on the subscription level. Once enabled, logs should automatically appear in Advanced Hunting without additional configuration.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 3: Msg
> Sources: ado-wiki

**1. Tenant cannot onboard to Microsoft Sentinel Graph - onboarding banner does not appear or onboarding shows an error**

- **Root Cause**: Tenant does not have a Microsoft Sentinel primary workspace connected to Defender portal, or Sentinel primary workspace is not in the same region as tenant home region. User may also lack required roles (Azure subscription owner for billing, read access to all workspaces).
- **Solution**: 1. Confirm Sentinel primary workspace is connected to Defender portal and is in same region as tenant home region. 2. Verify user has required roles per Sentinel data lake prerequisites docs. 3. If onboarding takes >24h showing setting up message, check Lake onboarding status and escalate via IcM.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. View blast radius menu item is greyed out and not clickable in Incident graph in Microsoft Defender portal**

- **Root Cause**: The tenant is not onboarded successfully to Sentinel Lake and Graph
- **Solution**: 1. Check the onboarding state of the tenant for Sentinel Lake and Graph. 2. Have a user with necessary prerequisites onboard the tenant. 3. For grouped entities, View blast radius is not available by design - ungroup similar nodes by toggling Group similar nodes and select individual ungrouped nodes.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**3. Selecting an entity in Incident graph shows No blast radius found message despite Sentinel Graph being onboarded**

- **Root Cause**: There are no paths to targets within 5 hops based on the information currently available in the graph for that specific entity
- **Solution**: 1. Try other entities in the same incident that show View blast radius option. 2. Check other incidents. 3. Verify user has MSEM reader permissions. 4. If user has device group scope restrictions, certain paths may be hidden - check device group membership.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**4. Predefined scenario query in Hunting graph takes too long or times out after ~8 minutes returning no results**

- **Root Cause**: Very large graph causing query performance degradation, or complex query filters resulting in high execution time
- **Solution**: 1. Remove filters from the predefined scenario query and re-run. 2. Try with a different entity. 3. Try other predefined scenario queries. 4. If issue persists, create IcM/CRI with tenant ID and query details.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**5. Graph does not reflect recently performed changes - nodes, edges or entity information appears outdated in Sentinel Graph / Blast Radius**

- **Root Cause**: Graph data ingestion and processing latency - changes may take up to 24 hours to propagate and fully reflect in the graph
- **Solution**: 1. Confirm if the data change was made less than 24 hours ago - if so, wait for propagation. 2. If data is still not reflected after 24 hours, create an IcM/CRI with tenant ID, entity details, and timestamp of the change.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 4: Xdr
> Sources: mslearn

**1. Advanced hunting query in Microsoft Defender XDR fails with Query exceeded the timeout period error**

- **Root Cause**: Complex queries exceed the maximum allowed execution time defined by advanced hunting limits
- **Solution**: Optimize the query following best practices: reduce time range, use specific table names instead of unions, filter early in the query, avoid expensive operators like join on large datasets, use summarize with specific columns
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Advanced hunting queries blocked with You have exceeded processing resources allocated to this tenant error**

- **Root Cause**: Queries in the tenant exceeded the allocated CPU resources. The service checks CPU usage every 15 minutes and daily, warns at 10% quota usage, and blocks at 100% utilization
- **Solution**: Wait for the next 15-minute or daily CPU cycle to reset. Optimize queries to reduce CPU consumption: reduce data volume, avoid broad time ranges, use efficient operators. The block lifts automatically after the cycle resets
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. SecurityAlert table not found in schema tab when using advanced hunting in unified Microsoft Defender portal with Microsoft Sentinel data**

- **Root Cause**: Known issue: SecurityAlert table is replaced by AlertInfo and AlertEvidence tables in the unified Defender portal, which contain all the alert data
- **Solution**: Use AlertInfo and AlertEvidence tables instead. SecurityAlert can still be used in queries via the advanced hunting editor (not schema tab) to avoid breaking existing Sentinel queries
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 5: Correlation Engine
> Sources: ado-wiki

**1. Incident Correlation settings page does not load, toggle does not respond, coach bubble is stuck, or correlation dropdown in the rule wizard is missing in Defender XDR portal**

- **Root Cause**: UI issues caused by missing Sentinel license (workload not active), browser caching, broken JavaScript bundle, or backend API failures for the settings endpoint
- **Solution**: Check if Sentinel is active on tenant. Ask customer to capture HAR file (F12 > Network > Preserve log > reproduce > Save as HAR). Review HAR for 4xx/5xx to mtpAdvancedFeaturesSetting or AnalyticsRules. For persistent UI bugs escalate to DevHuntingDetections with HAR, browser info, screenshot, tenant ID
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Cannot change per-rule Incident Correlation tag on analytics rule in Sentinel USX - correlation option is greyed out or update fails when changing between Enabled/Disabled/Tenant Default**

- **Root Cause**: User lacks Sentinel Contributor role required for editing analytics rules. Alternatively the rule is a Custom Detection (CD) rule which does not support correlation exclusion - CD rules are always included
- **Solution**: Verify user has Sentinel Contributor and Defender XDR Detection Tuning (Manage) roles. Check if rule is analytics (not Custom Detection). Check API errors via InEHttpRequestLog for AnalyticsRules UpdateAnalyticsRules with StatusCode >= 400. Escalate to DevHuntingDetections with HAR, tenant ID, rule ID
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 6: Incident Response
> Sources: ado-wiki

**1. Customer requests security incident response or investigation for Defender for Cloud alerts**

- **Root Cause**: Out of scope - MDC support covers alerts platform issues (false positives/negatives, dismiss feature), not incident response
- **Solution**: Explain support scope: platform issues only. For incident response, redirect to Microsoft Security Experts (https://www.microsoft.com/security/business/services), customer's own security team, or a third-party IR service.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 7: M365D Integration
> Sources: ado-wiki

**1. Incident/alert correlation differs between Microsoft Defender for Cloud and Microsoft 365 Defender portals; same alerts grouped into different incidents**

- **Root Cause**: By design: alert correlations are honored by M365D only and not synchronized backwards to MDC. Each product maintains its own correlation engine.
- **Solution**: Communicate to customer that this is by design. Incident correlation in M365D may group MDC alerts differently from MDC native grouping. Full bi-directional synchronization is planned for a future release. Currently, M365D is the authoritative source for cross-product incident correlation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 8: Asset Inventory
> Sources: ado-wiki

**1. Customer sees different resource counts in Defender Portal inventory vs Azure Portal inventory**

- **Root Cause**: By design: Azure Portal inventory is based on Recommendations while Defender Portal is based on EKG (Enterprise Knowledge Graph). Defender Portal shows additional resource types (users, identities, k8s, AI assets) and handles deleted resources more optimally. However, not all Azure resources are modeled in EKG.
- **Solution**: Explain the architectural difference: Azure Portal = Recommendations-based, Defender Portal = EKG-based. Some resources appear only in one portal. Defender Portal includes resource types not in Azure Portal (identities, containers, AI assets), while some Azure resources may not be in EKG yet.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 9: Multi Workspace
> Sources: ado-wiki

**1. Significantly more incidents in Microsoft Sentinel Azure portal than in USX portal for same tenant with multi workspace onboarded**

- **Root Cause**: USX incident merge: when XDR correlates two alerts it merges incidents. One gets Redirected status (alerts move to other incident, no longer shows in USX). In Sentinel this appears as closed incident with Redirected tag
- **Solution**: Filter out incidents with Redirected tag in Sentinel portal or only compare open/active incidents. This discrepancy is by design due to USX incident merge functionality
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 10: Arg
> Sources: ado-wiki

**1. Azure Resource Graph (ARG) exported CSV file has more entries than the results shown in the portal query for the same ARG query**

- **Root Cause**: The CSV export functionality relies on correct ARG pagination, which requires the 'id' field to be included in the response. If 'id' is not projected in the query results, pagination behaves incorrectly, causing the CSV to contain more entries than what the portal displays.
- **Solution**: Ensure the 'id' field is explicitly included/projected in the ARG query before exporting to CSV.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 11: Hunting
> Sources: ado-wiki

**1. Hunting livestream feature is no longer available or shows deprecation notice in Microsoft Sentinel (retired mid-March 2026)**

- **Root Cause**: Microsoft deprecated the hunting livestream feature in favor of KQL jobs, analytics rules, and playbooks which offer persistent query results and broader notification options
- **Solution**: Migrate to KQL jobs for monitoring attacker behavior with persistent results in the Sentinel data lake. Use analytics rules with playbook automation for notifications via Teams/email. KQL jobs cost ~$0.005/GB analyzed vs ~$4.30/GB for analytics tier, offering significant savings.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 12: Ueba
> Sources: ado-wiki

**1. Cannot query BehaviorInfo or BehaviorEntities tables in Advanced Hunting - table not found or query returns no results**

- **Root Cause**: Insufficient permissions for Advanced Hunting, tables not yet populated, or incorrect workspace selected in Advanced Hunting query interface
- **Solution**: 1. Ensure user has necessary Advanced Hunting permissions in Defender portal. 2. Verify tables exist by running: BehaviorInfo | take 10. 3. Confirm correct workspace is selected. Note: if customer has existing MDA/MDC behaviors, they will see all behaviors in same query (union behind the scenes).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 13: Data Transformations
> Sources: ado-wiki

**1. Filter and Split transformations applied to XDR tables do not appear to be working in Advanced Hunting within the first 30 days**

- **Root Cause**: Known limitation: transformations applied to XDR tables will not appear in the first 30 days of data in Advanced Hunting. The transformations are applied but only visible after data ages beyond 30 days.
- **Solution**: This is expected behavior. Once the data ages beyond the first 30 days, it will behave normally in Advanced Hunting. Data in Log Analytics is filtered and split as expected immediately. Query from Log Analytics or Azure Sentinel to verify cost savings are being applied. After saving a new rule, it may take up to an hour to take effect.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer requests security incident response or investigation for Defender for Cloud alerts | Out of scope - MDC support covers alerts platform issues (false positives/negatives, dismiss feat... | Explain support scope: platform issues only. For incident response, redirect to Microsoft Securit... | 🟢 8.5 | ADO Wiki |
| 2 | Incident/alert correlation differs between Microsoft Defender for Cloud and Microsoft 365 Defende... | By design: alert correlations are honored by M365D only and not synchronized backwards to MDC. Ea... | Communicate to customer that this is by design. Incident correlation in M365D may group MDC alert... | 🟢 8.5 | ADO Wiki |
| 3 | Customer sees different resource counts in Defender Portal inventory vs Azure Portal inventory | By design: Azure Portal inventory is based on Recommendations while Defender Portal is based on E... | Explain the architectural difference: Azure Portal = Recommendations-based, Defender Portal = EKG... | 🟢 8.5 | ADO Wiki |
| 4 | Customer reports missing data in MDC Advanced Hunting CloudAuditEvents table for specific Azure s... | MDC Advanced Hunting data is scoped per subscription/account/project level, not tenant level. Dat... | 1. Verify data arrival: query CloudAuditEvents with customer TenantId in TeamX InvestigationData ... | 🟢 8.5 | ADO Wiki |
| 5 | Unable to select cloud resource entity as affected entity when creating a custom detection alert ... | Cloud resource affected entity type is not yet supported in Advanced Hunting custom detections. T... | Inform customer this is a known limitation. As a workaround, use a User or SPN (Service Principal... | 🟢 8.5 | ADO Wiki |
| 6 | A column is visible in Advanced Hunting in the Microsoft 365 Defender security portal but not vis... | The column was added to the Advanced Hunting Tables schema repository (InE.HuntingService Virtual... | Trace the schema change in the Advanced Hunting repo (InE.HuntingService) using Blame to find the... | 🟢 8.5 | ADO Wiki |
| 7 | MessageUrlInfo, MessageEvents, and MessagePostDeliveryEvents Advanced Hunting tables are not avai... | These Advanced Hunting tables are not currently supported by the XDR connector and cannot be expo... | No current workaround. These tables are on the roadmap to be added to the XDR connector. Inform t... | 🟢 8.5 | ADO Wiki |
| 8 | User cannot see any Sentinel content (tables, queries, functions) in Microsoft 365 Defender Advan... | Tenant is not eligible or opted-in to Sentinel in M365D, or user is not exposed to the Sentinel w... | 1) Verify tenant eligibility using Kusto query on cluster('wcdprod').database('TenantsStoreReplic... | 🟢 8.5 | ADO Wiki |
| 9 | Sentinel tables are not showing up in Microsoft 365 Defender Advanced Hunting schema panel | Tables may be removed from the Sentinel workspace, intentionally filtered from M365D schema, or t... | 1) Verify tenant/user eligibility per permission checks. 2) Check if tables exist in Sentinel wor... | 🟢 8.5 | ADO Wiki |
| 10 | KQL query containing Sentinel tables or functions fails with error in Microsoft 365 Defender Adva... | Query uses unsupported tables/functions/operators in M365D (e.g. adx(), workspace() operators), o... | 1) Verify query works in Sentinel workspace first. 2) Check Known Issues for unsupported features... | 🟢 8.5 | ADO Wiki |
| 11 | View blast radius menu item is greyed out in Microsoft Sentinel incident investigation graph | Tenant is not onboarded to Sentinel Lake & Graph, or user lacks required XDR permissions and Expo... | Verify tenant is onboarded to Sentinel Lake & Graph. Ensure user has XDR permissions/scopes and E... | 🟢 8.5 | ADO Wiki |
| 12 | No blast radius found message when clicking View blast radius on a node in incident investigation... | No progression paths within the organization were found based on currently available data for the... | Try a different node to spot lateral movements across entities. If nodes are grouped, toggle off ... | 🟢 8.5 | ADO Wiki |
| 13 | Hunting graph in Microsoft Sentinel is empty or not presented after accessing Advanced Hunting | Multiple possible causes: 1) Tenant not onboarded to Sentinel Lake & Graph, 2) Graph still being ... | 1) Verify Sentinel Lake & Graph onboarding. 2) Wait up to 24h for initial graph build. 3) Deploy ... | 🟢 8.5 | ADO Wiki |
| 14 | Pre-defined hunting scenario shows 'No paths exist' notification and loading spinner disappears w... | Filters applied to the queries are returning no matching data. May also show 'No paths exist betw... | Clear all filters using the 'Clear' button and re-run the scenario. If notification persists, no ... | 🟢 8.5 | ADO Wiki |
| 15 | Custom Graphs: Unable to access custom graphs in tenant - cannot find Graph panel or compute pool... | Tenant not onboarded to Custom Graphs during Gated Public Preview, or using outdated VS Code exte... | 1) Validate tenant onboarded to Custom Graphs. 2) Install latest Microsoft Sentinel VS Code exten... | 🟢 8.5 | ADO Wiki |
| 16 | Custom Graphs: Notebook session fails to start, cells do not run, or session times out in Microso... | Wrong compute pool selected (generic notebook pool instead of Graph pool), Spark session initiali... | 1) Select Graph compute pool (Graph pool 32 vcores). 2) Restart Spark session via first notebook ... | 🟢 8.5 | ADO Wiki |
| 17 | Data risk graph tab not visible in Microsoft Purview Data Security Investigations (DSI) or Inside... | Tenant not onboarded to Sentinel Lake and Graph. Onboarding status can be verified via Geneva Act... | 1) Check recommended actions in IRM/DSI for onboarding steps. 2) Verify via Geneva Actions: Lake_... | 🟢 8.5 | ADO Wiki |
| 18 | Purview DSI/IRM graph is empty or not showing data after onboarding to Sentinel Lake and Graph | Multiple causes: 1) Recently onboarded - data takes up to 24h, 2) No relevant SharePoint/OneDrive... | 1) Wait up to 24h post-onboarding (7 days initial, expanding to 30). 2) Only SharePoint/OneDrive ... | 🟢 8.5 | ADO Wiki |
| 19 | Cannot see Purview DSI/IRM graph - empty state indicating no access or missing permissions | User not in required Purview role group. DSI requires 'Purview Data Security Investigations Inves... | Add user to appropriate role group. Only users with sufficient access (e.g., global admin) can se... | 🟢 8.5 | ADO Wiki |
| 20 | Incident Correlation settings page does not load, toggle does not respond, coach bubble is stuck,... | UI issues caused by missing Sentinel license (workload not active), browser caching, broken JavaS... | Check if Sentinel is active on tenant. Ask customer to capture HAR file (F12 > Network > Preserve... | 🟢 8.5 | ADO Wiki |
| 21 | Cannot change per-rule Incident Correlation tag on analytics rule in Sentinel USX - correlation o... | User lacks Sentinel Contributor role required for editing analytics rules. Alternatively the rule... | Verify user has Sentinel Contributor and Defender XDR Detection Tuning (Manage) roles. Check if r... | 🟢 8.5 | ADO Wiki |
| 22 | Significantly more incidents in Microsoft Sentinel Azure portal than in USX portal for same tenan... | USX incident merge: when XDR correlates two alerts it merges incidents. One gets Redirected statu... | Filter out incidents with Redirected tag in Sentinel portal or only compare open/active incidents... | 🟢 8.5 | ADO Wiki |
| 23 | Azure Resource Graph (ARG) exported CSV file has more entries than the results shown in the porta... | The CSV export functionality relies on correct ARG pagination, which requires the 'id' field to b... | Ensure the 'id' field is explicitly included/projected in the ARG query before exporting to CSV. | 🔵 7.5 | ADO Wiki |
| 24 | CloudStorageAggregatedEvents table in Advanced Hunting shows no data or is missing for the customer | The Defender for Storage per storage account plan is not enabled on the subscription level. Cloud... | Ensure the Defender for Storage per storage account plan is enabled on the subscription level. On... | 🔵 7.5 | ADO Wiki |
| 25 | Discrepancies in node information between blast radius view and Hunting or Exposure maps in Micro... | Cross-team data differences between Sentinel Graph and MSEM (Microsoft Security Exposure Manageme... | Engage the MSEM team for investigation. Refer to Support Boundaries page for MSG. IcM escalation ... | 🔵 7.5 | ADO Wiki |
| 26 | Custom Graphs: Error 2201 MissingSASTokenErrorCode - Can't access table graph_kernel in Microsoft... | Authorization failure accessing graph kernel table. SAS token missing or expired. | Retry the operation. Check error logs in VS Code Output pane (Microsoft Sentinel channel). Search... | 🔵 7.5 | ADO Wiki |
| 27 ⚠️ | Advanced hunting query in Microsoft Defender XDR fails with Query exceeded the timeout period error | Complex queries exceed the maximum allowed execution time defined by advanced hunting limits | Optimize the query following best practices: reduce time range, use specific table names instead ... | 🔵 6.0 | MS Learn |
| 28 ⚠️ | Advanced hunting queries blocked with You have exceeded processing resources allocated to this te... | Queries in the tenant exceeded the allocated CPU resources. The service checks CPU usage every 15... | Wait for the next 15-minute or daily CPU cycle to reset. Optimize queries to reduce CPU consumpti... | 🔵 6.0 | MS Learn |
| 29 ⚠️ | SecurityAlert table not found in schema tab when using advanced hunting in unified Microsoft Defe... | Known issue: SecurityAlert table is replaced by AlertInfo and AlertEvidence tables in the unified... | Use AlertInfo and AlertEvidence tables instead. SecurityAlert can still be used in queries via th... | 🔵 6.0 | MS Learn |
| 30 | Hunting livestream feature is no longer available or shows deprecation notice in Microsoft Sentin... | Microsoft deprecated the hunting livestream feature in favor of KQL jobs, analytics rules, and pl... | Migrate to KQL jobs for monitoring attacker behavior with persistent results in the Sentinel data... | 🔵 5.5 | ADO Wiki |
| 31 | Cannot query BehaviorInfo or BehaviorEntities tables in Advanced Hunting - table not found or que... | Insufficient permissions for Advanced Hunting, tables not yet populated, or incorrect workspace s... | 1. Ensure user has necessary Advanced Hunting permissions in Defender portal. 2. Verify tables ex... | 🔵 5.5 | ADO Wiki |
| 32 | Tenant cannot onboard to Microsoft Sentinel Graph - onboarding banner does not appear or onboardi... | Tenant does not have a Microsoft Sentinel primary workspace connected to Defender portal, or Sent... | 1. Confirm Sentinel primary workspace is connected to Defender portal and is in same region as te... | 🔵 5.5 | ADO Wiki |
| 33 | View blast radius menu item is greyed out and not clickable in Incident graph in Microsoft Defend... | The tenant is not onboarded successfully to Sentinel Lake and Graph | 1. Check the onboarding state of the tenant for Sentinel Lake and Graph. 2. Have a user with nece... | 🔵 5.5 | ADO Wiki |
| 34 | Selecting an entity in Incident graph shows No blast radius found message despite Sentinel Graph ... | There are no paths to targets within 5 hops based on the information currently available in the g... | 1. Try other entities in the same incident that show View blast radius option. 2. Check other inc... | 🔵 5.5 | ADO Wiki |
| 35 | Predefined scenario query in Hunting graph takes too long or times out after ~8 minutes returning... | Very large graph causing query performance degradation, or complex query filters resulting in hig... | 1. Remove filters from the predefined scenario query and re-run. 2. Try with a different entity. ... | 🔵 5.5 | ADO Wiki |
| 36 | Graph does not reflect recently performed changes - nodes, edges or entity information appears ou... | Graph data ingestion and processing latency - changes may take up to 24 hours to propagate and fu... | 1. Confirm if the data change was made less than 24 hours ago - if so, wait for propagation. 2. I... | 🔵 5.5 | ADO Wiki |
| 37 | Filter and Split transformations applied to XDR tables do not appear to be working in Advanced Hu... | Known limitation: transformations applied to XDR tables will not appear in the first 30 days of d... | This is expected behavior. Once the data ages beyond the first 30 days, it will behave normally i... | 🔵 5.5 | ADO Wiki |
