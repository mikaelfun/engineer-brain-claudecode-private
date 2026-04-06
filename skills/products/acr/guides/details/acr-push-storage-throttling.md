# ACR 推送、存储限制与限流 — 综合排查指南

**条目数**: 7 | **草稿融合数**: 0 | **Kusto 查询融合**: 3
**来源草稿**: 无
**Kusto 引用**: [push-performance.md], [storage-layer-performance.md], [throttling-analysis.md]
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 错误分类与初步判断
> 来源: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/)

收到 ACR Push 失败或性能降级报告后，根据错误信息分类：

**判断逻辑**：
| 错误信息 | 含义 | 后续动作 |
|---------|------|---------|
| `429 Too Many Requests` | 超过 SKU 并发限制 | → Phase 2a |
| `503 Egress is over the account limit` | Azure Storage 带宽限流 | → Phase 2b |
| `The operation is disallowed on this registry` (40TiB) | 存储容量已满 | → Phase 3a |
| `The operation is disallowed` (writeEnabled=false) | 仓库/镜像被锁定 | → Phase 3b |
| Push 成功但镜像无内容 | 隔离策略拦截 | → Phase 3c |
| 慢 Push / 间歇超时 | 性能问题 | → Phase 4 |
| 异地复制 Push 间歇失败 | 存储同步延迟 | → Phase 3a (子场景) |

`[结论: 🟢 8.5/10 — 多个 ADO Wiki TSG 交叉验证 + Kusto 查询工具验证]`

### Phase 2a: 429 限流排查
> 来源: [ADO Wiki — How to Handle Throttling errors](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FHow%20to%20Handle%20Throttling%20errors)

**Step 1: 确认限流位置（FE/TS vs nginx）**

```kusto
let throttledRequests = (
    cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
    | where PreciseTimeStamp > ago(7d)
    | where http_request_host == "{registry}.azurecr.cn"
    | where http_response_status == "429"
    | project correlationid
);
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where correlationid in (throttledRequests)
| where message == "fe_request_stop" or message == "ts_request_stop" or message startswith "nginx"
| summarize count() by correlationid
| extend throttledby = iff(count_ > 1, "FE/TS", "nginx")
| summarize count() by throttledby
```
`[工具: Kusto skill — throttling-analysis.md]`

| throttledby | 说明 |
|-------------|------|
| FE/TS | 被前端/Token Service 限流 |
| nginx | 被 nginx 层限流 |

**Step 2: 429 统计趋势**

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_response_status == "429"
| summarize 
    ThrottledCount = count(),
    UniqueIPs = dcount(http_request_remoteaddr),
    UniqueUserAgents = dcount(http_request_useragent)
  by bin(PreciseTimeStamp, 1h)
| order by PreciseTimeStamp desc
```
`[工具: Kusto skill — throttling-analysis.md]`

**Step 3: 按来源 IP 定位限流大户**

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_response_status == "429"
| summarize 
    ThrottledCount = count(),
    LastThrottled = max(PreciseTimeStamp),
    UserAgents = make_set(http_request_useragent, 5)
  by http_request_remoteaddr
| order by ThrottledCount desc
```
`[工具: Kusto skill — throttling-analysis.md]`

**Step 4: 限流率分析**

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where message == "fe_request_stop" or message == "ts_request_stop"
| extend IsThrottled = http_response_status == "429"
| summarize 
    TotalRequests = count(),
    ThrottledRequests = countif(IsThrottled),
    ThrottleRate = round(100.0 * countif(IsThrottled) / count(), 2)
  by bin(PreciseTimeStamp, 1h)
| order by PreciseTimeStamp desc
```
`[工具: Kusto skill — throttling-analysis.md]`

**ACR SKU 限制参考**：
| SKU | 读取操作/分钟 | 写入操作/分钟 |
|-----|--------------|--------------|
| Basic | 1,000 | 100 |
| Standard | 3,000 | 500 |
| Premium | 10,000 | 2,000 |

**解决方案**：
1. 业务确实需要更高并发 → 升级 SKU（Basic→Standard→Premium）
2. 实现重试逻辑 + 指数退避处理瞬时限流

`[结论: 🟢 9/10 — ADO Wiki(2.5) + Kusto 工具验证(+1) + 近期(2) + Mooncake 适用(2) + SKU 参考表交叉(2.5)]`

### Phase 2b: 503 Egress 存储带宽限流
> 来源: [ADO Wiki — 503 Egress is over the account limit](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2F503%20Egress%20is%20over%20the%20account%20limit)

ACR 内部使用的 Azure Storage 账户（在内部 Azure 订阅，客户不可访问）出现带宽限流。**问题在 Azure Storage 基础架构，不在 ACR 本身。**

**Step 1: Kusto 定位存储账户**

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_response_status == "307"
| where http_request_host == "{registry}.azurecr.cn"
| summarize count() by bin(PreciseTimeStamp, 1d), azure_blobaccount_name
```

**Step 2: 存储层错误分析**

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').StorageAccountLogs
| where env_time > ago(1d)
| where ReferrerHeader contains "{registry}.azurecr.cn"
| where toint(HttpStatusCode) >= 400
| project env_time, OperationType, HttpStatusCode, RequestStatus, 
         RequestUrl, RequesterIPAddress, UserAgentHeader
