# 使用 ASI 排查 ACI 问题

> 来源：ADO Wiki `/Azure Kubernetes Service Wiki/ACI/ACI Troubleshooting with ASI`
> 提取时间：2026-04-04

## ASI 简介

**Azure Service Insights (ASI)**：https://azureserviceinsights.trafficmanager.net/
- 数据源：Kusto
- 适用：ACI 问题快速诊断
- **新资源需等待 15 分钟数据摄入后才可搜索**

## 搜索 ACI 资源

### 主搜索表

| 表名 | 保留期 |
|------|--------|
| `SubscriptionDeployments` | **120 天** |

> ⚠️ 超过 120 天的历史数据无法通过 ASI 查询。

### Container Group 搜索

支持以下方式：
1. **完整 Resource ID**：
   ```
   /subscriptions/<sub-id>/resourceGroups/<RG>/providers/Microsoft.ContainerInstance/containerGroups/<CG>
   ```
2. **CG Name**（会出现匹配列表）
3. **FQDN**（仅限 Public CG，FQDN 全局唯一）

## ASI 页面结构

每个资源页面包含：
- **Overview**：资源元数据和功能概览
- **Issue Detector**：预定义查询，自动检测已知问题
- **Common Kusto query output**：表格化 Kusto 查询结果

### 关键图标

| 图标 | 功能 |
|------|------|
| 数据库（DB）图标 | 查看 widget 背后的 Kusto 查询，可在 Kusto 编辑器中直接运行 |
| 反馈图标 | 向 ASI 服务负责人发送带截图的反馈邮件 |

## 常见问题

| 症状 | 原因 | 解决 |
|------|------|------|
| 搜索新建 ACI 提示 Not Found | 数据摄入延迟 | 等待 ≥15 分钟后重试 |
| 历史数据不可见 | 超过 120 天保留期 | 检查时间范围，超期数据不可查 |

## 排查起点

Container Group 页面是最常用的排查起点，类似 ASC 中显示的信息。最重要的部分是 **Container Group Deployment** 区域（包含详细部署状态）。
