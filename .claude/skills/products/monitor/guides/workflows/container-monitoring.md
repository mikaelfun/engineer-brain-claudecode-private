# Monitor 容器监控与 Container Insights — 排查工作流

**来源草稿**: [ado-wiki-a-azure-container-apps.md], [ado-wiki-a-Enabling-SSH-access-to-an-App-Service-container-app.md], [ado-wiki-a-profiler-for-container-apps.md], [ado-wiki-b-prometheus-architecture.md], [ado-wiki-b-tsg-container-insights-general.md], [ado-wiki-b-tsg-container-insights-missing-logs.md], [ado-wiki-b-TSG-Requests-to-Increase-Managed-Prometheus-Limits.md], [ado-wiki-c-check-container-insights-logs.md], ... (16 total)
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Customer reports that all or partial Container Insights data is not visible in their Log Analytics w
> 来源: ado-wiki-b-tsg-container-insights-missing-logs.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Determine Authentication Method**
   [来源: ado-wiki-b-tsg-container-insights-missing-logs.md]

2. **Step 2: Review Configuration**
   [来源: ado-wiki-b-tsg-container-insights-missing-logs.md]

3. **Step 3: Determine Which Tables Are Missing**
   [来源: ado-wiki-b-tsg-container-insights-missing-logs.md]

4. **Step 4: Validate Pod Status**
   [来源: ado-wiki-b-tsg-container-insights-missing-logs.md]

5. **Step 5: Large Cluster Scenarios**
   [来源: ado-wiki-b-tsg-container-insights-missing-logs.md]

6. **Step 6: Check Log Files**
   [来源: ado-wiki-b-tsg-container-insights-missing-logs.md]

7. **Step 7: Check Network Connectivity**
   [来源: ado-wiki-b-tsg-container-insights-missing-logs.md]

8. **Step 8: Collect Logs**
   [来源: ado-wiki-b-tsg-container-insights-missing-logs.md]

   ```kql
   search "<ResourceID>"
   | summarize max(TimeGenerated) by $table
   ```
   [来源: ado-wiki-b-tsg-container-insights-missing-logs.md]

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 参见上述场景 | 按步骤排查 | → details/container-monitoring.md |