| order by env_time desc
```
`[工具: Kusto skill — storage-layer-performance.md]`

**解决方案**：
1. 间歇性 → 实现重试 + 指数退避
2. 持续/大面积 503 → 提 ICM 联合 Azure Storage 团队排查

`[结论: 🟢 8.5/10 — ADO Wiki(2.5) + Kusto 工具验证(+1) + 近期(2) + Mooncake 适用(2) + 单源实证(2)]`

### Phase 3a: 40TiB 存储容量限制
> 来源: [ADO Wiki — ACR Storage Limit Increase](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Storage%20Limit%20Increase)

**Step 1: 验证存储使用量**

```bash
az acr show-usage -r {registryName}
```

**Step 2: 判断方案**

| 场景 | 方案 |
|------|------|
| 存储未满但接近 | 设置 retention policy + auto-purge + 清理无用镜像 |
| 已满，需要扩容 | 提 ICM 到 ACR PG，包含 subscription ID、registry name、请求大小 |
| 异地复制+存储接近上限 | 一个副本满了另一个还没同步 → 间歇性 Push 失败 |

**关键限制**（⚠️ 必须告知客户）：
- 内部最大限制 60TB
- 超过 60TB 不支持新增异地复制
- 超过 40TiB **无 SLA 保证**
- 存储限制**一旦提升不可回调**

**异地复制子场景**：存储接近上限时，一个区域副本先满导致该副本 Push 失败，另一个区域仍可接受。同步完成后两边都失败。解决方案相同——清理空间降到 40TiB 以下。

`[结论: 🟢 8.5/10 — ADO Wiki(2.5) + 近期(2) + 多场景实证(2) + Mooncake 适用(2)]`

### Phase 3b: 仓库/镜像锁定 (writeEnabled=false)
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/troubleshoot-push-error-operation-disallowed-timeout)

1. 检查锁定状态：
   ```bash
   # 仓库级
   az acr repository show --name <reg> --repository <repo>
   # 镜像级
   az acr repository show --name <reg> --image <img:tag>
   ```

2. 解锁：
   ```bash
   az acr repository update --name <reg> --repository <repo> --write-enabled true
   ```

`[结论: 🔵 6/10 — MS Learn 单源(1.5) + 通用(1.5) + 近期(2) + 单源文档(1)]`

### Phase 3c: Push 成功但镜像无内容（隔离策略）
> 来源: [ADO Wiki — ACR Push Failure no content](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Push%20Failure%20no%20content)

Docker/Helm Push 看似成功但镜像内容为空。根因是 **Quarantine 隔离功能** 阻断了内容提交——Defender for Cloud 启用后自动开启隔离。

```bash
# 获取 ACR 资源 ID
id=$(az acr show --name <registry> --query id -o tsv)

# 禁用隔离
az resource update --ids $id --set properties.policies.quarantinePolicy.status=disabled

# 重新 Push
docker push <registry>.azurecr.io/<image>:<tag>
```

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 实证(2) + 近期(2) + Mooncake 适用(1.5)]`

### Phase 4: 慢 Push 性能排查
> 来源: [ADO Wiki — Slow pull and push performance](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki)

需要区分 ACR 服务端延迟、Blob Storage 延迟、客户端延迟。

**Step 1: Push 性能分析**

```kusto
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
`[工具: Kusto skill — push-performance.md]`

**Step 2: 存储层延迟分析**

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').StorageAccountLogs
| where env_time > ago(1d)
| where ReferrerHeader contains "{registry}.azurecr.cn"
| extend LatencySeconds = totimespan(EndToEndLatency)/totimespan(1s)
| summarize 
    AvgLatency = avg(LatencySeconds),
    P50Latency = percentile(LatencySeconds, 50),
    P95Latency = percentile(LatencySeconds, 95),
    P99Latency = percentile(LatencySeconds, 99),
    Count = count()
  by OperationType, bin(env_time, 1h)
| order by env_time desc
```
`[工具: Kusto skill — storage-layer-performance.md]`

**Step 3: 慢操作定位**

```kusto
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
`[工具: Kusto skill — push-performance.md]`

**判断逻辑**：
| 指标 | 正常范围 | 异常表现 | 根因方向 |
|------|---------|---------|---------|
| ACR 响应时间 | <5s (小层) | >30s | ACR 服务端/存储层 |
| 存储 P95 延迟 | <2s | >10s | Azure Storage 降级 |
| MBPerSecond | >5MB/s | <1MB/s | 网络/客户端瓶颈 |

`[结论: 🔵 7/10 — ADO Wiki(2.5) + Kusto 工具验证(+1) + 近期(2) + Mooncake 适用(1.5) + 单源(1)]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 429 Too Many Requests | 超过 SKU 并发限制 | 升级 SKU + 重试退避 | 🟢 9 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FHow%20to%20Handle%20Throttling%20errors) |
| 2 | 503 Egress over account limit | Azure Storage 带宽限流 | 重试退避 / ICM 联合存储团队 | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2F503%20Egress%20is%20over%20the%20account%20limit) |
| 3 | Push 成功但无内容 | Quarantine 隔离策略 (Defender) | 禁用 quarantinePolicy | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Push%20Failure%20no%20content) |
| 4 | operation disallowed (40TiB) | 存储容量已满 | 清理 + ICM 扩容（最大60TB） | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Storage%20Limit%20Increase) |
| 5 | 异地复制间歇 Push 失败 | 一个副本存储满，同步延迟 | 清理空间到 40TiB 以下 | 🔵 7 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Storage%20Limit%20Increase) |
| 6 | 慢 Push / 间歇超时 | 多因素: 网络/存储/客户端 | Kusto 分层诊断 | 🔵 7 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 7 | Push disallowed (writeEnabled=false) | 锁定 | 解锁 writeEnabled | 🔵 6 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/troubleshoot-push-error-operation-disallowed-timeout) |
