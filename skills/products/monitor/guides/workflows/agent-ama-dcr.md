# Monitor AMA 数据收集规则 (DCR) — 排查工作流

**来源草稿**: [ado-wiki-a-ama-ht-list-associated-dcrs-dces.md], [ado-wiki-a-ama-ht-list-dcrs-by-immutableid.md]
**Kusto 引用**: 无
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: 查找机器关联的 DCR 和 DCE（同一订阅）
> 来源: ado-wiki-a-ama-ht-list-associated-dcrs-dces.md | 适用: Mooncake ✅

### 排查步骤

1. **通过 ASC Resource Explorer 查询**
   - 操作: 在 ASC 中使用 Resource Explorer 定位机器关联的 DCR
   - Portal 路径: Azure Support Center → Resource Explorer → Resource Provider (下拉) → Microsoft.Insights → dataCollectionRules → ResourceId

2. **通过 Azure Resource Graph (ARG) 查询**
   - 操作: 在 Azure Portal 中使用 ARG 查询 DCR 关联
   - Portal 路径: Azure Portal → Azure Resource Graph Explorer

   ```kql
   // 列出机器关联的 DCR 和 DCE
   // 工具: Azure Resource Graph Explorer
   insightsresources
   | where type == "microsoft.insights/datacollectionruleassociations"
   | where id startswith "/subscriptions/{subscriptionId/resourceGroups/{resourcegroup}/providers/{provider}/{type}/{name}"
   | extend associationType = iff(isnotnull(properties.dataCollectionRuleId), "dataCollectionRule", "dataCollectionEndpoint")
   | extend associationId = iff(isnotnull(properties.dataCollectionRuleId), properties.dataCollectionRuleId, properties.dataCollectionEndpointId)
   | project associationType, associationId
   ```
   [来源: ado-wiki-a-ama-ht-list-associated-dcrs-dces.md]

3. **通过 PowerShell/Cloud Shell 查询**
   - 操作: 使用 Az.Monitor 模块获取 DCR 关联
   ```powershell
    = "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/xxxxxxxxxxx/providers/Microsoft.Compute/virtualMachines/xxxxxxxxxxx"
    = Get-AzDataCollectionRuleAssociation -TargetResourceId 
    | Where DataCollectionRuleId -ne  | Select DataCollectionRuleId | Format-List
   ```
   [来源: ado-wiki-a-ama-ht-list-associated-dcrs-dces.md]

4. **判断逻辑**：
   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | 返回 DCR 列表 | 机器已关联 DCR | 检查 DCR 配置是否正确 |
   | 返回空结果 | 机器未关联任何 DCR | 需要创建 DCRA 关联 |
   | 查询报错 | 权限不足或资源不存在 | 确认 ResourceId 正确，检查 RBAC 权限 |

---

## Scenario 2: 查找机器关联的 DCR 和 DCE（跨订阅）
> 来源: ado-wiki-a-ama-ht-list-associated-dcrs-dces.md | 适用: Mooncake ✅

### 排查步骤

1. **打开 ASC ARG Query Editor**
   - Portal 路径: Azure Support Center → Resource Explorer → SubscriptionId → ARG Query Editor

2. **执行跨订阅 ARG 查询**
   ```kql
   // 跨订阅查找 DCR 关联
   // 工具: ASC ARG Query Editor
   insightsresources
   | where type == "microsoft.insights/datacollectionruleassociations"
   | where id startswith "/subscriptions/{subscriptionId/resourceGroups/{resourcegroup}/providers/{provider}/{type}/{name}"
   | extend associationType = iff(isnotnull(properties.dataCollectionRuleId), "dataCollectionRule", "dataCollectionEndpoint")
   | extend associationId = iff(isnotnull(properties.dataCollectionRuleId), properties.dataCollectionRuleId, properties.dataCollectionEndpointId)
   | project associationType, associationId
   ```
   [来源: ado-wiki-a-ama-ht-list-associated-dcrs-dces.md]

3. **已知 immutableId 但不知 DCR ResourceId**
   ```kql
   // 通过 immutableId 反查 DCR ResourceId
   // 工具: ASC ARG Query Editor / Azure Portal ARG Explorer
   resources
   | where type =~ "microsoft.insights/datacollectionrules"
   | extend immutableId = properties.immutableId
   | where immutableId =~ "dcr-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```
   [来源: ado-wiki-a-ama-ht-list-associated-dcrs-dces.md]

4. **判断逻辑**：
   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | 找到 DCR ResourceId | 可以进一步检查 DCR 配置 | 查看 DCR JSON 配置 |
   | immutableId 无匹配 | DCR 已被删除或 immutableId 错误 | 确认 immutableId 来源（agent config） |

---

## Scenario 3: 列出订阅下所有 DCR 及 immutableId 对照表
> 来源: ado-wiki-a-ama-ht-list-dcrs-by-immutableid.md | 适用: Mooncake ✅

### 排查步骤

1. **前置条件**
   - 必须已知 DCR 所在的 subscriptionId
   - 如果只有 immutableId（如从 agent config 获取），需先用 Scenario 2 查找 subscriptionId

2. **通过 ASC ARG 查询**
   - Portal 路径: Azure Support Center → Resource Explorer → SubscriptionId → ARG Query Editor
   ```kql
   // 列出订阅内所有 DCR 和 immutableId
   // 工具: ASC ARG Query Editor
   resources
   | where type == "microsoft.insights/datacollectionrules"
   | extend immutableId = properties.immutableId
   | project immutableId, id
   ```
   [来源: ado-wiki-a-ama-ht-list-dcrs-by-immutableid.md]

3. **通过 PowerShell 查询**
   ```powershell
   # Cloud Shell 单行命令
   Get-AzDataCollectionRule -SubscriptionId {subscriptionId} | Select ImmutableId, Id

   # 完整 PowerShell 脚本（本地执行）
    = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process -Force
   if (!()) {Connect-AzAccount -TenantId }
    = Set-AzContext -SubscriptionId 
   Get-AzDataCollectionRule -SubscriptionId  | Select ImmutableId, Id
   ```
   [来源: ado-wiki-a-ama-ht-list-dcrs-by-immutableid.md]

4. **通过 REST API 查询**
   - 参考: [Data Collection Rules - List By Subscription](https://learn.microsoft.com/rest/api/monitor/data-collection-rules/list-by-subscription)

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| Agent config 中 immutableId 无法匹配到 DCR | DCR 可能已删除或在不同订阅 | → Scenario 2 反查 |
| DCRA 关联存在但数据未收集 | DCR 配置问题（stream/transform 错误） | → details/agent-ama-dcr.md |
