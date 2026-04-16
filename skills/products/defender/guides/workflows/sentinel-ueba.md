# Defender Sentinel UEBA 用户行为分析 — 排查工作流

**来源草稿**: ado-wiki-a-enable-ueba-programmatically.md, ado-wiki-a-ueba-anomalies-integration-portal.md, ado-wiki-a-ueba-anomalies-verification.md, ado-wiki-b-ueba-enablement-in-connectors-tsg.md, ado-wiki-b-ueba-for-sentinel-product-knowledge.md
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: ado-wiki-a-enable-ueba-programmatically.md
> 来源: ado-wiki-a-enable-ueba-programmatically.md | 适用: Mooncake ⚠️ 未明确

### 脚本命令
```powershell
#start script

$sub="22441c71-50fc-422b-b928-5631edd6175e"
$rg="pk-test-rg"
$workspace="pk-test-law"
$uri1= "https://management.azure.com/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.OperationalInsights/workspaces/$workspace/providers/Microsoft.SecurityInsights/settings/EntityAnalytics?api-version=2023-04-01-preview"
$uri2= "https://management.azure.com/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.OperationalInsights/workspaces/$workspace/providers/Microsoft.SecurityInsights/settings/Ueba?api-version=2023-04-01-preview"

Connect-AzAccount
set-azcontext -Subscription "Microsoft Azure Sponsorship 2"
$payload1 = '{ 
     "kind":"EntityAnalytics",
     "properties": {"entityProviders":["AzureActiveDirectory"]}}
      }'
Invoke-AzRestMethod -uri $uri1 -Method PUT -Payload $payload1
$payload2 = '{ 
     "kind":"Ueba",
     "properties": {"dataSources":["AuditLogs","AzureActivity","SecurityEvent","SigninLogs"]}}
      }'
Invoke-AzRestMethod -uri $uri2 -Method PUT -Payload $payload2

#end script
```

---

## Scenario 2: TSG: UEBA Anomalies Integration in the Portal
> 来源: ado-wiki-a-ueba-anomalies-integration-portal.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 3: ado-wiki-a-ueba-anomalies-verification.md
> 来源: ado-wiki-a-ueba-anomalies-verification.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Wait for Adequate Time: After enabling UEBA and anomalies, it's important to be patient. Allow at least 2 weeks for the system to collect sufficient data and identify potential anomalies.
2. Verify Anomaly Settings:
3. Check Analytics for Specific Rule:
4. Validate BehaviorAnalytics Table:
5. Further Investigation:

### Portal 导航路径
- the "Settings" blade in your Sentinel platform
- the "Analytics" section in your UEBA platform

---

## Scenario 4: Troubleshooting guide for UEBA Enablement in Connectors
> 来源: ado-wiki-b-ueba-enablement-in-connectors-tsg.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 5: Concepts
> 来源: ado-wiki-b-ueba-for-sentinel-product-knowledge.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---
