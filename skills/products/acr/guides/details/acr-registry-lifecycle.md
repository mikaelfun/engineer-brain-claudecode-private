# ACR 注册表生命周期管理 — 综合排查指南

**条目数**: 8 | **草稿融合数**: 0 | **Kusto 查询融合**: 2
**来源草稿**: 无
**Kusto 引用**: [registry-info.md](../../../../kusto/acr/references/queries/registry-info.md), [rp-activity.md](../../../../kusto/acr/references/queries/rp-activity.md)
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 确定注册表状态与基础信息
> 来源: [ADO Wiki — 多个 TSG](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) + Kusto skill

1. 查询注册表基础配置信息
   ```kusto
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
   | where env_time >= ago(3d)
   | where LoginServerName contains "{registry}.azurecr.cn"
   | sort by env_time desc
   | project env_time, CreatedTime, SubscriptionId, ResourceGroup, RegistryName, LoginServerName, 
            RegistryId, RegistryLocation, SkuId, AdminUserEnabled, PublicNetworkAccessDisabled, 
            PrivateLinkEndpointEnabled, DataEndpointEnabled, HasAssignedIdentity, ByokEnabled,
            PrivateLinksVersion
   | take 1
   ```
   `[工具: Kusto skill — registry-info.md]`

2. 查询 RP 活动日志，了解最近操作状态
   ```kusto
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
   | where LoginServerName == "{registry}.azurecr.cn"
   | where env_time > ago(7d)
   | where Level != "Information"
   | project env_time, OperationName, HttpMethod, HttpStatus, Message, ExceptionMessage
   | order by env_time desc
   ```
   `[工具: Kusto skill — rp-activity.md]`

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| 注册表 disabled 状态 | ARM 不一致 | → Phase 2a |
| DNS/CNAME 创建失败 400 | 孤立 CNAME 记录 | → Phase 2b |
| 注册表名称不可用 | NRS 保留 | → Phase 2c |
| 复制操作卡住 | 后端权限问题 | → Phase 3 |
| Webhook 500 错误 | 跨订阅或 ILB ASE | → Phase 4 |
| API 弃用通知 | 预览版 API 过期 | → Phase 5 |
| CE1/CN1 区域迁移 | 区域退役 | → Phase 6 |

`[结论: 🟢 8.5/10 — ADO Wiki(2.5) + Kusto 工具验证 + 时效<6月(2) + Mooncake(2)]`

### Phase 2a: 注册表 Disabled 状态
> 来源: [ADO Wiki — ACR disabled issue](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20disabled%20issue)

**症状**：ACR 报告为 disabled，无法登录、拉取镜像

**根因**：ARM 维护期间 ACR 更新请求导致 ARM 资源状态与 ACR RP 状态不一致，RP 将注册表设为 disabled

**排查步骤**：
1. 通过 Kusto 查询 ARM incoming requests 确认 404 时间窗口：
   ```kusto
   cluster('armprodgbl.eastus').database('ARMProd').HttpIncomingRequests
   | where PreciseTimeStamp > ago(1d)
   | where subscriptionId contains "{sub-id}"
   | where targetUri contains "{acr}"
   | project TIMESTAMP, httpMethod, httpStatusCode, correlationId
   ```
