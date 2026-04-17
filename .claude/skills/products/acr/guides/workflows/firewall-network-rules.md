# ACR 防火墙与网络规则 — 排查工作流

**来源草稿**: (无专属草稿，基于 Kusto 查询)
**Kusto 引用**: activity-errors.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: 客户端 IP 被防火墙拒绝 (403)
> 来源: activity-errors.md, ado-wiki-a-jarvis-actions.md | 适用: Mooncake ✅

### 排查步骤

1. **确认错误消息**
   - 典型错误: `client with IP 'x.x.x.x' is not allowed access. Refer https://aka.ms/acr/firewall`

2. **Kusto 查询 ACR 活动错误**
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

3. **检查注册表网络配置**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
   | where env_time > ago(1d)
   | where LoginServerName == "{registry}.azurecr.cn"
   | project RegistryName, PublicNetworkAccessDisabled, PrivateLinkEndpointEnabled, 
            DataEndpointEnabled, FirewallRulesEnabled, PublicNetworkAccessSecuredByPerimeter
   | take 1
   ```

4. **决策树**
   - `FirewallRulesEnabled = true` + 客户 IP 不在白名单 → 需要添加 IP 规则
   - `PublicNetworkAccessDisabled = true` → 需要通过 Private Endpoint 访问
   - 客户端使用 Azure 服务 → 检查 `networkRuleBypassOptions` 是否为 `AzureServices`

5. **客户自查命令**
   ```bash
   az acr network-rule list -n <Registry Name> --query ipRules
   az acr show -n <Registry Name> --query publicNetworkAccess
   az acr show -n <Registry Name> --query networkRuleBypassOptions
   ```

---

## Scenario 2: 错误分布统计
> 来源: activity-errors.md | 适用: Mooncake ✅

### 排查步骤

1. **统计错误分布**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
   | where PreciseTimeStamp > ago(7d)
   | where http_request_host == "{registry}.azurecr.cn"
   | where level == "error"
   | summarize ErrorCount = count() by err_code, err_message, http_response_status
   | order by ErrorCount desc
   ```

2. **按时间范围查询错误**
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

## Scenario 3: correlationId 追踪完整请求链路
> 来源: activity-errors.md | 适用: Mooncake ✅

### 排查步骤

1. **获取可疑请求的 correlationId**（从 Scenario 1/2 查询结果中）

2. **追踪完整请求链路**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
   | where correlationid == "{correlationId}"
   | project activitytimestamp, message, auth_token_access, correlationid, err_code, err_detail, 
            err_message, http_request_host, http_request_id, http_request_method, http_request_uri, 
            http_response_status, level, service
   | order by activitytimestamp asc
   ```

3. **分析结果**
   - 检查 `service` 字段: nginx → 入口层 / fe → 前端 / ts → Token Service
   - 检查 `err_detail` 确定具体错误原因
