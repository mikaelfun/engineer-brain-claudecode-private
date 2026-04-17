---
name: dlm-elc-operations
description: DLM 邮件生命周期 (ELC) 操作日志查询 Jarvis URL 模板
tables:
  - ElcStatsLogEntryEvent (Jarvis)
  - ElcStatsLogEntryExceptionEvent (Jarvis)
  - ElcAssistantTraceEvent (Jarvis)
  - ElcAssistantTraceExEvent (Jarvis)
parameters:
  - name: starttime
    required: true
    description: 开始时间 (ISO 8601 格式)
  - name: endtime
    required: true
    description: 结束时间 (ISO 8601 格式)
  - name: tenantId
    required: true
    description: 租户 ID
  - name: mailboxGuid
    required: false
    description: 邮箱 GUID (可通过 get-mailbox <upn> | select Name, ExchangeGuid 获取)
---

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
