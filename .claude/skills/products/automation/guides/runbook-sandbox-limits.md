# Automation Runbook 沙箱资源限制与崩溃 — 排查速查

**来源数**: 10 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Runbook 脚本无报错中途停止并从头重启 | 脚本消耗 400MB+ 内存，超出沙箱内存限制 | 拆分脚本为多个子 Runbook，用 `Start-AzureRmAutomationRunbook -Wait` 调用子作业 | 🟢 10 — OneNote+MS Learn 交叉验证 | [MCVKB/16.2](MCVKB/VM+SCIM/======16.%20Automation======/16.2%20%5BAutomation%5D%20Respect%20service%20limitation%20and%20m.md) |
| 2 | Runbook 作业意外重启后进入 Stopped 状态，EtwJobStatus 显示 sandbox 变更 | 沙箱进程崩溃（DrawbridgeHostV1: 'Process exited 0xffffffff'），Automation 重试机制在新沙箱重启作业；用户手动停止了重启的作业 | (1) 设计幂等 Runbook 支持重启 (2) 用 EtwJobStatus + DrawbridgeHostV1 + ARM HttpIncomingRequests 追踪完整生命周期 | 🟢 9 — OneNote 实证(Case Study) | [Mooncake POD/Case Study](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/%23%23%20Case%20Study) |
| 3 📋 | 作业失败/挂起，需通过 Jarvis 诊断沙箱根因 | 沙箱进程因内存耗尽(400MB+)或其他资源约束终止 | (1) 获取 Job ID (2) 查 EtwAll TaskName=SandboxHandleJobActionEnter 获取 processId (3) 查 DrawbridgeHostV1 找终止原因 | 🟢 10 — OneNote+Jarvis 诊断交叉 | [MCVKB/Jarvis Sandbox](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/%23%23%20Troubleshooting/Jarvis) |
| 4 📋 | 需要 Jarvis 沙箱诊断的分步指南 | — | 详见融合指南: guides/drafts/onenote-jarvis-sandbox-diagnosis.md | 🟢 9 — OneNote 指南(guide-draft) | [MCVKB/Jarvis Sandbox Diagnosis](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/%23%23%20Troubleshooting/Jarvis) |
| 5 | PS 作业报错 'Method invocation is supported only on core types in this language mode' | Runbook 在沙箱中以 Constrained Language 模式运行，限制非核心类型的方法调用 | 用 `Start-AzAutomationRunbook` 替代 `Start-Job` 启动子 Runbook；或在 Hybrid Worker 上运行（支持 Full Language 模式） | 🔵 6 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/powershell-job-script-cmdlets-not-working) |
| 6 | 作业内存超限(400MB)后 3 次重试均失败，进入 Suspended | 作业超过沙箱 400MB 内存限制 | 拆分负载到多个 Runbook；减少内存数据；用 `$myVar.clear()` 和 `[GC]::Collect()` 释放内存；避免不必要输出；考虑迁移到 Hybrid Worker | 🟢 8 — MS Learn+OneNote 交叉 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-job-suspended) |
| 7 | 作业因网络 socket 超限 3 次重试失败，进入 Suspended | 沙箱限制 1,000 个并发网络 socket | 减少 Runbook 中的并发网络连接；迁移到 Hybrid Worker（无沙箱 socket 限制） | 🔵 6 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-job-suspended) |
| 8 | 沙箱 Runbook 用 MSAL 对 Entra ID 认证失败 | 沙箱环境不支持 MSAL 认证可执行文件或子进程 | 改用 Automation Account 的 Managed Identity；或在 Hybrid Worker 上运行 | 🔵 6 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-job-suspended) |
| 9 | Runbook 报错 'Forbidden with client authentication scheme anonymous' | Runbook 在沙箱中使用凭据认证，不被支持 | 切换到 Managed Identity 认证；不要在沙箱 Runbook 中用存储的凭据或证书访问 Azure 资源 | 🔵 6 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/troubleshoot-runbook-execution-issues) |
| 10 | 依赖二进制文件的 Cmdlet（MDAC、Azure Fabric SDK）在沙箱中失败 | 沙箱不支持依赖外部二进制或原生库的 Cmdlet | 在 Hybrid Worker 上执行，可安装和访问原生二进制文件 | 🔵 6 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/troubleshoot-runbook-execution-issues) |

## 快速排查路径

1. **确认作业状态** → Portal: Automation Account > Jobs，找到失败/挂起的 Job ID `[来源: OneNote]`
2. **检查内存/资源** → 脚本是否处理大量数据？是否有循环中累积对象？ `[来源: OneNote+MS Learn]`
3. **Jarvis 诊断（Mooncake）** → EtwAll 查 SandboxHandleJobActionEnter 获取 processId → DrawbridgeHostV1 查终止原因 `[来源: OneNote]`
4. **如果内存超限** → 拆分子 Runbook + `[GC]::Collect()` + 减少输出 `[来源: OneNote+MS Learn]`
5. **如果 socket 超限** → 减少并发连接或迁移到 Hybrid Worker `[来源: MS Learn]`
6. **如果认证问题** → 沙箱仅支持 Managed Identity，不支持 MSAL/凭据认证 `[来源: MS Learn]`
7. **如果二进制依赖** → 必须迁移到 Hybrid Worker `[来源: MS Learn]`
8. **如果 Language Mode 限制** → 用 `Start-AzAutomationRunbook` 替代 `Start-Job`，或迁移到 Hybrid Worker `[来源: MS Learn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/runbook-sandbox-limits.md#排查流程)
