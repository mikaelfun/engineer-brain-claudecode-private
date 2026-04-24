# VM Azure Arc VM — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 3 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Update Manager (AUMv2) in Mooncake only available in limited regions for private preview; Chin | AUM v2 rollout to Mooncake is phased; not all regions have full feature parity w | Use supported regions (ChinaEast2/ChinaNorth2 for Arc VMs). Access AUM preview v | 🟢 8 | ON |
| 2 | 在 DfM 全局搜索框中无法找到刚创建的 Case（使用顶部 Global Search 搜不到） | DfM 全局搜索通过 Azure Search 实现，存在最长 15 分钟的索引延迟（15 min SLA），刚创建的 Case 尚未被索引 | 改用 Cases Tab 的 All Cases 视图：点击 + 新建标签页 → 选择 Cases → 切换为 All Cases 视图 → 右上角搜索框输入  | 🔵 6.5 | AW |
| 3 | Need to search previous IcMs by error message, support ticket ID, title, or alias to find related es |  | Use ICM portal search at https://portal.microsofticm.com/imp/v3/incidents/search | 🔵 5.5 | AW |

## 快速排查路径

1. **Azure Update Manager (AUMv2) in Mooncake only available in limited regions for p**
   - 根因: AUM v2 rollout to Mooncake is phased; not all regions have full feature parity with global Azure
   - 方案: Use supported regions (ChinaEast2/ChinaNorth2 for Arc VMs). Access AUM preview via portal flight link with feature flags. Check PG for latest region a
   - `[🟢 8 | ON]`

2. **在 DfM 全局搜索框中无法找到刚创建的 Case（使用顶部 Global Search 搜不到）**
   - 根因: DfM 全局搜索通过 Azure Search 实现，存在最长 15 分钟的索引延迟（15 min SLA），刚创建的 Case 尚未被索引
   - 方案: 改用 Cases Tab 的 All Cases 视图：点击 + 新建标签页 → 选择 Cases → 切换为 All Cases 视图 → 右上角搜索框输入 Case 编号并按 Enter。或从 Dashboard → See all records → My Open Cases 下拉选 All
   - `[🔵 6.5 | AW]`

3. **Need to search previous IcMs by error message, support ticket ID, title, or alia**
   - 方案: Use ICM portal search at https://portal.microsofticm.com/imp/v3/incidents/search, or run Kusto: cluster('Icmcluster').database('IcmDataWarehouse').Inc
   - `[🔵 5.5 | AW]`

