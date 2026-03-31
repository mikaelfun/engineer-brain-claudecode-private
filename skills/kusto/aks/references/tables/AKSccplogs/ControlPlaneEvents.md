---
name: ControlPlaneEvents
database: AKSccplogs
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: Kubernetes 控制平面组件日志
status: active
related_tables:
  - ControlPlaneEventsNonShoebox
---

# ControlPlaneEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSccplogs |
| 状态 | ✅ 可用 |

## 用途

记录 Kubernetes 控制平面组件日志，包括 API Server、Controller Manager、Scheduler、Etcd 等。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| resourceId | string | 集群资源 ID |
| ccpNamespace / namespace | string | CCP 命名空间 |
| category | string | 组件类别 |
| properties | dynamic | 日志属性（JSON） |
| operationName | string | 操作名称 |

## Category 类型

| Category | 说明 |
|----------|------|
| kube-apiserver | API Server 日志 |
| kube-controller-manager | Controller Manager |
| cloud-controller-manager | Cloud Controller Manager |
| kube-scheduler | Scheduler |
| kube-audit | 审计日志 |
| kube-audit-admin | 管理员审计日志 |
| etcd | Etcd 日志 |
| cluster-autoscaler | 集群自动缩放器 |
| konnectivity-svr | Konnectivity 服务器 |
| csi-azuredisk-controller | CSI 磁盘驱动 |
| csi-azurefile-controller | CSI 文件驱动 |
| guard | AAD 集成 |

## properties 字段结构

```json
{
  "pod": "kube-apiserver-xxx",
  "log": "原始日志内容",
  "containerID": "xxx"
}
```

## Kube-audit 特殊字段

从 `properties.log` 解析：
- `auditID` - 审计 ID
- `requestURI` - 请求 URI
- `verb` - HTTP 动词
- `user.username` - 用户名
- `responseStatus.code` - 响应状态码

## 典型应用场景

1. **查询 Kube-audit 日志** - API 调用审计
2. **追踪 Controller Manager 事件** - Pod 调度、节点管理
3. **监控 Cluster Autoscaler 操作** - 扩缩容决策
4. **排查 Konnectivity 连接问题** - 节点不可达
5. **排查 CSI Driver 错误** - 磁盘/文件挂载问题

## 示例查询

### 查询 kube-apiserver 日志
```kql
union ControlPlaneEvents, ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == "{ccpNamespace}" or namespace == "{ccpNamespace}"
| where category == "kube-apiserver"
| project PreciseTimeStamp, category, properties
| sort by PreciseTimeStamp desc
```

### 查询 kube-audit 日志
```kql
union ControlPlaneEvents, ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == "{ccpNamespace}"
| where category == "kube-audit"
| extend Log = parse_json(tostring(parse_json(properties).log))
| extend requestURI = tostring(Log.requestURI)
| extend verb = tostring(Log.verb)
| extend user = tostring(Log.user.username)
| project PreciseTimeStamp, requestURI, verb, user, Log
```

### 查询 cluster-autoscaler 日志
```kql
union ControlPlaneEvents, ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where namespace == "{ccpNamespace}"
| where category contains "cluster-autoscaler"
| project PreciseTimeStamp, category, log=tostring(parse_json(properties).log)
```

## 关联表

- [ControlPlaneEventsNonShoebox.md](./ControlPlaneEventsNonShoebox.md) - 非 Shoebox 控制平面日志
- [ManagedClusterSnapshot.md](./ManagedClusterSnapshot.md) - 获取 CCP Namespace

## 注意事项

- 查询前需先从 `ManagedClusterSnapshot` 获取 CCP Namespace
- 建议联合 `ControlPlaneEventsNonShoebox` 查询以获取完整日志
- `ccpNamespace` 和 `namespace` 字段在不同表中可能使用不同名称
