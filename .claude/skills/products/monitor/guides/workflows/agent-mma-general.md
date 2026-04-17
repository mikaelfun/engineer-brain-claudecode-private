# Monitor MMA 代理通用问题与迁移 — 排查工作流

**来源草稿**: [ado-wiki-a-CAPI2-Logging-for-MMA-Agent.md], [ado-wiki-a-Locate-VM-Workspace-Legacy-MMA.md], [ado-wiki-a-MMA-Caching-Rate-Limits-Tuning.md], [ado-wiki-a-MMA-Crash-Data-Collection.md], [ado-wiki-a-MMA-High-Memory-Usage-TSG.md], [ado-wiki-a-MMA-VM-ResourceID-Missing-Heartbeat.md], [ado-wiki-a-MMA-Windows-Agent-Install-Uninstall-Extension-TSG.md], [ado-wiki-a-MMA-Windows-Event-Log-Collection-TSG.md], ... (50 total)
**Kusto 引用**: 无
**场景数**: 22
**生成日期**: 2026-04-07

---

## Scenario 1: How to locate which Workspace a customer's VM is reporting data to in the last 24 hours, and what th
> 来源: ado-wiki-a-Locate-VM-Workspace-Legacy-MMA.md | 适用: Mooncake ✅

   ```kql
   AgentTelemetry
   | where TIMESTAMP > ago(24h)
   | where tolower(ResourceId) contains '<COMPUTER RESOURCE URI>'
   | distinct ResourceId, WorkspaceId, AgentId, AgentVersion
   ```
   [来源: ado-wiki-a-Locate-VM-Workspace-Legacy-MMA.md]

---

## Scenario 2: ---
> 来源: ado-wiki-a-MMA-Windows-Agent-Install-Uninstall-Extension-TSG.md | 适用: Mooncake ✅

---

## Scenario 3: ---
> 来源: ado-wiki-a-MMA-Windows-Event-Log-Collection-TSG.md | 适用: Mooncake ✅

---

## Scenario 4: ---
> 来源: ado-wiki-a-MMA-Windows-Perf-Counter-Collection-TSG.md | 适用: Mooncake ✅

---

## Scenario 5: ---
> 来源: ado-wiki-a-restart-clear-MMA-cache.md | 适用: Mooncake ✅

---

## Scenario 6: ---
> 来源: ado-wiki-a-retrieve-MMA-installation-logs.md | 适用: Mooncake ✅

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 参见上述场景 | 按步骤排查 | → details/agent-mma-general.md |
