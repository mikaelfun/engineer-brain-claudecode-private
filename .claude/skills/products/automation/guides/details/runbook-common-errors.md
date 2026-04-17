# Automation Runbook 常见错误 — 综合排查指南

**条目数**: 13 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-runbook-tsg-methodology.md](../drafts/onenote-runbook-tsg-methodology.md), [onenote-generic-error-tsg.md](../drafts/onenote-generic-error-tsg.md)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 问题定界（Scoping）
> 来源: [MCVKB/OneNote — TSG Methodology](../drafts/onenote-runbook-tsg-methodology.md) + [MCVKB/OneNote — Generic Error](../drafts/onenote-generic-error-tsg.md)

1. **关键 Scoping 问题**：
   - Runbook 是开发中还是已在生产环境运行？
   - Runbook 的高层目标是什么？
   - 错误是一致的（同位置、同错误）还是间歇性的？
   - 最近有什么变化（模块、计划、代码）？

2. **错误定位**：
   - 具体错误信息是什么？
   - 多个错误时，每次只 scope 一个
   - 错误出现在哪里？
     - **Errors pane** = 致命错误（Job 失败）
     - **Output pane** = 非致命错误（Job 可能完成但有问题）

3. **数据收集**：
   - Job ID（失败的 + 成功的用于对比）
   - Output/Error 日志
   - Runbook 代码
   - 诊断脚本：`Get-AzureAutomationDiagnosticResults.ps1`

> ⚠️ **重要规则**：我们不支持客户代码/脚本。提供通用示例证明功能可用，让客户自行适配。

**判断逻辑**：
| 错误类型 | 后续动作 |
|---------|---------|
| 上下文/订阅切换问题 | → Phase 2a |
| 交互式提示导致 Runbook 挂起 | → Phase 2b |
| 限额/配额错误 | → Phase 2c |
| API 限流 (429) | → Phase 2d |
| Webhook 错误 (400) | → Phase 2e |
| 参数长度超限 | → Phase 2f |
| PowerShell Workflow 反序列化错误 | → Phase 2g |
| Hybrid Worker 模块冲突 | → Phase 2h |
| 账户/Runbook 恢复 | → Phase 3 |
| 间歇性/通用错误 | → Phase 4 (Try-Catch-Retry) |

`[结论: 🟢 9.5/10 — OneNote 一线方法论 + 多来源错误场景交叉验证]`

### Phase 2a: 订阅上下文切换问题
> 来源: [MCVKB/OneNote — Case Study]

**症状**：父 Runbook 在 foreach 循环调用子 Runbook 时，前几个订阅正常，后续报错 "sub runbook not found"。

**根因**：子 Runbook 中的 `Select-AzureRmSubscription` (Set-AzureRmContext) 改变了会话级别的订阅上下文，导致父 Runbook 丢失对 Automation Account 订阅的访问。

**修复**：在父 Runbook 的每次 foreach 迭代开头添加 `Select-AzureRmSubscription` 重置回 Automation Account 所在订阅：
```powershell
foreach ($sub in $subscriptions) {
    # 重置上下文到 Automation Account 订阅
    Select-AzureRmSubscription -SubscriptionId $automationAccountSubId
    
    # 调用子 Runbook
    Start-AzureRmAutomationRunbook -Name "ChildRunbook" -Parameters @{ TargetSub = $sub.Id }
}
```

`[结论: 🟢 9/10 — OneNote 实际 Case 验证]`

### Phase 2b: -Debug 交互式提示导致 Runbook 挂起
> 来源: [MCVKB/OneNote — Code Sample]

**症状**：包含 `-Debug` 参数的 cmdlet 导致 Runbook 无限挂起，永不完成。

**根因**：带 `-Debug` 的 cmdlet 触发交互式 `ShouldContinue` 提示。Azure Automation Sandbox 没有交互式控制台来响应，Runbook 永久阻塞。

**修复**：
```powershell
# 在 Runbook 开头设置，抑制交互式提示
$GLOBAL:DebugPreference = "Continue"

# 将 debug stream 重定向到 output stream
Get-AzSqlElasticPool -ResourceGroupName "rg" -ServerName "srv" 5>&1
```

`[结论: 🟢 9/10 — OneNote 实证，修复方案简洁明确]`

### Phase 2c: Job 配额用尽
> 来源: [MCVKB/OneNote]

**症状**：Runbook Job 失败，报错 `The quota for the monthly total job run time has been reached for this subscription`。

**根因**：Automation 免费层月度 Job 运行时间配额已用尽。Pricing Tier and Usage 界面可能因显示延迟显示低于限制的分钟数。

**修复**：
- 临时升级 Automation Account Pricing Tier（可稍后降级）
- 或等待下个月配额重置

`[结论: 🟢 8.5/10 — OneNote 实证]`

### Phase 2d: API 限流 (429)
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-powershell-runbook)

