# Monitor Log Analytics 数据摄取与丢失排查 — 排查工作流

**来源草稿**: [ado-wiki-a-check-ingestion-errors.md], [ado-wiki-b-Data-ingestion-troubleshooting-flowchart.md], [ado-wiki-a-Troubleshoot-Log-Analytics-billing.md], [ado-wiki-c-Cluster-Ingestion-Volume-BillingStatistics-Detector.md], [ado-wiki-a-Platform-resource-logs-ingestion-troubleshooting.md], [ado-wiki-b-identify-ingestion-issues.md], [ado-wiki-b-investigate-server-side-ingestion-issue.md], [ado-wiki-d-identifying-controlling-high-ingestion.md], [mslearn-high-data-ingestion-troubleshoot.md], [ado-wiki-a-Agent-data-ingestion-troubleshooting-flowchart.md]
**Kusto 引用**: 无
**场景数**: 7
**生成日期**: 2026-04-07

---

## Scenario 1: 数据引入量暴涨 — 排查 unexpected high cost / ingestion spike
> 来源: ado-wiki-a-Troubleshoot-Log-Analytics-billing.md (Scenario 1) + mslearn-high-data-ingestion-troubleshoot.md | 适用: Mooncake ✅

### 排查步骤

1. **确认暴涨时间窗口和幅度**
   - 操作: 从客户描述或 Usage and estimated cost blade 确定暴涨起始日期和倍数
   - Portal 路径: Azure Portal → Log Analytics workspace → Usage and estimated cost

2. **按 DataType 分解每日数据量（最关键）**
   ```kql
   // 按表查看每日计费数据量
   Usage
   | where TimeGenerated > ago(32d)
   | where IsBillable == true
   | summarize DailyGB = sum(Quantity) / 1000.0 by bin(StartTime, 1d), DataType
   | order by StartTime asc, DailyGB desc
   ```
   [来源: ado-wiki-a-Troubleshoot-Log-Analytics-billing.md]

3. **前后对比 — 量化增长最大的表**
   ```kql
   // 对比暴涨前后各表的日均数据量（调整日期）
   let cutoff = datetime(2026-03-13);  // 替换为实际暴涨日期
   let before = Usage | where StartTime >= ago(32d) and StartTime < cutoff | where IsBillable == true
     | summarize AvgDailyGB_Before = sum(Quantity) / 1000.0 / datetime_diff('day', cutoff, ago(32d)) by DataType;
   let after = Usage | where StartTime >= cutoff | where IsBillable == true
     | summarize AvgDailyGB_After = sum(Quantity) / 1000.0 / datetime_diff('day', now(), cutoff) by DataType;
   before | join kind=fullouter after on DataType
   | extend GrowthFactor = round(iff(AvgDailyGB_Before > 0, AvgDailyGB_After / AvgDailyGB_Before, -1.0), 2)
   | project DataType = coalesce(DataType, DataType1),
     AvgDailyGB_Before = round(AvgDailyGB_Before, 3),
     AvgDailyGB_After = round(AvgDailyGB_After, 3), GrowthFactor
   | order by AvgDailyGB_After desc
   ```
   [来源: ado-wiki-a-Troubleshoot-Log-Analytics-billing.md + mslearn-high-data-ingestion-troubleshoot.md]

4. **按资源 ID 定位数据来源 Top 资源**
   ```kql
   // 暴涨当天按资源ID查数据量Top 20
   search *
   | where TimeGenerated > ago(24h)
   | where _IsBillable == true
   | summarize BillableDataBytes = sum(_BilledSize) by _ResourceId, $table, _IsBillable
   | sort by BillableDataBytes desc
   | extend NicelyFormatted = format_bytes(BillableDataBytes)
   | take 20
   ```
   [来源: ado-wiki-a-Troubleshoot-Log-Analytics-billing.md]

