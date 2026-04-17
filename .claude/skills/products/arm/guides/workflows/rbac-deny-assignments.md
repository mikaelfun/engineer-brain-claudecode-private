# ARM RBAC 拒绝分配 — 排查工作流

**来源草稿**: ado-wiki-rbac-evaluation-on-arm.md, ado-wiki-a-get-rbac-iam-control-details.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Deny Assignment 导致操作失败
> 来源: ado-wiki-rbac-evaluation-on-arm.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **理解 RBAC 评估流程**:
   - 用户获取 AAD token (包含 group memberships)
   - ARM 获取资源上所有 role assignments 和 deny assignments
   - ARM 检查用户是否有操作所需的 role → 无 → 403
   - ARM 检查 deny assignment 是否适用 → 适用 → Access denied
2. **Deny Assignment 来源**:
   - Azure Blueprints
   - Managed Applications (first-party RP)
   - Azure Stack 等锁定资源
3. **查询 Deny Assignments**:
   - REST API: GET /subscriptions/{id}/providers/Microsoft.Authorization/denyAssignments
   - Portal: Subscription → Access control (IAM) → Deny assignments tab
4. **Deny Assignment 不可直接删除** — 需从来源服务移除

---

## Scenario 2: RBAC 权限缓存延迟
> 来源: ado-wiki-rbac-evaluation-on-arm.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **权限缓存机制**:
   - ARM 实例级缓存，30 分钟刷新
   - 或 token 续期时刷新
2. **新分配权限不立即生效**:
   - 等待最多 30 分钟
   - 或登出/登入刷新 token
3. **不同 ARM 实例可能有不同缓存状态** — 重试可能命中不同实例
