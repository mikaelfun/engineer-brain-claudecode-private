---
title: Disable Guest OS Firewall on Azure Windows VM
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/disable-guest-os-firewall-windows
product: vm
tags: [firewall, RDP, connectivity, workaround]
21vApplicable: true
---

# Disable Guest OS Firewall on Azure Windows VM

当怀疑 Guest OS 防火墙过滤了 VM 的部分或全部流量（尤其是导致 RDP 连接失败），可使用以下方法作为 workaround。

> **注意**：Microsoft 最佳实践是保持 Windows Firewall 启用。此为临时 workaround，最终应正确配置防火墙规则。

## Online Solutions（VM 在线时）

### Mitigation 1: Custom Script Extension / Run Command

通过 Azure 代理远程执行脚本：

**本地防火墙策略：**
'''powershell
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\SharedAccess\Parameters\FirewallPolicy\DomainProfile' -name "EnableFirewall" -Value 0
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\SharedAccess\Parameters\FirewallPolicy\PublicProfile' -name "EnableFirewall" -Value 0
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\SharedAccess\Parameters\FirewallPolicy\Standardprofile' -name "EnableFirewall" -Value 0
Restart-Service -Name mpssvc
'''

**AD 策略设置的防火墙（临时）：** 修改 HKLM:\SOFTWARE\Policies\Microsoft\WindowsFirewall 下相同键值。

### Mitigation 2: Remote PowerShell
从同 VNET 另一台 VM 通过 Enter-PSSession + netsh advfirewall set allprofiles state off。

### Mitigation 3: PSTools
使用 psexec 远程执行 netsh advfirewall set allprofiles state off。

### Mitigation 4: Remote Registry
通过 Remote Registry 修改 EnableFirewall 注册表项为 0，再通过 Remote Service Console 重启 mpssvc 服务。

## Offline Solutions（VM 完全不可达时）
1. 将 OS 磁盘附加到恢复 VM
2. 加载注册表 hive (BROKENSYSTEM / BROKENSOFTWARE)
3. 修改 EnableFirewall 为 0（ControlSet001 + ControlSet002）
4. 同时检查 AD 策略路径
5. Unload hive → 分离磁盘 → 重建 VM
