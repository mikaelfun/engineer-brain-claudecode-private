---
name: RegistryActivity
database: acrprodmc
cluster: https://acrmc2.chinaeast2.kusto.chinacloudapi.cn
description: ACR 注册表活动日志，包含 Push/Pull/认证等操作
status: active
---

# RegistryActivity

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://acrmc2.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | acrprodmc |
| 状态 | ✅ 可用 |

## 用途

记录 ACR 注册表的所有活动日志，包括 Docker Push/Pull、认证、API 请求等。是 ACR 故障排查的核心表。

## 关键字段

### 时间和标识字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| activitytimestamp | datetime | 活动时间戳 |
| correlationid | string | 请求关联 ID |
| http_request_id | string | HTTP 请求 ID |

### HTTP 请求字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| http_request_host | string | 请求主机 (xxx.azurecr.cn) |
| http_request_method | string | HTTP 方法 (GET/PUT/PATCH/DELETE) |
| http_request_uri | string | 请求 URI |
| http_request_remoteaddr | string | 客户端 IP |
| http_request_useragent | string | User Agent |
| http_request_bodylength | string | 请求体大小 |
| http_request_contentlength | string | Content-Length |

### HTTP 响应字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| http_response_status | string | 响应状态码 |
| http_response_duration | string | 响应时间 (毫秒) |
| http_response_written | string | 响应写入字节数 |

### 错误字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| level | string | 日志级别 (info/warning/error) |
| message | string | 日志消息 |
| err_code | string | 错误代码 |
| err_message | string | 错误消息 |
| err_detail | string | 错误详情 |
| be_err_code | string | 后端错误代码 |
| be_err_message | string | 后端错误消息 |
| be_err_detail | string | 后端错误详情 |

### 认证字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| auth_registry | string | 认证注册表 |
| auth_user_name | string | 认证用户名 |
| auth_token_access | string | Token 访问权限 |
| auth_token_issued | string | Token 签发时间 |
| auth_token_expiresin | string | Token 过期时间 |
| auth_token_service | string | Token 服务 |

### 镜像字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| vars_name | string | 镜像仓库名称 |
| vars_digest | string | 镜像摘要 |
| vars_reference | string | 镜像引用/标签 |

### 其他字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| service | string | 服务名称 |
| Tenant | string | 租户 |
| acr_ratelimiter_remainingrequestvalue | string | 限流剩余请求数 |

## 常用筛选字段

- `http_request_host` - 按注册表筛选
- `correlationid` - 按关联 ID 追踪
- `level` - 按日志级别筛选 (error/warning/info)
- `http_response_status` - 按响应状态码筛选
- `message` - 按消息类型筛选

## 典型消息类型

| message 值 | 说明 |
|------------|------|
| fe_request_stop | 前端请求结束 |
| ts_request_stop | Token Service 请求结束 |
| nginx* | Nginx 层日志 |
| auth_* | 认证相关日志 |

## 示例查询

### 查询所有错误
```kql
RegistryActivity
| where activitytimestamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where level == "error"
| where http_request_method != "HEAD"
| project PreciseTimeStamp, vars_name, message, err_message, err_detail, http_request_method, 
         http_response_status, http_request_uri, http_request_remoteaddr, http_request_useragent, 
         correlationid, level
| order by PreciseTimeStamp asc
```

### 根据 correlationId 追踪
```kql
RegistryActivity
| where correlationid == "{correlationId}"
| project activitytimestamp, message, auth_token_access, correlationid, err_code, err_detail, 
         err_message, http_request_host, http_request_id, http_request_method, http_request_uri, 
         http_response_status, level, service
| order by activitytimestamp asc
```

### Push 性能分析
```kql
RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| extend ACRResponseDurationInSeconds = todouble(http_response_duration) / 1000
| where (http_request_method == "PATCH" and http_request_uri matches regex "/v2/.+/blobs/" and
        todouble(http_request_bodylength) > 512 and ACRResponseDurationInSeconds > 1)
        or (http_request_method == "PUT" and http_request_uri matches regex "/v2/.+/manifests/")
| where message == "fe_request_stop"
| extend ContentLengthInMB = todouble(http_request_bodylength)/1000/1000
| extend MBPerSecond = ContentLengthInMB / ACRResponseDurationInSeconds
| project PreciseTimeStamp, vars_name, MBPerSecond, ContentLengthInMB, 
         ACRResponseDurationInSeconds, http_request_method, http_request_uri
```

### 认证错误分析
```kql
RegistryActivity
| where PreciseTimeStamp > ago(2h)
| where level != "info"
| where http_request_host == "{registry}.azurecr.cn"
| project PreciseTimeStamp, activitytimestamp, message, auth_registry, auth_user_name, 
         correlationid, err_code, err_detail, err_message
| order by PreciseTimeStamp desc
```

## 关联表

- [RegistryMasterData.md](./RegistryMasterData.md) - 注册表配置
- [StorageAccountLogs.md](./StorageAccountLogs.md) - 存储层日志

## 注意事项

- 使用 `http_request_host` 筛选特定注册表，值为完整主机名如 `myacr.azurecr.cn`
- `http_response_duration` 单位是毫秒，需要除以 1000 转换为秒
- `level == "error"` 筛选错误日志
- `message == "fe_request_stop"` 表示请求完成，用于性能分析
