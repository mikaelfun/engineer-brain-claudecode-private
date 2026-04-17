# ACR 认证与登录 — 排查工作流

**来源草稿**: ado-wiki-a-acr-health-check-command.md
**Kusto 引用**: authentication-errors.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: ACR 登录失败 (401 Unauthorized)
> 来源: authentication-errors.md | 适用: Mooncake ✅

### 排查步骤

1. **运行 health-check 命令确认基本连通性**
   ```bash
   az acr check-health --name <registry-name> --ignore-errors
   ```
   - 检查 Docker 版本是否过旧
   - 检查 MCR pull 是否正常（Docker daemon 连通性）
   - 检查 Azure CLI 版本
   - 检查 ACR data endpoint DNS 解析

2. **Kusto 查询认证错误日志**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").RegistryActivity
   | where PreciseTimeStamp > ago(2h)
   | where level != "info"
   | where http_request_host == "{registry}.azurecr.cn"
   | project PreciseTimeStamp, activitytimestamp, message, servicedeploymentname, 
            servicedeploymentinstance, format, auth_registry, auth_user_name, correlationid, 
            err_code, err_detail, err_message
   | order by PreciseTimeStamp desc
   ```

3. **判断错误类型**
   | 错误代码 | 说明 | 可能原因 |
   |----------|------|----------|
   | UNAUTHORIZED | 未授权 | Token 无效或过期 |
   | DENIED | 拒绝访问 | 权限不足 |
   | TOKEN_EXPIRED | Token 过期 | 需要刷新 Token |
   | INVALID_CREDENTIALS | 无效凭据 | 用户名/密码错误 |

4. **根据错误代码进行下一步**
   - UNAUTHORIZED/INVALID_CREDENTIALS → 检查凭据是否正确
   - DENIED → 检查 RBAC 角色分配，参考 rbac-authorization 工作流
   - TOKEN_EXPIRED → 重新登录获取新 Token

---

## Scenario 2: 401/403 错误批量统计分析
> 来源: authentication-errors.md | 适用: Mooncake ✅

### 排查步骤

1. **统计 7 天内 401/403 错误分布**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").RegistryActivity
   | where PreciseTimeStamp > ago(7d)
   | where http_request_host == "{registry}.azurecr.cn"
   | where http_response_status in ("401", "403")
   | summarize Count = count(), UniqueIPs = dcount(http_request_remoteaddr),
       UniqueUsers = dcount(auth_user_name)
     by http_response_status, err_code, err_message
   | order by Count desc
   ```

2. **按用户维度分析认证失败**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where http_request_host == "{registry}.azurecr.cn"
   | where http_response_status in ("401", "403")
   | summarize FailureCount = count(), LastFailure = max(PreciseTimeStamp),
       ErrorCodes = make_set(err_code), SourceIPs = make_set(http_request_remoteaddr)
     by auth_user_name
   | order by FailureCount desc
   ```

3. **决策树**
   - 单用户大量失败 → 凭据问题 / 密码轮转
   - 多用户同时失败 → 服务端问题 / Token Service 异常
   - 特定 IP 大量失败 → 自动化脚本凭据过期

---

## Scenario 3: Token 过期检查
> 来源: authentication-errors.md | 适用: Mooncake ✅

### 排查步骤

1. **查询最近 30 分钟 Token 请求**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").RegistryActivity
   | where PreciseTimeStamp > ago(30m)
   | where http_request_host == "{registry}.azurecr.cn"
   | where message in ("fe_request_stop", "ts_request_stop")
   | project PreciseTimeStamp, Host, message, http_request_host, http_request_method, 
            http_response_status, http_request_uri, http_request_remoteaddr, http_request_useragent, 
            Tenant, correlationid, service, level
   ```

2. **根据 correlationId 查看认证详情**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").RegistryActivity
   | where correlationid == "{correlationId}"
   | project activitytimestamp, message, service, level, 
            auth_registry, auth_user_name, auth_token_access, auth_token_issued, auth_token_expiresin,
            err_code, err_message, err_detail,
            http_request_method, http_request_uri, http_response_status
   | order by activitytimestamp asc
   ```

3. **检查 auth_token_expiresin 字段** 确认 Token 有效期是否过短

---

## Scenario 4: RBAC 权限检查
> 来源: authentication-errors.md | 适用: Mooncake ✅

### 排查步骤

1. **查询 RBAC 权限日志**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").RegistryActivity
   | where PreciseTimeStamp > ago(1h)
   | where http_request_host == "{registry}.azurecr.cn"
   | where isnotempty(auth_token_access) or isnotempty(checkaccess_requested_scopes)
   | project PreciseTimeStamp, auth_user_name, auth_token_access, 
            checkaccess_requested_scopes, checkaccess_disallowed_scopes,
            http_request_method, http_request_uri, http_response_status, correlationid
   | order by PreciseTimeStamp desc
   ```

2. **对比 requested vs disallowed scopes**
   - checkaccess_requested_scopes: 请求的权限
   - checkaccess_disallowed_scopes: 被拒绝的权限

3. **建议客户**
   - 使用 az acr check-health -n <registry> --repository <repo> 自助检查权限
   - 确认角色分配：AcrPull (读) / AcrPush (写) / AcrImageSigner (签名)
