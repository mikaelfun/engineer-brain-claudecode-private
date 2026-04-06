# Automation Runbook 认证与凭据管理 — 排查速查

**来源数**: 9 | **21V**: 全部适用（OneNote 条目明确 Mooncake）
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 创建 Automation Account 时 Add blade 立即显示 'insufficient privileges'，Create 按钮不可点 | 用户在订阅 home AAD 中是 Guest 而非 Member，Guest 无法创建 Service Principal | Global Admin 将用户从 Guest 转为 Member：`Set-MsolUser -UserType 'Member'`，然后重试创建 | 🟢 9 — OneNote 实证 | [MCVKB/RunAs Account issue](drafts/onenote-runas-account-tsg.md) |
| 2 | RunAs account (SP) 创建失败：'Authorization_RequestDenied: Insufficient privileges' | AAD User Settings 中 App Registration 设为 'No'，非管理员无法注册应用 | Global Admin 在 AAD > User Settings 中重新启用 App Registration，或为用户分配合适的 AD 角色 | 🟢 9 — OneNote 实证 | [MCVKB/RunAs Account issue](drafts/onenote-runas-account-tsg.md) |
| 3 | Runbook 失败：'Error validating credentials. Password is expired' 或 '401 Unauthorized' | OrgId 凭据默认 90 天过期，Automation Credential asset 中存储的密码已过时 | 1) 在 Portal 重置用户密码 2) 用该账号登录完成密码更新 3) 更新 Automation > Credentials asset 中的密码 | 🟢 9 — OneNote 实证 | [MCVKB/Runbook troubleshooting](drafts/onenote-runas-account-tsg.md) |
| 4 📋 | 需要 Mooncake RunAs Account 认证连接 Azure 资源的示例代码 | — | 使用 `Get-AutomationConnection` + `Add-AzureRmAccount -ServicePrincipal -EnvironmentName AzureChinaCloud` | 🟢 8 — OneNote 指南草稿 | [MCVKB/Mooncake Auth](drafts/onenote-mooncake-runbook-auth.md) |
| 5 📋 | RunAs Account 综合排查（权限阻塞 + SP 创建错误汇总） | — | 完整排查流程见融合指南 | 🟢 8 — OneNote 指南草稿 | [MCVKB/RunAs Account TSG](drafts/onenote-runas-account-tsg.md) |
| 6 | Connect-AzureRmAccount 报错 'Unable to find entry point GetPerAdapterInfo in DLL iphlpapi.dll' | Runbook 中执行了需要交互输入的认证方式，Automation 是非交互环境无法完成 | 使用 `Get-AutomationPSCredential` 传 `-Credential`，或 `Get-AutomationConnection` 传 `-ServicePrincipal -Tenant -ApplicationID -CertificateThumbprint` | 🔵 7.5 — ContentIdea KB 实证 | [KB4466494](https://support.microsoft.com/kb/4466494) |
| 7 | Runbook 突然停止工作（之前一直正常） | RunAs Account 证书过期（未迁移到 Managed Identity）或 Webhook 过期 | 迁移到 Managed Identity；检查并续期过期的 Webhook | 🔵 6 — MS Learn 文档 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-fails-on-hybrid-worker) |
| 8 | Runbook 失败：'The subscription named \<name\> cannot be found' | Runbook 未使用 Managed Identity 访问 Azure 资源；RunAs Account 可能已过期 | 为 Automation Account 配置 Managed Identity 并授予目标订阅的 RBAC 权限 | 🔵 6 — MS Learn 文档 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-powershell-runbook) |
| 9 | Runbook 失败：'Strong authentication enrollment is required' | Azure 账号启用了 MFA，使用 Entra 用户凭据认证而非 Managed Identity | 使用 Managed Identity 替代用户凭据认证，不要在 Runbook 中使用交互式登录 | 🔵 6 — MS Learn 文档 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-powershell-runbook) |

## 快速排查路径
1. 确认认证方式 → RunAs Account 还是 Managed Identity？ `[来源: MS Learn]`
2. **RunAs Account 创建失败** → 检查用户在 AAD 中是否 Guest → Global Admin 转 Member `[来源: OneNote]`
3. **App Registration 被禁** → AAD > User Settings 启用 App Registration `[来源: OneNote]`
4. **凭据过期（90天）** → 重置密码 + 更新 Automation Credential asset `[来源: OneNote]`
5. **RunAs 证书过期** → 迁移到 Managed Identity `[来源: MS Learn]`
6. **MFA 冲突** → 改用 Managed Identity 或 Service Principal 认证 `[来源: MS Learn]`
7. **Connect-AzureRmAccount 报错** → 确保传入完整的非交互式认证参数 `[来源: ContentIdea KB]`
8. **Mooncake 专属** → 连接时指定 `-EnvironmentName AzureChinaCloud` `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/runbook-auth-credentials.md#排查流程)
