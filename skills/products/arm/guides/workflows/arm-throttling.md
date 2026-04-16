# ARM API 限流与 429 错误 — 排查工作流

**来源草稿**: (无 draft 文件)
**Kusto 引用**: [throttling-analysis.md], [request-tracking.md], [arm-rp-chain.md]
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: 订阅级 429 限流排查
> 来源: throttling-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **获取基本信息**：订阅 ID、问题时间段、受影响的操作类型
2. **查找触发 429 的操作**：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
   | where subscriptionId == "{subscription}"
   | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
   | where httpStatusCode == 429
   | summarize count() by bin(TIMESTAMP, 1h), operationName
   | order by count_ desc
   ```
   `[来源: throttling-analysis.md — 步骤 1]`

3. **分析客户端信息**（使用步骤 2 获取的 operationName）：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
   | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
   | where subscriptionId == "{subscription}"
   | where httpStatusCode != -1
   | where operationName == "{operationName}"
   | summarize count() by clientIpAddress, principalOid, clientApplicationId, userAgent, httpStatusCode
   | order by count_ desc
   ```
   `[来源: throttling-analysis.md — 步骤 2]`

4. **判断逻辑**：
   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | 单一 clientApplicationId 占主导 | 客户自动化脚本/工具引起 | 建议客户优化调用频率 |
   | 多 clientIpAddress、多 principalOid | 多用户/工具并发 | 建议错峰或添加 retry-after |
   | userAgent 含 `python-requests` / `azcli` | 脚本批量操作 | 检查是否有不必要的轮询 |

---

## Scenario 2: ARM 层 vs RP 层限流判断
> 来源: throttling-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **检查 RP 层 429**：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpOutgoingRequests
   | where subscriptionId == "{subscription}"
   | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
   | where httpStatusCode == 429
   | summarize count() by hostName
   | order by count_ desc
   ```
   `[来源: throttling-analysis.md — 步骤 3]`

2. **判断逻辑**：
   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | HttpOutgoingRequests 有 429 | RP 层限流 | 联系对应 RP 团队 |
   | 仅 HttpIncomingRequests 有 429 | ARM 层限流 | 检查 ARM 限流策略 |
   | hostName 含 `compute` | CRP 限流 | 参考 CRP 限流文档 |
   | hostName 含 `network` | NRP 限流 | 参考 NRP 限流文档 |

---

## Scenario 3: 限流时间分布与趋势
> 来源: throttling-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **查看全量统计**：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
   | where subscriptionId == "{subscription}"
   | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
   | where httpStatusCode != -1
   | summarize
       TotalRequests = count(),
       ThrottledRequests = countif(httpStatusCode == 429),
       FailedRequests = countif(httpStatusCode >= 400)
       by bin(TIMESTAMP, 1h), operationName
   | order by ThrottledRequests desc
   ```
   `[来源: throttling-analysis.md — 步骤 4]`

2. **时间分布可视化**：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
   | where subscriptionId == "{subscription}"
   | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
   | summarize
       TotalRequests = count(),
       ThrottledRequests = countif(httpStatusCode == 429)
       by bin(TIMESTAMP, 1h)
   | render timechart
   ```
   `[来源: throttling-analysis.md — 步骤 5]`

3. **关联请求追踪**（如需追踪具体请求）：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
   | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
   | where subscriptionId == "{subscription}"
   | where correlationId == "{correlationId}"
   | project TIMESTAMP, httpMethod, targetUri, commandName, httpStatusCode, clientIpAddress, userAgent
   | order by TIMESTAMP asc
   ```
   `[来源: request-tracking.md — 查询 2]`
