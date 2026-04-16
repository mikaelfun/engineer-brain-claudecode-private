# Purview DLP 策略与告警 — 排查工作流

**来源草稿**: `mslearn-dlp-policy-tip-har-diagnostic.md`, `onenote-dlp-blocked-email-jarvis.md`, `onenote-dlp-sharepoint-rule-match-jarvis.md`
**Kusto 引用**: `dlm-policy-sync.md`, `dlp-jarvis-urls.md`
**场景数**: 42
**生成日期**: 2026-04-07

---

## Scenario 1: DLP Policy Tip HAR Diagnostic Guide
> 来源: mslearn-dlp-policy-tip-har-diagnostic.md | 适用: 未标注

### 排查步骤
> Source: https://learn.microsoft.com/troubleshoot/microsoft-365/purview/data-loss-prevention/diagnose-dlp-policy-tip-display-issues
> Status: guide-draft (pending SYNTHESIZE review)

`[来源: mslearn-dlp-policy-tip-har-diagnostic.md]`

---

## Scenario 2: When to Use
> 来源: mslearn-dlp-policy-tip-har-diagnostic.md | 适用: 未标注

### 排查步骤
DLP policy tips in OWA (Outlook on the web) either:
- Appear sporadically or never appear
- Show incorrect tips
- Are not triggered as expected

`[来源: mslearn-dlp-policy-tip-har-diagnostic.md]`

---

## Scenario 3: How It Works
> 来源: mslearn-dlp-policy-tip-har-diagnostic.md | 适用: 未标注

### 排查步骤
When composing email in OWA, Outlook calls the `GetDlpPolicyTips` service which checks:
1. The text typed by the user
2. The recipients of the email
3. The DLP policies that apply

`[来源: mslearn-dlp-policy-tip-har-diagnostic.md]`

---

## Scenario 4: Step 1: Collect HAR Trace
> 来源: mslearn-dlp-policy-tip-har-diagnostic.md | 适用: 未标注

### 排查步骤
1. Open browser Developer Tools (F12)
2. Go to Network tab, enable "Preserve log"
3. Start recording BEFORE trying to trigger the policy tip
4. Reproduce the issue in OWA
5. Export HAR file (must be < 100 MB)

`[来源: mslearn-dlp-policy-tip-har-diagnostic.md]`

---

## Scenario 5: Step 2: Upload to HAR Diagnostic
> 来源: mslearn-dlp-policy-tip-har-diagnostic.md | 适用: 未标注

### 排查步骤
Navigate to: `purview.microsoft.com/datalossprevention/diagnostics`

`[来源: mslearn-dlp-policy-tip-har-diagnostic.md]`

---

## Scenario 6: Step 3: Interpret Results
> 来源: mslearn-dlp-policy-tip-har-diagnostic.md | 适用: 未标注

### 排查步骤
The diagnostic extracts from `GetDlpPolicyTips` calls:

| Output Field | What It Tells You |
|-------------|-------------------|
| Sender and Recipient Info | Whether participants are in policy scope |
| Evaluation Result | Whether policy check succeeded or failed |
| Detected SITs | SITs found, occurrence count, confidence level |
| Evaluated Policies and Rules | Which DLP rules were checked and matched |

`[来源: mslearn-dlp-policy-tip-har-diagnostic.md]`

---

## Scenario 7: Common Scenarios
> 来源: mslearn-dlp-policy-tip-har-diagnostic.md | 适用: 未标注

### 排查步骤
| Scenario | Meaning | Next Steps |
|----------|---------|------------|
| No GetDlpPolicyTips API calls | OWA didn't send evaluation request | Recapture HAR trace; contact support |
| Evaluation result 8 | Back-end service error | Contact support |
| No matching rules found | Content doesn't meet any DLP conditions | Check SIT types, confidence levels, thresholds in policy |

`[来源: mslearn-dlp-policy-tip-har-diagnostic.md]`

---

