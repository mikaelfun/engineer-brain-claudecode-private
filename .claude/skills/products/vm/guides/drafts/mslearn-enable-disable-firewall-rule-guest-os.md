---
title: Enable or Disable Firewall Rule on Azure VM Guest OS
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/enable-disable-firewall-rule-guest-os
product: vm
date: 2026-04-18
type: procedures-guide
relatedEntries: vm-mslearn-057
---

# Enable or Disable Firewall Rule on Azure VM Guest OS

Guest OS 防火墙过滤流量导致 RDP 或其他连接失败时的多种修复方法。

## 场景

VM Guest OS 防火墙规则（如 RDP 规则）被禁用或配置不当，导致连接失败。以下方法按在线/离线分类，适用于 RDP 和其他端口规则。

## 在线方法（VM 可通过其他方式访问）

### 方法 1: Custom Script Extension

通过 Azure Portal 上传脚本执行：

```cmd
# 启用规则
netsh advfirewall firewall set rule dir=in name="Remote Desktop - User Mode (TCP-In)" new enable=yes

# 禁用规则
netsh advfirewall firewall set rule dir=in name="Remote Desktop - User Mode (TCP-In)" new enable=no
```

### 方法 2: Remote PowerShell

从同 VNet 的另一台 VM 执行：

```powershell
Enter-PSSession (New-PSSession -ComputerName "<HOSTNAME>" -Credential (Get-Credential) -SessionOption (New-PSSessionOption -SkipCACheck -SkipCNCheck))
Enable-NetFirewallRule -DisplayName "RemoteDesktop-UserMode-In-TCP"
exit
```

### 方法 3: PSTools (PsExec)

从同 VNet 的另一台 VM 使用 PSTools：

```cmd
psexec \<DIP> -u <username> cmd
netsh advfirewall firewall set rule dir=in name="Remote Desktop - User Mode (TCP-In)" new enable=yes
```

### 方法 4: Remote Registry

从同 VNet 的另一台 VM 使用注册表编辑器连接：

- 路径: HKLM\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\FirewallRules\RemoteDesktop-UserMode-In-TCP
- 修改 Active=FALSE 为 Active=TRUE（启用）或反之（禁用）

## 离线方法（VM 完全不可访问）

1. 快照 OS 磁盘备份
2. 将 OS 磁盘挂载到恢复 VM
3. 加载注册表 hive：reg load HKLM\BROKENSYSTEM <drive>:\windows\system32\config\SYSTEM
4. 查找 ControlSet（Select\Current 值）
5. 修改 FirewallRules 注册表值中的 Active 字段
6. 卸载 hive，分离磁盘，重建 VM

## 关键注册表路径

```
HKLM\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\FirewallRules\RemoteDesktop-UserMode-In-TCP
```

值格式示例：
```
v2.22|Action=Allow|Active=TRUE|Dir=In|Protocol=6|Profile=Domain|Profile=Private|Profile=Public|LPort=3389|App=%SystemRoot%\system32\svchost.exe|Svc=termservice|Name=@FirewallAPI.dll,-28775|...
```
