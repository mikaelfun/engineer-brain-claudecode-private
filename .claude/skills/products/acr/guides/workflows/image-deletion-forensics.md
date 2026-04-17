# ACR 镜像删除调查与审计 — 排查工作流

**来源草稿**: ado-wiki-a-acr-audit-logs.md, ado-wiki-a-acr-change-analysis.md, ado-wiki-acr-find-user-of-manifest-event.md, ado-wiki-acr-investigate-bulk-image-tag-deletions.md, onenote-acr-kusto-queries.md
**Kusto 引用**: manifest-statistics.md, activity-errors.md
**场景数**: 6
**生成日期**: 2026-04-07

---

## Scenario 1: 查找删除镜像的操作者（单个镜像）
> 来源: ado-wiki-acr-find-user-of-manifest-event.md | 适用: Mooncake ✅ (Kusto) / Global ✅ (DGREP)

### 排查步骤

1. **获取缺失镜像的完整名称**（从客户处确认）
   - 例: `acr09272023.azurecr.io/cluster-proportional-autoscaler:v1.8.8`

2. **在 Kusto 中查找 DELETE manifest 事件**
   ```kql
   cluster("ACR").database("acrprod").RegistryManifestEvent
   | where PreciseTimeStamp between (datetime(2024-03-25T06:05) .. 1d) 
   | where Registry == "acr09272023.azurecr.io"
   | where Artifact has "cluster-proportional-autoscaler"
   | where Tag == "v1.8.8"
   | where http_request_method == "DELETE"
   | project activitytimestamp, message, Action, Artifact, Registry, Tag, CorrelationId, RegionStamp
   ```

3. **使用 DGREP 查找操作者身份**（需 unscrubbed 数据）
   - Endpoint: `Diagnostics PROD`
   - Namespace: `AcrProdRegistry`
   - Event: `RegistryManifestEvent`
   - 使用 `Region` 过滤（不用 `RegionStamp`，避免数据丢失）
   - Client query: `where correlationId == "<correlationId>" | take 10`
   - 点击 **Search unscrubbed** 获取完整数据

4. **关键字段**
   - `auth_user_name`: 操作者身份（用户/SP/MI）
   - `http_request_remoteaddr_ipv4`: 来源 IP
   - `http_request_useragent`: 客户端工具

5. **如果 auth_user_name 是陌生的 Application ID**
   - 可能是 ACR Task / ACR Run / ACR Purge 操作
   - 交叉验证 ARM 日志:
   ```kql
   HttpIncomingRequests
   | where TIMESTAMP between (datetime(2024-03-25T06:08:47) .. 5min)
   | where subscriptionId contains "<subscription-id>"
   | where targetUri contains "<acr-name>"
   ```
   - targetUri 模式:
     - `az acr run` → 手动 run
     - `az acr purge` → purge 命令
     - `ca#` → ACR Task 触发

---

## Scenario 2: 批量删除调查
> 来源: ado-wiki-acr-investigate-bulk-image-tag-deletions.md | 适用: Global ✅

### 排查步骤

1. **确定删除范围和时间线**
   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   cluster("ACR").database("acrprod").RegistryManifestEvent
   | where activitytimestamp between (ago(7d) .. now())
   | where Registry == targetRegistry
   | where Action in ("Delete", "Untag")
   | summarize DeletionCount=count(),
               FirstDeletion=min(activitytimestamp),
               LastDeletion=max(activitytimestamp),
               AffectedRepos=dcount(Artifact) by Action
   ```

2. **可视化删除模式**
   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   cluster("ACR").database("acrprod").RegistryManifestEvent
   | where activitytimestamp between (ago(7d) .. now())
   | where Registry == targetRegistry
   | where Action in ("Delete", "Untag")
   | summarize DeletionCount=count() by Action, bin(activitytimestamp, 1h)
   | render timechart
   ```
   - 突发式删除 → 自动化脚本
   - 零散删除 → 手动操作