5. **如果 AzureDiagnostics 是增长主力 — 按 Category + Resource 分解**
   ```kql
   // 按 Category 和 Resource 查看 AzureDiagnostics 数据量
   AzureDiagnostics
   | where TimeGenerated > ago(24h)
   | where _IsBillable == true
   | summarize BillableDataKiloBytes = sum(_BilledSize) / 1000 by Category, Resource
   | sort by BillableDataKiloBytes desc
   ```
   [来源: ado-wiki-a-Troubleshoot-Log-Analytics-billing.md]

6. **检查 Defender/Sentinel benefit 是否过期**
   ```kql
   // 检查 benefit 使用量是否下降（导致账单增加但数据量不变）
   Operation
   | where TimeGenerated >= ago(31d)
   | where Detail startswith "Benefit amount used"
   | parse Detail with "Benefit amount used: " BenefitUsedGB " GB"
   | extend BenefitUsedGB = toreal(BenefitUsedGB)
   | parse OperationKey with "Benefit type used: " BenefitType
   | project BillingDay=TimeGenerated, BenefitType, BenefitUsedGB
   | sort by BillingDay asc, BenefitType asc
   | render columnchart
   ```
   [来源: ado-wiki-a-Troubleshoot-Log-Analytics-billing.md]

7. **判断逻辑**：
   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | 某个 DataType 暴增 10x+ | 该表对应的资源/配置变更是根因 | → 按 Category/Resource 深入（步骤 5） |
   | AzureDiagnostics 暴增 | 可能是新增 Diagnostic Settings 或现有资源活动量增加 | → Scenario 3（DS 排查）+ 按 ResourceProvider 分解 |
   | Perf/Event/Syslog 暴增 | Agent/VM 配置变更或新增 Agent | → Scenario 5（Agent 变化检查） |
   | 数据量不变但账单增加 | benefit 过期或 pricing tier 变化 | → 检查步骤 6 的 benefit 图 |
   | 多表均匀增长 | 整体负载增加 | → 检查 Heartbeat Agent 数量变化 |

---

## Scenario 2: 数据引入错误排查 — check ingestion errors
> 来源: ado-wiki-a-check-ingestion-errors.md | 适用: Mooncake ✅

### 排查步骤

1. **检查客户侧引入错误**
   ```kql
   _LogOperation
   | where Category == "Ingestion"
   | where Level == "Error"
   ```
   [来源: ado-wiki-a-check-ingestion-errors.md]

2. **检查后端引入失败事件（需后端权限）**
   ```kql
   // Cluster: azureinsightsmc / azureinsightsmc
   ActivityFailedEvent
   | where TIMESTAMP > ago(7d)
   | where Role == "InMemoryTransferManagerRole"
   | where properties contains "00000000-0000-0000-0000-000000000000" // 替换为客户 workspaceID
   | parse properties with * "DataTypeId=[" DataTypeId "]" *
   | parse properties with * " ResourceId=[" resourceId "]" *
   ```
   [来源: ado-wiki-a-check-ingestion-errors.md]

3. **判断逻辑**：
   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | _LogOperation 有 Error 记录 | 客户侧引入管道有错误 | → 分析 Detail 字段确定具体错误类型 |
   | ActivityFailedEvent 有记录 | 后端引入管道失败 | → 按 DataTypeId 定位受影响的表 |
   | 两者均无 Error | 引入管道正常，问题可能在数据源端 | → Scenario 5（Agent 排查） |

---

## Scenario 3: Diagnostic Settings 变更排查 — 是否有新增/修改 DS 导致数据增加
> 来源: ado-wiki-a-Platform-resource-logs-ingestion-troubleshooting.md | 适用: Mooncake ✅

### 排查步骤

