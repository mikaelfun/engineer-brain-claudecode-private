# DEFENDER Sentinel 通用排查 — Comprehensive Troubleshooting Guide

**Entries**: 133 | **Draft sources**: 12 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-recovering-microsoft-sentinel.md, ado-wiki-a-sentinel-repositories-tsg.md, ado-wiki-a-what-is-sentinel-architecture.md, ado-wiki-b-mdc-xdr-connectors-sentinel.md, ado-wiki-b-sentinel-notebooks-private-endpoints.md, ado-wiki-b-sentinel-overview-blade-tsg.md, ado-wiki-b-sentinel-pricing-tsg.md, ado-wiki-b-sentinel-refund-unit-calculation.md, ado-wiki-b-sentinel-scoping.md, ado-wiki-c-powershell-commands-sentinel-analytics.md
  ... and 2 more
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Analytics Rule
> Sources: ado-wiki, mslearn

**1. MITRE ATT&CK tactics and techniques mapping fails on analytics rule. Telemetry shows 'No valid intent corresponding to the technique {T_id} was provided in the KillChainIntent field'. Entire MITRE det**

- **Root Cause**: Invalid MITRE technique ID provided in the mapping configuration. If one technique is invalid, the entire MITRE mapping override fails by design (ICM 413967579).
- **Solution**: Verify all technique IDs are valid MITRE ATT&CK IDs. Ensure both Tactics and Techniques fields are present. Techniques must be formatted as an array (use 'summarize make_list(Techniques)' in KQL). As of Sep 2025, Sentinel aligns to MITRE ATT&CK v16.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Analytics rule dynamic MITRE mapping shows Tactics but Techniques column is empty, or no MITRE mapping appears at all despite configuring technique IDs in the KQL query output.**

- **Root Cause**: Both Tactics and Techniques columns are required for dynamic MITRE mapping. Providing only Techniques without Tactics fails entirely. Providing Techniques as a string (not array) with Tactics results in empty techniques.
- **Solution**: Ensure KQL query output includes both Tactics and Techniques columns. Techniques MUST be in array format. Use 'summarize make_list(Techniques) by Key, Value, Tactic' to convert string to array. A string Tactic + array Techniques = correct mapping.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Unable to update sub-techniques column of Sentinel analytics rule via Azure CLI 'az sentinel alert-rule update' command. Tactics and techniques update works but sub-techniques parameter not available.**

- **Root Cause**: The sub-techniques parameter is not currently available in the Sentinel Azure CLI extension, even after updating to v0.2.0 (IcM 597386113).
- **Solution**: Update Sentinel CLI extension to v0.2.0 ('az extension update --name sentinel') for tactics/techniques. For sub-techniques, use REST API directly. CLI syntax: 'az sentinel alert-rule update --subscription <subid> -g <rg> --workspace-name <name> --rule-name <ruleID> --add techniques T1021 --add tactics LateralMovement'.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**4. Sentinel scheduled analytics rule appears with AUTO DISABLED in its name and stops executing**

- **Root Cause**: Permanent failure: target workspace/table deleted, Sentinel removed, function modified/removed, permissions changed, or data source deleted
- **Solution**: Sort rule list by name to find AUTO DISABLED rules; check description for failure reason; fix underlying issue; re-enable manually
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**5. Sentinel analytics rule AUTO DISABLED due to excessive resource consumption**

- **Root Cause**: Improperly built KQL query consumes excessive computing resources
- **Solution**: Optimize KQL query; reduce complexity; follow Kusto best practices; re-enable after fixing
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**6. Sentinel analytics rule stops in cross-tenant MSSP scenario with insufficient access to resource**

- **Root Cause**: Cross-tenant rules use creator credentials; when user loses access, rule stops and gets autodisabled
- **Solution**: Ensure creating user maintains access; recreate rules with proper permissions; use Azure Lighthouse
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**7. Sentinel analytics rule shows no events in query results (trigger per event grouping)**

- **Root Cause**: Results too large to save with alert; ingestion delay or non-deterministic aggregation causes discrepancies
- **Solution**: Use OriginalQuery field; results limited to 10KB; consider default event grouping
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**8. Sentinel scheduled rule misses events due to ingestion delay**

- **Root Cause**: Data ingestion delay causes events to be excluded by TimeGenerated filter in next run window
- **Solution**: Increase look-back by delay amount; add ingestion_time() > ago(rule_look_back) filter; or use NRT rules
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**9. Sentinel rule fires duplicate alerts after widening look-back for ingestion delay**

- **Root Cause**: Overlapping look-back windows cause events to match in both windows
- **Solution**: Add ingestion_time() > ago(original_look_back) to deduplicate; use Workspace Usage Report for latency
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**10. Sentinel analytics rules not firing despite data present**

- **Root Cause**: Data not fresh, lookback not accounting for latency, parser not installed
- **Solution**: Confirm freshness; review lookback vs latency; verify parser; test manually; widen lookback
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**11. Sentinel analytics rule query fails: function uses reserved word name**

- **Root Cause**: KQL function name conflicts with Kusto reserved word
- **Solution**: Remove or rename the conflicting function; re-save analytics rule
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 2: Repositories
> Sources: ado-wiki

**1. User receives an error when attempting to connect a GitHub repository to Microsoft Sentinel Repositories.**

- **Root Cause**: The Azure-Sentinel GitHub App is not properly authorized or installed for the user's GitHub account, or the app does not have access to the required repositories.
- **Solution**: 1) Verify the GitHub account is logged in successfully in the same browser session. 2) Go to github.com/settings/profile > Integrations > Applications > Authorized GitHub Apps tab and ensure the Azure-Sentinel application is granted. 3) Check the Installed GitHub Apps tab and verify Azure-Sentinel app has access to the appropriate repositories. 4) As a last resort, uninstall the GitHub app and re-trigger the flow from the Sentinel Repository UX. NOTE: Uninstalling the app will break previously setup connections on the same repository - reconfiguration of existing repositories is required.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. User encounters errors while establishing a connection between Azure DevOps and Microsoft Sentinel Repositories.**

- **Root Cause**: Third-party application access via OAuth is not enabled in the Azure DevOps organization policy, or the user does not have project-administrator permissions in the target project.
- **Solution**: 1) Check if third-party application access via OAuth is enabled: go to https://dev.azure.com/{orgName}/_settings/organizationPolicy and verify it is turned on. 2) Verify the user has project-administrator permission: go to https://dev.azure.com/{orgName}/{projectName}/_settings/permissions and confirm the user is in the Project Administrators group.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**3. Self-hosted GitHub runner fails to execute Sentinel repository workflows, or connection issues occur between the runner and GitHub/Azure services.**

- **Root Cause**: Missing prerequisites (PowerShell 7, Azure CLI, Git) on the runner machine, or network firewall blocking required GitHub organization IP addresses.
- **Solution**: 1) Install PowerShell 7 from official GitHub releases. 2) Install Azure CLI. 3) Install Git. 4) Run the GitHub Actions Runner from PowerShell 7. 5) Allowlist the following GitHub-Org IPs in the firewall: 52.191.0.0/16, 20.49.104.1, 13.64.0.0/16, 13.73.0.0/16, 40.83.0.0/16, 40.112.243.49, 20.67.201.0/32, 20.67.202.0/32, 20.50.64.11, 51.137.23.0/32, 40.114.161.0/16, 20.50.2.4.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**4. Customer attempts to create a Sentinel repository connection to Azure DevOps in a different tenant**

- **Root Cause**: Cross-tenant Sentinel repository connection to Azure DevOps is not officially supported by design
- **Solution**: Inform customer that this scenario is not officially supported. No workaround is available.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**5. Customer wants to customize password expiration time or specify a pre-created service principal for Sentinel repository connection**

- **Root Cause**: Customizing password expiration time or specifying pre-created service principal is not yet supported in Sentinel Repositories
- **Solution**: Inform customer this feature is not supported yet. Feature request has been submitted (ICM:325447152, QFC:b0b7485b-6917-ed11-b5cf-0003ff45cecf).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**6. After removing content templates from the source repository, the corresponding content still appears in Azure Sentinel UX**

- **Root Cause**: By design - the Repositories feature does not automatically delete deployed content when templates are removed from source control
- **Solution**: Delete the deployed content directly from the Sentinel UX or through the REST API. Alternatively, disable content (e.g. analytic rules) instead of deleting from the repository.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**7. Creating Sentinel repository connection to Azure DevOps fails when user is logged into a different account on Azure DevOps in the same browser**

- **Root Cause**: Azure DevOps attempts to authorize using the different account already signed in, causing connection creation to fail
- **Solution**: Ensure you are not logged into Azure DevOps with a different email. Use an InPrivate/Private browser window when creating the connection.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**8. Playbook ARM template deployment from Sentinel Repositories fails with missing parameter error**

- **Root Cause**: Playbook ARM template is missing the required workspace parameter definition
- **Solution**: Add a workspace parameter to the playbook ARM template: {"parameters": {"workspace": {"type": "string"}}}. This is a known preview bug being fixed.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**9. Sentinel repository push fails with TF402455: Pushes to this branch are not permitted or user is not authorized to access this resource**

- **Root Cause**: User lacks sufficient permissions on the source control. User must be Contributor or higher in ADO project with at least basic access level and ability to bypass branch policies.
- **Solution**: Grant user Contributor or higher role in the ADO project, ensure at least basic access level in the organization, and configure ability to bypass enabled branch policies.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 3: Sap
> Sources: ado-wiki

**1. Unable to delete SAP Agentless connector from Microsoft Sentinel UI. Connector shows as connected even with no data flowing after 7 days and no active instances.**

- **Root Cause**: SAP agentless connector uses a combination of Push connector and RestApiPoller kind. Push connector does not support delete operations, preventing UI deletion.
- **Solution**: 1) Ensure all connected instances are disconnected first. 2) Use REST API to delete: go to Data Connectors - Delete REST API (https://learn.microsoft.com/rest/api/securityinsights/data-connectors/delete), sign in with contributor access, set api-version=2025-07-01-preview, dataConnectorId=Push-SAPCC_rfcDestinationName. 3) Hit Run, verify success code, refresh browser on data connectors UI.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. SAP agentless connector data collection fails on older SAP systems due to missing RFC_READ_TABLE function module functionality**

- **Root Cause**: Older SAP systems may be missing required functionality for the RFC_READ_TABLE function module used by the agentless connector
- **Solution**: Ensure SAP admin reviews and applies SAP notes 3390051 and 382318 to patch the system with required RFC_READ_TABLE functionality.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Missing Last address routed (IP address) in the SAP security audit log when using Sentinel SAP agentless connector**

- **Root Cause**: SAP system configuration not updated to include IP address routing information in the security audit log
- **Solution**: Follow the guidance in SAP note 3566290 to enable Last address routed (IP address) in the security audit log.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Incomplete SAP user master data or no data appearing in Sentinel ABAPAuthorizationDetails table when using SAP agentless connector**

- **Root Cause**: SAP function module SIAG_ROLE_GET_AUTH is missing in the SAP source system, preventing the connector from collecting authorization details
- **Solution**: Confirm that the SAP function module SIAG_ROLE_GET_AUTH exists in the SAP source system. Follow the guidance in SAP note 3088309 for the relevant solution to restore this functionality.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Microsoft Sentinel SAP connector drops connection frequently with RFC_COMMUNICATION_FAILURE errors or NOT_AUTHORIZED errors. HeartBeat log shows NiBufIConnect connection pending timeout after 60000ms.**

- **Root Cause**: Common causes: (1) SAP agent lacks permission to read table T000, (2) Agent version older than 69771570 (fix released in that version), (3) Network connectivity issues between agent container and SAP system
- **Solution**: 1) Verify agent has permission to read SAP table T000. 2) Check agent version via SAP_HeartBeat_CL query - if version < 69771570, update agent. Manual update: wget sapcon-instance-update.sh from Azure-Sentinel GitHub repo and run. Auto-update: wget sapcon-sentinel-auto-update.sh and run. Latest version tags: https://mcr.microsoft.com/v2/azure-sentinel/solutions/sapcon/tags/list. Official troubleshooting: https://learn.microsoft.com/en-us/azure/sentinel/sap/sap-deploy-troubleshoot
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Error 'Invalid Path. Only a path to zip folder is valid' when configuring Microsoft Sentinel SAP connector**

- **Root Cause**: Incorrect path format used for the SAP SDK zip file path. Path must follow the correct structure per Microsoft documentation.
- **Solution**: Ensure the path uses correct format per https://learn.microsoft.com/en-us/azure/sentinel/normalization-schema-file-event#path-structure. Example correct syntax: /src/files/nwrfc750p_12-70002752.zip (not a Windows-style or malformed path).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. SAP Agentless connector UI shows empty fields in section 2 or 3 after customer has already deployed Azure resources via the Deploy resources button**

- **Root Cause**: UI rendering issue - sections 2 and 3 do not auto-populate after deployment until section 1 is manually expanded first
- **Solution**: Expand section 1 first (the deployment section), then expand section 2 or 3. The fields will populate correctly after this sequence.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 4: Mcp
> Sources: ado-wiki, mslearn

**1. VS Code Sentinel MCP authenticates home tenant instead of guest tenant**

- **Root Cause**: Known VS Code issue; token defaults to home tenant
- **Solution**: Add x-mcp-client-tenant-id header; or use home tenant account; triage tools lack multi-tenancy
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. User keeps getting Unauthorized errors when accessing Sentinel MCP server, but the MCP client is not prompting for authentication as documented.**

- **Root Cause**: The MCP client may not be correctly configured to trigger the authentication flow, or cached credentials are stale/invalid.
- **Solution**: Follow the Sentinel MCP TSG for unauthorized errors. Verify the MCP client configuration matches the documented authentication flow. Clear cached credentials and re-authenticate.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**3. User's prompt continues to select the wrong tools because there are too many overlapping or conflicting MCP servers configured.**

