# Monitor 日志查询告警规则 - Comprehensive Troubleshooting Guide

**Entries**: 13 | **Drafts fused**: 0 | **Kusto queries**: 1
**Draft sources**: 
**Kusto references**: scheduled-query-rules.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Log alert evaluation fails with 403 Forbidden: Given credentials do not have access to read logs (no NSP details)

**Solution**: Customer edits the alert rule (even a simple enable/disable) with user credentials that have read access to query the logs. See https://learn.microsoft.com/azure/azure-monitor/logs/manage-access

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Log alert evaluation fails with 403 Forbidden and NspValidationFailedError: Access denied due to failed Network Security Perimeter validation

**Solution**: Adjust NSP settings: either include the log search alert rule in the perimeter, or whitelist Alerts and Action Groups IP addresses in NSP inbound rules.

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: Log alert evaluation fails with 400 BadRequest: Failed to resolve scalar expression named <column>; or column not found in Measure/Dimensions

**Solution**: Ensure the column referenced in Measure/Dimensions is returned by the query, or change the measure/dimension to a field that the query actually returns.

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: Log alert evaluation fails with 404 NotFound: The workspace could not be found / The application could not be found

**Solution**: Delete the alert rule and create a new one with the updated scope pointing to the correct workspace/AI component.

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: Log alert with managed identity fails with 403 Forbidden or identity-related errors (unexpected response payload, resource does not have access, identity not found)

**Solution**: 1) Grant the managed identity read access on all queried workspaces/ADX clusters. 2) For inconsistency errors, disable/enable the rule. 3) If identity is missing, add a managed identity to the rule. See https://learn.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Log alert evaluation fails with 403 Forbidden: Given credentials do not have ... | For non-managed-identity rules, permissions are based on the last user who ed... | Customer edits the alert rule (even a simple enable/disable) with user creden... | 8.5 | ADO Wiki |
| 2 | Log alert evaluation fails with 403 Forbidden and NspValidationFailedError: A... | Log Analytics workspace is configured with NSP that requires resources to be ... | Adjust NSP settings: either include the log search alert rule in the perimete... | 8.5 | ADO Wiki |
| 3 | Log alert evaluation fails with 400 BadRequest: Failed to resolve scalar expr... | Column selected in Measure or Dimensions is not returned by the alert rule qu... | Ensure the column referenced in Measure/Dimensions is returned by the query, ... | 8.5 | ADO Wiki |
| 4 | Log alert evaluation fails with 404 NotFound: The workspace could not be foun... | The Log Analytics workspace or Application Insights component that holds the ... | Delete the alert rule and create a new one with the updated scope pointing to... | 8.5 | ADO Wiki |
| 5 | Log alert with managed identity fails with 403 Forbidden or identity-related ... | Managed identity associated with the alert rule lacks read access on all work... | 1) Grant the managed identity read access on all queried workspaces/ADX clust... | 8.5 | ADO Wiki |
| 6 | Log alert fired when it should not have (false alert) or missed firing (misse... | Ingestion delay of logs to Kusto causes alert query evaluation against partia... | Add ingestion_time() filter to reproduce evaluation-time data: append / where... | 8.5 | ADO Wiki |
| 7 | Log alert query using bin() function produces different time bucketing result... | LSA service automatically converts bin() to bin_at() at runtime using query e... | Replace bin(TimeGenerated, interval) with bin_at(TimeGenerated, interval, dat... | 8.5 | ADO Wiki |
| 8 | Log alert notification does not contain search results in payload | Starting with log alerts API version 2021-08-01, search results were removed ... | Use Logic Apps to add search results back to notification. See 'Customize ale... | 8.5 | ADO Wiki |
| 9 | MetricValue field shows as 'null' in resolved log alert notification | By design — stateful log alerts use time-based resolution logic rather than v... | This is expected behavior. Inform customer that stateful log alerts resolve b... | 8.5 | ADO Wiki |
| 10 | Log alert fired as expected when no results returned, but dimensions list is ... | By design — when a query returns 0 rows, the resource ID field (basis for pop... | This is expected behavior. When no rows are returned, dimension information c... | 8.5 | ADO Wiki |
| 11 | Log Search Alert (LSA) fires false alert when using adx("") or arg("") cross-... | The managed identity assigned to the log alert rule does not have the require... | Add the necessary RBAC permissions to the managed identity on the external da... | 8.5 | ADO Wiki |
| 12 | Log search alert didn't resolve when expected — alert remains in fired/active... | Resolution timing depends on evaluation frequency: 1-min frequency → 10 min; ... | Check alert rule frequency and corresponding resolution time in ASC. Verify '... | 8.5 | ADO Wiki |
| 13 | Log search alert resolved unexpectedly — alert resolved when customer expecte... | Alert condition was not met for the required resolution period based on the e... | Review state change history in Kusto. Check the evaluation frequency and corr... | 8.5 | ADO Wiki |
