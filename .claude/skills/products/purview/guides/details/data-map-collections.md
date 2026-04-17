# Purview 集合管理与元数据策略 -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Drafts fused**: 4 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-policy-store-collection-webhook-failures.md](..\guides/drafts/ado-wiki-policy-store-collection-webhook-failures.md), [ado-wiki-process-dump-collection.md](..\guides/drafts/ado-wiki-process-dump-collection.md), [ado-wiki-request-increase-collections.md](..\guides/drafts/ado-wiki-request-increase-collections.md), [ado-wiki-scoping-initial-data-collection.md](..\guides/drafts/ado-wiki-scoping-initial-data-collection.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-policy-store-collection-webhook-failures.md

1. Policy Store Collection Webhook Requests are failing `[source: ado-wiki-policy-store-collection-webhook-failures.md]`
2. Triaging Steps `[source: ado-wiki-policy-store-collection-webhook-failures.md]`
3. 1. Check Geneva Metrics Dashboard `[source: ado-wiki-policy-store-collection-webhook-failures.md]`
4. 2. Exception Type Breakdown `[source: ado-wiki-policy-store-collection-webhook-failures.md]`
5. 3. Drill Down with Kusto/Jarvis Logs `[source: ado-wiki-policy-store-collection-webhook-failures.md]`
6. Check **Known Issue and Mitigation** to see if this is a known issue `[source: ado-wiki-policy-store-collection-webhook-failures.md]`
7. If symptoms match and mitigation exists, follow mitigation steps `[source: ado-wiki-policy-store-collection-webhook-failures.md]`
8. If no symptom match, contact the corresponding **Component SMEs** `[source: ado-wiki-policy-store-collection-webhook-failures.md]`
9. Process Dump Collection (DebugDiag) `[source: ado-wiki-process-dump-collection.md]`
10. Download & install DebugDiag (https://www.microsoft.com/en-us/download/details.aspx?id=58210) `[source: ado-wiki-process-dump-collection.md]`

### Phase 2: Data Collection (KQL)

```kusto
PolicyStoreLogEvent
| where ExceptionType == "<YourExceptionType>"
| where ['time'] > ago (1d)
| project CorrelationIdError = CorrelationId
| join (PolicyStoreLogEvent | where ['time'] > ago(1d) | where ExceptionMessage != "null")
  on $left.CorrelationIdError == $right.CorrelationId
| project CorrelationId, ExceptionMessage, Message, AccountId
```
`[tool: ado-wiki-policy-store-collection-webhook-failures.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Customer wants separate Purview accounts for dev and prod environments but singl... | With new setup, only one Purview account per tenant is allow... | Options: 1) Create separate tenants for dev and prod, each with their own Purvie... |
| Error Code 15602 "Stale Policy Update. New version already exists, please refres... | The policy version in the request body is outdated. Policy v... | Before each PUT call to update metadata policy, first GET the latest policy to o... |
| HTTP 404 "Collection {name} not found" (Error Code 6000) when calling Purview Me... | For sub-collections (not root collection), the API requires ... | Use the collection ID from the URL (e.g., the 6-char random string) instead of t... |
| Collection cannot be deleted with error: 'is being referenced by other resources... | Collection has references from other resource types (not jus... | Follow the dedicated TSG for 'Asset being referenced by other resources' error 4... |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer wants separate Purview accounts for dev and prod environments but single-account-per-tenant... | With new setup, only one Purview account per tenant is allowed. Multiple account... | Options: 1) Create separate tenants for dev and prod, each with their own Purview account. 2) Use Co... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FAdministration%20(Provisioning%20%26%20RBAC)%2FNew%20Purview%20Unified%20Portal%20scenarios%2FFAQs%20for%20account%20upgrade%2C%20free-tier%20and%20enterprise-tier) |
| 2 | Error Code 15602 "Stale Policy Update. New version already exists, please refresh" when using PUT AP... | The policy version in the request body is outdated. Policy version increments wi... | Before each PUT call to update metadata policy, first GET the latest policy to obtain the current ve... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FSDK%20and%20API%2FADD%20USERS%20TO%20COLLECTIONS) |
| 3 | HTTP 404 "Collection {name} not found" (Error Code 6000) when calling Purview Metadata Policy API fo... | For sub-collections (not root collection), the API requires the collection ID (f... | Use the collection ID from the URL (e.g., the 6-char random string) instead of the collection displa... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FSDK%20and%20API%2FADD%20USERS%20TO%20COLLECTIONS) |
| 4 | Collection cannot be deleted with error: 'is being referenced by other resources and can't be delete... | Collection has references from other resource types (not just scanned assets). D... | Follow the dedicated TSG for 'Asset being referenced by other resources' error 409. See ADO Wiki: /[... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912940) |