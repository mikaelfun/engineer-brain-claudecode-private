# Automation Update Management (UMv1) — 排查速查

**来源数**: 10 | **21V**: 全部适用（核心条目明确 Mooncake chinaeast2 限制）
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Linux VM 不显示在 Update Management Dashboard，Windows VM 正常 | Linux 需通过 Automation Account 添加才能启用 UpdatesEnabled；Windows 用 MMA intelligence packs 无需此步骤 | 通过 Automation Account > Update Management 页面添加 Linux VM，等待 UpdatesEnabled 变为 True | 🟢 9 — OneNote 实证 | [MCVKB/UM Dashboard](../../known-issues.jsonl#automation-007) |
| 2 | Linux VM 从 UM 消失，Hybrid worker ping 停止，nxOMSAutomationWorker 目录缺失，重装 omsagent 无效 | CROND 服务被禁用。PerformRequiredConfigurationChecks.py 靠 cron 每 15 分钟触发，无 cron 则 worker manager 不启动 | `systemctl enable crond && systemctl start crond`，或手动运行 `sudo -u omsagent python /opt/microsoft/omsconfig/Scripts/PerformRequiredConfigurationChecks.py` | 🟢 9 — OneNote 实证（Case Study） | [MCVKB/UM cron issue](../../known-issues.jsonl#automation-015) |
| 3 | Linux VM 不在 UM schedule 预览中，IMDS 169.254.169.254 无响应，hybrid worker 进程未运行 | Proxy 配置阻断了对 IMDS 的直连。IMDS 不支持 proxy，必须直连 | 添加 `no_proxy=169.254.169.254` 到 proxy 配置，验证 IMDS 可达后检查 hybrid worker 进程 | 🟢 9 — OneNote 实证（Case Study） | [MCVKB/UM proxy issue](../../known-issues.jsonl#automation-016) |
| 4 | 非 chinaeast2 区域 VM（如 chinanorth、chinanorth3）无法从 Portal 加入 UMv1 | Mooncake 的 Update Management 仅在 chinaeast2 GA，其他区域 Portal UI 不可用 | 将 VM 关联到 chinaeast2 的 Log Analytics workspace，然后通过 chinaeast2 的 Automation Account > Update Management > Manage machines 添加 | 🟢 9 — OneNote 实证 | [MCVKB/UM regional](../../known-issues.jsonl#automation-019) |
| 5 | UM 在线排查脚本链接在 Mooncake 不可用 | Mooncake 环境不支持该排查脚本链接 | 使用 Azure Portal: VM > Updates > Troubleshoot 按钮，或运行离线脚本 | 🟢 9 — OneNote 实证 | [MCVKB/UM troubleshoot script](../../known-issues.jsonl#automation-025) |
| 6 📋 | 需要 Kusto 查询模板排查 UM（account ID、hybrid registration、heartbeat、job status） | — | 完整 KQL 查询见融合指南 | 🟢 8 — OneNote 指南草稿 | [MCVKB/Kusto UM](drafts/onenote-kusto-um-queries.md) |
| 7 | Win2008R2 SP1 上 UM 部署 job 返回 'failed to start'，Event 3712 报 System.Management.Automation 3.0.0.0 加载失败 | Win2008R2 默认 PowerShell 2.0，UM 最低要求 PowerShell 4.0 | 将 PowerShell 升级到 4.0 或更高版本 | 🔵 7.5 — ContentIdea KB 实证 | [KB4294062](https://support.microsoft.com/kb/4294062) |
| 8 | 需要强制卸载并重装 OMS Agent for Linux 的步骤 | — | 1) wget onboard_agent.sh 2) `sudo sh onboard_agent.sh --purge` 3) 清理残留目录 4) 重新 onboard 并加 `-d` 参数（非 public cloud） | 🔵 6.5 — ContentIdea KB 文档 | [KB4131455](https://support.microsoft.com/kb/4131455) |
| 9 | MMA 诊断：需要 Troubleshoot-WindowsUpdateAgentRegistration 脚本验证系统需求和连通性 | — | `Install-Script -Name Troubleshoot-WindowsUpdateAgentRegistration -Force` 然后运行并将输出发送给 Support 分析 | 🔵 6.5 — ContentIdea KB 文档 | [KB4470303](https://support.microsoft.com/kb/4470303) |
| 10 | 客户对 Log Analytics 数据用量计费有疑问，Usage 表默认保留 1 个月不够回溯 | Log Analytics Usage 表默认保留期太短，无法查看 2-3 个月前的数据 | 使用 KQL 查询 Log Analytics workspace 获取详细 data ingestion 信息，定位异常用量来源 | 🔵 6.5 — ContentIdea KB 文档 | [KB4091292](https://support.microsoft.com/kb/4091292) |

## 快速排查路径
1. **Linux VM 不显示** → 确认通过 Automation Account > Update Management 添加（非 Log Analytics 直接添加） `[来源: OneNote]`
2. **Linux VM 消失** → 检查 `systemctl status crond` → 如禁用则 enable + start `[来源: OneNote]`
3. **IMDS 不通** → 检查 proxy 配置 → 添加 `no_proxy=169.254.169.254` `[来源: OneNote]`
4. **非 chinaeast2 区域** → 关联 chinaeast2 的 Log Analytics workspace + Automation Account `[来源: OneNote]`
5. **排查脚本不可用** → Portal > VM > Updates > Troubleshoot 或离线脚本 `[来源: OneNote]`
6. **Win2008R2 部署失败** → 升级 PowerShell 到 4.0+ `[来源: ContentIdea KB]`
7. **OMS Agent 异常** → 强制卸载 `onboard_agent.sh --purge` + 重装 `[来源: ContentIdea KB]`
8. **Kusto 诊断** → 查 hybrid worker heartbeat / UM job status（见融合指南 KQL 模板） `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/update-management-v1.md#排查流程)