## Scenario 8: Key Checks When No Rules Match
> 来源: mslearn-dlp-policy-tip-har-diagnostic.md | 适用: 未标注

### 排查步骤
1. Verify DLP policy is enabled and configured correctly
2. Check SITs in policy match content in email
3. Check confidence levels (may be too strict)
4. Check match threshold (may be too high)
5. Verify policy is published and assigned to correct scope

`[来源: mslearn-dlp-policy-tip-har-diagnostic.md]`

---

## Scenario 9: DLP Blocked Outbound Email — Jarvis Investigation
> 来源: onenote-dlp-blocked-email-jarvis.md | 适用: 未标注

### 排查步骤
> Source: OneNote — Sample Query: DLP blocked outbound email
> Status: draft

`[来源: onenote-dlp-blocked-email-jarvis.md]`

---

## Scenario 10: Scenario
> 来源: onenote-dlp-blocked-email-jarvis.md | 适用: 未标注

### 排查步骤
Customer reports outbound email is blocked by DLP. NDR message indicates DLP policy match with label-based or content-based rule.

`[来源: onenote-dlp-blocked-email-jarvis.md]`

---

## Scenario 11: 1. Identify DLP Block Record in Jarvis
> 来源: onenote-dlp-blocked-email-jarvis.md | 适用: 未标注

### 排查步骤
- Namespace: `O365PassiveGal`
- Table: `DLPPolicyAgentLogs`
- Filter by **Tenant ID**

Key fields to look for:
- `IsMatch: True` — confirms DLP rule matched
- `Actions` — shows what actions were taken:
  - `BlockAccess: True` — message was blocked
  - `ExNotifyUser: True` — user notification sent
  - `GenerateAlertAction: True` — alert generated
  - `GenerateIncidentReport: True` — incident report created

`[来源: onenote-dlp-blocked-email-jarvis.md]`

---

## Scenario 12: 2. Get Correlation ID
> 来源: onenote-dlp-blocked-email-jarvis.md | 适用: 未标注

### 排查步骤
- Filter query for blocked action records
- Extract the **correlationID** from the DLP block event

`[来源: onenote-dlp-blocked-email-jarvis.md]`

---

## Scenario 13: 3. Full DLP Log Trace
> 来源: onenote-dlp-blocked-email-jarvis.md | 适用: 未标注

### 排查步骤
- Run query filtered by the **correlationID** to get the complete DLP evaluation chain
- This shows all rules evaluated, match conditions, and final actions

`[来源: onenote-dlp-blocked-email-jarvis.md]`

---

## Scenario 14: Key Indicators
> 来源: onenote-dlp-blocked-email-jarvis.md | 适用: 未标注

### 排查步骤
| Field | Value | Meaning |
|---|---|---|
| IsMatch | True | DLP rule matched |
| BlockAccess | True | Email was blocked |
| ExNotifyUser | True | User was notified |

`[来源: onenote-dlp-blocked-email-jarvis.md]`

---

## Scenario 15: 21V Applicability
> 来源: onenote-dlp-blocked-email-jarvis.md | 适用: Mooncake ✅

### 排查步骤
Available in 21Vianet via Mooncake Jarvis portal.

`[来源: onenote-dlp-blocked-email-jarvis.md]`

---

## Scenario 16: DLP Rule Match for SharePoint File — Jarvis Investigation
> 来源: onenote-dlp-sharepoint-rule-match-jarvis.md | 适用: 未标注

### 排查步骤
> Source: OneNote — Sample query: DLP rule match for SharePoint file
> Status: draft

`[来源: onenote-dlp-sharepoint-rule-match-jarvis.md]`

---

## Scenario 17: Scenario
> 来源: onenote-dlp-sharepoint-rule-match-jarvis.md | 适用: 未标注

### 排查步骤
Customer reports DLP policy is triggering (or not triggering) on SharePoint files. Need to verify which DLP rules matched and what actions were applied.

`[来源: onenote-dlp-sharepoint-rule-match-jarvis.md]`

