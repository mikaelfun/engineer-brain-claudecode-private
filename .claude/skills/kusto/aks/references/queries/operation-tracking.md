---
name: operation-tracking
description: AKS 操作追踪查询
tables:
  - FrontEndQoSEvents
  - AsyncQoSEvents
  - FrontEndContextActivity
  - AsyncContextActivity
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: cluster
    required: true
    description: AKS 集群名称
  - name: correlationId
    required: false
    description: 关联 ID
  - name: operationId
    required: false
    description: 操作 ID
---

# 操作追踪查询

## 用途

追踪 AKS 集群操作（创建、升级、扩缩容等）的执行状态和错误。

## 查询 1: 按订阅和集群名查询操作

### 查询语句

```kql
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').FrontEndQoSEvents,
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AsyncQoSEvents
| where PreciseTimeStamp > ago(1d)
| where subscriptionID == "{subscription}" and resourceName == "{cluster}"
| where suboperationName != "None"
| where operationName notcontains "GET" 
      and operationName notcontains 'ListManagedClusterClusterUserCredentialHandlerName.POST' 
      and operationName !contains "Admin"
| extend Count = parse_json(tostring(parse_json(propertiesBag).LinuxAgentsCount))
| project PreciseTimeStamp, correlationID, operationID, Count, operationName, suboperationName,
         k8sCurrentVersion, k8sGoalVersion, result, resultType, resultSubCode, resultCode,
         errorDetails, subscriptionID, resourceGroupName, resourceName, region, pod, 
         UnderlayName, Underlay, propertiesBag, clientApplicationID
| sort by PreciseTimeStamp desc
```

---

## 查询 2: 按 CorrelationID 查询

### 查询语句

```kql
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').FrontEndQoSEvents,
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AsyncQoSEvents
| where PreciseTimeStamp > ago(1d)
| where correlationID has "{correlationId}"
| project PreciseTimeStamp, correlationID, operationID, operationName, suboperationName,
         result, msg, agentPoolName, errorDetails, expirationTime, innerMessage, 
         namespace, fqdn, UnderlayName, propertiesBag
| sort by PreciseTimeStamp desc
```

---

## 查询 3: 查询操作详细日志 (Context Activity)

### 查询语句

```kql
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').FrontEndContextActivity,
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AsyncContextActivity
| where PreciseTimeStamp > ago(2h)
| where operationID contains '{operationId}'
| project PreciseTimeStamp, msg, level
| sort by PreciseTimeStamp desc
```

---

## 查询 4: 查询错误和警告消息

### 查询语句

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

---

## 查询 5: 查询 VMSS CSE 相关日志

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AsyncContextActivity
| where PreciseTimeStamp > ago(5d)
| where subscriptionID == "{subscription}"
| where msg contains "agentpool"
| project PreciseTimeStamp, msg, level, operationID
| where msg contains "vmssCSE exit code : "
// 可以按特定 exit code 过滤
// | where msg !contains "vmssCSE exit code : 0"
```

---

## 查询 6: 查询 NodesNotReady 错误

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AsyncQoSEvents
| where subscriptionID == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where suboperationName == "Upgrading"
| extend bag = parse_json(propertiesBag)
| extend from_version = tostring(bag.k8sCurrentVersion)
| extend to_version = tostring(bag.k8sGoalVersion)
| where resultCode == "NodesNotReady"
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| correlationID | 关联 ID，用于追踪完整操作链 |
| operationID | 操作 ID，用于查询详细日志 |
| operationName | 操作名称 |
| suboperationName | 子操作名称（如 Upgrading） |
| resultCode | 结果代码 |
| errorDetails | 错误详情 |
| k8sCurrentVersion | 当前 K8s 版本 |
| k8sGoalVersion | 目标 K8s 版本 |

## 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 获取集群基础信息
- [controlplane-logs.md](./controlplane-logs.md) - 控制平面日志
