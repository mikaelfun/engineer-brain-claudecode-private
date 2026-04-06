# VM Windows RDP 连接与认证故障 — 排查速查

**来源数**: 15 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | RDP 失败: CredSSP encryption oracle remediation — "The function requested is not supported" | 2018 年 5 月累积更新 (CVE-2018-0886) 修改了 GP 默认值，补丁端+未补丁端 = RDP 被阻止 | (1) Console/Bastion 连接后装 KB4103712/KB4103715; (2) 临时用未打补丁的客户端; (3) 非生产环境设 AllowEncryptionOracle=2 | 🟢 9.5 — OneNote+MS Learn 交叉 | [MCVKB/VM+SCIM/.../4.2](onenote) + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/credssp-encryption-oracle-remediation) |
| 2 | RDP 失败: No Remote Desktop License Servers available — 120 天宽限期过期 | RD Server 角色许可宽限期过期，未配置 RD License Server | mstsc /admin 绕过许可连接；仅需 2 个并发会话则删除 RD Server 角色 | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-specific-rdp-errors) |
| 3 | RDP 失败: Remote Desktop can't find the computer — DNS 解析失败 | 客户端无法解析 VM DNS 名称，RDP 文件过期或代理阻断 HTTPS | 使用 Azure Portal 生成的 RDP 文件；检查代理；直接用公网 IP 连接 | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-specific-rdp-errors) |
| 4 | RDP 认证错误: The Local Security Authority cannot be contacted | VM 无法找到用户名中指定的安全机构，域控不可达 | 本地账户用 ComputerName\UserName 格式；域控不可达时用本地管理员 | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-specific-rdp-errors) |
| 5 | RDP 错误: Your credentials did not work — 提升为域控后 | VM 提升为 DC 后本地管理员账户被替换为域账户 | 使用域凭据 DOMAIN\Admin 登录，密码不变 | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-specific-rdp-errors) |
| 6 | RDP 错误: This computer can't connect — 用户无 RDP 登录权限 | 账户不在 Remote Desktop Users 或 Administrators 组 | 将用户添加到 Remote Desktop Users 本地组 | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-specific-rdp-errors) |
| 7 | RDP 错误: You must change your password before logging on the first time | 账户标记为首次登录必须改密码，RDP 不支持交互式改密 | Run Command: net user \<USER\> \*；或离线修复：挂载 OS disk 到修复 VM 重置密码 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/must-change-password) |
| 8 | RDP 超时/拒绝 — NSG 配置错误 | NSG 阻止 3389 端口：无 allow 规则、优先级冲突、子网/NIC 冲突、源 IP 限制 | Network Watcher IP Flow Verify；检查生效安全规则；添加 TCP 3389 Allow；生产用 Bastion | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-rdp-nsg-problem) |
| 9 | RDP 卡在 "Configuring remote session" — 无 RD License Server 可用 | RDSH 角色已装但无有效许可服务器，宽限期过期/CAL 不足 | Admin RDP 或 Serial Console；设置 LicensingMode=4；配置 SpecifiedLicenseServers；仅 ≤2 用户则删 RDSH | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-rdp-no-license-server) |
| 10 | TermService 不启动 — Event 7022: Remote Desktop Services hung on starting | TermService 停止/禁用/崩溃 | sc query TermService；Disabled→start=demand；Access Denied→ProcMon；Logon failure→重置 obj 为 NetworkService | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-remote-desktop-services-issues) |
| 11 | RDP 内部错误: An internal error has occurred — 卡在 Configuring Remote | MachineKeys 权限损坏、TLS 禁用、RDP 证书损坏/过期 | 检查 NSG；验证 3389 端口绑定；更新 RDP 证书；重置 MachineKeys 权限；启用 TLS；启用 NLA | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/Troubleshoot-rdp-internal-error) |
| 12 | RDP 登录 Access is denied — mstsc /admin 可以但普通 RDP 不行 | 证书注册表键缺少 Remote Desktop Users 的 Read 权限；用户配置文件加载失败；Kerberos token 过大 | 授予证书键 Read 权限；设 IgnoreRegUserConfigErrors=1；设 MaxTokenSize=65535 | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-rdp-access-denied) |
| 13 | RDP 频繁断连/间歇性断开 | RDP Listener 配置错误（常见于自定义镜像），安全/加密/保活/超时设置不当 | SecurityLayer=0, MinEncryptionLevel=1, KeepAliveTimeout=1, fReconnectSame=1, MaxIdleTime=0，重启 VM | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-rdp-intermittent-connectivity) |
| 14 | RDP 通用错误: Remote Desktop cannot connect — 远程访问未启用、VM 关机、不在网络上 | RDP 组件禁用：fDenyTSConnections=1, TSEnabled=0, drain mode, listener 禁用, logon 禁用, TermService 未运行 | Serial Console: fDenyTSConnections=0, TSEnabled=1, TSServerDrainMode=0, fEnableWinStation=1, fLogonDisabled=0，重启 | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-rdp-general-error) |
| 15 | CredSSP 错误 (重复) — 同 #1 | CredSSP 更新一侧装了另一侧没装 | 两侧都装更新；临时方案: REG ADD AllowEncryptionOracle=2；用 Serial Console 或 Remote PowerShell | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/credssp-encryption-oracle-remediation) |

## 快速排查路径
1. 确认 VM 是否运行中 + Boot Diagnostics 截图正常 `[来源: MS Learn]`
2. NSG 检查 → Network Watcher IP Flow Verify 确认 3389 入站 `[来源: MS Learn]`
3. 错误信息分类 `[来源: MS Learn]`
   - CredSSP → #1 (装补丁或临时绕过)
   - License → #2/#9 (mstsc /admin 或删 RDSH 角色)
   - DNS resolution → #3 (用 Portal RDP 文件)
   - Credentials/认证 → #4/#5/#6/#7
   - Internal error → #11 (证书+TLS+MachineKeys)
   - Access denied → #12 (证书键权限)
   - General / cannot connect → #14 (Serial Console 启用 RDP)
4. 间歇性断连 → 检查 Listener 配置 #13 `[来源: MS Learn]`
5. Service 问题 → sc query TermService 检查服务状态 #10 `[来源: MS Learn]`