- **Root Cause**: Multiple MCP servers with overlapping tool definitions cause the AI model to select incorrect tools for the given prompt.
- **Solution**: Review and consolidate MCP server configurations. Remove or disable overlapping/conflicting MCP servers. Ensure each MCP server has clearly distinct tool scopes to avoid selection ambiguity.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**4. As a guest user in a tenant, the user cannot sign in to their home tenant when using Sentinel MCP. Authentication defaults to the guest tenant instead.**

- **Root Cause**: The MCP server authenticates against the tenant where the user is a guest, rather than the user's home tenant.
- **Solution**: Force the MCP server to authenticate against the user's actual (home) tenant. This is a supported scenario - follow the TSG guidance on forcing tenant-specific authentication for Sentinel MCP.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**5. Sentinel MCP tools not called by AI model in VS Code**

- **Root Cause**: Tools semantically overlapping, model limitations, context favored, or not onboarded
- **Solution**: Choose right tool combo; use newer models; start new conversation; verify onboarding
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

**6. Sentinel MCP tools return data from wrong workspace IDs**

- **Root Cause**: Multiple workspaces accessed; tools inconsistently select workspace
- **Solution**: Use list_workspaces; specify workspace ID in prompt
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 5: Analytics Rules
> Sources: mslearn

**1. Sentinel scheduled analytics rule shows AUTO DISABLED in the rule name and stops executing**

- **Root Cause**: Permanent failure: target workspace or table was deleted, Sentinel was removed from workspace, a function used by the query was modified or removed, data source permissions changed, or data source was deleted
- **Solution**: 1) Check rule description for the specific failure reason; 2) Verify target workspace and table still exist; 3) Confirm functions used by the query are valid; 4) Check data source permissions; 5) Fix the underlying issue and manually re-enable the rule by removing AUTO DISABLED from the name
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. No events appear in Sentinel scheduled analytics rule query results when event grouping is set to trigger an alert for each event**

- **Root Cause**: Results too large to save with alerts, or ingestion delay and non-deterministic aggregation causes different results when re-running the query later
- **Solution**: Use the OriginalQuery field (not the Query field) to re-run the original analytics rule query. OriginalQuery contains the original query as written and returns the most recent matching event in the timeframe
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. Sentinel analytics rule auto-disabled due to excessive resource drain (performance)**

- **Root Cause**: Improperly built query consuming excessive computing resources, risking performance drain on systems. Microsoft Sentinel detects this and auto-disables the rule
- **Solution**: Optimize the query following KQL best practices: reduce data scanned with time filters, avoid unnecessary joins, use summarize efficiently. Refer to Kusto Query Language best practices and Azure Monitor query optimization docs
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**4. Sentinel analytics rule stops working in cross-subscription or cross-tenant MSSP scenario when the rule creator loses access**

- **Root Cause**: Rules accessing workspaces in other subscriptions or tenants use the creator credentials instead of independent access tokens. When the creator loses access, the rule fails permanently
- **Solution**: Re-create the analytics rule with a user who still has access to the target workspace. For MSSP scenarios, use a dedicated service account with persistent cross-tenant access. Monitor health messages for insufficient access to resource
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**5. Microsoft Sentinel analytics rules (SIEM) not firing: no alerts generated from scheduled rules**

- **Root Cause**: Data is not fresh (ingestion delay), rule scheduling or lookback window misaligned with data latency, or required parser is not installed or enabled
- **Solution**: 1) Confirm data freshness in the workspace; 2) Review rule scheduling and widen the lookback window; 3) Verify and reinstall the required parser; 4) Test the rule query manually; 5) Add a verification workbook
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 6: Xdr
> Sources: ado-wiki, mslearn

**1. URLs in Sentinel incident Description field are broken for workspaces onboarded in XDR; special characters (#, =) replaced with underscores**

- **Root Cause**: XDR backend drops special characters from the Description field during processing, corrupting embedded URLs
- **Solution**: Use AlertLink or other fields instead of Description for URLs. No fix ETA from PG (IcM 564735451).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. XDR users cannot open specific alerts in M365 Defender/XDR portal; alerts visible in queue but inaccessible when clicked, showing access denied or silent failures. Only affects alerts where associated**

- **Root Cause**: Sentinel alerts ingested into XDR remain bound by Sentinel workspace-level RBAC. User lacks at least Reader-level access on the underlying Sentinel Log Analytics workspace. If alert is associated with multiple alert products, user must have access to ALL associated products.
- **Solution**: 1) Collect Alert ID, Org ID, Tenant ID, User UPN. 2) Capture HAR trace with Disable Cache enabled to get TenantContext frame. 3) Query MtpAlerts in wcdscrubbeduks cluster to identify alert product dependencies and Sentinel workspace. 4) Validate user permission scopes via InETraceEvent query. 5) Grant Microsoft Sentinel Reader role on the relevant workspace. 6) User must sign out and back in after permission change.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Timestamp and TimeGenerated columns show different values when querying Defender XDR tables streamed to Microsoft Sentinel Log Analytics**

- **Root Cause**: When data arrives to Log Analytics more than 48 hours after the event, the TimeGenerated column is overridden to now() upon ingestion, making it inaccurate for determining actual event time
- **Solution**: Always rely on the Timestamp column (not TimeGenerated) when querying Defender XDR tables in advanced hunting to get the actual event time
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**4. Custom detection rule with near real-time frequency fails or is unavailable when the query includes Microsoft Sentinel data tables**

- **Root Cause**: Known limitation: near real-time detection frequency is not available for custom detections that include Microsoft Sentinel data. Also, custom functions created in Sentinel are not supported in custom detections
- **Solution**: Use a longer detection frequency (e.g., every hour or every 24 hours) for custom detection rules that query Sentinel data tables. Rewrite any Sentinel-saved custom functions inline in the detection query
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 7: Ueba
> Sources: ado-wiki

**1. UserAccessAnalytics table is missing or contains no data in Microsoft Sentinel workspace**

- **Root Cause**: The UserAccessAnalytics table and its data have been deprecated by Microsoft with no replacement available
- **Solution**: Inform customer that UserAccessAnalytics table is deprecated with no replacement. Reference IcM 338403815 for tracking.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. IdentityInfo table data differs between Microsoft Sentinel and XDR Advanced Hunting, customer reports inconsistent identity data**

- **Root Cause**: The Advanced Hunting IdentityInfo table and the Sentinel IdentityInfo table are different by design - they serve different purposes, use different logic, track different identity types (AH includes service principals and non-Microsoft sources), have different pipelines and enrichment logic, and differ in retention and deleted user handling
- **Solution**: Explain the design differences: (1) Sentinel without UEBA/XDR = no IdentityInfo table. (2) Sentinel with UEBA, no XDR = UEBA IdentityInfo in Log Analytics. (3) XDR without UEBA = classic Radius IdentityInfo. (4) Sentinel with both UEBA and XDR = unified Radius IdentityInfo enriched with UEBA data. The schemas appear similar but are backed by different pipelines; data is not expected to be identical.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. No behaviors appearing after enabling Sentinel Behaviors Layer feature - BehaviorInfo and BehaviorEntities tables remain empty or do not exist in workspace**

- **Root Cause**: Common causes: workspace not onboarded to Microsoft 365 Defender portal, supported data sources (AWSCloudTrail, CommonSecurityLog for Palo Alto/CyberArk) not ingesting to Analytics tier, another workspace in tenant already has Behaviors enabled (single workspace limitation), or insufficient time since enabling (<30 min)
- **Solution**: 1. Verify workspace is onboarded to Defender portal. 2. Confirm supported data sources are ingesting to Analytics tier (not Basic/Archive). 3. Check no other workspace in tenant has Behaviors enabled. 4. Navigate to Sentinel > Settings > UEBA > Behaviors layer and verify toggle+data sources are ON. 5. Wait 15-30 minutes. 6. Run: BehaviorInfo | summarize count() by Title. If still empty after 30+ min with all prerequisites met, escalate to PG.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**4. Behaviors stopped appearing in BehaviorInfo table after previously working correctly in Sentinel Behaviors Layer**

- **Root Cause**: Data source ingestion stopped or paused, data moved to Basic or Archive tier, or workspace reached data limits
- **Solution**: 1. Verify data source is still actively ingesting to Analytics tier. 2. Check for ingestion errors or connector issues. 3. Review workspace health and data limits. If ingestion confirmed and no config changes, raise ticket with timeframe when behaviors stopped.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 8: Summary Rules
> Sources: ado-wiki

**1. Unable to create summary rules in Microsoft Sentinel; rule creation fails with permission error**

- **Root Cause**: User lacks contributor privileges or Microsoft.Operationalinsights/workspaces/summarylogs/write permission in the workspace
- **Solution**: Grant contributor privileges on the workspace and ensure Microsoft.Operationalinsights/workspaces/summarylogs/write permission is assigned. Verify all prerequisites per official documentation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. Summary rule gets suspended and stops executing after the custom logs table tier is changed to basic logs**

- **Root Cause**: Changing the custom logs table from analytics tier to basic logs causes the summary rule to be suspended at the next execution cycle
- **Solution**: Ensure the custom logs table remains under the analytics tier. If tier was changed, revert it back to analytics and re-enable the summary rule.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**3. Summary rule execution fails or returns incomplete results**

- **Root Cause**: The summary rule query hits data processing limits or Log Analytics query limits (e.g., result size, time range, record count)
- **Solution**: Test the query in Log Analytics Logs first. If close to query limits, reduce binSize to process less data per bin, alter query to return fewer records, or remove high-volume fields. Check for ingestion delays if no events appear.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**4. Unable to create new summary rules; error indicates limit has been reached**

- **Root Cause**: The number of summary rules per workspace is limited to 30 rules
- **Solution**: Consolidate or remove existing summary rules to stay within the 30-rule limit. Review and delete unnecessary rules to free capacity.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 9: Usx
> Sources: ado-wiki

**1. Incident description is missing in Sentinel workspace view but appears correctly in XDR portal (USX correlation engine)**

- **Root Cause**: USX correlation engine design issue - incident description not synced properly from MTP to Sentinel workspace
- **Solution**: This is a known design limitation of the USX correlation engine. Workaround: view the incident in the XDR portal instead of the Sentinel workspace for full description.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. Incident description in XDR portal replaces special characters (colon, question mark, hash, equals) with underscores, corrupting URLs and formatted text**

- **Root Cause**: USX correlation engine sanitizes incident descriptions by replacing special characters with underscores, breaking embedded URLs and formatted content
- **Solution**: This is a known design limitation. URLs and text with special characters in incident descriptions will be corrupted. Workaround: avoid embedding URLs with special characters in alert/incident descriptions, or reference them separately.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**3. Alert created by Sentinel analytic rule is not visible in the incident in Sentinel workspace, despite being correlated into an existing incident**

- **Root Cause**: Sentinel incidents can hold up to 150 alerts maximum. If a new alert is correlated into an incident that already has 150+ alerts, the alert will not appear in Sentinel view of the incident.
- **Solution**: This is a documented limitation. Check if the incident already has 150+ alerts. Consider splitting large incidents or creating separate automation rules to handle high-volume alert scenarios. Reference: Microsoft 365 Defender integration docs.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**4. New incident created by MTP correlation engine is missing in Sentinel - only the updated (merged) incident appears, original incident with its alert is invisible**

- **Root Cause**: MTP sync timing issue: Sentinel queries MTP database every ~5 minutes. If MTP creates a new incident and correlates/merges it into an existing incident before Sentinel next sync, Sentinel only receives the updated incident and never sees the originally created one.
- **Solution**: This is a known timing design limitation of the MTP-Sentinel sync mechanism (~5 min polling interval). The alert still exists in the merged incident in MTP. Workaround: check the XDR portal directly for the most up-to-date incident state.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 10: Workbooks
> Sources: ado-wiki

**1. Red warning sign appears in Situational Awareness workbook and customer cannot see data from certain tenants in MTO**

- **Root Cause**: Known MFA cross-MTO issue where user has not completed 2FA sign-in for those tenants
- **Solution**: Check if the red warning sign is visible on the bottom right of the page. Customer needs to sign in to the affected tenant with 2FA to resolve this authentication issue.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. Customer opens Situational Awareness workbook and only sees data for one tenant instead of multiple tenants**

- **Root Cause**: The tenant selector has not been configured to include multiple tenants
- **Solution**: Use the tenant selector to include multiple tenants. Once more tenants have been added, the workbook will update to reflect the data of all selected tenants.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**3. Customer cannot see the workbooks page in MTO navigation in Microsoft Sentinel**

- **Root Cause**: Customer has not added tenants in MTO settings page, or added tenants do not have any workbooks or are not onboarded to Microsoft Sentinel
- **Solution**: Check if the customer has added one or more tenants in the MTO settings page. Verify those tenants have at least one workbook and are onboarded to Microsoft Sentinel.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**4. Customer cannot see a specific workbook in MTO that they are using**

- **Root Cause**: The workbook is a template (templates not supported in MTO, only active content/workbooks) or the workbook was saved to a workspace/resource group not associated with an MTO tenant
- **Solution**: 1) Check if the workbook is a template - templates are currently not supported in MTO, only active content/workbooks 2) Check if the workbook has been saved to a workspace related to a tenant that the user has added in MTO. Sometimes users save workbooks to a different workspace/resource group.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 11: Nrt
> Sources: ado-wiki, mslearn

**1. NRT (Near Real Time) analytics rule generates significantly more alerts than expected, far exceeding the defined trigger threshold.**

- **Root Cause**: NRT rule is configured to use a function table, which is not supported. Using function tables with NRT rules causes excessive alert creation (IcM 302142301).
- **Solution**: Do not use function tables with NRT rules. Replace function table references with direct table queries in the NRT rule KQL. NRT rules run every 1 minute with 1 minute lookback using ingestion_time() instead of TimeGenerated.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. NRT analytics rule shows Failure status in _SentinelHealth(). Description: Rule scheduled run failed after numerous attempts. Issue code: TemporaryIssuesDelay.**