---

## Scenario 18: 1. Get SharePoint Item Object ID
> 来源: onenote-dlp-sharepoint-rule-match-jarvis.md | 适用: Global-only ❌

### 排查步骤
In 21Vianet, Activity Explorer is **not available**. Use Purview Audit instead:

- Search Purview Audit for target activity on the SharePoint item
- The audit log entry contains:
  - **Item ID** (highlighted in audit details)
  - **Site ID**
- Use the full item path to locate the correct audit entry

`[来源: onenote-dlp-sharepoint-rule-match-jarvis.md]`

---

## Scenario 19: 2. Query Jarvis DLP Agent Logs
> 来源: onenote-dlp-sharepoint-rule-match-jarvis.md | 适用: 未标注

### 排查步骤
- Namespace: `O365PassiveGal`
- Table: `DLPPolicyAgentLogs`
- Filters:
  - **Tenant ID**
  - **Item Object ID** (from step 1)

`[来源: onenote-dlp-sharepoint-rule-match-jarvis.md]`

---

## Scenario 20: 3. Analyze DLP Evaluation
> 来源: onenote-dlp-sharepoint-rule-match-jarvis.md | 适用: 未标注

### 排查步骤
You can filter by:
- **Rule ID** — to check specific rule evaluation
- **Keyword `IsMatch: True`** — to see which DLP policies matched

Key data points from returned logs:
- **Matched DLP Rule ID** — identifies which rule triggered
- **Exact Match Condition** — shows what content triggered the match (SIT, label, etc.)
- **DLP Actions Applied** — shows block/notify/report actions taken

`[来源: onenote-dlp-sharepoint-rule-match-jarvis.md]`

---

## Scenario 21: 21V Note
> 来源: onenote-dlp-sharepoint-rule-match-jarvis.md | 适用: Global-only ❌

### 排查步骤
Activity Explorer is not available in 21Vianet. Always fall back to Purview Audit to get item IDs before Jarvis investigation.

`[来源: onenote-dlp-sharepoint-rule-match-jarvis.md]`

---

## Scenario 22: 说明
> 来源: dlm-policy-sync.md | 适用: 未标注

### 排查步骤
统一策略同步 (Unified Policy Sync) 日志需要通过 Geneva Portal (Jarvis) 查询，用于排查 DLP/保留策略从 Security & Compliance Center 同步到各工作负载（SPO、EXO 等）的问题。

> 🟠 **Geneva 浏览器打开** - 构建 Jarvis URL 后使用 `Start-Process "{url}"` 在浏览器中打开，用户需使用 CME 账号登录查看结果。

---

`[来源: dlm-policy-sync.md]`

---

## Scenario 23: 事件信息
> 来源: dlm-policy-sync.md | 适用: Mooncake ✅

### 排查步骤
| 属性 | 值 |
|------|-----|
| 事件名 | UnifiedPolicyMonitoringInfoLogEvent |
| 命名空间 | O365EopGal |
| 环境 | CA Mooncake |

`[来源: dlm-policy-sync.md]`

---

## Scenario 24: Jarvis URL 模板
> 来源: dlm-policy-sync.md | 适用: Mooncake ✅

