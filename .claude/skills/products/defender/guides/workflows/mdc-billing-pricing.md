# Defender MDC 计费与定价 — 排查工作流

**来源草稿**: ado-wiki-a-billing-kusto-queries.md, ado-wiki-a-billing-troubleshooting-queries.md, ado-wiki-a-client-side-queries-for-billing.md, ado-wiki-a-cost-estimation-defender-for-ai.md, ado-wiki-a-granular-pricing-resource-level-billing.md, ado-wiki-a-pricing-resource-count-questions.md, ado-wiki-a-r3-extending-trial-period.md, ado-wiki-a-r5-mdc-refund-request-flow.md, ado-wiki-b-sap-exclude-nonprod-billing.md
**场景数**: 9
**生成日期**: 2026-04-07

---

## Scenario 1: Billing Kusto Queries
> 来源: ado-wiki-a-billing-kusto-queries.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('Rometelemetrydata').database("RomeTelemetryProd").PricingSnapshot
| where SubscriptionId == '{SubscriptionId}'
| sort by TimeStamp desc
```

**查询 2:**
```kusto
cluster('Rometelemetrydata').database('RomeTelemetryProd').BillingReportsByDaySubscriptionAndMeterId(now()-1060d,now())
| where SubscriptionId == "{SubscriptionId}"
| sort by Day desc
```

**查询 3:**
```kusto
cluster("RometelemetryData").database("RomeTelemetryProd").BillingReportsByDayBundlePricingTierMethodAndSubscriptionId(now()-90d,now())
| where SubscriptionId == "{SubscriptionId}"
```

**查询 4:**
```kusto
let startDate = datetime("2024-06-01 00:00:00");
let endDate = datetime("2024-07-01 00:00:00");
find where TimeGenerated between(startDate .. endDate) project _BilledSize, _IsBillable, Computer, Type, TimeGenerated
| where _IsBillable == true and Type != "Usage"
| where isnotempty(Computer)
| summarize BillableDataGB = sum(_BilledSize)/1000000000 by bin(TimeGenerated, 1d), Computer
| sort by BillableDataGB desc nulls last
```

**查询 5:**
```kusto
find where TimeGenerated > ago(24h) project _IsBillable, Computer
| where _IsBillable == true and Type != "Usage"
| extend computerName = tolower(tostring(split(Computer, '.')[0]))
| summarize eventCount = count() by computerName
| sort by eventCount desc nulls last
```

---

## Scenario 2: Billing Troubleshooting Queries
> 来源: ado-wiki-a-billing-troubleshooting-queries.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Which specific service (servers, storage, SQL, etc.) has billing issues?
2. Any recent changes to subscription plans?
3. Any unusual spikes in resource consumption?
4. What time period does the discrepancy cover?

### Kusto 诊断查询
**查询 1:**
```kusto
securityresources
| where type == "microsoft.security/pricings"
| project name, parse_json(properties).pricingTier
```

**查询 2:**
```kusto
let StartTime = datetime(<STARTTIME>);
let EndTime = datetime(<ENDTIME>);
Usage
| where TimeGenerated between (StartTime..EndTime)
| where IsBillable == 'TRUE'
| project TimeGenerated, DataType, Solution, Quantity, QuantityUnit
| summarize DataConsumedPerDataType = sum(Quantity) by QuantityUnit, DataType
| sort by DataConsumedPerDataType desc
```

**查询 3:**
```kusto
let StartTime = datetime(<STARTTIME>);
let EndTime = datetime(<ENDTIME>);
Usage
| where TimeGenerated between (StartTime..EndTime)
| where IsBillable == 'TRUE'
| project TimeGenerated, DataType, Solution, Quantity, QuantityUnit
| summarize DataConsumedPerDataType = sum(Quantity)
| sort by DataConsumedPerDataType desc
```

**查询 4:**
```kusto
cluster('rometelemetrydata').database("RomeTelemetryProd").BillingReportsByDayBundlePricingTierMethodAndSubscriptionId(now()-600d,now())
| where Day between (StartTime..EndTime)
| where SubscriptionId in ('{subscriptionId}')
| where Bundle == 'VirtualMachines'
| project Day, Nodes, PricingTier, Bundle, ResourceProvider, SubscriptionId, Units, BillingMethod
| render timechart with (ycolumns=Units, series=PricingTier, Bundle, ResourceProvider)
```

**查询 5:**
```kusto
cluster('rometelemetrydata').database('RomeTelemetryProd').BillingReportsByDaySubscriptionAndMeterId(now()-600d,now())
| where Day between (StartTime..EndTime)
| where SubscriptionId == '{SubscriptionID}'
| where Bundle contains "VirtualMachines"
| summarize TotalUnits = sum(Units) by Bundle
```

---

## Scenario 3: Client Side Queries for Billing
> 来源: ado-wiki-a-client-side-queries-for-billing.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
_Usage
| where TimeGenerated > ago(90d)
| where IsBillable == true
| summarize TotalVolumeGB = sum(Quantity) / 1024 by startofday(TimeGenerated), Solution
| project TimeGenerated = substring(TimeGenerated,0,10), Solution, TotalVolumeGB
| order by TimeGenerated asc
| render barchart kind=default_
```

**查询 2:**
```kusto
_Usage
| where TimeGenerated > ago(90d)
| where IsBillable == false
| summarize TotalVolumeGB = sum(Quantity) / 1024 by startofday(TimeGenerated), Solution
| project TimeGenerated = substring(TimeGenerated,0,10), Solution, TotalVolumeGB
| order by TimeGenerated asc
| render barchart kind=default_
```

