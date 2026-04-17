---
name: conditional-access-decode
description: 条件访问策略评估解码
tables:
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

# 条件访问策略评估解码

## 用途

将 MultiCAEvaluationLog 字段解码为可读的策略 ID 和控制类型，用于分析条件访问策略的评估结果。

## 查询 1: 解码已应用的条件访问策略

### 查询语句

```kql
let SessionControls = datatable(SessionControlId:string, SessionControl:string) [
    "0", "NotSet",
    "1", "AppEnforcedRestrictions",
    "2", "CloudAppSecurity",
    "3", "SignInFrequency",
    "4", "PersistentBrowserSessionMode",
    "5", "Binding",
    "6", "AccessTokenLifetime"
];
let SupportedControls = datatable(SupportedControlId:string, ControlName:string) [
    "0", "NotSet",
    "1", "Block",
    "2", "Mfa",
    "3", "RequireCompliantDevice",
    "4", "RequireDomainJoinedDevice",
    "5", "RequireApprovedApp",
    "6", "RequireCompliantApp",
    "7", "FederatedMfa",
    "8", "FederatedCertAuth",
    "9", "MfaRegistration",
    "10", "MfaAndChangePassword"
];
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where CorrelationId == "{correlationId}"
| where env_time >= datetime({startTime}) and env_time <= datetime({endTime})
| where MultiCAEvaluationLog != "" and MultiCAEvaluationLog != "0|"
| project env_time, TenantId, UserPrincipalObjectID, RequestId, CorrelationId,
    ExternalClaimsProviderAppId, CALog=split(MultiCAEvaluationLog, "|")
| mv-expand CALog
| where CALog contains "=4,"  // only applied policies
| project env_time, TenantId, UserPrincipalObjectID, RequestId, CorrelationId,
    ExternalClaimsProviderAppId, CALog,
    PolicyId=tostring(split(CALog, "=", 0)[0]),
    Controls=tostring(split(CALog, ",", 3)[0]),
    ExternalControls=tostring(split(CALog, ",", 4)[0]),
    SessionControls=tostring(split(CALog, ",", 5)[0]),
    AreControlsAlreadySatisfied = tostring(split(CALog, ",", 7)[0])
| mv-expand SupportedControlId = split(Controls, ":")
| mv-expand ExternalControlId = split(ExternalControls, ":")
| mv-expand SessionControlId = split(SessionControls, ":")
| project env_time, TenantId, UserPrincipalObjectID, RequestId, CorrelationId,
    PolicyId, SupportedControlId=tostring(SupportedControlId),
    ExternalControl=iff(isnotempty(ExternalControlId), ExternalClaimsProviderAppId,""),
    SessionControlId=tostring(SessionControlId), AreControlsAlreadySatisfied
| lookup SessionControls on SessionControlId
| lookup SupportedControls on SupportedControlId
| project env_time, TenantId, PolicyId, ControlName, SessionControl,
    ExternalControl, AreControlsAlreadySatisfied, RequestId, CorrelationId
| order by RequestId
```

---

## 控制类型说明

| ID | ControlName | 说明 |
|----|-------------|------|
| 0 | NotSet | 未设置 |
| 1 | Block | 阻止访问 |
| 2 | Mfa | 要求多因素认证 |
| 3 | RequireCompliantDevice | 要求合规设备 |
| 4 | RequireDomainJoinedDevice | 要求域加入设备 |
| 5 | RequireApprovedApp | 要求已批准的应用 |
| 6 | RequireCompliantApp | 要求合规应用 |
| 7 | FederatedMfa | 联合 MFA |
| 8 | FederatedCertAuth | 联合证书认证 |
| 9 | MfaRegistration | MFA 注册 |
| 10 | MfaAndChangePassword | MFA 和更改密码 |

---

## 会话控制说明

| ID | SessionControl | 说明 |
|----|----------------|------|
| 0 | NotSet | 未设置 |
| 1 | AppEnforcedRestrictions | 应用强制限制 |
| 2 | CloudAppSecurity | 云应用安全 (MCAS) |
| 3 | SignInFrequency | 登录频率 |
| 4 | PersistentBrowserSessionMode | 持久浏览器会话模式 |
| 5 | Binding | 绑定 |
| 6 | AccessTokenLifetime | 访问令牌生命周期 |

---

## MultiCAEvaluationLog 格式说明

格式: `0|policyId=status,validation,conditions,controls,external,session,name,satisfied,...`

- **status=4** 表示策略已应用
- 使用 `|` 分隔多个策略
- 使用 `,` 分隔策略的各个字段

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| PolicyId | 条件访问策略 ID（GUID） |
| ControlName | 解码后的控制类型名称 |
| SessionControl | 解码后的会话控制类型 |
| ExternalControl | 外部声明提供程序（如果有） |
| AreControlsAlreadySatisfied | 控制条件是否已满足 |

## 关联查询

- [signin-logs.md](./signin-logs.md) - 基础登录查询
- [mfa-detail.md](./mfa-detail.md) - MFA 详情（如果策略要求 MFA）
