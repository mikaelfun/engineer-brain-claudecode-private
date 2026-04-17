# Defender Sentinel 分析规则与检测 — 排查工作流

**来源草稿**: ado-wiki-a-asc-asi-alert-analytic-rule-cleanup.md, ado-wiki-a-find-analytic-rule-alert-trigger-playbooks.md, ado-wiki-b-kql-analytic-rules-investigation.md, ado-wiki-c-product-knowledge-binary-drift-detection.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Cleanup of Analytic Rule
> 来源: ado-wiki-a-asc-asi-alert-analytic-rule-cleanup.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Copy and Paste the code in a Python IDE or use an online Python runner
2. Add your Analytic Rule to the designated field
3. Run the code - the result will be the clean Analytic Rule

### Kusto 诊断查询
**查询 1:**
```kusto
set query_now = datetime(2022-02-03T14:00:56.1270265Z);\r\n OfficeActivity\r\n | where TimeGenerated > ago(1d)\r\n | where MailboxOwnerUPN contains \".be\"\r\n | extend DateHour = bin(TimeGenerated, 1h)\r\n | where OfficeWorkload=~ \"Exchange\" and Operation =~ \"HardDelete\" and ResultStatus =~ \"Succeeded\"\r\n | summarize HourlyCount=count(), TimeGeneratedMax = arg_max(TimeGenerated, *), IPAdressList = make_set(Client_IPAddress), SourceIPMax= arg_max(Client_IPAddress, *), ClientInfoStringList= make_set(ClientInfoString) by MailboxOwnerUPN, Logon_Type, TenantId, UserType, TimeGenerated = bin(TimeGenerated, 1h) \r\n // | project TimeGenerated, MailboxOwnerUPN, Folder, \r\n// Only considering operations with more than 25 hourly count to reduce False Positivies \r\n | where HourlyCount > 20 //change here\r\n | order by HourlyCount desc","Query Start Time UTC":"2022-02-02 14:00:56Z","Query End Time UTC":"2022-02-03 14:00:56Z","Analytic Rule Ids// | project TimeGenerated, MailboxOwnerUPN,
```

---

## Scenario 2: Guide to Find which Analytic Rule have alert trigger playbooks are configured on Specific Workspace
> 来源: ado-wiki-a-find-analytic-rule-alert-trigger-playbooks.md | 适用: Mooncake ⚠️ 未明确

### 脚本命令
```powershell
# === Config ===
$subscriptionId = "your_subscription_id_here"
$workspaceResourceID = "Your_Sentiel_workspace_Resource_Id"

# Connect to your Azure account
Connect-AzAccount

# Select the specified subscription
Set-AzContext -SubscriptionId $subscriptionId

$UriToGetAllAnalyticRules = "$workspaceResourceID/providers/Microsoft.SecurityInsights/alertRules?api-version=2023-09-01-preview"
$actionsApiVersion = "2025-09-01"
$outFile = ".\sentinel_rules_actions_raw.csv"

# === Get rules ===
$GetARinJson = az rest --method get --uri $UriToGetAllAnalyticRules
if (-not $GetARinJson) {
    Write-Error "No response received from rules endpoint: $UriToGetAllAnalyticRules"
    return
}

$ConvertARToObj = $GetARinJson | ConvertFrom-Json
$rules = if ($ConvertARToObj.PSObject.Properties.Name -contains 'value') { $ConvertARToObj.value } else { @($ConvertARToObj) }

$analyticRules = $rules | ForEach-Object {
    [pscustomobject]@{
        id          = $_.id
        displayName = $_.properties.displayName
    }
}

# === Loop rules, fetch actions raw, and accumulate rows for export ===
$rows = New-Object System.Collections.Generic.List[object]

foreach ($rule in $analyticRules) {
    $actionsUri = "https://management.azure.com{0}/actions?api-version={1}" -f $rule.id, $actionsApiVersion
    Write-Host " Getting actions for: $($rule.displayName)" -ForegroundColor Cyan

    $actionsRaw = $null
    try {
        $actionsRaw = az rest --method get --uri $actionsUri
    } catch {
        Write-Warning "Failed to fetch actions for '$($rule.displayName)': $($_.Exception.Message)"
    }

    $cellValue =
        if ([string]::IsNullOrWhiteSpace($actionsRaw)) {
            'no value'
        } else {
            $actionsRaw
        }

    $rows.Add([pscustomobject]@{
        RuleDisplayName = $rule.displayName
        RuleId          = $rule.id
        ActionsRaw      = $cellValue
    })
}

# === Export to CSV ===
$rows | Export-Csv -Path $outFile -NoTypeInformation -Encoding UTF8
Write-Host " Exported $(($rows | Measure-Object).Count) rules to $outFile" -ForegroundColor Green
```

---

## Scenario 3: Find alert information
> 来源: ado-wiki-b-kql-analytic-rules-investigation.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
Span
| where env_time > ago(3d)
| where serviceName == "AlertGatewayService"
| where name == "AlertGatewayService.AlertConverter.EventToSecurityAlertConverter.CreateSecurityAlertMessage"
| extend WorkspaceId = tostring(env_properties.WorkspaceIdOrigin)
| extend SystemAlertId = tostring(env_properties.SystemAlertId)
| where SystemAlertId == "<AlertId>"
```

**查询 2:**
```kusto
SentinelHealth | where SentinelResourceName startswith "AUTO DISABLED"
```

**查询 3:**
```kusto
Span
| where env_time > ago(10d)
| where APP_NAME startswith "alertrules"
| where name endswith "AutoDisableQueryBasedRule"
| extend FullRuleId = tostring(env_properties.FullRuleId)
| extend DisabledRuleName = tostring(env_properties.DisabledRuleName)
| extend DisablingMessage = tostring(env_properties.DisablingMessage)
```

**查询 4:**
```kusto
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

**查询 5:**
```kusto
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

---

## Scenario 4: Product Knowledge: Binary Drift Detection (Defender for Containers)
> 来源: ado-wiki-c-product-knowledge-binary-drift-detection.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---
