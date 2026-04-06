# Automation Update Management (v1) — 综合排查指南

**条目数**: 10 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-kusto-um-queries.md](../drafts/onenote-kusto-um-queries.md)
**Kusto 引用**: 无（KQL 模板来自草稿，非 Kusto skill 目录）
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: VM 是否出现在 Update Management Dashboard
> 来源: [MCVKB/OneNote](../drafts/onenote-kusto-um-queries.md) + [MCVKB/OneNote — Case Study]

1. **确认 VM 操作系统类型**
   - Windows VM：使用 MMA agent intelligence packs，连接 Log Analytics workspace 后自动出现
   - Linux VM：需要通过 Automation Account > Update Management 手动添加

2. **检查 VM 的 UpdatesEnabled 状态**
   - Linux 必须经由 Automation Account > Update Management 页面添加后，`UpdatesEnabled` 才会变为 `True`
   - Windows 不需要此步骤

3. **Kusto 查询：获取 Automation Account ID**
   ```kusto
   // cluster: https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn
   // database: oaasprodmc
   let AutomationAccountName = "<accountName>";
   let subID = "<subscriptionId>";
   EtwSubscriptionIdAccountNameAccountId 
   | where subscriptionId == subID and accountName == AutomationAccountName 
   | distinct accountId, accountName
   | project accountName, accountId
   ```
   `[工具: Kusto — onenote-kusto-um-queries.md]`

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Linux VM 不在 Dashboard | 未通过 Automation Account 添加 | → Phase 2a |
| VM 在 Dashboard 但消失 | Hybrid Worker 停止或注册丢失 | → Phase 2b |
| VM 不在 Schedule deployment preview | 注册/代理问题 | → Phase 2b |
| 非 chinaeast2 区域 VM 无法 onboard | Mooncake 区域限制 | → Phase 2c |
| UM Job 失败 | 运行时错误 | → Phase 3 |

`[结论: 🟢 9/10 — OneNote 一线经验 + Kusto 查询模板交叉验证]`

### Phase 2a: Linux VM 不在 Dashboard
> 来源: [MCVKB/OneNote — Case Study]

**症状**：Linux VM 已连接 Log Analytics workspace，Windows VM 正常显示，但 Linux VM 不出现。

**根因**：Linux 的 Update Management 依赖 Hybrid Worker 组件，需要通过 Automation Account 注册。Windows 使用 MMA intelligence packs，不需要此步骤。

**修复**：通过 Automation Account > Update Management > Manage machines 添加 Linux VM。等待 `UpdatesEnabled` 变为 True。

`[结论: 🟢 9/10 — OneNote 一线实证]`

### Phase 2b: VM 消失 / Hybrid Worker 故障排查
> 来源: [MCVKB/OneNote — Case Study (cron)] + [MCVKB/OneNote — Case Study (proxy)]

**症状 1 — crond 被禁用**：
- Hybrid Worker ping 在 Kusto 中停止
- `UM_Linux_Troubleshooter_Offline.py` 报告 "Hybrid worker is not running"
- `nxOMSAutomationWorker` 模块目录丢失
- 重装 omsagent 和切换 UM 无效

**根因**：Linux VM 上的 `crond` 服务被禁用。`PerformRequiredConfigurationChecks.py`（每 15 分钟由 cron 触发，拉取 DSC 配置并安装/启动 nxOMSAutomationWorker）无法执行。

**修复**：
```bash
systemctl enable crond
systemctl start crond
# 或手动触发
sudo -u omsagent python /opt/microsoft/omsconfig/Scripts/PerformRequiredConfigurationChecks.py
```

> 💡 Tips：omsagent heartbeat 确认 agent 状态；Hybrid Worker heartbeat 确认 nxOMSAutomationWorker 状态；PerformRequiredConfigurationChecks 必须以 omsagent 用户运行。

**症状 2 — Proxy 阻止 IMDS**：
- VM 存在于 workspace 但 Hybrid Worker 进程（oms.conf/worker.conf）未运行
- IMDS endpoint `169.254.169.254` 无输出

**根因**：代理配置阻止了对 IMDS 的直接访问。IMDS 不支持代理，必须直连。

**修复**：
```bash
# 在代理配置中添加
no_proxy=169.254.169.254
```
验证：
```powershell
Invoke-RestMethod -Headers @{'Metadata'='true'} -Method GET -Uri http://169.254.169.254/metadata/instance?api-version=2020-09-01 | ConvertTo-Json
```

