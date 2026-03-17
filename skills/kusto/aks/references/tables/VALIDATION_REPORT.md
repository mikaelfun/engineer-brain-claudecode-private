# AKS Kusto 表验证报告

> 生成时间: 2026-01-14
> 集群: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn

## 一、验证结果总结

### 表存在性验证 ✅ 全部通过

所有记录的表都已在对应数据库中确认存在。

| 数据库 | 已验证表数 | 状态 |
|--------|-----------|------|
| AKSprod | 14 | ✅ 通过 |
| AKSccplogs | 8 | ✅ 通过 |

---

## 二、AKSprod 数据库表验证

| 表名 | 存在性 | 字段数 |
|------|-------|-------|
| ManagedClusterSnapshot | ✅ | 128 |
| AgentPoolSnapshot | ✅ | 137 |
| FrontEndQoSEvents | ✅ | 69 |
| AsyncQoSEvents | ✅ | 68 |
| FrontEndContextActivity | ✅ | 103 |
| AsyncContextActivity | ✅ | 67 |
| IncomingRequestTrace | ✅ | 106 |
| OutgoingRequestTrace | ✅ | 111 |
| RemediatorEvent | ✅ | 63 |
| CPRemediatorLogs | ✅ | 30 |
| AutoUpgraderEvents | ✅ | 47 |
| OverlaymgrEvents | ✅ | 131 |
| HelmControllerEvents | ✅ | 39 |
| AKSAlertmanager | ✅ | 83 |

---

## 三、AKSccplogs 数据库表验证

| 表名 | 存在性 | 字段数 |
|------|-------|-------|
| ControlPlaneEvents | ✅ | 25 |
| ControlPlaneEventsNonShoebox | ✅ | - |
| KubeAudit | ✅ | 44 |
| AKSKubeEvents | ✅ | 34 |
| KubeControllerManager | ✅ | 27 |
| CloudControllerManager | ✅ | 27 |
| ClusterAutoscaler | ✅ | 27 |
| KubeScheduler | ✅ | - |

---

## 四、核心表 Schema 详情

### ManagedClusterSnapshot (AKSprod)

**核心字段:**
| 字段名 | 类型 | 用途 |
|--------|------|------|
| PreciseTimeStamp | datetime | 快照时间 |
| subscription | string | 订阅 ID |
| clusterName | string | 集群名称 |
| cluster_id | string | CCP Namespace（关键） |
| namespace | string | CCP Namespace（同 cluster_id） |
| apiServerServiceAccountIssuerFQDN | string | API Server FQDN |
| UnderlayName | string | Underlay 名称 |
| provisioningState | string | 预配状态 |
| customerResourceGroup | string | 用户资源组 |
| managedClusterResourceGroup | string | 托管资源组 |
| location | string | 区域 |
| orchestratorProfile | dynamic | 版本配置 |
| hostedMasterProfile | dynamic | 控制平面配置 |
| powerState | dynamic | 电源状态 |

---

### FrontEndQoSEvents (AKSprod)

**核心字段:**
| 字段名 | 类型 | 用途 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| subscriptionID | string | 订阅 ID |
| resourceGroupName | string | 资源组 |
| resourceName | string | 集群名称 |
| operationID | string | 操作 ID |
| correlationID | string | 关联 ID |
| operationName | string | 操作名称 |
| suboperationName | string | 子操作 |
| httpStatus | long | HTTP 状态码 |
| resultCode | string | 结果代码 |
| resultSubCode | string | 结果子代码 |
| errorDetails | string | 错误详情 |
| latency | long | 延迟（毫秒） |

---

### AsyncQoSEvents (AKSprod)

**核心字段:**
| 字段名 | 类型 | 用途 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| subscriptionID | string | 订阅 ID |
| resourceGroupName | string | 资源组 |
| resourceName | string | 集群名称 |
| operationID | string | 操作 ID |
| correlationID | string | 关联 ID |
| operationName | string | 操作名称 |
| suboperationName | string | 子操作 |
| resultCode | string | 结果代码 |
| resultSubCode | string | 结果子代码 |
| errorDetails | string | 错误详情 |
| k8sCurrentVersion | string | 当前版本 |
| k8sGoalVersion | string | 目标版本 |
| agentPoolName | string | 节点池名称 |
| propertiesBag | string | 属性包（JSON） |