3. **检查 Retention Policy 活动**
   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   cluster("ACR").database("acrprod").RPActivity
   | where env_time between (ago(7d) .. now())
   | where Message startswith "Queuing new delete manifest metadata message"
   | where Message has targetRegistry
   | parse kind=regex Message with *
       "Queuing new delete manifest metadata message for Registry: " parsedRegistryLoginUri:string
       " Repo: " parsedRepo:string
       " Manifest: " parsedManifest:string
       ", isPurgeDelete: " parsedPurgeDeleteFlag:bool
       ", policyName : " parsedPolicyName:string
   | project env_time, parsedRepo, parsedManifest, parsedPurgeDeleteFlag, parsedPolicyName
   ```

4. **检查 ACR Task 触发的删除**
   ```kql
   cluster("AzureResourceManager").database("ARMProd").HttpIncomingRequests
   | where TIMESTAMP between (startTime .. endTime)
   | where subscriptionId contains targetSubscription
   | where targetUri contains targetRegistry
   | where targetUri has_any ("runs", "tasks", "purge")
   | project TIMESTAMP, operationName, targetUri, userAgent, callerIdentity, callerIpAddress
   ```

---

## Scenario 3: Tag 删除确认（Mooncake）
> 来源: onenote-acr-kusto-queries.md | 适用: Mooncake ✅

### 排查步骤

1. **确认 Tag 被删除**
   ```kql
   let Registry = "<acr>.azurecr.cn";
   let Repository = "redis";
   let Digest = "sha256:xxx";
   let Uri = strcat("/v2/", Repository, "/manifests/", Digest);
   RegistryActivity
   | where PreciseTimeStamp > ago(7d)
   | where service == "nginx"
   | where http_request_method == "DELETE"
   | where http_request_host == Registry
   | where http_request_uri == Uri
   | project Day = bin(PreciseTimeStamp, 1d), Registry, Uri = http_request_uri, HttpStatus = http_response_status
   ```

2. **确认 Repository 被删除**
   ```kql
   let Registry = "<acr>.azurecr.cn";
   let Repository = "image/redis";
   let Uri = strcat("/v2/_acr/", Repository, "/repository");
   RegistryActivity
   | where PreciseTimeStamp > ago(2d)
   | where service == "nginx"
   | where http_request_method == "DELETE"
   | where http_request_host == Registry
   | project Day = bin(PreciseTimeStamp, 1d), Registry, Uri = http_request_uri,
            HttpStatus = http_response_status, http_request_method, http_request_remoteaddr
   ```

---

## Scenario 4: 启用 Audit Logs（诊断日志）
> 来源: ado-wiki-a-acr-audit-logs.md | 适用: Mooncake ✅

### 步骤

1. Portal → Registry → Diagnostics Settings → Add Diagnostic Setting
2. 选择 Send to Log Analytics → 选择 Workspace
3. 保存，等待几分钟
4. 执行操作后在 Logs → ContainerRegistryRepositoryEvents 中查看
5. **局限**: Preview 阶段仅记录 Push/Pull 事件，不记录 Delete/Untag

---

## Scenario 5: Change Analysis（配置变更审计）
> 来源: ado-wiki-a-acr-change-analysis.md | 适用: Mooncake ✅

### 步骤

1. 注册 `Microsoft.ChangeAnalysis` resource provider
2. Portal → 搜索 Change Analysis
3. 选择 Resource Group 和 Registry
4. 查看变更列表（SKU、AdminUser、Retention、Content Trust 等）
5. 详细变更 → Activity Logs → Change History (preview)

---

## Scenario 6: Manifest 数量统计
> 来源: manifest-statistics.md | 适用: Mooncake ✅

### 排查步骤

1. **统计 Manifest 数量**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
   | where env_time > ago(7d)
   | where OperationName == "ACR.Layer: ExecuteOperationOnListManifestsAsync"
   | where RegistryLoginUri == "{registry}.azurecr.cn"
   | extend numManifests = toint(substring(Message, 52, strlen(Message) - 11 - 52))
   | summarize numManifests = sum(numManifests) by bin(env_time, 1d), RegistryId, RegistryLoginUri, ImageType
   ```

2. **按仓库统计**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
   | where env_time > ago(7d)
   | where RegistryLoginUri == "{registry}.azurecr.cn"
   | where isnotempty(Repository)
   | summarize TagCount = dcount(Tag), DigestCount = dcount(Digest), LastActivity = max(env_time)
     by Repository
   | order by TagCount desc
   ```
