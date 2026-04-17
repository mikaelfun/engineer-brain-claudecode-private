---
name: controlplane-logs
description: AKS 控制平面日志查询
tables:
  - ControlPlaneEvents
  - ControlPlaneEventsNonShoebox
parameters:
  - name: ccpNamespace
    required: true
    description: CCP 命名空间（从 ManagedClusterSnapshot 获取）
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
---

# 控制平面日志查询

## 用途

查询 AKS 控制平面组件日志，包括 API Server、Controller Manager、Scheduler、Etcd、Cluster Autoscaler 等。

## 前置条件

首先需要从 `ManagedClusterSnapshot` 获取 CCP Namespace：

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}" 
| where customerResourceGroup == "{resourceGroup}" 
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project namespace
| take 1
```

---

## 查询 1: 查询 Kube-Controller-Manager 事件

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents, 
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == _ccpNamespace or namespace == _ccpNamespace
| where category == "kube-controller-manager"
| project PreciseTimeStamp, category, properties
```

---

## 查询 2: 查询 Kube-API 审计日志

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents, 
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == _ccpNamespace or namespace == _ccpNamespace
| where category == "kube-audit"
| extend Pod = extractjson("$.pod", properties, typeof(string))
| extend Log = extractjson("$.log", properties, typeof(string))
| extend _jlog = parse_json(Log)
| extend requestURI = tostring(_jlog.requestURI)
| extend verb = tostring(_jlog.verb)
| extend user = tostring(_jlog.user.username)
| where properties has 'api'
| sort by PreciseTimeStamp desc
| project PreciseTimeStamp, requestURI, verb, user, Log
```

---

## 查询 3: 查询 Cluster Autoscaler 日志

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents, 
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where namespace == _ccpNamespace
| where category contains "cluster-autoscaler"
| project PreciseTimeStamp, category, log=tostring(parse_json(properties).log)
```

---

## 查询 4: 查询 Konnectivity 探针告警

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AKSAlertmanager
| where namespace == _ccpNamespace
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where alertname == "AgentNodesUnreachable"
| summarize dcount(resource_id) by bin(PreciseTimeStamp, 15min), RPTenant
| render areachart
```

---

## 查询 5: 查询 Webhook 调用失败

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents, 
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == _ccpNamespace and category == "kube-apiserver"
| where properties has "failed calling webhook"
| extend json = todynamic(properties)
| project PreciseTimeStamp, log = json.log, pod = tostring(json.pod)
| sort by PreciseTimeStamp desc
```

---

## 查询 6: 查询 CSI Driver Controller 事件

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox, 
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == _ccpNamespace
| where category contains "csi-azurefile-controller" or category contains "csi-azuredisk-controller"
| project PreciseTimeStamp, ccpNamespace, category, operationName, properties
| order by PreciseTimeStamp desc
```

---

## 查询 7: 查询 Konnectivity Pod 重启

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
union cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents, 
      cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where ccpNamespace == _ccpNamespace
| where category == 'kube-audit'
| where properties has 'terminated'
| extend log = parse_json(tostring(parse_json(properties).log))
| extend cs = log.requestObject.status.containerStatuses[0]
| where cs.lastState.terminated.reason !in ('', 'Completed')
| project PreciseTimeStamp, reason = cs.lastState.terminated.reason, exitCode = cs.lastState.terminated.exitCode, image = cs.image, pod = tostring(log.objectRef.name), restartCount = cs.restartCount
| summarize PreciseTimeStamp = arg_max(PreciseTimeStamp, *) by pod
| order by PreciseTimeStamp desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| category | 组件类别（kube-apiserver, cluster-autoscaler 等） |
| properties | 日志属性（JSON 格式） |
| requestURI | API 请求 URI（审计日志） |
| verb | HTTP 动词（审计日志） |
| user | 用户名（审计日志） |

## 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 获取 CCP Namespace
- [operation-tracking.md](./operation-tracking.md) - 操作追踪
