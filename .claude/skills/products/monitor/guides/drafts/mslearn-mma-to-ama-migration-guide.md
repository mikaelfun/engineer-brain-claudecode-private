---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/migration/best-practices-migrating-from-log-analytics-agent
importDate: "2026-04-21"
type: guide-draft
---

# MMA to AMA Migration Guide

从 Log Analytics Agent (MMA/OMS) 迁移到 Azure Monitor Agent (AMA) 的完整指南。

## 背景

- MMA 已弃用，2024-08-31 后不再支持
- 2024-01-01 后上线的新 Data Center 不支持 MMA
- AMA 使用 Data Collection Rules (DCR) 替代旧的 workspace-level 配置

## Step 1: 规划迁移

### 使用 Migration Helper Workbook
1. Azure Portal > Monitor > Workbooks > AMA Migration Helper
2. Subscriptions Overview: 查看订阅数、workspace 数、VM 数
3. Migration Status: 按资源类型 (VM / VMSS / Arc-Enabled Servers) 查看迁移状态
   - Not Started: 仅 MMA/OMS
   - In Progress: MMA + AMA 并存
   - Completed: 仅 AMA

### 非 Azure VM 前提条件
- 必须先安装 Azure Arc Connected Machine agent
- 将非 Azure VM 注册到 Azure 订阅

## Step 2: 记录当前配置

### 检查数据采集配置
Log Analytics workspace > Classic > Legacy agents management:
- Windows event logs
- Windows performance counters
- Linux performance counters
- Syslog
- IIS Logs

### 检查 Legacy Solutions

| Solution | 迁移路径 |
|----------|----------|
| SCOM | 继续用 MMA 管理 SCOM agent，AMA 单独安装 |
| Change Tracking | 迁移到当前版本 (使用 AMA) |
| Update Management | 迁移到当前版本 (使用 AMA) |
| Azure Security Center | 启用 AMA 数据采集选项，禁用 MMA |
| Hybrid Runbook Worker | 继续用 MMA，AMA 并行安装 |
| Microsoft Sentinel | 安装 AMA，配置数据源和 connector，移除 MMA |

### 使用 Workbook 分析 Solutions
Monitor > Workbooks > AMA Migration Helper > Workspaces tab > Solutions tab
