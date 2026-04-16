# Purview 权限与 RBAC — 排查工作流

**来源草稿**: `ado-wiki-local-test-role-permission-issue.md`, `ado-wiki-purview-roles-permissions.md`, `ado-wiki-roles-update-request-permission-issue.md`
**Kusto 引用**: `scc-rbac-logs.md`
**场景数**: 17
**生成日期**: 2026-04-07

---

## Scenario 1: Steps
> 来源: ado-wiki-local-test-role-permission-issue.md | 适用: 未标注

### 排查步骤
1. Find **Microsoft Entra ID** in Azure Portal
2. Create a new user in this tenant:
   - **Option 1**: Create a new user directly, then login by this account for test
   - **Option 2**: Invite external user (e.g. your @microsoft.com account). Login via your Microsoft account to continue the test.

`[来源: ado-wiki-local-test-role-permission-issue.md]`

---

## Scenario 2: Data Plane RBAC Roles
> 来源: ado-wiki-purview-roles-permissions.md | 适用: 未标注

### 排查步骤
- **Account Creator**: Automatically gets all data plane permissions regardless of assigned roles
- **Purview Data Reader**: Portal access, read all content except scan bindings
- **Purview Data Curator**: Portal access, read all, edit asset info, classifications, glossary terms
- **Purview Data Source Administrator**: No direct portal access (needs Data Reader/Curator too), manages scanning
- **Owner + Data Curator**: Can add External Sources + other Curator capabilities. Owner alone cannot see portal button
- **Owner + Data Curator + Data Source Admin**: Can create Data Sources + add External Sources + full capabilities

`[来源: ado-wiki-purview-roles-permissions.md]`

---

## Scenario 3: External Connections (ADF & Data Share)
> 来源: ado-wiki-purview-roles-permissions.md | 适用: 未标注

### 排查步骤
To **view** External Connections in Management Center: must be **Subscription Owner**

To **view** Data Factory connections, need one of:
- Contributor
- Owner
- Reader
- User Access Administrator

To **add/remove** Data Factory connections, need one of:
- Owner
- User Access Administrator

Additional requirement: ADF role of Owner or Contributor

