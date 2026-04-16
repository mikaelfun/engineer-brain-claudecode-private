# EOP MDO 门户权限与 UI 问题 — 排查工作流

**来源草稿**: ado-wiki-a-mdo-permissions-tsg.md, ado-wiki-a-how-to-check-user-permissions.md, ado-wiki-a-securitypermissionschecker-tool.md, ado-wiki-a-permissions-mapping.md, ado-wiki-a-get-rolesfromhar-script.md, ado-wiki-a-mdo-advanced-hunting.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: MDO 门户权限排查
> 来源: ado-wiki-a-mdo-permissions-tsg.md | 适用: Mooncake ✅ (部分)

### 排查步骤
1. **确定权限类型**:
   - **Legacy RBAC**: Email and Collaboration tab 可见 → 使用 EXO PowerShell 检查
   - **URBAC (Defender XDR)**: Email and Collaboration tab 消失 → 使用 HAR logs
2. Legacy RBAC 检查:
   ```powershell
   Get-ManagementRole
   Get-RoleGroup
   Get-RoleGroupMember
   ```
3. URBAC 检查 (HAR logs):
   - 搜索 `TenantContext?realTime` → Auth Info > Mtp Permissions > Oatp Permissions
   - 或使用 Console: `await $host.auth.isInRoles(["urbacStatus:mdo","urbacStatus:exo"])`
4. Entra Roles (DirRoles) 常见 GUID:
   - Global Administrator: 62e90394-69f5-4237-9190-012177145e10
   - Security Administrator: 194ae4cb-b126-40b2-bd5b-6091b380977d
   - Security Reader: 5d6b6bb7-de71-4623-b4af-96380a352509
5. HAR 分析工具:
   - [Microsoft HAR Analyzer](https://hartool.azurewebsites.net)
   - Fiddler: 打开 HAR > 搜索 TenantContext > JSON Response

---

## Scenario 2: 权限问题升级
> 来源: ado-wiki-a-mdo-permissions-tsg.md | 适用: Mooncake ✅

### 升级清单
1. 确定权限类型 (Legacy/URBAC/Entra/PIM/B2B/GDAP)
2. 收集 DirRoles Assigned (从 HAR logs)
3. 收集 SecurityPermissions Checker HTML 报告
4. 检查:
   - 新 URBAC role 是否已 **activate**
   - PIM assignments 是否已验证
   - B2B/GDAP 委托状态
