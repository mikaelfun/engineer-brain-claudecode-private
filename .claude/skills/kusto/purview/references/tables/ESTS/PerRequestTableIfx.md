---
name: PerRequestTableIfx
database: ESTS
cluster: https://estscnn2.chinanorth2.kusto.chinacloudapi.cn
description: AAD 登录请求日志，可用于 RMS 认证分析
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

记录 Azure AD (ESTS) 登录请求日志。对于 Purview/RMS 场景，可用于查询访问 Azure RMS 服务的认证请求。

**Azure RMS ResourceId**: `00000012-0000-0000-c000-000000000000`

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间 |
| CorrelationId | string | 关联 ID |
| ErrorCode | string | 错误码 (AADSTS 错误) |
| Result | string | 结果 |
| ApplicationId | string | 应用程序 ID |
| ApplicationDisplayName | string | 应用程序显示名称 |
| ResourceId | string | 资源 ID |
| ResourceDisplayName | string | 资源显示名称 |
| Client | string | 客户端信息 |
| ClientIp | string | 客户端 IP |
| RequestId | string | 请求 ID |
| HttpStatusCode | int | HTTP 状态码 |
| HttpMethod | string | HTTP 方法 |
| Tenant | string | 租户 |
| TenantId | string | 租户 ID |
| UserTenantId | string | 用户租户 ID |
| UserPrincipalObjectID | string | 用户主体对象 ID |
| ServicePrincipalObjectID | string | 服务主体对象 ID |
| DeviceId | string | 设备 ID |
| DomainName | string | 域名 |
| FaultDomain | string | 故障域 |
| UserTenantMfaStatus | string | 用户租户 MFA 状态 |
| LastPasswordChangeTimestamp | string | 上次密码更改时间 |
| MaskedResponse | string | 掩码响应 |
| VerificationCert | string | 验证证书 |
| Call | string | 调用信息 |
| OriginalHost | string | 原始主机 |
| ThrTenant | string | 线程租户 |
| OTData | string | OT 数据 |
| ITData | string | IT 数据 |

## 常用筛选字段

- `CorrelationId` - 按关联 ID 筛选
- `TenantId` / `Tenant` / `UserTenantId` - 按租户 ID 筛选
- `UserPrincipalObjectID` - 按用户 ID 筛选
- `ResourceId` - 按资源 ID 筛选 (RMS = 00000012-0000-0000-c000-000000000000)
- `ErrorCode` - 按错误码筛选

## 典型应用场景

1. **RMS 登录失败排查** - 查询 ResourceId = Azure RMS 的登录请求
2. **AADSTS 错误分析** - 查询特定 ErrorCode 的请求
3. **条件访问阻止** - 查询被 CA 策略阻止的请求

## 示例查询

### 查询 Azure RMS 登录请求
```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where TenantId =~ "{tenantId}" or Tenant =~ "{tenantId}" or UserTenantId =~ "{tenantId}"
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| project env_time, CorrelationId, ErrorCode, Result, ApplicationDisplayName, 
         ClientIp, ResourceDisplayName, HttpStatusCode, UserPrincipalObjectID
| order by env_time desc
```

### 按 correlationId 查询登录详情
```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where CorrelationId =~ "{correlationId}"
| project env_time, CorrelationId, ErrorCode, Result, ApplicationDisplayName, Client,
         ResourceId, ResourceDisplayName, ClientIp, HttpStatusCode, Tenant, TenantId,
         UserTenantId, UserPrincipalObjectID, DeviceId
| order by env_time asc
```

## 关联表

- [DiagnosticTracesIfx.md](./DiagnosticTracesIfx.md) - 诊断跟踪（详细错误信息）
- [IFxRequestLogEvent.md](./IFxRequestLogEvent.md) - RMS 请求日志

## 注意事项

- 字段名区分大小写，如 `CorrelationId`（非 `correlationId`）
- Azure RMS ResourceId 固定为 `00000012-0000-0000-c000-000000000000`
