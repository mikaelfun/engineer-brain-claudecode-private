# Automation Hybrid Worker — 综合排查指南

**条目数**: 6 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-hybrid-worker-tsg.md](../drafts/onenote-hybrid-worker-tsg.md), [onenote-extension-hybrid-worker.md](../drafts/onenote-extension-hybrid-worker.md)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 问题分类与信息收集
> 来源: [onenote-hybrid-worker-tsg.md](../drafts/onenote-hybrid-worker-tsg.md) — OneNote 一线 TSG

#### 必须收集的信息清单

| 信息项 | 获取方式 |
|--------|---------|
| Subscription ID | Azure Portal |
| Automation Account Name | Azure Portal |
| Automation Account ID | Kusto 查询（Step 2） |
| Hybrid Worker Group Name | Azure Portal → Automation Account → Hybrid Worker Groups |
| Machine Name / Machine ID | Kusto 查询（Step 3） |
| Job ID | Azure Portal → Jobs |
| Automation Account Region | Azure Portal |
| Agent 版本 (MMA/AMA) | Worker 机器上查看 |
| Worker 时区 | Worker 机器 |
| 关联的 Log Analytics Workspace | Azure Portal |

`[来源: OneNote TSG — 🟢 9/10 — 一线排查经验]`

**判断逻辑**：
| 症状 | 含义 | 后续动作 |
|------|------|---------|
| Runbook 访问 Storage 403 Forbidden | 网络隔离问题 | → Phase 2a |
| Set-AzStorageBlobContent "Illegal characters in path" | 配置文件缺失 | → Phase 2b |
| Linux Job 一直 Running 不结束 | CPUQuota 限制 | → Phase 2c |
| Worker 无心跳 / 注册失败 | 连接性问题 | → Phase 3 |
| 需要部署 Extension-based Worker | 部署指南 | → Phase 4 |

### Phase 2: 已知问题快速修复

#### Phase 2a: Storage Firewall 403 Forbidden
> 来源: [MCVKB/16.3](automation-004) — OneNote 一线经验

**症状**：Runbook 在 Hybrid Worker 或 Sandbox 上运行时，访问开启 Firewall 的 Storage Account 返回 403 Forbidden。即使添加了 Automation Service Tag IP 仍然报错。

**根因**：Automation Service Tag IP 范围仅用于访问 JRDS、Agent Service 或 Webhook，**不能**用于从 Runbook Job 访问 Storage。

**解决方案**：
1. 在 VM 上安装 Hybrid Worker
2. 在 Storage 防火墙中启用 Worker VNET 的 **Storage Service Endpoint**，或添加 Hybrid Worker IP 到 Storage 允许列表
3. 将 Runbook 调度到该 Hybrid Worker Group 执行

> **21V 注意**: Mooncake 环境需修改 `New-OnPremiseHybridWorker.ps1` 脚本中的环境参数

`[结论: 🟢 9/10 — OneNote 实战验证，Mooncake 明确适用]`

#### Phase 2b: "Illegal characters in path" 错误
> 来源: [MCVKB/16.4](automation-006) — OneNote 一线经验

**症状**：`Set-AzStorageBlobContent` 在 Hybrid Worker 上运行失败，报 "Illegal characters in path"，但路径本身正确。

**根因**：Hybrid Worker 上缺少 `Orchestrator.Sandbox.exe.config` 文件。已知问题：Azure PowerShell GitHub #8531。

**解决方案**：
在 Hybrid Worker 机器上以管理员身份运行 PowerShell 创建配置文件：

```powershell
# 在 Hybrid Worker 机器上执行
$configPath = "C:\Program Files\Microsoft Monitoring Agent\Agent\AzureAutomation\<version>\HybridAgent\Orchestrator.Sandbox.exe.config"
$configContent = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <runtime>
    <AppContextSwitchOverrides value="Switch.System.IO.UseLegacyPathHandling=false" />
  </runtime>
</configuration>
"@
Set-Content -Path $configPath -Value $configContent
```

> ⚠️ **注意**：Agent 自动更新后此配置文件可能被删除，需重新应用。

`[结论: 🟢 8.5/10 — OneNote 实战验证，对应 GitHub Issue 有记录]`

#### Phase 2c: Linux Job 卡在 Running 状态
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-fails-on-hybrid-worker) — 官方文档

**症状**：Linux Hybrid Runbook Worker 上的 Job 无限期卡在 "Running" 状态。

**根因**：`hwd` 服务的 systemd 配置中 `CPUQuota=25%`，过度限制了 Worker 进程。

**解决方案**：

