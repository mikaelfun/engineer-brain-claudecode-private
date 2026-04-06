# ACR 诊断工具与其他问题 — 综合排查指南

**条目数**: 6 | **草稿融合数**: 4 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-acr-kusto-queries.md](../drafts/onenote-acr-kusto-queries.md), [ado-wiki-acr-escalation-process.md](../drafts/ado-wiki-acr-escalation-process.md), [ado-wiki-acr-health-check-command.md](../drafts/ado-wiki-acr-health-check-command.md), [ado-wiki-acr-custom-domain.md](../drafts/ado-wiki-acr-custom-domain.md)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: ACR 通用诊断 — Kusto 查询参考
> 来源: [MCVKB/ACR/Kusto query](../../known-issues.jsonl)

**Mooncake Kusto 端点**：`https://acrmc2.chinaeast2.kusto.chinacloudapi.cn/acrprodmc`

#### 1a. 认证错误查询

```kusto
RegistryActivity
| where PreciseTimeStamp > ago(9d) and PreciseTimeStamp < ago(4d)
| where level != "info"
| where http_request_host == "{registry}.azurecr.io"
```

#### 1b. Pull (Manifest) 错误趋势

```kusto
RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_method == "GET" and http_request_uri contains "/manifests/"
| extend responseStatus = toint(http_response_status)
| extend State = iff(responseStatus < 400, "Success", "CustomerError")
| extend State = iff(State == "CustomerError" and responseStatus >= 500, "ServerError", State)
| extend Message = iff(State == "ServerError", strcat("SERVER ERROR: ", message), "SUCCESS")
| extend Message = iff(State == "CustomerError", "CUSTOMER ERROR", Message)
| summarize Total = count() by Day = bin(PreciseTimeStamp, 1d), Message
```

#### 1c. Push (Manifest) 错误趋势

```kusto
RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_method == "PUT" and http_request_uri matches regex "/v2/(.+?)/manifests/(.*)"
| extend responseStatus = toint(http_response_status)
| extend State = iff(responseStatus < 400, "Success", "CustomerError")
| extend State = iff(State == "CustomerError" and responseStatus >= 500, "ServerError", State)
| summarize Total = count() by Day = bin(PreciseTimeStamp, 1d), State
```

#### 1d. 响应状态码分布

```kusto
RegistryActivity
| where PreciseTimeStamp > ago(1d) and http_request_host == "{registry}.azurecr.io" and service == "nginx"
| summarize count() by http_response_status
```

#### 1e. Token Server 状态（Portal 中仓库不可见）

```kusto
RegistryActivity
| where PreciseTimeStamp > ago(2h)
| where message contains "[error]"
| project PreciseTimeStamp, message, servicedeploymentinstance, service, correlationid, http_request_uri, http_response_status
| summarize count() by servicedeploymentinstance, service
```

#### 1f. 注册表创建时间

```kusto
RegistryMasterData
| where env_time > ago(1d)
| where LoginServerName == "{registry}.azurecr.io"
| take 1
| project CreatedTime, LoginServerName
```

#### 1g. Manifest 数量统计

```kusto
WorkerServiceActivity
| where env_time > ago(7d)
| where OperationName == "ACR.Layer: ExecuteOperationOnListManifestsAsync"
| where RegistryLoginUri == "{registry}.azurecr.io"
| extend numManifests = toint(substring(Message, 52, strlen(Message) - 11 - 52))
| summarize numManifests = sum(numManifests) by bin(env_time, 1d), RegistryId, RegistryLoginUri, ImageType
```

#### 1h. 唯一 Manifest (含 Tag 信息)

```kusto
WorkerServiceActivity
| where env_time > ago(2d)
| where OperationName == "ACR.Layer: AddManifestRefAsync-Succeed"
| where RegistryLoginUri == "{registry}.azurecr.io"
| summarize count() by Repository, Tag, Digest
```

#### 1i. 特定日期后推送的 Tag

```kusto
WorkerServiceActivity
| where env_time > ago(10d)
| where OperationName == "ACR.Layer: AddManifestRefAsync-Succeed"
| where RegistryLoginUri == "{registry}.azurecr.io"
| extend FullName = strcat(RegistryLoginUri, "/", Repository, ":", Tag)
| extend Day = bin(env_time, 10d)
| summarize LastDayPushed = max(Day) by RegistryLoginUri, Repository, Tag, FullName
```

#### 1j. Tag 删除确认

```kusto
let Registry = "{registry}.azurecr.io";
let Repository = "{repo}";
let Digest = "sha256:{digest}";
let Uri = strcat("/v2/", Repository, "/manifests/", Digest);
RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where service == "nginx"
| where http_request_method == "DELETE"
| where http_request_host == Registry
| where http_request_uri == Uri
| project Day = bin(PreciseTimeStamp, 1d), Registry, Uri = http_request_uri, HttpStatus = http_response_status
```

#### 1k. Repository 删除确认

