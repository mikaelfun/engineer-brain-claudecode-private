---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/ACE Identity TSGs/Identity Technical Wiki/What is RamLogData in Auth Troubleshooter?"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD.wiki?pagePath=/ACE_Identity_TSGs/Identity_Technical_Wiki/What_is_RamLogData_in_Auth_Troubleshooter%3F"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# What is RamLogData in Auth Troubleshooter?

## What is RAMlog?

RAM（Risk Assessment Module）是 ESTS 运行时执行引擎，驱动所有在线保护算法的执行。

每个保护算法以一个或多个执行单元运行。这些执行单元处理输入请求数据、将数据记录到 RamLogData，并可能发出推荐建议（recommendation）。

RAM 始终执行所有可执行的执行单元（非预期错误除外），不会中途中止。

### Recommendation 结构

每条 recommendation 包含：
- **Recommendation Action**：描述 RAM 对请求的建议操作（block、risk 标记等）
- **Recommender Id**：发出建议的算法标识

### RAM 输出的 3 个聚合 Recommendation

1. **Overall recommendation**：覆盖本次执行中所有 recommendation 的汇总（主要输出）
2. **Account risk recommendation**：仅覆盖账户风险相关 recommendation，驱动 CA Account Risk 策略
3. **Session risk recommendation**：仅覆盖会话风险相关 recommendation，驱动 CA Session Risk 策略

---

## RamLogData 在 Auth Troubleshooter 中记录的信息

- RamLogData 捕获请求的 RAM 执行所有细节
- 每个执行单元记录一组条目，同一算法的条目共享相同前缀
- 部分信息需要对算法实现的深入理解，本文仅聚焦稳定的可解读字段

---

## 常用 RAM Action 代码

### Session / Account Risk Actions

| 代码 | 含义 |
|------|------|
| `RamActionNotSet = 0` | 未初始化（不应出现在日志中） |
| `RamActionDoNotDisturb = 1` | RAM 未发现任何异常 |
| `RamActionSessionRiskLow = 40` | 会话风险：低 |
| `RamActionAccountRiskLow = 50` | 账户风险：低 |
| `RamActionSessionRiskMedium = 60` | 会话风险：中 |
| `RamActionAccountRiskMedium = 70` | 账户风险：中 |
| `RamActionSessionRiskHigh = 80` | 会话风险：高 |
| `RamActionAccountRiskHigh = 90` | 账户风险：高 |
| `RamActionBlock = 100` | **RAM 决定 block 请求**（最高优先级，CA 无法执行；请求将直接失败） |

> **重要**：`RamActionBlock = 100` 表示 RAM 在 CA 执行前已 block 请求，不会给 CA 任何执行机会。

### OfflineRiskScoreData 字段

| 字段 | 说明 |
|------|------|
| `AccountRiskScore` | 参见 OfflineRiskScore 枚举值 |
| `AccountRiskEventTime` | 触发风险评估的事件时间 |
| `AccountRiskScoreComputationTime` | 风险评分更新时间 |

---

## 参考

完整 RamLogData 字段文档：https://aadwiki.windows-int.net/index.php?title=RamLogDataDetails