```bash
# 编辑 hwd 服务配置
sudo vi /lib/systemd/system/hwd.service
# 将 CPUQuota=25% 改为 CPUQuota= （不限制）

# 重载并重启服务
sudo systemctl daemon-reload
sudo systemctl restart hwd.service
```

`[结论: 🟢 8/10 — MS Learn 官方文档]`

### Phase 3: Cloud 侧日志诊断（Kusto）
> 来源: [onenote-hybrid-worker-tsg.md](../drafts/onenote-hybrid-worker-tsg.md) — OneNote TSG

**Kusto 集群**: `https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn`
**数据库**: `oaasprodmc`
**权限**: 加入安全组 `Redmond\OaaSKustoGovUsers`（通过 IDweb）

> **21V**: 以上为 Mooncake 专用集群

#### Step 1: 查询 EtwAll 日志

```kusto
// 按 Job ID 查询所有相关日志
let JobID = "<job id>";
let StartTime = datetime(YYYY-MM-DD HH:MM:SS);
let EndTime = datetime(YYYY-MM-DD HH:MM:SS);
EtwAll
| where TIMESTAMP between (StartTime .. EndTime)
| where * contains JobID
| project TIMESTAMP, TaskName, EventMessage, Message
| limit 10000
```

#### Step 2: 获取 Automation Account ID

```kusto
let subId = "<Sub ID>";
let AccountName = "<Account name>";
EtwSubscriptionIdAccountNameAccountId
| where TIMESTAMP > ago(1d)
| where subscriptionId == subId
| where accountName == AccountName
| distinct accountId
```

#### Step 3: 查找 Hybrid Worker 机器名和 ID

```kusto
let START = ago(1d);
let END = now();
let AAID = "<account ID>";
let ROWLIMIT = 100;
JRDSEtwHybridWorkerPing
| where TIMESTAMP between (START .. END)
| where accountId == AAID
| limit ROWLIMIT
| project TIMESTAMP, workerGroup, machineId, machineName, workerVersion, SourceNamespace
```

#### Step 4: 确认 Hybrid Worker 心跳连续性

```kusto
let START = ago(1d);
let END = now();
let AAID = "<account ID>";
let WORKERGROUP = "<work group name>";
let MACHINEID = "<machine ID>";
let ROWLIMIT = 500;
JRDSEtwHybridWorkerPing
| where TIMESTAMP between (START .. END)
| where accountId == AAID
| where workerGroup == WORKERGROUP
| where machineId == MACHINEID
| limit ROWLIMIT
| project TIMESTAMP, workerGroup, machineId, machineName, workerVersion, SourceNamespace
| summarize event_count=count() by bin(TIMESTAMP, 30s)
| render timechart
```

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| 心跳连续且稳定 | Worker 连接正常，问题在 Job 层 | 检查 Runbook 脚本 / 模块 |
| 心跳有间断 | Worker 间歇性断连 | 检查网络连通性、Agent 状态 |
| 完全无心跳 | Worker 未注册或已断开 | → 检查 Agent 连通性 |

#### Step 5: Log Analytics Workspace 心跳验证

```kusto
Heartbeat
| where Computer == "<computer name>"
| where TimeGenerated >= ago(1d)
| where TimeGenerated <= now()
| summarize event_count=count() by bin(TimeGenerated, 1m)
| render timechart
```

`[结论: 🟢 9.5/10 — OneNote 一线 TSG，完整 Kusto 查询模板，Mooncake 专属]`

### Phase 3b: Agent 连通性问题
> 来源: [onenote-hybrid-worker-tsg.md](../drafts/onenote-hybrid-worker-tsg.md)

**触发条件**：Kusto 中 `JRDSEtwHybridWorkerPing` 无数据或 EtwAll 中有注册失败日志。