### 排查步骤
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=UnifiedPolicyMonitoringInfoLogEvent&conditions=[["TenantId","%3D%3D","{tenantId}"],["ClientCorrelationId","contains","{correlationId}"]]&kqlClientQuery=source%0A|%20project%20env_time,%20activityId,%20operationId,%20ObjectId,%20Workload,%20PolicyScenario%20,ClientCorrelationId,%20Stage,%20Status,%20CustomData,%20Latency%0A|%20extend%20Pipeline%20%3D%20iif(ObjectId%20%3D%3D%20"00000000-0000-0000-0000-000000000000",%20"FileSync",%20"ObjectSync")
```

`[来源: dlm-policy-sync.md]`

---

## Scenario 25: 构建 URL 的 KQL 模板
> 来源: dlm-policy-sync.md | 适用: Mooncake ✅

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let timediff_minutes = datetime_diff('minute', endtime, starttime);
let policy_sync_log = iff(isempty(tenantid), "Need a tenant ID to fullfil geneva link",
    strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", starttime,
           "&offset=", timediff_minutes,
           '&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=UnifiedPolicyMonitoringInfoLogEvent&conditions=[["TenantId","%3D%3D","', tenantid,
           '"],["ClientCorrelationId","contains","', correlationid,
           '"]]&kqlClientQuery=source%0A|%20project%20env_time,%20activityId,%20operationId,%20ObjectId,%20Workload,%20PolicyScenario%20,ClientCorrelationId,%20Stage,%20Status,%20CustomData,%20Latency%0A|%20extend%20Pipeline%20%3D%20iif(ObjectId%20%3D%3D%20"00000000-0000-0000-0000-000000000000",%20"FileSync",%20"ObjectSync")'));
print policy_sync_log
```

`[来源: dlm-policy-sync.md]`

---

## Scenario 26: 参数说明
> 来源: dlm-policy-sync.md | 适用: 未标注

### 排查步骤
| 参数 | 说明 | 示例 |
|------|------|------|
| {starttime} | 查询起始时间 | 2024-01-15T10:00:00Z |
| {minutes} | 向后查询的分钟数 | 60 |
| {tenantId} | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {correlationId} | 客户端关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

`[来源: dlm-policy-sync.md]`

---

## Scenario 27: 执行命令
> 来源: dlm-policy-sync.md | 适用: Mooncake ✅

### 排查步骤
```powershell
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$correlationId = "{correlationId}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=UnifiedPolicyMonitoringInfoLogEvent&conditions=[[`"TenantId`",`"%3D%3D`",`"$tenantId`"],[`"ClientCorrelationId`",`"contains`",`"$correlationId`"]]&kqlClientQuery=source%0A|%20project%20env_time,%20activityId,%20operationId,%20ObjectId,%20Workload,%20PolicyScenario%20,ClientCorrelationId,%20Stage,%20Status,%20CustomData,%20Latency%0A|%20extend%20Pipeline%20%3D%20iif(ObjectId%20%3D%3D%20%2200000000-0000-0000-0000-000000000000%22,%20%22FileSync%22,%20%22ObjectSync%22)"
Start-Process $url
```

`[来源: dlm-policy-sync.md]`

---

## Scenario 28: 返回字段
> 来源: dlm-policy-sync.md | 适用: 未标注

### 排查步骤
| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| activityId | 活动 ID |
| operationId | 操作 ID |
| ObjectId | 对象 ID (全零表示 FileSync，非零表示 ObjectSync) |
| Workload | 工作负载 (SPO/EXO 等) |
| PolicyScenario | 策略场景 |
| ClientCorrelationId | 客户端关联 ID |
| Stage | 同步阶段 |
| Status | 同步状态 |
| CustomData | 自定义数据（包含详细信息） |
| Latency | 延迟 |
| Pipeline | 同步管道类型 (FileSync/ObjectSync) |

---

`[来源: dlm-policy-sync.md]`

---

## Scenario 29: 场景: 策略同步失败或延迟
> 来源: dlm-policy-sync.md | 适用: 未标注

### 排查步骤
1. **获取必要参数**:
   - TenantId (必须)
   - ClientCorrelationId (可选)
2. **构建 Jarvis URL** - 使用上述模板
3. **分析结果**:
   - 检查 `Status` 字段确认同步状态 (Success/Failure)
   - 检查 `Stage` 字段确认失败的同步阶段
   - 检查 `Pipeline` 字段区分 FileSync（全量同步）和 ObjectSync（对象同步）
   - 检查 `Latency` 字段评估同步延迟
   - 检查 `CustomData` 获取详细错误信息

`[来源: dlm-policy-sync.md]`

---

