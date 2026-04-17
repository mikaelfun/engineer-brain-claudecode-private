---
name: rms-auth-tracking
description: Azure RMS 认证追踪查询
tables:
  - PerRequestTableIfx
  - DiagnosticTracesIfx
parameters:
  - name: starttime
    required: true
    description: 开始时间 (ISO 8601 格式)
  - name: endtime
    required: true
    description: 结束时间 (ISO 8601 格式)
  - name: tenantId
    required: false
    description: 租户 ID
  - name: correlationId
    required: false
    description: 关联 ID
  - name: userId
    required: false
    description: 用户对象 ID
---

# Azure RMS 认证追踪

## 用途

追踪 Azure RMS 服务的 Azure AD 认证请求，排查登录失败、条件访问阻止等问题。

**Azure RMS ResourceId**: `00000012-0000-0000-c000-000000000000`

---

## 查询 1: 查询 Azure RMS 登录请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID |
| {correlationId} | 否 | 关联 ID |
| {userId} | 否 | 用户对象 ID |

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where CorrelationId =~ targetid or Tenant =~ targetid or TenantId =~ targetid or UserTenantId =~ targetid
| where UserPrincipalObjectID contains userobjectId
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| project env_time, CorrelationId, ErrorCode, ApplicationDisplayName, Client, 
         ResourceId, ResourceDisplayName, ClientIp, RequestId, Result, 
         MaskedResponse, HttpStatusCode, HttpMethod, ApplicationId, 
         VerificationCert, Call, OriginalHost, Tenant, TenantId, UserTenantId, 
         ThrTenant, UserTenantMfaStatus, DeviceId, DomainName, FaultDomain, 
         UserPrincipalObjectID, ServicePrincipalObjectID, OTData, ITData, 
         LastPasswordChangeTimestamp
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| CorrelationId | 关联 ID |
| ErrorCode | AAD 错误码 (AADSTS) |
| ApplicationDisplayName | 应用程序名称 |
| ResourceDisplayName | 资源名称 (Azure RMS) |
| Result | 结果 |
| HttpStatusCode | HTTP 状态码 |
| ClientIp | 客户端 IP |
| TenantId | 租户 ID |
| UserPrincipalObjectID | 用户对象 ID |
| DeviceId | 设备 ID |
| UserTenantMfaStatus | MFA 状态 |

---

## 查询 2: 查询诊断跟踪日志 (AADSTS 错误详情)

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

### 用途

根据 correlationId 查询 AAD 登录失败的详细错误信息。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let correlationid = "{correlationId}";
DiagnosticTracesIfx
| where env_time between (starttime .. endtime)
| where CorrelationId == correlationid
| project env_time, Message, Exception
| extend haskeyvalue = iff(Message contains "AADSTS" or Exception contains "AADSTS", 1, 0)
| project env_time, Message, Exception, haskeyvalue
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| Message | 消息（可能包含 AADSTS 错误详情） |
| Exception | 异常信息 |
| haskeyvalue | 标记是否包含 AADSTS 错误 (1=是) |

---

## 查询 3: 统计 RMS 登录失败

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

### 用途

按错误码统计 Azure RMS 的登录失败情况。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| where TenantId =~ tenantid or Tenant =~ tenantid or UserTenantId =~ tenantid
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| where Result != "Success" and ErrorCode != ""
| summarize Count = count() by ErrorCode, ApplicationDisplayName
| order by Count desc
```

---

## 常见 AADSTS 错误码

| 错误码 | 说明 |
|--------|------|
| AADSTS50076 | 需要 MFA |
| AADSTS50105 | 用户未分配到应用程序 |
| AADSTS53003 | 被条件访问策略阻止 |
| AADSTS65001 | 用户未同意应用程序 |
| AADSTS70011 | 无效的请求范围 |
| AADSTS90072 | 用户租户禁用外部 IdP 访问 |

---

## 关联查询

- [mip-request-analysis.md](./mip-request-analysis.md) - MIP 请求日志分析
