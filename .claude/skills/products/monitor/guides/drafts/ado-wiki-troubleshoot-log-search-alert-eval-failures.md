---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Log Search Alert evaluation failures and Resource Health events for Log Search Alert Rules"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20Log%20Search%20Alert%20evaluation%20failures%20and%20Resource%20Health%20events%20for%20Log%20Search%20Alert%20Rules"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Log Search Alert Evaluation Failures and Resource Health Events

## Scenario
Log Search Alert Resource Health issues or Log Search Alert evaluation failures.

## Step 1: Understand the customer scenario

### Check Resource Health events
Check recent Resource Health events for the Log Search alert rule using ASC.
Look up the error message at "Resource Health for Log Search Alerts" wiki.

### Check evaluation history
Follow step 2 of "Troubleshooting Log Search alert didn't fire when it should (Missed Alert)".

### Check evaluation logs
From evaluation history, select "logs" link to open full error messages.

## Step 2: Troubleshoot by category

### Semantic and syntax errors (not ADX cluster related)

1. **Query syntax errors** (e.g., "Could not be parsed at [] on line []"):
   - Run the customer's configured query to reproduce the error
   - If reproducible → fix syntax error
   - If not reproducible → run troubleshooting query (step 4 of Log Search Missed Alert TSG)
   - If internal manipulations cause the error → escalate (see Getting Help)

2. **"Cannot compare values of types string and datetime"**:
   - Root cause: Customer converted TimeGenerated from datetime to string type
   - Solution: Use `extend` operator to create a new string-based column, or use default TimeGenerated without changing type

3. **"Failed to resolve table or column expression"**:
   - Root cause: Query references a table or column that doesn't exist (wrong scope, solution not installed)
   - Solution: Verify the table is accessible and queryable in the target scope

4. **"Failed to resolve column or scalar expression"**:
   - Root cause: Column selected in Measure/Dimensions is not returned by the alert rule query
   - Note: Validation now blocks such rules; existing rules may predate the validation or used `-skipQueryValidation` flag
   - Solution: Ensure the column is returned by the query, or change measure/dimension to a returned field

### Throttling / Service Unavailable / Partial Errors

**ARG (Azure Resource Graph) Throttling:**
- ARG throttles on user-level. Same managed identity across many ARG log alert rules increases concurrent queries probability
- Diagnostic query (azalertsprodweu cluster, LogSearchRule database):
  ```kql
  let clientId = "";
  cluster('azalertsprodweu.westeurope').database('LogSearchRule').
  lsa_dependencies
  | where timestamp > ago(12h)
  | where name =~ "draft"
  | where operation_Name == "kusto-execute-search"
  | where data == "Execute Query"
  | extend requestManagedIdentity = tostring(customDimensions["Request.ManagedIdentity"])
  | extend client = extract_json("$.ClientId", requestManagedIdentity, typeof(string))
  | where client =~ clientId
  | extend alertRuleId = tostring(customDimensions["AlertRule.ArmResourceId"])
  | distinct clientId, alertRuleId
  ```
- Solution: Split rules across multiple managed identities

**Log Analytics Throttling / Service Unavailable / Partial Error:**
- Get Draft Request IDs using "How to get the Draft request ID for a Log Alert evaluation"
- Follow "Common Queries Issues and How to Handle Them" TSG
- Diagnostic query to check underlying Kusto cluster failures:
  ```kql
  let requestIds = datatable(id:string) [
  'draft request id 1',
  'draft request id 2'
  ];
  requests
  | where timestamp between(datetime(2024-12-17 22:00)..datetime(2024-12-17 22:40))
  | where operation_ParentId in (requestIds)
  | extend workspaceKustoCluster = todynamic(customDimensions['Workspace.kustoCluster'])
  | project timestamp, operation_ParentId, resultCode, workspaceKustoCluster
  ```
- Escalation: Follow "Escalating to Azure Log Analytics Draft team" and change SAP to Log Analytics query execution issue

### Access Issues (unauthorized, forbidden, managed identity, NSP)

**Network Security Perimeter (NSP):**
1. Familiarize with "Log Data Access for Log Search Alert Rules" and "Network Security Perimeter Wiki Resources"
2. Check NSP property of the Alert Rule from ASC
3. Identify relevant Log Analytics workspace
4. Check NSP property of the workspace from ASC
5. If workspace is within NSP and alert rule is NOT → alert rule can't access workspace → 403 or hidden results

**Non-NSP Authorization Issues:**
- **Rules NOT using managed identity (MI):**
  - Permissions based on the last user to edit the rule at the time of last edit
  - Error means that user didn't have permissions to query target scope/table
  - Solution: Edit the alert rule (enable/disable) with user credentials that have access

- **Rules USING managed identity (MI):**
  - Identity must have: Read access to ALL workspaces accessed by the query
  - For resource-centric rules: may access multiple workspaces, identity needs access to all
  - For cross-service queries (e.g., `adx()` function): needs read access on ADX cluster and explicit database access
  - Use "How to get Log Analytics workspaces used by resource centric Log alert rules from Kusto" to find all workspaces

### Query Cost Issues
- Get Draft Request IDs → follow "Common Queries Issues and How to Handle Them"
- Escalation: "Escalating to Azure Log Analytics Draft team"

### Generic Cross-Service (ADX/ARG) Query Issues
- Follow "How to interpret log alert evaluation failure messages - managed identity specific exceptions"

## IcM Escalation
- Alerts team: TSG-ProductTeamEscalation template
- Log Analytics Draft team: for query execution issues
