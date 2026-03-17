---
name: url-access-check
description: URL 访问检查详情查询
tables:
  - ShoeboxAgentHealth
parameters:
  - name: SessionHostName
    required: true
    description: Session Host 名称
---

# URL 访问检查查询

## 用途

查询 Session Host 的 URL 访问检查详情，获取无法访问的 URL 列表，诊断网络连通性问题。

## 查询 1: URL 访问检查失败

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {SessionHostName} | 是 | Session Host 名称 |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').ShoeboxAgentHealth
| where PreciseTimeStamp > ago(1d)
| where resourceId contains "{SessionHostName}"
| extend x = parse_json(properties)
| extend HostName = tostring(x.SessionHostName)
| where HostName contains "{SessionHostName}"
| extend HealthCheckResult = tostring(x.SessionHostHealthCheckResult)
| extend UrlsAccessibleCheck = parse_json(HealthCheckResult)
| where UrlsAccessibleCheck.ErrorCode != "0"
| project PreciseTimeStamp, HostName, HealthCheckResult
| order by PreciseTimeStamp desc
```

---

## 查询 2: 详细健康检查失败项

### 查询语句

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
| project PreciseTimeStamp, HostName, CheckName, CheckResult, CheckDetails
| order by PreciseTimeStamp desc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| CheckName | 检查项名称 |
| CheckResult | 检查结果 (1=成功, 0=失败) |
| CheckDetails | 失败详情 |

---

## 查询 3: 获取无法访问的 URL 列表

### 查询语句

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
| where CheckName has "Url" or CheckName has "URL"
| extend UrlCheckDetailsRaw = CheckDetails.Message
| extend UrlCheckDetails = parse_json(UrlCheckDetailsRaw)
| project PreciseTimeStamp, HostName, CheckName, 
          NotAccessibleUrls = UrlCheckDetails.NotAccessibleUrls
| order by PreciseTimeStamp desc
```

---

## 查询 4: 汇总无法访问的 URL

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').ShoeboxAgentHealth
| where PreciseTimeStamp > ago(1d)
| where resourceId contains "{SessionHostName}"
| extend x = parse_json(properties)
| extend HostName = tostring(x.SessionHostName)
| extend HealthCheckResult = parse_json(tostring(x.SessionHostHealthCheckResult))
| mv-expand HealthCheckResult
| where HealthCheckResult.HealthCheckResult != 1
| where HealthCheckResult.HealthCheckName has "Url"
| extend UrlDetails = parse_json(tostring(HealthCheckResult.AdditionalFailureDetails.Message))
| mv-expand Url = UrlDetails.NotAccessibleUrls
| summarize FailCount = count() by tostring(Url)
| order by FailCount desc
```

## AVD 必需的 URL

Session Host 需要能够访问以下 URL：

| URL | 用途 |
|-----|------|
| *.wvd.microsoft.com | AVD 服务端点 |
| login.microsoftonline.com | Azure AD 认证 |
| *.servicebus.windows.net | Azure Service Bus |
| *.prod.warm.ingest.monitor.core.windows.net | Azure Monitor |
| catalogartifact.azureedge.net | Azure 市场 |

## 关联查询

- [health-check.md](./health-check.md) - 完整健康检查状态
- [session-host.md](./session-host.md) - Session Host 信息
