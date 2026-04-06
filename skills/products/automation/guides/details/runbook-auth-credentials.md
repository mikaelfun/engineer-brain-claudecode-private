# Automation Runbook 认证与凭据 — 综合排查指南

**条目数**: 9 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-runas-account-tsg.md](../drafts/onenote-runas-account-tsg.md), [onenote-mooncake-runbook-auth.md](../drafts/onenote-mooncake-runbook-auth.md)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 确定认证方式与错误类型
> 来源: [MCVKB/OneNote](../drafts/onenote-runas-account-tsg.md) + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-powershell-runbook)

1. **确认 Runbook 使用的认证方式**
   - RunAs Account (Service Principal + Certificate) — 已弃用
   - Managed Identity（推荐）
   - OrgId Credential (用户名/密码) — 不推荐
   - 交互式登录 — 不支持

2. **收集关键信息**（CTRL+ALT+A 快捷键可在 Portal 获取诊断窗口）
   - 登录账户
   - 当前 Active Directory
   - 订阅 ID
   - 用户角色：订阅角色 + AD 用户类型（Member/Guest）+ AD 角色

**判断逻辑**：
| 错误信息 | 含义 | 后续动作 |
|---------|------|---------|
| `insufficient privileges` (Add 界面直接阻止) | Guest 用户无法创建 SP | → Phase 2a |
| `Authorization_RequestDenied` (部署后 RunAs 失败) | App Registration 被禁用 | → Phase 2b |
| `Error validating credentials. Password is expired` / `401 Unauthorized` | OrgId 密码过期 | → Phase 2c |
| `The subscription named <name> cannot be found` | 未使用 Managed Identity 或 RunAs 过期 | → Phase 2d |
| `Strong authentication enrollment is required` | MFA 阻止非交互认证 | → Phase 2d |
| `Unable to find entry point GetPerAdapterInfo in DLL iphlpapi.dll` | 交互式认证在 Sandbox 中不支持 | → Phase 2e |
| Runbook 突然停止工作（之前正常） | RunAs 证书过期或 Webhook 过期 | → Phase 2d |

`[结论: 🟢 9/10 — OneNote 一线经验 + MS Learn 官方文档交叉验证，覆盖 Mooncake 场景]`

### Phase 2a: Guest 用户权限问题
> 来源: [MCVKB/OneNote — RunAs Account TSG](../drafts/onenote-runas-account-tsg.md)

**症状**：Add Automation Account 时，界面立刻弹出 "insufficient privileges" 警告，Create 按钮灰色不可点击。

**根因**：用户是订阅所在 Azure AD 中的 Guest（访客），Guest 没有创建 Service Principal 所需的最小权限。

**修复**：Global Admin 通过 PowerShell 将用户从 Guest 转为 Member：
```powershell
Connect-MsolService
# 检查当前类型
(Get-MsolUser -SearchString "<username>").UserType
# 转换为 Member
(Get-MsolUser -SearchString "<username>") | Set-MsolUser -UserType "Member"
```
转换后重试创建 Automation Account。

`[结论: 🟢 9/10 — OneNote 一线实证，Mooncake 验证]`

### Phase 2b: App Registration 被禁用
> 来源: [MCVKB/OneNote — RunAs Account TSG](../drafts/onenote-runas-account-tsg.md)

**症状**：Automation Account 部署成功，但 RunAs Account 创建失败，报错 `Authorization_RequestDenied: Insufficient privileges to complete the operation`。

**根因**：Azure AD > User Settings 中 "App registrations" 被 Global Admin 设置为 "No"，普通用户无法注册应用/Service Principal。

**修复**：
- Global Admin 到 Azure AD > User Settings 重新启用 "App Registration"
- 或者为用户分配具有应用注册权限的 AD 角色

`[结论: 🟢 9/10 — OneNote 一线实证，Mooncake 验证]`

### Phase 2c: OrgId 凭据过期
> 来源: [MCVKB/OneNote](../drafts/onenote-runas-account-tsg.md)

**症状**：Runbook 运行数月后突然报错 `Error validating credentials. Password is expired` 或 `401 Unauthorized`。

**根因**：OrgId 凭据（Azure AD 用户名/密码）默认 90 天过期。存储在 Automation Credential Asset 中的密码已过时。

**修复**：
1. 在 Azure Portal 重置用户密码
2. 使用该账户登录完成密码更新
3. 到 Automation Account > Credentials 资产更新密码

> ⚠️ **建议迁移到 Managed Identity**：OrgId 方式有持续的密码过期风险，推荐使用 Managed Identity 消除此问题。

`[结论: 🟢 8.5/10 — OneNote 实证]`

### Phase 2d: 迁移到 Managed Identity
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-powershell-runbook) + [MCVKB/OneNote](../drafts/onenote-mooncake-runbook-auth.md)

以下错误都指向同一根因——需要迁移到 Managed Identity：
- `The subscription named <name> cannot be found` — RunAs 账户可能已过期
- `Strong authentication enrollment is required` — MFA 阻止了用户凭据认证
- Runbook 突然停止工作 — RunAs 证书/Webhook 过期

**Mooncake Managed Identity 认证代码**：
```powershell
# System-assigned Managed Identity
Connect-AzAccount -Identity -Environment AzureChinaCloud

# 如需指定特定订阅
Set-AzContext -SubscriptionId "<subscriptionId>"
```

