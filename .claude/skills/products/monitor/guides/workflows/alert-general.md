# Monitor 告警综合问题 — 排查工作流

**来源草稿**: [ado-wiki-a-asc-metricalerts-properties-tab.md], [ado-wiki-a-troubleshooting-log-to-metric-alert-false-alert.md], [ado-wiki-a-troubleshooting-metric-alert-didnt-resolve.md], [ado-wiki-a-troubleshooting-query-metric-alert-missed.md], [ado-wiki-activity-log-alert-changes-all-asc.md], [ado-wiki-activity-log-alert-changes-specific-asc.md], [ado-wiki-activity-log-alert-crud-kusto.md], [ado-wiki-activity-log-alert-details-asc.md], ... (50 total)
**Kusto 引用**: 无
**场景数**: 15
**生成日期**: 2026-04-07

---

## Scenario 1: This troubleshooting guide applies to Log to Metric alert that fired when it should not have.
> 来源: ado-wiki-a-troubleshooting-log-to-metric-alert-false-alert.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Verify a corresponding log alert exists**
   [来源: ado-wiki-a-troubleshooting-log-to-metric-alert-false-alert.md]

2. **Step 2: Review metric chart**
   [来源: ado-wiki-a-troubleshooting-log-to-metric-alert-false-alert.md]

3. **Step 3: Compare metric value with evaluation data**
   [来源: ado-wiki-a-troubleshooting-log-to-metric-alert-false-alert.md]

4. **Step 4: Investigate log ingestion (Northstar pipeline)**
   [来源: ado-wiki-a-troubleshooting-log-to-metric-alert-false-alert.md]

5. **Step 5: Investigate metrics ingestion to MDM**
   [来源: ado-wiki-a-troubleshooting-log-to-metric-alert-false-alert.md]

6. **Step 6: Check for Log to metric related monitors**
   [来源: ado-wiki-a-troubleshooting-log-to-metric-alert-false-alert.md]

---

## Scenario 2: This troubleshooting guide applies to Metric alert that did not resolve when it should have.
> 来源: ado-wiki-a-troubleshooting-metric-alert-didnt-resolve.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Verify alert rule configuration**
   [来源: ado-wiki-a-troubleshooting-metric-alert-didnt-resolve.md]

2. **Step 2: Review metric chart**
   [来源: ado-wiki-a-troubleshooting-metric-alert-didnt-resolve.md]

3. **Step 3: Verify 3 consecutive healthy evaluations completed**
   [来源: ado-wiki-a-troubleshooting-metric-alert-didnt-resolve.md]

---

## Scenario 3: This troubleshooting guide applies to Query-based (Prometheus) Metric alert that didn't fire when it
> 来源: ado-wiki-a-troubleshooting-query-metric-alert-missed.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Verify alert rule configuration**
   [来源: ado-wiki-a-troubleshooting-query-metric-alert-missed.md]

2. **Step 2: Check alert is already in a fired state**
   [来源: ado-wiki-a-troubleshooting-query-metric-alert-missed.md]

3. **Step 3: Validate the expression**
   [来源: ado-wiki-a-troubleshooting-query-metric-alert-missed.md]

4. **Step 4: Analyze Rule Executions**
   [来源: ado-wiki-a-troubleshooting-query-metric-alert-missed.md]

---

## Scenario 4: This How-To article can be used to obtain an alert payload using the Azure Portal. This is applicabl
> 来源: ado-wiki-alert-payload-customize-email-logic-app.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Create a Logic App**
   [来源: ado-wiki-alert-payload-customize-email-logic-app.md]

2. **Step 2: Create an HTTP trigger**
   [来源: ado-wiki-alert-payload-customize-email-logic-app.md]

3. **Step 3: View the alert payload**
   [来源: ado-wiki-alert-payload-customize-email-logic-app.md]

4. **Step 1: Process the alert payload**
   [来源: ado-wiki-alert-payload-customize-email-logic-app.md]

5. **Step 2: Configure and customize your email**
   [来源: ado-wiki-alert-payload-customize-email-logic-app.md]

---

## Scenario 5: Retrieve alert rule configuration when:
> 来源: ado-wiki-alert-rule-config-kusto.md | 适用: Mooncake ✅

   ```kql
   let alertRuleId = "";
   let myAlertRuleIdArray = split(alertRuleId, '/');
   let mysubscription = tostring(myAlertRuleIdArray[2]);
   cluster('azalertsprodweu.westeurope').database('Insights').
   AlertRuleTelemtry
   | where TIMESTAMP > ago(48h)
   | where SubscriptionId =~ mysubscription
   | extend decodedRuleArmId 
   ```
   [来源: ado-wiki-alert-rule-config-kusto.md]

   ```kql
   let subscriptionId = '';
   cluster('azalertsprodweu.westeurope').database('Insights').
   AlertRuleTelemtry
   | where TIMESTAMP > ago(48h)
   | where SubscriptionId =~ subscriptionId
   | where RuleType == 'Microsoft.Insights/scheduledQueryRules'
   | extend decodedRuleArmId = url_decode(RuleArmId)
   | summarize arg_
   ```
   [来源: ado-wiki-alert-rule-config-kusto.md]

---

## Scenario 6: Customer requesting quota increase for alert rules in their Azure subscription.
> 来源: ado-wiki-b-quota-increase-alert-rules.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Confirm Quota Increase Is Available**
   [来源: ado-wiki-b-quota-increase-alert-rules.md]

2. **Step 2: Can Customer Work Within Current Limits?**
   [来源: ado-wiki-b-quota-increase-alert-rules.md]

3. **Step 3: Review Requested Quota Value**
   [来源: ado-wiki-b-quota-increase-alert-rules.md]

4. **Step 4: Submit CRI for Quota Increase**
   [来源: ado-wiki-b-quota-increase-alert-rules.md]

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 参见上述场景 | 按步骤排查 | → details/alert-general.md |
