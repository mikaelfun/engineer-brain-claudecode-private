# Automation PS 模块依赖与兼容性 — 排查速查

**来源数**: 7 | **21V**: 部分（6/7 适用）
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 计划任务执行时 Cmdlet 无法识别，手动触发正常 | 计划任务使用创建 Schedule 时的模块版本，新导入的模块不会被已有 Schedule 引用 | 导入新 PS 模块后，创建新的 Schedule 并链接到 Runbook | 🟢 9 — OneNote 实证 | [MCVKB/16.1](MCVKB/VM+SCIM/======16.%20Automation======/16.1%20Azure%20Automation%20scheduled%20job%20cannot%20load%20ce.md) |
| 2 | PS 模块在 ScriptBlock（Start-Job）中无法识别 | 沙箱 Runbook 仅支持串行执行，ScriptBlock 在独立进程运行，无法访问 Automation Account 模块 | 改用 Hybrid Worker 执行并行任务；HW 上本地安装的模块在 ScriptBlock 中可用；用 `-ArgumentList` 传参 | 🟢 8.5 — OneNote 实证 | [MCVKB/16.4](MCVKB/VM+SCIM/======16.%20Automation======/16.4%20%5BAutomation%5D%20Some%20key%20learnings%20on%20Automation.md) |
| 3 | 用 Update-AutomationAzureModulesForAccount.ps1 更新 Az 模块，3 小时后超时无报错 | (1) 脚本在依赖模块不存在时死锁 (2) Set-AzAutomationModule 已知 Bug 无法上传 PS 7.1 模块 | 用 REST API 复制 Portal「Update Az Modules」操作：F12 抓取 API 调用，用 PATCH + RuntimeConfiguration payload；启用 MSI 认证 | 🟢 8.5 — OneNote 实证(F12 方法) | [MCVKB/16.7](MCVKB/VM+SCIM/======16.%20Automation======/16.7%20How%20to%20use%20REST%20API%20to%20do%20azure%20portal%20operat.md) |
| 4 | ExchangeOnlineManagement v3.0.0+ 在 Runbook 中报错 | v3+ 依赖 PowerShellGet 和 PackageManagement 模块，沙箱默认未预装 | 在 Automation Account 中显式上传 PowerShellGet 和 PackageManagement 模块 | 🟡 4.5 — MS Learn 单源, 21V 不适用 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/powershell-job-script-cmdlets-not-working) |
| 5 | 模块更新后 Runbook 挂起，报 'Command not found' 或 'Cannot bind parameter' | 模块依赖关系不正确或更新后版本不兼容 | 更新 Automation Account 中的 Azure PowerShell 模块到最新兼容版本；用 Update-AutomationAzureModulesForAccount Runbook | 🔵 6 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-job-suspended) |
| 6 | PS 7 Runbook 中 $VerbosePreference / $ProgressPreference 在 Runbook 属性设置无效 | PS 7 Runtime 不支持通过 Runbook 属性设置日志首选项，已知限制 | 在 Runbook 脚本开头显式设置 `$VerbosePreference` 和 `$ProgressPreference` | 🔵 6 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/powershell-job-script-cmdlets-not-working) |
| 7 | 更新 Azure 模块后 Find-AzureRmResource 报 'Cannot find command' | AzureRM 6.0.0 起 Find-AzureRmResource 已合并到 Get-AzureRmResource 并移除 | 将 Runbook 中的 `Find-AzureRmResource` 替换为 `Get-AzureRmResource` | 🔵 6.5 — ContentIdea KB | [KB4338620](https://support.microsoft.com/kb/4338620) |

## 快速排查路径

1. **确认模块版本** → Portal: Automation Account > Modules，检查目标模块是否存在及版本 `[来源: OneNote]`
2. **如果计划任务不识别新模块** → 删除旧 Schedule，创建新 Schedule 重新关联 `[来源: OneNote]`
3. **如果 ScriptBlock 中模块不可用** → 沙箱不支持，迁移到 Hybrid Worker `[来源: OneNote]`
4. **如果模块更新超时/死锁** → 改用 REST API（F12 抓 Portal 操作），不要用 Set-AzAutomationModule `[来源: OneNote]`
5. **如果 Cmdlet 找不到** → 检查 AzureRM/Az 版本变更（如 Find → Get 合并），更新脚本 `[来源: ContentIdea KB]`
6. **如果 ExchangeOnline v3+ 报错** → 先上传 PowerShellGet + PackageManagement（⚠️ 仅 Global Azure） `[来源: MS Learn]`
7. **如果 PS7 日志首选项无效** → 在脚本内显式设置，不依赖 Runbook 属性 `[来源: MS Learn]`
