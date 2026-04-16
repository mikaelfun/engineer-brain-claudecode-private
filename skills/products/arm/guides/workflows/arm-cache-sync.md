# ARM 缓存同步问题 — 排查工作流

**来源草稿**: (无 draft 文件)
**Kusto 引用**: [arm-rp-chain.md]
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: ARM 缓存与 RP 数据不一致
> 来源: arm-rp-chain.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **确认问题现象**：资源在 Portal/CLI 显示的状态/属性与实际不一致（如标签不同步、已删除资源仍显示等）
2. **从 ARM 出站请求追踪 RP 响应**：
   ```kql
   cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpOutgoingRequests
   | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
   | where subscriptionId == "{subscription}"
   | where targetUri contains "{resourceName}"
   | project TIMESTAMP, ActivityId, serviceRequestId, clientRequestId, targetUri, httpMethod, httpStatusCode, hostName
   | order by TIMESTAMP desc
   ```
   `[来源: arm-rp-chain.md — 步骤 1]`

3. **判断逻辑**：
   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | RP 返回 200 但数据与 ARM 缓存不同 | ARM 缓存未刷新 | 等待缓存 TTL 过期或触发资源更新 |
   | RP 返回 404 | 资源已在 RP 端删除 | ARM 缓存清理可能有延迟 |
   | hostName 显示具体 RP | 确认数据来源 | 联系对应 RP 确认 |

---

## Scenario 2: 使用 ActivityId 追踪到 RP 日志
> 来源: arm-rp-chain.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **使用 ActivityId 查询 CRP 日志**：
   ```kql
   cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
   | where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
   | where activityId == "{activityId}"
   | project TIMESTAMP, traceLevel, message, callerName
   | order by TIMESTAMP asc
   ```
   `[来源: arm-rp-chain.md — 步骤 2]`

2. **常见 RP 主机名对照**：
   | hostName 包含 | 资源提供程序 |
   |---------------|-------------|
   | compute | Microsoft.Compute (CRP) |
   | network | Microsoft.Network |
   | containerservice | Microsoft.ContainerService (AKS) |
   | storage | Microsoft.Storage |
