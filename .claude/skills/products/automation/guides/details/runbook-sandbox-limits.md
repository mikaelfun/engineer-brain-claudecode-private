# Automation Runbook Sandbox 限制 — 综合排查指南

**条目数**: 10 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-jarvis-sandbox-diagnosis.md](../drafts/onenote-jarvis-sandbox-diagnosis.md)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 症状分类与初步判断
> 来源: [MCVKB/16.2](../drafts/onenote-jarvis-sandbox-diagnosis.md) + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-job-suspended)

1. 确认 Runbook 执行环境：Azure Sandbox 还是 Hybrid Worker
   - Azure Portal → Automation Account → Jobs → 选择失败 Job → 查看 "Run on" 字段
   - 如果是 Hybrid Worker → 参见 [hybrid-worker 排查指南](hybrid-worker.md)

2. 确认 Job 状态和错误信息：

**判断逻辑**：
| 症状 | 含义 | 后续动作 |
|------|------|---------|
| Job 意外重启后 Stopped | Sandbox 崩溃 + 重试机制触发 | → Phase 2 (Sandbox 诊断) |
| Job Suspended (3 次失败) | 资源限制触发 | → Phase 3 (资源限制分析) |
| "Method invocation is supported only on core types" | Constrained Language Mode 限制 | → Phase 4a |
| "Forbidden with client authentication scheme anonymous" | 认证方式不兼容 Sandbox | → Phase 4b |
| MSAL 认证失败 | Sandbox 不支持 MSAL | → Phase 4c |
| 依赖外部二进制的 Cmdlet 失败 (MDAC, Azure Fabric SDK) | Sandbox 不支持原生二进制 | → Phase 4d |

`[结论: 🟢 9/10 — OneNote 一线经验 + MS Learn 官方文档交叉验证，Mooncake 明确适用]`

### Phase 2: Sandbox 诊断（Jarvis 方法）
> 来源: [onenote-jarvis-sandbox-diagnosis.md](../drafts/onenote-jarvis-sandbox-diagnosis.md) — OneNote 一线排查经验

**适用场景**：Job 意外重启、无明确错误信息、需要定位 Sandbox 进程级根因。

> **21V 注意**: 使用 Mooncake 对应的 MK 命名空间 (`OaasMKProd{region}`)

#### Step 1: 获取 Job ID
从 Azure Portal → Automation Account → Jobs → 选择失败/挂起的 Job → 复制 Job ID。

#### Step 2: 查找 Sandbox Process ID
查询 **EtwAll** 表（命名空间 `OaasMKProd{region}`）：

```kusto
// Jarvis: EtwAll → 查找 Sandbox 进程 ID
// Namespace: OaasMKProd{region}
EtwAll
| where TIMESTAMP between (datetime(YYYY-MM-DD HH:MM:SS) .. datetime(YYYY-MM-DD HH:MM:SS))
| where EventMessage contains "<JobID>"
| where TaskName == "SandboxHandleJobActionEnter"
| project TIMESTAMP, TaskName, EventMessage, processId
```

- 结果：返回每个接管该 Job 的 Sandbox 进程记录
- 关键字段：**processId** — Sandbox 进程标识符
- 如果出现多条记录 → 说明 Job 经历了 Sandbox 切换（重启/重试）

`[来源: OneNote 一线排查方法 — 🟢 9/10]`

#### Step 3: 检查 Sandbox 终止原因
用 Step 2 获取的 processId 查询 **DrawbridgeHostV1** 表：

