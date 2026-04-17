# Monitor Application Insights 可用性测试 — 排查工作流

**来源草稿**: [ado-wiki-a-ASC-Features-for-Availability-Tests.md], [ado-wiki-a-Availability-Test-Architecture.md], [ado-wiki-a-Availability-Test-creation-process.md], [ado-wiki-a-Availability-Test-Location-Recommendation.md], [ado-wiki-a-validate-availability-test-alerts.md], [ado-wiki-b-find-metricalert-associated-with-availability-test.md], [ado-wiki-d-custom-availability-tests-azure-functions.md], [ado-wiki-e-use-component-web-tests-tab.md], ... (9 total)
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Availability Test exists and expectations are an alert associated with it should have occurred and d
> 来源: ado-wiki-a-validate-availability-test-alerts.md | 适用: Mooncake ✅

   ```kql
   let start = datetime(2023-03-14 7:00:00 PM);
      let end = datetime(2023-03-15 03:00:00 AM);
      AppAvailabilityResults
      | where TimeGenerated > start and TimeGenerated < end
      | where Name == "<name of availability test here>"
      | extend TimeEventOccurred = TimeGenerated
      | extend TimeRequiredt
   ```
   [来源: ado-wiki-a-validate-availability-test-alerts.md]

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 参见上述场景 | 按步骤排查 | → details/ai-availability-tests.md |
