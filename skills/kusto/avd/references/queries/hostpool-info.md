---
name: hostpool-info
description: 主机池配置信息查询
tables:
  - HostPool
  - RDTenant
  - AppGroup
parameters:
  - name: HostPoolName
    required: false
    description: 主机池名称
  - name: TenantId
    required: false
    description: 租户 ID
---

# 主机池配置查询

## 用途

查询 AVD 主机池的配置信息，包括负载均衡、Session 限制、RDP 属性等。

## 查询 1: 获取主机池配置

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {HostPoolName} | 是 | 主机池名称 |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where Name has "{HostPoolName}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, PoolType, SHCount, LoadBalancerType, MaxSessions, 
          Location, EnableStartVMOnConnect, PublicNetworkAccess, RDPProperties
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| PoolType | 池类型 (Pooled=共享, Personal=个人) |
| SHCount | Session Host 数量 |
| LoadBalancerType | 负载均衡类型 |
| MaxSessions | 每主机最大会话数 |
| EnableStartVMOnConnect | 连接时启动 VM |

---

## 查询 2: 按租户获取所有主机池

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where TenantId == "{TenantId}"
| where env_time >= ago(2d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, PoolType, SHCount, LoadBalancerType, MaxSessions, Location
| order by Name asc
```

---

## 查询 3: 获取主机池关联的应用组

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {HostPoolId} | 是 | 主机池 ID |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').AppGroup
| where HostPoolId == "{HostPoolId}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, UsersCount, PubAppsCount, Type, Location
```

---

## 查询 4: 获取租户信息

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDTenant
| where TenantGroupId == "{TenantGroupId}"
| where env_time >= ago(1d)
| project env_time, Name, Id, CreationDate, TenantGroupId, AzureADId
```

---

## 查询 5: 主机池负载均衡分析

### 查询语句

```kql
let st = datetime({starttime});
let et = datetime({endtime});
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where Type == "Connection"
| where SessionHostPoolId == "{HostPoolId}"
| where StartDate between (st .. et)
| summarize ConnectionCount = count() by SessionHostName
| order by ConnectionCount desc
```

## 关联查询

- [session-host.md](./session-host.md) - Session Host 详细信息
- [user-activity.md](./user-activity.md) - 用户连接活动