```kusto
// Jarvis: DrawbridgeHostV1 → 查看 Sandbox 终止原因
DrawbridgeHostV1
| where TIMESTAMP between (datetime(YYYY-MM-DD HH:MM:SS) .. datetime(YYYY-MM-DD HH:MM:SS))
| where pid == <processId>
| project TIMESTAMP, EventMessage, Level
| order by TIMESTAMP asc
```

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| 无事件或仅 Info/Warning 级别 | Sandbox 正常，问题在脚本层 | 检查 Runbook 脚本逻辑 |
| "Process exited with non-zero code 0xffffffff" | Sandbox 进程崩溃（瞬态基础设施问题） | 重试 Job；设计幂等 Runbook |
| 内存相关事件 | 内存耗尽（400MB 限制） | → Phase 3a |
| 其他资源限制事件 | 网络/CPU 等限制 | → Phase 3b |

`[结论: 🟢 9.5/10 — OneNote 实战验证 + MS Learn 交叉确认，Mooncake 专属流程]`

#### 补充：Job 重启后被手动停止的鉴别
> 来源: [Mooncake POD Case Study](automation-014)

如果 EtwJobStatus 显示 Job Running → Stopped 且伴随 Sandbox 切换：
1. 查 **DrawbridgeHostV1** 确认 Sandbox 是否崩溃
2. 查 **EtwIncomingWebRequest** + **ARM HttpIncomingRequests** 确认是否有手动 STOP 操作
   - 关键字段：`clientApplicationId`、`principalOid` — 可定位操作人

```kusto
// 检查是否有人手动停止了 Job
// 查 ARM HttpIncomingRequests
HttpIncomingRequests
| where TIMESTAMP between (datetime(YYYY-MM-DD HH:MM:SS) .. datetime(YYYY-MM-DD HH:MM:SS))
| where requestUri contains "<JobID>" and requestUri contains "STOP"
| project TIMESTAMP, clientApplicationId, principalOid, httpStatusCode
```

`[结论: 🟢 8.5/10 — OneNote Case Study 实证，Mooncake 验证]`

### Phase 3: 资源限制分析
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-job-suspended) + [MCVKB/16.2](automation-002)

#### Phase 3a: 内存限制 (400MB)

**Azure Sandbox 内存上限：400MB**。超出后 Job 经 3 次重试 → Suspended。

**解决方案**（按优先级）：

1. **拆分脚本为子 Runbook**（推荐）`[来源: OneNote — 🟢 9/10]`
   - 使用 Child Runbook 模式：`Start-AzureRmAutomationRunbook -Wait`
   - 每个子 Runbook 在独立 Sandbox 运行，各自有 400MB 限额

2. **优化内存使用** `[来源: MS Learn — 🟢 8/10]`
   - 减少内存中数据量
   - 使用 `$myVar.Clear()` 释放不再需要的变量
   - 调用 `[GC]::Collect()` 触发垃圾回收
   - 避免不必要的 Output（Write-Output 会占用内存缓冲区）

3. **迁移到 Hybrid Runbook Worker** `[来源: MS Learn — 🟢 8/10]`
   - Hybrid Worker 无 400MB 限制
   - 适合长期运行或大内存需求的 Runbook

#### Phase 3b: 网络 Socket 限制 (1,000)

**Azure Sandbox 并发 Socket 上限：1,000**。

**解决方案** `[来源: MS Learn — 🟢 8/10]`：
- 减少 Runbook 中的并发网络连接
- 迁移到 Hybrid Worker（无 Socket 限制）

`[结论: 🟢 8.5/10 — OneNote 实战 + MS Learn 官方文档双重验证]`

### Phase 4: Sandbox 功能限制
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/powershell-job-script-cmdlets-not-working) + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/troubleshoot-runbook-execution-issues)

#### Phase 4a: Constrained Language Mode

**症状**：`Cannot invoke method. Method invocation is supported only on core types in this language mode`

**根因**：Azure Sandbox 运行在 Constrained Language Mode，限制非核心类型的方法调用。

**解决方案** `[来源: MS Learn — 🟢 8/10]`：
- 用 `Start-AzAutomationRunbook` 替代 `Start-Job` 启动子 Runbook
- 或迁移到 Hybrid Worker（支持 Full Language Mode）

#### Phase 4b: 凭据认证不兼容

