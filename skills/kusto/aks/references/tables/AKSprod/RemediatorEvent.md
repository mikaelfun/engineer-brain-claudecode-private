---
name: RemediatorEvent
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: AKS 自动补救器事件，记录 AKS 自动修复操作
status: active
related_tables:
  - CPRemediatorLogs
---

# RemediatorEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 AKS 自动补救器（Remediator）的事件，包括自动修复操作、TunnelExec 错误等。用于诊断 AKS 自动修复机制。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| subscriptionID | string | 订阅 ID |
| ccpNamespace | string | CCP 命名空间 |
| msg | string | 消息内容 |
| reason | string | 补救原因 |
| remediation | string | 补救措施 |
| pod | string | 相关 Pod |
| container | string | 相关容器 |
| hostMachine | string | 主机 |
| correlationID | string | 关联 ID |
| state | string | 状态 |
| statusCode | string | 状态码 |

## 常用筛选字段

- `ccpNamespace` - 按 CCP 命名空间筛选
- `subscriptionID` - 按订阅筛选
- `reason` - 按补救原因筛选
- `msg` - 按消息内容搜索

## 典型应用场景

1. **查看自动修复事件** - 检查 AKS 何时触发自动修复
2. **诊断 TunnelExec 错误** - 查看隧道执行问题
3. **追踪补救操作** - 查看具体补救措施
4. **关联控制平面问题** - 与 CPRemediatorLogs 联合分析

## 示例查询

### 查询补救器事件
```kql
RemediatorEvent 
| where PreciseTimeStamp >= ago(2d)
| where ccpNamespace contains "{ccpNamespace}"
| project PreciseTimeStamp, ccpNamespace, msg, reason, remediation, pod, container, 
         hostMachine, correlationID, state, statusCode, subscriptionID
| sort by PreciseTimeStamp desc
```

### 查询 TunnelExec 补救
```kql
RemediatorEvent  
| where PreciseTimeStamp > ago(3d)
| where msg startswith "Beginning remediation" 
| where ccpNamespace contains "{ccpNamespace}" 
```

### 查询特定订阅的补救事件
```kql
RemediatorEvent
| where PreciseTimeStamp > ago(7d)
| where subscriptionID == "{subscription}"
| project PreciseTimeStamp, reason, remediation, msg
| sort by PreciseTimeStamp desc
```

## 关联表

- [CPRemediatorLogs.md](./CPRemediatorLogs.md) - 控制平面补救器日志

## 注意事项

- 补救器是 AKS 自动修复机制的一部分
- 频繁的补救事件可能表示底层问题需要调查
- 与控制平面日志结合分析可获取更完整的诊断信息
