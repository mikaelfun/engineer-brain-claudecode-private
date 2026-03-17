---
name: push-performance
description: Docker Push 性能分析
tables:
  - RegistryActivity
parameters:
  - name: registry
    required: true
    description: ACR 登录服务器名称（不含 .azurecr.cn）
---

# Docker Push 性能分析

## 用途

分析 Docker Push 操作的性能，包括上传速度、层大小、响应时间等。

## 查询 1: Push 性能分析

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {registry} | 是 | 注册表名称（不含 .azurecr.cn） |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| extend ACRResponseDurationInSeconds = todouble(http_response_duration) / 1000
| where (http_request_method == "PATCH" and http_request_uri matches regex "/v2/.+/blobs/" and
        todouble(http_request_bodylength) > 512 and ACRResponseDurationInSeconds > 1)
        or (http_request_method == "PUT" and http_request_uri matches regex "/v2/.+/manifests/")
| where message == "fe_request_stop"
| extend ContentLengthInMB = todouble(http_request_bodylength)/1000/1000
| extend MBPerSecond = ContentLengthInMB / ACRResponseDurationInSeconds
| project PreciseTimeStamp, vars_name, MBPerSecond, ContentLengthInMB, 
         ACRResponseDurationInSeconds, http_request_method, http_request_uri
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| vars_name | 镜像仓库名称 |
| MBPerSecond | 上传速度 (MB/s) |
| ContentLengthInMB | 内容大小 (MB) |
| ACRResponseDurationInSeconds | 响应时间 (秒) |

---

## 查询 2: Push (Manifest) 错误分析

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(30d)
| where http_request_method == "PUT" and http_request_uri matches regex "/v2/(.+?)/manifests/(.*)"
| extend Registry = http_request_host 
| where Registry == "{registry}.azurecr.cn"
| extend responseStatus = toint(http_response_status)
| extend State = iff(responseStatus < 400, "Success", "CustomerError")
| extend State = iff(State == "CustomerError" and responseStatus >= 500, "ServerError", State)
| extend Message = iff(State == "ServerError", strcat("SERVER ERROR: ", message), "SUCCESS")
| extend Message = iff(State == "CustomerError", "CUSTOMER ERROR", Message)
| summarize Total = count() by Day = bin(PreciseTimeStamp, 1d), Message
```

---

## 查询 3: Push 操作统计

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where message == "fe_request_stop"
| where (http_request_method == "PATCH" and http_request_uri matches regex "/v2/.+/blobs/")
        or (http_request_method == "PUT" and http_request_uri matches regex "/v2/.+/manifests/")
| extend ResponseCode = toint(http_response_status)
| extend Status = iff(ResponseCode < 400, "Success", "Failed")
| summarize 
    TotalRequests = count(),
    SuccessCount = countif(Status == "Success"),
    FailedCount = countif(Status == "Failed"),
    AvgDurationMs = avg(todouble(http_response_duration)),
    AvgSizeMB = avg(todouble(http_request_bodylength)/1000/1000)
  by bin(PreciseTimeStamp, 1h)
| order by PreciseTimeStamp desc
```

---

## 查询 4: 慢 Push 操作

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where http_request_host == "{registry}.azurecr.cn"
| where message == "fe_request_stop"
| where http_request_method == "PATCH" or http_request_method == "PUT"
| extend DurationSeconds = todouble(http_response_duration) / 1000
| where DurationSeconds > 30
| project PreciseTimeStamp, vars_name, http_request_method, http_request_uri,
         DurationSeconds, http_request_bodylength, http_response_status, correlationid
| order by DurationSeconds desc
| take 100
```

## 关联查询

- [pull-performance.md](./pull-performance.md) - Pull 性能分析
- [storage-layer-performance.md](./storage-layer-performance.md) - 存储层性能