**Kusto 查询：Hybrid Worker 心跳检查**
```kusto
// cluster: https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn
// database: oaasprodmc
let aaid = "<accountId>";
let WorkerName = "<workerName>";
JRDSEtwHybridWorkerPing
| where TIMESTAMP > ago(1d)
| where isnotempty(aaid)
| where Environment == "PROD"
| where accountId == aaid
| where machineName contains WorkerName
| summarize count() by bin(TIMESTAMP, 1h), machineName, workerVersion
```
`[工具: Kusto — onenote-kusto-um-queries.md]`

**Kusto 查询：UM 注册验证**
```kusto
// cluster: https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn
// database: oaasprodmc
let AccoutID = "<accountId>";
EtwAll
| where TIMESTAMP > ago(1d)
| where EventMessage has "HybridRegistrationV2Controller"
| where EventMessage has "RegisterV2Async"
| where EventMessage has AccoutID
| where EventMessage contains "<vmName>"
| project TIMESTAMP, Level, EventMessage
```
`[工具: Kusto — onenote-kusto-um-queries.md]`

`[结论: 🟢 9.5/10 — OneNote 实际 Case 验证 + Kusto 查询工具双重支持]`

### Phase 2c: Mooncake 区域限制
> 来源: [MCVKB/OneNote — Feature Release]

**症状**：非 chinaeast2 区域 VM（如 chinanorth, chinanorth3）无法从 Portal 的 Add Azure VM / VM Updates 页面 onboard 到 Update Management。

**根因**：Update Management (AUMv1) 在 Mooncake 仅在 chinaeast2 区域 GA。其他区域的 Portal onboarding UI 不可用。

**修复**：
1. 将非 chinaeast2 的 VM 关联到 chinaeast2 区域的 Log Analytics workspace
2. 通过 chinaeast2 的 Automation Account > Update Management > Manage machines 注册 VM
3. VM 可跨区域通过 chinaeast2 的 Automation Account 管理

> ⚠️ **21V 限制**：此为 Mooncake 特有限制，Global Azure 支持更多区域。

`[结论: 🟢 9/10 — OneNote Mooncake 一线实证]`

