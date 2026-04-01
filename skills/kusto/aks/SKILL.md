---
name: aks
description: AKS Kusto 查询专家 - 诊断 Azure Kubernetes Service 集群操作、升级、节点池问题。当用户需要排查 AKS 集群问题时触发此 skill。
author: fangkun
last_modified: 2026-01-14
---

# AKS Kusto 查询 Skill

## 概述

本 Skill 用于查询 AKS (Azure Kubernetes Service) 相关的 Kusto 日志，诊断集群操作、升级、节点池、控制平面等问题。

## 触发关键词

- AKS、Kubernetes、K8s
- 集群、节点池、AgentPool
- 升级、扩缩容、Scale
- CCP、控制平面
- VMSS CSE、CustomScriptExtension
- Konnectivity、API Server
- Pod 重启、OOMKilled

## 集群信息

| 集群名称 | URI | 数据库 | 用途 |
|----------|-----|--------|------|
| AKS Hub | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn | AKSprod | 主要操作日志 |
| AKS CCP Logs | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn | AKSccplogs | 控制平面日志 |
| AKS Infra | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn | AKSinfra | 基础设施信息 |
| ARM MC | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn | armmc | ARM 层日志 |
| CRP MC | https://azcrpmc.kusto.chinacloudapi.cn | crp_allmc | CRP 操作日志 |

详细集群信息见: [kusto_clusters.csv](./references/kusto_clusters.csv)

## 主要表

### AKSprod 数据库

| 表名 | 用途 | 文档 |
|------|------|------|
| ManagedClusterSnapshot | 集群快照和配置 | [📄](./references/tables/AKSprod/ManagedClusterSnapshot.md) |
| AgentPoolSnapshot | 节点池快照 | [📄](./references/tables/AKSprod/AgentPoolSnapshot.md) |
| FrontEndQoSEvents | 前端 QoS 事件 | [📄](./references/tables/AKSprod/FrontEndQoSEvents.md) |
| AsyncQoSEvents | 异步操作 QoS 事件 | [📄](./references/tables/AKSprod/AsyncQoSEvents.md) |
| FrontEndContextActivity | 前端上下文活动 | [📄](./references/tables/AKSprod/FrontEndContextActivity.md) |
| AsyncContextActivity | 异步上下文活动 | [📄](./references/tables/AKSprod/AsyncContextActivity.md) |
| IncomingRequestTrace | ARM 入站请求 | [📄](./references/tables/AKSprod/IncomingRequestTrace.md) |
| OutgoingRequestTrace | CRP 出站请求 | [📄](./references/tables/AKSprod/OutgoingRequestTrace.md) |
| RemediatorEvent | 补救器事件 | [📄](./references/tables/AKSprod/RemediatorEvent.md) |
| AutoUpgraderEvents | 自动升级事件 | [📄](./references/tables/AKSprod/AutoUpgraderEvents.md) |
| OverlaymgrEvents | Overlay 管理器事件 | [📄](./references/tables/AKSprod/OverlaymgrEvents.md) |
| HelmControllerEvents | Helm Controller 事件 | [📄](./references/tables/AKSprod/HelmControllerEvents.md) |
| AKSAlertmanager | AKS 告警 | [📄](./references/tables/AKSprod/AKSAlertmanager.md) |
| BlackboxMonitoringActivity | ⚠️ 黑盒监控活动（已弃用） | [📄](./references/tables/AKSprod/BlackboxMonitoringActivity.md) |

### AKSccplogs 数据库

| 表名 | 用途 | 文档 |
|------|------|------|
| ControlPlaneEvents | 控制平面组件日志 | [📄](./references/tables/AKSccplogs/ControlPlaneEvents.md) |
| ControlPlaneEventsNonShoebox | 控制平面日志（非 Shoebox） | - |
| KubeAudit | Kubernetes 审计日志（推荐） | [📄](./references/tables/AKSccplogs/KubeAudit.md) |
| AKSKubeEvents | Kubernetes 事件 | [📄](./references/tables/AKSccplogs/AKSKubeEvents.md) |
| KubeControllerManager | Controller Manager 日志 | [📄](./references/tables/AKSccplogs/KubeControllerManager.md) |

详细表定义见: [tables/](./references/tables/)

