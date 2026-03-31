---
name: SASRequestEvent
database: idmfacne
cluster: https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn
description: MFA SAS 服务请求事件表，记录 MFA 请求摘要信息
status: active
---

# SASRequestEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn (SHA) |
| 备用集群 | https://idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn (BJB) |
| 数据库 | idmfacne |
| 状态 | ✅ 可用 |

## 用途

MFA SAS 请求事件表，用于：
- MFA 请求摘要查询
- 认证结果统计
- 认证方法使用分析
- 性能指标分析

## 关键字段

### 标识字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间戳 | 2026-01-01T00:00:00Z |
| TenantId | string | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| UserObjectId | string | 用户对象 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| SasSessionId | string | SAS 会话 ID | - |
| SasInternalCorrelationId | string | SAS 内部关联 ID | - |
| ClientRequestId | string | 客户端请求 ID | - |
| ClientTrackingId | string | 客户端追踪 ID | - |
| GatewayRequestId | string | 网关请求 ID | - |

### 认证信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| AuthenticationMethod | string | 认证方法 | PhoneAppNotification, SMS |
| MfaMethods | string | MFA 方法列表 | - |
| ApplicationId | string | 应用 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| IsSuccessfulAuthentication | bool | 是否认证成功 | true, false |

### 结果字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| ResultCode | string | 结果代码 | - |
| ResultSummary | string | 结果摘要 | - |
| OperationName | string | 操作名称 | - |
| AdditionalDetails | string | 附加详情 | - |

### 用户环境字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| UserLocale | string | 用户区域设置 |
| UserCountryCode | string | 用户国家代码 |
| UserDeviceType | string | 用户设备类型 |
| AuthenticatorFlavor | string | Authenticator 类型 |
| AppVersion | string | 应用版本 |
| AppState | string | 应用状态 |
| PushNotificationType | string | 推送通知类型 |

### 性能字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TotalRequestTime | long | 总请求时间（毫秒） |
| OutboundCallSummary | string | 出站调用摘要 |

### 租户字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| ResourceTenantId | string | 资源租户 ID |
| HomeTenantId | string | 主租户 ID |
| DataBoundary | string | 数据边界 |

### 环境字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| DataCenter | string | 数据中心 |
| ScaleUnit | string | 规模单元 |
| Environment | string | 环境 |
| Cell | string | 单元 |
| AvailabilityZone | string | 可用区 |
| GatewayDatacenter | string | 网关数据中心 |

## 常用筛选字段

- `env_time` - 按时间筛选
- `TenantId` - 按租户 ID 筛选
- `UserObjectId` - 按用户对象 ID 筛选
- `SasSessionId` - 按 SAS 会话 ID 筛选
- `IsSuccessfulAuthentication` - 按认证成功/失败筛选
- `AuthenticationMethod` - 按认证方法筛选

## 典型应用场景

1. **MFA 请求统计**: 统计认证成功率
2. **认证方法分析**: 分析各认证方法使用情况
3. **性能分析**: 分析 MFA 请求耗时
4. **失败原因分析**: 查看失败请求的详情

## 示例查询

### 基础查询

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').SASRequestEvent
| where env_time >= datetime({startTime}) and env_time < datetime({endTime})
| where TenantId == "{tenantId}"
| where UserObjectId == "{userId}"
| project UserObjectId, SasSessionId, env_time, ResultCode, IsSuccessfulAuthentication, AuthenticationMethod
```

### 认证成功率统计

```kql
SASRequestEvent
| where env_time > ago(1d)
| where TenantId == "{tenantId}"
| summarize 
    TotalRequests = count(),
    SuccessCount = countif(IsSuccessfulAuthentication == true),
    FailureCount = countif(IsSuccessfulAuthentication == false)
| extend SuccessRate = round(100.0 * SuccessCount / TotalRequests, 2)
```

### 认证方法使用分布

```kql
SASRequestEvent
| where env_time > ago(7d)
| where TenantId == "{tenantId}"
| where isnotempty(AuthenticationMethod)
| summarize count() by AuthenticationMethod
| order by count_ desc
```

### 失败请求分析

```kql
SASRequestEvent
| where env_time > ago(1d)
| where TenantId == "{tenantId}"
| where IsSuccessfulAuthentication == false
| project env_time, UserObjectId, AuthenticationMethod, ResultCode, ResultSummary, AdditionalDetails
| order by env_time desc
| take 100
```

## 关联表

- [SASCommonEvent.md](./SASCommonEvent.md) - MFA 通用事件日志
- [CappWebSvcRequest.md](./CappWebSvcRequest.md) - 外部提供商通信日志

## 注意事项

- 📊 **日志保留期**: 约 10 天
- 🌐 **双集群**: BJB (chinanorth2) 和 SHA (chinaeast2) 两个集群
- ⚠️ **表名变更**: 文档中的 AllSASRequestEvents 实际表名为 SASRequestEvent

---

> 文档版本: 1.0  
> 最后更新: 2026-01-14  
> 数据来源: .show table SASRequestEvent schema as json
