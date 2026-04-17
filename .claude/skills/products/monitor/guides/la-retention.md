# Monitor la-retention

**Entries**: 6 | **21V**: ALL | **Sources**: 1
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Log search alert remains in fired state and does not resolve automatically wh... | Alert rule not configured as stateful (Automatically resolve alerts not enabl... | Verify alert is configured as Stateful with "Automatically resolve alerts" en... | 8.5 | ADO Wiki |
| 2 | Metrics blade chart only displays last 30 days of data even though customMetr... | Platform/custom metrics have specific pre-aggregated retention period differi... | Expected behavior per Azure Monitor metrics retention. For older data, use lo... | 8.5 | ADO Wiki |
| 3 | Diagnostic Settings retention settings for Azure Storage are deprecated but d... | The DS retention feature is deprecated. Retention records are written at data... | 1) Do not use DS retention settings - disable if currently enabled 2) Use Azu... | 8.5 | ADO Wiki |
| 4 | After increasing Diagnostic Settings retention period (e.g., 10 days to 30 da... | Retention records are written at data export time and define deletion schedul... | 1) Advise customer this is by-design behavior 2) Recommend migrating to Azure... | 8.5 | ADO Wiki |
| 5 | Customer receives notification about diagnostic settings retention policy dep... | Microsoft deprecated the retention feature built into diagnostic settings. Th... | Customer must migrate to Azure Storage lifecycle management (https://learn.mi... | 8.5 | ADO Wiki |
| 6 | Customer received retention deprecation notification but does not know which ... | Retention was configured on diagnostic settings that export to Storage Accoun... | Query RegistrationTelemetry in azureinsights Kusto cluster: filter by subscri... | 8.5 | ADO Wiki |
