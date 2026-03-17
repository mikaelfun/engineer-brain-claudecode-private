---
name: authentication-errors
description: ACR 认证错误分析
tables:
  - RegistryActivity
parameters:
  - name: registry
    required: true
    description: ACR 登录服务器名称（不含 .azurecr.cn）
---

# 认证错误分析

## 用途

排查 ACR 认证问题，包括 401/403 错误、Token 过期、权限问题等。

## 查询 1: 认证错误日志

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {registry} | 是 | 注册表名称（不含 .azurecr.cn） |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(2h)
| where level != "info"
| where http_request_host == "{registry}.azurecr.cn"
| project PreciseTimeStamp, activitytimestamp, message, servicedeploymentname, 
         servicedeploymentinstance, format, auth_registry, auth_user_name, correlationid, 
         err_code, err_detail, err_message
| order by PreciseTimeStamp desc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| auth_user_name | 认证用户名 |
| auth_registry | 认证注册表 |
| err_code | 错误代码 |
| err_message | 错误消息 |
| err_detail | 错误详情 |

---

## 查询 2: Token 过期检查

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(30m)
| where http_request_host == "{registry}.azurecr.cn"
| where message in ("fe_request_stop", "ts_request_stop")
| project PreciseTimeStamp, Host, message, http_request_host, http_request_method, 
         http_response_status, http_request_uri, http_request_remoteaddr, http_request_useragent, 
         Tenant, correlationid, service, level
```

---

## 查询 3: 401/403 错误统计

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_response_status in ("401", "403")
| summarize 
    Count = count(),
    UniqueIPs = dcount(http_request_remoteaddr),
    UniqueUsers = dcount(auth_user_name)
  by http_response_status, err_code, err_message
| order by Count desc
```

---

## 查询 4: 认证请求详情

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {correlationId} | 是 | 请求关联 ID |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where correlationid == "{correlationId}"
| project activitytimestamp, message, service, level, 
         auth_registry, auth_user_name, auth_token_access, auth_token_issued, auth_token_expiresin,
         err_code, err_message, err_detail,
         http_request_method, http_request_uri, http_response_status
| order by activitytimestamp asc
```

---

## 查询 5: 按用户统计认证失败

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_response_status in ("401", "403")
| summarize 
    FailureCount = count(),
    LastFailure = max(PreciseTimeStamp),
    ErrorCodes = make_set(err_code),
    SourceIPs = make_set(http_request_remoteaddr)
  by auth_user_name
| order by FailureCount desc
```

---

## 查询 6: RBAC 权限检查

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1h)
| where http_request_host == "{registry}.azurecr.cn"
| where isnotempty(auth_token_access) or isnotempty(checkaccess_requested_scopes)
| project PreciseTimeStamp, auth_user_name, auth_token_access, 
         checkaccess_requested_scopes, checkaccess_disallowed_scopes,
         http_request_method, http_request_uri, http_response_status, correlationid
| order by PreciseTimeStamp desc
```

## 常见错误代码

| 错误代码 | 说明 | 可能原因 |
|----------|------|----------|
| UNAUTHORIZED | 未授权 | Token 无效或过期 |
| DENIED | 拒绝访问 | 权限不足 |
| TOKEN_EXPIRED | Token 过期 | 需要刷新 Token |
| INVALID_CREDENTIALS | 无效凭据 | 用户名/密码错误 |

## 关联查询

- [activity-errors.md](./activity-errors.md) - 活动错误查询
- [registry-info.md](./registry-info.md) - 注册表信息