- **Root Cause**: Temporary backend issues cause NRT rule execution delay. The system is designed to automatically retry and extend the query time window on the next successful run to avoid missing events.
- **Solution**: Query _SentinelHealth() filtered by SentinelResourceKind=='NRT' and rule name. After failure, verify the next successful run has QueryStartTimeUTC covering the failed period. For backend investigation, use Kusto cluster securityinsights.kusto.windows.net, database SecurityInsightsProd, Operations table filtered by NrtQueryExecution.Worker.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Sentinel NRT rule delay >10 min or scheduled rule window completely skipped after 6 consecutive failures**

- **Root Cause**: NRT: each failure adds 1-min delay up to 60 min; Scheduled: 6 retries all failed, window permanently skipped
- **Solution**: Monitor with _SentinelHealth() queries; for NRT check ruleDelay; for Scheduled check failuresByStartTime==6; fix underlying query errors
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 12: Watchlist
> Sources: ado-wiki, mslearn

**1. Watchlist CSV file upload fails with validation error in Microsoft Sentinel. Various UX exceptions displayed during upload.**

- **Root Cause**: CSV file contains validation issues: empty file, invalid content (metadata without header/rows), insufficient lines for numberOfLinesToSkip, more than 50 columns, rows ending with comma, empty column names, row count exceeding columns, file >3.8MB, duplicate headers, or missing fields.
- **Solution**: Validate CSV before upload: non-empty with valid header+data rows, <50 columns, no trailing commas, no empty column names, consistent column counts, <3.8MB, unique headers, complete field data.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Sentinel watchlist bulk update does not delete removed items**

- **Root Cause**: Bulk update only appends and deduplicates; does not delete missing items
- **Solution**: Delete individually or recreate entire watchlist for large deletions
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. Sentinel watchlist upload fails exceeding 3.8 MB local file limit**

- **Root Cause**: Local upload capped at 3.8 MB; large files need Azure Storage
- **Solution**: Upload to Azure Storage; create SAS URL (6h+ expiry); add CORS; use Azure Storage source type
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 13: Data Connector Wizard
> Sources: ado-wiki

**1. The option to create a custom connector does not appear in the Microsoft Sentinel Data Connectors page (Data Connector Wizard)**

- **Root Cause**: Missing Microsoft Sentinel Contributor role, workspace not selected in portal, or workspace not onboarded to USX experience in Defender portal.
- **Solution**: 1) Assign Microsoft Sentinel Contributor role. 2) Ensure a workspace is selected in the portal. 3) Verify onboarding to USX experience in Defender portal (https://learn.microsoft.com/azure/sentinel/move-to-defender). 4) Refresh the page.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Data Connector Wizard deployment completes successfully but the new connector is not visible in the Microsoft Sentinel Data Connectors list**

- **Root Cause**: UI refresh delay after ARM template deployment. The connector exists but the portal has not refreshed to show it.
- **Solution**: Refresh the browser after deployment completes. Search for the connector by name in the Data Connectors list. The connector should appear after a page refresh.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Data Connector Wizard deployment fails with validation or permission errors during the Deploy step in Microsoft Sentinel**

- **Root Cause**: Insufficient permissions (missing Microsoft Sentinel Contributor role) or invalid configuration values provided during wizard setup.
- **Solution**: 1) Confirm user has Microsoft Sentinel Contributor permissions. 2) Review deployment error messages surfaced by the wizard. 3) Correct configuration values and retry. 4) Download ARM template for manual inspection if needed. 5) File a bug with deployment error details if issue persists. IcM escalation path: Microsoft Sentinel PG.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 14: Connector Builder Agent
> Sources: ado-wiki

**1. VS Code Connector Builder Agent: user unsure how to start the connector creation workflow using the Sentinel extension**

- **Root Cause**: Agent mode or prompt format not correctly used in VS Code Copilot chat
- **Solution**: 1) Open VS Code chat and set to Agent mode. 2) Select Claude Sonnet 4.5 model. 3) Prompt using @sentinel, select /create-connector, and follow the conversational workflow
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**2. VS Code Connector Builder Agent: deployment fails when using the deploy command from Copilot chat**

- **Root Cause**: Insufficient permissions on the target Sentinel workspace or incorrect workspace details used in the deploy command
- **Solution**: Ensure the user has Microsoft Sentinel Contributor permissions on the target workspace and rerun the deploy command with correct workspace details
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**3. VS Code Connector Builder Agent: connector deploys successfully but no data is ingested into Microsoft Sentinel**

- **Root Cause**: Connector configuration is incomplete or requires additional user input after deployment in the Data Connector Gallery
- **Solution**: After deployment, open the Data Connector Gallery in Sentinel, review connector configuration settings, and complete the configuration to start data ingestion
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 15: Data Transformations
> Sources: ado-wiki

**1. Filter/Split transformation rule does not apply after creation in Microsoft Sentinel Data Transformations**

- **Root Cause**: The filter/split rule KQL query does not meet transformKQL requirements
- **Solution**: Verify the rule meets transformKQL requirements. The user should receive an error message describing the issue. Fix the KQL to comply with transformKQL supported characters and limits.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. Split rule is greyed out for a table in Microsoft Sentinel Data Transformations**

- **Root Cause**: Missing prerequisites: table does not support DCRs or lake only mode, workspace is not MSG enabled (not onboarded to lake), or user lacks required permissions (Data Operations Manage, Log Analytics Contributor)
- **Solution**: Verify: 1) User has Sentinel workspaces connected to Defender 2) User has Data Operations (Manage) permission 3) User has Log Analytics Contributor role 4) Table supports DCRs (check sentinel-tables-connectors-reference) 5) Table supports lake only mode 6) Workspace is MSG enabled (onboarded to lake)
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**3. Filter rule is greyed out for a table in Microsoft Sentinel Data Transformations**

- **Root Cause**: Missing prerequisites: table does not support DCRs, or user lacks required permissions (Data Operations Manage, Log Analytics Contributor)
- **Solution**: Verify: 1) User has Sentinel workspaces connected to Defender 2) User has Data Operations (Manage) permission 3) User has Log Analytics Contributor role 4) Table supports DCRs (check sentinel-tables-connectors-reference). Tables must support DCRs to apply filter rules.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 16: Connector Health
> Sources: ado-wiki

**1. SentinelHealth table does not appear in Log Analytics workspace after enabling the connector health feature in Microsoft Sentinel**

- **Root Cause**: Health feature not enabled on the workspace, or no supported connector is connected. SentinelHealth table only appears after both conditions are met, with up to 1 hour delay after activation.
- **Solution**: 1) Enable health feature: Settings > Health > Turn on. 2) Ensure at least one supported connector is connected (see supported list at docs.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health#supported-data-connectors; API Polling/CCP and AWS S3 also supported in preview). 3) Wait up to 1 hour for SentinelHealth table to appear.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. SentinelHealth shows Success for Data fetch status change but data is still not flowing for the connector in Microsoft Sentinel**

- **Root Cause**: SentinelHealth only covers the polling/fetch step of data collection (performed by Scuba and TI for supported connectors). It does not monitor later ingestion stages (ODS, GT, Log-Analytics). A Success status only confirms the fetch was successful, not end-to-end data flow.
- **Solution**: Understand that SentinelHealth Success only confirms the polling step. Investigate downstream ingestion components separately: check ODS pipeline health, GT (Geneva Telemetry) status, and Log Analytics workspace ingestion metrics. Use Usage table and _LogOperation table to identify ingestion failures beyond the fetch stage.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 17: Mdc Connector
> Sources: ado-wiki

**1. Tenant-based MDC connector enabled in Sentinel but no alerts are appearing. Subscription-based connector shows alerts but tenant-based does not.**

- **Root Cause**: The tenant-based MDC connector depends on Defender XDR configuration. If MDC config in XDR is set to Disabled instead of All Alerts (default), the tenant-based connector will not receive any alerts.
- **Solution**: Verify MDC configuration in Defender XDR portal is set to All Alerts (the default setting). The tenant-based connector retrieves alerts through Defender XDR rather than direct push from Defender for Cloud, so XDR must be configured to forward all MDC alerts.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Need to delete the legacy subscription-based MDC connector in Sentinel but cannot do it from the portal UI, or connector appears deleted but routing rules persist.**

- **Root Cause**: The subscription-based (legacy) MDC connector may not properly clean up via the portal UI. Subscriptions inside the connector must be disconnected first, and routing rules may persist after portal deletion.
- **Solution**: 1. Ensure all subscriptions inside the connector are turned off/disconnected in the connector blade. 2. Use REST API: List data connectors via Data Connectors - List API, find the MDFC connector ID (Kind=AzureSecurityCenter). 3. Call Data Connectors - Delete API with the connector ID. 4. If routing rules persist, use PowerShell: Get-AzSentinelDataConnector + Remove-AzSentinelDataConnector to clean up remaining connector objects.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 18: Entra Id
> Sources: ado-wiki

**1. MicrosoftGraphActivityLogs table in Sentinel/Log Analytics shows no data after enabling the Entra ID connector or diagnostic settings for the first time.**

- **Root Cause**: First-time setup latency. When routing activity logs to a Log Analytics workspace for the first time, there is an expected delay of up to 3 days before logs appear.
- **Solution**: Wait up to 3 days for initial data to appear after first-time enablement. This is documented behavior per Microsoft Learn (reference-log-latency). No action needed unless data is still missing after 3 days.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Service Principal sign-in logs in Sentinel show servicePrincipalId as 00000000-0000-0000-0000-000000000000. The Service Principal cannot be found in Entra ID.**

- **Root Cause**: By design - this is service-principal-less authentication. The app is a multi-tenant SaaS app and Entra ID issues tokens based on the home tenant registration, not a local Enterprise App in the customer directory. There is no service principal object for this app in the tenant.
- **Solution**: This is expected behavior for multi-tenant SaaS apps using client credentials (app-only) auth. No fix needed. Refer customer to Microsoft Learn documentation on Service Principal Sign-in Logs FAQ for clarification on the 00000000 ID meaning.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 19: D365 F&O
> Sources: ado-wiki

**1. 403 unauthorized errors in Function App monitor logs for D365 Finance & Operations Sentinel connector; or HTTP 400 'Please verify that the user is valid and set up correctly'**

- **Root Cause**: Database log viewer role privileges misconfigured, AD client user not mapped to correct user account, AD client user disabled, or AD Security Group feature requires the AD client user to be a valid Azure AD user
- **Solution**: 1. Check Function App logs under monitor blade for 403/400 errors. 2. Verify Database log viewer role has correct privileges. 3. Ensure AD client user is mapped to user account with Database log viewer role. 4. Confirm AD client user account is not disabled. 5. If using Active Directory Security Group feature, ensure AD client user is a valid Azure AD user.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. No audit data collected from D365 Finance & Operations environment to Sentinel despite connector being configured**

- **Root Cause**: F&O database auditing not enabled for relevant tables, or audit events not generated in F&O
- **Solution**: 1. Check F&O database log audit log viewer to ensure audit events are appearing in F&O. 2. Enable auditing of relevant tables in F&O environment. Note: currently only a single F&O environment is supported for data ingestion; multiple environments will have no unique identifier to distinguish log origin.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 20: Msbizapps
> Sources: ado-wiki

**1. No data collected in Dynamics365Activity/DataverseActivity/PowerAppsActivity/PowerAutomateActivity tables in Sentinel from Microsoft Business Applications connector**

- **Root Cause**: Microsoft Purview Audit log not activated, no Office 365 license enabled, or for DataverseActivity specifically: non-Production Dataverse instance used, or auditing not enabled at global/entity/field level
- **Solution**: 1. Ensure customer has turned on Microsoft Purview Audit log at security.microsoft.com. 2. Verify at least one Office 365 license is active. 3. For DataverseActivity: confirm Production Dataverse instance is in use. 4. Enable auditing at global level, entity level, and field level. 5. For read/retrieval events (e.g. export to Excel), enable Retrieve and RetrieveMultiple auditing at entity and field level. Note: Dynamics365Activity table will be deprecated in favor of DataverseActivity (supports DCR).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Some data fields missing or incorrect in Sentinel BizApps tables (Dynamics365Activity/DataverseActivity) compared to expected source data**

- **Root Cause**: Data may be missing or incorrect at the source (Microsoft Purview Audit log) rather than a Sentinel ingestion issue
- **Solution**: 1. Ask customer to verify data in Microsoft Purview Audit log at security.microsoft.com. 2. Create audit log search with filters matching timestamp of affected record (workload: CRM for Dynamics/Dataverse). 3. Compare Purview record details with Sentinel data. 4. If data is correct in Purview but different in Sentinel, escalate to Sentinel engineering. 5. If data is missing from Purview, route ticket to Dynamics team (not a Sentinel issue).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 21: Siem Migration
> Sources: ado-wiki, mslearn

**1. SIEM Migration Tool throws 'renderComponentIntoRoot component encountered an error while loading' (Minified React error #31) after uploading Splunk detection rules JSON file and clicking 'Next: Config**

- **Root Cause**: The Splunk export JSON file is missing required properties (alert_comparator, dispatch.earliest_time). The export command was modified or the JSON file was manually edited, causing incomplete data that the SIEM Migration Tool cannot parse.
- **Solution**: Have the customer re-run the Splunk export command exactly as documented without modifications: '| rest splunk_server=local count=0 /services/saved/searches | search disabled=0 | table title,search ,*'. Do not modify the exported JSON file. Reference ICM: 492701865.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Sentinel SIEM migration shows no recommendations after green checkmarks**

- **Root Cause**: No matches between uploaded rules and Sentinel OOTB analytics rules
- **Solution**: Expected for custom rules; manually translate; create custom rules; verify data sources
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 22: Automation Rules
> Sources: ado-wiki

**1. Automation rule never triggers despite matching events being created in Microsoft Sentinel**

- **Root Cause**: Rule may be disabled, trigger type (OnCreated vs OnUpdated) misalignment, conditions mismatch (case sensitivity, unavailable property, incorrect operator), or events not reaching the automation gateway
- **Solution**: 1) Verify rule is enabled in portal. 2) Check event ingestion via Kusto Span table filtering AutomationAlertsGateway/AutomationCasesGateway for tenant. 3) Verify rule conditions match event using Rule Evaluation Breakdown query (check ConditionsResult). 4) Ensure trigger type aligns with event type. If all checks pass, collect trace IDs and escalate to Rule Engine team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Automation rule actions requiring Microsoft Graph API (update alert, send email) fail with 400/403/404 errors in Microsoft Sentinel**

