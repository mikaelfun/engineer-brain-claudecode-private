# DEFENDER Sentinel UEBA 用户行为分析 — Troubleshooting Quick Reference

**Entries**: 6 | **21V**: 4/6 applicable
**Sources**: ado-wiki, mslearn | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/sentinel-ueba.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | UEBA-related tables (IdentityInfo, BehavioralAnalytics) do not exist in the Log Analytics workspa... | The BehaviorAnalyticsInsights solution was not properly provisioned in the workspace, or table cr... | 1. Verify UEBA status at https://aimc.aisvc.visualstudio.com/Manage/Customers using Workspace ID,... | 🟢 8.5 | ADO Wiki |
| 2 | OnpremisesExtensionAttribute property missing or not available in UEBA BehaviorAnalytics table in... | The OnpremisesExtensionAttribute property is no longer supported by the UEBA feature | Inform customer that OnpremisesExtensionAttribute is deprecated and no longer supported. Referenc... | 🟢 8.5 | ADO Wiki |
| 3 | UEBA behaviors not generated after enabling behaviors layer | Data sources not on Analytics tier, toggle not enabled, or insufficient wait time (15-30 min) | Ensure Analytics tier ingestion; confirm toggle on; wait 15-30 min; only one workspace per tenant | 🔵 6.0 | MS Learn |
| 4 | Behavior entity roles (Actor/Target/Other) or MITRE ATT&CK mapping in BehaviorEntities table are ... | Poor log quality, incorrect column mapping in source logs, or errors in AI-generated behavior rul... | 1. Query BehaviorInfo+BehaviorEntities joined on BehaviorId to review details. 2. Extract EventID... | 🔵 5.5 | ADO Wiki |
| 5 | Behavior volume is too high in BehaviorInfo table, causing noise and too many behavior records ge... | Aggregation or sequencing rules generating excessive behaviors for benign activity patterns; actu... | 1. Use KQL filtering on Categories, MitreTechniques, Title, or SourceTable to focus on relevant b... | 🔵 5.5 | ADO Wiki |
| 6 | UEBA shows fewer behaviors than expected | Partial coverage of behavior types; few instances of specific behavior type prevent detection | Review supported sources; check raw logs; combine with anomaly data; provide feedback to Microsoft | 🔵 5.0 | MS Learn |

## Quick Troubleshooting Path

1. 1. Verify UEBA status at https://aimc.aisvc.visualstudio.com/Manage/Customers using Workspace ID, check for BehaviorAnalyticsInsights solution. 2. Have customer disable and re-enable UEBA via Senti... `[Source: ADO Wiki]`
2. Inform customer that OnpremisesExtensionAttribute is deprecated and no longer supported. Reference IcM 552681044. `[Source: ADO Wiki]`
3. Ensure Analytics tier ingestion; confirm toggle on; wait 15-30 min; only one workspace per tenant `[Source: MS Learn]`
4. 1. Query BehaviorInfo+BehaviorEntities joined on BehaviorId to review details. 2. Extract EventIDs from AdditionalFields and compare with raw source logs. 3. Validate source logs have correct schem... `[Source: ADO Wiki]`
5. 1. Use KQL filtering on Categories, MitreTechniques, Title, or SourceTable to focus on relevant behaviors. 2. Build custom queries to filter out known benign patterns. 3. If overall ROI is too low,... `[Source: ADO Wiki]`
