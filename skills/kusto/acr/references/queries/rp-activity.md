---
name: rp-activity
description: ACR RP 活动日志查询
tables:
  - RPActivity
parameters:
  - name: registry
    required: true
    description: ACR 登录服务器名称（不含 .azurecr.cn）
---

# RP 活动日志查询

## 用途

查询 ACR Resource Provider 层的活动日志，包括登录活动、管理操作、CosmosDB 操作等。

## 查询 1: 登录活动查询

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {registry} | 是 | 注册表名称（不含 .azurecr.cn） |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where LoginServerName == "{registry}.azurecr.cn"
| where env_time > ago(7d)
| order by env_time desc
```

---

## 查询 2: 按订阅查询操作

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {subscriptionId} | 是 | 订阅 ID |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where SubscriptionId == "{subscriptionId}"
| where env_time > ago(1d)
| where Level != "Information"
| project env_time, OperationName, HttpMethod, HttpStatus, Message, ExceptionMessage
| order by env_time desc
```

---

## 查询 3: RP 错误分析

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn" or LoginServerName == "{registry}.azurecr.cn"
| where isnotempty(ExceptionMessage) or isnotempty(error) or Level == "Error"
| project env_time, OperationName, Message, ExceptionMessage, error, error_description
| order by env_time desc
```

---

## 查询 4: CosmosDB RU 消耗分析

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(cosmosdb_requestunits)
| summarize 
    TotalRU = sum(cosmosdb_requestunits), 
    AvgRU = avg(cosmosdb_requestunits),
    MaxRU = max(cosmosdb_requestunits),
    RequestCount = count()
  by bin(env_time, 1h)
| order by env_time desc
```

---

## 查询 5: 复制操作查询

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where OperationType contains "Replica" or OperationName contains "Replica"
| project env_time, OperationName, OperationType, Message, DurationMs, 
         ReplicationStorageAccount, ReplicationStorageContainer
| order by env_time desc
```

---

## 查询 6: 缓存规则操作

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where env_time > ago(7d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(CacheRuleId) or OperationName contains "Cache"
| project env_time, OperationName, Message, CacheRuleId, 
         TargetRepository, UpstreamRepository, CredentialSetName
| order by env_time desc
```

---

## 查询 7: 操作统计

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn" or LoginServerName == "{registry}.azurecr.cn"
| summarize 
    TotalCount = count(),
    SuccessCount = countif(Level != "Error" and isempty(ExceptionMessage)),
    ErrorCount = countif(Level == "Error" or isnotempty(ExceptionMessage)),
    AvgDurationMs = avg(DurationMs)
  by OperationName
| order by TotalCount desc
```

## 关联查询

- [registry-info.md](./registry-info.md) - 注册表信息
- [activity-errors.md](./activity-errors.md) - 活动错误查询
- [manifest-statistics.md](./manifest-statistics.md) - Manifest 统计
