---
name: dlm-policy-sync
description: 统一策略同步状态查询 Jarvis URL 模板
tables:
  - UnifiedPolicyMonitoringInfoLogEvent (Jarvis)
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
  - name: correlationId
    required: false
    description: 客户端关联 ID
---

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
