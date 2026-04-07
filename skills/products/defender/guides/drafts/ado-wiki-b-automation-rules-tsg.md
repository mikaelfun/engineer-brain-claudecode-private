---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Automation/[TSG] - Automation Rules"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Automation/%5BTSG%5D%20-%20Automation%20Rules"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<!-- Required: Main title of the document -->
# TSG - Automation Rules

---
<!-- Required: Table of Contents -->
[[_TOC_]]

<!-- Required: Brief introduction to the feature/s-->
## Overview
---

Automation Rules provide event-driven orchestration and automated response capabilities for Microsoft Security products. The system enables customers to define conditional logic that triggers automated actions when security alerts, cases, or recommendations are created or updated. This streamlined automation reduces manual intervention, accelerates incident response, and ensures consistent security operations across the organization.

<!-- Required: Detailed description of the feature/s-->
### Feature Description
---

Automation Rules is a distributed microservices architecture embedded in the Microsoft Defender portal, designed to process security events and execute automated response actions based on customer-defined rules.

### Architecture Components

**Gateway Services (Event Ingestion)**

- **Alerts Gateway**: Consumes security alerts from Azure Event Hub
- **Case Management Gateway**: Consumes case updates from Service Bus
- **Recommendation Gateway**: Consumes security recommendations from Event Hub

Each gateway validates, filters, and publishes events to a centralized Service Bus queue for downstream processing.

**Rule Engine (Processing & Execution)**

- Processes events from Service Bus using session-based message processing
- Fetches applicable automation rules for the tenant from Cosmos DB (with caching)
- Evaluates rule conditions against event properties
- Executes configured actions via Unified Actions API
- Supports both event-driven (OnCreated/OnUpdated) and polling-based (scheduled checks) triggers

**Rules Management API (Configuration)**

- RESTful API for CRUD operations on automation rules
- RBAC-based authorization with workspace-level permissions
- Rule validation and versioning support
- Integration with Cosmos DB for persistent storage

**Trigger Types**

- **OnCreated**: Rule executes when a new alert, case, or recommendation is created
- **OnUpdated**: Rule executes when an existing resource is updated
- **Polling**: Rule executes on a schedule (e.g., every 3 hours) to check resource state changes

**Supported Actions**

- Update alert/case properties (severity, status, owner, tags, classification)
- Run playbooks (Logic Apps or Python-based SOAR playbooks)
- Send email notifications
- Tag resources
- Add comments
- Mobilize recommendations
- Custom actions via Unified Actions API

**Integration Model**

- All actions execute through the Unified Actions API, which provides a centralized execution layer
- Supports integration with external systems (Logic Apps, Microsoft Graph, custom APIs)
- Managed identity-based authentication for actions requiring Azure RBAC

**Visibility**

- Rule execution history visible in the Azure portal under Automation Rules
- Detailed telemetry available via Kusto (SecurityInsightsProd database)
- End-to-end tracing with trace IDs for debugging

<!-- Required: Requirements to use the feature/s-->
## Prerequisites
---

### Customer Requirements

-  **Microsoft Sentinel workspace** (or Defender XDR)
-  **Sentinel Contributor role** (Azure RBAC) or **Detection Tuning** (URBAC portal)
-  **Managed identity** with appropriate permissions for action execution (e.g., Microsoft Sentinel Contributor for alert updates)

### System Requirements

- Valid tenant ID onboarded to Amba Automation
- Event Hub or Service Bus configured for event ingestion
- Cosmos DB configured for rule storage

<!-- Optional: Costs/Billing to use the feature/s-->
## Costs
---

- **Rule Storage**: Minimal Cosmos DB storage costs (< $1/month per thousand rules)
- **Action Execution**: Costs depend on action types (Logic App runs, API calls, etc.)
- **No per-execution charges**: Automation Rules evaluation and processing are included at no additional cost

<!-- Optional: Known limitations of the feature/s-->
## Limitations and Workarounds
---
- **Limitation 1**: Maximum 1000 rules per tenant
 - **Limitation Workaround 1**: Contact support to request increase
- **Limitation 2**: Maximum 20 actions per rule
 - **Limitation Workaround 2**: Split logic into multiple rules or use playbooks for complex workflows
- **Limitation 3**: No cross-tenant automation
 - **Limitation Workaround 3**: Create separate rules for each tenant
- **Limitation 4**: Polling minimum frequency: 1 hour
 - **Limitation Workaround 4**: For sub-hour checks, use OnUpdated trigger or external scheduling
