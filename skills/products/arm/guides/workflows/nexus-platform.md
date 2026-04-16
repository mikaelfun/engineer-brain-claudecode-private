# ARM Nexus 平台与 NAKS — 排查工作流

**来源草稿**: ado-wiki-a-copilot-assisted-nexus-troubleshooting.md, ado-wiki-a-nexus-observability.md 等 10 files
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Copilot-assisted Nexus 排查
> 来源: ado-wiki-a-copilot-assisted-nexus-troubleshooting.md | 适用: Mooncake ❌ / Global ✅

### 排查步骤
1. **准备**: Clone AzureAdaptiveCloud.Diagnostics repo
2. **打开排查模板**: Templates/troubleshooting_prompt.md
3. **提供 Case 输入**:
   - Issue description
   - Time window
   - subscriptionId
   - correlationId
   - Primary resource identity
4. **Copilot 输出**:
   - 推荐相关 KQL 查询文档
   - 参数化 Kusto 查询
   - 解释结果并建议下一步
5. **Tips**: 使用最窄时间窗口、优先提供 correlationId

---

## Scenario 2: NAKS 与 Log Collection
> 来源: Nexus platform 参考 | 适用: Mooncake ❌ / Global ✅

### 排查步骤
1. 使用 SSH 连接到 NAKS 集群
2. 执行 log-collector 收集诊断日志
3. 分析 observability 数据
