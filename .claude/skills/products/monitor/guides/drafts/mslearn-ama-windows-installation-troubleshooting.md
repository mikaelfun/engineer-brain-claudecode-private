---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-prepare-troubleshooting
importDate: "2026-04-21"
type: guide-draft
---

# AMA Windows Installation Troubleshooting Guide

综合排查 Azure Monitor Agent (AMA) 在 Windows VM 上安装失败的完整流程。

## 前置检查 (Prepare)

1. **确认 OS 支持**: VM Overview > Operating system，核对 AMA 支持的 Windows 版本列表
2. **区分问题类型**: 安装 vs 配置
   - 安装问题: AzureMonitorWindowsAgent 扩展状态非 Provisioning Succeeded
   - 配置问题: 扩展成功但数据不采集
3. **检查 AMA 进程**: Task Manager > Processes，确认以下进程运行中:
   - AMAExtHealthMonitor
   - MonAgentHost
   - MonAgentLauncher
   - MonAgentManager
4. **确认 DCR 关联**: Azure Monitor > Data Collection Rules，确保至少一个 DCR 关联到该 VM

## 详细排查步骤 (Detailed)

### Step 1: VM 必须运行中
Portal > VM > Overview > Status = Running

### Step 2: 验证 Managed Identity
VM > Security > Identity，确认 SystemAssigned 或 UserAssigned 存在。
- 启用 System-Assigned: Identity > System assigned > Status = On > Save
- 需要 Virtual Machine Contributor + Managed Identity Operator 角色

### Step 3: 验证扩展存在
VM > Extensions + applications，查找 Microsoft.Azure.Monitor.AzureMonitorWindowsAgent
- 不存在: Add > 搜索 AzureMonitorWindowsAgent > 安装
- 状态非 Succeeded: 继续排查

### Step 4: VM Guest Agent 运行状态
PowerShell: `Get-Service WindowsAzureGuestAgent`

### Step 5: Guest Agent 是否下载扩展二进制
- 检查 Boot Diagnostics > Serial log
- 重启 Guest Agent: `net stop/start WindowsAzureGuestAgent`

### Step 6: 扩展安装和启用
- 日志路径: `C:\WindowsAzure\Logs\WaAppAgent.log`
- 关键日志模式:
  - Plugin environment setup
  - Plugin installation with launch command
  - Installation results Code: 0
- 命令执行日志: `C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\CommandExecution*.log`

## 高级排查 (Advanced)

### IMDS 连通性测试
```cmd
curl -H Metadata:true --noproxy "*" "http://169.254.169.254/metadata/instance?api-version=2021-01-01"
```

### Handler 连通性测试
```cmd
curl -H Metadata:true --noproxy "*" "http://169.254.169.254/metadata/instance/compute/resourceId?api-version=2021-01-01"
```

### 网络追踪
使用 Wireshark/Fiddler 抓包，分析连接到 global.handler.control.monitor.azure.com 的流量。
