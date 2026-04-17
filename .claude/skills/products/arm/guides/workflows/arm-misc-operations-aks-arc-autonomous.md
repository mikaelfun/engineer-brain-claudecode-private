# ARM 杂项操作 (AKS / Arc Autonomous) — 排查工作流

**来源草稿**: (无 draft)
**Kusto 查询**: request-tracking.md, failed-operations.md, activity-log.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: ARM 请求追踪（AKS/Arc 场景）
> 来源: request-tracking.md, activity-log.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **获取 correlationId** — 从客户错误信息或活动日志中获取
2. **查询 ARM 入站请求**:

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, httpMethod, targetUri, commandName, httpStatusCode, clientIpAddress, userAgent
| order by TIMESTAMP asc
```

3. **查询 ARM 出站请求获取 ActivityId**:

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpOutgoingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, ActivityId, httpMethod, targetUri, hostName, httpStatusCode
| order by TIMESTAMP asc
```

4. **使用 ActivityId 追踪到 RP 日志**

---

## Scenario 2: Arc Autonomous / SAW / YubiKey 相关
> 来源: 综合 | 适用: Mooncake ⚠️ / Global ✅

### 排查步骤
1. 确认 Arc autonomous 配置
2. 检查 SAW 环境下的证书和 edge-browser 问题
3. 验证 management group 层级配置
