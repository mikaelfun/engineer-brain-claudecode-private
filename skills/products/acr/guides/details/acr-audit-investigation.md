# ACR 审计日志与操作追溯 — 综合排查指南

**条目数**: 7 | **草稿融合数**: 4 | **Kusto 查询融合**: 1
**来源草稿**: [ado-wiki-acr-audit-logs.md], [ado-wiki-acr-change-analysis.md], [ado-wiki-acr-find-user-of-manifest-event.md], [ado-wiki-acr-investigate-bulk-image-tag-deletions.md]
**Kusto 引用**: [activity-errors.md]
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 审计需求分类
> 来源: [ADO Wiki — ACR Audit Logs](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Audit%20Logs) + [ADO Wiki — ACR Change Analysis](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Change%20Analysis) + [MCVKB](onenote)

客户的审计需求分为两大类：

**判断逻辑**：
| 客户需求 | 含义 | 后续动作 |
|---------|------|---------|
| 谁 Push/Pull/Delete 了镜像？ | 数据平面审计（镜像操作） | → Phase 2 |
| 谁修改了 ACR 配置？（SKU/admin/retention 等） | 控制平面审计（注册表配置变更） | → Phase 3 |
| 报告大批量镜像/tag 意外删除 | 批量删除调查 | → Phase 4 |
| Tag 莫名消失，怀疑 retention policy | 区分自动化 vs retention | → Phase 5 |
| 需要找到操作者的 IP 地址 | 操作者溯源 | → Phase 2 (关注 IP 提取) |

`[结论: 🟢 9.5/10 — OneNote(3) + 4个 ADO Wiki TSG(2.5) 交叉验证 + 多实证(3) + Mooncake 适用(2)]`

