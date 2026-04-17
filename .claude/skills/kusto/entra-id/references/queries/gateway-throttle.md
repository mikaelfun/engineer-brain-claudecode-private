---
name: gateway-throttle
description: AAD Gateway 节流检测查询
tables:
  - RequestSummaryEventCore
parameters:
  - name: tenantId
    required: true
    description: 目标租户 ID (TargetTenantId)
---

# AAD Gateway 节流检测查询

## 用途

检测租户是否被节流，分析 AAD Gateway 的请求状态。

## 查询 1: 检查租户是否被节流（联合查询双集群）

### 查询语句

```kql
union cluster('idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn').database('AADGatewayProd').table('RequestSummaryEventCore'), 
      cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('AADGatewayProd').table('RequestSummaryEventCore')
| where env_time > ago(1d)
| where AdditionalParameters has "ThrottleEnforcement"
| where TargetTenantId == "{tenantId}"
| take 1000
```

---

## 查询 2: 基础网关事件查询

### 查询语句

```kql
cluster('idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn').database('AADGatewayProd').RequestSummaryEventCore
| where env_time > ago(1d)
| where TargetTenantId == "{tenantId}"
| project env_time, EffectiveStatusCode, ClientRequestId, TargetService, IncomingUrl, IsThrottled
```

---

## 查询 3: 节流请求统计

### 查询语句

```kql
cluster('idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn').database('AADGatewayProd').RequestSummaryEventCore
| where env_time > ago(1d)
| where TargetTenantId == "{tenantId}"
| summarize 
    TotalRequests = count(),
    ThrottledCount = countif(IsThrottled == true),
    BlockedCount = countif(IsBlocked == true)
| extend ThrottleRate = round(100.0 * ThrottledCount / TotalRequests, 2)
```

---

## 查询 4: 错误请求分析

### 查询语句

```kql
cluster('idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn').database('AADGatewayProd').RequestSummaryEventCore
| where env_time > ago(1d)
| where TargetTenantId == "{tenantId}"
| where toint(StatusCode) >= 400
| summarize count() by StatusCode, TargetService
| order by count_ desc
```

---

## 双集群说明

AAD Gateway 服务部署在两个区域，查询时需要联合查询以获取完整数据：
- **BJB**: `idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn`
- **SHA**: `idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn`

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| TargetTenantId | 目标租户 ID |
| IsThrottled | 是否被节流 |
| IsBlocked | 是否被阻止 |
| EffectiveStatusCode | 有效状态码 |
| TargetService | 目标服务 |
| IncomingUrl | 请求 URL |
| AdditionalParameters | 附加参数（包含节流信息） |

## 关联查询

- [signin-logs.md](./signin-logs.md) - 登录日志查询
- [mfa-detail.md](./mfa-detail.md) - MFA 详情查询
