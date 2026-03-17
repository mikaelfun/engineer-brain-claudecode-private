---
name: kusto
description: Azure Kusto 查询专家 - 使用 fabric-rti-mcp 执行 Kusto 查询，诊断 Azure 服务问题。当用户需要查询 Kusto 日志、分析 Azure 服务问题、排查故障时触发此 skill。
author: fangkun
last_modified: 2026-01-14
---

# Kusto 查询专家 Skill

## 概述

本 Skill 用于执行 Azure Kusto 查询，诊断和分析 Azure 服务问题。通过 `fabric-rti-mcp` MCP Server 执行 KQL 查询。

## 触发场景

当用户需要以下操作时触发此 Skill：
- 查询 Kusto 日志
- 分析 Azure 服务问题（VM、AKS、ARM、网络、Entra ID 等）
- 排查故障并提供根因分析
- 执行 KQL 查询

## 目录结构

```
skills/kusto/
├── SKILL.md                    # 本文件 - 主 Skill 定义
├── acr/                        # ACR 子 Skill (6 表 / 10 查询)
│   ├── SKILL.md
│   └── references/
│       ├── kusto_clusters.csv
│       ├── queries/
│       └── tables/
├── aks/                        # AKS 子 Skill (24 表 / 14 查询)
│   ├── SKILL.md
│   └── references/
│       ├── kusto_clusters.csv
│       ├── queries/
│       └── tables/
├── arm/                        # ARM 子 Skill (12 表 / 7 查询)
│   ├── SKILL.md
│   └── references/
│       ├── kusto_clusters.csv
│       ├── queries/
│       └── tables/
├── avd/                        # AVD 子 Skill (11 表 / 10 查询)
│   ├── SKILL.md
│   └── references/
│       ├── kusto_clusters.csv
│       ├── queries/
│       └── tables/
├── disk/                       # Disk 子 Skill (6 表 / 10 查询)
│   ├── SKILL.md
│   └── references/
│       ├── kusto_clusters.csv
│       ├── queries/
│       └── tables/
├── entra-id/                   # Entra ID 子 Skill (8 查询)
│   ├── SKILL.md
│   └── references/
│       ├── kusto_clusters.csv
│       ├── queries/
│       └── tables/
├── intune/                     # Intune 子 Skill (11 表 / 13 查询)
│   ├── SKILL.md
│   └── references/
│       ├── kusto_clusters.csv
│       ├── queries/
│       └── tables/
├── monitor/                    # Azure Monitor 子 Skill (8 表 / 5 查询)
│   ├── SKILL.md
│   └── references/
│       ├── kusto_clusters.csv
│       ├── queries/
│       └── tables/
├── networking/                 # Networking 子 Skill (9 表 / 7 查询)
│   ├── SKILL.md
│   └── references/
│       ├── kusto_clusters.csv
│       ├── queries/
│       └── tables/
├── purview/                    # Purview/RMS 子 Skill (3 表 / 3 查询)
│   ├── SKILL.md
│   └── references/
│       ├── kusto_clusters.csv
│       ├── queries/
│       └── tables/
├── vm/                         # VM/Compute 子 Skill (24 表 / 15 查询)
│   ├── SKILL.md
│   └── references/
│       ├── kusto_clusters.csv
│       ├── queries/
│       └── tables/
└── eop/                        # EOP 子 Skill (邮件保护问题排查)
    ├── SKILL.md
    └── references/
        └── decodingspamagentdata.ps1
```

## 子 Skill 列表

