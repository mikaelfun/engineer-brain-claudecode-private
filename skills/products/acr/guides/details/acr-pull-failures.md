# ACR 镜像拉取故障 — 综合排查指南

**条目数**: 8 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**来源草稿**: 无
**Kusto 引用**: [pull-performance.md]
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 错误分类与初步判断
> 来源: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/)

收到 ACR Pull 失败报告后，首先根据错误信息分类：

**判断逻辑**：
| 错误信息 | 含义 | 后续动作 |
|---------|------|---------|
| `context deadline exceeded` | DNS 解析失败 | → Phase 2a |
| `i/o timeout: dial tcp <ip>:443` | 存储/数据端点连接被阻断 | → Phase 2b |
| `Client.Timeout exceeded while awaiting headers` | 登录服务器 443 端口连接被阻断 | → Phase 2c |
| `401 Unauthorized / failed to fetch anonymous token` | 可能是镜像不存在的误导错误 | → Phase 2d |
| `manifest unknown / manifest tagged by <tag> is not found` | 镜像标签不存在 | → Phase 2e |
| `502 Bad Gateway / connection reset by peer` | Azure Storage 间歇性故障 | → Phase 3a |
| EOF / Cloudflare CDN 错误 | Docker Hub 拉取被防火墙拦截 | → Phase 3b |

`[结论: 🟢 8.5/10 — 多个 ADO Wiki TSG 交叉验证 + MS Learn 补充]`

### Phase 2a: DNS 解析失败 (context deadline exceeded)
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/context-deadline-exceeded)

1. 测试 DNS 解析：
   ```bash
   nslookup <acr>.azurecr.io
   ```

2. 使用 Azure DNS 直接测试：
   ```bash
   nslookup <acr>.azurecr.io 168.63.129.16
   ```

3. **判断**：
   - Azure DNS 能解析但设备 DNS 不能 → 检查自定义 DNS 服务器转发配置
   - 两者都不能解析 → 确认 ACR 名称是否正确，检查 ACR 是否存在

`[结论: 🔵 6/10 — MS Learn 单源文档(1.5) + 通用(1.5) + 近期(2) + 单源(1)]`

### Phase 2b: 存储/数据端点 I/O Timeout
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/download-failed-443-io-time-out) + [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki)

ACR 拉取镜像层时，客户端被 307 重定向到 Azure Blob Storage 端点。如果防火墙/NSG 阻断到存储端点的 443 端口，Pull 会超时。

1. 测试连通性：
   ```bash
   telnet <storage-endpoint> 443
   # 或
   nc -zv <storage-endpoint> 443
   ```

2. 确认需要放行的端点：
   - 默认端点：`*.blob.core.windows.net`
   - 专用数据端点（若已启用）：`<acr>.<region>.data.azurecr.io`

3. **如果是 Azure VM**，使用 Network Watcher NSG Diagnostics 检查：
   - 出站 TCP 443 到 `Storage.<region>` 服务标签是否被拒绝
   - 路由表 next hop 是否为 None（流量被丢弃）
   - 如果流量经过虚拟设备（NVA），确保 NVA 放行 443 到存储端点

4. 添加 NSG 规则放行 `Storage` 服务标签或特定存储 IP

**Kusto 验证 Pull 失败**：
```kusto
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
`[工具: Kusto skill — pull-performance.md]`

`[结论: 🟢 8/10 — MS Learn(1.5) + ADO Wiki(2.5) 交叉验证 + 实证(2) + Mooncake 适用(2)]`

### Phase 2c: 登录服务器连接超时 (Client.Timeout)
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/request-canceled-waiting-connection-timeout-exceeded)

客户端无法连接到 ACR 登录服务器 `<acr>.azurecr.io` 的 443 端口。

1. 测试连通性：
   ```bash
   telnet <acr>.azurecr.io 443
   ```

2. 排查方向：
   - 防火墙/代理/ACL/ISP 限制
   - Azure VM：Network Watcher NSG Diagnostics 检查出站 443 到 ACR 登录服务器 IP
   - 路由表 next hop 检查
   - 虚拟设备透传检查

`[结论: 🔵 6/10 — MS Learn 单源(1.5) + 通用(1.5) + 近期(2) + 单源(1)]`

### Phase 2d: AKS 401 误导错误（实际是 404）
> 来源: [ADO Wiki — ACR Pull Image 401 Anonymous Token](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Pull%20Image%20401%20Anonymous%20Token)

⚠️ **这是 AKS 特有的误导性错误**。AKS kubelet 发送两个并行请求：匿名（空凭据）和带凭据的。对于不存在的镜像，带凭据的返回 404，匿名返回 401。

1. 验证镜像是否存在：
   ```bash
   az acr repository show-tags --name <registry> --repository <repo>
   ```

2. **401 是红鲱鱼**——聚焦 404 not found 部分
3. 修正部署清单中的镜像标签/名称

`[结论: 🟢 8/10 — ADO Wiki(2.5) + AKS 实证(2) + 近期(2) + Mooncake 适用(1.5)]`

### Phase 2e: Manifest/Tag 不存在
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/manifest-tag-not-found)

1. 验证 tag 是否存在：
   - Portal: Container registries > Repositories > 选择仓库 > 检查 tags 列表
   - CLI: `az acr repository show-tags --name <registry> --repository <repo>`
   
2. ⚠️ 以上命令仅在 ACR 网络规则允许访问时生效

**Kusto 查看 Pull Manifest 错误**：
```kusto
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
`[工具: Kusto skill — pull-performance.md]`

