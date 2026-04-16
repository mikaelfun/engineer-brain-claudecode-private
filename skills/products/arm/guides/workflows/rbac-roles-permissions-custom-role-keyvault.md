# ARM RBAC 角色与权限管理 (Custom Role / KeyVault) — 排查工作流

**来源草稿**: ado-wiki-rbac-evaluation-on-arm.md, ado-wiki-a-get-rbac-iam-control-details.md
**Kusto 查询**: activity-log.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: 自定义角色与权限排查
> 来源: ado-wiki-rbac-evaluation-on-arm.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **确认操作所需权限**:
   - ARM 根据 REST API method + URL 确定操作
   - RP 可能有 authorizationActionMappings 自定义映射
   - 查看 Kusto HttpIncomingRequests 的 authorizationAction 列
2. **检查 Linked Access Checks**:
   - 某些操作需要关联资源的权限（如 attach NIC 需要 networkInterfaces/join/action）
   - RP manifest 中的 linkedAccessChecks 定义
3. **Custom Role 排查**:
   - 确认 AssignableScopes 包含目标 scope
   - 确认 Actions/NotActions 包含所需操作
   - 注意 Role Assignment 4000 条限制

### KQL: 查询 RBAC 相关操作 (Mooncake)

```kql
cluster("armmcadx.chinaeast2.kusto.chinacloudapi.cn").database("armmc").EventServiceEntries
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where operationName contains "Microsoft.Authorization/roleAssignments"
| project PreciseTimeStamp, operationName, status, properties, claims
| sort by PreciseTimeStamp desc
```

---

## Scenario 2: 获取用户 RBAC 详情
> 来源: ado-wiki-a-get-rbac-iam-control-details.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **获取 Object ID**: Azure Support Center → Tenant Explorer → User search
2. **获取 Role Assignment**: ASC → Resource Explorer → Subscription → Access Control
3. **获取 Role Definition**: 使用 Role Definition ID 在 Portal 查询

---

## Scenario 3: 403 AuthorizationFailed 排查
> 来源: ado-wiki-rbac-evaluation-on-arm.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **确认用户身份**: 检查 token 中的 oid/upn
2. **检查 Role Assignments**: 是否在正确 scope 有所需角色
3. **检查 Deny Assignments**: 是否有 deny 覆盖
4. **检查权限缓存**: 新分配可能需要 30 分钟生效
5. **查看活动日志确认失败详情**

### KQL: 查询失败的授权操作 (Mooncake)

```kql
cluster("armmcadx.chinaeast2.kusto.chinacloudapi.cn").database("armmc").HttpIncomingRequests
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode == 403
| project TIMESTAMP, httpMethod, targetUri, errorCode, errorMessage, correlationId
| order by TIMESTAMP desc
```
