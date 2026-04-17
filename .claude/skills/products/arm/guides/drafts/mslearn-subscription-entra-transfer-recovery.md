# Azure 订阅跨 Entra 目录转移完整恢复指南

> Source: https://learn.microsoft.com/azure/role-based-access-control/transfer-subscription

## 概述

将 Azure 订阅转移到不同的 Microsoft Entra 目录是一个复杂的过程。所有 RBAC 角色分配和自定义角色会被**永久删除**且不可恢复。多种 Azure 服务依赖安全主体（identities），需要在转移后重建。

## 影响评估

| 资源类型 | 影响 | 可恢复 | 注意事项 |
|----------|------|--------|---------|
| Role Assignments | 永久删除 | 是（需手动重建） | 必须转移前导出 |
| Custom Roles | 永久删除 | 是（需手动重建） | 导出 JSON 备份 |
| System-assigned MI | 失效 | 是 | 需 disable+re-enable |
| User-assigned MI | 失效 | 是 | 需 delete+recreate+attach |
| Key Vault | tenant ID 不匹配 | 是 | **CMK 加密场景可能不可恢复** |
| Azure SQL + Entra Auth | 无法转移 | 否 | **Hard blocker** |
| AKS | 无法转移 | 否 | **Hard blocker** |
| Azure Policy | 丢失 | 否 | 需 export/import/reassign |
| Storage/ADLS ACLs | 失效 | 是 | 需重建 ACL |
| Entra Domain Services | 无法转移 | 否 | **Hard blocker** |

## 转移前准备

1. **导出所有角色分配**
   ```bash
   az role assignment list --all --include-inherited --output json > roleassignments.json
   ```

2. **导出自定义角色定义**
   ```bash
   az role definition list --custom-role-only true --output json > customroles.json
   ```

3. **记录 Managed Identities**
   ```bash
   az ad sp list --all --filter "servicePrincipalType eq 'ManagedIdentity'" --output json > managed-identities.json
   ```

4. **检查 Key Vault**
   ```bash
   az keyvault list --output table
   # 对每个 Key Vault 检查是否有 CMK 依赖
   az keyvault show --name MyKeyVault
   ```

5. **检查 Hard Blockers**
   - Azure SQL with Entra auth: `az sql server ad-admin list`
   - AKS clusters: cannot transfer
   - Entra Domain Services: cannot transfer

## 转移后恢复步骤

1. **重建自定义角色** → `az role definition create --role-definition <file>`
2. **重建角色分配** → `az role assignment create --role <role> --assignee <principal> --scope <scope>`
3. **恢复 System-assigned MI** → 对每个资源 disable 再 enable MI
4. **恢复 User-assigned MI** → delete + recreate + attach
5. **更新 Key Vault** → 更新 tenant ID + 重配 access policies
6. **恢复 ACLs** → ADLS Gen2 / Azure Files
7. **轮换 access keys** → Storage, certificates, Remote Access credentials

## 关键警告

- Key Vault + CMK 场景：如果 Storage/SQL 使用 Key Vault CMK 加密，转移前必须先切换到其他 Key Vault 或禁用 CMK，否则可能导致**不可恢复的数据丢失**
- 转移操作不可逆
- 可能需要停机时间
