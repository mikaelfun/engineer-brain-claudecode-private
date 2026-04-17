---
name: throttling-analysis
description: ACR 限流 (429) 分析
tables:
  - RegistryActivity
parameters:
  - name: registry
    required: true
    description: ACR 登录服务器名称（不含 .azurecr.cn）
---

# 限流分析

## 用途

分析 ACR 429 限流请求，确定限流位置（FE/TS/nginx），评估请求模式。

## 查询 1: 限流位置分析

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {registry} | 是 | 注册表名称（不含 .azurecr.cn） |

### 查询语句

```kql
let throttledRequests = (
    cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
    | where PreciseTimeStamp > ago(7d)
    | where http_request_host == "{registry}.azurecr.cn"
    | where http_response_status == "429"
    | project correlationid
);
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where correlationid in (throttledRequests)
| where message == "fe_request_stop" or message == "ts_request_stop" or message startswith "nginx"
| summarize count() by correlationid
| extend throttledby = iff(count_ > 1, "FE/TS", "nginx")
| summarize count() by throttledby
```

### 结果说明

| throttledby | 说明 |
|-------------|------|
| FE/TS | 被前端/Token Service 限流 |
| nginx | 被 nginx 层限流 |

---

## 查询 2: 429 错误统计

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_response_status == "429"
| summarize 
    ThrottledCount = count(),
    UniqueIPs = dcount(http_request_remoteaddr),
    UniqueUserAgents = dcount(http_request_useragent)
  by bin(PreciseTimeStamp, 1h)
| order by PreciseTimeStamp desc
```

---

## 查询 3: 限流请求详情

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_response_status == "429"
| project PreciseTimeStamp, http_request_method, http_request_uri, 
         http_request_remoteaddr, http_request_useragent, 
         acr_ratelimiter_remainingrequestvalue, acr_ratelimiter_retryafter,
         correlationid
| order by PreciseTimeStamp desc
```

---

## 查询 4: 按来源 IP 统计限流

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_response_status == "429"
| summarize 
    ThrottledCount = count(),
    LastThrottled = max(PreciseTimeStamp),
    UserAgents = make_set(http_request_useragent, 5)
  by http_request_remoteaddr
| order by ThrottledCount desc
```

---

## 查询 5: 请求频率分析

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1h)
| where http_request_host == "{registry}.azurecr.cn"
| where message == "fe_request_stop"
| summarize RequestCount = count() by bin(PreciseTimeStamp, 1m), http_request_remoteaddr
| order by RequestCount desc
| take 100
```

---

## 查询 6: 限流率分析

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where message == "fe_request_stop" or message == "ts_request_stop"
| extend IsThrottled = http_response_status == "429"
| summarize 
    TotalRequests = count(),
    ThrottledRequests = countif(IsThrottled),
    ThrottleRate = round(100.0 * countif(IsThrottled) / count(), 2)
  by bin(PreciseTimeStamp, 1h)
| order by PreciseTimeStamp desc
```

## ACR SKU 限制参考

| SKU | 读取操作/分钟 | 写入操作/分钟 |
|-----|--------------|--------------|
| Basic | 1,000 | 100 |
| Standard | 3,000 | 500 |
| Premium | 10,000 | 2,000 |

## 关联查询

- [activity-errors.md](./activity-errors.md) - 活动错误查询
- [authentication-errors.md](./authentication-errors.md) - 认证错误分析