**症状**：Runbook 失败报错 `429: The request rate is currently too large`（获取 Job 输出时）。

**根因**：Runbook 产生过多 verbose 输出，检索输出时触发 API 限流。

**修复**：
- 减少 Runbook 中的 verbose 输出
- 避免过多的 `Write-Verbose` 调用
- 设置 `$VerbosePreference = 'SilentlyContinue'`

`[结论: 🔵 7/10 — MS Learn 单源]`

### Phase 2e: Webhook 错误 (400 Bad Request)
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-powershell-runbook)

**症状**：调用 Webhook 时报错 `400 Bad Request`。

**根因**：Webhook 过期或被禁用，或 Runbook 代码有问题（缺少值、错误参数值、过时模块）。

**修复**：
- 检查 Webhook 过期日期并续期
- 验证 Runbook 参数值、模块版本
- 确认引用的 Webhook 资源处于活跃状态

`[结论: 🔵 7/10 — MS Learn 单源]`

### Phase 2f: 参数长度超限
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-python-runbook)

**症状**：Python Runbook 报错 `Parameter length exceeded`。

**根因**：Python 2.7、Python 3.8、PowerShell 7.1 Runbook 的参数名+值总长度上限为 30,000 字符。

**修复**：
- 使用 Azure Automation Variables 传递大值，而非参数
- 缩短参数名和参数值

`[结论: 🔵 7/10 — MS Learn 单源]`

### Phase 2g: PowerShell Workflow 反序列化错误
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/powershell-job-script-cmdlets-not-working)

**症状**：报错 `Cannot bind parameter - Cannot convert Deserialized <Type> to <Type>`。

**根因**：PowerShell Workflow 以反序列化格式存储复杂对象以持久化 Runbook 状态。反序列化对象无法作为强类型参数传递。

**修复**（3 种方案）：
1. 将 cmdlet 管道操作包在 `InlineScript` activity 中
2. 传递单独值而非复杂对象
3. 切换到普通 PowerShell Runbook（非 Workflow）

`[结论: 🟢 8/10 — MS Learn 高质量官方文档]`

