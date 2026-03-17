---
name: ShoeboxAgentHealth
database: WVD
cluster: https://rdskmc.chinaeast2.kusto.chinacloudapi.cn
description: AVD ARM 诊断健康检查数据
status: active
---

# ShoeboxAgentHealth

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | WVD |
| 状态 | ✅ 可用 |

## 用途

记录通过 ARM 诊断设置收集的 Session Host 健康检查数据。包含详细的健康检查结果，特别是 URL 访问检查的详细信息。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| time | datetime | 事件时间 |
| resourceId | string | ARM 资源 ID |
| operationName | string | 操作名称 |
| category | string | 类别 |
| properties | string | 属性 (JSON，包含详细健康检查结果) |
| ActivityId | string | 活动 ID |
| Level | long | 级别 |

## properties 字段结构

properties 字段是 JSON 格式，包含以下重要信息：

```json
{
  "SessionHostName": "hostname.domain.com",
  "SessionHostHealthCheckResult": [
    {
      "HealthCheckName": "DomainJoinedCheck",
      "HealthCheckResult": 1,
      "AdditionalFailureDetails": {...}
    }
  ]
}
```

### HealthCheckResult 值

| 值 | 含义 |
|----|------|
| 1 | 成功 (Success) |
| 0 | 失败 (Failure) |

## 典型应用场景

1. **URL 访问检查** - 获取无法访问的 URL 列表
2. **详细健康检查** - 分析各检查项的详细结果
3. **ARM 诊断集成** - 与 Azure Monitor 集成的诊断数据

## 示例查询

### 查询健康检查失败

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').ShoeboxAgentHealth
| where PreciseTimeStamp > ago(1d)
| where resourceId contains "{SessionHostName}"
| extend x = parse_json(properties)
| extend HostName = tostring(x.SessionHostName)
| where HostName contains "{SessionHostName}"
| extend HealthCheckResult = parse_json(tostring(x.SessionHostHealthCheckResult))
| mv-expand HealthCheckResult
| extend CheckName = HealthCheckResult.HealthCheckName,
         CheckResult = HealthCheckResult.HealthCheckResult,
         CheckDetails = HealthCheckResult.AdditionalFailureDetails
| where CheckResult != 1
| project PreciseTimeStamp, HostName, CheckName, CheckResult, CheckDetails
```

### 获取无法访问的 URL 列表

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').ShoeboxAgentHealth
| where PreciseTimeStamp > ago(5d)
| where resourceId contains "{SessionHostName}"
| extend x = parse_json(properties)
| extend HostName = tostring(x.SessionHostName)
| where HostName contains "{SessionHostName}"
| extend HealthCheckResult = parse_json(tostring(x.SessionHostHealthCheckResult))
| mv-expand HealthCheckResult
| extend CheckName = HealthCheckResult.HealthCheckName,
         CheckResult = HealthCheckResult.HealthCheckResult,
         CheckDetails = HealthCheckResult.AdditionalFailureDetails
| where CheckResult != 1
| extend UrlCheckDetailsRaw = CheckDetails.Message
| extend UrlCheckDetails = parse_json(UrlCheckDetailsRaw)
| project PreciseTimeStamp, HostName, CheckName, 
          NotAccessibleUrls = UrlCheckDetails.NotAccessibleUrls
```

### 检查特定 Session Host 的 URL 访问

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').ShoeboxAgentHealth
| where PreciseTimeStamp > ago(1d)
| where resourceId contains "{SessionHostName}"
| extend x = parse_json(properties)
| extend HostName = tostring(x.SessionHostName)
| extend HealthCheckResult = tostring(x.SessionHostHealthCheckResult)
| extend UrlsAccessibleCheck = parse_json(HealthCheckResult)
| where UrlsAccessibleCheck.ErrorCode != "0"
| project PreciseTimeStamp, HostName, HealthCheckResult
```

## 关联表

- [RDOperation.md](./RDOperation.md) - 另一个健康检查数据源

## 注意事项

- properties 字段需要使用 `parse_json()` 解析
- 需要使用 `mv-expand` 展开健康检查结果数组
- 此表与 RDOperation 提供类似信息，但格式不同
