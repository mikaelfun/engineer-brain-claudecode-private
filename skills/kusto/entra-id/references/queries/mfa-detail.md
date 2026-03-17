---
name: mfa-detail
description: MFA 详细日志查询
tables:
  - SASCommonEvent
  - AllSASCommonEvents
  - SASRequestEvent
  - CappWebSvcRequest
parameters:
  - name: trackingId
    required: false
    description: 跟踪 ID（等于 ESTS CorrelationId）
  - name: tenantId
    required: false
    description: 租户 ID (contextId)
  - name: userId
    required: false
    description: 用户对象 ID (userObjectId)
  - name: startTime
    required: true
    description: 开始时间 (ISO 8601 格式)
  - name: endTime
    required: true
    description: 结束时间 (ISO 8601 格式)
---

# MFA 详细日志查询

## 用途

获取 MFA 认证的详细事件、错误消息、认证方法，用于诊断 MFA 失败问题。

## 查询 1: 按 TrackingID 查询

> **注意**: TrackingID = ESTS CorrelationId，用于跨服务关联

### 查询语句

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').SASCommonEvent
| where env_time between(datetime({startTime})..datetime({endTime}))
| where TrackingID has '{trackingId}'
// | where contextId has '{tenantId}'
// | where userObjectId has '{userId}'
| project env_time, loggingLevel, contextId, userObjectId, TrackingID, SourceCall, 
    Msg, ExceptionText, ScaleUnit, ApplicationId, OriginalRequestId, 
    SasInternalCorrelationId, SasSessionId, AuthenticationMethod
| limit 1000
```

---

## 查询 2: MFA 请求事件查询

### 查询语句

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').SASRequestEvent
| where env_time between(datetime({startTime})..datetime({endTime}))
| where TenantId == "{tenantId}"
| where UserObjectId == "{userId}"
| project UserObjectId, SasSessionId, env_time, ResultCode, IsSuccessfulAuthentication, AuthenticationMethod
```

---

## 查询 3: Regional Opt-In 阻止详情查询 ⭐推荐

> **场景**: 用户遇到 Error 399287 (TwoFactorAuthenticationBlockedByRepMap)，SMS/语音验证失败
> 
> **用途**: 确认是否因 Regional Opt-In 导致阻止，获取被阻止的国家/地区代码

### 查询语句

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').AllSASCommonEvents
| where env_time >= ago(10d)
| where TrackingID == "{trackingId}"  // TrackingID is ESTS correlation ID
| where Msg contains "BlockAllEnterpriseVoiceTrafficInCountryExceptAllowedTenants" 
    or Msg contains "BlockAllEnterpriseSmsTrafficInCountryExceptAllowedTenants"
| project env_time, loggingLevel, contextId, userObjectId, TrackingID, SourceCall, Msg, 
    ExceptionText, ScaleUnit, ApplicationId, OriginalRequestId, SasInternalCorrelationId, 
    SasSessionId, AuthenticationMethod
```

### 关键字段解读

| Msg 字段内容 | 说明 |
|-------------|------|
| `Reason: BlockAllEnterpriseSmsTrafficInCountryExceptAllowedTenants` | SMS 被国家策略阻止，需要 Opt-In |
| `Reason: BlockAllEnterpriseVoiceTrafficInCountryExceptAllowedTenants` | 语音呼叫被国家策略阻止，需要 Opt-In |
| `VerdictReason: SmsTrafficRequiresOptIn` | SMS 需要 Opt-In |
| `VerdictReason: VoiceTrafficRequiresOptIn` | 语音需要 Opt-In |
| `CountryCode: XX` | 被阻止的国家/地区代码（如 27=南非, 86=中国） |
| `Recommendation: Block` | RepMap 建议阻止 |
| `FullPhoneNumber: XXXX#######` | 用户电话号码（部分脱敏） |

### 解决方案

如确认为 Regional Opt-In 问题，需提交 CRI 工单：
- **Queue**: Identity Reputation Manage and Abuse Prevention > Telecom Queue
- **TSG**: `11.59[MFA]Opt-In for MFA Telephony Verification`
- **参考文档**: [Telephony Fraud Protections and Throttles](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mfa-regional-opt-in)
- **KB 文章**: `KB-EntraID-MFA-Telephony-Regional-OptIn-Required.md`

---

## 查询 4: 查询国家阻止策略日志 (旧表)

> **注意**: 优先使用查询 3 (AllSASCommonEvents)，此查询为备用

### 查询语句

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').SASCommonEvent
| where env_time between(datetime({startTime})..datetime({endTime}))
| where Msg contains 'BlockAllEnterpriseVoiceTrafficInCountryExceptAllowedTenants'
    or Msg contains 'BlockAllEnterpriseSmsTrafficInCountryExceptAllowedTenants'
| project env_time, contextId, userObjectId, Msg
```

---

## 查询 5: CAPP 外部提供商通信查询

### 查询语句

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').CappWebSvcRequest
| where env_time between(datetime({startTime})..datetime({endTime}))
| where UserObjectId == "{userId}"
| project env_time, TenantId, UserObjectId, ControllerName, 
    HttpResponseCode, HttpResponseCodeIsSuccess, CountryCode, ProviderNames, ExDetails
```

---

## 认证方法说明

| AuthenticationMethod | 说明 |
|---------------------|------|
| PhoneAppNotification | Authenticator App 推送通知 |
| PhoneAppOTP | Authenticator App 验证码 |
| SMS | 短信验证码 |
| OneWaySMS | 单向短信 |
| TwoWayVoiceMobile | 电话呼叫（双向语音） |
| TwoWayVoiceLandline | 固定电话呼叫 |

---

## 国家阻止策略标识

| 策略标识 | 说明 |
|---------|------|
| BlockAllEnterpriseVoiceTrafficInCountryExceptAllowedTenants | 电话呼叫被国家策略阻止 |
| BlockAllEnterpriseSmsTrafficInCountryExceptAllowedTenants | 短信被国家策略阻止 |

---

## 双集群说明

MFA 服务部署在两个区域，查询时可能需要联合查询：
- **BJB**: `idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn`
- **SHA**: `idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn`

## 结果字段说明

| 字段 | 说明 |
|------|------|
| TrackingID | 跟踪 ID（等于 ESTS CorrelationId） |
| Msg | 日志消息内容 |
| ExceptionText | 异常文本 |
| AuthenticationMethod | 使用的认证方法 |
| IsSuccessfulAuthentication | 认证是否成功 |
| ResultCode | 结果代码 |

## 关联查询

- [signin-logs.md](./signin-logs.md) - 获取 CorrelationId 用作 TrackingID
- [conditional-access-decode.md](./conditional-access-decode.md) - 检查是否有 MFA 策略要求