**查询 3:**
```kusto
_Usage
| where TimeGenerated > ago(90d)
| where IsBillable == true
| summarize TotalVolumeGB = sum(Quantity) / 1024 by startofday(TimeGenerated), DataType
| project TimeGenerated = substring(TimeGenerated,0,10), DataType, TotalVolumeGB
| order by TimeGenerated asc
| render barchart kind=default_
```

**查询 4:**
```kusto
_Usage
| where TimeGenerated > ago(90d)
| where IsBillable == false
| summarize TotalVolumeGB = sum(Quantity) / 1024 by startofday(TimeGenerated), DataType
| project TimeGenerated = substring(TimeGenerated,0,10), DataType, TotalVolumeGB
| order by TimeGenerated asc
| render barchart kind=default_
```

---

## Scenario 4: Cost Estimation for Defender for AI
> 来源: ado-wiki-a-cost-estimation-defender-for-ai.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Go to **Environment Settings**
2. Open the **Cost Calculator**
3. Add assets with script
4. Download the PowerShell Script
5. Run the PowerShell Script
6. Upload the Output File

### Portal 导航路径
- **Environment Settings**
- the Defender for Cloud portal
- the **Cost Calculator**

---

## Scenario 5: Granular Pricing and Resource Level Billing
> 来源: ado-wiki-a-granular-pricing-resource-level-billing.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
let lastCorrelationAzure = GetCurrentCorrelationId_Environments_Azure();
cluster('ascentitystoreprdeu.westeurope.kusto.windows.net').database('MDCGlobalData').Environments
| where TimeStamp >= toscalar(lastCorrelationAzure)
| where HierarchyId == "{subscriptionId}"
| where EnvironmentName == "Azure"
| where Level == "Resource"
| extend parts = split(Scope, '/')
| extend ResourceGroupName = tostring(parts[4])
| extend ResourceProvider = tostring(parts[6])
| extend ResourceType = tostring(parts[7])
| extend ResourceName = tostring(parts[-1])
| project TimeStamp, SubscriptionId=HierarchyId, ResourceName, ResourceType, ResourceProvider, ResourceGroupName,
Level, SecurityConnector, Plans, FreePlans, TenantId
```

### API 端点
```
GET https://management.azure.com/{scopeId}/providers/Microsoft.Security/pricings/{pricingName}?api-version=2024-01-01
```
```
GET https://management.azure.com/subscriptions/{SubscriptionId}/resourceGroups/{ResourceGroup}/providers/Microsoft.Compute/virtualMachines/{VM}/providers/Microsoft.Security/pricings/VirtualMachines?api-version=2024-01-01
```
```
PUT https://management.azure.com/{scopeId}/providers/Microsoft.Security/pricings/{pricingName}?api-version=2024-01-01
```

---

## Scenario 6: Pricing Resource Count Questions
> 来源: ado-wiki-a-pricing-resource-count-questions.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
Heartbeat
| summarize by SourceComputerId, ComputerEnvironment
| summarize AggregatedValue = count() by ComputerEnvironment
```

---

## Scenario 7: Extending trial period for Microsoft Defender for Cloud plans
> 来源: ado-wiki-a-r3-extending-trial-period.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Create an IcM using the **IcM template #'z3p3e2'**.
2. The IcM is assigned to Embedded Escalation Engineer (EEE) for approval. If the request exceeds 90 days, allow additional time for Product Group (PG) approval.
3. Once approved, EEE transfers the Customer Reported Incident (CRI) to the "Defenders - CRIs" queue for implementation.
4. *   **Azure:** Subscription(s) ID
5. *   List of MDC plan(s) requested for extension, separated by commas
6. *   Start date
7. *   End date
8. *   Number of resources, estimated or real
9. *   Customer name (found under Custom fields - Owning service - Microsoft Defender for Cloud - Customer Org name/domain)
10. *   Contact name including CSAM/CxE/requestor name and MS title
11. **AWS/GCP connectors must be configured and connected to an enabled Azure subscription,** prior to the Trial extension request.
12. Use the IcM template without altering its title or severity level.
13. After creating the IcM request, **track it continuously until it's mitigated or resolved.**
14. When an IcM is mitigated, it indicates that the extension has been applied unless stated otherwise by Directly Responsible Individual (DRI).
15. The backend system configures trial extensions.
16. MDC covers any charges incurred during the trial extension period.
17. Two hours after the PG submitted the trial extension to production, check if the respective subscription id / security connector id is in the forbidden list of the relevant Billing application by running the following Kusto query:
18. Go to the CustomerSettings.csv file containing the list of subscriptions and plans inserted to extension.

### Portal 导航路径
- the [CustomerSettings

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 8: Microsoft Defender for Cloud Customers Refund Request Process
> 来源: ado-wiki-a-r5-mdc-refund-request-flow.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Customer asks for a refund via support request
2. MDC support engineer verifies details according to this wiki
3. CSS creates IcM using refund template ID **P1Fyc1**
4. MDC EEE inspects the claim and acknowledges the IcM
5. EEE engages engineering to verify the issue
6. EEE ensures the refund reason is fixed to avoid recurrence
7. EEE approves/declines the refund
8. **Incorrect or Unexpected Billing**
9. **Billing continued** due to system delay after plan was disabled
10. **Duplicate Charges** — same resource type billed under overlapping plans
11. **Known Microsoft Issues** — documented bug causing unexpected activation/alerts/ingestion costs
12. **Feature Behavior Not Matching Documentation** — billed due to behavior contradicting official pricing docs
13. Ensure SAP is "Defender for *<plan>*/enabling plan, pricing and settings"
14. Fill IcM template: P1Fyc1
15. Summary table and custom fields are mandatory

---

## Scenario 9: [Procedure] Exclude SAP Non-Production Systems from Billing
> 来源: ado-wiki-b-sap-exclude-nonprod-billing.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- ICM ticket to Sentinel for SAP team

---
