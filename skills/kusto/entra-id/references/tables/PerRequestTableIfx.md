---
name: PerRequestTableIfx
database: ESTS
cluster: https://estscnn2.chinanorth2.kusto.chinacloudapi.cn
description: ESTS 认证请求详情表，记录所有 Entra ID 登录和令牌请求
status: active
---

# PerRequestTableIfx

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://estscnn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | ESTS |
| 状态 | ✅ 可用 |

## 用途

ESTS (Entra ID Token Service) 认证请求详情表，用于：
- 登录请求分析和故障排查
- 条件访问策略评估
- MFA 状态检查
- PRT (Primary Refresh Token) 令牌生成追踪
- 应用访问模式分析

## 关键字段

### 标识字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间戳 | 2026-01-01T00:00:00Z |
| CorrelationId | string | 请求关联 ID（跨表追踪） | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| RequestId | string | 请求 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| TenantId | string | 租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| UserPrincipalObjectID | string | 用户对象 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| ApplicationId | string | 应用程序 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| DeviceId | string | AAD 设备对象 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

### 认证结果字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| Result | string | 认证结果 | Success, Failure, Redirect |
| ErrorCode | string | 错误码 | AADSTS50076 |
| ErrorNo | long | 错误编号 | 50076 |
| HttpStatusCode | long | HTTP 状态码 | 200, 400, 401 |
| HttpMethod | string | HTTP 方法 | POST, GET |

### 应用和资源字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| ApplicationDisplayName | string | 应用显示名称 | Microsoft Teams |
| ResourceId | string | 资源 ID | 00000003-0000-0000-c000-000000000000 |
| ResourceDisplayName | string | 资源显示名称 | Microsoft Graph |
| Call | string | 调用方法（认证流程步骤） | GetOAuthToken |

### 设备和客户端字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| ClientIp | string | 客户端 IP 地址 | 10.0.0.1 |
| UserAgent | string | 用户代理 | Mozilla/5.0... |
| DevicePlatform | string | 设备平台 | Windows, iOS, Android |
| IsInteractive | bool | 是否为交互式登录 | true/false |
| ClientTypeForConditionalAccess | long | 条件访问的客户端类型 | 0-浏览器, 1-移动应用 |

### 条件访问字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| MultiCAEvaluationLog | string | 条件访问策略评估日志（原始格式） | 0\|policyId=4,... |
| MultiConditionalAccessStatus | long | 条件访问状态 | 0-成功, 1-失败 |
| IsDeviceCompliantAndManaged | bool | 设备是否合规且受管理 | true/false |
| DeviceTrustType | long | 设备信任类型 | 0-None, 1-AzureAD, 2-Hybrid |
| ConditionalAccessVerboseData | string | 条件访问详细数据 | JSON 格式 |
| ConditionalAccessAppIdentifier1 | string | 条件访问应用标识符1 | - |
| ConditionalAccessAppId1Decision | string | 条件访问应用1决策 | - |

### MFA 字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| MfaStatus | string | MFA 状态 | Completed, Required |
| MfaAuthMethod | string | MFA 认证方法 | PhoneAppNotification |
| SourcesOfMfaRequirement | long | MFA 要求来源 | 位掩码 |
| UserTenantMfaStatus | string | 用户租户 MFA 状态 | - |

### 令牌数据字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| ITData | string | 输入令牌数据（如 refresh token） | - |
| OTData | string | 输出令牌数据（如 access token） | - |
| MaskedResponse | string | 脱敏响应数据 | - |

## 常用筛选字段

- `env_time` - 按时间筛选（必须首先使用以利用分区）
- `CorrelationId` - 按关联 ID 精确查询
- `TenantId` - 按租户筛选
- `UserPrincipalObjectID` - 按用户筛选
- `ApplicationId` - 按应用筛选
- `ErrorCode` - 按错误码筛选

## 典型应用场景

1. **登录失败排查**: 根据 CorrelationId 或 UserPrincipalObjectID 查询失败原因
2. **条件访问分析**: 解析 MultiCAEvaluationLog 了解策略评估结果
3. **MFA 问题诊断**: 检查 MfaStatus 和 SourcesOfMfaRequirement
4. **设备合规问题**: 查看 IsDeviceCompliantAndManaged 和 DeviceTrustType
5. **PRT 令牌生成**: 筛选 UserAgent 为 Windows-AzureAD-Authentication-Provider/1.0

## 示例查询

### 基础查询 - 按 CorrelationId

```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time > ago(1d)
| where CorrelationId == "{correlationId}"
| project env_time, CorrelationId, ErrorCode, ApplicationDisplayName, Result, 
         MaskedResponse, HttpStatusCode, UserPrincipalObjectID, DeviceId
| order by env_time desc
```

### 按用户和设备查询

```kql
PerRequestTableIfx
| where env_time between (datetime({startDate})..datetime({endDate}))
| where TenantId == "{tenantId}"
| where UserPrincipalObjectID == "{userId}"
| where DeviceId == "{deviceId}"
| project env_time, CorrelationId, RequestId, DeviceId, IsInteractive, 
    ClientIp, ApplicationDisplayName, Result, ErrorCode
| order by env_time desc
```

### 条件访问详情查询

```kql
PerRequestTableIfx
| where env_time > ago(30d)
| where CorrelationId == "{correlationId}"
| project env_time, CorrelationId, Result, ErrorCode, 
    IsDeviceCompliantAndManaged, DeviceTrustType, MfaStatus,
    ConditionalAccessVerboseData, MultiCAEvaluationLog, MultiConditionalAccessStatus,
    SourcesOfMfaRequirement, ClientTypeForConditionalAccess
```

## 关联表

- [DiagnosticTracesIfx.md](./DiagnosticTracesIfx.md) - 诊断跟踪日志
- [UserErrorsIfx.md](./UserErrorsIfx.md) - 用户错误日志

## 注意事项

- ⚠️ **必须使用 ObjectId**: ESTS 日志不支持直接使用 UPN 查询，需先获取 ObjectId
- ⏱️ **时间范围前置**: 将时间过滤放在查询最前面以利用时间分区
- 📊 **日志保留期**: 约 30 天
- 🔍 **索引字段**: CorrelationId, RequestId, UserPrincipalObjectID, ApplicationId 为索引字段

---

> 文档版本: 1.0  
> 最后更新: 2026-01-14  
> 数据来源: .show table PerRequestTableIfx schema as json
