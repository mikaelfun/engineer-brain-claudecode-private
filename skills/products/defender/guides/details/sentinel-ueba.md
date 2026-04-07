# DEFENDER Sentinel UEBA 用户行为分析 — Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 5 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-enable-ueba-programmatically.md, ado-wiki-a-ueba-anomalies-integration-portal.md, ado-wiki-a-ueba-anomalies-verification.md, ado-wiki-b-ueba-enablement-in-connectors-tsg.md, ado-wiki-b-ueba-for-sentinel-product-knowledge.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Ueba
> Sources: ado-wiki, mslearn

**1. UEBA-related tables (IdentityInfo, BehavioralAnalytics) do not exist in the Log Analytics workspace after enabling UEBA in Microsoft Sentinel**

- **Root Cause**: The BehaviorAnalyticsInsights solution was not properly provisioned in the workspace, or table creation failed during initial UEBA enablement
- **Solution**: 1. Verify UEBA status at https://aimc.aisvc.visualstudio.com/Manage/Customers using Workspace ID, check for BehaviorAnalyticsInsights solution. 2. Have customer disable and re-enable UEBA via Sentinel portal. 3. If still missing, use REST API: DELETE https://management.azure.com/subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.OperationsManagement/solutions/BehaviorAnalyticsInsights({workspaceName})?api-version=2015-11-01-preview, then PUT to recreate. Customer can also use https://docs.microsoft.com/en-us/rest/api/loganalytics/tables/create-or-update to create tables directly.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. OnpremisesExtensionAttribute property missing or not available in UEBA BehaviorAnalytics table in Microsoft Sentinel**

- **Root Cause**: The OnpremisesExtensionAttribute property is no longer supported by the UEBA feature
- **Solution**: Inform customer that OnpremisesExtensionAttribute is deprecated and no longer supported. Reference IcM 552681044.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. UEBA behaviors not generated after enabling behaviors layer**

- **Root Cause**: Data sources not on Analytics tier, toggle not enabled, or insufficient wait time (15-30 min)
- **Solution**: Ensure Analytics tier ingestion; confirm toggle on; wait 15-30 min; only one workspace per tenant
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**4. Behavior entity roles (Actor/Target/Other) or MITRE ATT&CK mapping in BehaviorEntities table are incorrect or key entities are missing entirely**

- **Root Cause**: Poor log quality, incorrect column mapping in source logs, or errors in AI-generated behavior rule logic causing wrong entity extraction
- **Solution**: 1. Query BehaviorInfo+BehaviorEntities joined on BehaviorId to review details. 2. Extract EventIDs from AdditionalFields and compare with raw source logs. 3. Validate source logs have correct schema and field mappings. 4. If raw logs are correct but mapping is wrong, document BehaviorId, timestamp, expected vs actual, and escalate to PG.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**5. Behavior volume is too high in BehaviorInfo table, causing noise and too many behavior records generated for benign activity**

- **Root Cause**: Aggregation or sequencing rules generating excessive behaviors for benign activity patterns; actual volume depends on customer raw log volume from supported sources
- **Solution**: 1. Use KQL filtering on Categories, MitreTechniques, Title, or SourceTable to focus on relevant behaviors. 2. Build custom queries to filter out known benign patterns. 3. If overall ROI is too low, customer can disable specific data sources or Behaviors entirely. Provide feedback on noisy behavior types.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**6. UEBA shows fewer behaviors than expected**

- **Root Cause**: Partial coverage of behavior types; few instances of specific behavior type prevent detection
- **Solution**: Review supported sources; check raw logs; combine with anomaly data; provide feedback to Microsoft
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | UEBA-related tables (IdentityInfo, BehavioralAnalytics) do not exist in the Log Analytics workspa... | The BehaviorAnalyticsInsights solution was not properly provisioned in the workspace, or table cr... | 1. Verify UEBA status at https://aimc.aisvc.visualstudio.com/Manage/Customers using Workspace ID,... | 🟢 8.5 | ADO Wiki |
| 2 | OnpremisesExtensionAttribute property missing or not available in UEBA BehaviorAnalytics table in... | The OnpremisesExtensionAttribute property is no longer supported by the UEBA feature | Inform customer that OnpremisesExtensionAttribute is deprecated and no longer supported. Referenc... | 🟢 8.5 | ADO Wiki |
| 3 ⚠️ | UEBA behaviors not generated after enabling behaviors layer | Data sources not on Analytics tier, toggle not enabled, or insufficient wait time (15-30 min) | Ensure Analytics tier ingestion; confirm toggle on; wait 15-30 min; only one workspace per tenant | 🔵 6.0 | MS Learn |
| 4 | Behavior entity roles (Actor/Target/Other) or MITRE ATT&CK mapping in BehaviorEntities table are ... | Poor log quality, incorrect column mapping in source logs, or errors in AI-generated behavior rul... | 1. Query BehaviorInfo+BehaviorEntities joined on BehaviorId to review details. 2. Extract EventID... | 🔵 5.5 | ADO Wiki |
| 5 | Behavior volume is too high in BehaviorInfo table, causing noise and too many behavior records ge... | Aggregation or sequencing rules generating excessive behaviors for benign activity patterns; actu... | 1. Use KQL filtering on Categories, MitreTechniques, Title, or SourceTable to focus on relevant b... | 🔵 5.5 | ADO Wiki |
| 6 ⚠️ | UEBA shows fewer behaviors than expected | Partial coverage of behavior types; few instances of specific behavior type prevent detection | Review supported sources; check raw logs; combine with anomaly data; provide feedback to Microsoft | 🔵 5.0 | MS Learn |