| 子 Skill | 说明 | 触发关键词 | 表/查询 |
|----------|------|-----------|---------|
| [acr](./acr/SKILL.md) | ACR 镜像推拉、认证、性能、Task 构建 | ACR、Container Registry、Docker Push/Pull、401/403、429 限流 | 6/10 |
| [aks](./aks/SKILL.md) | AKS 集群操作、升级、节点池问题 | AKS、Kubernetes、K8s、集群、升级、扩缩容、CCP 控制平面 | 24/14 |
| [arm](./arm/SKILL.md) | ARM 操作、请求追踪、部署、限流 | ARM、资源管理、429、限流、correlationId、活动日志、部署 | 12/7 |
| [avd](./avd/SKILL.md) | AVD 连接、会话、主机健康、MSIX | AVD、WVD、Session Host、RDAgent、FSLogix、MSIX | 11/10 |
| [disk](./disk/SKILL.md) | Azure Disk 操作、IO 性能、限流 | 磁盘、IOPS、MBPS、限流、延迟、XStore、VHD | 6/10 |
| [entra-id](./entra-id/SKILL.md) | Entra ID 登录、条件访问、MFA、审计 | 登录、Sign-in、条件访问、CA、MFA、AAD、PRT | -/8 |
| [intune](./intune/SKILL.md) | Intune 设备管理、策略、应用、MAM | Intune、MDM、设备管理、策略、应用安装、MAM | 11/13 |
| [monitor](./monitor/SKILL.md) | Azure Monitor 警报、通知、诊断设置 | Alerts、警报、通知、Scheduled Query Rules、诊断设置 | 8/5 |
| [networking](./networking/SKILL.md) | VPN Gateway、ExpressRoute、App Gateway | VPN、隧道、ExpressRoute、Application Gateway、NMAgent | 9/7 |
| [purview](./purview/SKILL.md) | Purview/RMS 加密解密、敏感度标签 | Purview、AIP、Azure RMS、MIP、DLP、敏感度标签 | 3/3 |
| [vm](./vm/SKILL.md) | VM/VMSS 操作、CRP、Fabric、硬件故障 | VM、VMSS、CRP、分配失败、Service Healing、硬件故障 | 24/15 |
| [eop](./eop/eop.md) | EOP 邮件保护问题排查 | EOP、垃圾邮件、钓鱼、域模拟、DIMP、SPOOF、邮件头分析 | -/- |

**统计**: 12 个子 Skill，122 个表定义，102 个查询模板

## 工作流程

### 步骤 1: 识别问题域
根据用户问题识别需要查询的服务域（AKS/VM/ARM/等），加载对应子 Skill。

### 步骤 2: 获取查询参数
从用户获取必要的查询参数：
- **通用参数**: 订阅 ID、资源组、时间范围
- **服务特定参数**: 如 correlationId、operationId、集群名称等

### 步骤 3: 选择集群和表
1. 读取子 Skill 的 `references/kusto_clusters.csv` 获取集群信息
2. 读取 `references/tables/` 目录下的表定义，选择合适的表
3. 读取 `references/queries/` 目录下的查询模板

### 步骤 4: 执行查询
使用 `fabric-rti-mcp` 的 `kusto_query` 工具执行查询：

```
Tool: kusto_query
Parameters:
  - cluster_uri: 集群 URI
  - database: 数据库名称
  - query: KQL 查询语句
```

### 步骤 5: 分析结果
分析查询结果，生成诊断报告。

## 查询执行规范

### 参数替换
查询模板中的参数使用 `{paramName}` 格式，执行前必须替换：
- `{subscription}` - 订阅 ID
- `{resourceGroup}` - 资源组名称
- `{startDate}` - 开始时间 (ISO 8601 格式)
- `{endDate}` - 结束时间 (ISO 8601 格式)
- `{correlationId}` - 关联 ID
- `{operationId}` - 操作 ID

### 时间格式
- 绝对时间: `datetime(2025-01-01T00:00:00.000Z)`
- 相对时间: `ago(1d)`, `ago(24h)`, `ago(30m)`

### 最佳实践
1. **始终使用时间过滤** - 限制查询范围
2. **优先过滤索引字段** - subscriptionId, correlationId 等
3. **限制结果数量** - 使用 `take` 或 `top`
4. **避免大时间跨度** - 建议不超过 7 天

## 报告格式

执行查询后，按以下格式输出报告：

```markdown
### 查询: [查询目的]

**为什么执行这个查询:** [原因]

**KQL 查询语句:**
\```kql
[完整 KQL 代码]
\```

**查询结果:**
[结果摘要/表格]

**发现/结论:**
[分析结论]
```

## 访问说明

- **Mooncake 环境**: 使用 CME 卡 (`<username>@cme.gbl`) 访问
- **Kusto Web Explorer**: `https://dataexplorer.azure.cn`

## 相关资源

- [fabric-rti-mcp 工具文档](../README.md)
- [Kusto 查询语言参考](https://learn.microsoft.com/kusto/query/)