**症状**：`Forbidden with client authentication scheme anonymous`

**根因**：Sandbox 中使用存储凭据认证不受支持。

**解决方案** `[来源: MS Learn — 🔵 7/10]`：
- 切换到 Managed Identity 认证
- 不要在 Sandbox Runbook 中使用存储凭据或证书进行 Azure 资源访问

#### Phase 4c: MSAL 认证不支持

**症状**：Runbook 使用 MSAL 向 Microsoft Entra ID 认证失败

**根因**：Azure Sandbox 环境无法使用 MSAL 认证可执行文件或子进程。

**解决方案** `[来源: MS Learn — 🟢 8/10]`：
- 使用 Automation Account 的 Managed Identity 替代 MSAL
- 确保 Microsoft Graph PowerShell 模块可用且 Managed Identity 拥有所需权限
- 或迁移到 Hybrid Worker

#### Phase 4d: 外部二进制依赖

**症状**：依赖 MDAC、Azure Fabric SDK 等原生库的 Cmdlet 执行失败

**根因**：Azure Sandbox 不支持依赖外部二进制或原生库的 Cmdlet。

**解决方案** `[来源: MS Learn — 🔵 7/10]`：
- 迁移到 Hybrid Worker，在 Worker 机器上安装所需的原生二进制

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 脚本意外停止并重新开始，Jarvis 显示 Sandbox 崩溃 | 脚本内存超 400MB Sandbox 限制 | 拆分子 Runbook（Child Runbook 模式） | 🟢 9.5 — OneNote 实战+MS Learn 交叉 | [MCVKB/16.2](../drafts/onenote-jarvis-sandbox-diagnosis.md) |
| 2 | Job 重启后进入 Stopped 状态 | Sandbox 崩溃触发重试+用户手动停止 | 设计幂等 Runbook；用 Kusto 追踪全链路 | 🟢 8.5 — OneNote Case Study 实证 | [POD Case Study] |
| 3 | Job 失败/挂起，需 Sandbox 级诊断 | Sandbox 进程因内存/资源终止 | Jarvis 三步诊断法（EtwAll→DrawbridgeHostV1） | 🟢 9.5 — OneNote 实战流程 | [POD Jarvis TSG](../drafts/onenote-jarvis-sandbox-diagnosis.md) |
| 4 📋 | 需要 Sandbox 诊断步骤指南 | — | 见融合排查流程 Phase 2 | 🟢 9 — OneNote 指南 | [onenote-jarvis-sandbox-diagnosis.md](../drafts/onenote-jarvis-sandbox-diagnosis.md) |
| 5 | "Method invocation is supported only on core types" | Constrained Language Mode | 用 Start-AzAutomationRunbook 或迁移 Hybrid Worker | 🟢 8 — MS Learn 官方 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/powershell-job-script-cmdlets-not-working) |
| 6 | Job Suspended（3 次失败）— 内存限制 | 超 400MB Sandbox 内存限制 | 拆分 Runbook / 清理变量 / 迁移 Hybrid Worker | 🟢 8.5 — MS Learn+OneNote 交叉 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-job-suspended) |
| 7 | Job Suspended（3 次失败）— Socket 限制 | 超 1,000 并发 Socket 限制 | 减少并发连接 / 迁移 Hybrid Worker | 🟢 8 — MS Learn 官方 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-job-suspended) |
| 8 | MSAL 认证失败 | Sandbox 不支持 MSAL 认证 | 使用 Managed Identity | 🟢 8 — MS Learn 官方 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-job-suspended) |
| 9 | "Forbidden with client authentication scheme anonymous" | Sandbox 不支持凭据认证 | 切换 Managed Identity | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/troubleshoot-runbook-execution-issues) |
| 10 | 依赖 MDAC/Fabric SDK 的 Cmdlet 失败 | Sandbox 不支持原生二进制 | 迁移 Hybrid Worker | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/troubleshoot-runbook-execution-issues) |