1. **客户侧：检查 AzureActivity 中 DS 变更**
   ```kql
   // 查找指定时间窗口内的 Diagnostic Settings 变更
   AzureActivity
   | where TimeGenerated between(datetime(2026-03-10)..datetime(2026-03-15)) // 调整日期
   | where OperationNameValue has_any ("microsoft.insights/diagnosticSettings/write", "diagnosticSettings")
   | project TimeGenerated, Caller, OperationNameValue, ActivityStatusValue,
       ResourceGroup, _ResourceId, Properties
   | order by TimeGenerated asc
   ```
   [来源: troubleshooter 构建]

2. **后端：RegistrationTelemetry 验证 DS 配置稳定性（需后端权限）**
   ```kql
   // Cluster: azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn / azureinsightsmc
   RegistrationTelemetry
   | where TIMESTAMP > ago(30d)
   | where subscriptionId =~ "替换为订阅ID"  // 注意：后端存储为大写，用 =~ 大小写不敏感
   | summarize
       RegistrationCount = count(),
       DistinctResources = dcount(resourceId),
       DistinctDataTypes = dcount(dataType)
       by bin(TIMESTAMP, 1d)
   | order by TIMESTAMP asc
   ```
   [来源: Case 2604070040001829 排查经验]

   > ⚠️ 注意：subscriptionId 在后端存储为全大写（如 `2FF341C4-...`），KQL 的 `==` 会匹配失败，必须用 `=~` 或 `toupper()`。

3. **后端：ARM HttpIncomingRequests 验证 DS 写操作**
   ```kql
   // Cluster: armmcadx.chinaeast2.kusto.chinacloudapi.cn / armmc
   HttpIncomingRequests
   | where TIMESTAMP between(datetime(2026-03-10)..datetime(2026-03-16))
   | where subscriptionId =~ "替换为订阅ID"
   | where httpMethod in ("PUT", "PATCH", "DELETE")
   | where operationName has "diagnosticSettings"
   | project TIMESTAMP, httpMethod, httpStatusCode, operationName, resourceType
   | order by TIMESTAMP asc
   ```
   [来源: Case 2604070040001829 排查经验]

4. **判断逻辑**：
   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | AzureActivity 有 DS write 操作 | 有人在暴涨时间点添加/修改了 DS | → 确认是哪个资源的 DS 被修改 |
   | RegistrationTelemetry 资源数稳定 | DS 配置未变更 | → 排除 DS 变更假设，转 Scenario 4 |
   | ARM 无 PUT/PATCH 操作 | 无 DS 写操作 | → 确认排除 DS 变更 |
   | RegistrationTelemetry 资源数突增 | 有新资源注册了 DS | → 确认哪些资源被新增 |

---

## Scenario 4: 后端集群 Ingestion Volume 检查 — BillingStatistics Detector
> 来源: ado-wiki-c-Cluster-Ingestion-Volume-BillingStatistics-Detector.md | 适用: Mooncake ✅

### 排查步骤

1. **使用 AppLens BillingStatistics Detector**
   - 操作: 在 AppLens 中打开对应 workspace 的 Cluster Ingestion Volume 检测器
   - 该 Detector 查询 `BillingStatistics` 表，按 Cluster ID 过滤，聚合每日引入量

2. **手动查询 BillingStatistics（需后端权限）**
   ```kql
   // Cluster: 对应 workspace 的后端集群
   BillingStatistics
   | where TIMESTAMP > ago(30d)
   | where ClusterId == "替换为Cluster GUID"
   | summarize DailyIngestionGB = sum(IngestionVolumeInBytes) / 1.0E9 by bin(TIMESTAMP, 1d)
   | order by TIMESTAMP asc
   ```
   [来源: ado-wiki-c-Cluster-Ingestion-Volume-BillingStatistics-Detector.md]

---

## Scenario 5: Agent/VM 数量变化排查 — Heartbeat 和 Agent 配置
> 来源: ado-wiki-a-Agent-data-ingestion-troubleshooting-flowchart.md | 适用: Mooncake ✅

### 排查步骤

