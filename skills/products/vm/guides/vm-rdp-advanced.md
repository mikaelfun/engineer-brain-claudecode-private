# VM Windows RDP 高级问题（NIC/安全模式/暴力破解） — 排查速查

**来源数**: 12 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Citrix VM RDP 失败 — Remote Desktop license server error + license store creation access denied | Citrix XenApp 用 ICA 协议消耗 RD 许可，MSLicensing 注册表键缺 Everyone Full Control | 设 LicensingMode=4；配置 SpecifiedLicenseServers；赋予 Everyone 对 HKLM:\Software\Microsoft\MSLicensing 的 Full Control；重启 | 🟢 9 — OneNote 实证 | [MCVKB/POD/.../5.3-RDP citrix VM](onenote) |
| 2 | 禁用默认 NIC 或手动设置静态 IP 后无法 RDP | 禁用 NIC 或设错误静态 IP 导致网络中断 | az vm repair reset-nic 重置 NIC；恢复后从设备管理器删除 ghost NIC | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/reset-network-interface) |
| 3 | 停止/启动 VM 后出现大量 ghost Mellanox/Hyper-V 网卡（500+），导致连接异常 | 加速网络 by design：VM 迁移到新物理主机后 MAC 变化产生 ghost NIC | 设备管理器显示隐藏设备 → 删除灰色 Hyper-V Network Adapters；或 RunCommand 脚本清理；定期执行 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-vm-ghostednic-troubleshooting) |
| 4 📋 | RDP 认证错误: NLA 无法执行 / LSA 不可达 / This computer cannot connect | NLA 阻止 RDP：AD 安全通道断裂、计算机密码过期、DC 不健康、加密级别过高、TLS 禁用、FIPS | 见融合指南 guides/drafts/mslearn-rdp-authentication-errors.md | 🔵 7 — MS Learn 指南 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/cannot-connect-rdp-azure-vm) |
| 5 | 多 IP 配置后 VM 丢失 Internet | Windows 选最小数值 IP 为主，但只有 Portal 设定的主 IP 能上网 | Set-NetIPAddress -IPAddress primaryIP -SkipAsSource $false; secondaryIPs -SkipAsSource $true | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/no-internet-access-multi-ip) |
| 6 | Netlogon 服务挂起/失败 (Event 7022/7001/7023) 导致 RDP 无法连接 | Netlogon 禁用、挂起或 Workstation 服务依赖失败 | Serial Console: sc query/start NETLOGON；Disabled→sc config start=auto；先修依赖服务 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/azure-vm-netlogon-not-starting) |
| 7 | NSI 服务挂起/失败 (Event 7022/7001/7000) — DHCP 级联故障导致全网络中断 | NSI 服务禁用、挂起或账户不匹配，核心网络服务故障级联 | Serial Console: sc query/start NSI；Disabled→sc config start=auto；先修依赖服务 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/azure-vm-nsi-not-starting) |
| 8 | RDP 失败 — RD Connection Broker 角色 (Event 2056/1296) | RD Connection Broker 服务器主机名在 farm 建立后被更改，WID 数据库条目失配 | 重新安装 RD Connection Broker 角色和 WID。建立 RD farm 后不支持改主机名 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/event-id-troubleshoot-vm-rdp-connecton) |
| 9 | Boot Diagnostics 正常但 RDP 失败 — Guest OS 中配置了与 Azure 不同的静态 IP | Guest OS 内手动配置了与 Azure DHCP 分配不同的静态 IP | Serial Console: netsh interface ip set address name="\<NIC\>" source=dhcp；无需重启 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-rdp-static-ip) |
| 10 | VM 运行但完全不可达 — Guest OS 内 NIC 被禁用 | Guest OS 内网络接口被禁用 | Serial Console: netsh interface set interface name="\<NIC\>" admin=enabled；或 Portal reset-network-interface | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-rdp-nic-disabled) |
| 11 | VM 启动进入安全模式 — 无法 RDP | BCD 中 safeboot 标志被设置，安全模式下 RDP 和网络服务不启动 | Serial Console: bcdedit /deletevalue {current} safeboot, restart；离线：挂修复 VM 执行 bcdedit | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-rdp-safe-mode) |
| 12 | Guest OS 防火墙 BlockInboundAlways — RDP 被拒 | 防火墙入站策略设为 BlockInboundAlways 忽略所有 allow 规则 | Serial Console: netsh advfirewall set allprofiles firewallpolicy blockinbound,allowoutbound；启用 RDP 规则 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/guest-os-firewall-blocking-inbound-traffic) |

## 快速排查路径
1. 确认 VM 状态 + Boot Diagnostics `[来源: MS Learn]`
   - 登录界面正常但 RDP 超时 → 网络层问题 (#2/#9/#10)
   - 安全模式画面 → #11 (BCD safeboot)
2. 网络层检查 `[来源: MS Learn]`
   - Guest OS NIC 禁用 → Serial Console 启用 (#10)
   - 静态 IP 不匹配 → Serial Console 恢复 DHCP (#9)
   - NIC 被禁用或设错 → az vm repair reset-nic (#2)
   - Ghost NIC 过多 → 设备管理器清理 (#3)
   - 多 IP 配置 → SkipAsSource 设置 (#5)
3. 服务层检查 `[来源: MS Learn]`
   - Netlogon 故障 → #6
   - NSI 故障 → #7
   - RD Connection Broker → #8
4. 安全/认证层 `[来源: MS Learn]`
   - NLA 相关错误 → #4 融合指南
   - Citrix 许可 → #1
   - 防火墙 BlockInboundAlways → #12

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-rdp-advanced.md#排查流程)
