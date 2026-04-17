# Monitor Application Insights 综合问题 — 排查工作流

**来源草稿**: [ado-wiki-a-asc-component-properties-tab.md], [ado-wiki-a-ASC-Get-AAD-Object-Info.md], [ado-wiki-a-ASC-Get-AAD-User-Info.md], [ado-wiki-a-ASC-Get-ResourceId.md], [ado-wiki-a-ASC-Navigate-To-Resource.md], [ado-wiki-a-ASC-Open-From-Case-Management.md], [ado-wiki-a-ASC-Query-Azure-Resource-Graph.md], [ado-wiki-a-asc-query-customer-data-tab.md], ... (31 total)
**Kusto 引用**: 无
**场景数**: 0
**生成日期**: 2026-04-07

---

## Scenario 1: Application Insights 综合问题 — KQL 诊断
> 来源: ado-wiki-a-asc-component-properties-tab.md | 适用: Mooncake ✅

### 诊断查询

```kql
union *
| where timestamp > ago(90d)
| summarize max(timestamp) by cloud_RoleName, itemType
| sort by max_timestamp asc
```
[来源: ado-wiki-a-asc-query-customer-data-tab.md]

```kql
union *
| where timestamp > ago(7d)
| summarize count() by bin(timestamp,1d), cloud_RoleName, itemType
| order by timestamp asc
```
[来源: ado-wiki-a-asc-query-customer-data-tab.md]

```kql
union * 
| where timestamp > ago(90d) 
| summarize count() by bin(timestamp,1d), cloud_RoleName, cloud_RoleInstance, itemType, sdkVersion
| order by timestamp asc, cloud_RoleName, cloud_RoleInstance, itemType, sdkVersion
```
[来源: ado-wiki-a-asc-query-customer-data-tab.md]

```kql
union * 
| summarize count() by bin(timestamp, 7d), itemType
| order by timestamp desc, itemType
```
[来源: ado-wiki-a-asc-query-customer-data-tab.md]

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 参见草稿内容 | 按流程排查 | → details/ai-general.md |