1. **检查每天连接到 workspace 的 Agent 数量**
   ```kql
   Heartbeat
   | where TimeGenerated > ago(30d)
   | summarize Agents = dcount(Computer) by bin(TimeGenerated, 1d)
   | order by TimeGenerated asc
   ```
   [来源: troubleshooter 构建]

2. **判断逻辑**：
   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | Agent 数量在暴涨日突增 | 新增了 VM/Agent 接入 | → 确认哪些新 Agent，检查 DCR 配置 |
   | Agent 数量稳定 | 不是 Agent 数量导致的 | → Scenario 6（数据源端排查） |

---

## Scenario 6: Daily Cap 被超出排查
> 来源: ado-wiki-a-Troubleshoot-Log-Analytics-billing.md (Scenario 4) | 适用: Mooncake ✅

### 排查步骤

1. **理解 Daily Cap 机制**
   - Daily Cap 不是即时生效的"急刹车"，数据量越大超出越多
   - Daily Cap reset time 不一定是 00:00 UTC，需要在 Workspace Dashboard 中查看 `quotaNextResetTime`
   - Portal 路径: Azure Portal → Log Analytics workspace → Usage and estimated cost → Daily cap

2. **检查 Daily Cap 触发记录**
   ```kql
   _LogOperation
   | where Category == "Ingestion"
   | where Operation == "Data collection stopped" or Operation == "Data collection started"
   | project TimeGenerated, Operation, Detail
   | order by TimeGenerated desc
   ```
   [来源: mslearn-daily-cap-exceeded-investigation.md]

3. **判断逻辑**：
   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | 有 "Data collection stopped" 记录 | Daily Cap 被触发，超出部分仍被计费 | → 评估是否调整 Daily Cap 或优化数据源 |
   | 无 stopped 记录 | Daily Cap 未被触发 | → 回到 Scenario 1 继续排查 |

   > ⚠️ Update Jan 2026: PG 已修复高引入速率场景下 Daily Cap 大幅超出的问题（EastUS/WestEurope 等高流量区域）。如果客户仍然看到大幅超出，可联系 STA Sahil 评估退款可行性。

---

## Scenario 7: 降低 Log Analytics 数据摄取成本
> 来源: ado-wiki-a-Troubleshoot-Log-Analytics-billing.md (Scenario 5) | 适用: Mooncake ✅

### 成本优化方案

| 方案 | 适用场景 | 注意事项 |
|------|---------|---------|
| 调整 Diagnostic Settings 类别 | 资源启用了过多诊断类别 | 关闭不需要的类别立即生效 |
| 使用 Basic Logs | 不常查询的表 | 查询功能受限（仅简单查询） |
| 配置 Commitment Tier | 数据量持续高位（100GB/天起） | 31 天最低承诺期 |
| DCR Ingestion-time Transformation | 在引入时过滤不需要的字段/行 | 需 AMA + DCR |
| 设置 Daily Cap | 紧急止血 | ⚠️ 超过后数据会丢失，不建议长期使用 |
| Workspace Insights workbook | 持续监控数据量趋势 | Portal 路径: workspace → Workbooks → Usage |

参考:
- [Azure Monitor cost optimization best practices](https://learn.microsoft.com/azure/azure-monitor/best-practices-cost)
- [Container Insights cost optimization](https://learn.microsoft.com/azure/azure-monitor/containers/container-insights-cost#controlling-ingestion-to-reduce-cost)

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 数据引入量突然暴涨 | 按 Scenario 1 步骤排查 | → details/la-ingestion.md |
| 数据引入延迟或丢失 | 按 Scenario 2 检查引入错误 | → details/la-ingestion.md |
| 新增 Diagnostic Settings 后数据暴涨 | 按 Scenario 3 验证 DS 变更 | → details/diagnostic-settings.md |
| Daily Cap 超出仍被计费 | 按 Scenario 6 排查 | → details/la-billing.md |
| 需要降低数据成本 | 按 Scenario 7 评估优化方案 | → details/la-billing.md |
