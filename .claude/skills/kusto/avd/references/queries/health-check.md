---
name: health-check
description: Session Host 健康检查状态查询
tables:
  - RDOperation
parameters:
  - name: SessionHostName
    required: false
    description: Session Host 名称
  - name: AADTenantId
    required: false
    description: AAD 租户 ID
---

# 健康检查状态查询

## 用途

查询 Session Host 的健康检查状态，包括域加入、FSLogix、URL 访问等各项检查结果。

## 查询 1: 按 Session Host 查询健康检查

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {SessionHostName} | 是 | Session Host 名称或 FQDN |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where HostInstance has "{SessionHostName}"
| where TIMESTAMP >= ago(1d)
| where Name == "SxSStackListenerCheck" 
    or Name == "DomainReachableHealthCheck" 
    or Name == "DomainTrustCheckHealthCheck" 
    or Name == "DomainJoinedCheck" 
    or Name == "FSLogixHealthCheck" 
    or Name == "MonitoringAgentCheck" 
    or Name == "SessionHostCanAccessUrlsCheck" 
    or Name == "RDAgentCanReachRDGatewayURL" 
    or Name == "RdInfraAgentConnectToRdBroker" 
    or Name == "WebRTCRedirectorHealthCheck"
| project TIMESTAMP, Name, ResType, ResSignature, ResDesc
| order by TIMESTAMP desc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| Name | 检查项名称 |
| ResType | 结果类型 (Success, Error, Warning) |
| ResSignature | 结果签名/错误代码 |
| ResDesc | 结果描述 |

---

## 查询 2: 按 AAD 租户查询失败的健康检查

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where AADTenantId == "{AADTenantId}"
| where TIMESTAMP >= ago(1d)
| where Name endswith "Check"
| where ResType != "Success"
| project TIMESTAMP, HostPool, HostInstance, Name, ResType, ResSignature, ResDesc
| order by TIMESTAMP desc
```

---

## 查询 3: 汇总所有 Session Host 健康检查状态

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where PreciseTimeStamp > ago(1d)
| where Role == 'RDAgent'
| where Name endswith "Check"
| where AADTenantId != ""
| summarize arg_max(PreciseTimeStamp, ResType) by Env, Ring, HostPool, HostInstance, Name, AADTenantId
| order by Env, Ring, HostPool, HostInstance
```

---

## 查询 4: 健康检查失败趋势

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where TIMESTAMP >= ago(7d)
| where Name endswith "Check"
| where ResType != "Success"
| summarize FailureCount = count() by bin(TIMESTAMP, 1h), Name
| order by TIMESTAMP desc
```

## 常见健康检查项说明

| 检查项 | 说明 | 失败可能原因 |
|--------|------|-------------|
| SxSStackListenerCheck | SxS Stack 监听器 | RDP 栈问题 |
| DomainReachableHealthCheck | 域控可达性 | 网络/DNS 问题 |
| DomainJoinedCheck | 域加入状态 | 未加域或域信任问题 |
| FSLogixHealthCheck | FSLogix 健康 | FSLogix 配置或存储问题 |
| SessionHostCanAccessUrlsCheck | URL 访问 | 防火墙/网络问题 |
| RDAgentCanReachRDGatewayURL | Gateway 可达 | 网络连通性问题 |
| RdInfraAgentConnectToRdBroker | Broker 连接 | Agent 或网络问题 |

## 关联查询

- [url-access-check.md](./url-access-check.md) - URL 访问检查详情
- [heartbeat.md](./heartbeat.md) - 心跳状态检查
