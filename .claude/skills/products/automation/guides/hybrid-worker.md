# Automation Hybrid Worker 部署与排查 — 排查速查

**来源数**: 6 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Runbook 访问启用 Firewall 的 Storage Account 时报 403 Forbidden，即使添加了 Automation 服务标签 IP | Automation 服务标签 IP 仅用于访问 JRDS/Agent/Webhook，不能用于从 Runbook 作业访问 Storage | 使用 Hybrid Worker：(1) 在 VM 上安装 HW (2) 在 HW VNET 启用 Storage Service Endpoint 或将 HW IP 加入 Storage 防火墙 (3) 在 HW Group 上调度 Runbook。Mooncake 需修改 New-OnPremiseHybridWorker.ps1 | 🟢 9 — OneNote 实证 | [MCVKB/16.3](MCVKB/VM+SCIM/======16.%20Automation======/16.3%20%20%5BAutomation%5D%20Connect%20an%20Azure%20Runbook%20to%20Sto.md) |
| 2 | Set-AzStorageBlobContent 在 HW 上报 'Illegal characters in path' | HW 上缺少 Orchestrator.Sandbox.exe.config 文件（Azure PowerShell GitHub #8531） | 在 HW 上创建 Orchestrator.Sandbox.exe.config，设置 AppContextSwitchOverrides: Switch.System.IO.UseLegacyPathHandling=false。注意：Agent 自动更新可能删除此配置，需重新应用 | 🟢 8.5 — OneNote 实证 | [MCVKB/16.4](MCVKB/VM+SCIM/======16.%20Automation======/16.4%20%5BAutomation%5D%20Some%20key%20learnings%20on%20Automation.md) |
| 3 📋 | 需要排查 Hybrid Worker 相关问题的通用 TSG | — | 详见融合指南: guides/drafts/onenote-hybrid-worker-tsg.md（含 Kusto 云端日志查询、客户端日志采集、Jarvis 排查） | 🟢 9 — OneNote 指南(guide-draft) | [MCVKB/16.5](MCVKB/VM+SCIM/======16.%20Automation======/16.5%20%5BTSG%5D%20Information%20collection%20to%20troubleshoot.md) |
| 4 📋 | 需要配置 Extension-based Hybrid Runbook Worker | — | 详见融合指南: guides/drafts/onenote-extension-hybrid-worker.md（含完整 PowerShell 脚本） | 🟢 9.5 — OneNote+多条目交叉验证 | [MCVKB/HW Extension](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/%23%23%20Troubleshooting/Hybrid%20worker) |
| 5 | Linux HW 日志采集参考 | — | CSS Wiki: HT-Collect-Logs-from-Linux-VMs, HT-Collect-common-OMS-Agent。MS Docs: azure-monitor/agents/agent-linux-troubleshoot。GitHub: OMS_Linux_Agent_Log_Collector.md | 🔵 7.5 — OneNote 参考文档 | [MCVKB/Logs](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/%23%23%20Troubleshooting/Logs.md) |
| 6 | Linux HW 作业一直卡在 'Running' 状态 | hwd 服务的 systemd 配置了 CPUQuota=25%，过度限制了 Worker 进程 | 编辑 `/lib/systemd/system/hwd.service`，将 `CPUQuota=25%` 改为 `CPUQuota=`（不限制），然后 `systemctl daemon-reload && systemctl restart hwd.service` | 🟢 8 — MS Learn+OneNote 交叉 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/automation/runbooks/runbook-fails-on-hybrid-worker) |

## 快速排查路径

1. **确认 HW 类型** → Agent-based（旧版 MMA/OMS）还是 Extension-based（新版 VM Extension）？ `[来源: OneNote]`
2. **Extension-based 部署** → 使用 PowerShell 脚本配置，详见 onenote-extension-hybrid-worker.md `[来源: OneNote]`
3. **HW 注册/心跳检查** → Kusto 查 HybridWorkerHeartbeat 表确认 Worker 在线 `[来源: OneNote TSG]`
4. **如果作业 403 访问 Storage** → 沙箱 IP 不适用，需 HW + Service Endpoint/IP 白名单 `[来源: OneNote]`
5. **如果路径错误(Illegal characters)** → 检查 Orchestrator.Sandbox.exe.config 是否存在 `[来源: OneNote]`
6. **如果 Linux HW 作业卡住** → 检查 `systemctl show hwd.service -p CPUQuota`，移除 25% 限制 `[来源: MS Learn]`
7. **日志采集** → Windows: Event Viewer + `C:\Packages\Plugins\`；Linux: `/var/opt/microsoft/omsagent/` + OMS Log Collector `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/hybrid-worker.md#排查流程)
