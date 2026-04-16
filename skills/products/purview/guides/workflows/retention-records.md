# Purview 保留策略与记录管理 — 排查工作流

**来源草稿**: `onenote-retention-policy-distribution-jarvis.md`
**Kusto 引用**: `dlm-elc-operations.md`, `dlm-policy-sync.md`
**场景数**: 28
**生成日期**: 2026-04-07

---

## Scenario 1: Retention Policy Distribution Troubleshooting via Jarvis
> 来源: onenote-retention-policy-distribution-jarvis.md | 适用: 未标注

### 排查步骤
> Source: OneNote — Query for retention policy distribution details
> Status: draft

`[来源: onenote-retention-policy-distribution-jarvis.md]`

---

## Scenario 2: When to Use
> 来源: onenote-retention-policy-distribution-jarvis.md | 适用: 未标注

### 排查步骤
Customer reports retention policy is not applied / sync failed / distribution stuck.

`[来源: onenote-retention-policy-distribution-jarvis.md]`

---

## Scenario 3: 1. Get Policy GUID
> 来源: onenote-retention-policy-distribution-jarvis.md | 适用: 未标注

### 排查步骤
```powershell
Get-RetentionCompliancePolicy -Identity "<policy name>" -DistributionDetail | Format-List *
```

- Note the **GUID** (this is the policy ID)
- Note the **LastStatusUpdateTime** (policy sync timestamp)

`[来源: onenote-retention-policy-distribution-jarvis.md]`

---

## Scenario 4: 2. Query Jarvis
> 来源: onenote-retention-policy-distribution-jarvis.md | 适用: 未标注

### 排查步骤
- Namespace: `O365PassiveGal`
- Table: `UnifiedPolicyMonitoringInfoLogEvent`
- Set time range to cover the policy update window
- Set filter: `Container = {GUID}`
- Saved query: https://portal.microsoftgeneva.com/s/24D066E5

`[来源: onenote-retention-policy-distribution-jarvis.md]`

---

## Scenario 5: 3. Analyze Results
> 来源: onenote-retention-policy-distribution-jarvis.md | 适用: 未标注

### 排查步骤
```kql
source
| project env_time, Workload, ObjectType, Stage, Status, RetryCount, Description, CustomData
| sort by env_time asc
```

- Look at the **target workload** column
- Check **Status** and **Description** for error details
- **RetryCount** > 0 indicates transient failures

`[来源: onenote-retention-policy-distribution-jarvis.md]`

---

## Scenario 6: 21V Applicability
> 来源: onenote-retention-policy-distribution-jarvis.md | 适用: Mooncake ✅

### 排查步骤
Available in 21Vianet. Use Mooncake Jarvis portal.

`[来源: onenote-retention-policy-distribution-jarvis.md]`

---

## Scenario 7: 说明
> 来源: dlm-elc-operations.md | 适用: 未标注

### 排查步骤
Email Lifecycle (ELC) 日志需要通过 Geneva Portal (Jarvis) 查询，用于排查邮件保留、过期、自动归档等生命周期管理问题。

> 🟠 **Geneva 浏览器打开** - 构建 Jarvis URL 后使用 `Start-Process "{url}"` 在浏览器中打开，用户需使用 CME 账号登录查看结果。

---

`[来源: dlm-elc-operations.md]`

---

## Scenario 8: 事件信息
> 来源: dlm-elc-operations.md | 适用: Mooncake ✅

### 排查步骤
| 属性 | 值 |
|------|-----|
| 事件名 | ElcStatsLogEntryEvent, ElcStatsLogEntryExceptionEvent |
| 命名空间 | O365PassiveGal |
| 环境 | CA Mooncake |

`[来源: dlm-elc-operations.md]`

---

## Scenario 9: Jarvis URL 模板
> 来源: dlm-elc-operations.md | 适用: Mooncake ✅

### 排查步骤
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcStatsLogEntryEvent,ElcStatsLogEntryExceptionEvent&conditions=[["tenantId","%3D%3D","{tenantId}"],["mailboxGuid","contains","{mailboxGuid}"]]&kqlClientQuery=source%0A|%20sort%20by%20env_time%20asc
```

`[来源: dlm-elc-operations.md]`

---

## Scenario 10: 构建 URL 的 KQL 模板
> 来源: dlm-elc-operations.md | 适用: Mooncake ✅

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let mailboxguid = "{mailboxGuid}";
let timediff_minutes = datetime_diff('minute', endtime, starttime);
let elc_state = iff(isempty(tenantid), 'Need tenant Id to fullfil geneva link',
    strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", starttime,
           "&offset=", timediff_minutes,
           '&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcStatsLogEntryEvent,ElcStatsLogEntryExceptionEvent&conditions=[["tenantId","%3D%3D","', tenantid,
           '"],["mailboxGuid","contains","', mailboxguid,
           '"]]&kqlClientQuery=source%0A|%20sort%20by%20env_time%20asc'));
print elc_state
```