2. 确认 ARM 不一致 → 提交 ICM 给 ACR PG Triage 团队
3. 请 PG 审查受影响注册表的 Master Entity

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + 通用(1.5)]`

### Phase 2b: DNS CNAME 冲突导致创建失败
> 来源: [ADO Wiki — ACR DNS And Name Reservation](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20DNS%20And%20Name%20Reservation)

**症状**：注册表创建失败，400 错误，DNS 名称已被占用

**根因**：RP 在 vNET 与 NRP 握手失败时泄漏 CNAME 记录，DNS 名称被占用但注册表未成功创建

**排查步骤**：
1. 通过 Kusto 验证创建尝试记录：
   ```kusto
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
   | where LoginServerName == "{registry}"
   | project env_time, CorrelationId, Level, HttpMethod, HttpStatus
   ```
   `[工具: Kusto skill — rp-activity.md]`
2. 使用 Geneva action **Clean up orphan registry CNAME record** 手动清理
3. 重试注册表创建

`[结论: 🟢 8.5/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + Mooncake(2)]`

### Phase 2c: 注册表名称被 NRS 保留
> 来源: [ADO Wiki — ACR DNS And Name Reservation](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20DNS%20And%20Name%20Reservation)

**症状**：CheckNameAvailability 返回 `NameNotAvailable_NotAllowedByPolicy`，删除注册表后无法在不同租户重新创建

**根因**：Name Reservation Service (NRS) 保留已删除注册表名称

| 订阅类型 | 保留期 |
|---------|--------|
| Internal | 无限 |
| Enterprise/CSP | 180 天 |
| 其他 | 30 天 |

**排查步骤**：
1. 通过 Kusto 验证 NRS 保留信息：
   ```kusto
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
   | where TaskName == "NameReservationServiceManagement"
   | where Message contains "{registry-name}"
   ```
   `[工具: Kusto skill — rp-activity.md]`
2. 如原因是 `NameNotAvailable_NotAllowedByPolicy` → 执行 ACIS action **Force Delete Registry name from NRS**（需原始 subscription/tenant ID）
3. 等待最长 1 小时
4. 如 ACIS 失败 → 提交 ICM 给 Azure DNS Name Reservation 团队

`[结论: 🟢 8.5/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + Mooncake(2)]`

### Phase 3: 复制操作卡住 (Creating/Deleting)
> 来源: [ADO Wiki — ACR Replication CRUD TSG](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Replication%20CRUD%20TSG)

**症状**：ACR 复制操作永远停在 creating 或 deleting 状态

**根因**：后端权限问题 — ACR 第一方应用的角色分配在客户的 trust-managed 订阅上缺失

**排查步骤**：
1. 检查 ARM incoming requests 找到 delete/create correlationId
2. 交叉引用 ACR RP 日志：
   ```kusto
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
   | where CorrelationId == "{clientRequestId}"
   ```
   `[工具: Kusto skill — rp-activity.md]`
3. 如果错误指示后端权限问题 → 通过 ICM (serviceId 22003) 或 acr-sup Teams 频道升级到 ACR PG oncall，请求添加缺失的角色分配

**Kusto 辅助查询** — 复制操作状态：
```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where OperationType contains "Replica" or OperationName contains "Replica"
| project env_time, OperationName, OperationType, Message, DurationMs, 
         ReplicationStorageAccount, ReplicationStorageContainer
| order by env_time desc
```
`[工具: Kusto skill — rp-activity.md]`

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + 通用(1.5)]`

### Phase 4: Webhook 跨订阅/ILB ASE 失败
> 来源: [ADO Wiki — ACR Webhook fails to push to App Service](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20Webhook%20fails%20to%20push%20to%20App%20Service)

**症状**：ACR webhook 推送到 App Service 返回 500 InternalServerError

**根因**：
- ACR webhook 不支持跨订阅 spoke model 配置
- Kudu 端点必须可公网访问（ACR 不支持通过 VNET 访问 ILB ASE 中的 Kudu）

**解决方案**：
- 使用 Azure DevOps Pipeline 替代 ACR webhook 实现 CI/CD 到 ILB ASE 中的 App Service
- 确保 webhook 目标和 ACR 在同一订阅

