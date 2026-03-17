---
name: CappWebSvcRequest
database: idmfacne
cluster: https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn
description: MFA CAPP 服务请求日志表，记录与外部 SMS/Voice 提供商的通信
status: active
---

# CappWebSvcRequest

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn (SHA) |
| 备用集群 | https://idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn (BJB) |
| 数据库 | idmfacne |
| 状态 | ✅ 可用 |

## 用途

MFA CAPP (Call and Presence Provider) 服务请求日志表，用于：
- 与外部 SMS/Voice 提供商的通信记录
- 电话呼叫和短信发送详情
- 外部提供商响应分析
- 通信故障排查

## 关键字段

### 标识字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间戳 | 2026-01-01T00:00:00Z |
| PreciseTimeStamp | datetime | 精确时间戳 | 2026-01-01T00:00:00.000Z |
| TenantId | string | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| UserObjectId | string | 用户对象 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| ClientRequestId | string | 客户端请求 ID | - |
| GatewayRequestId | string | 网关请求 ID | - |
| MessageId | string | 消息 ID | - |
| MiseCorrelationId | string | MISE 关联 ID | - |

### 请求信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| ControllerName | string | 控制器名称 | - |
| ActionName | string | 操作名称 | - |
| RequestType | string | 请求类型 | - |
| RequestSubType | string | 请求子类型 | - |
| HttpMethod | string | HTTP 方法 | POST, GET |
| ProviderNames | string | 提供商名称 | - |
| ProviderMessageId | string | 提供商消息 ID | - |

### 响应信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| HttpResponseCode | long | HTTP 响应码 | 200, 400, 500 |
| HttpResponseCodeName | string | HTTP 响应码名称 | OK, BadRequest |
| HttpResponseCodeIsSuccess | bool | 响应是否成功 | true, false |
| AuthenticationResult | string | 认证结果 | - |
| ExDetails | string | 异常详情 | - |

### 用户信息字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| CountryCode | string | 国家代码 |
| CountryName | string | 国家名称 |
| TrafficType | string | 流量类型 |

### 环境字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| ServiceName | string | 服务名称 |
| Role | string | 角色 |
| Region | string | 区域 |
| DataCenter | string | 数据中心 |
| ScaleUnit | string | 规模单元 |
| GatewayDatacenter | string | 网关数据中心 |
| RequestorId | string | 请求者 ID |

## 常用筛选字段

- `env_time` - 按时间筛选
- `TenantId` - 按租户 ID 筛选
- `UserObjectId` - 按用户对象 ID 筛选
- `HttpResponseCodeIsSuccess` - 按请求成功/失败筛选
- `CountryCode` - 按国家代码筛选
- `ProviderNames` - 按提供商筛选

## 典型应用场景

1. **短信发送失败排查**: 查看外部提供商响应
2. **电话呼叫问题诊断**: 分析通话请求详情
3. **国家/地区通信问题**: 按国家代码筛选分析
4. **提供商性能分析**: 统计各提供商成功率

## 示例查询

### 按用户查询

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').CappWebSvcRequest
| where env_time >= datetime({startTime}) and env_time < datetime({endTime})
| where UserObjectId == "{userId}"
| project env_time, TenantId, UserObjectId, ControllerName, ActionName, 
    HttpResponseCode, HttpResponseCodeIsSuccess, CountryCode, ProviderNames, ExDetails
```

### 失败请求分析

```kql
CappWebSvcRequest
| where env_time > ago(1d)
| where TenantId == "{tenantId}"
| where HttpResponseCodeIsSuccess == false
| project env_time, UserObjectId, ControllerName, HttpResponseCode, HttpResponseCodeName, ExDetails, CountryCode
| order by env_time desc
```

### 按国家统计

```kql
CappWebSvcRequest
| where env_time > ago(1d)
| where TenantId == "{tenantId}"
| summarize 
    TotalRequests = count(),
    SuccessCount = countif(HttpResponseCodeIsSuccess == true),
    FailureCount = countif(HttpResponseCodeIsSuccess == false)
    by CountryCode, CountryName
| extend SuccessRate = round(100.0 * SuccessCount / TotalRequests, 2)
| order by FailureCount desc
```

### 提供商成功率

```kql
CappWebSvcRequest
| where env_time > ago(7d)
| where isnotempty(ProviderNames)
| summarize 
    TotalRequests = count(),
    SuccessCount = countif(HttpResponseCodeIsSuccess == true)
    by ProviderNames
| extend SuccessRate = round(100.0 * SuccessCount / TotalRequests, 2)
| order by SuccessRate asc
```

## 关联表

- [SASCommonEvent.md](./SASCommonEvent.md) - MFA 通用事件日志
- [SASRequestEvent.md](./SASRequestEvent.md) - MFA 请求事件

## 注意事项

- 📊 **日志保留期**: 约 10 天
- 🌐 **双集群**: BJB (chinanorth2) 和 SHA (chinaeast2) 两个集群
- 📞 **外部通信**: 记录与 SMS/Voice 提供商的通信详情
- ⚠️ **表名变更**: 文档中的 AllCappWebSvcRequests 实际表名为 CappWebSvcRequest

---

> 文档版本: 1.0  
> 最后更新: 2026-01-14  
> 数据来源: .show table CappWebSvcRequest schema as json