- **Root Cause**: Missing Microsoft Graph API permissions on the managed identity app registration, or admin consent not granted. Required: SecurityAlert.ReadWrite.All for alert updates, Mail.Send for emails. Permissions can take up to 30 minutes to propagate.
- **Solution**: 1) Navigate to Azure AD App Registrations, find managed identity app. 2) Check API Permissions for Microsoft Graph. 3) Click 'Grant admin consent for [tenant]'. 4) Wait up to 30 minutes for propagation. 5) Check Action Execution Details query for specific Graph API error. If issue persists, check Graph API status or escalate to Unified Actions team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 23: Storage Blob
> Sources: mslearn

**1. Sentinel Storage Blob connector fails: Event Grid queue not receiving blob created notifications**

- **Root Cause**: Event Grid system topic or subscription is misconfigured. System topic already exists from different config causing conflicts, or subscription source does not map to correct storage account and queue
- **Solution**: 1) Check resource group deployments for system topic creation failures; 2) Verify subscription source maps to correct storage account and target queue; 3) Review Event Grid subscription metrics for Delivery Failed Events; 4) Enable Event Grid diagnostic logs; 5) Check storage queue Approximate Messages Count
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Sentinel Storage Blob connector ingests data but SentinelHealth shows invalid message errors and data format issues**

- **Root Cause**: Blob data format (serialization or compression) does not match the connector response configuration, or queue messages do not align with EventGridSchema for BlobCreated events
- **Solution**: 1) Query SentinelHealth: SentinelResourceKind == StorageAccountBlobContainer where Status != Success; 2) Verify blob format matches connector config (supported: JSON, CSV, XML, Parquet); 3) Verify Event Grid subscription filter is Blob Created with EventGridSchema
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 24: M365 Defender
> Sources: ado-wiki

**1. Customer cannot delete M365 Defender Export Settings rule in Sentinel, or rule appears deleted but data from MDE/MDO tables continues to be ingested into Log Analytics workspace**

- **Root Cause**: Three possible causes: (1) Workspace was offboarded from Sentinel but Export Settings in M365 Defender portal was not removed (Sentinel offboarding does not support Defender offboarding automatically). (2) User lacks Global Administrator or Security Administrator role in M365 Defender. (3) UX bug causing delete/update to silently fail
- **Solution**: Send a DELETE request to the M365 API: DELETE https://api.security.microsoft.com/api/dataexportsettings/SentinelExportSettings-{workspace-name}. User must have Global Admin or Security Admin role. Can also use the API Explorer in Microsoft 365 security portal to trigger the DELETE request. If user lacks permissions, assign the role or use an admin user.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. Sentinel alerts from M365 Defender initially arrive with zero entities (NumOfEntities=0). Entity details only appear later in subsequent SecurityAlert log entries for the same SystemAlertId**

- **Root Cause**: By design, M365 Defender sends alert data in multiple batches. The initial alert event may have no entities, while a subsequent update adds entity information (mailMessage, mailbox, ip, mailCluster, etc.). This is a known behavior of the alert enrichment pipeline.
- **Solution**: Use Kusto telemetry query against cluster('securityinsights.kusto.windows.net').database('SecurityInsightsProd').Operations with operationName 'AlertGatewayService.AlertConverter.EventToSecurityAlertConverter.JObjectToSecurityAlerMessage' to verify entity receipt timeline. Filter by AlertId and WorkspaceId, check NumOfEntities and EntityTypes fields across multiple entries sorted by env_time to confirm entities arrived in later batches.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 25: Mdc
> Sources: onenote

**1. MDC and Sentinel retiring in Mooncake Aug 18 2026 - new sub onboarding blocked, allowlist required for MDC, Sentinel re-opened but limited**

- **Root Cause**: Strategic decision to retire MDC and Sentinel from Mooncake. MDC onboarding blocked via portal and API. Allowlist process ended Feb 18 2026. Sentinel re-opened due to escalations but discouraged for net-new customers.
- **Solution**: Check allowlist at Allow list for MDC.xlsx. API with version 2023-01-01 if allowlisted. Billing/business to CSAM. Technical Qs via Internal Teams Channels. Hot escalations via aka.ms/mtpmooncakeescalations.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

### Phase 26: Mma
> Sources: ado-wiki

**1. All tier options (None/Minimal/Common/All Events) for Security Events collection are grayed out in MDC Data Collection settings; banner message: 'Security Events tier configuration is shared with Azur**

- **Root Cause**: Azure Sentinel 'Security Events via Legacy Agent' data connector has already configured the Security Events tier for the workspace — the setting is shared between MDC and Sentinel and controlled by Sentinel when this connector is active
- **Solution**: Change the Security Events collection tier in Azure Sentinel data connector settings (not in MDC). The tier configuration is shared — changes made in Sentinel automatically apply to MDC as well.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 27: Defender For Ai
> Sources: ado-wiki

**1. Defender for AI 威胁防护告警的 prompt 证据在 Microsoft Sentinel 中无法查看**

- **Root Cause**: Prompt evidence 在 Sentinel 中不受支持（by design），仅在 XDR 和 Azure portal 中可见
- **Solution**: 在 XDR 或 Azure portal 中查看 prompt 证据；Sentinel 中仅接收告警的大多数属性，但不含 prompt 证据
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 28: Asim
> Sources: ado-wiki

**1. When using ASIM parser functions in Microsoft Sentinel, especially when there are no query results, a misleading error message appears: 'Some aspects of the query had errors so the results are not com**

- **Root Cause**: ASIM functions combine data from many sources regardless of whether they are available in the customer's environment. The message indicates some data sources are not configured or available.
- **Solution**: This is an informational message only; the system behaved as expected. No action required unless specific data sources are missing. Reference: https://learn.microsoft.com/en-us/azure/sentinel/normalization-known-issues#misleading-informational-message
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 29: Purview
> Sources: ado-wiki

**1. Customer reports ingestion delay for Compliance Manager Default Alert Policy incidents in Microsoft Sentinel -- incidents appear much later than expected**

- **Root Cause**: The Purview Compliance Manager Default Alert Policy runs every hour. In M365D, the incident shows 'First activity' timestamp (time of the underlying event) but no explicit alert creation time. Customers confuse 'First activity' with when the alert was created, leading to a perceived delay that does not exist.
- **Solution**: Expand the M365D incident and check the Alert 'Generated on' field. Scroll down to see when the alert was added to the incident. Compare this timestamp with TimeGenerated in Sentinel -- they should match, confirming no actual Sentinel ingestion delay. The apparent gap is between the event time and the hourly policy execution.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 30: Deviceevents
> Sources: ado-wiki

**1. MDE DeviceEvents data appears delayed in Microsoft Sentinel -- events from M365D/XDR connector arrive late**

- **Root Cause**: The delay may originate from MDE (device not communicating with MDE cloud) rather than from Sentinel ingestion pipeline.
- **Solution**: Query MDE Kusto cluster to check device communication: cluster('https://wcdprod.kusto.windows.net').database('Geneva').InvestigationMachine('<DeviceId>',-8d,0d,1h). Communication gaps confirm the issue is with MDE, not Sentinel. Also compare ReceiveLatency vs IngestionLatency on DeviceEvents table. If ReceiveLatency is high, escalate to MDE/source provider team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 31: Analytics
> Sources: ado-wiki

**1. Sentinel analytics rule detects credential (password) changes to ServicePrincipal/Application associated with spo_service@support.onmicrosoft.com, raising false-positive security alerts**

- **Root Cause**: spo_service@support.onmicrosoft.com is a legacy global SharePoint Online account (BEC API from 2013 app) used for provisioning provider-hosted apps. Any app added to SharePoint registers under this account, so credential changes are expected operational behavior
- **Solution**: Inform customer this is expected behavior. spo_service is a global SharePoint account used for many internal operations. Customizations require setting SharePoint App-Only permissions (see Microsoft Learn: Granting access using SharePoint App-Only). Audit logs will show spo_service for app-related changes. Customer can exclude this account from their analytics rule or add it as an exception
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 32: Search Job
> Sources: ado-wiki

**1. Sentinel Search job results not showing expected data for a given timeframe when querying the search results table (_SRCH suffix) in Logs**

- **Root Cause**: Search job result tables use TimeGenerated to reflect when the search job ran, not the original event time. Customers filter by TimeGenerated expecting original event timestamps but get search execution timestamps instead
- **Solution**: Use the _OriginalTimeGenerated column instead of TimeGenerated when filtering search results by time range. This column preserves the TimeGenerated value from the original source table. Refer to Azure Monitor documentation on Search job table Schema for details
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 33: Scuba
> Sources: ado-wiki

**1. XDR incidents data ingestion into Microsoft Sentinel appears delayed (Scuba ingestion latency)**

- **Root Cause**: Scuba (internal ingestion engine for XDR incidents) has defined latency targets under peak-time traffic: P95 between 30-60 minutes, P99 between 30-120 minutes. Under normal conditions, events are processed in near real time.
- **Solution**: If delay is within P95/P99 targets, this is expected behavior during peak traffic periods. Monitor Scuba service health for anomalies. IMPORTANT: These latency targets are internal - do not share with customers unless available in public documentation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 34: Duplicate Logs
> Sources: ado-wiki

**1. Duplicate logs detected or suspected in Log Analytics workspace table used by Microsoft Sentinel**

- **Root Cause**: Data source is sending duplicate records to the workspace. Multiple ingestion pipelines or retry mechanisms may cause the same event to be ingested more than once.
- **Solution**: Use KQL hash-based queries to identify and quantify duplicates: 1) Identify duplicates: let _data = materialize(<TABLE>); _data | extend Hash = hash(dynamic_to_json(pack_all())) | summarize recordsCount = count() by Hash | where recordsCount > 1. 2) Calculate duplicate percentage: same as above then | project recordsCount = recordsCount - 1 | summarize duplicateRecords = sum(recordsCount) | extend duplicate_percentage = (duplicateRecords * 100.0) / _totalRecords. Replace <TABLE> with actual table name.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 35: Identity Protection
> Sources: ado-wiki

**1. Azure AD Identity Protection incidents ingested into Microsoft Sentinel in a closed state (Resolved or Dismissed) even though they are new incidents.**

- **Root Cause**: By design, if an Identity Protection alert has status Resolved or Dismissed at the source, the Sentinel ingestion logic (CaseCreationLogic.cs) automatically sets the case status to Closed with CloseReason=BenignPositive and adds a closing comment (Resolved at source or Dismissed at source).
- **Solution**: This is expected behavior. When AADIP incidents synced via 365 Defender connector, classification mapping applies: Not set -> Undetermined, True positive -> True Positive, Informational/expected activity -> Benign Positive, False positive -> False Positive. If customer needs open incidents, ensure alerts are not pre-resolved/dismissed in Identity Protection before Sentinel ingestion.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 36: Xdr Connector
> Sources: ado-wiki

**1. Sentinel shows incidents from Defender XDR but the incidents lack underlying alert details, limiting investigation capabilities.**

- **Root Cause**: The XDR connector is enabled without any MDC connector (neither subscription-based nor tenant-based). XDR forwards incidents but without a MDC connector, the alert details are not sent to Sentinel.
- **Solution**: Enable either the subscription-based or tenant-based MDC connector alongside the Defender XDR connector. This ensures both incident-level and alert-level data flow into Sentinel for full investigation capability.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 37: Mdo Connector
> Sources: ado-wiki