```kusto
let Registry = "{registry}.azurecr.io";
let Repository = "{repo}";
let Uri = strcat("/v2/_acr/", Repository, "/repository");
RegistryActivity
| where PreciseTimeStamp > ago(2d)
| where service == "nginx"
| where http_request_method == "DELETE"
| where http_request_host == Registry
| project Day = bin(PreciseTimeStamp, 1d), Registry, Uri = http_request_uri, HttpStatus = http_response_status, http_request_method, http_request_remoteaddr
```

#### 1l. ACR 删除事件 (ARM)

```kusto
HttpIncomingRequests
| where PreciseTimeStamp > ago(1d)
| where subscriptionId contains "{sub-id}"
| where httpMethod contains "DELETE"
| where targetUri contains "{acr}"
| project TIMESTAMP, TaskName, ActivityId, subscriptionId, correlationId, principalPuid, authorizationAction, operationName, httpMethod, targetUri, clientIpAddress, commandName
```

#### 1m. Content Trust 启用事件

```kusto
HttpIncomingRequests
| where PreciseTimeStamp > ago(1d)
| where operationName == "POST/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.CONTAINERREGISTRY/REGISTRIES/UPDATEPOLICIES"
| where targetUri contains "{acr}"
```

#### 1n. Geo-Replication 推送 "Blob Upload Unknown" 失败

```kusto
cluster("ACR").database("acrprod").RegistryActivity
| where PreciseTimeStamp > ago(10d)
| where http_request_host contains "{registry}.azurecr.io" and message == "fe_request_stop"
| where http_request_method in ("POST", "PUT", "PATCH")
| extend status = tostring(iff(be_err_code == "blob upload unknown", "FAIL", "SUCCESS"))
| summarize count() by Tenant, http_request_method, status
```

`[结论: 🟢 9/10 — OneNote(3) + 时效<6月(2) + 单源+实证(2) + 明确 Mooncake(2)]`

### Phase 2: az acr check-health 命令背景
> 来源: [ADO Wiki — ACR Health-Check Command Background](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Health-Check%20Command%20Background)

`az acr check-health` 执行以下检查：

| 检查项 | 说明 |
|--------|------|
| Docker 版本 | 旧版 Docker 不符合 OCI 规范，部分功能可能异常 |
| MCR 镜像拉取 | 验证 `docker pull` 从 MCR 能否正常工作 |
| Azure CLI 版本 | 提示升级以使用新功能 |
| 数据终结点连通性 | 验证能否连接 `<reg>.azurecr.io` 的数据终结点并获取 Token（DNS 验证） |
| Helm 版本 | 确保 Helm 已安装且版本不低于最低要求 |

> 此命令可扩展添加更多自检场景

`[结论: 🔵 7/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源文档(1) + 通用(1.5)]`

### Phase 3: ACR 升级流程 (Escalation)
> 来源: [ADO Wiki — ACR Escalation Process](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Escalation%20Process)

#### 场景 1: 不确定解决方案

