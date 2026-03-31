---
name: StorageAccountLogs
database: acrprodmc
cluster: https://acrmc2.chinaeast2.kusto.chinacloudapi.cn
description: ACR 存储账户日志，用于分析镜像层下载/上传性能
status: active
---

# StorageAccountLogs

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://acrmc2.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | acrprodmc |
| 状态 | ✅ 可用 |

## 用途

记录 ACR 与 Azure Storage 交互的日志，用于分析镜像层下载/上传性能、存储延迟等。

## 关键字段

### 时间字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 环境时间 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| RequestStartTime | string | 请求开始时间 |
| LastModifiedTime | string | 最后修改时间 |

### 请求字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| RequestUrl | string | 请求 URL |
| OperationType | string | 操作类型 (GetBlob/PutBlob 等) |
| ClientRequestId | string | 客户端请求 ID |
| RequestIdHeader | string | 请求 ID Header |
| RequestVersionHeader | string | API 版本 |

### 性能字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| EndToEndLatency | string | 端到端延迟 |
| ServerLatency | string | 服务器延迟 |
| RequestPacketSize | long | 请求包大小 |
| ResponsePacketSize | long | 响应包大小 |
| RequestContentLength | long | 请求内容长度 |
| RequestHeaderSize | long | 请求头大小 |
| ResponseHeaderSize | long | 响应头大小 |

### 状态字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| HttpStatusCode | string | HTTP 状态码 |
| RequestStatus | string | 请求状态 |

### 账户字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| OwnerAccountName | string | 拥有者账户名 |
| RequesterAccountName | string | 请求者账户名 |
| RequesterIPAddress | string | 请求者 IP |

### 其他字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| ReferrerHeader | string | Referrer 头 (包含 ACR 登录 URL) |
| UserAgentHeader | string | User Agent |
| ServiceType | string | 服务类型 |
| ConditionsUsed | string | 使用的条件 |
| ETagIdentifier | string | ETag 标识 |
| AuthenticationType | string | 认证类型 |

## 常用筛选字段

- `ReferrerHeader` - 按 ACR 注册表筛选
- `OperationType` - 按操作类型筛选 (GetBlob/PutBlob)
- `UserAgentHeader` - 按客户端类型筛选
- `env_time` - 按时间筛选

## 典型操作类型

| OperationType | 说明 |
|---------------|------|
| GetBlob | 下载 Blob (Pull 层) |
| PutBlob | 上传 Blob (Push 层) |
| GetBlobProperties | 获取 Blob 属性 |
| HeadBlob | 检查 Blob 存在 |

## 示例查询

### 分析 Pull 层下载性能
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let registryloginurl = "{registry}.azurecr.cn";
StorageAccountLogs
| where env_time between((starttime-totimespan(1h)) .. (endtime+totimespan(1h)))
| where todatetime(RequestStartTime) between(starttime .. endtime)
| where OperationType == "GetBlob"
| where ReferrerHeader startswith (strcat("https://", registryloginurl))
| where UserAgentHeader contains "docker"
| extend EndToEndLatencyInSecond = totimespan(EndToEndLatency)/totimespan(1s)
| extend AzureBlobServerLatencyInSecond = totimespan(ServerLatency)/totimespan(1s)
| extend LayerSizeInMB = todouble(ResponsePacketSize)/1000/1000
| where ResponsePacketSize > 1000 and EndToEndLatencyInSecond > 1
| extend MBPerSecond = LayerSizeInMB/EndToEndLatencyInSecond
| project RequestStartTime, MBPerSecond, EndToEndLatencyInSecond, 
         AzureBlobServerLatencyInSecond, LayerSizeInMB, RequestUrl, ReferrerHeader
| sort by MBPerSecond asc
```

### 统计存储操作延迟
```kql
StorageAccountLogs
| where env_time > ago(1d)
| where ReferrerHeader contains "{registry}.azurecr.cn"
| extend LatencySeconds = totimespan(EndToEndLatency)/totimespan(1s)
| summarize 
    AvgLatency = avg(LatencySeconds),
    P50Latency = percentile(LatencySeconds, 50),
    P95Latency = percentile(LatencySeconds, 95),
    P99Latency = percentile(LatencySeconds, 99),
    Count = count()
  by OperationType, bin(env_time, 1h)
| order by env_time desc
```

### 检查存储错误
```kql
StorageAccountLogs
| where env_time > ago(1d)
| where ReferrerHeader contains "{registry}.azurecr.cn"
| where toint(HttpStatusCode) >= 400
| project env_time, OperationType, HttpStatusCode, RequestStatus, 
         RequestUrl, RequesterIPAddress, UserAgentHeader
| order by env_time desc
```

## 关联表

- [RegistryActivity.md](./RegistryActivity.md) - 注册表活动日志

## 注意事项

- `EndToEndLatency` 和 `ServerLatency` 是 timespan 字符串，需要使用 `totimespan()` 转换
- 使用 `ReferrerHeader` 筛选特定注册表的存储操作
- `ResponsePacketSize` 用于 GetBlob，`RequestContentLength` 用于 PutBlob
- 时间查询建议扩大范围以覆盖时区差异
