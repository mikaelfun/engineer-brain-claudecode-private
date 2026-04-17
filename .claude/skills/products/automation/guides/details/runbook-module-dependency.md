# Automation Runbook 模块依赖 — 已知问题详情

**条目数**: 7 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**来源草稿**: 无
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 已知问题详情

### 1. 计划任务无法加载新导入的 PS 模块

**ID**: automation-001
**分数**: 🟢 9/10 — 来源质量(3) + 时效性(2) + 验证强度(2) + 21V(2)

**症状**：Azure Automation 计划任务（Scheduled Job）无法加载 PS 模块中的 Cmdlet。Cmdlet 显示 "not recognized"。但手动触发的 Job 正常执行。

**根因**：Scheduled Job 使用的模块依赖关系取决于 **Schedule 创建时间**，而非 Job 实际运行时间。新导入的模块不会被已有的 Schedule 自动识别。

**方案**：
1. 上传新 PS 模块后，**创建新的 Schedule**
2. 将新 Schedule 链接到现有 Runbook
3. 删除旧 Schedule

**来源**: [MCVKB/16.1](../../../data/onenote/MCVKB/VM+SCIM/======16.%20Automation======/16.1%20Azure%20Automation%20scheduled%20job%20cannot%20load%20ce.md) | **21V**: ✅

---

### 2. Script Block 中无法找到 Automation Account 模块

**ID**: automation-005
**分数**: 🟢 8.5/10 — 来源质量(3) + 时效性(2) + 验证强度(2) + 21V(1.5)

**症状**：PowerShell Runbook 在 Azure Sandbox 上运行时，通过 `Start-Job` 的 `-ScriptBlock` 调用的模块报 "not recognized"。模块在 Automation Account 层面已正确导入。

**根因**：Azure Sandbox 上的 PowerShell Runbook **仅支持串行执行**。`Start-Job` 的 ScriptBlock 在独立进程中运行，该进程无法访问 Automation Account 的模块路径。

**方案**：
- 使用 **Hybrid Runbook Worker** 执行需要并行处理的 Runbook
- 在 Hybrid Worker 上**本地安装** PS 模块（ScriptBlock 可访问本地模块）
- 通过 `-ArgumentList` 传递参数到 ScriptBlock

**来源**: [MCVKB/16.4](../../../data/onenote/MCVKB/VM+SCIM/======16.%20Automation======/16.4%20%5BAutomation%5D%20Some%20key%20learnings%20on%20Automation.md) | **21V**: ✅

---

### 3. Az 模块批量更新脚本超时

**ID**: automation-008
**分数**: 🟢 9/10 — 来源质量(3) + 时效性(2) + 验证强度(2) + 21V(2)

**症状**：使用 `Update-AutomationAzureModulesForAccount.ps1` 更新 Az 模块的 Runbook，运行 3 小时后超时，Job Stream 无错误信息。

**根因**：两个问题叠加：
1. 脚本在依赖的 Az 子模块不存在时（如旧版本无 `Az.MySql`）发生**死锁**
2. `Set-AzAutomationModule` Cmdlet 存在已知问题（GitHub #16399），无法上传 PS 7.1 模块

**方案**：
使用 **REST API** 复制 Portal "Update Az Modules" 操作：
1. 在 Portal 中按 F12 打开开发者工具，执行一次更新操作
2. 从 Network 面板捕获 API 调用（PATCH 方法 + RuntimeConfiguration Payload）
3. 用脚本复制该 API 调用
4. 使用 Automation Account 的 **MSI** 进行认证

```powershell
# 示例：使用 REST API 更新模块
$token = (Get-AzAccessToken -ResourceUrl "https://management.chinacloudapi.cn").Token
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
# PATCH {管理端点}/automationAccounts/{accountName}?api-version=...
# Body: RuntimeConfiguration payload (从 F12 捕获)
```

**来源**: [MCVKB/16.7] | **21V**: ✅

---

### 4. ExchangeOnlineManagement v3.0.0+ 模块报错

**ID**: automation-062
**分数**: 🔵 6/10 — 来源质量(1.5) + 时效性(2) + 验证强度(1) + 21V(1.5)

**症状**：ExchangeOnlineManagement v3.0.0 及更高版本在 Azure Automation Runbook 中导致错误。

**根因**：ExchangeOnlineManagement v3+ 依赖 `PowerShellGet` 和 `PackageManagement` 模块，而这两个模块在 Automation Account 中默认不存在。

**方案**：
在使用 ExchangeOnlineManagement v3.0.0+ 之前，先将 `PowerShellGet` 和 `PackageManagement` 模块**显式上传**到 Automation Account。

> ⚠️ **21V 注意**: ExchangeOnlineManagement 在 Mooncake 中功能受限，需确认客户场景是否适用

**来源**: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/powershell-job-script-cmdlets-not-working) | **21V**: ❌（涉及不支持功能）

---

### 5. 模块更新后 "Command not found" 或参数绑定失败

**ID**: automation-067
**分数**: 🔵 6.5/10 — 来源质量(1.5) + 时效性(2) + 验证强度(1) + 21V(2)

**症状**：Runbook 在模块更新后 Suspended，报 "Command not found" 或 "Cannot bind parameter" 错误。

**根因**：模块更新后依赖关系不正确或版本不兼容。

**方案**：
- 将 Automation Account 中的 Azure PowerShell 模块更新到最新兼容版本
- 使用 `Update-AutomationAzureModulesForAccount` Runbook 执行批量更新
- ⚠️ 如果该 Runbook 本身超时，参见 automation-008 的 REST API 替代方案

**来源**: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-job-suspended) | **21V**: ✅

---

### 6. PowerShell 7 运行时 Logging Preference 不生效

**ID**: automation-071
**分数**: 🔵 6/10 — 来源质量(1.5) + 时效性(2) + 验证强度(1) + 21V(1.5)

**症状**：PowerShell 7 Runtime 的 Runbook 中，通过 Runbook Properties 设置的 `$VerbosePreference`、`$ProgressPreference` 等日志首选项不生效。

**根因**：Runbook Properties 中的 Logging Preference 设置在 **PowerShell 7 Runtime 中不受支持**——这是已知限制。

**方案**：
在 Runbook 脚本开头**显式设置**这些变量：

```powershell
# 在 Runbook 脚本开头添加
$VerbosePreference = "Continue"
$ProgressPreference = "SilentlyContinue"
# ... 其他需要的 Preference 变量
```

**来源**: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/powershell-job-script-cmdlets-not-working) | **21V**: ✅

---

### 7. Find-AzureRmResource Cmdlet 在模块更新后不可用

**ID**: automation-083
**分数**: 🔵 6/10 — 来源质量(2) + 时效性(0.5) + 验证强度(1) + 21V(2)

**症状**：更新 Azure 模块后，使用 `Find-AzureRmResource` Cmdlet 的 Runbook 报异常或 "Cannot find the Find-AzureRmResource command" 错误。

**根因**：自 **AzureRM 6.0.0** 起，`Find-AzureRmResource` 的功能已合并到 `Get-AzureRmResource`，原 Cmdlet 被移除。

**方案**：
将 Runbook 中的 `Find-AzureRmResource` 替换为 `Get-AzureRmResource`。参考 `Get-AzureRmResource` 文档了解参数差异。

> ⚠️ **注意**：此问题涉及 AzureRM 模块，已被 Az 模块取代。建议客户同时考虑**迁移到 Az 模块**。

**来源**: [KB4338620](https://support.microsoft.com/kb/4338620) — ContentIdea KB | **21V**: ✅
