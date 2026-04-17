# Automation Runbook 常见错误与排查方法 — 排查速查

**来源数**: 13 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 父 Runbook 在 foreach 循环中调用子 Runbook，前几个订阅后报 "sub runbook not found" | 子 Runbook 中 Select-AzureRmSubscription 改变了父 Runbook 的 session-wide 订阅上下文 | 每次 foreach 迭代开头加 `Select-AzureRmSubscription` 重置回 Automation Account 订阅 | 🟢 9 — OneNote 实证 | [MCVKB/Automation/16.2](../../guides/drafts/) |
| 2 | Runbook 包含 -Debug 参数的 cmdlet 时无限期挂起 | -Debug 触发 ShouldContinue 交互提示，sandbox 无交互控制台导致阻塞 | 脚本开头设 `$GLOBAL:DebugPreference="Continue"`；用 `5>&1` 重定向 debug stream 到 output | 🟢 9 — OneNote 实证 | [MCVKB/Automation/Common Code Samples](../../guides/drafts/) |
| 3 | Runbook 报 "The quota for the monthly total job run time has been reached" | Automation Free 层月度配额用尽，Portal 显示可能有延迟 | 临时升级 Pricing Tier（之后可降回）；或等下月配额重置 | 🟢 9 — OneNote 实证 | [MCVKB/Automation/Troubleshooting](../../guides/drafts/) |
| 4 📋 | 需要 Runbook 通用排查方法论（Scoping / 数据收集 / 调试） | — | 详见融合指南：Write-Verbose、断点调试、日志分析完整流程 | 🟢 8 — OneNote 含融合指南 | [MCVKB/Automation/Troubleshooting](../../guides/drafts/) |
| 5 📋 | 需要 Generic Error 排查模式（Try-Catch-Retry 处理间歇性失败） | — | 详见融合指南：ErrorAction Stop + Try-Catch + 重试机制 + 诊断脚本 | 🟢 8 — OneNote 含融合指南 | [MCVKB/Automation/Troubleshooting/Generic Error](../../guides/drafts/) |
| 6 | Hybrid Worker 上执行报 "Connection AzureRunAsConnection not found"，Warning 显示 AzureAutomationAuthoringToolkit | Azure Automation Authoring Toolkit 不支持 Hybrid Worker，其 cmdlet 与 Automation cmdlet 冲突 | `Uninstall-Module -Name AzureAutomationAuthoringToolkit -Force`，然后重启 Runbook | 🔵 6.5 — ContentIdea KB | [KB4055816](https://support.microsoft.com/kb/4055816) |
| 7 | SMA Workflow 报 "Cannot create unknown type {clr-namespace:Microsoft.PowerShell.DynamicActivities}" | SMA Authoring Toolkit 安装在 Runbook Worker 上，SMA-only cmdlet 导致歧义 | 找出冲突模块（`get-command` 检查），移除或移到非默认 PS 模块目录 | 🔵 6.5 — ContentIdea KB | [KB4019254](https://support.microsoft.com/kb/4019254) |
| 8 | 删除的 Automation Account 需要恢复 | 客户误删 Automation Account 或包含它的资源组 | 30 天内可通过 Azure Support 后端恢复；如删了资源组需先恢复资源组（ICM） | 🔵 6.5 — ContentIdea KB | [KB4090138](https://support.microsoft.com/kb/4090138) |
| 9 | 删除的 Runbook 需要恢复 | 客户误删 Automation Account 中的 Runbook | 30 天内可通过 Azure Support 后端恢复；需加入 VSTF_CDM_SFE_Contributors 安全组使用 SFE 工具 | 🔵 6.5 — ContentIdea KB | [KB4092287](https://support.microsoft.com/kb/4092287) |
| 10 | Runbook 报 "429: The request rate is currently too large"（检索 job output 时） | Runbook 产生过多 verbose stream 导致 API 限流 | 减少 Write-Verbose 调用；设 `$VerbosePreference = 'SilentlyContinue'` | 🔵 6 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-powershell-runbook) |
| 11 | 调用 Webhook 时报 "400 Bad Request" | Webhook 已过期/禁用，或 Runbook 参数值/模块版本有误 | 检查 Webhook 过期日期并续期；验证参数值和模块版本 | 🔵 6 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-powershell-runbook) |
| 12 | Python Runbook 报 "Parameter length exceeded"（参数名+值超 30000 字符） | Python 2.7/3.8 和 PS 7.1 有 30000 字符参数限制 | 使用 Automation Variables 传大值代替参数；缩短参数名和值 | 🔵 6 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/error-running-python-runbook) |
| 13 | PS Workflow Runbook 报 "Cannot bind parameter - Cannot convert Deserialized \<Type\>" | PS Workflow 将复杂对象存为反序列化格式以持久化状态，不能传给类型化参数 | 用 `InlineScript` 包裹 cmdlet；传单个值而非复杂对象；或改用 PowerShell Runbook（非 Workflow） | 🔵 6 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/powershell-job-script-cmdlets-not-working) |

## 快速排查路径
1. **配额问题？** → 检查 Pricing Tier and Usage blade，升级或等月底重置 `[来源: OneNote]`
2. **Runbook 挂起无响应？** → 检查是否有 `-Debug` 参数 cmdlet → 设 `$GLOBAL:DebugPreference="Continue"` `[来源: OneNote]`
3. **子 Runbook 报 Not Found？** → foreach 循环中 `Select-AzureRmSubscription` 重置上下文 `[来源: OneNote]`
4. **429 限流？** → 减少 verbose output，`$VerbosePreference = 'SilentlyContinue'` `[来源: MS Learn]`
5. **Webhook 400？** → 检查 Webhook 过期时间、参数值和模块版本 `[来源: MS Learn]`
6. **参数长度超限？** → 改用 Automation Variables 传递大值 `[来源: MS Learn]`
7. **PS Workflow 反序列化错误？** → `InlineScript` 或改用 PowerShell Runbook `[来源: MS Learn]`
8. **Hybrid Worker 上 RunAsConnection 找不到？** → 卸载 AzureAutomationAuthoringToolkit `[来源: ContentIdea KB]`
9. **误删 Runbook/Account？** → 30 天内可 Azure Support 后端恢复 `[来源: ContentIdea KB]`
10. **通用排查思路** → 先 Scoping，再数据收集，再 Try-Catch-Retry 隔离 `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/runbook-common-errors.md#排查流程)
