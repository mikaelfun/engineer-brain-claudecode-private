# Defender Sentinel 自动化与 Playbook — 排查工作流

**来源草稿**: ado-wiki-a-playbook-generator-tsg.md, ado-wiki-a-r5-workflow-automation-product-knowledge.md, ado-wiki-b-automation-rules-tsg.md, ado-wiki-d-tsg-automation-rules.md, ado-wiki-e-playbook-send-email-automation-rule-created.md
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: Playbook Generator (SOAR NL) TSG
> 来源: ado-wiki-a-playbook-generator-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Authoring Model (Cline Agent + VS Code Environment)
2. Code Generation & System Constraints
3. Integration and Execution Model
4. Visibility

### Portal 导航路径
- editor at a time
- session at a time

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 2: Workflow Automation
> 来源: ado-wiki-a-r5-workflow-automation-product-knowledge.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 3: TSG - Automation Rules
> 来源: ado-wiki-b-automation-rules-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Set parameters at the top
2. Run Query 1  See all rule executions
3. Check results:
4. Copy Trace ID from a specific execution
5. Run Query 5  See complete end-to-end flow
6. Query 1  Identify failed executions or condition mismatches
7. Query 3  Check detailed condition evaluation
8. Query 4  Verify action execution and errors
9. Query 2  Check session state if processing seems stuck
10. Query 5  Trace complete flow for specific execution

### Portal 导航路径
- Automation Rules in portal
- workspace IAM  Check managed identity is assigned
- Azure AD  App Registrations

### Kusto 诊断查询
**查询 1:**
```kusto
// Check if events are being ingested
Span
| where env_time > ago(1h)
| where name contains "Microsoft.Security.Amba.Automation"
| where serviceName == "AutomationAlertsGateway" // or AutomationCasesGateway
| where tenantId == "<customer-tenant-id>"
| summarize count() by bin(env_time, 5m)
```

**查询 2:**
```kusto
// Look for 429 errors
Span
| where env_time > ago(1h)
| where name contains "Microsoft.Security.Amba.Automation"
| where tenantId == "<customer-tenant-id>"
| where env_properties contains "429"
```

**查询 3:**
```kusto
// Find last polling execution
Span
| where env_time > ago(7d)
| where name contains "Microsoft.Security.Amba.Automation"
| where serviceName == "AutomationRuleEngine"
| where env_properties.CurrentRuleId == "<rule-id>"
| where env_properties contains "Polling"
| summarize LastExecution = max(env_time)
```

**查询 4:**
```kusto
// Investigation Parameters
let _startTime = datetime(2026-01-19T00:00:00Z); // Adjust to your time range
let _endTime = datetime(2026-01-20T00:00:00Z); // Or use: ago(24h) and now()
let _tenantId = '<tenant-id>'; // Required: Customer tenant ID
let _ruleId = ''; // Optional: Specific rule ID, leave empty for all
let _resourceId = ''; // Optional: Specific resource ID (alert/case/recommendation)
let _traceId = ''; // Optional: For end-to-end trace (get from Query 1)
```

**查询 5:**
```kusto
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

### 脚本命令
```powershell
# Check managed identity RBAC assignments
az role assignment list --assignee <managed-identity-object-id> --all
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 4: - Automation Rules
> 来源: ado-wiki-d-tsg-automation-rules.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. From the Microsoft Sentinel navigation menu, select Automation.
2. Select the rule (or rules) you want to export, and select Export from the bar at the top of the screen.
3. Find the exported file in your Downloads folder. It has the same name as the automation rule, with a .json extension.
4. Open a new browser tab, go to the Sentinel Overview page and refresh
5. Start HAR file tracing: Capture a browser trace
6. Open the Automation page and let it fully load
7. Stop the HAR tracing and save
8. Search for calls to `https://management.azure.com/batch` with request to `.../providers/Microsoft.SecurityInsights/automationRules?api-version=...`
9. The response will contain the list of automation rules and their IDs
10. Create a new LogicApp Playbook with only the "Microsoft Sentinel Incident" trigger (no additional blocks)
11. Create a new Automation Rule pointing to this playbook with non-entity conditions
12. Configure the same Analytic Rule filter but only use conditions that are not entity-based
13. When the next incident happens, check Logic App > Runs History > Show Raw Outputs
14. Inspect the raw JSON for hidden characters (e.g. double spaces that LAW normalizes)
15. Fix the automation rule condition based on actual raw data
16. Delete the temporary playbook and rule

