---
name: scc-rbac-logs
description: Security & Compliance Center RBAC 日志查询 Jarvis URL 模板
tables:
  - ServerEventLog (Jarvis)
  - TraceEventLog (Jarvis)
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
  - name: sessionId
    required: false
    description: 会话 ID (如需查看完整会话日志，可移除 tenantId 筛选条件)
---

# SCC RBAC 日志查询

## 说明

Security & Compliance Center (SCC) RBAC 日志需要通过 Geneva Portal (Jarvis) 查询，用于排查 Purview 合规门户的权限、角色分配和访问控制问题。

> 🟠 **Geneva 浏览器打开** - 构建 Jarvis URL 后使用 `Start-Process "{url}"` 在浏览器中打开，用户需使用 CME 账号登录查看结果。

---

## 查询: SCC RBAC 事件日志

### 事件信息

| 属性 | 值 |
|------|-----|
| 事件名 | ServerEventLog, TraceEventLog |
| 命名空间 | ProtectionCenterPROD |
| 环境 | CA Mooncake |

### Jarvis URL 模板

```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=ProtectionCenterPROD&en=ServerEventLog,TraceEventLog&conditions=[["TenantId","%3D%3D","{tenantId}"],["SessionId","contains","{sessionId}"]]&aggregates=["Count%20by%20domainStatus","Count%20by%20domainName","Count%20by%20resultType"]
```

### 构建 URL 的 KQL 模板

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let sessionid = "{sessionId}";
let timediff_minutes = datetime_diff('minute', endtime, starttime);
let scc_rbac_logs = iff(isempty(tenantid), "Need Tenant ID to fullfil geneva link",
    strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", starttime,
           "&offset=", timediff_minutes,
           '&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=ProtectionCenterPROD&en=ServerEventLog,TraceEventLog&conditions=[["TenantId","%3D%3D","', tenantid,
           '"],["SessionId","contains","', sessionid,
           '"]]&aggregates=["Count%20by%20domainStatus","Count%20by%20domainName","Count%20by%20resultType"]'));
print scc_rbac_logs
```

### 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| {starttime} | 查询起始时间 | 2024-01-15T10:00:00Z |
| {minutes} | 向后查询的分钟数 | 60 |
| {tenantId} | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {sessionId} | 会话 ID (可选) | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

### 执行命令

```powershell
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$sessionId = "{sessionId}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=ProtectionCenterPROD&en=ServerEventLog,TraceEventLog&conditions=[[`"TenantId`",`"%3D%3D`",`"$tenantId`"],[`"SessionId`",`"contains`",`"$sessionId`"]]&aggregates=[`"Count%20by%20domainStatus`",`"Count%20by%20domainName`",`"Count%20by%20resultType`"]"
Start-Process $url
```

### 聚合维度

Jarvis 查询默认包含以下聚合统计:

| 聚合 | 说明 |
|------|------|
| Count by domainStatus | 按域状态统计 |
| Count by domainName | 按域名统计 |
| Count by resultType | 按结果类型统计 |

---

## SCC RBAC 问题排查流程

### 场景: 用户无法访问 Purview 合规门户

1. **获取必要参数**:
   - TenantId (必须)
   - SessionId (可选，如有)
2. **构建 Jarvis URL** - 使用上述模板
3. **分析结果**:
   - 检查 `resultType` 确认请求是否成功
   - 检查 `domainStatus` 了解域验证状态
   - 检查 TraceEventLog 获取详细错误信息
   - 如需查看完整会话日志，可在 Geneva 条件中移除 TenantId 筛选，仅保留 SessionId

### 场景: RBAC 角色分配问题

1. 确认用户在 SCC 中的角色分配
2. 使用 TenantId 查询 ServerEventLog
3. 检查 RBAC 相关事件确认权限检查结果
4. 分析 TraceEventLog 中的详细权限评估信息

### 场景: SCC 操作失败

1. 获取操作时间和 TenantId
2. 查询 ServerEventLog 获取操作事件
3. 按 resultType 筛选失败事件
4. 检查 TraceEventLog 获取详细错误堆栈

---

## 参考链接

- [SCC RBAC TSG](https://eng.ms/docs/microsoft-security/microsoft-threat-protection-mtp/microsoft-defender-for-office-mdo/mdo-pre-breach/infrastructure-engineering/quarantine/investigate-rbac-issues)
- [Geneva Portal (Jarvis)](https://portal.microsoftgeneva.com)
