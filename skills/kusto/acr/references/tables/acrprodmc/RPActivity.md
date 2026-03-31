---
name: RPActivity
database: acrprodmc
cluster: https://acrmc2.chinaeast2.kusto.chinacloudapi.cn
description: ACR RP (Resource Provider) 活动日志
status: active
---

# RPActivity

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://acrmc2.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | acrprodmc |
| 状态 | ✅ 可用 |

## 用途

记录 ACR Resource Provider 层的活动日志，包括登录活动、API 调用、CosmosDB 操作等。用于排查 RP 层问题和管理操作。

## 关键字段

### 时间和标识字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 环境时间 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| CorrelationId | string | 关联 ID |
| ClientRequestId | string | 客户端请求 ID |

### 请求字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| SubscriptionId | string | 订阅 ID |
| ResourceUri | string | 资源 URI |
| HttpMethod | string | HTTP 方法 |
| HttpStatus | string | HTTP 状态码 |
| OperationName | string | 操作名称 |
| DurationMs | long | 持续时间 (毫秒) |

### 注册表字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| LoginServerName | string | 登录服务器名称 |
| RegistryLoginUri | string | 注册表登录 URI |
| RegistryId | string | 注册表 ID |
| RegistryName | string | 注册表名称 |
| Repository | string | 仓库名称 |
| Digest | string | 镜像摘要 |
| Tag | string | 镜像标签 |

### 错误字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| Level | string | 日志级别 |
| Message | string | 日志消息 |
| ExceptionMessage | string | 异常消息 |
| Exception | string | 异常详情 |
| error | string | 错误信息 |
| error_description | string | 错误描述 |

### 存储字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| StorageAccountName | string | 存储账户名称 |
| OperationType | string | 操作类型 |
| EndToEndLatency | string | 端到端延迟 |
| ServerLatency | string | 服务器延迟 |
| RequestUrl | string | 请求 URL |

### CosmosDB 字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| cosmosdb_activityid | string | CosmosDB 活动 ID |
| cosmosdb_requestunits | long | CosmosDB RU 消耗 |
| cosmosdb_databasename | string | CosmosDB 数据库名 |
| cosmosdb_containerid | string | CosmosDB 容器 ID |

### 其他字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| Role | string | 角色 |
| RoleInstance | string | 角色实例 |
| Region | string | 区域 |
| ImageType | string | 镜像类型 |
| MediaType | string | 媒体类型 |
| BlobSize | long | Blob 大小 |

## 常用筛选字段

- `LoginServerName` - 按登录服务器筛选
- `SubscriptionId` - 按订阅筛选
- `CorrelationId` - 按关联 ID 追踪
- `OperationName` - 按操作名称筛选
- `env_time` - 按时间筛选

## 典型应用场景

1. **登录活动查询** - 查看 ACR 登录历史
2. **RP 操作追踪** - 追踪管理操作
3. **CosmosDB 性能分析** - 分析元数据操作
4. **存储操作分析** - 分析 Blob 操作

## 示例查询

### 查询登录活动
```kql
RPActivity
| where LoginServerName == "{registry}.azurecr.cn"
| where env_time > ago(7d)
| order by env_time desc
```

### 查询特定订阅的操作
```kql
RPActivity
| where SubscriptionId == "{subscriptionId}"
| where env_time > ago(1d)
| where Level != "Information"
| project env_time, OperationName, HttpMethod, HttpStatus, Message, ExceptionMessage
| order by env_time desc
```

### 分析 CosmosDB RU 消耗
```kql
RPActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(cosmosdb_requestunits)
| summarize TotalRU = sum(cosmosdb_requestunits), 
            AvgRU = avg(cosmosdb_requestunits),
            MaxRU = max(cosmosdb_requestunits) 
  by bin(env_time, 1h)
| order by env_time desc
```

## 关联表

- [RegistryMasterData.md](./RegistryMasterData.md) - 注册表配置
- [RegistryActivity.md](./RegistryActivity.md) - 注册表活动日志
- [WorkerServiceActivity.md](./WorkerServiceActivity.md) - Worker 服务活动

## 注意事项

- 使用 `LoginServerName` 或 `RegistryLoginUri` 筛选注册表
- `env_time` 和 `PreciseTimeStamp` 都可用于时间筛选
- 包含来自多个来源的日志，字段可能因来源不同而有所差异
