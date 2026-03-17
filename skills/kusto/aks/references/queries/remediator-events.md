---
name: remediator-events
description: AKS 补救器事件查询
tables:
  - RemediatorEvent
  - CPRemediatorLogs
parameters:
  - name: ccpNamespace
    required: true
    description: CCP 命名空间
  - name: subscription
    required: false
    description: 订阅 ID
---

# 补救器事件查询

## 用途

查询 AKS 自动补救器（Remediator）的事件，包括自动修复操作、TunnelExec 错误、Deprecated APIs 检测等。

---

## 查询 1: 查询补救器事件

### 用途
查看 AKS 自动补救操作的详细信息。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').RemediatorEvent 
| where PreciseTimeStamp >= ago(2d)
| where ccpNamespace contains "{ccpNamespace}"
| project PreciseTimeStamp, ccpNamespace, msg, reason, remediation, pod, container, 
         hostMachine, correlationID, state, statusCode, subscriptionID
| sort by PreciseTimeStamp desc
```

---

## 查询 2: 查询 TunnelExec 补救

### 用途
查看 TunnelExec 相关的补救操作。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').RemediatorEvent  
| where PreciseTimeStamp > ago(3d)
| where msg startswith "Beginning remediation" 
| where ccpNamespace contains "{ccpNamespace}" 
| project PreciseTimeStamp, msg, reason, remediation
```

---

## 查询 3: 查询 Deprecated APIs

### 用途
检测集群使用的已弃用 Kubernetes API。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').CPRemediatorLogs
| project msg, PreciseTimeStamp, namespace
| where namespace == "{ccpNamespace}"
| where msg contains "Update configMap from alert" and msg contains "requestedDeprecatedApis" 
      and msg contains "1.27"
| order by PreciseTimeStamp desc
| take 1
```

---

## 查询 4: 按订阅查询补救事件

### 用途
查看特定订阅下所有集群的补救事件。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').RemediatorEvent
| where PreciseTimeStamp > ago(7d)
| where subscriptionID == "{subscription}"
| project PreciseTimeStamp, ccpNamespace, reason, remediation, msg
| sort by PreciseTimeStamp desc
```

---

## 查询 5: 统计补救原因

### 用途
统计补救事件的原因分布。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').RemediatorEvent
| where PreciseTimeStamp > ago(7d)
| where ccpNamespace == "{ccpNamespace}"
| summarize count() by reason
| sort by count_ desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| reason | 补救原因 |
| remediation | 执行的补救措施 |
| state | 补救状态 |
| statusCode | 状态码 |

## 常见补救原因

| 原因 | 说明 |
|------|------|
| TunnelExec | 隧道执行问题 |
| ComponentUnhealthy | 组件不健康 |
| PodCrashLoopBackOff | Pod 崩溃循环 |

## 关联查询

- [controlplane-logs.md](./controlplane-logs.md) - 控制平面日志
- [alertmanager.md](./alertmanager.md) - 告警查询
