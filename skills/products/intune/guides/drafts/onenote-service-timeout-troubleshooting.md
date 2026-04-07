# Intune Portal Service Timeout Troubleshooting (HTTP 503/504)

**Source:** MCVKB/Intune/How to troubleshoot service timeouts from the Intu.md  
**Related IDs:** intune-onenote-039, intune-onenote-045  
**Tags:** portal, timeout, kusto, http-503, http-504, blade-error

---

## 症状

- 设备列表无法导出
- AutoPilot CSV 文件导入失败，返回 generic "failed to save" 错误
- 设备或对象枚举耗时过长，无法完成
- Fiddler/F12 抓包显示 HTTP 503 / 504 错误（graph.microsoft.com）
- Portal Blade 加载卡住约 15 秒后报错（ClientClosedRequestException / TimeoutException）

## 根因

Intune 后端服务存在两层超时：
- **Soft timeout**: 15,000 ms（ScenarioTimeout/ClientTimeout）
- **Hard failure**: 30,000 ms

超出后抛出 `ServiceTooBusyException` 或 `TimeoutException`，典型错误信息：
```
Microsoft.Management.Services.Common.ServiceTooBusyException:
ScenarioTimeout=15000ms, RequestTimeout=15000ms,
Elapsed=30008ms, CancelOnTimeout for #xxxxx
```

## 排查步骤

### Step 1：收集 F12/HAR trace

1. 打开 Fiddler → File → Import sessions → HTTPArchive（.har）
2. Select All → 右键 → Decode Selected Sessions
3. 找到第一个红色错误（HTTP 50x/40x），URL 通常是 `graph.microsoft.com`
4. 切换到 Inspectors → Raw 视图
5. 从 **Request pane** 复制 `client-request-id`（或 `x-ms-client-request-id`）
6. 从 **Response pane** 复制 `request-id` 和 `date`（时间戳）

### Step 2：Kusto 查询链（开 3 个 tab）

**Query 1 — HttpSubsystem（获取 cVBase）**
```kusto
let requestDate = datetime(<TIMESTAMP>);
let clientrequestid = '<CLIENT-REQUEST-ID>';
HttpSubsystem
| where env_time between (datetime_add('minute', -1, make_datetime(requestDate))..datetime_add('minute', 2, make_datetime(requestDate)))
| where ActivityId == clientrequestid
| project cVBase, httpVerb, url, statusCode, errorCode, elapsedMilliseconds, ActivityId
```

**Query 2 — IntuneEvent（获取 exception ActivityId）**
```kusto
let requestDate = datetime(<TIMESTAMP>);
let myCV = '<cVBase>';
IntuneEvent
| where env_time between (datetime_add('minute', -1, make_datetime(requestDate))..datetime_add('minute', 2, make_datetime(requestDate)))
| where cV has myCV
| order by env_time desc
| project ActivityId, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```

**Query 3 — CMService（确认超时）**
```kusto
let requestDate = datetime(<TIMESTAMP>);
let myActivityID = '<ACTIVITY-ID-FROM-Q2>';
CMService
| where env_time between (datetime_add('minute', -1, make_datetime(requestDate))..datetime_add('minute', 2, make_datetime(requestDate)))
| where ActivityId == myActivityID
| order by env_time desc
| project ex, url, elapsedMilliseconds, TaskName, debugMessage, ActivityId
```

### Step 3：确认后升级

- 若 CMService 查询结果中 `elapsedMilliseconds` 接近或超过 15000/30000，即确认后端超时
- 在 Rave/IcM 中创建 Assistance Request (AR) 交给 IET 团队处理
- **不要**向客户推测超时的具体业务原因

## Blade Error 变体（portal blade 加载失败）

对于 DeviceConfiguration 等 blade 加载失败：

```kusto
// Step 1: IntuneEvent by client-request-id
IntuneEvent
| where env_time between (datetime(<START>) .. datetime(<END>))
| where ActivityId == "<client-request-id>"
| project env_time, ApplicationName, ComponentName, ServiceName, EventUniqueName, Message, ColMetadata, Col1-Col6

// Step 2: CMService
CMService
| where env_time between (datetime(<START>) .. datetime(<END>))
| where ActivityId == "<client-request-id>"
```

查找 `TimeoutException`、`ClientClosedRequestException` 等关键字。

## 21Vianet 适用性

✅ 适用 — 超时机制在 21v 和 Public 云行为一致，排查流程相同。

---
*Extracted from OneNote: MCVKB/Intune | 2026-04-04*