Reference: [Catalog Permissions](https://docs.microsoft.com/en-us/azure/purview/catalog-permissions)

`[来源: ado-wiki-purview-roles-permissions.md]`

---

## Scenario 4: Issue
> 来源: ado-wiki-roles-update-request-permission-issue.md | 适用: 未标注

### 排查步骤
- Incident ticket logged by customer: "401 Error from policystore API in collection/role permissions"
- Incident ticket logged by monitor: "TIP test PolicyStoreTest in <REGION> is failing for multiple times"
- A new request arises for creating/updating Metadata roles / Data roles in the global DB across different regions.
- An IcM ticket should be created to track these requests within the team.

`[来源: ado-wiki-roles-update-request-permission-issue.md]`

---

## Scenario 5: Triaging steps / Root cause
> 来源: ado-wiki-roles-update-request-permission-issue.md | 适用: 未标注

### 排查步骤
1. Click on "DGrep: Tip results" to see logs in Jarvis portal.
2. Get the correlation ID or account ID from the logs.
3. Use the Correlation ID and search:
   ```kql
   ProjectBabylonLogEvent
   | where CorrelationId == "<correlation id>"
   ```
4. Search across namespaces: BabylonProd, GatewayProd, PolicyStoreProd
5. Observe logs like:
   - `Account|Scope policy-tips-ae Requested:[Microsoft.Purview/accounts/policy/write] Missing:[Microsoft.Purview/accounts/policy/write]`
   - `Account|Caller <ObjectId> not authorized`
   - Response: `{"error":{"code":"Unauthorized","message":"Not authorized to access account"}}`

`[来源: ado-wiki-roles-update-request-permission-issue.md]`

---

## Scenario 6: Resolution
> 来源: ado-wiki-roles-update-request-permission-issue.md | 适用: 未标注

### 排查步骤
1. There are two types of roles in Purview: **Metadata Roles** and **Data Roles**.
   - Whenever a request arises, a PR must be created with the required changes in the Policy Store repo.
2. Roles update is required across 4 environments: Dev, DF, Canary, Prod.
3. Visit **Geneva Actions** → Project Babylon → Babylon Generic Json Resource Operations → **Create or Update Generic JSON Resource**
   - Environment: **Test** for Dev/DF; **Public** for Canary/Prod
4. Fill all fields based on the requirement and click Run.
5. To check actual structure of roles in global DB, use **Get Generic JSON Resource** action specifying the resource name (e.g., collection-administrator, data-curator in PurviewMetadataRole; read, write in PurviewDataRole).

`[来源: ado-wiki-roles-update-request-permission-issue.md]`

---

## Scenario 7: Notes
> 来源: ado-wiki-roles-update-request-permission-issue.md | 适用: 未标注

### 排查步骤
- New roles are typically added behind feature flags. Update the `$exposure-control` role entity first (stores mapping of roles and feature flags), then create the actual role.
- Update order: Dev/DF → Canary → Prod. Validate no issues in DF/Canary before updating Prod.
- If in doubt, assign IcM to @pragarwal or @desinghal for resolution.

`[来源: ado-wiki-roles-update-request-permission-issue.md]`

---

## Scenario 8: 说明
> 来源: scc-rbac-logs.md | 适用: 未标注

### 排查步骤
Security & Compliance Center (SCC) RBAC 日志需要通过 Geneva Portal (Jarvis) 查询，用于排查 Purview 合规门户的权限、角色分配和访问控制问题。

> 🟠 **Geneva 浏览器打开** - 构建 Jarvis URL 后使用 `Start-Process "{url}"` 在浏览器中打开，用户需使用 CME 账号登录查看结果。

---

`[来源: scc-rbac-logs.md]`

---

## Scenario 9: 事件信息
> 来源: scc-rbac-logs.md | 适用: Mooncake ✅

### 排查步骤
| 属性 | 值 |
|------|-----|
| 事件名 | ServerEventLog, TraceEventLog |
| 命名空间 | ProtectionCenterPROD |
| 环境 | CA Mooncake |

`[来源: scc-rbac-logs.md]`

---

## Scenario 10: Jarvis URL 模板
> 来源: scc-rbac-logs.md | 适用: Mooncake ✅

### 排查步骤
```
https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time={starttime}&offset={minutes}&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=ProtectionCenterPROD&en=ServerEventLog,TraceEventLog&conditions=[["TenantId","%3D%3D","{tenantId}"],["SessionId","contains","{sessionId}"]]&aggregates=["Count%20by%20domainStatus","Count%20by%20domainName","Count%20by%20resultType"]
```

`[来源: scc-rbac-logs.md]`

---

## Scenario 11: 构建 URL 的 KQL 模板
> 来源: scc-rbac-logs.md | 适用: Mooncake ✅

### 排查步骤
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

`[来源: scc-rbac-logs.md]`

---

## Scenario 12: 参数说明
> 来源: scc-rbac-logs.md | 适用: 未标注

### 排查步骤
| 参数 | 说明 | 示例 |
|------|------|------|
| {starttime} | 查询起始时间 | 2024-01-15T10:00:00Z |
| {minutes} | 向后查询的分钟数 | 60 |
| {tenantId} | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {sessionId} | 会话 ID (可选) | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

`[来源: scc-rbac-logs.md]`

---

## Scenario 13: 执行命令
> 来源: scc-rbac-logs.md | 适用: Mooncake ✅

### 排查步骤
```powershell
$starttime = "{starttime}"
$minutes = {minutes}
$tenantId = "{tenantId}"
$sessionId = "{sessionId}"
$url = "https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=$starttime&offset=$minutes&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=ProtectionCenterPROD&en=ServerEventLog,TraceEventLog&conditions=[[`"TenantId`",`"%3D%3D`",`"$tenantId`"],[`"SessionId`",`"contains`",`"$sessionId`"]]&aggregates=[`"Count%20by%20domainStatus`",`"Count%20by%20domainName`",`"Count%20by%20resultType`"]"
Start-Process $url
```

`[来源: scc-rbac-logs.md]`

---

## Scenario 14: 聚合维度
> 来源: scc-rbac-logs.md | 适用: 未标注

### 排查步骤
Jarvis 查询默认包含以下聚合统计:

| 聚合 | 说明 |
|------|------|
| Count by domainStatus | 按域状态统计 |
| Count by domainName | 按域名统计 |
| Count by resultType | 按结果类型统计 |

---

`[来源: scc-rbac-logs.md]`

---

## Scenario 15: 场景: 用户无法访问 Purview 合规门户
> 来源: scc-rbac-logs.md | 适用: 未标注

### 排查步骤
1. **获取必要参数**:
   - TenantId (必须)
   - SessionId (可选，如有)
2. **构建 Jarvis URL** - 使用上述模板
3. **分析结果**:
   - 检查 `resultType` 确认请求是否成功
   - 检查 `domainStatus` 了解域验证状态
   - 检查 TraceEventLog 获取详细错误信息
   - 如需查看完整会话日志，可在 Geneva 条件中移除 TenantId 筛选，仅保留 SessionId

`[来源: scc-rbac-logs.md]`

---

## Scenario 16: 场景: RBAC 角色分配问题
> 来源: scc-rbac-logs.md | 适用: 未标注

### 排查步骤
1. 确认用户在 SCC 中的角色分配
2. 使用 TenantId 查询 ServerEventLog
3. 检查 RBAC 相关事件确认权限检查结果
4. 分析 TraceEventLog 中的详细权限评估信息

`[来源: scc-rbac-logs.md]`

---

## Scenario 17: 场景: SCC 操作失败
> 来源: scc-rbac-logs.md | 适用: 未标注

### 排查步骤
1. 获取操作时间和 TenantId
2. 查询 ServerEventLog 获取操作事件
3. 按 resultType 筛选失败事件
4. 检查 TraceEventLog 获取详细错误堆栈

---

`[来源: scc-rbac-logs.md]`

---

# Kusto 查询参考

## 来源: `scc-rbac-logs.md`

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

---

