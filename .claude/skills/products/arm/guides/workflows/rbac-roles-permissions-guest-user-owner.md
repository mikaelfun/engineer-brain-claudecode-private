# ARM RBAC 角色与权限管理 (Guest User / Owner) — 排查工作流

**来源草稿**: ado-wiki-rbac-evaluation-on-arm.md, ado-wiki-a-azure-local-rbac.md, ado-wiki-a-rbac-tenant-vms-disconnected-azure-local.md
**Kusto 查询**: activity-log.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Guest User / External User 权限问题
> 来源: ado-wiki-rbac-evaluation-on-arm.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **确认 Guest User 身份**: B2B 邀请的外部用户
2. **检查 Role Assignments**: Guest user 在目标 scope 是否有正确角色
3. **权限缓存**: Guest user token 包含 home tenant 的 group memberships
4. **Owner 权限特殊情况**:
   - Last Owner 限制: 不允许删除最后一个 Owner role assignment
   - Azure 策略可能限制 Guest 用户成为 Owner

### KQL: 查询用户操作 (Mooncake)

```kql
cluster("armmcadx.chinaeast2.kusto.chinacloudapi.cn").database("armmc").EventServiceEntries
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| extend claimsJson = parse_json(claims)
| extend upn = tostring(claimsJson["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"])
| where upn contains "{guestEmail}"
| project PreciseTimeStamp, operationName, status, resourceUri
| sort by PreciseTimeStamp desc
```

---

## Scenario 2: Azure Local RBAC 角色管理
> 来源: ado-wiki-a-azure-local-rbac.md, ado-wiki-a-rbac-tenant-vms-disconnected-azure-local.md | 适用: Mooncake ⚠️ / Global ✅

### 排查步骤
1. **Azure Local 内置 RBAC 角色**:
   - **Azure Stack HCI Administrator**: 完全管理 VM 和所有 VM 资源
   - **Azure Stack HCI VM Contributor**: 管理 VM，但不能创建共享资源
   - **Azure Stack HCI VM Reader**: 只读
2. **前提条件**: 需要 Owner 或 User Access Administrator 权限
3. **分配角色**: Portal → Subscription → Access control (IAM) → Add role assignment
4. **Disconnected Operations 中的 RBAC**: 使用 Azure Arc 管理 tenant VM 的 RBAC
5. **最佳实践**:
   - 最小权限原则
   - 基于组的访问管理
   - 定期审计权限
