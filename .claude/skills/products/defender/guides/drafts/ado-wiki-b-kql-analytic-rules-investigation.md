---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Analytics/KQL - Analytic rules investigation queries"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Analytics/KQL%20-%20Analytic%20rules%20investigation%20queries"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Find alert information

Cluster: securityinsights.kusto.windows.net / SecurityInsightsProd

```
Span
| where env_time > ago(3d)
| where serviceName == "AlertGatewayService"
| where name == "AlertGatewayService.AlertConverter.EventToSecurityAlertConverter.CreateSecurityAlertMessage"
| extend WorkspaceId = tostring(env_properties.WorkspaceIdOrigin)
| extend SystemAlertId = tostring(env_properties.SystemAlertId)
| where SystemAlertId == "<AlertId>"
```

# Auto disabling

Possible reasons:
- Target workspace deleted
- Target table deleted
- Sentinel removed from target workspace
- Function used by rule query modified or removed
- Permissions to data source changed
- Data source deleted or disconnected
- MSSP scenario: rule creator lost permissions

Check in SentinelHealth:
```
SentinelHealth | where SentinelResourceName startswith "AUTO DISABLED"
```

Investigation query (Kusto backend):
```
Span
| where env_time > ago(10d)
| where APP_NAME startswith "alertrules"
| where name endswith "AutoDisableQueryBasedRule"
| extend FullRuleId = tostring(env_properties.FullRuleId)
| extend DisabledRuleName = tostring(env_properties.DisabledRuleName)
| extend DisablingMessage = tostring(env_properties.DisablingMessage)
```

Log analytics rules disabled automatically (detailed query):
```
let _endTime = datetime(2026-12-15T13:40:52Z);
let _ruleId = '';
let _startTime = datetime(2026-12-01T13:40:52Z);
let _workspaceId = '____';
union
(Span
| where env_time between ([_startTime] .. [_endTime])
| where APP_NAME == "alertrules-sync"
| where name == "...VerifiedRuleAutoDisabler.VerifyRuleAndDisableIfNeededTaskAsync"
| extend WorkspaceId = tostring(env_properties.RuleWorkspaceId)
| extend RuleId = tostring(env_properties.RuleResourceName)
| where isempty([_workspaceId]) or WorkspaceId == [_workspaceId]
| where isempty([_ruleId]) or RuleId == [_ruleId]
| extend ShouldDisableRule = tostring(env_properties.ShouldDisableRule)
| extend DisablingMessage = tostring(env_properties.InsufficientAccessDisablingMessage)
| project env_time, serviceName, WorkspaceId, RuleId, ShouldDisableRule, DisablingMessage),
(Span
| where env_time between ([_startTime] .. [_endTime])
| where APP_NAME in (dynamic(["alertrules-sync", "alertrules-scheduled-worker", "alertrules-nrt-worker"]))
| where name endswith "DisableJobAsync"
| parse tostring(env_properties.RuleId) with WorkspaceId "_" RuleId
| where isempty([_ruleId]) or RuleId == [_ruleId]
| where isempty([_workspaceId]) or WorkspaceId == [_workspaceId]
| extend DisablingMessage = tostring(env_properties.AutoDisableException)
| extend CorrelationId = tostring(env_properties.CorrelationId)
| project env_time, serviceName, CorrelationId, RuleId, WorkspaceId, DisablingMessage)
| distinct DisablingMessage
```

# Alerts were not grouped

Query (ServiceFabricOperations in SecurityInsightsProd):
```
ServiceFabricOperations
| where env_time > ago(10d)
| where operationName endswith "GetUniqueGroupingIdentifier"
| extend CustomData = todynamic(customData)
| extend AlertRuleId = split(tostring(CustomData.AlertType), "_")[1]
| extend WorkspaceId = CustomData.WorkspaceId
| extend systemAlertId = CustomData.SystemAlertId
| extend entitiesIdentifier = tostring(CustomData.entitiesIdentifier)
| extend UniqueGroupingIdentifierString = CustomData.UniqueGroupingIdentifierString
| extend uniqueGroupingIdentifier = tostring(CustomData.UniqueGroupingIdentifier)
| where WorkspaceId == "<WorkspaceId>"
| where systemAlertId in("<alertId1>", "<alertId2>")
| project systemAlertId, uniqueGroupingIdentifier, UniqueGroupingIdentifierString, AlertRuleId, entitiesIdentifier
```

If uniqueGroupingIdentifier is different, each alert has different entities. UGI format: RuleId_{entitiesIdentifiers}.

# Entities were dropped - not mapped in SecurityAlert

```
Log
| where env_time > ago(20d)
| where name == "Microsoft.Azure.Security.Insights.AlertRules.AlertsProducer.V3EntityParsing.EntityParserBase"
| where body startswith "Failed to build V3 entity from row"
| parse env_ex_stack with * "--->" errorMessage "at " *
| project TIMESTAMP, errorMessage, tostring(env_properties.TenantId), tostring(env_properties.RuleId), tostring(env_properties.EntityType)
| summarize count() by errorMessage
```

# Find if alert was created from an Analytic rule

```
Log
| where env_time > ago(20d)
| where body contains "ProcessQueryResultsAsync"
| where env_properties.RuleId has "<RuleId>"
| where WorkspaceId == "<WorkspaceId>"
```
