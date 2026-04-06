# VM Windows Guest Agent 连接与启动故障 — 排查速查

**来源数**: 15 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | PowerShell 创建的 VM 无 Guest Agent — 备份失败 | Set-AzureRmVMOperatingSystem 缺少 -ProvisionVMAgent 参数 | 添加 -ProvisionVMAgent 参数重新创建 VM | 🟢 9 — OneNote 实证 | [MCVKB/VM+SCIM/.../2.3](onenote) |
| 2 | WindowsAzureGuestAgent 服务未安装 — TransparentInstaller.log: exit code 1639 | WinGA MSI v2.7.41491.1024 的 sc.exe create 命令语法 bug（等号后缺空格） | 卸载 WinGA，安装 v2.7.41491.1010 (GitHub)，自动升级到 .1024 成功 | 🟢 9 — OneNote 实证 | [MCVKB/.../9.7 Guest Agent Known Issues](onenote) |
| 3 | WinGA MSI 安装失败: Object doesnt support this property or method: Me.Script | Kaspersky 杀毒 (Kavfswp.exe) 干扰 .wsf/.vbs 脚本 | 安装前移除 Kaspersky，完成后重装 | 🟢 9 — OneNote 实证 | [MCVKB/.../9.7 Guest Agent Known Issues](onenote) |
| 4 | Guest Agent 卡在启动中 — WaAppAgent.log 显示旧版本号；存在多个 GuestAgent 文件夹 | 多个 WinGA 版本同时安装导致版本冲突 | 从添加删除程序卸载，停止服务，移走旧文件夹，msiexec /I /quiet 安装最新 MSI | 🟢 9 — OneNote 实证 | [MCVKB/.../9.7 Guest Agent Known Issues](onenote) |
| 5 | Guest Agent 503 Server Unavailable — GetVersions() failed, WebException | WireServer (168.63.129.16) 不可达：防火墙、代理或网络配置错误 | 测试 http://168.63.129.16/?comp=versions；检查 DHCP/DNS、防火墙/代理规则；收集网络跟踪 | 🟢 9.5 — OneNote+MS Learn 交叉 | [MCVKB/.../9.7](onenote) + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-azure-guest-agent) |
| 6 | Guest Agent: Unable to connect to remote server — SocketException 127.0.0.1:8888 | machine.config 有代理设置覆盖 GuestAgent WebClient，重定向到本地代理 | 移除 machine.config 中的代理配置；或升级 WinGA ≥ 2.7.41491.992（绕过 machine.config） | 🟢 9.5 — OneNote+MS Learn 交叉 | [MCVKB/.../9.7](onenote) + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-azure-guest-agent) |
| 7 | Guest Agent 显示 Not Ready — 扩展执行失败 | Guest OS 内 CPU/内存过高导致 GA hang 无法响应 | 检查 VM 性能指标；用 IID 和 WinGuestAnalyzer；检查 WaAppAgent.log 和 TransparentInstaller.log | 🔵 7 — OneNote 单源 | [MCVKB/POD/.../Case Study](onenote) |
| 8 | 大量 "Windows Azure CRP Certificate Generator" 证书堆积（MMC Personal store） | 每次停止/启动 VM 时 Tenant 用新 DeploymentID 重建，生成新 CRP 证书，旧证书不自动清理 | 删除旧证书保留最新；未来 GA 版本有自动清理（PR 2239105） | 🟢 8.5 — ADO Wiki 实证 | [ADO Wiki — CRP Certificate_AGEX](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FGA%2FCRP%20Certificate_AGEX) |
| 9 | VM Guest Agent 无法与 Azure 平台通信 — 扩展失败、显示 Not Ready、无法访问 WireServer 168.63.129.16:80/32526 | 防火墙/代理/安全软件/网络配置（如单 NIC 多 IP）阻断 VM 到 WireServer 的连接 | (1) Test-NetConnection 168.63.129.16 -Port 80/32526; (2) 检查本地防火墙/代理/安全软件; (3) 多 IP 见专项 TSG; (4) Kusto heartbeat: cluster('AzCore.centralus').database('Fa').WireserverHeartbeatEtwTable | 🟢 9 — ADO Wiki+MS Learn 交叉 | [ADO Wiki — WireServer TSG](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Agents%20%26%20Extensions%20(AGEX)/How%20Tos/GA/WireServer%20Troubleshooting_AGEX) |
| 10 | 自定义镜像 VM Guest Agent 不自动升级 | 非 Marketplace 的自定义 VM 不从 Marketplace 通道自动升级 GA | 验证 ProvisionVMAgent=True + EnableAutomaticUpdates=True; 确保无防火墙阻断 Azure Storage; 手动下载最新 MSI | 🟢 8.5 — ADO Wiki 实证 | [ADO Wiki — Manually Upgrade VMAgent](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FGA%2FManually%20Upgrade%20VMAgent%20on%20CustomVMs_AGEX) |
| 11 | Guest Agent Not Ready — VMAgentStatusCommunicationError — 多种根因 | WireServer 被防火墙/代理阻断、DHCP 禁用、Npcap 适配器、CNG Key Isolation 停止、machine.config 损坏、WCF profiling | Checklist: VM started → agent status → services running → WireServer 80/32526 → WaAppAgent.log；Fixes: enable DHCP, start KeyIso, disable Npcap, Enable64Bit=1, copy working machine.config | 🟢 8 — MS Learn 综合 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-azure-guest-agent) |
| 12 | Guest Agent 卡在 Stopping — NullReferenceException at GoalStateExecutorBase.WaitForExtensionWorkflowComplete | GA 关闭时扩展 workflow 未完成导致 hang | A: 重启 RdAgent 等 5min 后 kill WindowsAzureGuest.exe; B: 卸载重装最新 GA (GitHub) | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-azure-guest-agent) |
| 13 | Guest Agent MSI 安装失败 — Error 1722 CA2, 设置 RdAgent service path in registry failed | WMI StdRegProv 不工作，GA MSI 依赖 WMI 注册表访问 | 测试: wmic StdRegProv GetDWORDValue; 修复: winmgmt /salvagerepository 或 /resetrepository; 重试 MSI | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-azure-guest-agent) |
| 14 | WindowsAzureGuestAgent.exe 启动崩溃 — ConfigurationErrorsException, Event 1026 | machine.config 丢失/损坏或有 WCF profiling entries (ServiceModelSink.Behavior) | 移除 machine.config 中的 ServiceModelSink 条目；或从正常 VM 拷贝 machine.config | 🟢 9 — OneNote+MS Learn 交叉 | [MCVKB/.../9.7](onenote) + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-azure-guest-agent) |
| 15 | Guest Agent PFXImportCertStore failed — null handle, Error Code 86 — 扩展不工作 | SYSTEM 账户缺少 Crypto 文件夹的 Full Control 权限 | 对 C:\ProgramData\Microsoft\Crypto\Keys, \RSA, \SystemKeys 赋予 SYSTEM Full Control；重启服务 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-azure-guest-agent) |

## 快速排查路径
1. 确认 GA 是否安装 `[来源: OneNote]`
   - 未安装 (PS 创建 VM) → #1
   - MSI 安装失败 → #2/#3/#13
   - 多版本冲突 → #4
2. 确认 GA 服务状态 `[来源: MS Learn]`
   - Not Ready → #11 综合 checklist
   - Stopping 状态 → #12
   - 崩溃 (Event 1026) → #14 (machine.config)
3. WireServer 连通性检查 `[来源: OneNote + ADO Wiki + MS Learn]`
   - Test-NetConnection 168.63.129.16 -Port 80 → 失败 → #5/#9
   - SocketException 127.0.0.1 → #6 (machine.config 代理)
   - 检查防火墙/代理/安全软件 → #9
4. 其他问题 `[来源: ADO Wiki + MS Learn]`
   - 证书堆积 → #8
   - 自定义镜像不升级 → #10
   - 高 CPU/内存 → #7
   - PFXImportCertStore 失败 → #15 (Crypto 权限)

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-guest-agent-win.md#排查流程)