## Scenario 30: 场景: 策略未同步到特定工作负载
> 来源: dlm-policy-sync.md | 适用: 未标注

### 排查步骤
1. 使用 TenantId 查询所有策略同步事件
2. 按 `Workload` 字段筛选目标工作负载
3. 检查 `PolicyScenario` 确认策略类型
4. 分析 `Status` 和 `CustomData` 了解失败原因

---

`[来源: dlm-policy-sync.md]`

---

## Scenario 31: 说明
> 来源: dlp-jarvis-urls.md | 适用: 未标注

### 排查步骤
DLP (Data Loss Prevention) 日志需要通过 Geneva Portal (Jarvis) 查询，无法直接使用 Kusto 客户端。

> 🟠 **Geneva 浏览器打开** - 构建 Jarvis URL 后使用 `Start-Process "{url}"` 在浏览器中打开，用户需使用 CME 账号登录查看结果。

---

`[来源: dlp-jarvis-urls.md]`

---

## Scenario 32: 事件信息
> 来源: dlp-jarvis-urls.md | 适用: Mooncake ✅

### 排查步骤
| 属性 | 值 |
|------|-----|
| 事件名 | DLPSubstrateErrorEvent, DLPSubstrateEvent |
| 命名空间 | O365PassiveGal |
| 环境 | CA Mooncake |

`[来源: dlp-jarvis-urls.md]`

---

## Scenario 33: Jarvis URL 模板 (按对象 ID)
> 来源: dlp-jarvis-urls.md | 适用: Mooncake ✅

### 排查步骤
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=DLPSubstrateErrorEvent,DLPSubstrateEvent&conditions=[["TenantId","%3D%3D","{tenantId}"],["WorkloadItemId","contains","{objectId}"]]&kqlClientQuery=source|project%20env_time,%20CorrelationId,%20AssistantName,%20Data,%20WorkloadItemId|sort%20by%20env_time%20asc
```

`[来源: dlp-jarvis-urls.md]`

---

## Scenario 34: 参数说明
> 来源: dlp-jarvis-urls.md | 适用: 未标注

### 排查步骤
| 参数 | 说明 | 示例 |
|------|------|------|
| {starttime} | 查询起始时间 | 2024-01-15T10:00:00Z |
| {minutes} | 向后查询的分钟数 | 60 |
| {tenantId} | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {objectId} | SharePoint 文件 ID 或邮件 ID | 01ABCD... |

`[来源: dlp-jarvis-urls.md]`

---

## Scenario 35: 执行命令 (SPO/ODB)
> 来源: dlp-jarvis-urls.md | 适用: Mooncake ✅

### 排查步骤
```powershell
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$objectId = "{objectId}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=DLPSubstrateErrorEvent,DLPSubstrateEvent&conditions=[[`"TenantId`",`"%3D%3D`",`"$tenantId`"],[`"WorkloadItemId`",`"contains`",`"$objectId`"]]&kqlClientQuery=source|project%20env_time,%20CorrelationId,%20AssistantName,%20Data,%20WorkloadItemId|sort%20by%20env_time%20asc"
Start-Process $url
```

`[来源: dlp-jarvis-urls.md]`

---

## Scenario 36: 返回字段
> 来源: dlp-jarvis-urls.md | 适用: 未标注

### 排查步骤
- `env_time` - 事件时间
- `CorrelationId` - 关联 ID
- `AssistantName` - 助手名称
- `Data` - DLP 策略评估数据
- `WorkloadItemId` - 工作负载项目 ID

---

`[来源: dlp-jarvis-urls.md]`

---

## Scenario 37: 事件信息
> 来源: dlp-jarvis-urls.md | 适用: Mooncake ✅

### 排查步骤
| 属性 | 值 |
|------|-----|
| 事件名 | DLPPolicyAgentLogs |
| 命名空间 | O365PassiveGal |
| 环境 | CA Mooncake |

`[来源: dlp-jarvis-urls.md]`

---

## Scenario 38: Jarvis URL 模板 (按对象 ID)
> 来源: dlp-jarvis-urls.md | 适用: Mooncake ✅

### 排查步骤
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=DLPPolicyAgentLogs&conditions=[["TenantId","contains","{tenantId}"],["ContextData","contains","{objectId}"]]&kqlClientQuery=source|project%20Time,%20Client,%20EventType,CorrelationId,ContextData|sort%20by%20Time%20asc
```

