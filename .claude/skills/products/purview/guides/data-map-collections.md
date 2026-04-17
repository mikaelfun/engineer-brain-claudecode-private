# Purview 集合管理与元数据策略 -- Quick Reference

**Entries**: 4 | **21V**: all-applicable | **Confidence**: low
**Last updated**: 2026-04-07

## Symptom Lookup
| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Customer wants separate Purview accounts for dev and prod environments but single-account-per-tenant... | With new setup, only one Purview account per tenant is allowed. Multiple account... | Options: 1) Create separate tenants for dev and prod, each with their own Purview account. 2) Use Co... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FAdministration%20(Provisioning%20%26%20RBAC)%2FNew%20Purview%20Unified%20Portal%20scenarios%2FFAQs%20for%20account%20upgrade%2C%20free-tier%20and%20enterprise-tier) |
| 2 📋 | Error Code 15602 "Stale Policy Update. New version already exists, please refresh" when using PUT AP... | The policy version in the request body is outdated. Policy version increments wi... | Before each PUT call to update metadata policy, first GET the latest policy to obtain the current ve... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FSDK%20and%20API%2FADD%20USERS%20TO%20COLLECTIONS) |
| 3 📋 | HTTP 404 "Collection {name} not found" (Error Code 6000) when calling Purview Metadata Policy API fo... | For sub-collections (not root collection), the API requires the collection ID (f... | Use the collection ID from the URL (e.g., the 6-char random string) instead of the collection displa... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FSDK%20and%20API%2FADD%20USERS%20TO%20COLLECTIONS) |
| 4 📋 | Collection cannot be deleted with error: 'is being referenced by other resources and can't be delete... | Collection has references from other resource types (not just scanned assets). D... | Follow the dedicated TSG for 'Asset being referenced by other resources' error 409. See ADO Wiki: /[... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912940) |

## Quick Troubleshooting Path

1. Options: 1) Create separate tenants for dev and prod, each with their own Purview account. 2) Use Collections within single account to logically separ... `[source: ado-wiki]`
2. Before each PUT call to update metadata policy, first GET the latest policy to obtain the current version number. Use the latest version in the PUT re... `[source: ado-wiki]`
3. Use the collection ID from the URL (e.g., the 6-char random string) instead of the collection display name in the API call: GET {Endpoint}/policyStore... `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Full troubleshooting workflow](details/data-map-collections.md#troubleshooting-workflow)