1. 在 [AVA SME-ACR Triage](https://teams.microsoft.com/l/channel/19%3a6cb43a325b764abca5654897b32c60cd%40thread.skype/AVA%2520SME-ACR%2520Triage) 频道咨询 SME
2. 如无回复 → 在 [ACR-SUP](https://teams.microsoft.com/l/channel/19%3a587a166080b64df99c2375a0b22c91b1%40thread.skype/General) 频道更新
   > **注意**: ACR PG 对 AVA 频道不太熟悉，暂时优先使用 ACR-SUP 频道
3. 排查并修复
4. 关闭 Case

#### 场景 2: 需要 PG 协助

提交 ICM 前：
- 了解 IcM Severity 定义：[aka.ms/azurecen](https://aka.ms/azurecen)
- 默认使用 **Sev-3**（除非是区域性产品中断）
- 先充分利用 [CSS Wiki](https://aka.ms/akswiki)、TA、acr-sup 频道
- 联系人：Steven Xiao, Sathana Balasubramanian, Azure Container pod

#### 场景 3: BUG / HOTFIX

在 ACR-SUP 确认是 BUG 或等待 HOTFIX → 使用 [ICM 模板](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=32J233) 提交

#### 场景 4: 中断 (Outage)

1. 提交 Sev-2 Master ICM
2. 关联受影响的 Case
3. 更新 **CSS CONTAINERS NOTIFY DL**
4. 中断缓解后从 PG 获取面向公众的 RCA 声明

#### ICM 必填信息

| 字段 | 说明 |
|------|------|
| Case Reference | 关联的支持案例编号 |
| ASC Link | 来自 Case 的 ASC 链接 |
| Issue (客户描述) | 客户原文 |
| Issue (工程师描述) | 工程师分析 |
| Error Message | 错误信息 |
| ASK on the IcM | 对 PG 的请求 |
| Subscription ID | 订阅 ID |
| ACR Name | 注册表名称 |
| ACR Region | 注册表区域 |

`[结论: 🔵 7/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源文档(1) + 通用(1.5)]`

### Phase 4: ACR 自定义域名
> 来源: [ADO Wiki — How to use a custom domain for ACR](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FHow%20to%20use%20a%20custom%20domain%20for%20azure%20container%20registry)

**症状**：客户想使用自定义域名（如 `registry.contoso.com`）替代默认 `*.azurecr.io`

> ⚠️ **免责声明**: Azure 当前不完全支持此功能。参考实现: [GitHub — Azure/acr/custom-domain](https://github.com/Azure/acr/tree/master/docs/custom-domain)

**实现方案**（Nginx 反向代理）：

#### 前提
- 配置好组织 DNS 区域 `.contoso.com`
- `registry.contoso.com` 的 SSL 证书 (`contoso.pfx`)
- ACR 后端实例（如 `docker-registry-contoso.azurecr.io`）

#### 步骤
1. **上传证书到 Key Vault**：
   ```powershell
   .\upload-cert.ps1 -pfxFilePath <pfxFile> -pfxPwFile <pwdFile> -secretName <secretName> -vaultName <vaultName>
   ```

2. **部署 Nginx Docker VM**（Azure Portal 或 PowerShell 脚本）

3. **配置 DNS**：
   ```powershell
   New-AzureRmDnsRecordSet -Name <registry> -RecordType CNAME -ZoneName <contoso.com> `
     -ResourceGroupName <rg> -Ttl <Ttl> -DnsRecords (New-AzureRmDnsRecordConfig -Cname <VM-Address>)
   ```

4. **验证**：
   ```bash
   docker login -u <username> -p <password> registry.contoso.com
   ```

`[结论: 🟡 5/10 — ADO Wiki(2.5) + 时效不确定(1) + 单源文档(1) + 未标注(1) — 扣分: 非完全支持方案，时效性不确定]`

### Phase 5: Container Apps 创建因 ACR 名称过长失败
> 来源: [ADO Wiki — ContainersApps Creation failure due to ACR name too long](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FContainersApps+Creation+failure+due+to+ACR+name+too+long)

**症状**：Azure Container Apps 创建在 15-20 分钟后失败，`ContainerAppOperationError: Failed to provision revision - Operation expired`

**根因**：Container Apps 平台已知 Bug，无法处理超过 ~30 字符的 ACR 注册表名称

**解决方案**：
- 使用名称少于 30 字符的 ACR
- 如客户无法重命名 → 创建新的短名称 ACR 并迁移镜像

> 已知 Bug: CASE#2205120050002279

`[结论: 🔵 6.5/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + 通用(1.5) — 扣分: Container Apps 问题非 ACR 核心问题]`

### Phase 6: Portal CORS 错误 — Token 过大
> 来源: [ADO Wiki — ACR CORS Policy Blocked Portal Issue](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FAKS%2FTSG%2FACR+CORS+Policy+Blocked+Portal+Issue)

**症状**：部分用户无法在 Azure Portal 中列出 ACR 镜像，提示 `Error retrieving Image Names`，浏览器控制台显示 CORS 错误。CLI 对同一用户正常工作。仅影响 Azure AD 组成员数多的用户。

**根因**：拥有大量 Azure AD 安全组成员资格的用户生成的 OAuth2 bearer token 超过 ACR 的 8192 字节 HTTP header 大小限制。超大 token 导致 ACR 返回无 CORS 头的 HTTP 400，浏览器阻止。

**解决方案**（变通）：
1. 减少受影响用户的 Azure AD 组成员资格数量
2. 使用 CLI 替代 Portal 操作 ACR
3. 使用条件访问减少 token claims

> PG 正在跟踪潜在修复

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + 通用(1.5)]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | ACR Kusto 诊断查询集 | 参考资料 | 见 Phase 1 完整 KQL 集 | 🟢 9 | [MCVKB/ACR/Kusto query](../../known-issues.jsonl) |
| 2 📋 | ACR 升级流程 (ICM) | 参考资料 | 见 Phase 3 升级指南 | 🔵 7 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Escalation%20Process) |
| 3 📋 | az acr check-health 检查项 | 参考资料 | 见 Phase 2 检查项列表 | 🔵 7 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Health-Check%20Command%20Background) |
| 4 📋 | ACR 自定义域名 | Azure 非完全支持 | Nginx 反向代理方案 | 🟡 5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FHow%20to%20use%20a%20custom%20domain%20for%20azure%20container%20registry) |
| 5 | Container Apps 因 ACR 名称过长失败 | Container Apps 已知 Bug | 使用 <30 字符名称的 ACR | 🔵 6.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FContainersApps+Creation+failure+due+to+ACR+name+too+long) |
| 6 | Portal CORS 错误，大组用户受影响 | OAuth2 token 超过 8KB header 限制 | 减少组成员/用 CLI/条件访问 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FAKS%2FTSG%2FACR+CORS+Policy+Blocked+Portal+Issue) |