### Portal 导航路径
- a new browser tab, go to the Sentinel Overview page and refresh
- the Automation page and let it fully load

### Kusto 诊断查询
**查询 1:**
```kusto
let AutomationRuleID = '';
let SentinelIncidentID = 'XXXXXXXXXXXXXXXXXXXXX';
let WorkspaceID_parameter = 'XXXXXXXXXXXXXXXXXXXXX';
let _endTime = datetime(2024-mm-ddT04:00:00Z);
let _startTime = datetime(2024-mm-ddT03:00:00Z);
let parameter_AutomationRuleName = 'XXXXXXXXXXXXXXXXXXXXXXX';
cluster('securityinsights.kusto.windows.net').database('SecurityInsightsProd').Log
| where env_time > ago(2d)
| where env_properties has ['WorkspaceID_parameter']
| where isempty(['SentinelIncidentID']) or env_properties has ['SentinelIncidentID']
| where (isempty(['AutomationRuleID']) or env_properties has ['AutomationRuleID'])
| project env_time, TriggersOn=tostring(env_properties.TriggersOn),
    TriggersWhen=tostring(env_properties.TriggersWhen),
    AutomationRuleArmResourceName=tostring(env_properties.AutomationRuleArmResourceName),
    AutomationRuleName=tostring(env_properties.AutomationRuleName),
    Order=toint(env_properties.Order),
    CreatedTimeUtc=todatetime(env_properties.CreatedTimeUtc),
    LastModifiedTimeUtc=todatetime(env_properties.LastModifiedTimeUtc),
    DisplayNameHash=toupper(tostring(env_properties.DisplayNameHash)),
    IsEnabled=tostring(env_properties.IsEnabled),
    Conditions=todynamic(env_properties.Conditions),
    Actions=todynamic(env_properties.Actions)
| where isnotempty(Actions) and isnotempty(Conditions)
| summarize arg_max(env_time,*) by AutomationRuleArmResourceName
| take 1000
| sort by Order, AutomationRuleName
| project-reorder Order, AutomationRuleName, *
| extend GivenHashName=toupper(hash_sha256(['parameter_AutomationRuleName']))
| extend SHAMatch=iff(GivenHashName==DisplayNameHash, true, false)
| where SHAMatch == "True"
```

**查询 2:**
```kusto
SecurityIncident
| where IncidentNumber == "{IncidentNumber}"
| project TimeGenerated, IncidentName, Status, ModifiedBy
| order by TimeGenerated asc
```

**查询 3:**
```kusto
SentinelHealth
| where OperationName == "Automation rule run" or OperationName == "Playbook was triggered"
| where ExtendedProperties.IncidentName == "<incidentName>"
| extend TriggeredOn = ExtendedProperties.TriggeredOn
| extend TriggeredByName = ExtendedProperties.TriggeredByName
```

**查询 4:**
```kusto
SentinelHealth
| where OperationName == "Automation rule run" or OperationName == "Playbook was triggered"
| extend TriggeredOn = ExtendedProperties.TriggeredOn
| extend TriggeredByName = ExtendedProperties.TriggeredByName
| where Status == "Failure"
```

### 脚本命令
```powershell
$mystring = "XXXXXXXXX"
$mystream = [IO.MemoryStream]::new([byte[]][char[]]$mystring)
Get-FileHash -InputStream $mystream -Algorithm SHA256
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 5: Playbook - Send email when a Sentinel Automation rule is created
> 来源: ado-wiki-e-playbook-send-email-automation-rule-created.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Enable Azure Activity Logs data connector in Sentinel.
2. Create a Sentinel Analytics rule to generate an incident when an Automation rule is created with the query below:
3. In the Analytics Rule, under entities, map **File Hash** with **automationRuleId**.
4. Create a Playbook with the following flow:
5. Attach this playbook to the Analytic rule created in step 2.

### Kusto 诊断查询
**查询 1:**
```kusto
AzureActivity
| where OperationNameValue == "MICROSOFT.SECURITYINSIGHTS/AUTOMATIONRULES/WRITE"
| where ActivityStatusValue == "Success"
| where ActivitySubstatusValue == "Created"
| extend automationRuleId = substring(split(_ResourceId, '/')[12], 0, 36)
```

---
