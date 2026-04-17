---
name: pull-performance
description: Docker Pull 性能分析
tables:
  - RegistryActivity
parameters:
  - name: registry
    required: true
    description: ACR 登录服务器名称（不含 .azurecr.cn）
---

# Docker Pull 性能分析

## 用途

分析 Docker Pull 操作的性能，包括下载速度、响应时间、错误等。

## 查询 1: Pull 操作概览

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {registry} | 是 | 注册表名称（不含 .azurecr.cn） |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(2h)
| where http_request_host == "{registry}.azurecr.cn"
| where (http_request_method == "GET" and http_request_uri matches regex "/v2/.+/blobs/")
  or (http_request_method == "GET" and http_request_uri matches regex "/v2/.+/manifests/")
| where message contains "fe_request_stop"
| project PreciseTimeStamp, correlationid, http_request_host, http_request_method, 
         http_request_uri, http_response_status, vars_digest, vars_name, be_err_code, 
         be_err_detail, be_err_message, message
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| vars_name | 镜像仓库名称 |
| vars_digest | 层摘要 |
| http_response_status | HTTP 状态码 |
| be_err_code | 后端错误代码 |

---

## 查询 2: Pull (Manifest) 错误分析

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where activitytimestamp > ago(2d)
| where http_request_method == "GET" and http_request_uri contains "/manifests/"
| extend Registry = http_request_host 
| where Registry == "{registry}.azurecr.cn"
| extend responseStatus = toint(http_response_status)
| extend State = iff(responseStatus < 400, "Success", "CustomerError")
| extend State = iff(State == "CustomerError" and responseStatus >= 500, "ServerError", State)
| project activitytimestamp, correlationid, http_request_host, http_request_method, 
         http_request_uri, http_request_useragent, level, message, auth_token_access, 
         be_err_code, be_err_detail, be_err_message
```

---

## 查询 3: Pull 失败分析

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_request_method == "GET"
| where toint(http_response_status) >= 400
| where http_request_uri matches regex "/v2/.+/(blobs|manifests)/"
| project PreciseTimeStamp, vars_name, vars_reference, http_response_status, 
         err_code, err_message, err_detail, http_request_uri, http_request_remoteaddr,
         http_request_useragent, correlationid
| order by PreciseTimeStamp desc
```

---

## 查询 4: Pull 操作统计

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where message == "fe_request_stop"
| where http_request_method == "GET" 
| where http_request_uri matches regex "/v2/.+/(blobs|manifests)/"
| extend ResponseCode = toint(http_response_status)
| extend Status = iff(ResponseCode < 400, "Success", "Failed")
| extend RequestType = iff(http_request_uri contains "/manifests/", "Manifest", "Blob")
| summarize 
    TotalRequests = count(),
    SuccessCount = countif(Status == "Success"),
    FailedCount = countif(Status == "Failed"),
    AvgDurationMs = avg(todouble(http_response_duration))
  by bin(PreciseTimeStamp, 1h), RequestType
| order by PreciseTimeStamp desc
```

---

## 查询 5: 慢 Pull 操作

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where http_request_host == "{registry}.azurecr.cn"
| where message == "fe_request_stop"
| where http_request_method == "GET"
| where http_request_uri matches regex "/v2/.+/(blobs|manifests)/"
| extend DurationSeconds = todouble(http_response_duration) / 1000
| where DurationSeconds > 10
| project PreciseTimeStamp, vars_name, http_request_uri, DurationSeconds, 
         http_response_status, http_response_written, correlationid
| order by DurationSeconds desc
| take 100
```

## 关联查询

- [push-performance.md](./push-performance.md) - Push 性能分析
- [storage-layer-performance.md](./storage-layer-performance.md) - 存储层性能