**排查方向**：
- [Agent Windows 连通性排查](https://docs.azure.cn/zh-cn/azure-monitor/platform/agent-windows-troubleshoot#connectivity-issues)
- [Hybrid Worker 网络规划](https://docs.azure.cn/zh-cn/automation/automation-hybrid-runbook-worker#network-planning)

**Windows 日志收集**：
运行 [Collect-AMALogs.ps1](https://www.powershellgallery.com/packages/Collect-AMALogs/1.0.0.2/Content/Collect-AMALogs.ps1)（管理员 PowerShell），输出 `C:\CaseLogs\Caselogs-xxxxxx.zip`

**Linux 日志收集**：
收集 `/home/nxautomation/run/worker.log`

**Linux 额外参考** `[来源: OneNote — 🔵 6/10]`：
- CSS Wiki: HT-Collect-Logs-from-Linux-VMs
- CSS Wiki: HT-Collect-common-OMS-Agent troubleshooting data
- MS Docs: azure-monitor/agents/agent-linux-troubleshoot
- GitHub: OMS_Linux_Agent_Log_Collector.md

### Phase 4: Extension-based Hybrid Worker 部署
> 来源: [onenote-extension-hybrid-worker.md](../drafts/onenote-extension-hybrid-worker.md) — OneNote 部署指南

**完整 PowerShell 部署脚本**：

```powershell
# 参数配置
$accountRG = "<AutomationAccountRG>"
$accountName = "<AutomationAccountName>"
$vmRG = "<VMRG>"
$vmName = "<VMName>"
$workerGroupName = "<WorkerGroupName>"

# 自动检测 OS 类型
$vm = Get-AzVM -ResourceGroupName $vmRG -Name $vmName
if ($vm.OSProfile.WindowsConfiguration -ne $null) {
    $extensionType = "HybridWorkerForWindows"
} elseif ($vm.OSProfile.LinuxConfiguration -ne $null) {
    $extensionType = "HybridWorkerForLinux"
}

# 获取 Automation Account Hybrid Service URL
$getParams = @{
    ResourceGroupName = $accountRG
    ResourceProviderName = 'Microsoft.Automation'
    ResourceType = 'automationAccounts'
    Name = $accountName
    ApiVersion = '2021-06-22'
    Method = 'GET'
}
$accountDetails = Invoke-AzRestMethod @getParams
$accountURL = ($accountDetails.Content | ConvertFrom-Json).properties.automationHybridServiceUrl

# 创建 Worker Group
New-AzAutomationHybridRunbookWorkerGroup -Name $workerGroupName `
    -ResourceGroupName $accountRG -AutomationAccountName $accountName

# 注册 Worker
$workerGuid = (New-Guid).Guid
$vmId = $vm.Id
$putPath = "/subscriptions/$($account.SubscriptionId)/resourceGroups/$accountRG/providers/Microsoft.Automation/automationAccounts/$accountName/hybridRunbookWorkerGroups/$workerGroupName/hybridRunbookWorkers/$workerGuid?api-version=2021-06-22"
$putParams = @{
    Path = $putPath
    Payload = "{'properties': {'vmResourceId': '$vmId'}}"
    Method = 'PUT'
}
Invoke-AzRestMethod @putParams

# 安装 VM Extension
$settings = @{ "AutomationAccountURL" = $accountURL }
Set-AzVMExtension -ResourceGroupName $vmRG `
    -Location $vm.Location `
    -VMName $vmName `
    -Name "HybridWorkerExtension" `
    -Publisher "Microsoft.Azure.Automation.HybridWorker" `
    -ExtensionType $extensionType `
    -TypeHandlerVersion 1.1 `
    -Settings $settings `
    -EnableAutomaticUpgrade $true
```

**要点**：
- API 版本：`2021-06-22`
- 自动检测 Windows/Linux 扩展类型
- 启用扩展自动升级
- 需要权限：`Get-AzVM`、`Invoke-AzRestMethod`、`Set-AzVMExtension`

> **21V 适用**: 确保使用正确的 AzureEnvironment

`[结论: 🟢 9/10 — OneNote 实战脚本，Mooncake 验证通过]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 访问带 Firewall 的 Storage 403 Forbidden | Service Tag IP 不用于 Job 级访问 | 部署 Hybrid Worker + Storage Endpoint | 🟢 9 — OneNote 实战 | [MCVKB/16.3] |
| 2 | Set-AzStorageBlobContent "Illegal characters in path" | 缺少 Orchestrator.Sandbox.exe.config | 创建配置文件（需 Agent 更新后重新应用） | 🟢 8.5 — OneNote+GitHub | [MCVKB/16.4] |
| 3 📋 | Hybrid Worker 问题排查 TSG | — | 见融合排查流程 Phase 3 (Kusto 诊断) | 🟢 9.5 — OneNote TSG | [onenote-hybrid-worker-tsg.md](../drafts/onenote-hybrid-worker-tsg.md) |
| 4 📋 | Extension-based Worker 部署 | — | 见融合排查流程 Phase 4 (部署脚本) | 🟢 9 — OneNote 指南 | [onenote-extension-hybrid-worker.md](../drafts/onenote-extension-hybrid-worker.md) |
| 5 | Linux 日志收集参考 | — | CSS Wiki + MS Docs + GitHub 多渠道 | 🔵 6 — OneNote 参考链接 | [POD Logs] |
| 6 | Linux Job 卡 Running 不结束 | hwd 服务 CPUQuota=25% | 修改 systemd 配置取消限制 | 🟢 8 — MS Learn 官方 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-fails-on-hybrid-worker) |
