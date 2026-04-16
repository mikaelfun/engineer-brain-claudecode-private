# Disk Azure Stack Edge: Networking — 排查工作流

**来源草稿**: [ado-wiki-a-changing-network-interface-mtu-value.md], [ado-wiki-a-using-az-stackedge-cmdlets.md], [ado-wiki-ase-elevated-support-session.md]
**Kusto 引用**: 无
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: 修改网络接口 MTU 值
> 来源: ado-wiki-a-changing-network-interface-mtu-value.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 进入 ASE Support Session
2. 查看当前接口信息
   ```powershell
   Get-HcsNetInterface
   ```
3. 修改 MTU
   ```powershell
   Set-HcsNetInterface -InterfaceAlias <Port#> -MTU <mtu value>
   ```
4. 验证修改: 再次运行 `Get-HcsNetInterface`
   `[来源: ado-wiki-a-changing-network-interface-mtu-value.md]`

---

## Scenario 2: 进入 ASE 提升的 Support Session
> 来源: ado-wiki-ase-elevated-support-session.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 以管理员身份连接 PowerShell
   ```powershell
   winrm quickconfig
   $ip = "<device_ip>"
   Set-Item WSMan:\localhost\Client\TrustedHosts $ip -Concatenate -Force
   Enter-PSSession -ComputerName $ip -Credential $ip\EdgeUser -ConfigurationName Minishell
   ```
2. 启用支持访问: `Enable-HcsSupportAccess` → 复制生成的密钥
3. 使用 Support Password Decrypter 解密
4. 关闭当前窗口，新窗口连接 Support Session
   ```powershell
   Enter-PSSession -ComputerName $ip -Credential $ip\EdgeSupport -ConfigurationName SupportSession
   ```
   `[来源: ado-wiki-ase-elevated-support-session.md]`

---

## Scenario 3: 配置 Az.StackEdge PowerShell 模块
> 来源: ado-wiki-a-using-az-stackedge-cmdlets.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 安装 Azure Az PowerShell 模块
2. 连接 Azure: `Connect-AzAccount`
3. 确认订阅: `Get-AzContext` / `Set-AzContext -Subscription "<sub-id>"`
4. 安装模块: `Install-Module -Name Az.StackEdge`
   `[来源: ado-wiki-a-using-az-stackedge-cmdlets.md]`
