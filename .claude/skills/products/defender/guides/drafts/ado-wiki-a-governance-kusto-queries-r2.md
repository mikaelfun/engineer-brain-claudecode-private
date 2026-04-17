---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Governance/MDC Governance/[Troubleshooting Guide] Governance - Kusto queries"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Governance/MDC%20Governance/%5BTroubleshooting%20Guide%5D%20Governance%20-%20Kusto%20queries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Emails
```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').ServiceFabricDynamicOE   
| where env_time between (startTime..endTime)
| where operationName has "GovernanceEmailManager-EnrichEmailAsync"
        or operationName has "GovernanceEmailManager-SendEmailAsync"
| extend customData = parse_json(customData)
| extend subscriptionId = tostring(customData.SubscriptionId)
| where subscriptionId == "{SubscriptionId}"
| extend assignmentsToCreateCount  = toint(customData.AssignmentsToCreateCount)
| project env_time, resultType, resultDescription, subscriptionId, customData
```

```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').TraceEvent 
| where env_time between (startTime..endTime)
| where tagId has "SendEmailAsync" or tagId has "EnrichEmailAsync"
```

# Assignments
```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').ServiceFabricDynamicOE   
| where env_time between (startTime..endTime)
| where operationName has "CreateOrUpdateGovernanceAssignmentByAssignmentKey"
| extend customData = parse_json(customData)
| extend subscriptionId = tostring(customData.SubscriptionId)
| extend assignmentsToCreateCount  = toint(customData.AssignmentsToCreateCount)
| project env_time, resultType, resultDescription, subscriptionId, customData
```

# Rules - Create/Update
```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').ServiceFabricDynamicOE   
| where env_time between (startTime..endTime)
| where operationName has "CreateOrUpdateGovernanceRuleSingle"
| extend customData = parse_json(customData)
| extend subscriptionId = tostring(customData.SubscriptionId)
| extend assignmentsToCreateCount  = toint(customData.AssignmentsToCreateCount)
| project env_time, resultType, resultDescription, subscriptionId, customData
```

# Rules - Execute
```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').ServiceFabricDynamicOE   
| where env_time between (startTime..endTime)
| where operationName has "GovernanceRuleExecuteSingle"
| extend customData = parse_json(customData)
| extend subscriptionId = tostring(customData.SubscriptionId)
| extend assignmentsToCreateCount  = toint(customData.AssignmentsToCreateCount)
| project env_time, resultType, resultDescription, subscriptionId, customData
```

# Rules - Delete
```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').ServiceFabricDynamicOE   
| where env_time between (startTime..endTime)
| where operationName has "DeleteGovernanceRule"
| extend customData = parse_json(customData)
| extend subscriptionId = tostring(customData.SubscriptionId)
| extend assignmentsToCreateCount  = toint(customData.AssignmentsToCreateCount)
| project env_time, resultType, resultDescription, subscriptionId, customData
```

# Rules - Get List
```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').ServiceFabricDynamicOE   
| where env_time between (startTime..endTime)
| where operationName has "GetGovernanceRulesBySubscriptionId"
| extend customData = parse_json(customData)
| extend subscriptionId = tostring(customData.SubscriptionId)
| extend assignmentsToCreateCount  = toint(customData.AssignmentsToCreateCount)
| project env_time, resultType, resultDescription, subscriptionId, customData
```

# Azure Resource Manager
```kusto
// Run in Kusto Data Explorer
let assignmentsApi = "GOVERNANCEASSIGNMENTS";
let ruleApi = "GOVERNANCERULES";
let endTime = now();
let startTime = ago(7d);
let httpEventName = "HttpIncomingRequestEndWithSuccess";
let httpMethodName = "PUT";
cluster("Armprod").database("ARMProd").HttpIncomingRequests
| where PreciseTimeStamp between (startTime..endTime)
| where isnotempty(subscriptionId)
| where operationName has ruleApi
```

# Event Hub - Handle Assessments
```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').ServiceFabricDynamicOE   
| where env_time between (startTime..endTime)
| where operationName has "MessageBatchReceivedAsync"
| extend customData = parse_json(customData)
| extend subscriptionId = tostring(customData.SubscriptionId)
| extend assignmentsToCreateCount  = toint(customData.AssignmentsToCreateCount)
| project env_time, resultType, resultDescription, subscriptionId, customData
```

```kusto
// Run in Kusto Data Explorer
let endTime = now();
let startTime = ago(10d);
cluster('romecore.kusto.windows.net').database('Prod').ServiceFabricDynamicOE   
| where env_time between (startTime..endTime)
| where operationName has "AssessmentNotificationsGovernanceHandler.HandleSubscriptionAssessmentsAsync"
| extend customData = parse_json(customData)
| extend subscriptionId = tostring(customData.SubscriptionId)
| extend assignmentsToCreateCount  = toint(customData.AssignmentsToCreateCount)
| project env_time, resultType, resultDescription, subscriptionId, customData
```


|Contributor Name|  Details|  Date|
|--|--|--|
| Hekmat | Created this section | 1/3/2023 |
| Shawn | Added //Run in Kusto Data explorer | 5/10/2024 |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