`[结论: 🔵 5.5/10 — MS Learn 单源(1.5) + 通用(1.5) + 近期(2) + 单源文档(1)]`

### Phase 3a: 间歇性 502 / 存储层故障
> 来源: [ADO Wiki — Intermittent 502 responses from ACR](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki)

ACR Pull 时通过 307 重定向到 Azure Blob Storage 下载镜像层。Azure Storage 前端节点偶尔进入半可用状态，负载均衡器仍然将流量路由到降级节点，导致间歇性连接重置。

**这是 Azure Storage 基础架构问题，不是 ACR 问题。**

1. **短期方案**：重试 Pull 操作——负载均衡器分发到多个前端节点，重试大概率命中健康节点
2. 在 CI/CD 管道中实现重试逻辑（指数退避）
3. 持续出现时参考 ICM: 234383246, 238929152, 230185890

**Kusto 验证 Pull 统计趋势**：
```kusto
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
`[工具: Kusto skill — pull-performance.md]`

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 多 ICM 实证(2) + 近期(2) + Mooncake 适用(1.5)]`

### Phase 3b: Docker Hub 拉取被防火墙拦截（Cloudflare CDN）
> 来源: [ADO Wiki — Docker pull issues intermittently](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki)

Docker Hub 镜像拉取重定向请求经过 Cloudflare CDN 时，CDN 将流量归类为 `WebRepositoryAndStorage` 类别。如果客户内部防火墙阻断此类别，Pull 间歇性失败。

⚠️ 此问题常与 AKS 集群升级同时出现但**二者无关**——升级导致 Pod 重启暴露了已有网络问题。

1. 修改内部防火墙规则，放行 `WebRepositoryAndStorage` 流量类别
2. 重启 Deployment 只能临时缓解

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 实证(2) + 近期(2) + Mooncake 适用(1.5)]`

---

## 辅助诊断查询

### 慢 Pull 操作定位

```kusto
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
`[工具: Kusto skill — pull-performance.md]`

### Pull 操作概览

```kusto
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
`[工具: Kusto skill — pull-performance.md]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | AKS Pull 401 Unauthorized (实际 404) | AKS kubelet 并行请求产生误导性 401 | 验证镜像存在，聚焦 404 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Pull%20Image%20401%20Anonymous%20Token) |
| 2 | Docker Hub EOF / Cloudflare CDN 间歇失败 | 防火墙阻断 WebRepositoryAndStorage 类别 | 放行该防火墙流量类别 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 3 | 间歇性 502 / connection reset by peer | Azure Storage 前端节点降级 | 重试+指数退避，持续则 ICM | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 4 | context deadline exceeded | DNS 解析失败 | 检查自定义 DNS 转发配置 | 🔵 6 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/context-deadline-exceeded) |
| 5 | I/O timeout: dial tcp <ip>:443 | 存储/数据端点 443 被阻断 | 放行 Storage 服务标签或数据端点 | 🔵 7 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/download-failed-443-io-time-out) |
| 6 | NSG 阻断出站到存储端点 | NSG 未放行 Storage.<region> | Network Watcher 诊断 + 添加 NSG 规则 | 🔵 7 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/download-failed-443-io-time-out) |
| 7 | manifest tagged by <tag> is not found | Tag 不存在 | 验证 tag: az acr repository show-tags | 🔵 5.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/manifest-tag-not-found) |
| 8 | Client.Timeout exceeded while awaiting headers | 登录服务器 443 被阻断 | 检查防火墙/代理/NSG/路由表 | 🔵 6 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/request-canceled-waiting-connection-timeout-exceeded) |