---

### ControlPlaneEvents (AKSccplogs)

**核心字段:**
| 字段名 | 类型 | 用途 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| ccpNamespace | string | CCP Namespace（关键筛选字段） |
| namespace | string | 命名空间 |
| category | string | 日志类别 |
| operationName | string | 操作名称 |
| properties | string | 日志属性（JSON） |
| displayResourceId | string | 资源 ID |
| resourceId | string | 资源 ID |
| time | datetime | 时间 |

---

### KubeAudit (AKSccplogs)

**核心字段:**
| 字段名 | 类型 | 用途 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| namespace | string | CCP Namespace |
| cluster_id | string | 集群 ID |
| resource_id | string | 资源 ID |
| auditID | string | 审计 ID |
| verb | string | 操作动词（get/create/update/delete） |
| requestURI | string | 请求 URI |
| user | dynamic | 用户信息 |
| sourceIPs | dynamic | 源 IP |
| objectRef | dynamic | 对象引用 |
| responseStatus | dynamic | 响应状态 |
| requestObject | dynamic | 请求对象 |
| responseObject | dynamic | 响应对象 |
| userAgent | string | 用户代理 |
| level | string | 审计级别 |
| stage | string | 审计阶段 |

---

### AKSKubeEvents (AKSccplogs)

**核心字段:**
| 字段名 | 类型 | 用途 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| namespace | string | CCP Namespace |
| cluster_id | string | 集群 ID |
| resourceId | string | 资源 ID |
| kind | string | 资源类型 |
| name | string | 资源名称 |
| eventNamespace | string | 事件命名空间 |
| reason | string | 事件原因 |
| type | string | 事件类型（Normal/Warning） |
| message | string | 事件消息 |
| lastObservedTime | datetime | 最后观察时间 |
| reportingController | string | 报告控制器 |
| reportingInstance | string | 报告实例 |

---

### RemediatorEvent (AKSprod)

**核心字段:**
| 字段名 | 类型 | 用途 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| subscriptionID | string | 订阅 ID |
| resourceGroupName | string | 资源组 |
| resourceName | string | 集群名称 |
| ccpNamespace | string | CCP Namespace |
| operationID | string | 操作 ID |
| operationName | string | 操作名称 |
| subOperationName | string | 子操作 |
| remediation | string | 补救措施 |
| reason | string | 原因 |
| state | string | 状态 |
| msg | string | 消息 |
| level | string | 日志级别 |
| error | string | 错误信息 |

---

### AutoUpgraderEvents (AKSprod)

**核心字段:**
| 字段名 | 类型 | 用途 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| subscriptionID | string | 订阅 ID |
| resourceGroupName | string | 资源组 |
| resourceName | string | 集群名称 |
| operationID | string | 操作 ID |
| correlationID | string | 关联 ID |
| messageType | string | 消息类型 |
| messageID | string | 消息 ID |
| msg | string | 消息内容 |
| level | string | 日志级别 |
| region | string | 区域 |

---

## 五、控制平面日志表 (简化 Schema)

以下表都使用相似的简化 schema:

| 表名 | 主要筛选字段 |
|------|------------|
| KubeControllerManager | namespace, cluster_id, log |
| CloudControllerManager | namespace, cluster_id, log |
| ClusterAutoscaler | namespace, cluster_id, log |
| KubeScheduler | namespace, cluster_id, log |

**通用字段:**
| 字段名 | 类型 | 用途 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| namespace | string | CCP Namespace |
| cluster_id | string | 集群 ID |
| resource_id | string | 资源 ID |
| log | string | 日志内容 |
| logPreciseTime | datetime | 日志时间 |
| pod | string | Pod 名称 |
| pod_name | string | Pod 名称 |
| time | datetime | 时间 |

---

## 六、验证完成

所有表定义文件已验证并更新。新增的表定义:
- ClusterAutoscaler.md ✅
- CloudControllerManager.md ✅

表索引 README.md 已更新。
