---
name: RequestSummaryEventCore
database: AADGatewayProd
cluster: https://idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn
description: AAD Gateway 请求摘要事件表，记录网关请求详情和节流检测
status: active
---

# RequestSummaryEventCore

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn (BJB) |
| 备用集群 | https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn (SHA) |
| 数据库 | AADGatewayProd |
| 状态 | ✅ 可用 |

## 用途

AAD Gateway 请求摘要事件表，用于：
- 网关请求追踪
- 节流检测和分析
- 请求路由和转发分析
- 性能指标监控

## 关键字段

### 标识字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间戳 | 2026-01-01T00:00:00Z |
| ClientRequestId | string | 客户端请求 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| GatewayRequestId | string | 网关请求 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| TargetRequestId | string | 目标请求 ID | - |

### 目标信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| TargetTenantId | string | 目标租户 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| TargetAppId | string | 目标应用 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| TargetUserId | string | 目标用户 ID | - |
| TargetResourceId | string | 目标资源 ID | - |
| TargetService | string | 目标服务 | ESTS, MSODS, MFA |
| TargetHost | string | 目标主机 | - |
| TargetTrafficType | string | 目标流量类型 | - |

### 请求信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| IncomingUrl | string | 入站 URL | /common/oauth2/token |
| Method | string | HTTP 方法 | POST, GET |
| OriginalHost | string | 原始主机 | login.partner.microsoftonline.cn |
| ServicePartner | string | 服务合作伙伴 | - |
| Headers | string | 请求头 | - |
| UserAgent | string | 用户代理 | - |

### 响应信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| StatusCode | string | 状态码 | 200, 400, 401 |
| EffectiveStatusCode | string | 有效状态码 | - |
| ResponseHeaders | string | 响应头 | - |

### 节流信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| AdditionalParameters | string | 附加参数（包含节流信息） | ThrottleEnforcement=... |
| IsThrottled | bool | 是否被节流 | true, false |
| IsFiltered | bool | 是否被过滤 | true, false |
| IsBlocked | bool | 是否被阻止 | true, false |
| IsTarpited | bool | 是否被限速 | true, false |

### 性能字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TotalGatewayTime | long | 网关总耗时（毫秒） |
| TargetRequestTime | long | 目标请求耗时（毫秒） |
| GatewaySpecificTime | long | 网关特定耗时（毫秒） |
| DnsTime | long | DNS 解析时间 |
| RequestTryCount | long | 请求重试次数 |
| BytesReceived | long | 接收字节数 |

### 环境字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| Datacenter | string | 数据中心 |
| ScaleUnit | string | 规模单元 |
| Environment | string | 环境 |
| Slice | string | 切片 |
| Ring | string | 部署环 |
| callerIpAddress | string | 调用者 IP 地址 |
| CustomerRegion | string | 客户区域 |

### 路由字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TargetEnvironment | string | 目标环境 |
| TargetDatacenter | string | 目标数据中心 |
| TargetSlice | string | 目标切片 |
| FaultDomainName | string | 故障域名称 |
| AttemptedTargets | string | 尝试的目标 |

## 常用筛选字段

- `env_time` - 按时间筛选
- `TargetTenantId` - 按目标租户 ID 筛选
- `TargetService` - 按目标服务筛选
- `IsThrottled` - 筛选被节流的请求
- `StatusCode` - 按状态码筛选
- `AdditionalParameters` - 搜索节流相关信息

## 典型应用场景

1. **节流检测**: 查询 IsThrottled=true 或 AdditionalParameters 包含 ThrottleEnforcement
2. **请求追踪**: 根据 ClientRequestId 或 GatewayRequestId 追踪请求
3. **性能分析**: 分析 TotalGatewayTime 和 TargetRequestTime
4. **路由分析**: 查看请求的目标数据中心和路由决策

## 示例查询

### 基础查询

```kql
cluster('idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn').database('AADGatewayProd').RequestSummaryEventCore
| where env_time > ago(1d)
| where TargetTenantId == "{tenantId}"
| project env_time, EffectiveStatusCode, ClientRequestId, TargetService, IncomingUrl, IsThrottled
```

### 按租户检查节流

```kql
union cluster('idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn').database('AADGatewayProd').table('RequestSummaryEventCore'), 
      cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('AADGatewayProd').table('RequestSummaryEventCore')
| where env_time > ago(1d)
| where AdditionalParameters has "ThrottleEnforcement"
| where TargetTenantId == "{tenantId}"
| take 1000
```

### 节流请求统计

```kql
RequestSummaryEventCore
| where env_time > ago(1d)
| where TargetTenantId == "{tenantId}"
| summarize 
    TotalRequests = count(),
    ThrottledCount = countif(IsThrottled == true),
    BlockedCount = countif(IsBlocked == true)
| extend ThrottleRate = round(100.0 * ThrottledCount / TotalRequests, 2)
```

### 性能分析

```kql
RequestSummaryEventCore
| where env_time > ago(1h)
| where TargetTenantId == "{tenantId}"
| summarize 
    AvgGatewayTime = avg(TotalGatewayTime),
    P95GatewayTime = percentile(TotalGatewayTime, 95),
    P99GatewayTime = percentile(TotalGatewayTime, 99)
    by TargetService
```

### 错误请求分析

```kql
RequestSummaryEventCore
| where env_time > ago(1d)
| where TargetTenantId == "{tenantId}"
| where toint(StatusCode) >= 400
| summarize count() by StatusCode, TargetService
| order by count_ desc
```

## 关联表

AAD Gateway 数据库中的其他表：
- `RequestEventCore` - 请求事件详情
- `MonitoringEventCore` - 监控事件
- `DatacenterEventCore` - 数据中心事件

## 注意事项

- 📊 **日志保留期**: 约 30 天
- 🌐 **双集群**: BJB (chinanorth2) 和 SHA (chinaeast2) 两个集群
- 🔍 **节流检测**: 使用 IsThrottled 或 AdditionalParameters 包含 "ThrottleEnforcement"
- ⚠️ **表名变更**: 文档中的 AllRequestSummaryEvents 实际表名为 RequestSummaryEventCore

---

> 文档版本: 1.0  
> 最后更新: 2026-01-14  
> 数据来源: .show table RequestSummaryEventCore schema as json
