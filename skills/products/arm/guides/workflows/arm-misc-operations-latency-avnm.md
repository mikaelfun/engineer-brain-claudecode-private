# ARM 杂项操作 (Latency / AVNM) — 排查工作流

**来源草稿**: (无 draft)
**Kusto 查询**: request-tracking.md, failed-operations.md, activity-log.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: ARM 层延迟排查
> 来源: request-tracking.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **识别延迟来源**: ARM 层 vs RP 层
2. **查询 ARM 入站请求耗时**:

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where subscriptionId == "{subscription}"
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where httpStatusCode != -1
| project TIMESTAMP, httpMethod, targetUri, httpStatusCode, correlationId
| order by TIMESTAMP desc
```

3. **对比 ARM 入站和出站请求时间差** — 判断延迟在 ARM 还是 RP
4. **检查 RP 响应时间**: 通过 HttpOutgoingRequests 分析

---

## Scenario 2: AVNM (Azure Virtual Network Manager) 合规
> 来源: 综合 | 适用: Mooncake ⚠️ / Global ✅

### 排查步骤
1. 确认 AVNM 配置和 compliance 状态
2. 检查 NAKS 相关 Kusto 遥测
3. 分析 ARM 层和 RP 层的性能指标