`[来源: dlm-elc-operations.md]`

---

## Scenario 11: 参数说明
> 来源: dlm-elc-operations.md | 适用: 未标注

### 排查步骤
| 参数 | 说明 | 示例 |
|------|------|------|
| {starttime} | 查询起始时间 | 2024-01-15T10:00:00Z |
| {minutes} | 向后查询的分钟数 | 60 |
| {tenantId} | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {mailboxGuid} | 邮箱 GUID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

`[来源: dlm-elc-operations.md]`

---

## Scenario 12: 执行命令 (ELC 状态)
> 来源: dlm-elc-operations.md | 适用: Mooncake ✅

### 排查步骤
```powershell
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$mailboxGuid = "{mailboxGuid}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcStatsLogEntryEvent,ElcStatsLogEntryExceptionEvent&conditions=[[`"tenantId`",`"%3D%3D`",`"$tenantId`"],[`"mailboxGuid`",`"contains`",`"$mailboxGuid`"]]&kqlClientQuery=source%0A|%20sort%20by%20env_time%20asc"
Start-Process $url
```

---

`[来源: dlm-elc-operations.md]`

---

## Scenario 13: 事件信息
> 来源: dlm-elc-operations.md | 适用: Mooncake ✅

### 排查步骤
| 属性 | 值 |
|------|-----|
| 事件名 | ElcAssistantTraceEvent, ElcAssistantTraceExEvent |
| 命名空间 | O365PassiveGal |
| 环境 | CA Mooncake |

`[来源: dlm-elc-operations.md]`

---

## Scenario 14: Jarvis URL 模板
> 来源: dlm-elc-operations.md | 适用: Mooncake ✅

### 排查步骤
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcAssistantTraceEvent,ElcAssistantTraceExEvent&conditions=[["tenantId","%3D%3D","{tenantId}"],["mailboxGuid","contains","{mailboxGuid}"]]&kqlClientQuery=source%0A|%20project%20env_time,%20message,%20activityId,%20operationId,assistantName%20,%20scenario,%20subScenario,%20mailboxGuid%0A|%20sort%20by%20env_time%20asc
```

`[来源: dlm-elc-operations.md]`

---

## Scenario 15: 构建 URL 的 KQL 模板
> 来源: dlm-elc-operations.md | 适用: Mooncake ✅

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let mailboxguid = "{mailboxGuid}";
let timediff_minutes = datetime_diff('minute', endtime, starttime);
let elc_trace = iff(isempty(tenantid), 'Need tenant Id to fullfil geneva link',
    strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", starttime,
           "&offset=", timediff_minutes,
           '&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcAssistantTraceEvent,ElcAssistantTraceExEvent&conditions=[["tenantId","%3D%3D","', tenantid,
           '"],["mailboxGuid","contains","', mailboxguid,
           '"]]&kqlClientQuery=source%0A|%20project%20env_time,%20message,%20activityId,%20operationId,assistantName%20,%20scenario,%20subScenario,%20mailboxGuid%0A|%20sort%20by%20env_time%20asc'));
print elc_trace
```

`[来源: dlm-elc-operations.md]`

---

## Scenario 16: 返回字段
> 来源: dlm-elc-operations.md | 适用: 未标注

### 排查步骤
| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| message | 跟踪消息 |
| activityId | 活动 ID |
| operationId | 操作 ID |
| assistantName | 助手名称 |
| scenario | 场景 |
| subScenario | 子场景 |
| mailboxGuid | 邮箱 GUID |

`[来源: dlm-elc-operations.md]`

---

## Scenario 17: 执行命令 (ELC 跟踪)
> 来源: dlm-elc-operations.md | 适用: Mooncake ✅

### 排查步骤
```powershell
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$mailboxGuid = "{mailboxGuid}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcAssistantTraceEvent,ElcAssistantTraceExEvent&conditions=[[`"tenantId`",`"%3D%3D`",`"$tenantId`"],[`"mailboxGuid`",`"contains`",`"$mailboxGuid`"]]&kqlClientQuery=source%0A|%20project%20env_time,%20message,%20activityId,%20operationId,assistantName%20,%20scenario,%20subScenario,%20mailboxGuid%0A|%20sort%20by%20env_time%20asc"
Start-Process $url
```

---

`[来源: dlm-elc-operations.md]`

---

## Scenario 18: 场景: 邮件保留策略未生效
> 来源: dlm-elc-operations.md | 适用: 未标注

### 排查步骤
1. **获取必要参数**:
   - TenantId
   - MailboxGuid (可选，通过 `get-mailbox <upn> | select Name, ExchangeGuid` 获取)