### Phase 3: UM Job 执行故障
> 来源: [MCVKB/OneNote](../drafts/onenote-kusto-um-queries.md) + [KB4294062](https://support.microsoft.com/kb/4294062)

**Kusto 查询：UM Job 最终状态**
```kusto
// cluster: https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn
// database: oaasprodmc
let subId = "<subscriptionId>";
let AcctName = "<accountName>";
let endTime = datetime(...);
let startTime = datetime(...);
union EtwUpdateDeploymentMachineRun, EtwUpdateDeploymentRun
| where TIMESTAMP between (startTime .. endTime)
| where subscriptionId == subId and accountName == AcctName 
| extend SUCR_Parent_JobId = softwareUpdateConfigurationRunId
| extend SUCMR_Child_JobId = softwareUpdateConfigurationMachineRunId
| sort by SUCR_Parent_JobId, TIMESTAMP asc
| summarize arg_max(TIMESTAMP, *) by SUCR_Parent_JobId, SUCMR_Child_JobId
| project TIMESTAMP, softwareUpdateConfigurationName, status, SUCR_Parent_JobId, SUCMR_Child_JobId, targetComputerType, targetComputer
```
`[工具: Kusto — onenote-kusto-um-queries.md]`

**常见 Job 失败场景**：

| 错误/症状 | 根因 | 方案 |
|---------|------|------|
| `failed to start` + Event 3712 SandboxMainUnhandledException | Windows Server 2008 R2 SP1 自带 PS 2.0，UM 需要 PS 4.0+ | 升级到 PowerShell 4.0+ |
| Troubleshoot 脚本链接在 Mooncake 不可用 | Mooncake 不支持在线诊断链接 | 用 Portal VM > Updates > Troubleshoot，或离线脚本 |

`[结论: 🟢 8/10 — OneNote + ContentIdea KB 交叉验证]`

### Phase 4: 辅助工具与诊断

#### MMA 诊断脚本
> 来源: [KB4470303](https://support.microsoft.com/kb/4470303)

```powershell
Install-Script -Name Troubleshoot-WindowsUpdateAgentRegistration -Force
Troubleshoot-WindowsUpdateAgentRegistration | Out-File (Join-Path $env:TEMP Troubleshoot-WindowsUpdateAgentRegistration-output.txt)
```
将输出文件发送给 Microsoft Support 分析。需要 PowerShell 5+ 或 WMF 升级。

#### OMS Agent 强制重装（Linux）
> 来源: [KB4131455](https://support.microsoft.com/kb/4131455)

```bash
# 1. 下载脚本
wget https://raw.githubusercontent.com/Microsoft/OMS-Agent-for-Linux/master/installer/scripts/onboard_agent.sh
# 2. 清除
sudo sh onboard_agent.sh --purge
# 3. 清理残留（如有）
sudo rm -rf /etc/opt/microsoft/omsagent /var/opt/microsoft/omsagent
# 4. 重新 onboard（Mooncake 使用 -d 参数）
sudo sh onboard_agent.sh -w <workspaceid> -s <primarykey> -d opinsights.azure.cn
# 5. 验证
sudo -u omsagent python /opt/microsoft/omsconfig/Scripts/PerformRequiredConfigurationChecks.py
```

#### Log Analytics 数据用量查询
> 来源: [KB4091292](https://support.microsoft.com/kb/4091292)

客户对 Log Analytics 账单有疑问时，可使用 KQL 在 Log Analytics workspace 中查询详细数据摄取信息，识别异常用量来源。

`[结论: 🔵 6.5/10 — ContentIdea KB 单源，但工具脚本实用]`

---

## Kusto 集群参考

| 服务 | 集群 | 数据库 |
|------|------|--------|
| Automation (UM v1) | `https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn` | `oaasprodmc` |
| AUM v2 | `https://azupdatecentermc.chinaeast2.kusto.chinacloudapi.cn` | `azupdatecentermc` |

参考文档：
- TSG: https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-update-management-center/azure-update-management-center/tsg/v2/logskustoclusterdetails
- Jarvis: https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-update-management-center/azure-update-management-center/tsg/v2/logsqueryviagenevaportal

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Linux VM 不在 UM Dashboard | 未通过 Automation Account 添加 | Automation Account > Update Management 添加 | 🟢 9 — OneNote 实证 | [MCVKB/OneNote] |
| 2 | Linux VM 消失，crond 被禁用 | crond 停止导致 DSC 配置检查无法执行 | `systemctl enable crond && start crond` | 🟢 9.5 — OneNote Case | [MCVKB/OneNote — Case Study] |
| 3 | VM 消失，Proxy 阻止 IMDS | 代理阻止 169.254.169.254 直连 | 添加 `no_proxy=169.254.169.254` | 🟢 9.5 — OneNote Case | [MCVKB/OneNote — Case Study] |
| 4 | 非 chinaeast2 区域无法 onboard | Mooncake UM 仅 chinaeast2 GA | 跨区域绑定到 chinaeast2 workspace | 🟢 9 — OneNote 实证 | [MCVKB/OneNote] |
| 5 | 在线 Troubleshoot 脚本链接不可用 | Mooncake 不支持 | Portal Troubleshoot 或离线脚本 | 🟢 8 — OneNote | [MCVKB/OneNote] |
| 6 📋 | UM Kusto 查询模板（Account ID/心跳/Job 状态） | — | 完整 KQL 模板 | 🟢 9 — OneNote 指南 | [MCVKB/OneNote](../drafts/onenote-kusto-um-queries.md) |
| 7 | Log Analytics 账单详情查询 | Usage 表默认只保留 1 月 | KQL 查询数据摄取详情 | 🔵 6.5 — KB 单源 | [KB4091292](https://support.microsoft.com/kb/4091292) |
| 8 | OMS Agent 强制重装（Linux） | — | purge + onboard 脚本 | 🔵 6.5 — KB 单源 | [KB4131455](https://support.microsoft.com/kb/4131455) |
| 9 | UM Job failed to start, Event 3712 | Win 2008 R2 SP1 PS 2.0 不满足要求 | 升级 PowerShell 4.0+ | 🔵 6.5 — KB 单源 | [KB4294062](https://support.microsoft.com/kb/4294062) |
| 10 | MMA 诊断脚本 | — | `Troubleshoot-WindowsUpdateAgentRegistration` | 🔵 6 — KB 单源 | [KB4470303](https://support.microsoft.com/kb/4470303) |
