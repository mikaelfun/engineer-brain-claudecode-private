# ACR API 版本弃用 — 排查工作流

**来源草稿**: (无直接草稿)
**Kusto 引用**: [rp-activity.md]
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: 客户使用已弃用的 Preview API 版本
> 来源: topic-plan (api-deprecation) | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. 确认客户报告的错误信息是否包含 API 版本弃用提示
2. 查询 RP 活动日志确认客户使用的 API 版本：
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
   | where LoginServerName == "{registry}.azurecr.cn"
   | where env_time > ago(7d)
   | where isnotempty(ExceptionMessage) or isnotempty(error) or Level == "Error"
   | project env_time, OperationName, Message, ExceptionMessage, error, error_description
   | order by env_time desc
   ```
   

3. 检查客户调用中使用的 api-version 参数
4. 建议客户迁移到最新 GA API 版本

### 决策树

- 错误包含 "api-version" → 确认使用了弃用版本 → 建议迁移
- 无明显错误 → 检查 Azure Policy 扫描结果

---

## Scenario 2: Azure Policy 扫描标记弃用 API 使用
> 来源: topic-plan (api-deprecation) | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. 确认 Azure Policy 评估结果中标记的非合规资源
2. 查询 RP 操作统计了解 API 调用模式：
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RPActivity
   | where env_time > ago(1d)
   | where RegistryLoginUri == "{registry}.azurecr.cn" or LoginServerName == "{registry}.azurecr.cn"
   | summarize 
       TotalCount = count(),
       SuccessCount = countif(Level != "Error" and isempty(ExceptionMessage)),
       ErrorCount = countif(Level == "Error" or isnotempty(ExceptionMessage)),
       AvgDurationMs = avg(DurationMs)
     by OperationName
   | order by TotalCount desc
   ```
   

3. 识别调用弃用 API 的自动化脚本或工具
4. 提供 API 迁移指南链接