2. **查询 ELC 状态事件** - 使用查询 1 确认 ELC 助手是否处理了该邮箱
3. **查询 ELC 跟踪日志** - 使用查询 2 获取详细处理日志
4. **分析结果**:
   - 检查 scenario 和 subScenario 确认策略场景
   - 检查 message 字段获取处理详情
   - 如有 Exception 事件，查看 ElcStatsLogEntryExceptionEvent

`[来源: dlm-elc-operations.md]`

---

## Scenario 19: 场景: 邮件自动过期/归档问题
> 来源: dlm-elc-operations.md | 适用: 未标注

### 排查步骤
1. 确认保留策略配置正确
2. 查询 ELC 状态事件确认策略是否被应用
3. 检查 ELC 跟踪日志中的错误或异常

---

`[来源: dlm-elc-operations.md]`

---

## Scenario 20: 说明
> 来源: dlm-policy-sync.md | 适用: 未标注

### 排查步骤
统一策略同步 (Unified Policy Sync) 日志需要通过 Geneva Portal (Jarvis) 查询，用于排查 DLP/保留策略从 Security & Compliance Center 同步到各工作负载（SPO、EXO 等）的问题。

> 🟠 **Geneva 浏览器打开** - 构建 Jarvis URL 后使用 `Start-Process "{url}"` 在浏览器中打开，用户需使用 CME 账号登录查看结果。

---

`[来源: dlm-policy-sync.md]`

---

## Scenario 21: 事件信息
> 来源: dlm-policy-sync.md | 适用: Mooncake ✅

### 排查步骤
| 属性 | 值 |
|------|-----|
| 事件名 | UnifiedPolicyMonitoringInfoLogEvent |
| 命名空间 | O365EopGal |
| 环境 | CA Mooncake |

`[来源: dlm-policy-sync.md]`

---

## Scenario 22: Jarvis URL 模板
> 来源: dlm-policy-sync.md | 适用: Mooncake ✅

### 排查步骤
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=UnifiedPolicyMonitoringInfoLogEvent&conditions=[["TenantId","%3D%3D","{tenantId}"],["ClientCorrelationId","contains","{correlationId}"]]&kqlClientQuery=source%0A|%20project%20env_time,%20activityId,%20operationId,%20ObjectId,%20Workload,%20PolicyScenario%20,ClientCorrelationId,%20Stage,%20Status,%20CustomData,%20Latency%0A|%20extend%20Pipeline%20%3D%20iif(ObjectId%20%3D%3D%20"00000000-0000-0000-0000-000000000000",%20"FileSync",%20"ObjectSync")
```

`[来源: dlm-policy-sync.md]`

---

## Scenario 23: 构建 URL 的 KQL 模板
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

## Scenario 24: 参数说明
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

## Scenario 25: 执行命令
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

## Scenario 26: 返回字段
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

## Scenario 27: 场景: 策略同步失败或延迟
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

## Scenario 28: 场景: 策略未同步到特定工作负载
> 来源: dlm-policy-sync.md | 适用: 未标注

### 排查步骤
1. 使用 TenantId 查询所有策略同步事件
2. 按 `Workload` 字段筛选目标工作负载
3. 检查 `PolicyScenario` 确认策略类型
4. 分析 `Status` 和 `CustomData` 了解失败原因

---

`[来源: dlm-policy-sync.md]`

---

# Kusto 查询参考

## 来源: `dlm-elc-operations.md`

# DLM 邮件生命周期 (ELC) 操作日志

## 说明

Email Lifecycle (ELC) 日志需要通过 Geneva Portal (Jarvis) 查询，用于排查邮件保留、过期、自动归档等生命周期管理问题。

> 🟠 **Geneva 浏览器打开** - 构建 Jarvis URL 后使用 `Start-Process "{url}"` 在浏览器中打开，用户需使用 CME 账号登录查看结果。

---

## 查询 1: ELC 状态事件

### 事件信息

| 属性 | 值 |
|------|-----|
| 事件名 | ElcStatsLogEntryEvent, ElcStatsLogEntryExceptionEvent |
| 命名空间 | O365PassiveGal |
| 环境 | CA Mooncake |

### Jarvis URL 模板

```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcStatsLogEntryEvent,ElcStatsLogEntryExceptionEvent&conditions=[["tenantId","%3D%3D","{tenantId}"],["mailboxGuid","contains","{mailboxGuid}"]]&kqlClientQuery=source%0A|%20sort%20by%20env_time%20asc
```

### 构建 URL 的 KQL 模板

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let mailboxguid = "{mailboxGuid}";
let timediff_minutes = datetime_diff('minute', endtime, starttime);
let elc_state = iff(isempty(tenantid), 'Need tenant Id to fullfil geneva link',
    strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", starttime,
           "&offset=", timediff_minutes,
           '&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcStatsLogEntryEvent,ElcStatsLogEntryExceptionEvent&conditions=[["tenantId","%3D%3D","', tenantid,
           '"],["mailboxGuid","contains","', mailboxguid,
           '"]]&kqlClientQuery=source%0A|%20sort%20by%20env_time%20asc'));
print elc_state
```