## 工作流程

### 步骤 1: 获取集群基础信息

首先获取 CCP Namespace、FQDN、Underlay Name：

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}" 
| where customerResourceGroup == "{resourceGroup}" 
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project namespace, apiServerServiceAccountIssuerFQDN, UnderlayName
| take 1
```

### 步骤 2: 查询操作日志

根据问题类型选择查询：

#### 2.1 集群操作错误
```kql
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').FrontEndContextActivity, 
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AsyncContextActivity
| where subscriptionID == "{subscription}"
| where resourceName contains "{cluster}"
| where level != "info"
| where PreciseTimeStamp > ago(1d)
| project PreciseTimeStamp, operationID, correlationID, level, suboperationName, msg
| sort by PreciseTimeStamp desc
```

#### 2.2 升级/扩缩容操作
```kql
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').FrontEndQoSEvents,
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AsyncQoSEvents
| where PreciseTimeStamp > ago(1d)
| where subscriptionID == "{subscription}" and resourceName == "{cluster}"
| where operationName notcontains "GET"
| project PreciseTimeStamp, correlationID, operationID, operationName, suboperationName,
         k8sCurrentVersion, k8sGoalVersion, result, resultCode, errorDetails
```

### 步骤 3: 查询控制平面日志

使用 CCP Namespace 查询控制平面日志：

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents, 
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == _ccpNamespace or namespace == _ccpNamespace
| where category == "kube-apiserver" or category == "kube-controller-manager"
| project PreciseTimeStamp, category, properties
```

## 常见诊断场景

### 场景 1: 集群创建/升级失败
1. 查询 FrontEndQoSEvents/AsyncQoSEvents 获取错误
2. 查询 FrontEndContextActivity/AsyncContextActivity 获取详细日志
3. 如有 VMSS CSE 错误，查询 CRP ContextActivity

### 场景 2: 节点池扩缩容失败
1. 查询 AsyncQoSEvents 检查 NodesNotReady 错误
2. 查询 ControlPlaneEvents 的 cluster-autoscaler 日志
3. 查询 AKSAlertmanager 检查节点不可达告警

### 场景 3: 控制平面问题
1. 获取 CCP Namespace
2. 查询 ControlPlaneEvents 各组件日志
3. 查询 AKSAlertmanager 检查 Konnectivity 探针

### 场景 4: Pod 频繁重启
1. 使用 KubeAudit 查询 Pod 重启历史
2. 查询 AKSKubeEvents 获取 Pod 相关事件
3. 分析 OOMKilled、Error 等原因

### 场景 5: Autoscaler 不工作
1. 查询 Autoscaler 日志检查决策过程
2. 查询 AsyncQoSEvents 检查是否有 scale 操作
3. 查询 OutgoingRequestTrace 检查 CRP 调用结果

### 场景 6: 自动升级问题
1. 查询 AutoUpgraderEvents 获取升级事件
2. 查询 FrontEndQoSEvents 检查维护窗口配置
3. 查询 AsyncQoSEvents 检查升级结果

## 预定义查询

详细查询模板见: [queries/](./references/queries/)

| 查询 | 用途 |
|------|------|
| [cluster-snapshot.md](./references/queries/cluster-snapshot.md) | 集群快照查询 |
| [operation-tracking.md](./references/queries/operation-tracking.md) | 操作追踪 |
| [controlplane-logs.md](./references/queries/controlplane-logs.md) | 控制平面日志 |
| [autoscaler-analysis.md](./references/queries/autoscaler-analysis.md) | 自动缩放分析 |
| [kube-events.md](./references/queries/kube-events.md) | Kubernetes 事件 |
| [pod-restart-analysis.md](./references/queries/pod-restart-analysis.md) | Pod 重启分析 |
| [alertmanager.md](./references/queries/alertmanager.md) | 告警查询 |
| [remediator-events.md](./references/queries/remediator-events.md) | 补救器事件 |
| [auto-upgrade.md](./references/queries/auto-upgrade.md) | 自动升级 |
| [arm-crp-tracking.md](./references/queries/arm-crp-tracking.md) | ARM/CRP 追踪 |

## 参考链接

- [AKS Kusto Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/1280667/Kusto-Repo-AKS)
- [父 Skill](../SKILL.md)