`[来源: dlp-jarvis-urls.md]`

---

## Scenario 39: 执行命令 (EXO)
> 来源: dlp-jarvis-urls.md | 适用: Mooncake ✅

### 排查步骤
```powershell
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$objectId = "{objectId}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=DLPPolicyAgentLogs&conditions=[[`"TenantId`",`"contains`",`"$tenantId`"],[`"ContextData`",`"contains`",`"$objectId`"]]&kqlClientQuery=source|project%20Time,%20Client,%20EventType,CorrelationId,ContextData|sort%20by%20Time%20asc"
Start-Process $url
```

`[来源: dlp-jarvis-urls.md]`

---

## Scenario 40: 返回字段 (EXO)
> 来源: dlp-jarvis-urls.md | 适用: 未标注

### 排查步骤
- `Time` - 事件时间
- `Client` - 客户端
- `EventType` - 事件类型
- `CorrelationId` - 关联 ID
- `ContextData` - 上下文数据（包含策略评估详情）

---

`[来源: dlp-jarvis-urls.md]`

---

## Scenario 41: 场景: DLP 策略未触发
> 来源: dlp-jarvis-urls.md | 适用: 未标注

### 排查步骤
1. **确定工作负载** - SPO/ODB 或 EXO
2. **获取必要参数**:
   - TenantId
   - ObjectId (SharePoint 文件 ID 或 EXO 邮件 ID)
3. **构建 Jarvis URL** - 使用上述模板
4. **分析结果**:
   - 检查 AssistantName 确认 DLP 助手是否运行
   - 检查 Data 字段查看策略评估结果

`[来源: dlp-jarvis-urls.md]`

---

## Scenario 42: 场景: DLP 策略误报
> 来源: dlp-jarvis-urls.md | 适用: 未标注

### 排查步骤
1. 查询相关事件获取 CorrelationId
2. 检查 Data 字段中的规则匹配详情
3. 分析敏感信息检测结果

---

`[来源: dlp-jarvis-urls.md]`

---

# Kusto 查询参考

## 来源: `dlm-policy-sync.md`

# 统一策略同步状态查询

## 说明

统一策略同步 (Unified Policy Sync) 日志需要通过 Geneva Portal (Jarvis) 查询，用于排查 DLP/保留策略从 Security & Compliance Center 同步到各工作负载（SPO、EXO 等）的问题。

> 🟠 **Geneva 浏览器打开** - 构建 Jarvis URL 后使用 `Start-Process "{url}"` 在浏览器中打开，用户需使用 CME 账号登录查看结果。

---

## 查询: 策略同步状态

### 事件信息

| 属性 | 值 |
|------|-----|
| 事件名 | UnifiedPolicyMonitoringInfoLogEvent |
| 命名空间 | O365EopGal |
| 环境 | CA Mooncake |

### Jarvis URL 模板

```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=UnifiedPolicyMonitoringInfoLogEvent&conditions=[["TenantId","%3D%3D","{tenantId}"],["ClientCorrelationId","contains","{correlationId}"]]&kqlClientQuery=source%0A|%20project%20env_time,%20activityId,%20operationId,%20ObjectId,%20Workload,%20PolicyScenario%20,ClientCorrelationId,%20Stage,%20Status,%20CustomData,%20Latency%0A|%20extend%20Pipeline%20%3D%20iif(ObjectId%20%3D%3D%20"00000000-0000-0000-0000-000000000000",%20"FileSync",%20"ObjectSync")
```

