---
name: deployment-info
description: AVD 部署信息查询（租户、主机池、应用组）
tables:
  - RDTenant
  - HostPool
  - AppGroup
parameters:
  - name: TenantGroupId
    required: false
    description: 租户组 ID
  - name: HostPoolId
    required: false
    description: 主机池 ID
---

# 部署信息查询

## 用途

查询 AVD 部署的组织结构信息，包括租户、主机池、应用组等配置。

## 查询 1: 获取租户信息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {TenantGroupId} | 是 | 租户组 ID |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDTenant
| where TenantGroupId == "{TenantGroupId}"
| where env_time >= ago(1d)
| project env_time, Name, Id, CreationDate, TenantGroupId, AzureADId
| summarize arg_max(env_time, *) by Id
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| Name | 租户名称 |
| Id | 租户 ID (可用于查询 HostPool) |
| AzureADId | Azure AD 租户 ID |
| CreationDate | 创建日期 |

---

## 查询 2: 按租户获取主机池列表

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {TenantId} | 是 | 租户 ID (从查询1获取) |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where TenantId == "{TenantId}"
| where env_time >= ago(2d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, PoolType, SHCount, LoadBalancerType, MaxSessions, Location
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

### 结果字段说明

| 字段 | 说明 |
|------|------|
| Name | 应用组名称 |
| UsersCount | 授权用户数量 |
| PubAppsCount | 已发布应用数量 |
| Type | 类型 (Desktop, RemoteApp) |

---

## 查询 4: 按 Azure AD 租户获取所有资源

### 查询语句

```kql
let aadTenantId = "{AADTenantId}";
let hostPools = cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where AADTenantId == aadTenantId
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project HostPoolName = Name, HostPoolId = Id, SHCount, PoolType;
let appGroups = cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').AppGroup
| where AADTenantId == aadTenantId
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project AppGroupName = Name, AppGroupId = Id, HostPoolId, Type, UsersCount;
hostPools
| join kind=leftouter appGroups on HostPoolId
| project HostPoolName, HostPoolId, SHCount, PoolType, AppGroupName, Type, UsersCount
```

---

## 查询 5: 按订阅获取 AVD 资源统计

### 查询语句

```kql
let subscriptionId = "{SubscriptionId}";
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where SubscriptionId == subscriptionId
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| summarize 
    HostPoolCount = count(),
    TotalSessionHosts = sum(SHCount),
    PooledCount = countif(PoolType == "Pooled"),
    PersonalCount = countif(PoolType == "Personal")
```

## 关联查询

- [hostpool-info.md](./hostpool-info.md) - 主机池详细配置
- [session-host.md](./session-host.md) - Session Host 信息
