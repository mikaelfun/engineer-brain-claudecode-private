---
name: activity-errors
description: ACR 活动错误查询
tables:
  - RegistryActivity
parameters:
  - name: registry
    required: true
    description: ACR 登录服务器名称（不含 .azurecr.cn）
---

# 活动错误查询

## 用途

查询 ACR 注册表的活动日志，获取错误信息和请求详情。

## 查询 1: 查询所有错误

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {registry} | 是 | 注册表名称（不含 .azurecr.cn） |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where activitytimestamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where level == "error"
| where http_request_method != "HEAD"
| project PreciseTimeStamp, vars_name, message, err_message, err_detail, http_request_method, 
         http_response_status, http_request_uri, http_request_remoteaddr, http_request_useragent, 
         correlationid, level
| order by PreciseTimeStamp asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| vars_name | 镜像仓库名称 |
| err_message | 错误消息 |
| err_detail | 错误详情 |
| http_response_status | HTTP 状态码 |
| correlationid | 关联 ID（用于追踪） |

---

## 查询 2: 根据 correlationId 追踪请求

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {correlationId} | 是 | 请求关联 ID |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where correlationid == "{correlationId}"
| project activitytimestamp, message, auth_token_access, correlationid, err_code, err_detail, 
         err_message, http_request_host, http_request_id, http_request_method, http_request_uri, 
         http_response_status, level, service
| order by activitytimestamp asc
```

---

## 查询 3: 按时间范围查询错误

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {registry} | 是 | 注册表名称 |
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where http_request_host == "{registry}.azurecr.cn"
| where level != "info"
| project PreciseTimeStamp, vars_name, message, err_message, err_detail, http_request_method, 
         http_response_status, http_request_uri, http_request_remoteaddr, correlationid, level
| order by PreciseTimeStamp asc
```

---

## 查询 4: 统计错误分布

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where level == "error"
| summarize ErrorCount = count() by err_code, err_message, http_response_status
| order by ErrorCount desc
```

## 关联查询

- [authentication-errors.md](./authentication-errors.md) - 认证错误分析
- [throttling-analysis.md](./throttling-analysis.md) - 限流分析
