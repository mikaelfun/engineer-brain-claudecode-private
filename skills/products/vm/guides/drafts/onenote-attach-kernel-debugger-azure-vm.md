# Attach Kernel Debugger to Azure VM

**Source**: Mooncake POD Support Notebook > VMSCIM > VM > Tools > Attach Kernel Debugger

## Overview

使用 WinDbgX 远程内核调试 Azure VM 的步骤，通过 KDNET（网络内核调试）实现。

## 步骤一：配置 Azure VM

1. 为 VM 分配公共 IP 地址
2. 配置 NSG 入站规则：
   - **Rule 1 (Debugger)**: 端口 50001, 协议 Any, 允许入站
   - **Rule 2 (RDP)**: 端口 3389, 协议 Any, 允许入站
3. RDP 连接到 VM，以管理员身份运行：
   ```cmd
   bcdedit /debug on
   bcdedit /dbgsettings net hostip:127.0.0.1 port:50001 /noumex
   ```
   > ⚠️ 记下生成的 key，后续连接需要使用
4. 在 Windows Firewall 开放端口 50001（或关闭防火墙）
5. 重启 VM

## 步骤二：配置本地调试机

1. 连接 CORPNET VPN（用于安装 WinDbgX 和下载 symbols）
2. 安装 WinDbgX（参考 [OSG Wiki](https://www.osgwiki.com/wiki/WinDbgNext#Install_WinDbgNext)）
3. 打开 WinDbgX → File → Start Debugging → Attach to Kernel
   - 输入 port: 50001
   - 输入 key（步骤一生成的）
   - 输入 VM 公共 IP
   - 点击 OK
4. 连接成功后运行 `!cn` 验证连接到正确的计算机

## 参考链接

- ADO Wiki: https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1136972/Attach-Kernel-Debugger-to-Azure-VM
- [Kernel Debugging with KDNET (internal)](https://www.osgwiki.com/wiki/Kernel_Debugging_with_KDNET)