### Phase 2h: Hybrid Worker 模块冲突
> 来源: [KB4019254](https://support.microsoft.com/kb/4019254) + [KB4055816](https://support.microsoft.com/kb/4055816)

**症状 1** — SMA Workflow 执行失败：
`Cannot create unknown type {clr-namespace:Microsoft.PowerShell.DynamicActivities}Activity_Nested`

**根因**：Runbook Worker 上存在 PowerShell emulated activity 模块或 SMAAuthoringToolkit，与 SMA cmdlet 产生歧义。

**修复**：
- 检查 Runbook 中的 SMA-only cmdlet（如 `Get-AutomationVariable`, `Get-AutomationPSCredential`）
- 在 Microsoft-ServiceManagementAutomation/Operational 日志中找到 Runbook Worker
- 使用 `get-command` 定位冲突模块
- 移除模块或移到非默认 PS module 目录

**症状 2** — Hybrid Worker 上 Connection not found：
`Connection AzureRunAsConnection not found` + Warning: `AzureAutomationAuthoringToolkit Warning - Local value for Connection asset AzureRunAsConnection not found`

**根因**：Azure Automation Authoring Toolkit 不支持在 Hybrid Worker 上运行，其包含的重复 cmdlet 与 Azure Automation cmdlet 冲突。

**修复**：
```powershell
# 以管理员运行
Uninstall-Module -Name AzureAutomationAuthoringToolkit -Force
# 然后在 Hybrid Worker 上重新运行 Runbook
```

`[结论: 🔵 7/10 — 两个 ContentIdea KB 交叉验证（同类问题不同表现），可信度提升]`

### Phase 3: 账户/Runbook 恢复
> 来源: [KB4090138](https://support.microsoft.com/kb/4090138) + [KB4092287](https://support.microsoft.com/kb/4092287)

| 场景 | 恢复条件 | 方法 |
|------|---------|------|
| 删除了 Automation Account | 30 天内 | 通过 Azure Support 后端恢复 |
| 删除了资源组（含 Automation Account） | 30 天内 | 先恢复资源组（ICM），再恢复 Automation Account |
| 删除了 Runbook | 30 天内 | 需加入 VSTF_CDM_SFE_Contributors 安全组，使用 SFE 工具恢复。需提供 Account Name + Runbook name + SubscriptionId + Region |

`[结论: 🔵 6.5/10 — ContentIdea KB 单源，但恢复流程明确]`

### Phase 4: 通用 Try-Catch-Retry 模式
> 来源: [MCVKB/OneNote — Generic Error TSG](../drafts/onenote-generic-error-tsg.md)

适用于间歇性、跨服务调用失败等通用错误场景。

```powershell
$RetryIntervalInSeconds = 10
$NumberOfRetryAttempts = 2
$cmdOk = $FALSE

do {
    try {
        # 使用 -ErrorAction Stop 捕获非致命异常
        <cmdlet to trap here> -ErrorAction Stop
        $cmdOk = $TRUE
    }
    catch {
        Write-Output "Exception Caught..."
        $ErrorMessage = $_.Exception.Message
        $StackTrace = $_.Exception.StackTrace  # PowerShell Workflow 不支持
        Write-Output "Error: $ErrorMessage, stack: $StackTrace. Retries left: $NumberOfRetryAttempts"
        $NumberOfRetryAttempts--
        Start-Sleep -Seconds $RetryIntervalInSeconds
    }
} while (-not $cmdOk -and $NumberOfRetryAttempts -ge 0)
```

> 💡 部分 cmdlet 不支持 `-ErrorAction`，使用替代方案：
```powershell
$ErrorActionPreference = 'Stop'
<cmdlet>
$cmdOk = $TRUE
$ErrorActionPreference = 'Continue'
```

**调试技巧**：

```powershell
# Method 1: -Debug 输出
$DebugPreference = "Continue"
Add-AzureAccount -Credential $Cred -Debug *>&1

# Method 2: PSDebug 追踪
$GLOBAL:DebugPreference = "Continue"
SET-PSDebug -Trace 2
Get-AzureRmResourceGroupDeployment -ResourceGroupName "rgName"
```

**诊断脚本**：
```powershell
Get-AutomationDiagnosticResults.ps1 -AutomationAccountName '<name>' -RunbookName '<name>'
```
来源: https://github.com/jefffanjoy/DemoCode/blob/master/Scripts/Azure%20Automation/Get-AutomationDiagnosticResults.ps1

**详细日志开关**：
- `$VerbosePreference = "Continue"` 在 Runbook 开头
- 在失败命令前使用 `Write-Output` 输出变量值
- Runbook > Settings > Logging and Tracing 开启 Verbose Logging

**后端日志（最后手段）**：
- 使用 Job ID + Account ID 查询 Jarvis/Kusto 后端日志
- 参考对应的 Kusto 和 Jarvis 查询指南

`[结论: 🟢 9/10 — OneNote 一线方法论，含完整代码模式和调试技巧]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 父 Runbook 循环调子 Runbook 后报 "not found" | 订阅上下文被子 Runbook 切换 | 每次迭代重置 `Select-AzureRmSubscription` | 🟢 9 — OneNote Case | [MCVKB/OneNote] |
| 2 | -Debug 参数导致 Runbook 无限挂起 | 交互式 ShouldContinue 提示阻塞 | `$GLOBAL:DebugPreference="Continue"` + `5>&1` | 🟢 9 — OneNote | [MCVKB/OneNote] |
| 3 📋 | Runbook 排查方法论（Scoping/数据收集/调试） | — | 完整排查框架 | 🟢 9.5 — OneNote 指南 | [MCVKB/OneNote](../drafts/onenote-runbook-tsg-methodology.md) |
| 4 📋 | 通用错误 Try-Catch-Retry 模式 | — | 完整 PowerShell 代码模板 | 🟢 9 — OneNote 指南 | [MCVKB/OneNote](../drafts/onenote-generic-error-tsg.md) |
| 5 | Job 配额 monthly limit reached | 免费层配额用尽 | 升级 Pricing Tier 或等下月重置 | 🟢 8.5 — OneNote | [MCVKB/OneNote] |
| 6 | 429 The request rate is too large | verbose 输出过多触发限流 | 减少 Write-Verbose + `SilentlyContinue` | 🔵 7 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-powershell-runbook) |
| 7 | 400 Bad Request (Webhook) | Webhook 过期/禁用 | 续期 Webhook + 验证参数 | 🔵 7 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-powershell-runbook) |
| 8 | Parameter length exceeded (Python) | 参数总长 >30000 字符 | 改用 Automation Variables | 🔵 7 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-python-runbook) |
| 9 | Cannot convert Deserialized \<Type\> | PS Workflow 反序列化 | InlineScript / 传值 / 改用 PS Runbook | 🟢 8 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/powershell-job-script-cmdlets-not-working) |
| 10 | SMA Activity_Nested 错误 | Worker 上模块冲突 | 移除冲突模块 | 🔵 6.5 — KB | [KB4019254](https://support.microsoft.com/kb/4019254) |
| 11 | Hybrid Worker Connection not found | AuthoringToolkit 冲突 | `Uninstall-Module AzureAutomationAuthoringToolkit` | 🔵 7 — KB 双源 | [KB4055816](https://support.microsoft.com/kb/4055816) |
| 12 | 删除了 Automation Account 需恢复 | 用户误删 | 30 天内 Azure Support 后端恢复 | 🔵 6.5 — KB | [KB4090138](https://support.microsoft.com/kb/4090138) |
| 13 | 删除了 Runbook 需恢复 | 用户误删 | SFE 工具恢复（30 天内） | 🔵 6.5 — KB | [KB4092287](https://support.microsoft.com/kb/4092287) |