**1. Customer only sees 6 specific Microsoft Defender for Office 365 alerts in Sentinel (malicious URL click, malware removed, phish URL removed, user reported malware/phish, suspicious sending patterns, u**

- **Root Cause**: The Microsoft Defender for Office 365 connector only ingests 6 specific alert types. All other Office Security and Compliance Center alerts require the separate Microsoft 365 Defender connector which uses a different API pipeline.
- **Solution**: Enable the Microsoft 365 Defender (M365D) connector in Sentinel to ingest the remaining Office Security and Compliance Center alerts. The MDO connector is limited to 6 alert types by design.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 38: Office 365
> Sources: ado-wiki

**1. Schema check on the OfficeActivity table in Sentinel returns duplicated fields (fields appearing with underscore suffix like FieldName_).**

- **Root Cause**: By design. During the lifetime of the OfficeActivity table, some fields changed and their underlying table columns were renamed by adding an underscore to preserve backward compatibility and prevent data loss for customers relying on old field names. IcM reference: 346130000.
- **Solution**: No action needed - this is by design. Inform customer that the duplicated fields are old versions of renamed columns, kept with underscore suffix to maintain backward compatibility. Both old and new field names are valid.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 39: Office 365 Connector
> Sources: ado-wiki

**1. Exchange online operation data or email item move logs missing from OfficeActivity table in Microsoft Sentinel**

- **Root Cause**: Mailbox auditing not enabled or specific mailbox actions (e.g. Move) not configured for audit on affected mailboxes in Exchange Online
- **Solution**: 1. Verify data exists at source via Purview portal (compliance.microsoft.com > Audit) with appropriate filters. 2. Connect to Exchange Online PowerShell: Import-Module ExchangeOnlineManagement; Connect-ExchangeOnline. 3. Check audit settings: Get-Mailbox -Identity <ID> | fl *audit*. 4. Add missing actions: Set-Mailbox -Identity <ID> -AuditOwner @{Add="Move"} -AuditDelegate @{Add="Move"} -AuditAdmin @{Add="Move"}. 5. Involve EXO team (SAP: Exchange/Exchange Online/mailbox auditing) for deeper investigation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 40: M365 Defender Connector
> Sources: ado-wiki

**1. Error 'The limit of 5 diagnostic settings was reached' when installing/updating Microsoft 365 Defender connector in Sentinel**

- **Root Cause**: Microsoft 365 Defender Streaming API has a hard limit of 5 streaming API connections; obsolete connections cannot be deleted from the Sentinel portal
- **Solution**: Delete obsolete streaming API connections via REST API: send DELETE to https://api.security.microsoft.com/api/dataexportsettings/<setting-name> using service principal bearer token from the Azure Portal failure message. Retry connector installation after deletion.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 41: Cross Workspace Query
> Sources: ado-wiki

**1. Cross-workspace queries fail with FailedToResolveResource and scheduled analytical rules get auto-disabled in Sentinel**

- **Root Cause**: Log Analytics change now requires full ResourceID path for cross-workspace queries instead of just workspace name
- **Solution**: Update all cross-workspace queries to use full ResourceID: workspace('/subscriptions/{subId}/resourcegroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/{wsName}'). Re-enable any auto-disabled scheduled rules after query fix.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 42: Analytical Rules
> Sources: ado-wiki

**1. Error 'The server encountered a temporary error' when creating or updating Sentinel analytical rules on Set Rule Logic tab**

- **Root Cause**: Log Analytics API has a default 3-minute timeout; heavy KQL queries parsing large data volumes exceed this timeout during query validation
- **Solution**: Add time filter to the query matching the lookback period (e.g. '| where TimeGenerated > ago(1h)'). If still failing, reduce TimeGenerated to 5 min and gradually increase. Also optimize the KQL query to reduce data volume.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 43: Account Entity
> Sources: ado-wiki

**1. After Dec 2025 update, Sentinel account entity naming in incidents/alerts becomes inconsistent; queries, automations, and workbooks referencing Account.Name break**

- **Root Cause**: Microsoft standardized account entity naming priority to: UPN prefix > name > display name. Existing queries using display name as identifier no longer match.
- **Solution**: Update KQL queries to use coalesce pattern: coalesce(Name, DisplayName). Update automation rules, playbooks, and workbooks to handle new naming precedence. Test in non-production workspace first.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 44: Mdo
> Sources: ado-wiki

**1. MDO alert status values in Sentinel SecurityAlert table / API differ from values displayed in MDO portal UI**

- **Root Cause**: MDO UI transforms investigation status: PendingApproval->Pending Action, SuccessfullyRemediated->Remediated, PartiallyRemediated->Partially Remediated, PartiallyInvestigated->Investigation Started
- **Solution**: Use the known MDO status mapping to translate between API/Sentinel values and UI display values when building queries or automations.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 45: Alert Rule Templates
> Sources: ado-wiki

**1. Sentinel alert rule templates missing when querying via alert-rule-templates REST API, but visible in Azure Portal UI**

- **Root Cause**: The old alert-rule-templates API is deprecated and only updated once a week, while the UI uses the current API
- **Solution**: Use the new Content Templates API: GET content-templates/list?view=rest-securityinsights-2024-09-01 instead of deprecated alert-rule-templates API.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 46: Legacy Agent
> Sources: ado-wiki

**1. Unable to disable or remove Security Events via Legacy Agent connector in Sentinel; data collection options are grayed out**

- **Root Cause**: Legacy agent SecurityEventCollectionConfiguration is locked and cannot be changed through the portal UI
- **Solution**: Deploy ARM template: resource type Microsoft.OperationalInsights/workspaces/datasources, kind SecurityEventCollectionConfiguration, properties.tier=None. This unlocks the legacy agent configuration for modification.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 47: Workspace Move
> Sources: ado-wiki

**1. Cannot move Sentinel workspace to another resource group or subscription; operation blocked or causes issues**

- **Root Cause**: After Microsoft Sentinel is deployed on a workspace, moving the workspace to another resource group or subscription is not supported
- **Solution**: Moving a Sentinel-enabled workspace is not supported. Must disable all active rules and redeploy. See docs: https://learn.microsoft.com/en-us/azure/azure-monitor/logs/move-workspace
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 48: Recovery
> Sources: ado-wiki

**1. Customer accidentally deleted SecurityInsights solution or offboarded Microsoft Sentinel and wants to recover data and configuration**

- **Root Cause**: Accidental deletion of SecurityInsights solution from resource group, deletion of Log Analytics Workspace, or offboarding Sentinel via Settings blade. After removal there is a 30-day grace period for data and analytics rules restoration.
- **Solution**: 1) Confirm LAW still exists (if deleted, recover via soft-delete within 14 days). 2) Re-enable Sentinel by adding it to the LAW via standard onboarding. 3) Reconnect disconnected data connectors. If standard re-onboarding fails, use Advanced Recovery: send DELETE to /providers/Microsoft.SecurityInsights/onboardingStates/default, remove SecurityInsights from Legacy Solutions, then send PUT to re-create onboarding state.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 49: Capacityreservation
> Sources: ado-wiki

**1. Error 'CapacityReservation sku can be changed only after 31 days' when sending PUT request to re-onboard Microsoft Sentinel via REST API**

- **Root Cause**: The Log Analytics Workspace has a CapacityReservation pricing tier that enforces a 31-day minimum commitment period. The Sentinel onboarding PUT request triggers a SKU change that conflicts with this restriction.
- **Solution**: Create an ICM to request PG assistance to bypass or resolve the CapacityReservation SKU restriction. Reference example: ICM-651159139.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 50: Content Hub
> Sources: ado-wiki

**1. Azure Active Directory Identity Protection connector stopped working after executing Content Hub centralization tool; detected multiple parser functions with the same name**

- **Root Cause**: Content Hub centralization tool created duplicate parser functions in the workspace. Multiple instances of the same parser function cause resolution conflicts, breaking the connector.
- **Solution**: Ask customer to backup existing parser function, delete all duplicate instances of the parser functions from the workspace, and create a single new parser function to resolve the 'detected multiple functions with the same name' error.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 51: Free Trial
> Sources: ado-wiki

**1. Customer asks to extend the Microsoft Sentinel free trial period**

- **Root Cause**: Since the November 2021 new free trial release, extending free trials is no longer supported due to system limitations. There is no mechanism to extend the trial period.
- **Solution**: Inform the customer that trial periods cannot be extended. They can create a new Log Analytics workspace and enable Sentinel on it to get a new free trial.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 52: Log Analytics
> Sources: ado-wiki

**1. KQL query returns different row counts each time when counting total logs during the data retention period in Sentinel/Log Analytics**

- **Root Cause**: Expected behavior caused by interactive retention. The time range specified is not exact down to milliseconds, so as time moves forward the interactive retention window shifts. The Log Analytics query service enforces retention at query execution time, meaning results change as the retention boundary moves.
- **Solution**: Explain to customer this is expected behavior due to the rolling nature of interactive retention. The count changes because the retention window boundary is constantly moving. If the customer needs exact counts, they should use a fixed absolute time range. For deeper questions about this behavior, refer to the Azure Monitor (AzMon) team as this is a Log Analytics platform behavior.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 53: Threat Intelligence
> Sources: ado-wiki

**1. TI flat file import shows not-imported but some records were partially imported; large file near size limit**

- **Root Cause**: Server-side timeout during large file processing; Sentinel file size limit is not 100% accurate, so files within the defined limit can still cause timeouts
- **Solution**: Split the large file into 2 smaller files and re-upload; this resolves the timeout issue in most cases; if still fails, open IcM (USX Threat Intelligence / Threat Intelligence) with file ID
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 54: Aadsts50131
> Sources: ado-wiki

**1. AADSTS50131 error (Device is not in required device state: known) when accessing Microsoft Sentinel Incidents section**

- **Root Cause**: Windows Defender ATP device conditional access classic policy is blocking access to Sentinel. The policy enforces device compliance and blocks unmanaged or non-compliant devices.
- **Solution**: Go to Conditional Access > Classic policies, find [Windows Defender ATP] Device policy and disable it. Alternatively, create AD group exclusions for users needing Sentinel access. If unresolved, escalate via collab to Azure/Microsoft Entra Sign-in and Multifactor Authentication/Conditional Access/Configuring new or existing policy settings. Related ICM: ICM-574616027.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 55: Correlation Engine
> Sources: ado-wiki

**1. Analytics rule correlation behavior in Microsoft Sentinel USX does not match expected configuration - rules are being correlated when they should not be or vice versa**

