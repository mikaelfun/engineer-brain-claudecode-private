# ACR 缓存规则 — 排查工作流

**来源草稿**: ado-wiki-a-acr-caching.md
**Kusto 引用**: (内嵌在草稿中)
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Cache Rule 配置错误
> 来源: ado-wiki-a-acr-caching.md | 适用: Mooncake ✅

### 常见错误与解决

| 错误消息 | 原因 | 解决 |
|---------|------|------|
| Resource names must contain alphanumeric characters... | Rule Name 命名不合规 | 名称 5-50 字符，仅字母数字 |
| Repository names should follow standardized naming | 不支持的上游源 | 仅支持 docker.io 和 mcr.microsoft.com |
| User does not have secrets get permission on key vault | Credential Set 无 KV 权限 | az keyvault set-policy 授权 |
| Quota exceeded for resource type cacheRules | 超过 Cache Rule 上限 | 删除不需要的规则 |

### 当前限制
- 最大 1,000 条 Cache Rule
- 新镜像需至少一次 Pull 才会缓存
- 不会自动拉取新版本

---

## Scenario 2: Cache 拉取诊断
> 来源: ado-wiki-a-acr-caching.md | 适用: Global ✅

### 排查步骤

1. **查询 Frontend 到 Cache Backend 的调用**
   ```kql
   let host = "myregistry.azurecr.io"
   cluster("ACR").database("acrprod").RegistryActivity
   | where PreciseTimeStamp > ago(8h)
   | where http_request_host == host
   | where message startswith "fe_pullthrough"
   | project PreciseTimeStamp, message, correlationid, http_response_status
   ```

2. **查询 Cache Backend 消息**
   ```kql
   let corrId = "<correlationId>";
   cluster("ACR").database("acrprod").KubernetesContainers
   | where ["time"] > ago(8h)
   | where correlationid == corrId
   | project ["time"], msg, log
   ```

---

## Scenario 3: RP 层缓存规则操作 (Mooncake)
> 来源: rp-activity.md | 适用: Mooncake ✅

### 排查步骤

1. **查询缓存规则操作日志**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").RPActivity
   | where env_time > ago(7d)
   | where RegistryLoginUri == "{registry}.azurecr.cn"
   | where isnotempty(CacheRuleId) or OperationName contains "Cache"
   | project env_time, OperationName, Message, CacheRuleId, TargetRepository, UpstreamRepository
   | order by env_time desc
   ```
