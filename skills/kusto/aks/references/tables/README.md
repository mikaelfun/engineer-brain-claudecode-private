# 表结构定义 (tables/)

本目录存放 Kusto 表结构定义文件，每个文件对应一个表。

## 表索引

### AKSprod 数据库 (主要操作日志)

| 表名 | 用途 | 文件 |
|------|------|------|
| ManagedClusterSnapshot | 集群快照和配置 | [ManagedClusterSnapshot.md](./ManagedClusterSnapshot.md) |
| AgentPoolSnapshot | 节点池快照 | [AgentPoolSnapshot.md](./AgentPoolSnapshot.md) |
| FrontEndQoSEvents | 前端 QoS 事件 | [FrontEndQoSEvents.md](./FrontEndQoSEvents.md) |
| AsyncQoSEvents | 异步操作 QoS 事件 | [AsyncQoSEvents.md](./AsyncQoSEvents.md) |
| FrontEndContextActivity | 前端上下文活动 | [FrontEndContextActivity.md](./FrontEndContextActivity.md) |
| AsyncContextActivity | 异步上下文活动 | [AsyncContextActivity.md](./AsyncContextActivity.md) |
| IncomingRequestTrace | ARM 入站请求 | [IncomingRequestTrace.md](./IncomingRequestTrace.md) |
| OutgoingRequestTrace | CRP 出站请求 | [OutgoingRequestTrace.md](./OutgoingRequestTrace.md) |
| RemediatorEvent | 补救器事件 | [RemediatorEvent.md](./RemediatorEvent.md) |
| CPRemediatorLogs | 控制平面补救器日志 | [CPRemediatorLogs.md](./CPRemediatorLogs.md) |
| AutoUpgraderEvents | 自动升级事件 | [AutoUpgraderEvents.md](./AutoUpgraderEvents.md) |
| OverlaymgrEvents | Overlay 管理器事件 | [OverlaymgrEvents.md](./OverlaymgrEvents.md) |
| HelmControllerEvents | Helm Controller 事件 | [HelmControllerEvents.md](./HelmControllerEvents.md) |
| AKSAlertmanager | AKS 告警 | [AKSAlertmanager.md](./AKSAlertmanager.md) |
| HcpSyncContextActivity | HCP 同步上下文活动 | [HcpSyncContextActivity.md](./HcpSyncContextActivity.md) |
| RegionalLooperEvents | 区域循环事件（自动升级入队） | [RegionalLooperEvents.md](./RegionalLooperEvents.md) |
| ExtensionManagerConfigAgentTraces | Extension Manager 配置代理跟踪 | [ExtensionManagerConfigAgentTraces.md](./ExtensionManagerConfigAgentTraces.md) |
| BlackboxMonitoringActivity | ⚠️ 黑盒监控活动（已弃用） | [BlackboxMonitoringActivity.md](./BlackboxMonitoringActivity.md) |

### AKSccplogs 数据库 (控制平面日志)

| 表名 | 用途 | 文件 |
|------|------|------|
| ControlPlaneEvents | 控制平面组件日志 | [ControlPlaneEvents.md](./ControlPlaneEvents.md) |
| ControlPlaneEventsNonShoebox | 控制平面日志（非 Shoebox） | - |
| KubeAudit | Kubernetes 审计日志（推荐） | [KubeAudit.md](./KubeAudit.md) |
| AKSKubeEvents | Kubernetes 事件 | [AKSKubeEvents.md](./AKSKubeEvents.md) |
| KubeControllerManager | Controller Manager 日志 | [KubeControllerManager.md](./KubeControllerManager.md) |
| CloudControllerManager | Cloud Controller Manager 日志 | [CloudControllerManager.md](./CloudControllerManager.md) |
| ClusterAutoscaler | 集群自动缩放器日志 | [ClusterAutoscaler.md](./ClusterAutoscaler.md) |

---

## 文件命名规范

```
{TableName}.md
```

使用表的实际名称，如：
- `ManagedClusterSnapshot.md`
- `FrontEndQoSEvents.md`
- `ControlPlaneEvents.md`

## 文件格式

每个表定义文件使用以下格式：

```markdown
---
name: TableName
database: DatabaseName
cluster: cluster_uri
description: 表描述
status: active|deprecated
---

# TableName

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 / ⚠️ 已弃用 |

## 用途

描述此表的主要用途和适用场景。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| subscription | string | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| clusterName | string | 集群名称 | my-aks-cluster |
| provisioningState | string | 预配状态 | Succeeded |

## 常用筛选字段

- `subscription` - 按订阅筛选
- `clusterName` - 按集群名称筛选
- `PreciseTimeStamp` - 按时间筛选

## 典型应用场景

1. **场景 1**: 查询集群配置快照
2. **场景 2**: 检查集群健康状态
3. **场景 3**: 获取 CCP Namespace

## 示例查询

\```kql
TableName
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| project PreciseTimeStamp, clusterName, provisioningState
| take 10
\```

## 关联表

- [RelatedTable1.md](./RelatedTable1.md) - 关联说明
- [RelatedTable2.md](./RelatedTable2.md) - 关联说明

## 注意事项

- 注意事项 1
- 注意事项 2
```

## 字段类型

| 类型 | KQL 类型 | 说明 |
|------|----------|------|
| datetime | datetime | 日期时间 |
| string | string | 字符串 |
| int | int | 整数 |
| long | long | 长整数 |
| bool | bool | 布尔值 |
| dynamic | dynamic | JSON 对象 |
| guid | guid | GUID |

## 状态标记

| 状态 | 标记 | 说明 |
|------|------|------|
| 可用 | ✅ | 表正常可用 |
| 已弃用 | ⚠️ | 表已弃用，不建议使用 |
| 实验性 | 🧪 | 实验性表，可能变更 |