**迁移步骤**：
1. 在 Automation Account 中启用 System-assigned Managed Identity
2. 为 Managed Identity 分配目标订阅/资源的 RBAC 权限
3. 更新 Runbook 代码使用 `Connect-AzAccount -Identity -Environment AzureChinaCloud`
4. 测试验证后移除旧的 RunAs Account

> ⚠️ **Mooncake 关键点**：`-Environment AzureChinaCloud` 参数**必须指定**，否则默认连接 Global Azure。

`[结论: 🟢 8/10 — MS Learn 官方文档 + OneNote Mooncake 代码样例交叉验证]`

### Phase 2e: 交互式认证错误
> 来源: [KB4466494](https://support.microsoft.com/kb/4466494)

**症状**：执行 `Connect-AzureRmAccount` 时报错 `Unable to find an entry point named GetPerAdapterInfo in DLL iphlpapi.dll`。

**根因**：`Connect-AzureRmAccount` 命令缺少必要参数，触发了交互式认证。Azure Automation Sandbox 是非交互式环境，无法完成交互式认证。

**修复**：确保 Runbook 代码包含所有非交互式认证所需参数。

**方式 1 — Credential 方式**：
```powershell
$Cred = Get-AutomationPSCredential -Name "MyCredential"
Connect-AzureRmAccount -Credential $Cred -Environment AzureChinaCloud
```

**方式 2 — RunAs Account (Service Principal) 方式**：
```powershell
$conn = Get-AutomationConnection -Name "AzureRunAsConnection"
Connect-AzureRmAccount `
    -ServicePrincipal `
    -TenantId $conn.TenantId `
    -ApplicationId $conn.ApplicationId `
    -CertificateThumbprint $conn.CertificateThumbprint `
    -EnvironmentName AzureChinaCloud
```

`[结论: 🔵 7/10 — ContentIdea KB 单源，但修复方案明确]`

---

## 附录：Mooncake RunAs Account 认证代码模板
> 来源: [MCVKB/OneNote](../drafts/onenote-mooncake-runbook-auth.md)

### AzureRM 模块版本
```powershell
$connectionName = "AzureRunAsConnection"
try {
    $servicePrincipalConnection = Get-AutomationConnection -Name $connectionName
    "Logging in to Azure..."
    Add-AzureRmAccount `
        -ServicePrincipal `
        -TenantId $servicePrincipalConnection.TenantId `
        -ApplicationId $servicePrincipalConnection.ApplicationId `
        -CertificateThumbprint $servicePrincipalConnection.CertificateThumbprint `
        -EnvironmentName AzureChinaCloud
} catch {
    if (!$servicePrincipalConnection) {
        throw "Connection $connectionName not found."
    } else {
        Write-Error -Message $_.Exception
        throw $_.Exception
    }
}
```

### Az 模块版本（推荐）
```powershell
$connectionName = "AzureRunAsConnection"
try {
    $servicePrincipalConnection = Get-AutomationConnection -Name $connectionName
    "Logging in to Azure..."
    Add-AzAccount `
        -ServicePrincipal `
        -TenantId $servicePrincipalConnection.TenantId `
        -ApplicationId $servicePrincipalConnection.ApplicationId `
        -CertificateThumbprint $servicePrincipalConnection.CertificateThumbprint `
        -EnvironmentName AzureChinaCloud
} catch {
    if (!$servicePrincipalConnection) {
        throw "Connection $connectionName not found."
    } else {
        Write-Error -Message $_.Exception
        throw $_.Exception
    }
}
```

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Add Automation Account 界面直接 insufficient privileges 阻止 | Guest 用户无权创建 SP | Global Admin 转 Member: `Set-MsolUser -UserType "Member"` | 🟢 9 — OneNote 实证 | [MCVKB/OneNote](../drafts/onenote-runas-account-tsg.md) |
| 2 | RunAs SP 创建失败 Authorization_RequestDenied | App Registration 被禁用 | Global Admin 启用 App Registration | 🟢 9 — OneNote 实证 | [MCVKB/OneNote](../drafts/onenote-runas-account-tsg.md) |
| 3 | Password is expired / 401 Unauthorized | OrgId 凭据 90 天过期 | 重置密码 + 更新 Credential Asset | 🟢 8.5 — OneNote 实证 | [MCVKB/OneNote](../drafts/onenote-runas-account-tsg.md) |
| 4 📋 | Mooncake Runbook 认证代码模板 | — | RunAs + Managed Identity 代码样例 | 🟢 8.5 — OneNote 指南 | [MCVKB/OneNote](../drafts/onenote-mooncake-runbook-auth.md) |
| 5 📋 | RunAs Account 综合 TSG | — | 权限阻止 + SP 创建错误全流程 | 🟢 9 — OneNote 指南 | [MCVKB/OneNote](../drafts/onenote-runas-account-tsg.md) |
| 6 | Subscription named \<name\> cannot be found | 未用 Managed Identity / RunAs 过期 | 配置 Managed Identity + RBAC | 🔵 7 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-powershell-runbook) |
| 7 | Strong authentication enrollment is required | MFA 阻止用户凭据认证 | 改用 Managed Identity | 🔵 7 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-powershell-runbook) |
| 8 | Runbook 突然停止工作 | RunAs 证书/Webhook 过期 | 迁移 Managed Identity + 续期 Webhook | 🟢 8 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-fails-on-hybrid-worker) |
| 9 | GetPerAdapterInfo in DLL iphlpapi.dll 报错 | 交互式认证在 Sandbox 不支持 | 使用 Credential 或 SP 非交互式参数 | 🔵 6.5 — KB 单源 | [KB4466494](https://support.microsoft.com/kb/4466494) |