- **Limitation 5**: External libraries not supported in playbooks
 - **Limitation Workaround 5**: Use pre-approved libraries or request new library via support
- **Limitation 6**: Session processing timeout: 5 minutes
 - **Limitation Workaround 6**: Reduce action count or optimize playbook execution time

## Known issue/s
---
- **Issue 1: Rule not triggering after creation**
 - Internal tracking: [Bug #12345]
 - **Workaround**: Wait 5 minutes for cache refresh or manually disable/re-enable the rule

- **Issue 2: High latency during peak hours**
 - Internal tracking: [Performance #67890]
 - **Workaround**: Use polling rules for non-time-sensitive actions

## Common scenarios and Troubleshooting
---
### Scenario 1: Rule is not executing**

**Symptom**

Customer reports automation rule never triggers despite matching events

**Investigation Step 1: Verify Rule is Enabled**

- Navigate to Automation Rules in portal
- Check rule status shows "Enabled"

**Investigation Step 2: Check Event Reached Gateway**

```kql
// Check if events are being ingested
Span
| where env_time > ago(1h)
| where name contains "Microsoft.Security.Amba.Automation"
| where serviceName == "AutomationAlertsGateway" // or AutomationCasesGateway
| where tenantId == "<customer-tenant-id>"
| summarize count() by bin(env_time, 5m)
```

- **No results?**  Events not reaching gateway (escalate to Gateway team)

**Investigation Step 3: Verify Rule Conditions Match Event**

- Use [Query 3: Rule Evaluation Breakdown](plans/TSG_UNIFIED_INVESTIGATION_GUIDE.md#query-3-rule-evaluation-breakdown)
- Look for `ConditionsResult = false`
- Common issues:
 - Case sensitivity mismatch (e.g., "High" vs "high")
 - Property not available (e.g., trying to use "UpdatedBy" in OnCreated trigger)
 - Incorrect operator (e.g., "Equals" instead of "Contains")

**Investigation Step 4: Check Trigger Type Alignment**

- Ensure trigger type (OnCreated/OnUpdated) matches event type
- Example: Rule with OnCreated trigger won't fire for alert updates

**Cause**

Rule conditions don't match event properties, trigger type misalignment, or events not reaching system

**Resolution**

If all checks pass but rule still doesn't execute, collect trace IDs and escalate to Rule Engine team.

### Scenario 2: Actions are failing with permission errors

**Symptom**

Rule executes but actions fail with 401/403 errors

**Investigation Step 1: Identify Failed Actions**

- Use [Query 4: Action Execution Details](plans/TSG_UNIFIED_INVESTIGATION_GUIDE.md#query-4-action-execution-details)
- Look for `API Call Status =  Failed`
- Check `Exception` column for "Unauthorized" or "Forbidden"

**Investigation Step 2: Verify Managed Identity Permissions**

```bash
# Check managed identity RBAC assignments
az role assignment list --assignee <managed-identity-object-id> --all
```

- Required roles depend on action type:
 - **Update Alert**: Microsoft Sentinel Contributor
 - **Run Playbook**: Logic App Contributor (on specific Logic App)
 - **Send Email**: No specific role (uses system identity)

**Investigation Step 3: Check Workspace-Level Permissions**

- Verify managed identity has access to target workspace
- Navigate to workspace IAM  Check managed identity is assigned

**Investigation Step 4: Validate Action Configuration**

- Ensure action target exists (e.g., Logic App not deleted)
- Verify action parameters are valid (e.g., valid email addresses)

**Cause**

Missing RBAC permissions on managed identity for target resources/workspaces

**Resolution**

Add required RBAC role to automation managed identity for the target resource/workspace.

### Scenario 3: Rule triggers but actions take too long

**Symptom**

Actions complete successfully but with high latency (> 2 minutes)

**Investigation Step 1: Measure End-to-End Latency**

- Use [Query 5: Complete Rule Execution Flow](plans/TSG_UNIFIED_INVESTIGATION_GUIDE.md#query-5-complete-rule-execution-flow-end-to-end)
- Check `DurationMs` for each operation
- **Benchmarks**:
 - Gateway  Service Bus: < 5s
 - Service Bus  Rule Engine: < 10s
 - Rule Evaluation: < 2s
 - Action Execution: < 30s
 - **Total**: < 60s

**Investigation Step 2: Identify Bottleneck**

- **High Gateway duration?**  Event Hub throughput issue (escalate to Gateway team)
- **High Rule Evaluation duration?**  Complex rule conditions (simplify conditions)
- **High Action Execution duration?**  Check action type:
 - **Run Playbook**: Check playbook execution time in Logic Apps
 - **Update Alert**: Check Unified Actions API latency
 - **Send Email**: Check email service status

**Investigation Step 3: Check for Rate Limiting**

```kql
// Look for 429 errors
Span
| where env_time > ago(1h)
| where name contains "Microsoft.Security.Amba.Automation"
| where tenantId == "<customer-tenant-id>"
| where env_properties contains "429"
```

- Rate limiting triggers automatic retry (no action needed unless persistent)

**Cause**

Bottleneck in gateway processing, complex rule evaluation, slow action execution, or rate limiting

**Resolution**

Optimize rule conditions, reduce action count, or contact support for throughput increase.

### Scenario 4: Rule execution shows "Session Stuck"

**Symptom**

Rule processing stops mid-execution, no new rules execute

**Investigation Step 1: Check Session State**

- Use [Query 2: Session State Information](plans/TSG_UNIFIED_INVESTIGATION_GUIDE.md#query-2-session-state-information)
- Look for sessions with last message > 5 minutes ago
- Check `Rule Index` and `Action Index` progress

**Investigation Step 2: Identify Stuck Operation**

- **Rule Index not progressing?**  Specific rule causing hang
- **Action Index increasing slowly?**  Action taking too long (e.g., playbook timeout)

**Investigation Step 3: Force Session Completion**

- Sessions auto-timeout after 5 minutes
- No manual intervention required
- New events will start new sessions

**Cause**

Rule causing infinite loop, action timeout, or session processing deadlock

**Resolution**

If sessions frequently get stuck on same rule, review rule configuration for infinite loops or excessive action counts. Escalate to Rule Engine team if issue persists.

### Scenario 5: Polling rule not executing on schedule

**Symptom**

Polling-based rule doesn't execute at configured interval

**Investigation Step 1: Verify Polling Configuration**

- Check rule configuration shows correct polling frequency (e.g., every 3 hours)
- Ensure rule is enabled

**Investigation Step 2: Check Last Execution Time**

```kql
// Find last polling execution
Span
| where env_time > ago(7d)
| where name contains "Microsoft.Security.Amba.Automation"
| where serviceName == "AutomationRuleEngine"
| where env_properties.CurrentRuleId == "<rule-id>"
| where env_properties contains "Polling"
| summarize LastExecution = max(env_time)
```

**Investigation Step 3: Validate Polling Trigger Message**

- Polling requires scheduler service to send poll-check messages
- Verify scheduler is running (check service health)

**Investigation Step 4: Check for Polling Errors**

- Use [Query 1: Rule Execution Telemetry](plans/TSG_UNIFIED_INVESTIGATION_GUIDE.md#query-1-automation-rule-execution-telemetry)
- Filter for polling executions
- Look for exceptions

**Cause**

Scheduler service not sending messages, or rule evaluation failing on polling-specific constraints

**Resolution**

If scheduler is not sending messages, escalate to Rule Engine team. If rule evaluation fails, review condition configuration (polling rules cannot use event-specific properties).

### Scenario 6: Graph integration added but fails with 4xx during execution

**Symptom**

Actions requiring Graph API (e.g., update alert, send email) fail with 400/403/404 errors

**Investigation Step 1: Verify App Registration Permissions**

- Navigate to Azure AD  App Registrations
- Find managed identity app
- Check API Permissions  Microsoft Graph
- Required permissions depend on action:
 - **Update Alert**: SecurityAlert.ReadWrite.All
 - **Send Email**: Mail.Send

**Investigation Step 2: Grant Admin Consent**

- API permissions require admin consent
- Click "Grant admin consent for [tenant]"
- **Note**: Permissions can take up to 30 minutes to propagate

**Investigation Step 3: Check Token Claims**

- Enable diagnostic logging on Unified Actions API
- Verify access token includes required scopes

**Investigation Step 4: Validate Graph API Call**

- Use [Query 4: Action Execution Details](plans/TSG_UNIFIED_INVESTIGATION_GUIDE.md#query-4-action-execution-details)
- Check `Error Message` for specific Graph API error
- Common issues:
 - **400 Bad Request**: Invalid parameter format
 - **403 Forbidden**: Missing permission or consent
 - **404 Not Found**: Resource deleted or incorrect ID

**Cause**

Missing Microsoft Graph API permissions or admin consent not granted

**Resolution**

Grant admin consent and wait 30 minutes. If issue persists, check Graph API status or escalate to Unified Actions team.

## Required Kusto Access
---
Refer to the [Microsoft Sentinel - Kusto Permissions]([https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/3313/Sentinel-P](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/3313/Sentinel-Permissions "https://dev.azure.com/asim-security/infrastructure%20solutions/_wiki/wikis/sentinel/3313/sentinel-permissions")) wiki page to see how to gain the appropriate access.

**Cluster**: `https://securityinsights.kusto.windows.net`

**Database**: `SecurityInsightsProd`

**Tables**:
- `Span` - Operation telemetry (method calls, durations, success/failure)
- `Log` - Detailed log messages (errors, warnings, informational)

### Setup Parameters

**Set these parameters before running any queries**:

```kql
// Investigation Parameters
let _startTime = datetime(2026-01-19T00:00:00Z); // Adjust to your time range
let _endTime = datetime(2026-01-20T00:00:00Z); // Or use: ago(24h) and now()
let _tenantId = '<tenant-id>'; // Required: Customer tenant ID
let _ruleId = ''; // Optional: Specific rule ID, leave empty for all
let _resourceId = ''; // Optional: Specific resource ID (alert/case/recommendation)
let _traceId = ''; // Optional: For end-to-end trace (get from Query 1)
```

### Query 1: Automation Rule Execution Telemetry

**When to use**: See all rule executions with outcomes and errors for a customer

**Purpose**: Identify if rules are executing, if conditions match, and if there are any execution failures

```kql
let _startTime = datetime(2026-01-19T00:00:00Z);
let _endTime = datetime(2026-01-20T00:00:00Z);
let customerTenantId = _tenantId;
let ruleId = _ruleId; // Optional: specific rule ID
let resourceId = _resourceId; // Optional: specific alert/case/recommendation ID

Span
| where env_time between (_startTime .. _endTime)
| where name contains "Microsoft.Security.Amba.Automation"
| where serviceName == "AutomationRuleEngine"
| where tenantId == customerTenantId
| where name == "Microsoft.Security.Amba.Automation.RuleEngine.Infrastructure.RuleProcessor.ProcessSingleRuleAsync"
| where isempty(ruleId) or tostring(env_properties.CurrentRuleId) == ruleId
| where isempty(resourceId) or tostring(env_properties.ResourceId) == resourceId
| extend
 RuleId = tostring(env_properties.CurrentRuleId),
 RuleName = tostring(env_properties.RuleName),
 ResourceType = tostring(env_properties.ResourceType),
 ResourceId = tostring(env_properties.ResourceId),
 ConditionsResult = tobool(env_properties.ConditionsResult),
 EventInstanceId = tostring(env_properties.EventInstanceId),
 SessionId = tostring(env_properties.SessionId),
 ExceptionType = tostring(env_properties['Event-0-exception.exception.type']),
 ExceptionMessage = tostring(env_properties['Event-0-exception.exception.message'])
| project
 Timestamp = env_time,
 ["Rule ID"] = RuleId,
 ["Rule Name"] = RuleName,
 ["Resource Type"] = ResourceType,
 ["Resource ID"] = ResourceId,
 ["Conditions Matched"] = iff(ConditionsResult, " Yes", " No"),
 ["Execution Status"] = iff(success, " Success", " Failed"),
 ["Exception"] = ExceptionType,
 ["Error Message"] = ExceptionMessage,
 ["Trace ID"] = env_dt_traceId,
 ["Event Instance"] = EventInstanceId
| order by Timestamp desc
```

**What to look for**:
- No results  Rule never executed (check if events reached gateway)
- Conditions Matched =  No  Rule conditions don't match the event
- Execution Status =  Failed  System error, check Exception and Error Message
- Copy the **Trace ID** for Query 5 (end-to-end trace)

### Query 2: Session State Information

**When to use**: Debug session-based processing, investigate "session stuck" issues

**Purpose**: See session processing progress and identify stuck sessions

```kql
let customerTenantId = _tenantId;
let ruleId = _ruleId; // Optional: specific rule ID
let resource_Id = _resourceId;

Log
| where env_time between (_startTime .. _endTime)
| where name contains "Microsoft.Security.Amba.Automation"
| where tenantId == customerTenantId
| where name contains "SessionStateManager"
| where isempty(ruleId) or tostring(env_properties.CurrentRuleId) == ruleId
| where isempty(resource_Id) or tostring(env_properties.ResourceId) == resource_Id
| extend
 SessionId = tostring(env_properties.SessionId),
 ResourceType = tostring(env_properties.ResourceType),
 ResourceId = tostring(env_properties.ResourceId),
 CurrentRuleId = tostring(env_properties.CurrentRuleId),
 RuleCount = toint(env_properties.RuleCount),
 CurrentRuleIndex = toint(env_properties.CurrentRuleIndex),
 CurrentActionIndex = toint(env_properties.CurrentActionIndex)
| project
 Timestamp = env_time,
 ["Session ID"] = SessionId,
 ["Resource Type"] = ResourceType,
 ["Resource ID"] = ResourceId,
 ["Current Rule ID"] = CurrentRuleId,
 ["Total Rules"] = RuleCount,
 ["Rule Index"] = CurrentRuleIndex,
 ["Action Index"] = CurrentActionIndex,
 ["Message"] = body,
 ["Severity"] = severityText,
 ["Trace ID"] = env_dt_traceId
| order by Timestamp desc
```

**What to look for**:
- Last message timestamp > 5 minutes ago  Session may be stuck
- Rule Index not progressing  Session stuck on specific rule
- Action Index increasing  Multiple actions executing

### Query 3: Rule Evaluation Breakdown

**When to use**: Understand why rule conditions didn't match the event

**Purpose**: See detailed condition evaluation results and validation errors

```kql
let customerTenantId = _tenantId;
let ruleId = _ruleId; // Optional: specific rule ID
let resourceId = _resourceId;

Span
| where env_time between (_startTime .. _endTime)
| where name contains "Microsoft.Security.Amba.Automation"
| where serviceName == "AutomationRuleEngine"
| where tenantId == customerTenantId
| where name == "Microsoft.Security.Amba.Automation.RuleEngine.ConditionEvaluation.Implementations.AutomationRuleEvaluator.EvaluateAsync"
| where isempty(ruleId) or tostring(env_properties.CurrentRuleId) == ruleId
| where isempty(resourceId) or tostring(env_properties.ResourceId) == resourceId
| extend
 RuleId = tostring(env_properties.CurrentRuleId),
 EvaluationResult = tobool(env_properties.EvaluationResult),
 EvaluatorType = tostring(env_properties.EvaluatorType),
 EvaluationStage = tostring(env_properties.EvaluationStage),
 ValidationFailed = tostring(env_properties.ValidationFailedValidator),
 ResourceId = tostring(env_properties.ResourceId),
 durationMs = datetime_diff('millisecond', env_time, startTime)
| project
 Timestamp = env_time,
 ["Rule ID"] = RuleId,
 ["Resource ID"] = ResourceId,
 ["Evaluation Result"] = iff(EvaluationResult, " Matched", " Not Matched"),
 ["Evaluator Type"] = EvaluatorType,
 ["Stage"] = EvaluationStage,
 ["Validation Error"] = ValidationFailed,
 ["Duration (ms)"] = durationMs,
 ["Trace ID"] = env_dt_traceId
| order by Timestamp desc
```

**What to look for**:
- Evaluation Result =  Not Matched  Conditions don't match event
- Validation Error (not empty)  Rule configuration issue
- High duration  Complex rule or performance issue

### Query 4: Action Execution Details

**When to use**: Investigate why actions are failing

**Purpose**: See executed actions, their status, and error details

```kql
let _startTime = datetime(2026-01-19T00:00:00Z);
let _endTime = datetime(2026-01-20T00:00:00Z);
let customerTenantId = _tenantId;
let ruleId = _ruleId;
let resourceId = _resourceId;

Span
| where env_time between (_startTime .. _endTime)
| where name contains "Microsoft.Security.Amba.Automation"
| where serviceName == "AutomationRuleEngine"
| where tenantId == customerTenantId
| where name contains "Microsoft.Security.Amba.Automation.RuleEngine.Clients.UnifiedActionsClient"
| where isempty(ruleId) or tostring(env_properties.CurrentRuleId) == ruleId
| where isempty(resourceId) or tostring(env_properties.ResourceId) == resourceId
| extend
 ActionIndicator = parse_json(tostring(env_properties.ActionIndicator)),
 RuleId = tostring(env_properties.CurrentRuleId),
 ResourceId = tostring(env_properties.ResourceId),
 JobId = tostring(env_properties.jobId),
 JobStatus = tostring(env_properties.JobStatus),
 ExceptionType = tostring(env_properties['Event-0-exception.exception.type']),
 ExceptionMessage = tostring(env_properties['Event-0-exception.exception.message'])
| extend
 ActionProvider = tostring(ActionIndicator.actionProviderType),
 ActionType = tostring(ActionIndicator.actionType)
| project
 Timestamp = env_time,
 ["Rule ID"] = RuleId,
 ["Resource ID"] = ResourceId,
 ["Action Provider"] = ActionProvider,
 ["Action Type"] = ActionType,
 ["API Call Status"] = iff(success, " Success", " Failed"),
 ["Job ID"] = JobId,
 ["Job Status"] = JobStatus,
 ["Exception"] = ExceptionType,
 ["Error Message"] = ExceptionMessage,
 ["Trace ID"] = env_dt_traceId
| order by Timestamp desc
```

**What to look for**:
- API Call Status =  Failed  Check Exception and Error Message
- Job Status = "Failed"  Action execution failed (even if API call succeeded)
- Job Status = "Running"  Action still executing
- Common errors: 401/403 (permissions), 404 (resource not found), 429 (rate limit)

### Query 5: Complete Rule Execution Flow (End-to-End)

**When to use**: Trace complete execution from event receipt through action completion

**Purpose**: Follow an execution end-to-end using a trace ID from Query 1

```kql
let _startTime = datetime(2026-01-19T00:00:00Z);
let _endTime = datetime(2026-01-20T00:00:00Z);
let targetTraceId = _traceId; // Get from Query 1

union kind=outer
(
 Span
 | where env_time between (_startTime .. _endTime)
 | where name contains "Microsoft.Security.Amba.Automation"
 | where env_dt_traceId == targetTraceId
 | project
 Timestamp = env_time,
 Type = "Span",
 Service = serviceName,
 Operation = name,
 Details = "",
 Success = tostring(success),
 DurationMs = datetime_diff("millisecond", env_time, startTime)
),
(
 Log
 | where env_time between (_startTime .. _endTime)
 | where name contains "Microsoft.Security.Amba.Automation"
 | where K8S_CLUSTER_NAME contains "406"
 | where env_dt_traceId == targetTraceId
 | project
 Timestamp = env_time,
 Type = "Log",
 Service = serviceName,
 Operation = name,
 Details = body,
 Success = tostring(severityText),
 DurationMs = long(null)
)
| order by Timestamp asc
```

**What to look for**:
- Timeline from Gateway  Service Bus  Rule Engine  Actions
- High DurationMs  Performance bottleneck
- Success = "False" or "Error"  Failure point in the flow

### Query 6: Collect User Flow - All Automation Rule APIs

**When to use**: Track CRUD operations on automation rules via WebAPI

**Purpose**: See all rule management operations (create, update, delete, get, list)

```kql
// Step 1: Get trace IDs for rule management operations
let _startTime = ago(24h); // Adjust time range
let _tenantId = '<customer-tenant-id>';
let ids = database("SecurityInsightsProd").Log
| where env_time > _startTime
| where APP_NAME == "automation-webapi"
| where env_properties has _tenantId
| where env_properties has_any ("createRule", "updateRule", "deleteRule", "getRule", "listRules")
| distinct env_dt_traceId;

// Step 2: Get all operations for these traces
database("SecurityInsightsProd").Span
| where env_time > _startTime
| where APP_NAME == "automation-webapi"
| where env_dt_traceId in (ids)
| extend path = tostring(env_properties["url.path"])
| project-reorder env_time, path, httpStatusCode, httpMethod, name
| order by env_time asc
```

### Query 7: "My automation rule isn't working"

**When to use**: Get all automation activity for a customer with failures highlighted

**Purpose**: Quick overview of all failures and errors for troubleshooting

```kql
let customerTenantId = _tenantId;

union
 (Span
 | where env_time between (_startTime .. _endTime)
 | where name contains "Microsoft.Security.Amba.Automation"
 | extend type = "Span", StatusField = tostring(success)),
 (Log
 | where env_time between (_startTime .. _endTime)
 | where name contains "Microsoft.Security.Amba.Automation"
 | where K8S_CLUSTER_NAME contains "406"
 | extend type = "Log", startTime = env_time, StatusField = severityText)
| where tenantId == customerTenantId
| extend
 Activity = case(
 name contains "ProcessMessageAsync", " Event Received",
 name contains "EvaluateAsync", " Rule Evaluated",
 name contains "ExecuteActionAsync", " Action Executed",
 name contains "Gateway", " Gateway Processing",
 body contains "filtered out", " Event Filtered",
 " Other"
 ),
 Status = case(
 StatusField in ("True", "true", "Information"), " Success",
 StatusField in ("False", "false", "Error"), " Failed",
 StatusField == "Warning", " Warning",
 " Info"
 )
| project tenantId, env_time, Activity, Status, serviceName, ["Trace ID"] = env_dt_traceId, body
| where Status != " Success"
| order by env_time desc
```

### Investigation Workflow

**Quick Start (5 Minutes)**:
1. Set parameters at the top
2. Run Query 1  See all rule executions
3. Check results:
 - No results?  Events not reaching Rule Engine
 - Conditions Matched = ?  Run Query 3 (evaluation breakdown)
 - Execution Status = ?  Check Exception column
4. Copy Trace ID from a specific execution
5. Run Query 5  See complete end-to-end flow

**Deep Dive (20 Minutes)**:
1. Query 1  Identify failed executions or condition mismatches
2. Query 3  Check detailed condition evaluation
3. Query 4  Verify action execution and errors
4. Query 2  Check session state if processing seems stuck
5. Query 5  Trace complete flow for specific execution

### Common Error Patterns

| Error/Status | Meaning | Action |
|--------------|---------|--------|
| No results in Query 1 | Rule never executed | Check if events reached gateway |
| ConditionsResult = false | Rule conditions don't match | Review rule conditions vs event properties |
| API Call Status = Failed + 401/403 | Permission issue | Check managed identity permissions |
| API Call Status = Failed + 404 | Resource not found | Verify resource still exists |
| API Call Status = Failed + 429 | Rate limited | Normal, system retries automatically |
| Job Status = "Failed" | Action execution failed | Check error message in Query 4 |
| Session stuck (Query 2) | Session not progressing | Check for long-running operations |

<!-- Optional: Details about useful Troubleshooting dashboards-->

## Troubleshooting Dashboards
---
|Name|Access Requirements|Notes|
|--|--|--|
|`<Dashboard-Name-Placeholder>`|`<Access-Requirements-Placeholder>`|`<Notes-Placeholder>`|

<!-- Required: Details required to escalate issues to the Product Group-->
## Escalating to Product Group (PG)
---
Before creating the IcM, make sure you have exhausted all the steps in this document.

### Required Information

**Customer Details**:
- Tenant ID: `_________________`
- Affected workspace(s): `_________________`
- Rule ID(s): `_________________`
- Time range (UTC): `_________________` to `_________________`

**Impact Assessment**:
- Number of affected rules: `_________________`
- Business impact: [ ] High [ ] Medium [ ] Low
- Customer severity: [ ] Sev 1 [ ] Sev 2 [ ] Sev 3 [ ] Sev 4
- Still occurring: [ ] Yes [ ] No

**Investigation Results**:
- [ ] Ran Query 1 (Rule Execution Telemetry) - [Attach results]
- [ ] Ran Query 3 (Rule Evaluation Breakdown) - [Attach results]
- [ ] Ran Query 4 (Action Execution Details) - [Attach results]
- [ ] Ran Query 5 (End-to-End Flow) - [Attach results]
- [ ] Collected Trace ID(s): `_________________`

**Key Findings**:
- Error pattern: `_________________`
- Exception type: `_________________`
- Exception message: `_________________`
- Affected component: [ ] Gateway [ ] Rule Engine [ ] Unified Actions [ ] WebAPI

**Supporting Data**:
- Screenshots of portal errors (if applicable)
- Rule configuration JSON
- Sample event payload
- Kusto query results (CSV or screenshot)

### IcM Escalation Path Lookup
Refer to the IcM escalation path lookup page to route your IcM to the appropriate team.

- [Microsoft Sentinel - Escalation Path Lookup]([https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/3314/Sentinel-P](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/3314/Sentinel-PG-Dev-lookup-escalation-path "https://dev.azure.com/asim-security/infrastructure%20solutions/_wiki/wikis/sentinel/3314/sentinel-pg-dev-lookup-escalation-path"))

| Issue Type | Team | Routing Path |
|-----------|------|--------------|
| **Events not reaching gateway** | Gateway Team | Microsoft Sentinel Automation  Triage - Event Processing |
| **Rules not triggering** | Rule Engine Team | Microsoft Sentinel Automation  Triage - SOAR |
| **Rule conditions not matching** | Rule Engine Team | Microsoft Sentinel Automation  Triage - SOAR |
| **Actions failing (API errors)** | Unified Actions Team | Microsoft Sentinel Actions  UNIACT |
| **Actions failing (execution errors)** | Unified Actions Team | Microsoft Sentinel Actions  UNIACT |
| **WebAPI errors (CRUD operations)** | WebAPI Team | Microsoft Sentinel Automation  Triage - SOAR |
| **Performance issues** | Performance Team | Microsoft Sentinel Automation  Triage - Performance |
| **Polling not working** | Rule Engine Team | Microsoft Sentinel Automation  Triage - SOAR |

<!-- Optional: Frequently Asked Questions-->
## Frequently Asked Questions (FAQs)
---
**Q1: How long does it take for a new automation rule to become active?**
- Immediately after creation. Rules are cached with a 5-minute TTL, so the first execution may fetch from Cosmos DB, but subsequent executions use the cache for better performance.

**Q2: What happens if an action fails during execution?**
- The action failure is logged with error details, but the system continues processing remaining actions in the rule. There is no automatic retry for individual action failures (except for 429 rate-limit errors, which are retried automatically by the Unified Actions API).

**Q3: Why isn't my automation rule triggering?**
- Common reasons:
 1. Rule is disabled
 2. Trigger type doesn't match event (OnCreated vs OnUpdated)
 3. Rule conditions don't match event properties (case sensitivity, incorrect operator)
 4. Event was filtered out by gateway (wrong product type, severity threshold)
 5. Tenant not onboarded to Amba Automation
- **How to debug**: Use [Query 1](plans/TSG_UNIFIED_INVESTIGATION_GUIDE.md#query-1-automation-rule-execution-telemetry) to check if rule executed and [Query 3](plans/TSG_UNIFIED_INVESTIGATION_GUIDE.md#query-3-rule-evaluation-breakdown) to see condition evaluation results.

**Q4: Can I trigger the same rule for both OnCreated and OnUpdated events?**
- No, each rule can only have one trigger type. Create separate rules for OnCreated and OnUpdated if you need both.
- **Workaround**: Use OnUpdated with a condition checking if a specific property changed (e.g., "Status changed to 'New'").

**Q5: How can I debug why my rule condition isn't matching?**
- Use the [Rule Evaluation Breakdown query](plans/TSG_UNIFIED_INVESTIGATION_GUIDE.md#query-3-rule-evaluation-breakdown) to see detailed condition evaluation results, including which properties were checked and any validation errors.
- **Tip**: Common issues are case sensitivity ("High" vs "high"), incorrect operators ("Equals" vs "Contains"), or properties not available for the resource type.

**Q6: Are automation rules workspace-specific or tenant-specific?**
- Automation rules are **tenant-level**, not workspace-level. However, you can configure rule scopes to filter by workspace ID if you need workspace-specific behavior.

**Q7: What is the maximum number of rules I can create?**
- The default limit is 1000 rules per tenant. Contact support if you need to increase this limit.

**Q8: Can I execute custom actions via Automation Rules?**
- Yes, Automation Rules support running custom Logic Apps (playbooks). For more advanced scenarios, you can also use the Unified Actions API directly.

**Q9: How do I know if my action executed successfully?**
- Use [Query 4: Action Execution Details](plans/TSG_UNIFIED_INVESTIGATION_GUIDE.md#query-4-action-execution-details) to check both the API call status and the job status. An action is only successful if both show success.

**Q10: What permissions does the managed identity need?**
- Required permissions depend on action types:
 - **Update Alert/Case**: Microsoft Sentinel Contributor (on workspace)
 - **Run Playbook**: Logic App Contributor (on specific Logic App resource)
 - **Send Email**: No specific role required (uses system identity)
 - **Tag Resources**: Tag Contributor (on target resource)
- **Tip**: Always use the principle of least privilege - only grant permissions needed for specific actions.

**Q11: Can I use polling rules to check external systems?**
- Not directly. Polling rules can only evaluate properties of alerts, cases, or recommendations within Microsoft Security. For external system checks, use a scheduled Logic App playbook instead.

**Q12: How do I test a rule without waiting for a real event?**
- Currently, there is no built-in test mode. Best practice:
 1. Create the rule in disabled state
 2. Enable it temporarily during a controlled test period
 3. Generate a test alert/case that matches the conditions
 4. Verify execution in Kusto
 5. Disable the rule until ready for production

<!-- Optional: Details required to explain acronyms-->
## Acronyms
---

| Acronyms | Definition |
|--|--|
| SOAR | Security Orchestration, Automation, and Response |
| RBAC | Role-Based Access Control |
| PG | Product Group |
| IcM | Incident Management |
| TSG | Troubleshooting Guide |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| TTL | Time To Live |
| URBAC | Unified Role-Based Access Control |
| XDR | Extended Detection and Response |

---
| Contributor Name | Details | Date(DD/MM/YYYY) |
|--|--|--|
| Ofek Lutzky | Initial version | 19/02/2026 |

---
:::template /.templates/Wiki-Feedback.md 
:::

---
:::template /.templates/Ava-GetHelp.md 
:::