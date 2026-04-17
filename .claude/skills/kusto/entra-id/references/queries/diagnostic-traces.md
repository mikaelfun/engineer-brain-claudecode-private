---
name: diagnostic-traces
description: ESTS 诊断跟踪查询
tables:
  - DiagnosticTracesIfx
  - UserErrorsIfx
  - PerRequestTableIfx
parameters:
  - name: correlationId
    required: true
    description: 关联 ID
  - name: startTime
    required: true
    description: 开始时间 (ISO 8601 格式)
  - name: endTime
    required: true
    description: 结束时间 (ISO 8601 格式)
---

# ESTS 诊断跟踪查询

## 用途

获取详细的诊断消息和异常信息，用于深入分析登录失败的根本原因。

## 查询 1: 联合诊断跟踪和用户错误表

### 查询语句

```kql
union cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').DiagnosticTracesIfx,
      cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').UserErrorsIfx
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * contains "{correlationId}"
| extend Messages = strcat(Message, Exception, ',RequestId:', RequestId)
| extend env_name = substring(env_name, 25)
| project env_time, env_name, CorrelationId, Result, Messages
| order by env_time asc
```

---

## 查询 2: 联合登录请求和诊断跟踪

### 查询语句

```kql
union cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx,
      cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').DiagnosticTracesIfx
| where env_time > ago(15d)
| where CorrelationId == "{correlationId}"
// | where TenantId == "{tenantId}"
// | where UserPrincipalObjectID == "{userId}"
| project env_time, Message, CorrelationId, RequestId, ClientTypeForConditionalAccess, 
    TenantId, Result, ApplicationId, ResourceId, ErrorCode, MdmAppId, 
    IsDeviceCompliantAndManaged, DeviceTrustType, MfaStatus, ClientIp, DeviceId, 
    ApplicationDisplayName, ConditionalAccessAppIdentifier1, ConditionalAccessAppId1Decision, 
    ConditionalAccessAppIdentifier2, ConditionalAccessAppId2Decision, 
    ConditionalAccessVerboseData, MultiCAEvaluationLog, MultiConditionalAccessStatus, 
    SourcesOfMfaRequirement, ClientInfo, Client
| limit 1000
```

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| Message | 诊断消息内容 |
| Exception | 异常信息（如果有） |
| Result | 结果状态 |
| env_name | 环境/节点名称 |

---

## ITData 和 OTData 说明

| 字段 | 说明 |
|------|------|
| ITData | 输入数据 (Input Token Data) - 如 refresh token 或密码 |
| OTData | 输出数据 (Output Token Data) - 如 access token, id token, refresh token |

## 关联查询

- [signin-logs.md](./signin-logs.md) - 基础登录查询
- [conditional-access-decode.md](./conditional-access-decode.md) - 条件访问策略解码
