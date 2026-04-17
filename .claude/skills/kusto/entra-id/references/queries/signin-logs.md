---
name: signin-logs
description: ESTS 登录日志查询
tables:
  - PerRequestTableIfx
parameters:
  - name: correlationId
    required: false
    description: 关联 ID（ESTS CorrelationId）
  - name: tenantId
    required: false
    description: 租户 ID
  - name: userId
    required: false
    description: 用户对象 ID (UserPrincipalObjectID)
  - name: deviceId
    required: false
    description: 设备 ID
  - name: startTime
    required: true
    description: 开始时间 (ISO 8601 格式)
  - name: endTime
    required: true
    description: 结束时间 (ISO 8601 格式)
---

# ESTS 登录日志查询

## 用途

查询 Entra ID (Azure AD) 登录请求详情，包括认证结果、条件访问评估、设备信息等。

## 查询 1: 按 CorrelationId 基础查询

### 查询语句

```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time between (datetime({startTime})..datetime({endTime}))
| where CorrelationId =~ "{correlationId}" or TenantId =~ "{tenantId}"
| project env_time, CorrelationId, ErrorCode, ApplicationDisplayName, Result, 
         MaskedResponse, HttpStatusCode, UserPrincipalObjectID, DeviceId
| order by env_time desc
```

---

## 查询 2: 完整登录详情（含条件访问）

### 查询语句

```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time > ago(30d)
| where UserPrincipalObjectID == "{userId}"
| where DeviceId == "{deviceId}"
// | where ApplicationDisplayName contains "Windows Sign In"
// | where CorrelationId == "{correlationId}"
| project Tenant, env_time, CorrelationId, RequestId, ClientTypeForConditionalAccess, 
    Result, OTData, ITData, ApplicationId, ResourceId, ErrorCode, MdmAppId, 
    IsDeviceCompliantAndManaged, DeviceTrustType, MfaStatus, ClientIp, DeviceId, 
    ApplicationDisplayName, ConditionalAccessAppIdentifier1, ConditionalAccessAppId1Decision, 
    ConditionalAccessAppIdentifier2, ConditionalAccessAppId2Decision, 
    ConditionalAccessVerboseData, MultiCAEvaluationLog, MultiConditionalAccessStatus, 
    SourcesOfMfaRequirement, ClientInfo, Client
| sort by env_time asc
```

---

## 查询 3: 按用户和设备查询

### 查询语句

```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where TenantId == "{tenantId}"
| where UserPrincipalObjectID == "{userId}"
| where DeviceId == "{deviceId}"
| where env_time > datetime({startTime}) and env_time < datetime({endTime})
| project env_time, CorrelationId, RequestId, DeviceId, IsInteractive, ClientApplication, 
    ClientIp, ApplicationDisplayName, ResourceId, ResourceDisplayName, Result, 
    ErrorCode, ErrorNo, ITData, OTData
```

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| CorrelationId | 关联 ID，用于跨服务追踪 |
| RequestId | 请求 ID |
| ErrorCode | 错误代码（如 AADSTS50076 = 需要 MFA） |
| Result | 结果（Success / Failure） |
| MultiCAEvaluationLog | 条件访问策略评估日志 |
| MfaStatus | MFA 状态 |
| IsDeviceCompliantAndManaged | 设备是否合规且受管理 |
| DeviceTrustType | 设备信任类型 |
| ITData | 输入令牌数据（如 refresh token） |
| OTData | 输出令牌数据（如 access token, id token） |

## 关联查询

- [conditional-access-decode.md](./conditional-access-decode.md) - 解码条件访问策略
- [diagnostic-traces.md](./diagnostic-traces.md) - 获取详细诊断信息
- [mfa-detail.md](./mfa-detail.md) - 查询 MFA 详情（使用 CorrelationId 作为 TrackingID）
