---
name: WorkerServiceActivity
database: acrprodmc
cluster: https://acrmc2.chinaeast2.kusto.chinacloudapi.cn
description: ACR Worker 服务活动日志，用于 Manifest 统计等
status: active
---

# WorkerServiceActivity

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://acrmc2.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | acrprodmc |
| 状态 | ✅ 可用 |

## 用途

记录 ACR Worker 服务的活动日志，用于统计 Manifest 数量、列出 Tags、分析后台操作等。

## 关键字段

### 时间和标识字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 环境时间 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| CorrelationId | string | 关联 ID |
| MessageId | string | 消息 ID |

### 注册表字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| RegistryLoginUri | string | 注册表登录 URI |
| RegistryId | string | 注册表 ID |
| RegistryName | string | 注册表名称 |
| StorageAccountName | string | 存储账户名称 |

### 镜像字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| Repository | string | 仓库名称 |
| Digest | string | 镜像摘要 |
| Tag | string | 镜像标签 |
| ImageType | string | 镜像类型 |
| MediaType | string | 媒体类型 |
| BlobSize | long | Blob 大小 |

### 操作字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| OperationName | string | 操作名称 |
| Message | string | 日志消息 |
| Level | string | 日志级别 |
| DurationMs | long | 持续时间 (毫秒) |

### 错误字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| Exception | string | 异常信息 |
| ExceptionMessage | string | 异常消息 |
| error | string | 错误信息 |
| error_description | string | 错误描述 |

### 复制字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| ReplicationStorageAccount | string | 复制存储账户 |
| ReplicationStorageContainer | string | 复制存储容器 |

## 常用筛选字段

- `RegistryLoginUri` - 按注册表筛选
- `OperationName` - 按操作名称筛选
- `Repository` - 按仓库筛选
- `env_time` - 按时间筛选

## 典型操作名称

| OperationName | 说明 |
|---------------|------|
| ACR.Layer: ExecuteOperationOnListManifestsAsync | 列出 Manifest |
| ACR.Replication | 复制操作 |
| ACR.Garbage | 垃圾回收 |

## 示例查询

### 统计 Manifest 数量
```kql
WorkerServiceActivity
| where env_time > ago(7d)
| where OperationName == "ACR.Layer: ExecuteOperationOnListManifestsAsync"
| where RegistryLoginUri == "{registry}.azurecr.cn"
| extend numManifests = toint(substring(Message, 52, strlen(Message) - 11 - 52))
| summarize numManifests = sum(numManifests) by bin(env_time, 1d), RegistryId, 
         RegistryLoginUri, ImageType
```

### 列出 Tags
```kql
WorkerServiceActivity 
| where env_time > ago(2d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| extend Count = 1
| distinct Repository, Tag, Digest, Count
```

### 查询复制操作
```kql
WorkerServiceActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where OperationName contains "Replication"
| project env_time, OperationName, Message, Repository, Digest, 
         ReplicationStorageAccount, DurationMs, Level
| order by env_time desc
```

### 查询错误
```kql
WorkerServiceActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where Level != "Information" or isnotempty(Exception)
| project env_time, OperationName, Message, Exception, ExceptionMessage, error
| order by env_time desc
```

## 关联表

- [RegistryMasterData.md](./RegistryMasterData.md) - 注册表配置
- [RPActivity.md](./RPActivity.md) - RP 活动日志

## 注意事项

- 使用 `RegistryLoginUri` 筛选特定注册表，格式为 `myacr.azurecr.cn`
- `Message` 字段格式可能因操作类型不同而变化
- Manifest 统计查询依赖特定的 Message 格式
