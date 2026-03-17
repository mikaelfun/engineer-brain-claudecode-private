---
name: CloudControllerManager
database: AKSccplogs
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: Cloud Controller Manager 日志，记录云提供商相关的控制器操作
status: active
---

# CloudControllerManager

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSccplogs |
| 状态 | ✅ 可用 |

## 用途

记录 Kubernetes Cloud Controller Manager 的日志，包含与 Azure 云提供商交互的操作，如负载均衡器管理、节点初始化等。

## 字段列表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| Cloud | string | 云环境 |
| Environment | string | 环境 |
| Host | string | 主机 |
| RPSector | string | RP 扇区 |
| RPTenant | string | RP 租户 |
| Service | string | 服务 |
| Underlay | string | Underlay 标识 |
| UnderlayClass | string | Underlay 类型 |
| UnderlayName | string | Underlay 名称 |
| UnderlaySubscriptionID | string | Underlay 订阅 ID |
| UnderlaySubscriptionIndex | string | Underlay 订阅索引 |
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| SourceNamespace | string | 来源命名空间 |
| SourceMoniker | string | 来源标识 |
| SourceVersion | string | 来源版本 |
| log | string | 日志内容 |
| logPreciseTime | datetime | 日志精确时间 |
| pod | string | Pod 名称 |
| namespace | string | 命名空间（CCP Namespace） |
| containerID | string | 容器 ID |
| container | string | 容器名称 |
| hostMachine | string | 主机名 |
| pod_name | string | Pod 名称 |
| time | datetime | 时间 |
| cluster_id | string | 集群 ID（CCP Namespace） |
| resource_id | string | 资源 ID |

## 常用筛选字段

- `namespace` 或 `cluster_id` - 按 CCP Namespace 筛选
- `PreciseTimeStamp` - 按时间筛选
- `log` - 按日志内容筛选

## 典型应用场景

1. **诊断 LoadBalancer Service 问题** - 负载均衡器创建/更新失败
2. **节点初始化问题** - 节点加入集群时的云提供商操作
3. **Azure 资源操作** - 与 Azure API 的交互日志
4. **路由表问题** - UDR 相关操作日志

## 示例查询

### 查询 LoadBalancer 相关日志
```kql
CloudControllerManager
| where PreciseTimeStamp > ago(1d)
| where namespace == "{ccpNamespace}"
| where log contains "loadbalancer" or log contains "LoadBalancer"
| project PreciseTimeStamp, log
| order by PreciseTimeStamp desc
```

### 查询错误日志
```kql
CloudControllerManager
| where PreciseTimeStamp > ago(1d)
| where namespace == "{ccpNamespace}"
| where log contains "error" or log contains "Error" or log contains "failed"
| project PreciseTimeStamp, log
| order by PreciseTimeStamp desc
```

### 查询节点相关操作
```kql
CloudControllerManager
| where PreciseTimeStamp > ago(1d)
| where namespace == "{ccpNamespace}"
| where log contains "node" or log contains "Node"
| project PreciseTimeStamp, log
| order by PreciseTimeStamp desc
```

## 关联表

- [KubeControllerManager.md](./KubeControllerManager.md) - Kube Controller Manager 日志
- [ControlPlaneEvents.md](./ControlPlaneEvents.md) - 控制平面日志

## 注意事项

- 此表在 AKSccplogs 数据库，需要先从 ManagedClusterSnapshot 获取 CCP Namespace
- `log` 字段包含原始日志内容，通常为 JSON 格式
- 负载均衡器问题排查时，应同时查看 AKSKubeEvents 表中的 Service 相关事件