### Phase 2: 数据平面审计 — 追踪 Push/Pull/Delete 操作者
> 来源: [MCVKB — How to get the operator's IP](onenote) + [ADO Wiki — ACR How to find user of manifest event](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20How%20to%20find%20user%20of%20manifest%20event)

#### Phase 2a: 客户自助 — 启用诊断日志

建议客户启用 ACR 诊断日志以获得自助审计能力：

1. Portal → 注册表 → Diagnostic Settings → Add Diagnostic Setting
2. 选择 Log Analytics Workspace（需预先创建）
3. 保存后等待几分钟
4. 执行操作（如 Push 镜像）
5. Portal → Logs → 展开 Log Management → `ContainerRegistryRepositoryEvents`

⚠️ **预览限制**：诊断日志目前**不记录 Delete/Untag 事件**，仅记录 Push 和 Pull 事件。

公开文档: [ACR Diagnostic Logs](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-diagnostics-audit-logs#registry-resource-logs)

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 近期(2) + 单源实证(2) + Mooncake 适用(1.5)]`

#### Phase 2b: 工程师排查 — Kusto + DGREP 追踪操作者

**Step 1: 在 Kusto 中定位 Manifest 事件**

```kusto
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
`[工具: Kusto skill — activity-errors.md]`

对于 Delete/Untag 事件，使用 RegistryManifestEvent：
```kusto
cluster("ACR").database("acrprod").RegistryManifestEvent
| where PreciseTimeStamp between (datetime(2024-03-25T06:05) .. 1d) 
| where Registry == "{registry}.azurecr.io"
| where Artifact has "{repository-name}"
| where Tag == "{tag}"
| where http_request_method == "DELETE"
| project activitytimestamp, message, Action, Artifact, Registry, Tag, CorrelationId, RegionStamp
```

**Step 2: 通过 DGREP 获取未脱敏信息**

Kusto 中的关键字段（如 IP、用户名）会被 PII 脱敏。需要通过 Geneva DGREP 获取原始值：

1. 打开 [Geneva DGREP](https://portal.microsoftgeneva.com/logs/dgrep)
2. 配置参数：
   - **Endpoint**: `Diagnostics PROD`
   - **Namespace**: `AcrProdRegistry`
   - **Event to search**: `RegistryManifestEvent`
   - **Time range**: 与 Kusto 输出匹配（±5-10 分钟）
   - **Scoping conditions**: 
     - `Region` = Kusto 输出的 RegionStamp（⚠️ 用 `Region` 不用 `RegionStamp`，后者可能丢数据）
     - 选择 `UTC`
   - **Filtering conditions**: `| Registry contains <ACR-name>`
   - **Client query**:
     ```kql
     where correlationId == "<correlation-id>"
     take 10
     ```

3. 点击 **Search**，然后点击 **Search unscrubbed**（绿色条下方）

4. 关键字段：
   - `auth_user_name` — 操作者身份（用户邮箱、Service Principal ID、Managed Identity）
   - `http_request_remoteaddr_ipv4` — 操作者源 IP
   - `http_request_useragent` — 使用的客户端工具（Azure CLI、Docker、REST API 等）

> ⚠️ **数据保留**：Kusto 保留 90 天，Jarvis/DGREP 保留 30 天。

`[结论: 🟢 9.5/10 — OneNote(3) + ADO Wiki(2.5) 交叉验证 + 多实证(3) + Mooncake 适用(2)]`

#### Phase 2c: 操作者是未知 Application ID

> 来源: [ADO Wiki — ACR How to find user of manifest event](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20How%20to%20find%20user%20of%20manifest%20event)

如果 `auth_user_name` 显示一个在客户租户中找不到的 Application ID，且 `http_request_remoteaddr_ipv4` 是 Microsoft 自有 IP → **操作由 ACR Task 或 `az acr run` 执行**（使用共享 ACR Agent 的特殊 Service Principal）。

**ARM Kusto 交叉验证**：
```kusto
cluster("AzureResourceManager").database("ARMProd").HttpIncomingRequests
| where TIMESTAMP between (datetime(2024-03-25T06:08:47) .. 5min)
| where subscriptionId contains "<subscription-id>"
| where targetUri contains "<acr-name>"
```

**targetUri 判断逻辑**：
| targetUri 包含 | 操作类型 |
|---------------|---------|
| `*/runs?*` | `az acr run` |
| `*/tasks/*/runs/*` | ACR Task 执行 |
| `*/scheduleRun?*` | 定时 ACR Task |
| `purge` | `az acr purge` |
| ca# (run ID) | Task 触发的运行 |

> ⚠️ Untag 操作可由 purge 或 untag 命令执行，两者都可以是 ACR Task 的内容。

`[结论: 🟢 9/10 — ADO Wiki(2.5) + OneNote 交叉(3) + 多实证(3) + Mooncake 适用(1.5)]`

### Phase 3: 控制平面审计 — ACR 配置变更追溯
> 来源: [ADO Wiki — ACR Change Analysis](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Change%20Analysis)

适用场景：客户想知道谁修改了 ACR 配置（如 admin 账号启用/禁用、SKU 变更、retention policy 切换等）。

⚠️ **这不同于审计日志**——审计日志追踪 Push/Pull 事件，变更分析追踪注册表**属性配置**变更。

**Step 1: 注册 Change Analysis 资源提供程序**

1. Portal → 订阅 → Resource Providers
2. 搜索 `Microsoft.ChangeAnalysis` → Register
3. 等待注册完成

**Step 2: 查看变更**

1. Portal 全局搜索 "Change Analysis"
2. 选择资源组和注册表
3. 查看变更详情：
   - 变更内容（哪些属性）
   - 变更发起者（谁）
   - 变更前后值

**Step 3: 详细变更历史**

Portal → Activity Logs → 选择操作 → Change History (preview)
- 显示每个属性的 Previous Value vs New Value

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 近期(2) + 单源实证(2) + Mooncake 适用(1.5)]`

### Phase 4: 批量删除调查
> 来源: [ADO Wiki — ACR Investigate Bulk Image Tag Deletions](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Investigate%20Bulk%20Image%20Tag%20Deletions)

当客户报告大量镜像/tag 意外被删除时，需要系统性调查。

#### Phase 4a: 确定删除范围和时间线

```kusto
let targetRegistry = "{registry}.azurecr.io";
let startTime = ago(7d);
let endTime = now();
cluster("ACR").database("acrprod").RegistryManifestEvent
| where activitytimestamp between (startTime .. endTime)
| where Registry == targetRegistry
| where Action in ("Delete", "Untag")
| summarize DeletionCount=count(),
            FirstDeletion=min(activitytimestamp),
            LastDeletion=max(activitytimestamp),
            AffectedRepos=dcount(Artifact) by Action
| project Action, DeletionCount, FirstDeletion, LastDeletion, AffectedRepos
```

#### Phase 4b: 可视化删除模式

```kusto
let targetRegistry = "{registry}.azurecr.io";
let startTime = ago(7d);
let endTime = now();
cluster("ACR").database("acrprod").RegistryManifestEvent
| where activitytimestamp between (startTime .. endTime)
| where Registry == targetRegistry
| where Action in ("Delete", "Untag")
| summarize DeletionCount=count() by Action, bin(activitytimestamp, 1h)
| render timechart
```

**判断逻辑**：
| 模式 | 含义 |
|------|------|
| 集中爆发（短时间大量） | 自动化脚本/ACR Task/Pipeline |
| 分散零星 | 手动操作 |
| 每天固定时间 | 定时任务 |

#### Phase 4c: 追踪删除来源

使用 Phase 2b 的 DGREP 流程获取每个 CorrelationId 的操作者身份。

#### Phase 4d: 检查 Retention Policy

```kusto
let targetRegistry = "{registry}.azurecr.io";
let startTime = ago(7d);
let endTime = now();
cluster("ACR").database("acrprod").RegistryActivity
| where TIMESTAMP between (startTime .. endTime)
| where service == "eventserver"
| where message startswith "queued_purge_message"
| where message has targetRegistry
| parse kind=regex message with *
    "queued_purge_message: message id: " parsedMessageId:string
    " policy name: " parsedPolicyName:string
    " loginserver: " parsedLoginServer:string
    " expiration: " parsedExpiration:string
    " repo: " parsedRepo:string
    " digest: " parsedDigest:string
    " retention days: " parsedRetentionDays:int *
| project TIMESTAMP,
          parsedPolicyName,
          parsedRetentionDays,
          parsedRepo,
          parsedDigest
| order by TIMESTAMP desc
```

#### Phase 4e: 检查 ACR Task 触发的删除

```kusto
let startTime = datetime(2024-03-25T06:00:00);
let endTime = startTime + 15min;
let targetSubscription = "{subscription-id}";
let targetRegistry = "{registry-name}";
cluster("AzureResourceManager").database("ARMProd").HttpIncomingRequests
| where TIMESTAMP between (startTime .. endTime)
| where subscriptionId contains targetSubscription
| where targetUri contains targetRegistry
| where targetUri has_any ("runs", "tasks", "purge")
| project TIMESTAMP,
          operationName,
          targetUri,
          userAgent,
          callerIdentity,
          callerIpAddress,
          httpStatusCode
| order by TIMESTAMP desc
```

#### Phase 4f: 检查 Repository 级删除

```kusto
let targetRegistry = "{registry}.azurecr.io";
let startTime = ago(7d);
let endTime = now();
cluster("ACR").database("acrprod").RegistryActivity
| where PreciseTimeStamp between (startTime .. endTime)
| where http_request_host == targetRegistry
| where http_request_method == "DELETE"
| where http_request_uri startswith "/v2/_acr/"
| where http_request_uri contains "/repository"
| project Day = bin(PreciseTimeStamp, 1d),
          Registry = http_request_host,
          Uri = http_request_uri,
          HttpStatus = http_response_status,
          http_request_method,
          http_request_remoteaddr
| order by PreciseTimeStamp desc
```

`[结论: 🟢 9/10 — ADO Wiki 完整 TSG(2.5) + 近期(2) + 多工具实证(2.5) + Mooncake 适用(2)]`

### Phase 5: 区分 Retention Policy vs 外部自动化
> 来源: [ADO Wiki — ACR image deletion investigation](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20image%20deletion%20investigation)

**核心判断**：ACR retention policy **只删除 untagged manifest**。如果 Kusto 中 Delete 事件的 Tag 字段有值（WithTag > 0），则**不是** retention policy 造成的。

**判断查询**：查看 RegistryManifestEvent 中 Delete 和 PurgeManifest 的比例：
- WithTag > 0 → 外部自动化（CI/CD Pipeline、脚本、定时任务）
- 纯 PurgeManifest 且无 tagged deletes → Retention Policy
- 删除数在各 repo 间均匀（如 30/30）→ 基于规则的清理（保留最近 N 个 tag）

**进一步确认**：检查被删 tag 名称是否包含 CI/CD 模式（PR ID、Build Number 等）。

`[结论: 🟢 8.5/10 — ADO Wiki(2.5) + 近期(2) + 实证(2) + Mooncake 适用(2)]`

---

## 辅助诊断查询

### 根据 CorrelationId 追踪完整请求链

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where correlationid == "{correlationId}"
| project activitytimestamp, message, auth_token_access, correlationid, err_code, err_detail, 
         err_message, http_request_host, http_request_id, http_request_method, http_request_uri, 
         http_response_status, level, service
| order by activitytimestamp asc
```
`[工具: Kusto skill — activity-errors.md]`

### 按时间范围查询错误

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where http_request_host == "{registry}.azurecr.cn"
| where level != "info"
| project PreciseTimeStamp, vars_name, message, err_message, err_detail, http_request_method, 
         http_response_status, http_request_uri, http_request_remoteaddr, correlationid, level
| order by PreciseTimeStamp asc
```
`[工具: Kusto skill — activity-errors.md]`

### 错误分布统计

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where level == "error"
| summarize ErrorCount = count() by err_code, err_message, http_response_status
| order by ErrorCount desc
```
`[工具: Kusto skill — activity-errors.md]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | 需要追踪操作者 IP | Kusto PII 脱敏 | Kusto correlationId + DGREP unscrubbed | 🟢 9.5 | [MCVKB](onenote) + [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 2 📋 | 需要审计 Push/Pull/Delete 操作 | 需启用诊断日志 | 启用 Diagnostic Settings + Log Analytics | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Audit%20Logs) |
| 3 📋 | 需要追踪 ACR 配置变更 | 需要 Change Analysis | 注册 Microsoft.ChangeAnalysis + Portal 查看 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Change%20Analysis) |
| 4 📋 | 镜像被未知 App ID 删除 | ACR Task/acr run 共享 Agent | ARM Kusto 交叉验证 targetUri | 🟢 9 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 5 📋 | 大批量镜像/tag 意外被删 | 需系统性调查 | 8步调查法（范围→源→策略→自动化） | 🟢 9 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Investigate%20Bulk%20Image%20Tag%20Deletions) |
| 6 | Tag 消失怀疑 retention | 需区分自动化 vs retention | WithTag>0 → 非 retention | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20image%20deletion%20investigation) |
| 7 📋 | 需要操作者 IP（21V） | Kusto 脱敏，需 Jarvis | Kusto 90天 + Jarvis 30天 | 🟢 9 | [MCVKB](onenote) |
