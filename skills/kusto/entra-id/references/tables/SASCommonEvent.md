---
name: SASCommonEvent
database: idmfacne
cluster: https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn
description: MFA SAS 服务通用事件日志表，记录 MFA 认证详细事件
status: active
---

# SASCommonEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn (SHA) |
| 备用集群 | https://idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn (BJB) |
| 数据库 | idmfacne |
| 状态 | ✅ 可用 |

## 用途

MFA SAS (Strong Authentication Service) 通用事件日志表，用于：
- MFA 认证详细流程追踪
- 电话/短信/推送通知验证
- 阻止策略排查
- 认证方法分析

## 关键字段

### 标识字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间戳 | 2026-01-01T00:00:00Z |
| TrackingID | string | 追踪 ID（对应 ESTS 的 CorrelationId） | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| contextId | string | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| userObjectId | string | 用户对象 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| SasSessionId | string | SAS 会话 ID | - |
| SasInternalCorrelationId | string | SAS 内部关联 ID | - |
| OriginalRequestId | string | 原始请求 ID | - |
| GatewayRequestId | string | 网关请求 ID | - |

### 认证信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| AuthenticationMethod | string | 认证方法 | PhoneAppNotification, SMS, TwoWayVoiceMobile |
| ApplicationId | string | 应用 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

### 日志信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| Msg | string | 事件消息（包含认证流程详情和阻止策略信息） | - |
| ExceptionText | string | 异常文本（失败时包含详细错误） | - |
| loggingLevel | string | 日志级别 | Information, Warning, Error |
| SourceCall | string | 源调用 | - |
| TraceType | string | 跟踪类型 | - |
| TraceCode | string | 跟踪代码 | - |
| TraceLevel | string | 跟踪级别 | - |

### 环境字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| ScaleUnit | string | 规模单元 |
| DataCenter | string | 数据中心 |
| GatewayDatacenter | string | 网关数据中心 |
| tenantName | string | 租户名称 |

## 常见认证方法

| 方法值 | 说明 |
|--------|------|
| PhoneAppNotification | Authenticator App 推送通知 |
| PhoneAppOTP | Authenticator App 验证码 |
| SMS | 短信验证码 |
| OneWaySMS | 单向短信 |
| TwoWayVoiceMobile | 电话呼叫（双向语音） |
| TwoWayVoiceLandline | 固定电话呼叫 |

## 特殊日志标识

| 标识 | 含义 |
|------|------|
| `BlockAllEnterpriseVoiceTrafficInCountryExceptAllowedTenants` | 电话呼叫被国家策略阻止 |
| `BlockAllEnterpriseSmsTrafficInCountryExceptAllowedTenants` | 短信被国家策略阻止 |

## 常用筛选字段

- `env_time` - 按时间筛选
- `TrackingID` - 按追踪 ID 查询（对应 ESTS CorrelationId）
- `userObjectId` - 按用户对象 ID 查询
- `contextId` - 按租户 ID 查询
- `AuthenticationMethod` - 按认证方法筛选
- `Msg` - 按消息内容搜索

## 典型应用场景

1. **MFA 详细流程追踪**: 根据 TrackingID 查询完整 MFA 流程
2. **国家阻止策略排查**: 搜索 Msg 包含 BlockAll 标识
3. **认证方法分析**: 统计不同认证方法的使用情况
4. **失败原因分析**: 查看 ExceptionText 获取详细错误

## 示例查询

### 按 TrackingID 查询（对应 ESTS CorrelationId）

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').SASCommonEvent
| where env_time >= datetime({startTime}) and env_time < datetime({endTime})
| where TrackingID == "{correlationId}"
| project env_time, loggingLevel, contextId, userObjectId, TrackingID, SourceCall, 
    Msg, ExceptionText, ScaleUnit, ApplicationId, OriginalRequestId, 
    SasInternalCorrelationId, SasSessionId, AuthenticationMethod
```

### 按用户查询

```kql
SASCommonEvent
| where env_time >= datetime({startTime}) and env_time < datetime({endTime})
| where userObjectId == "{userId}"
| project env_time, loggingLevel, TrackingID, Msg, AuthenticationMethod, ExceptionText
| limit 1000
```

### 查询国家阻止策略日志

```kql
SASCommonEvent
| where env_time > ago(1d)
| where Msg contains 'BlockAllEnterpriseVoiceTrafficInCountryExceptAllowedTenants'
    or Msg contains 'BlockAllEnterpriseSmsTrafficInCountryExceptAllowedTenants'
| project env_time, contextId, userObjectId, Msg
```

### 认证方法统计

```kql
SASCommonEvent
| where env_time > ago(1d)
| where contextId == "{tenantId}"
| where isnotempty(AuthenticationMethod)
| summarize count() by AuthenticationMethod
| order by count_ desc
```

## 关联表

- [SASRequestEvent.md](./SASRequestEvent.md) - MFA 请求事件
- [CappWebSvcRequest.md](./CappWebSvcRequest.md) - 外部提供商通信日志

## 注意事项

- 📊 **日志保留期**: 约 10 天
- 🌐 **双集群**: BJB (chinanorth2) 和 SHA (chinaeast2) 两个集群
- 🔗 **关联 ESTS**: TrackingID 等于 ESTS 的 CorrelationId
- ⚠️ **表名变更**: 文档中的 AllSASCommonEvents 实际表名为 SASCommonEvent

---

> 文档版本: 1.0  
> 最后更新: 2026-01-14  
> 数据来源: .show table SASCommonEvent schema as json