- **Root Cause**: Per-rule correlation tags (#INC_CORR# / #DONT_CORR#) always override the tenant-level ExcludeSentinelAlertsFromXDRCorrelation default. Resolution order: 1) #DONT_CORR# in description -> exclude, 2) #INC_CORR# -> include, 3) fall back to tenant store property
- **Solution**: Verify tenant default via Kusto on wcdprod TenantsLatestSnapshotMV. Check per-rule tag state via SecurityInsightsProd Span telemetry. Verify InR correlation engine decision via InETraces service_name inr-sentinelgatewayjob. If shouldExclude does not match config escalate to InEPortalDevIncident. If customer wants all rules to follow tenant default they must remove explicit tags (set each rule to Tenant Default in UI)
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 56: Mto
> Sources: ado-wiki

**1. Customer cannot add shared tenants to Microsoft Defender multitenant management (MTO) - tenant addition fails or shared tenants do not appear**

- **Root Cause**: B2B (Microsoft Entra B2B) permissions required for initial setup of shared tenants. GDAP not supported for Microsoft Sentinel data access in MTO
- **Solution**: Validate prerequisites including licensing and permissions per docs. Verify tenant access using Microsoft Entra B2B verification steps. Confirm GDAP is not being used for Sentinel data access. Follow tenant access verification in MTO requirements documentation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 57: Multi Workspace
> Sources: ado-wiki

**1. Error One primary workspace must always be connected when trying to disconnect Microsoft Sentinel primary workspace from USX**

- **Root Cause**: USX multi workspace requires at least one primary workspace always connected. Cannot disconnect the only primary workspace without first designating another
- **Solution**: Set a different workspace as primary first then disconnect original. For full USX offboarding select ALL connected workspaces and disconnect simultaneously. Global admin should verify onboarding config before changes
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 58: Mooncake
> Sources: onenote

**1. Sentinel Mooncake private preview/GA setup — testing access URL, escalation contacts, feature availability doc location**

- **Solution**: Testing Sentinel in China: use http://aka.ms/sentinelchina (no subscription whitelisting needed). Escalation contacts: Yaron Sahar (escalation engineer), Nati Grand (escalation engineering). SME: Qiuyu Chen. Feature availability doc maintained by PG at SharePoint. Sentinel only available in China East 2 region. Features not GA in Global are not deployed in China.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.0/10 — OneNote]`

### Phase 59: Entra Id Protection
> Sources: ado-wiki

**1. Old Unfamiliar sign-in properties and Atypical travel alerts from Entra ID Protection reappear in Sentinel with dates going back months/years**

- **Root Cause**: When remediation occurs (e.g. admin password reset), all old risky sign-ins are resolved and re-pushed to Sentinel via Scuba, causing historical alerts to resurface
- **Solution**: Expected behavior. Admin password reset or other remediation triggers re-evaluation of all associated risky sign-ins. No action needed unless alerts are unexpected.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 60: Incidents
> Sources: ado-wiki

**1. Sentinel incident is created again as new for the same alert that was previously resolved**

- **Root Cause**: When an alert receives an update after 30 days since the last update, Sentinel treats it as a new incident trigger
- **Solution**: Expected behavior by design. Adjust alert lifecycle or automation rules if this causes noise.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 61: Cef
> Sources: mslearn

**1. CEF logs not ingested due to format validation failure**

- **Root Cause**: Incorrect CEF header, missing fields, improper character escaping
- **Solution**: Verify CEF format with all 7 header fields; escape pipe/backslash/equal; check field mapping docs
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 62: Aws S3
> Sources: mslearn

**1. AWS S3 connector ingestion delay exceeding 30 minutes**

- **Root Cause**: KMS encryption without decrypt permission, wrong event notification filters, or health feature disabled
- **Solution**: Grant KMS decrypt permissions; verify event notifications with correct folder and .gz suffix; check SentinelHealth
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 63: Defender Xdr
> Sources: mslearn

**1. Sentinel analytics rule on Defender XDR table created but never fires - table not streaming to workspace**

- **Root Cause**: Analytics rule can target recognized Defender XDR table even if not streaming to Log Analytics; rule runs but finds no data
- **Solution**: Verify table is streaming to Log Analytics; if not, use custom detection rule wizard instead of analytics rule wizard
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 64: Fusion
> Sources: ado-wiki

**1. Customer reports significant delay (up to 4-7 days) between first alerts and Fusion incident creation. Fusion incident shows only 2 alerts while customer expected more.**

- **Root Cause**: Fusion uses ML scoring that accumulates over time. Initial alerts may not reach the threshold for incident creation. Later alerts raise the score, but Fusion only surfaces the most relevant alerts (not all contributing alerts). DEPRECATED: Feature replaced by XDR incident correlation.
- **Solution**: By design. Fusion delay is normally 0-2 days, up to 7 days max. Fusion surfaces only most relevant alerts per incident to reduce alert fatigue. Note: Feature is deprecated and replaced by XDR incident correlation logic.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 65: Mdca
> Sources: ado-wiki

**1. McasShadowItReporting table in Sentinel/Log Analytics shows all records with identical TimeGenerated timestamp for a given date, confusing customers who expect per-event timestamps**

- **Root Cause**: By design. During the MDCA enrichment process for Cloud Discovery data, the backend sets the TimeGenerated column to the day level (date only), not the exact event timestamp. The logs are designed for Shadow IT reporting (which applications are used) rather than precise event timing. The enrichment process in MDCA SaaS database rounds timestamps to the date column.
- **Solution**: Explain to customer this is by-design behavior. TimeGenerated in McasShadowItReporting is specific to the date, not the individual event time. MDCA forwards these logs to Sentinel for custom dashboards/data triaging, but the timestamp granularity remains at the day level from the enrichment process. Ref: MDCA Escalation Engineer response, Case# 2205300040005960.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 66: Unified Rbac
> Sources: ado-wiki

**1. User cannot access workbooks in the Defender portal even after assigning Sentinel permissions in Unified RBAC (URBAC)**

- **Root Cause**: Workbook permissions (and Playbook Operator, Automation Contributor roles) are not governed by URBAC; these Azure resources require Azure RBAC permissions
- **Solution**: Assign the required permissions in Azure RBAC for workbooks and other unsupported resources; continue using Azure RBAC for Playbook Operator, Automation Contributor, and Workbook Contributor roles
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | MDC and Sentinel retiring in Mooncake Aug 18 2026 - new sub onboarding blocked, allowlist require... | Strategic decision to retire MDC and Sentinel from Mooncake. MDC onboarding blocked via portal an... | Check allowlist at Allow list for MDC.xlsx. API with version 2023-01-01 if allowlisted. Billing/b... | 🟢 9.0 | OneNote |
| 2 | All tier options (None/Minimal/Common/All Events) for Security Events collection are grayed out i... | Azure Sentinel 'Security Events via Legacy Agent' data connector has already configured the Secur... | Change the Security Events collection tier in Azure Sentinel data connector settings (not in MDC)... | 🟢 8.5 | ADO Wiki |
| 3 | Defender for AI 威胁防护告警的 prompt 证据在 Microsoft Sentinel 中无法查看 | Prompt evidence 在 Sentinel 中不受支持（by design），仅在 XDR 和 Azure portal 中可见 | 在 XDR 或 Azure portal 中查看 prompt 证据；Sentinel 中仅接收告警的大多数属性，但不含 prompt 证据 | 🟢 8.5 | ADO Wiki |
| 4 | When using ASIM parser functions in Microsoft Sentinel, especially when there are no query result... | ASIM functions combine data from many sources regardless of whether they are available in the cus... | This is an informational message only; the system behaved as expected. No action required unless ... | 🟢 8.5 | ADO Wiki |
| 5 | Customer reports ingestion delay for Compliance Manager Default Alert Policy incidents in Microso... | The Purview Compliance Manager Default Alert Policy runs every hour. In M365D, the incident shows... | Expand the M365D incident and check the Alert 'Generated on' field. Scroll down to see when the a... | 🟢 8.5 | ADO Wiki |
| 6 | MDE DeviceEvents data appears delayed in Microsoft Sentinel -- events from M365D/XDR connector ar... | The delay may originate from MDE (device not communicating with MDE cloud) rather than from Senti... | Query MDE Kusto cluster to check device communication: cluster('https://wcdprod.kusto.windows.net... | 🟢 8.5 | ADO Wiki |
| 7 | MITRE ATT&CK tactics and techniques mapping fails on analytics rule. Telemetry shows 'No valid in... | Invalid MITRE technique ID provided in the mapping configuration. If one technique is invalid, th... | Verify all technique IDs are valid MITRE ATT&CK IDs. Ensure both Tactics and Techniques fields ar... | 🟢 8.5 | ADO Wiki |
| 8 | Analytics rule dynamic MITRE mapping shows Tactics but Techniques column is empty, or no MITRE ma... | Both Tactics and Techniques columns are required for dynamic MITRE mapping. Providing only Techni... | Ensure KQL query output includes both Tactics and Techniques columns. Techniques MUST be in array... | 🟢 8.5 | ADO Wiki |
| 9 | NRT (Near Real Time) analytics rule generates significantly more alerts than expected, far exceed... | NRT rule is configured to use a function table, which is not supported. Using function tables wit... | Do not use function tables with NRT rules. Replace function table references with direct table qu... | 🟢 8.5 | ADO Wiki |
| 10 | NRT analytics rule shows Failure status in _SentinelHealth(). Description: Rule scheduled run fai... | Temporary backend issues cause NRT rule execution delay. The system is designed to automatically ... | Query _SentinelHealth() filtered by SentinelResourceKind=='NRT' and rule name. After failure, ver... | 🟢 8.5 | ADO Wiki |
| 11 | Watchlist CSV file upload fails with validation error in Microsoft Sentinel. Various UX exception... | CSV file contains validation issues: empty file, invalid content (metadata without header/rows), ... | Validate CSV before upload: non-empty with valid header+data rows, <50 columns, no trailing comma... | 🟢 8.5 | ADO Wiki |
| 12 | Sentinel analytics rule detects credential (password) changes to ServicePrincipal/Application ass... | spo_service@support.onmicrosoft.com is a legacy global SharePoint Online account (BEC API from 20... | Inform customer this is expected behavior. spo_service is a global SharePoint account used for ma... | 🟢 8.5 | ADO Wiki |
| 13 | Sentinel Search job results not showing expected data for a given timeframe when querying the sea... | Search job result tables use TimeGenerated to reflect when the search job ran, not the original e... | Use the _OriginalTimeGenerated column instead of TimeGenerated when filtering search results by t... | 🟢 8.5 | ADO Wiki |
| 14 | SentinelHealth table does not appear in Log Analytics workspace after enabling the connector heal... | Health feature not enabled on the workspace, or no supported connector is connected. SentinelHeal... | 1) Enable health feature: Settings > Health > Turn on. 2) Ensure at least one supported connector... | 🟢 8.5 | ADO Wiki |
| 15 | SentinelHealth shows Success for Data fetch status change but data is still not flowing for the c... | SentinelHealth only covers the polling/fetch step of data collection (performed by Scuba and TI f... | Understand that SentinelHealth Success only confirms the polling step. Investigate downstream ing... | 🟢 8.5 | ADO Wiki |
| 16 | XDR incidents data ingestion into Microsoft Sentinel appears delayed (Scuba ingestion latency) | Scuba (internal ingestion engine for XDR incidents) has defined latency targets under peak-time t... | If delay is within P95/P99 targets, this is expected behavior during peak traffic periods. Monito... | 🟢 8.5 | ADO Wiki |
| 17 | Duplicate logs detected or suspected in Log Analytics workspace table used by Microsoft Sentinel | Data source is sending duplicate records to the workspace. Multiple ingestion pipelines or retry ... | Use KQL hash-based queries to identify and quantify duplicates: 1) Identify duplicates: let _data... | 🟢 8.5 | ADO Wiki |
| 18 | The option to create a custom connector does not appear in the Microsoft Sentinel Data Connectors... | Missing Microsoft Sentinel Contributor role, workspace not selected in portal, or workspace not o... | 1) Assign Microsoft Sentinel Contributor role. 2) Ensure a workspace is selected in the portal. 3... | 🟢 8.5 | ADO Wiki |
| 19 | Data Connector Wizard deployment completes successfully but the new connector is not visible in t... | UI refresh delay after ARM template deployment. The connector exists but the portal has not refre... | Refresh the browser after deployment completes. Search for the connector by name in the Data Conn... | 🟢 8.5 | ADO Wiki |
| 20 | Data Connector Wizard deployment fails with validation or permission errors during the Deploy ste... | Insufficient permissions (missing Microsoft Sentinel Contributor role) or invalid configuration v... | 1) Confirm user has Microsoft Sentinel Contributor permissions. 2) Review deployment error messag... | 🟢 8.5 | ADO Wiki |
| 21 | Azure AD Identity Protection incidents ingested into Microsoft Sentinel in a closed state (Resolv... | By design, if an Identity Protection alert has status Resolved or Dismissed at the source, the Se... | This is expected behavior. When AADIP incidents synced via 365 Defender connector, classification... | 🟢 8.5 | ADO Wiki |
| 22 | Tenant-based MDC connector enabled in Sentinel but no alerts are appearing. Subscription-based co... | The tenant-based MDC connector depends on Defender XDR configuration. If MDC config in XDR is set... | Verify MDC configuration in Defender XDR portal is set to All Alerts (the default setting). The t... | 🟢 8.5 | ADO Wiki |
| 23 | Sentinel shows incidents from Defender XDR but the incidents lack underlying alert details, limit... | The XDR connector is enabled without any MDC connector (neither subscription-based nor tenant-bas... | Enable either the subscription-based or tenant-based MDC connector alongside the Defender XDR con... | 🟢 8.5 | ADO Wiki |
| 24 | Need to delete the legacy subscription-based MDC connector in Sentinel but cannot do it from the ... | The subscription-based (legacy) MDC connector may not properly clean up via the portal UI. Subscr... | 1. Ensure all subscriptions inside the connector are turned off/disconnected in the connector bla... | 🟢 8.5 | ADO Wiki |
| 25 | Customer only sees 6 specific Microsoft Defender for Office 365 alerts in Sentinel (malicious URL... | The Microsoft Defender for Office 365 connector only ingests 6 specific alert types. All other Of... | Enable the Microsoft 365 Defender (M365D) connector in Sentinel to ingest the remaining Office Se... | 🟢 8.5 | ADO Wiki |
| 26 | MicrosoftGraphActivityLogs table in Sentinel/Log Analytics shows no data after enabling the Entra... | First-time setup latency. When routing activity logs to a Log Analytics workspace for the first t... | Wait up to 3 days for initial data to appear after first-time enablement. This is documented beha... | 🟢 8.5 | ADO Wiki |
| 27 | Service Principal sign-in logs in Sentinel show servicePrincipalId as 00000000-0000-0000-0000-000... | By design - this is service-principal-less authentication. The app is a multi-tenant SaaS app and... | This is expected behavior for multi-tenant SaaS apps using client credentials (app-only) auth. No... | 🟢 8.5 | ADO Wiki |
| 28 | Schema check on the OfficeActivity table in Sentinel returns duplicated fields (fields appearing ... | By design. During the lifetime of the OfficeActivity table, some fields changed and their underly... | No action needed - this is by design. Inform customer that the duplicated fields are old versions... | 🟢 8.5 | ADO Wiki |
| 29 | Exchange online operation data or email item move logs missing from OfficeActivity table in Micro... | Mailbox auditing not enabled or specific mailbox actions (e.g. Move) not configured for audit on ... | 1. Verify data exists at source via Purview portal (compliance.microsoft.com > Audit) with approp... | 🟢 8.5 | ADO Wiki |
| 30 | 403 unauthorized errors in Function App monitor logs for D365 Finance & Operations Sentinel conne... | Database log viewer role privileges misconfigured, AD client user not mapped to correct user acco... | 1. Check Function App logs under monitor blade for 403/400 errors. 2. Verify Database log viewer ... | 🟢 8.5 | ADO Wiki |
| 31 | No audit data collected from D365 Finance & Operations environment to Sentinel despite connector ... | F&O database auditing not enabled for relevant tables, or audit events not generated in F&O | 1. Check F&O database log audit log viewer to ensure audit events are appearing in F&O. 2. Enable... | 🟢 8.5 | ADO Wiki |
| 32 | No data collected in Dynamics365Activity/DataverseActivity/PowerAppsActivity/PowerAutomateActivit... | Microsoft Purview Audit log not activated, no Office 365 license enabled, or for DataverseActivit... | 1. Ensure customer has turned on Microsoft Purview Audit log at security.microsoft.com. 2. Verify... | 🟢 8.5 | ADO Wiki |
| 33 | Some data fields missing or incorrect in Sentinel BizApps tables (Dynamics365Activity/DataverseAc... | Data may be missing or incorrect at the source (Microsoft Purview Audit log) rather than a Sentin... | 1. Ask customer to verify data in Microsoft Purview Audit log at security.microsoft.com. 2. Creat... | 🟢 8.5 | ADO Wiki |
| 34 | Unable to delete SAP Agentless connector from Microsoft Sentinel UI. Connector shows as connected... | SAP agentless connector uses a combination of Push connector and RestApiPoller kind. Push connect... | 1) Ensure all connected instances are disconnected first. 2) Use REST API to delete: go to Data C... | 🟢 8.5 | ADO Wiki |
| 35 | SAP agentless connector data collection fails on older SAP systems due to missing RFC_READ_TABLE ... | Older SAP systems may be missing required functionality for the RFC_READ_TABLE function module us... | Ensure SAP admin reviews and applies SAP notes 3390051 and 382318 to patch the system with requir... | 🟢 8.5 | ADO Wiki |
| 36 | Missing Last address routed (IP address) in the SAP security audit log when using Sentinel SAP ag... | SAP system configuration not updated to include IP address routing information in the security au... | Follow the guidance in SAP note 3566290 to enable Last address routed (IP address) in the securit... | 🟢 8.5 | ADO Wiki |
| 37 | Incomplete SAP user master data or no data appearing in Sentinel ABAPAuthorizationDetails table w... | SAP function module SIAG_ROLE_GET_AUTH is missing in the SAP source system, preventing the connec... | Confirm that the SAP function module SIAG_ROLE_GET_AUTH exists in the SAP source system. Follow t... | 🟢 8.5 | ADO Wiki |
| 38 | Microsoft Sentinel SAP connector drops connection frequently with RFC_COMMUNICATION_FAILURE error... | Common causes: (1) SAP agent lacks permission to read table T000, (2) Agent version older than 69... | 1) Verify agent has permission to read SAP table T000. 2) Check agent version via SAP_HeartBeat_C... | 🟢 8.5 | ADO Wiki |
| 39 | Error 'Invalid Path. Only a path to zip folder is valid' when configuring Microsoft Sentinel SAP ... | Incorrect path format used for the SAP SDK zip file path. Path must follow the correct structure ... | Ensure the path uses correct format per https://learn.microsoft.com/en-us/azure/sentinel/normaliz... | 🟢 8.5 | ADO Wiki |
| 40 | Error 'The limit of 5 diagnostic settings was reached' when installing/updating Microsoft 365 Def... | Microsoft 365 Defender Streaming API has a hard limit of 5 streaming API connections; obsolete co... | Delete obsolete streaming API connections via REST API: send DELETE to https://api.security.micro... | 🟢 8.5 | ADO Wiki |
| 41 | Cross-workspace queries fail with FailedToResolveResource and scheduled analytical rules get auto... | Log Analytics change now requires full ResourceID path for cross-workspace queries instead of jus... | Update all cross-workspace queries to use full ResourceID: workspace('/subscriptions/{subId}/reso... | 🟢 8.5 | ADO Wiki |
| 42 | Error 'The server encountered a temporary error' when creating or updating Sentinel analytical ru... | Log Analytics API has a default 3-minute timeout; heavy KQL queries parsing large data volumes ex... | Add time filter to the query matching the lookback period (e.g. '/ where TimeGenerated > ago(1h)'... | 🟢 8.5 | ADO Wiki |
| 43 | After Dec 2025 update, Sentinel account entity naming in incidents/alerts becomes inconsistent; q... | Microsoft standardized account entity naming priority to: UPN prefix > name > display name. Exist... | Update KQL queries to use coalesce pattern: coalesce(Name, DisplayName). Update automation rules,... | 🟢 8.5 | ADO Wiki |
| 44 | MDO alert status values in Sentinel SecurityAlert table / API differ from values displayed in MDO... | MDO UI transforms investigation status: PendingApproval->Pending Action, SuccessfullyRemediated->... | Use the known MDO status mapping to translate between API/Sentinel values and UI display values w... | 🟢 8.5 | ADO Wiki |
| 45 | Sentinel alert rule templates missing when querying via alert-rule-templates REST API, but visibl... | The old alert-rule-templates API is deprecated and only updated once a week, while the UI uses th... | Use the new Content Templates API: GET content-templates/list?view=rest-securityinsights-2024-09-... | 🟢 8.5 | ADO Wiki |
| 46 | URLs in Sentinel incident Description field are broken for workspaces onboarded in XDR; special c... | XDR backend drops special characters from the Description field during processing, corrupting emb... | Use AlertLink or other fields instead of Description for URLs. No fix ETA from PG (IcM 564735451). | 🟢 8.5 | ADO Wiki |
| 47 | Unable to disable or remove Security Events via Legacy Agent connector in Sentinel; data collecti... | Legacy agent SecurityEventCollectionConfiguration is locked and cannot be changed through the por... | Deploy ARM template: resource type Microsoft.OperationalInsights/workspaces/datasources, kind Sec... | 🟢 8.5 | ADO Wiki |
| 48 | Cannot move Sentinel workspace to another resource group or subscription; operation blocked or ca... | After Microsoft Sentinel is deployed on a workspace, moving the workspace to another resource gro... | Moving a Sentinel-enabled workspace is not supported. Must disable all active rules and redeploy.... | 🟢 8.5 | ADO Wiki |
| 49 | Customer accidentally deleted SecurityInsights solution or offboarded Microsoft Sentinel and want... | Accidental deletion of SecurityInsights solution from resource group, deletion of Log Analytics W... | 1) Confirm LAW still exists (if deleted, recover via soft-delete within 14 days). 2) Re-enable Se... | 🟢 8.5 | ADO Wiki |
| 50 | Error 'CapacityReservation sku can be changed only after 31 days' when sending PUT request to re-... | The Log Analytics Workspace has a CapacityReservation pricing tier that enforces a 31-day minimum... | Create an ICM to request PG assistance to bypass or resolve the CapacityReservation SKU restricti... | 🟢 8.5 | ADO Wiki |
| 51 | Azure Active Directory Identity Protection connector stopped working after executing Content Hub ... | Content Hub centralization tool created duplicate parser functions in the workspace. Multiple ins... | Ask customer to backup existing parser function, delete all duplicate instances of the parser fun... | 🟢 8.5 | ADO Wiki |
| 52 | SIEM Migration Tool throws 'renderComponentIntoRoot component encountered an error while loading'... | The Splunk export JSON file is missing required properties (alert_comparator, dispatch.earliest_t... | Have the customer re-run the Splunk export command exactly as documented without modifications: '... | 🟢 8.5 | ADO Wiki |
| 53 | Customer asks to extend the Microsoft Sentinel free trial period | Since the November 2021 new free trial release, extending free trials is no longer supported due ... | Inform the customer that trial periods cannot be extended. They can create a new Log Analytics wo... | 🟢 8.5 | ADO Wiki |
| 54 | KQL query returns different row counts each time when counting total logs during the data retenti... | Expected behavior caused by interactive retention. The time range specified is not exact down to ... | Explain to customer this is expected behavior due to the rolling nature of interactive retention.... | 🟢 8.5 | ADO Wiki |
| 55 | TI flat file import shows not-imported but some records were partially imported; large file near ... | Server-side timeout during large file processing; Sentinel file size limit is not 100% accurate, ... | Split the large file into 2 smaller files and re-upload; this resolves the timeout issue in most ... | 🟢 8.5 | ADO Wiki |
| 56 | UserAccessAnalytics table is missing or contains no data in Microsoft Sentinel workspace | The UserAccessAnalytics table and its data have been deprecated by Microsoft with no replacement ... | Inform customer that UserAccessAnalytics table is deprecated with no replacement. Reference IcM 3... | 🟢 8.5 | ADO Wiki |
| 57 | IdentityInfo table data differs between Microsoft Sentinel and XDR Advanced Hunting, customer rep... | The Advanced Hunting IdentityInfo table and the Sentinel IdentityInfo table are different by desi... | Explain the design differences: (1) Sentinel without UEBA/XDR = no IdentityInfo table. (2) Sentin... | 🟢 8.5 | ADO Wiki |
| 58 | AADSTS50131 error (Device is not in required device state: known) when accessing Microsoft Sentin... | Windows Defender ATP device conditional access classic policy is blocking access to Sentinel. The... | Go to Conditional Access > Classic policies, find [Windows Defender ATP] Device policy and disabl... | 🟢 8.5 | ADO Wiki |
| 59 | Automation rule never triggers despite matching events being created in Microsoft Sentinel | Rule may be disabled, trigger type (OnCreated vs OnUpdated) misalignment, conditions mismatch (ca... | 1) Verify rule is enabled in portal. 2) Check event ingestion via Kusto Span table filtering Auto... | 🟢 8.5 | ADO Wiki |
| 60 | Automation rule actions requiring Microsoft Graph API (update alert, send email) fail with 400/40... | Missing Microsoft Graph API permissions on the managed identity app registration, or admin consen... | 1) Navigate to Azure AD App Registrations, find managed identity app. 2) Check API Permissions fo... | 🟢 8.5 | ADO Wiki |
| 61 | XDR users cannot open specific alerts in M365 Defender/XDR portal; alerts visible in queue but in... | Sentinel alerts ingested into XDR remain bound by Sentinel workspace-level RBAC. User lacks at le... | 1) Collect Alert ID, Org ID, Tenant ID, User UPN. 2) Capture HAR trace with Disable Cache enabled... | 🟢 8.5 | ADO Wiki |
| 62 | Analytics rule correlation behavior in Microsoft Sentinel USX does not match expected configurati... | Per-rule correlation tags (#INC_CORR# / #DONT_CORR#) always override the tenant-level ExcludeSent... | Verify tenant default via Kusto on wcdprod TenantsLatestSnapshotMV. Check per-rule tag state via ... | 🟢 8.5 | ADO Wiki |
| 63 | Customer cannot add shared tenants to Microsoft Defender multitenant management (MTO) - tenant ad... | B2B (Microsoft Entra B2B) permissions required for initial setup of shared tenants. GDAP not supp... | Validate prerequisites including licensing and permissions per docs. Verify tenant access using M... | 🟢 8.5 | ADO Wiki |
| 64 | Error One primary workspace must always be connected when trying to disconnect Microsoft Sentinel... | USX multi workspace requires at least one primary workspace always connected. Cannot disconnect t... | Set a different workspace as primary first then disconnect original. For full USX offboarding sel... | 🟢 8.5 | ADO Wiki |
| 65 | Sentinel Mooncake private preview/GA setup — testing access URL, escalation contacts, feature ava... |  | Testing Sentinel in China: use http://aka.ms/sentinelchina (no subscription whitelisting needed).... | 🟢 8.0 | OneNote |
| 66 | Unable to update sub-techniques column of Sentinel analytics rule via Azure CLI 'az sentinel aler... | The sub-techniques parameter is not currently available in the Sentinel Azure CLI extension, even... | Update Sentinel CLI extension to v0.2.0 ('az extension update --name sentinel') for tactics/techn... | 🔵 7.5 | ADO Wiki |
| 67 | SAP Agentless connector UI shows empty fields in section 2 or 3 after customer has already deploy... | UI rendering issue - sections 2 and 3 do not auto-populate after deployment until section 1 is ma... | Expand section 1 first (the deployment section), then expand section 2 or 3. The fields will popu... | 🔵 7.5 | ADO Wiki |
| 68 | VS Code Connector Builder Agent: user unsure how to start the connector creation workflow using t... | Agent mode or prompt format not correctly used in VS Code Copilot chat | 1) Open VS Code chat and set to Agent mode. 2) Select Claude Sonnet 4.5 model. 3) Prompt using @s... | 🔵 7.5 | ADO Wiki |
| 69 | VS Code Connector Builder Agent: deployment fails when using the deploy command from Copilot chat | Insufficient permissions on the target Sentinel workspace or incorrect workspace details used in ... | Ensure the user has Microsoft Sentinel Contributor permissions on the target workspace and rerun ... | 🔵 7.5 | ADO Wiki |
| 70 | VS Code Connector Builder Agent: connector deploys successfully but no data is ingested into Micr... | Connector configuration is incomplete or requires additional user input after deployment in the D... | After deployment, open the Data Connector Gallery in Sentinel, review connector configuration set... | 🔵 7.5 | ADO Wiki |
| 71 | Old Unfamiliar sign-in properties and Atypical travel alerts from Entra ID Protection reappear in... | When remediation occurs (e.g. admin password reset), all old risky sign-ins are resolved and re-p... | Expected behavior. Admin password reset or other remediation triggers re-evaluation of all associ... | 🔵 7.5 | ADO Wiki |
| 72 | Sentinel incident is created again as new for the same alert that was previously resolved | When an alert receives an update after 30 days since the last update, Sentinel treats it as a new... | Expected behavior by design. Adjust alert lifecycle or automation rules if this causes noise. | 🔵 7.5 | ADO Wiki |
| 73 ⚠️ | Timestamp and TimeGenerated columns show different values when querying Defender XDR tables strea... | When data arrives to Log Analytics more than 48 hours after the event, the TimeGenerated column i... | Always rely on the Timestamp column (not TimeGenerated) when querying Defender XDR tables in adva... | 🔵 6.0 | MS Learn |
| 74 ⚠️ | Custom detection rule with near real-time frequency fails or is unavailable when the query includ... | Known limitation: near real-time detection frequency is not available for custom detections that ... | Use a longer detection frequency (e.g., every hour or every 24 hours) for custom detection rules ... | 🔵 6.0 | MS Learn |
| 75 ⚠️ | Sentinel scheduled analytics rule shows AUTO DISABLED in the rule name and stops executing | Permanent failure: target workspace or table was deleted, Sentinel was removed from workspace, a ... | 1) Check rule description for the specific failure reason; 2) Verify target workspace and table s... | 🔵 6.0 | MS Learn |
| 76 ⚠️ | No events appear in Sentinel scheduled analytics rule query results when event grouping is set to... | Results too large to save with alerts, or ingestion delay and non-deterministic aggregation cause... | Use the OriginalQuery field (not the Query field) to re-run the original analytics rule query. Or... | 🔵 6.0 | MS Learn |
| 77 ⚠️ | Sentinel analytics rule auto-disabled due to excessive resource drain (performance) | Improperly built query consuming excessive computing resources, risking performance drain on syst... | Optimize the query following KQL best practices: reduce data scanned with time filters, avoid unn... | 🔵 6.0 | MS Learn |
| 78 ⚠️ | Sentinel analytics rule stops working in cross-subscription or cross-tenant MSSP scenario when th... | Rules accessing workspaces in other subscriptions or tenants use the creator credentials instead ... | Re-create the analytics rule with a user who still has access to the target workspace. For MSSP s... | 🔵 6.0 | MS Learn |
| 79 ⚠️ | Sentinel Storage Blob connector fails: Event Grid queue not receiving blob created notifications | Event Grid system topic or subscription is misconfigured. System topic already exists from differ... | 1) Check resource group deployments for system topic creation failures; 2) Verify subscription so... | 🔵 6.0 | MS Learn |
| 80 ⚠️ | Sentinel Storage Blob connector ingests data but SentinelHealth shows invalid message errors and ... | Blob data format (serialization or compression) does not match the connector response configurati... | 1) Query SentinelHealth: SentinelResourceKind == StorageAccountBlobContainer where Status != Succ... | 🔵 6.0 | MS Learn |
| 81 ⚠️ | Sentinel scheduled analytics rule appears with AUTO DISABLED in its name and stops executing | Permanent failure: target workspace/table deleted, Sentinel removed, function modified/removed, p... | Sort rule list by name to find AUTO DISABLED rules; check description for failure reason; fix und... | 🔵 6.0 | MS Learn |
| 82 ⚠️ | Sentinel analytics rule AUTO DISABLED due to excessive resource consumption | Improperly built KQL query consumes excessive computing resources | Optimize KQL query; reduce complexity; follow Kusto best practices; re-enable after fixing | 🔵 6.0 | MS Learn |
| 83 ⚠️ | Sentinel analytics rule stops in cross-tenant MSSP scenario with insufficient access to resource | Cross-tenant rules use creator credentials; when user loses access, rule stops and gets autodisabled | Ensure creating user maintains access; recreate rules with proper permissions; use Azure Lighthouse | 🔵 6.0 | MS Learn |
| 84 ⚠️ | Sentinel analytics rule shows no events in query results (trigger per event grouping) | Results too large to save with alert; ingestion delay or non-deterministic aggregation causes dis... | Use OriginalQuery field; results limited to 10KB; consider default event grouping | 🔵 6.0 | MS Learn |
| 85 ⚠️ | Sentinel scheduled rule misses events due to ingestion delay | Data ingestion delay causes events to be excluded by TimeGenerated filter in next run window | Increase look-back by delay amount; add ingestion_time() > ago(rule_look_back) filter; or use NRT... | 🔵 6.0 | MS Learn |
| 86 ⚠️ | Sentinel rule fires duplicate alerts after widening look-back for ingestion delay | Overlapping look-back windows cause events to match in both windows | Add ingestion_time() > ago(original_look_back) to deduplicate; use Workspace Usage Report for lat... | 🔵 6.0 | MS Learn |
| 87 ⚠️ | CEF logs not ingested due to format validation failure | Incorrect CEF header, missing fields, improper character escaping | Verify CEF format with all 7 header fields; escape pipe/backslash/equal; check field mapping docs | 🔵 6.0 | MS Learn |
| 88 ⚠️ | AWS S3 connector ingestion delay exceeding 30 minutes | KMS encryption without decrypt permission, wrong event notification filters, or health feature di... | Grant KMS decrypt permissions; verify event notifications with correct folder and .gz suffix; che... | 🔵 6.0 | MS Learn |
| 89 ⚠️ | VS Code Sentinel MCP authenticates home tenant instead of guest tenant | Known VS Code issue; token defaults to home tenant | Add x-mcp-client-tenant-id header; or use home tenant account; triage tools lack multi-tenancy | 🔵 6.0 | MS Learn |
| 90 ⚠️ | Sentinel analytics rules not firing despite data present | Data not fresh, lookback not accounting for latency, parser not installed | Confirm freshness; review lookback vs latency; verify parser; test manually; widen lookback | 🔵 6.0 | MS Learn |
| 91 ⚠️ | Sentinel watchlist bulk update does not delete removed items | Bulk update only appends and deduplicates; does not delete missing items | Delete individually or recreate entire watchlist for large deletions | 🔵 6.0 | MS Learn |
| 92 ⚠️ | Sentinel watchlist upload fails exceeding 3.8 MB local file limit | Local upload capped at 3.8 MB; large files need Azure Storage | Upload to Azure Storage; create SAS URL (6h+ expiry); add CORS; use Azure Storage source type | 🔵 6.0 | MS Learn |
| 93 ⚠️ | Sentinel NRT rule delay >10 min or scheduled rule window completely skipped after 6 consecutive f... | NRT: each failure adds 1-min delay up to 60 min; Scheduled: 6 retries all failed, window permanen... | Monitor with _SentinelHealth() queries; for NRT check ruleDelay; for Scheduled check failuresBySt... | 🔵 6.0 | MS Learn |
| 94 ⚠️ | Sentinel analytics rule on Defender XDR table created but never fires - table not streaming to wo... | Analytics rule can target recognized Defender XDR table even if not streaming to Log Analytics; r... | Verify table is streaming to Log Analytics; if not, use custom detection rule wizard instead of a... | 🔵 6.0 | MS Learn |
| 95 | Customer reports significant delay (up to 4-7 days) between first alerts and Fusion incident crea... | Fusion uses ML scoring that accumulates over time. Initial alerts may not reach the threshold for... | By design. Fusion delay is normally 0-2 days, up to 7 days max. Fusion surfaces only most relevan... | 🔵 5.5 | ADO Wiki |
| 96 | Customer cannot delete M365 Defender Export Settings rule in Sentinel, or rule appears deleted bu... | Three possible causes: (1) Workspace was offboarded from Sentinel but Export Settings in M365 Def... | Send a DELETE request to the M365 API: DELETE https://api.security.microsoft.com/api/dataexportse... | 🔵 5.5 | ADO Wiki |
| 97 | Sentinel alerts from M365 Defender initially arrive with zero entities (NumOfEntities=0). Entity ... | By design, M365 Defender sends alert data in multiple batches. The initial alert event may have n... | Use Kusto telemetry query against cluster('securityinsights.kusto.windows.net').database('Securit... | 🔵 5.5 | ADO Wiki |
| 98 | McasShadowItReporting table in Sentinel/Log Analytics shows all records with identical TimeGenera... | By design. During the MDCA enrichment process for Cloud Discovery data, the backend sets the Time... | Explain to customer this is by-design behavior. TimeGenerated in McasShadowItReporting is specifi... | 🔵 5.5 | ADO Wiki |
| 99 | User keeps getting Unauthorized errors when accessing Sentinel MCP server, but the MCP client is ... | The MCP client may not be correctly configured to trigger the authentication flow, or cached cred... | Follow the Sentinel MCP TSG for unauthorized errors. Verify the MCP client configuration matches ... | 🔵 5.5 | ADO Wiki |
| 100 | User's prompt continues to select the wrong tools because there are too many overlapping or confl... | Multiple MCP servers with overlapping tool definitions cause the AI model to select incorrect too... | Review and consolidate MCP server configurations. Remove or disable overlapping/conflicting MCP s... | 🔵 5.5 | ADO Wiki |
| 101 | As a guest user in a tenant, the user cannot sign in to their home tenant when using Sentinel MCP... | The MCP server authenticates against the tenant where the user is a guest, rather than the user's... | Force the MCP server to authenticate against the user's actual (home) tenant. This is a supported... | 🔵 5.5 | ADO Wiki |
| 102 | User receives an error when attempting to connect a GitHub repository to Microsoft Sentinel Repos... | The Azure-Sentinel GitHub App is not properly authorized or installed for the user's GitHub accou... | 1) Verify the GitHub account is logged in successfully in the same browser session. 2) Go to gith... | 🔵 5.5 | ADO Wiki |
| 103 | User encounters errors while establishing a connection between Azure DevOps and Microsoft Sentine... | Third-party application access via OAuth is not enabled in the Azure DevOps organization policy, ... | 1) Check if third-party application access via OAuth is enabled: go to https://dev.azure.com/{org... | 🔵 5.5 | ADO Wiki |
| 104 | Self-hosted GitHub runner fails to execute Sentinel repository workflows, or connection issues oc... | Missing prerequisites (PowerShell 7, Azure CLI, Git) on the runner machine, or network firewall b... | 1) Install PowerShell 7 from official GitHub releases. 2) Install Azure CLI. 3) Install Git. 4) R... | 🔵 5.5 | ADO Wiki |
| 105 | Customer attempts to create a Sentinel repository connection to Azure DevOps in a different tenant | Cross-tenant Sentinel repository connection to Azure DevOps is not officially supported by design | Inform customer that this scenario is not officially supported. No workaround is available. | 🔵 5.5 | ADO Wiki |
| 106 | Customer wants to customize password expiration time or specify a pre-created service principal f... | Customizing password expiration time or specifying pre-created service principal is not yet suppo... | Inform customer this feature is not supported yet. Feature request has been submitted (ICM:325447... | 🔵 5.5 | ADO Wiki |
| 107 | After removing content templates from the source repository, the corresponding content still appe... | By design - the Repositories feature does not automatically delete deployed content when template... | Delete the deployed content directly from the Sentinel UX or through the REST API. Alternatively,... | 🔵 5.5 | ADO Wiki |
| 108 | Creating Sentinel repository connection to Azure DevOps fails when user is logged into a differen... | Azure DevOps attempts to authorize using the different account already signed in, causing connect... | Ensure you are not logged into Azure DevOps with a different email. Use an InPrivate/Private brow... | 🔵 5.5 | ADO Wiki |
| 109 | Playbook ARM template deployment from Sentinel Repositories fails with missing parameter error | Playbook ARM template is missing the required workspace parameter definition | Add a workspace parameter to the playbook ARM template: {"parameters": {"workspace": {"type": "st... | 🔵 5.5 | ADO Wiki |
| 110 | Sentinel repository push fails with TF402455: Pushes to this branch are not permitted or user is ... | User lacks sufficient permissions on the source control. User must be Contributor or higher in AD... | Grant user Contributor or higher role in the ADO project, ensure at least basic access level in t... | 🔵 5.5 | ADO Wiki |
| 111 | Unable to create summary rules in Microsoft Sentinel; rule creation fails with permission error | User lacks contributor privileges or Microsoft.Operationalinsights/workspaces/summarylogs/write p... | Grant contributor privileges on the workspace and ensure Microsoft.Operationalinsights/workspaces... | 🔵 5.5 | ADO Wiki |
| 112 | Summary rule gets suspended and stops executing after the custom logs table tier is changed to ba... | Changing the custom logs table from analytics tier to basic logs causes the summary rule to be su... | Ensure the custom logs table remains under the analytics tier. If tier was changed, revert it bac... | 🔵 5.5 | ADO Wiki |
| 113 | Summary rule execution fails or returns incomplete results | The summary rule query hits data processing limits or Log Analytics query limits (e.g., result si... | Test the query in Log Analytics Logs first. If close to query limits, reduce binSize to process l... | 🔵 5.5 | ADO Wiki |
| 114 | Unable to create new summary rules; error indicates limit has been reached | The number of summary rules per workspace is limited to 30 rules | Consolidate or remove existing summary rules to stay within the 30-rule limit. Review and delete ... | 🔵 5.5 | ADO Wiki |
| 115 | No behaviors appearing after enabling Sentinel Behaviors Layer feature - BehaviorInfo and Behavio... | Common causes: workspace not onboarded to Microsoft 365 Defender portal, supported data sources (... | 1. Verify workspace is onboarded to Defender portal. 2. Confirm supported data sources are ingest... | 🔵 5.5 | ADO Wiki |
| 116 | Behaviors stopped appearing in BehaviorInfo table after previously working correctly in Sentinel ... | Data source ingestion stopped or paused, data moved to Basic or Archive tier, or workspace reache... | 1. Verify data source is still actively ingesting to Analytics tier. 2. Check for ingestion error... | 🔵 5.5 | ADO Wiki |
| 117 | Incident description is missing in Sentinel workspace view but appears correctly in XDR portal (U... | USX correlation engine design issue - incident description not synced properly from MTP to Sentin... | This is a known design limitation of the USX correlation engine. Workaround: view the incident in... | 🔵 5.5 | ADO Wiki |
| 118 | Incident description in XDR portal replaces special characters (colon, question mark, hash, equal... | USX correlation engine sanitizes incident descriptions by replacing special characters with under... | This is a known design limitation. URLs and text with special characters in incident descriptions... | 🔵 5.5 | ADO Wiki |
| 119 | Alert created by Sentinel analytic rule is not visible in the incident in Sentinel workspace, des... | Sentinel incidents can hold up to 150 alerts maximum. If a new alert is correlated into an incide... | This is a documented limitation. Check if the incident already has 150+ alerts. Consider splittin... | 🔵 5.5 | ADO Wiki |
| 120 | New incident created by MTP correlation engine is missing in Sentinel - only the updated (merged)... | MTP sync timing issue: Sentinel queries MTP database every ~5 minutes. If MTP creates a new incid... | This is a known timing design limitation of the MTP-Sentinel sync mechanism (~5 min polling inter... | 🔵 5.5 | ADO Wiki |
| 121 | User cannot access workbooks in the Defender portal even after assigning Sentinel permissions in ... | Workbook permissions (and Playbook Operator, Automation Contributor roles) are not governed by UR... | Assign the required permissions in Azure RBAC for workbooks and other unsupported resources; cont... | 🔵 5.5 | ADO Wiki |
| 122 | Filter/Split transformation rule does not apply after creation in Microsoft Sentinel Data Transfo... | The filter/split rule KQL query does not meet transformKQL requirements | Verify the rule meets transformKQL requirements. The user should receive an error message describ... | 🔵 5.5 | ADO Wiki |
| 123 | Split rule is greyed out for a table in Microsoft Sentinel Data Transformations | Missing prerequisites: table does not support DCRs or lake only mode, workspace is not MSG enable... | Verify: 1) User has Sentinel workspaces connected to Defender 2) User has Data Operations (Manage... | 🔵 5.5 | ADO Wiki |
| 124 | Filter rule is greyed out for a table in Microsoft Sentinel Data Transformations | Missing prerequisites: table does not support DCRs, or user lacks required permissions (Data Oper... | Verify: 1) User has Sentinel workspaces connected to Defender 2) User has Data Operations (Manage... | 🔵 5.5 | ADO Wiki |
| 125 | Red warning sign appears in Situational Awareness workbook and customer cannot see data from cert... | Known MFA cross-MTO issue where user has not completed 2FA sign-in for those tenants | Check if the red warning sign is visible on the bottom right of the page. Customer needs to sign ... | 🔵 5.5 | ADO Wiki |
| 126 | Customer opens Situational Awareness workbook and only sees data for one tenant instead of multip... | The tenant selector has not been configured to include multiple tenants | Use the tenant selector to include multiple tenants. Once more tenants have been added, the workb... | 🔵 5.5 | ADO Wiki |
| 127 | Customer cannot see the workbooks page in MTO navigation in Microsoft Sentinel | Customer has not added tenants in MTO settings page, or added tenants do not have any workbooks o... | Check if the customer has added one or more tenants in the MTO settings page. Verify those tenant... | 🔵 5.5 | ADO Wiki |
| 128 | Customer cannot see a specific workbook in MTO that they are using | The workbook is a template (templates not supported in MTO, only active content/workbooks) or the... | 1) Check if the workbook is a template - templates are currently not supported in MTO, only activ... | 🔵 5.5 | ADO Wiki |
| 129 ⚠️ | Microsoft Sentinel analytics rules (SIEM) not firing: no alerts generated from scheduled rules | Data is not fresh (ingestion delay), rule scheduling or lookback window misaligned with data late... | 1) Confirm data freshness in the workspace; 2) Review rule scheduling and widen the lookback wind... | 🔵 5.0 | MS Learn |
| 130 ⚠️ | Sentinel MCP tools not called by AI model in VS Code | Tools semantically overlapping, model limitations, context favored, or not onboarded | Choose right tool combo; use newer models; start new conversation; verify onboarding | 🔵 5.0 | MS Learn |
| 131 ⚠️ | Sentinel MCP tools return data from wrong workspace IDs | Multiple workspaces accessed; tools inconsistently select workspace | Use list_workspaces; specify workspace ID in prompt | 🔵 5.0 | MS Learn |
| 132 ⚠️ | Sentinel SIEM migration shows no recommendations after green checkmarks | No matches between uploaded rules and Sentinel OOTB analytics rules | Expected for custom rules; manually translate; create custom rules; verify data sources | 🔵 5.0 | MS Learn |
| 133 ⚠️ | Sentinel analytics rule query fails: function uses reserved word name | KQL function name conflicts with Kusto reserved word | Remove or rename the conflicting function; re-save analytics rule | 🔵 5.0 | MS Learn |