### 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| {starttime} | 查询起始时间 | 2024-01-15T10:00:00Z |
| {minutes} | 向后查询的分钟数 | 60 |
| {tenantId} | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {mailboxGuid} | 邮箱 GUID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

### 执行命令 (ELC 状态)

```powershell
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$mailboxGuid = "{mailboxGuid}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcStatsLogEntryEvent,ElcStatsLogEntryExceptionEvent&conditions=[[`"tenantId`",`"%3D%3D`",`"$tenantId`"],[`"mailboxGuid`",`"contains`",`"$mailboxGuid`"]]&kqlClientQuery=source%0A|%20sort%20by%20env_time%20asc"
Start-Process $url
```

---

## 查询 2: ELC 助手跟踪日志

### 事件信息

| 属性 | 值 |
|------|-----|
| 事件名 | ElcAssistantTraceEvent, ElcAssistantTraceExEvent |
| 命名空间 | O365PassiveGal |
| 环境 | CA Mooncake |

### Jarvis URL 模板

```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcAssistantTraceEvent,ElcAssistantTraceExEvent&conditions=[["tenantId","%3D%3D","{tenantId}"],["mailboxGuid","contains","{mailboxGuid}"]]&kqlClientQuery=source%0A|%20project%20env_time,%20message,%20activityId,%20operationId,assistantName%20,%20scenario,%20subScenario,%20mailboxGuid%0A|%20sort%20by%20env_time%20asc
```

### 构建 URL 的 KQL 模板

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let mailboxguid = "{mailboxGuid}";
let timediff_minutes = datetime_diff('minute', endtime, starttime);
let elc_trace = iff(isempty(tenantid), 'Need tenant Id to fullfil geneva link',
    strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", starttime,
           "&offset=", timediff_minutes,
           '&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcAssistantTraceEvent,ElcAssistantTraceExEvent&conditions=[["tenantId","%3D%3D","', tenantid,
           '"],["mailboxGuid","contains","', mailboxguid,
           '"]]&kqlClientQuery=source%0A|%20project%20env_time,%20message,%20activityId,%20operationId,assistantName%20,%20scenario,%20subScenario,%20mailboxGuid%0A|%20sort%20by%20env_time%20asc'));
print elc_trace
```

### 返回字段

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| message | 跟踪消息 |
| activityId | 活动 ID |
| operationId | 操作 ID |
| assistantName | 助手名称 |
| scenario | 场景 |
| subScenario | 子场景 |
| mailboxGuid | 邮箱 GUID |

### 执行命令 (ELC 跟踪)

```powershell
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$mailboxGuid = "{mailboxGuid}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcAssistantTraceEvent,ElcAssistantTraceExEvent&conditions=[[`"tenantId`",`"%3D%3D`",`"$tenantId`"],[`"mailboxGuid`",`"contains`",`"$mailboxGuid`"]]&kqlClientQuery=source%0A|%20project%20env_time,%20message,%20activityId,%20operationId,assistantName%20,%20scenario,%20subScenario,%20mailboxGuid%0A|%20sort%20by%20env_time%20asc"
Start-Process $url
```

---

## ELC 问题排查流程

### 场景: 邮件保留策略未生效

1. **获取必要参数**:
   - TenantId
   - MailboxGuid (可选，通过 `get-mailbox <upn> | select Name, ExchangeGuid` 获取)
2. **查询 ELC 状态事件** - 使用查询 1 确认 ELC 助手是否处理了该邮箱
3. **查询 ELC 跟踪日志** - 使用查询 2 获取详细处理日志
4. **分析结果**:
   - 检查 scenario 和 subScenario 确认策略场景
   - 检查 message 字段获取处理详情
   - 如有 Exception 事件，查看 ElcStatsLogEntryExceptionEvent

### 场景: 邮件自动过期/归档问题

1. 确认保留策略配置正确
2. 查询 ELC 状态事件确认策略是否被应用
3. 检查 ELC 跟踪日志中的错误或异常

---

## 参考链接

- [DLM TSG](https://supportability.visualstudio.com/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/98833/Unified-Retention-and-Labels)
- [Compliance Hold TSG](https://supportability.visualstudio.com/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/102114/Compliance-Holds)
- [Geneva Portal (Jarvis)](https://portal.microsoftgeneva.com)

---

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