### 构建 URL 的 KQL 模板

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let timediff_minutes = datetime_diff('minute', endtime, starttime);
let policy_sync_log = iff(isempty(tenantid), "Need a tenant ID to fullfil geneva link",
    strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", starttime,
           "&offset=", timediff_minutes,
           '&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=UnifiedPolicyMonitoringInfoLogEvent&conditions=[["TenantId","%3D%3D","', tenantid,
           '"],["ClientCorrelationId","contains","', correlationid,
           '"]]&kqlClientQuery=source%0A|%20project%20env_time,%20activityId,%20operationId,%20ObjectId,%20Workload,%20PolicyScenario%20,ClientCorrelationId,%20Stage,%20Status,%20CustomData,%20Latency%0A|%20extend%20Pipeline%20%3D%20iif(ObjectId%20%3D%3D%20"00000000-0000-0000-0000-000000000000",%20"FileSync",%20"ObjectSync")'));
print policy_sync_log
```

### 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| {starttime} | 查询起始时间 | 2024-01-15T10:00:00Z |
| {minutes} | 向后查询的分钟数 | 60 |
| {tenantId} | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {correlationId} | 客户端关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

### 执行命令

```powershell
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$correlationId = "{correlationId}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=UnifiedPolicyMonitoringInfoLogEvent&conditions=[[`"TenantId`",`"%3D%3D`",`"$tenantId`"],[`"ClientCorrelationId`",`"contains`",`"$correlationId`"]]&kqlClientQuery=source%0A|%20project%20env_time,%20activityId,%20operationId,%20ObjectId,%20Workload,%20PolicyScenario%20,ClientCorrelationId,%20Stage,%20Status,%20CustomData,%20Latency%0A|%20extend%20Pipeline%20%3D%20iif(ObjectId%20%3D%3D%20%2200000000-0000-0000-0000-000000000000%22,%20%22FileSync%22,%20%22ObjectSync%22)"
Start-Process $url
```

### 返回字段

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| activityId | 活动 ID |
| operationId | 操作 ID |
| ObjectId | 对象 ID (全零表示 FileSync，非零表示 ObjectSync) |
| Workload | 工作负载 (SPO/EXO 等) |
| PolicyScenario | 策略场景 |
| ClientCorrelationId | 客户端关联 ID |
| Stage | 同步阶段 |
| Status | 同步状态 |
| CustomData | 自定义数据（包含详细信息） |
| Latency | 延迟 |
| Pipeline | 同步管道类型 (FileSync/ObjectSync) |

---

## 策略同步问题排查流程

### 场景: 策略同步失败或延迟

1. **获取必要参数**:
   - TenantId (必须)
   - ClientCorrelationId (可选)
2. **构建 Jarvis URL** - 使用上述模板
3. **分析结果**:
   - 检查 `Status` 字段确认同步状态 (Success/Failure)
   - 检查 `Stage` 字段确认失败的同步阶段
   - 检查 `Pipeline` 字段区分 FileSync（全量同步）和 ObjectSync（对象同步）
   - 检查 `Latency` 字段评估同步延迟
   - 检查 `CustomData` 获取详细错误信息

### 场景: 策略未同步到特定工作负载

1. 使用 TenantId 查询所有策略同步事件
2. 按 `Workload` 字段筛选目标工作负载
3. 检查 `PolicyScenario` 确认策略类型
4. 分析 `Status` 和 `CustomData` 了解失败原因

---

## 参考链接

- [DLM TSG](https://supportability.visualstudio.com/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/98833/Unified-Retention-and-Labels)
- [Geneva Portal (Jarvis)](https://portal.microsoftgeneva.com)

---

## 来源: `dlp-jarvis-urls.md`

# DLP 日志查询 (Jarvis)

## 说明

DLP (Data Loss Prevention) 日志需要通过 Geneva Portal (Jarvis) 查询，无法直接使用 Kusto 客户端。

> 🟠 **Geneva 浏览器打开** - 构建 Jarvis URL 后使用 `Start-Process "{url}"` 在浏览器中打开，用户需使用 CME 账号登录查看结果。

---

## SPO/ODB DLP 查询

### 事件信息

| 属性 | 值 |
|------|-----|
| 事件名 | DLPSubstrateErrorEvent, DLPSubstrateEvent |
| 命名空间 | O365PassiveGal |
| 环境 | CA Mooncake |

### Jarvis URL 模板 (按对象 ID)

```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=DLPSubstrateErrorEvent,DLPSubstrateEvent&conditions=[["TenantId","%3D%3D","{tenantId}"],["WorkloadItemId","contains","{objectId}"]]&kqlClientQuery=source|project%20env_time,%20CorrelationId,%20AssistantName,%20Data,%20WorkloadItemId|sort%20by%20env_time%20asc
```

### 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| {starttime} | 查询起始时间 | 2024-01-15T10:00:00Z |
| {minutes} | 向后查询的分钟数 | 60 |
| {tenantId} | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {objectId} | SharePoint 文件 ID 或邮件 ID | 01ABCD... |

### 执行命令 (SPO/ODB)

```powershell
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$objectId = "{objectId}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=DLPSubstrateErrorEvent,DLPSubstrateEvent&conditions=[[`"TenantId`",`"%3D%3D`",`"$tenantId`"],[`"WorkloadItemId`",`"contains`",`"$objectId`"]]&kqlClientQuery=source|project%20env_time,%20CorrelationId,%20AssistantName,%20Data,%20WorkloadItemId|sort%20by%20env_time%20asc"
Start-Process $url
```

### 返回字段

- `env_time` - 事件时间
- `CorrelationId` - 关联 ID
- `AssistantName` - 助手名称
- `Data` - DLP 策略评估数据
- `WorkloadItemId` - 工作负载项目 ID

---

## EXO DLP 查询

### 事件信息

| 属性 | 值 |
|------|-----|
| 事件名 | DLPPolicyAgentLogs |
| 命名空间 | O365PassiveGal |
| 环境 | CA Mooncake |

### Jarvis URL 模板 (按对象 ID)

```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=DLPPolicyAgentLogs&conditions=[["TenantId","contains","{tenantId}"],["ContextData","contains","{objectId}"]]&kqlClientQuery=source|project%20Time,%20Client,%20EventType,CorrelationId,ContextData|sort%20by%20Time%20asc
```

### 执行命令 (EXO)

```powershell
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$objectId = "{objectId}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=DLPPolicyAgentLogs&conditions=[[`"TenantId`",`"contains`",`"$tenantId`"],[`"ContextData`",`"contains`",`"$objectId`"]]&kqlClientQuery=source|project%20Time,%20Client,%20EventType,CorrelationId,ContextData|sort%20by%20Time%20asc"
Start-Process $url
```

### 返回字段 (EXO)

- `Time` - 事件时间
- `Client` - 客户端
- `EventType` - 事件类型
- `CorrelationId` - 关联 ID
- `ContextData` - 上下文数据（包含策略评估详情）

---

## DLP 问题排查流程

### 场景: DLP 策略未触发

1. **确定工作负载** - SPO/ODB 或 EXO
2. **获取必要参数**:
   - TenantId
   - ObjectId (SharePoint 文件 ID 或 EXO 邮件 ID)
3. **构建 Jarvis URL** - 使用上述模板
4. **分析结果**:
   - 检查 AssistantName 确认 DLP 助手是否运行
   - 检查 Data 字段查看策略评估结果

### 场景: DLP 策略误报

1. 查询相关事件获取 CorrelationId
2. 检查 Data 字段中的规则匹配详情
3. 分析敏感信息检测结果

---

## 参考链接

- [Microsoft Purview DLP 故障排查](https://learn.microsoft.com/purview/dlp-learn-about-dlp)
- [Geneva Portal (Jarvis)](https://portal.microsoftgeneva.com)

---

