---
name: dlp-jarvis-urls
description: DLP 日志查询 Jarvis URL 模板
tables:
  - DLPSubstrateErrorEvent (Jarvis)
  - DLPSubstrateEvent (Jarvis)
  - DLPPolicyAgentLogs (Jarvis)
parameters:
  - name: starttime
    required: true
    description: 开始时间 (ISO 8601 格式)
  - name: tenantId
    required: true
    description: 租户 ID
  - name: objectId
    required: false
    description: 邮件 ID 或 SharePoint 对象 ID
  - name: correlationId
    required: false
    description: UPE 评估关联 ID
---

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