**Kusto 辅助查询** — Webhook 连接性：
```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
| where env_time > ago(4d)
| where Role contains "notification"
| where OperationName == "WebHookCallStart"
| where LoginServerName == "{registry}.azurecr.cn"
| extend Webhook = extract(" to ([[:alnum:]|-]*)", 1, Message)
| project Id = strcat(CorrelationId, Webhook), StartTime = env_time, Webhook
| join (
    RPActivity
    | where env_time > ago(4d)
    | where OperationName startswith "WebHookCallEnd"
    | where LoginServerName == "{registry}.azurecr.cn"
    | extend Webhook = extract(" to ([[:alnum:]|-]*)", 1, Message)
    | project OperationName, Id = strcat(CorrelationId, Webhook), EndTime = env_time
) on Id
| project OperationName, Webhook, StartTime, EndTime, Duration = EndTime - StartTime
```
`[工具: Kusto skill — rp-activity.md（引用自 onenote-acr-kusto-queries.md）]`

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + 通用(1.5)]`

### Phase 5: API 弃用处理
> 来源: [ADO Wiki — ACR API Deprecation Handling](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20API%20Deprecation%20Handling%20for%20CSS)

#### 5a. 客户收到弃用通知但并未使用旧 API

**根因**：ARM PolicyScan 服务（clientApplicationId: `1d78a85d-813d-46f0-b496-dd72f50a3ec0`）在客户订阅上调用了弃用 API

**验证方法** — Kusto 查询 ARM 日志：
```kusto
cluster('armprodgbl.eastus').database('ARMProd').Unionizer('Requests','HttpIncomingRequests')
| where TIMESTAMP > ago(30d)
| where subscriptionId == '{sub}'
| where targetResourceProvider == 'MICROSOFT.CONTAINERREGISTRY'
| where apiVersion == '2018-02-01-preview'
| summarize count() by userAgent, clientApplicationId
```

如果仅 PolicyScan 出现 → 无需客户操作

#### 5b. 客户确实使用了旧 API

**弃用版本**：`2016-06-27-preview`, `2017-06-01-preview`, `2018-02-01-preview`, `2017-03-01`

**解决方案**：
1. 迁移到新版 API：[可用版本列表](https://learn.microsoft.com/azure/templates/microsoft.containerregistry/allversions)
2. 更新 SDK：[最新版本](https://azure.github.io/azure-sdk/releases/latest/index.html?search=containerregistry)
3. 更新 az CLI 到最新版本

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + 通用(1.5)]`

### Phase 6: CE1/CN1 区域退役迁移
> 来源: [MCVKB/ACR/CE1 CN1 retirement](../../known-issues.jsonl)

**症状**：CE1 (China East 1) 和 CN1 (China North 1) 的 ACR 资源需要迁移

**解决方案**：
- 按照 Microsoft 迁移指南操作：[Container Registry 迁移](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/relocation/relocation-container-registry)
- 注意：AKS 不受影响（CE1/CN1 从未支持 AKS），但 ACR 可在这些区域创建，因此需要迁移

> **21V 适用**: 明确适用

`[结论: 🟢 9/10 — OneNote(3) + 时效<6月(2) + 单源+实证(2) + 明确 Mooncake(2)]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | CE1/CN1 区域 ACR 需迁移 | 区域退役 | 按官方迁移指南操作 | 🟢 9 | [MCVKB/ACR/CE1CN1](../../known-issues.jsonl) |
| 2 | API 弃用通知(误报) | PolicyScan 触发 | Kusto 验证 userAgent | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20API%20Deprecation%20Handling%20for%20CSS) |
| 3 | 旧 API 版本调用失败 | API 已弃用 | 更新 API/SDK/CLI 版本 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20API%20Deprecation%20Handling%20for%20CSS) |
| 4 | DNS CNAME 冲突创建失败 | RP 泄漏 CNAME | Geneva action 清理 + 重试 | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20DNS%20And%20Name%20Reservation) |
| 5 | 删除后名称不可用 | NRS 保留 (30-180天/无限) | ACIS Force Delete 或 ICM | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20DNS%20And%20Name%20Reservation) |
| 6 | 复制操作卡住 | 后端权限缺失 | ICM 升级 PG 添加角色分配 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Replication%20CRUD%20TSG) |
| 7 | Webhook 跨订阅 500 错误 | 不支持跨订阅/ILB ASE | 改用 DevOps Pipeline | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20Webhook%20fails%20to%20push%20to%20App%20Service) |
| 8 | 注册表 disabled | ARM 状态不一致 | ICM 请 PG 审查 Master Entity | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20disabled%20issue) |
