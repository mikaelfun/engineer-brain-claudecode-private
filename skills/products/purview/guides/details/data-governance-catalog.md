# Purview 数据治理与统一目录 -- Comprehensive Troubleshooting Guide

**Entries**: 11 | **Drafts fused**: 15 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-2025-jan-fr-known-issues.md](..\guides/drafts/ado-wiki-2025-jan-fr-known-issues.md), [ado-wiki-a-connectors-roadmap.md](..\guides/drafts/ado-wiki-a-connectors-roadmap.md), [ado-wiki-a-cri-backlog-review.md](..\guides/drafts/ado-wiki-a-cri-backlog-review.md), [ado-wiki-a-critical-functionality-loss.md](..\guides/drafts/ado-wiki-a-critical-functionality-loss.md), [ado-wiki-a-critical-risk-alert.md](..\guides/drafts/ado-wiki-a-critical-risk-alert.md), [ado-wiki-a-deh-roadmap.md](..\guides/drafts/ado-wiki-a-deh-roadmap.md), [ado-wiki-a-eudb.md](..\guides/drafts/ado-wiki-a-eudb.md), [ado-wiki-a-governance-skill-reference-guide.md](..\guides/drafts/ado-wiki-a-governance-skill-reference-guide.md), [ado-wiki-a-retagging-support-cases.md](..\guides/drafts/ado-wiki-a-retagging-support-cases.md), [ado-wiki-a-unified-catalog-roadmap.md](..\guides/drafts/ado-wiki-a-unified-catalog-roadmap.md), [ado-wiki-arm-logs-migrating-to-new-clusters.md](..\guides/drafts/ado-wiki-arm-logs-migrating-to-new-clusters.md), [ado-wiki-deleted-asset-not-going-away.md](..\guides/drafts/ado-wiki-deleted-asset-not-going-away.md), [ado-wiki-l1-l2-l3-scan-troubleshooting.md](..\guides/drafts/ado-wiki-l1-l2-l3-scan-troubleshooting.md), [ado-wiki-macula-purview-automate-glossary-migration.md](..\guides/drafts/ado-wiki-macula-purview-automate-glossary-migration.md), [ado-wiki-support-l1-l2-l3-scan.md](..\guides/drafts/ado-wiki-support-l1-l2-l3-scan.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-2025-jan-fr-known-issues.md

1. 2025 January Feature Request Known Issues `[source: ado-wiki-2025-jan-fr-known-issues.md]`
2. Scan Limitations `[source: ado-wiki-2025-jan-fr-known-issues.md]`
3. Lineage Limitations `[source: ado-wiki-2025-jan-fr-known-issues.md]`
4. Catalog/Data Governance `[source: ado-wiki-2025-jan-fr-known-issues.md]`
5. Administration & UX `[source: ado-wiki-2025-jan-fr-known-issues.md]`
6. Connectors - Internal Roadmap `[source: ado-wiki-a-connectors-roadmap.md]`
7. Feature Roadmap `[source: ado-wiki-a-connectors-roadmap.md]`
8. CRI Backlog Review Process `[source: ado-wiki-a-cri-backlog-review.md]`
9. Internal Supportability Processes `[source: ado-wiki-a-cri-backlog-review.md]`
10. Every Monday, the Supportability team: `[source: ado-wiki-a-cri-backlog-review.md]`

### Phase 2: Data Collection (KQL)

```kusto
let regOp = @'(.*)"URI":(.*)"Store"(.*)';
DataScanAgentLinuxEvent
| where ScanResultId == "<scan_run_id>"
| where Message has "OpInfo" or Message has "DataFlowGraph" or Message has "EntityInfo"
| project extract(regOp, 2, Message)
```
`[tool: ado-wiki-deleted-asset-not-going-away.md]`

```kusto
DataScanAgentLinuxEvent
| where ScanResultId == "<scan_run_id>"
| where Message contains "ConvertedEntities"
| where Message contains "<parent_folder>"
| order by env_time asc
| project env_time, Message
```
`[tool: ado-wiki-deleted-asset-not-going-away.md]`

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "<scanRunId>" and Message contains "EC ScanSvcEnableScanScope is"
| project Message
```
`[tool: ado-wiki-l1-l2-l3-scan-troubleshooting.md]`

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "<scanRunId>" and Message contains "The value of ScanScopeType is changed to"
| project Message
```
`[tool: ado-wiki-l1-l2-l3-scan-troubleshooting.md]`

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "<scanRunId>" and Message contains "executionRegion"
```
`[tool: ado-wiki-l1-l2-l3-scan-troubleshooting.md]`

```kusto
cluster('purviewadx{region}.{region}.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == "<scanRunId>" and Message contains "ScanModelSettings scanScopeType specified by customer"
| project Message
```
`[tool: ado-wiki-l1-l2-l3-scan-troubleshooting.md]`

```kusto
cluster('purviewadx{region}.{region}.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == "<scanRunId>" and Message contains "SCAN_SCOPE_TYPE:"
| project Message
```
`[tool: ado-wiki-l1-l2-l3-scan-troubleshooting.md]`

```kusto
cluster('purviewadx{region}.{region}.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == "<scanRunId>" and Message contains "while ignore sample data in L2 scan"
| project Message
```
`[tool: ado-wiki-l1-l2-l3-scan-troubleshooting.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Delete option greyed out for governance domain in Microsoft Purview Data Governa... | Governance domain must be unpublished and all business conce... | 1) Unpublish governance domain. 2) Delete data quality data from assets. 3) Remo... |
| Importing/exporting service principal as people contact in glossary terms is uns... | Service principal is not a formally supported people contact... | Do not use service principal as people contact. If customer needs this, consult ... |
| Glossary CSV import fails: Some values of Term template names are not in [] or [... | Term Template in CSV does not exist in Purview; attribute na... | Create Term Template manually in Purview portal matching CSV; column format: [At... |
| Glossary term CSV import fails with duplicate term names warning | Duplicate Name entries in CSV or term names contain unsuppor... | Remove duplicate Name entries; use only letters/numbers/spaces/underscores/non-A... |
| HTTP 412 Pre-condition check failed when editing glossary term or entity in Purv... | Concurrent update on same entity; first request succeeds, su... | Click Cancel to exit edit, then Edit again to reload latest entity info and retr... |
| Glossary terms are deleted directly without workflow approval when multi-selecti... | Product limitation — bulk operations on glossary terms do no... | Use Python SDK or JavaScript SDK with api_version="2024-01-11-preview" to submit... |
| Customer needs to migrate glossaries, glossary terms, or metadata from classic A... | The new Data Governance experience underwent a complete over... | Recommend the official third-party tool Macula Purview Automate (https://www.mac... |
| Recently created data products not found in Unified Catalog (Data Governance) di... | Week of 11/11/2024: DG solution switched from tracking tenan... | Temporary issue during DG migration (ETA completed 12/6/2024). If customer encou... |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Delete option greyed out for governance domain in Microsoft Purview Data Governance | Governance domain must be unpublished and all business concepts (data products, ... | 1) Unpublish governance domain. 2) Delete data quality data from assets. 3) Remove assets from data ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FEEEs+Section%2FCoPilot+Troubleshooting+Guides+(AI+generated+TSGs)+-+Need+further+review%2FDelete+a+Governance+Domain) |
| 2 | Importing/exporting service principal as people contact in glossary terms is unsupported; only manua... | Service principal is not a formally supported people contact type in Microsoft P... | Do not use service principal as people contact. If customer needs this, consult on their scenario an... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Glossary/Known%20Issues/Service%20Principal%20as%20People%20Contact%20unsupported) |
| 3 | Glossary CSV import fails: Some values of Term template names are not in [] or [Attribute][TermTempl... | Term Template in CSV does not exist in Purview; attribute names or field types m... | Create Term Template manually in Purview portal matching CSV; column format: [Attribute][TermTemplat... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FGlossary%2FCannot%20import%20or%20export%20glossary%20term%20using%20template%2FImport%20terms%20failing%20%7C%20Expected%20column%20is%20missing%20from%20the%20template) |
| 4 | Glossary term CSV import fails with duplicate term names warning | Duplicate Name entries in CSV or term names contain unsupported special characte... | Remove duplicate Name entries; use only letters/numbers/spaces/underscores/non-ASCII Unicode in term... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FGlossary%2FCannot%20import%20or%20export%20glossary%20term%20using%20template%2FImport%20terms%20using%20template%20%7C%20Duplicate%20or%20Transient%20Issue) |
| 5 | HTTP 412 Pre-condition check failed when editing glossary term or entity in Purview portal | Concurrent update on same entity; first request succeeds, subsequent fail with 4... | Click Cancel to exit edit, then Edit again to reload latest entity info and retry | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FGlossary%2FCreating%2C%20editing%20or%20deleting%20glossary%20terms%2FCreate%2C%20Update%2C%20Delete%20Errors) |
| 6 | Glossary terms are deleted directly without workflow approval when multi-selection (bulk delete) is ... | Product limitation — bulk operations on glossary terms do not trigger workflow a... | Use Python SDK or JavaScript SDK with api_version="2024-01-11-preview" to submit user requests with ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Known%20Issues/Glossary%20Terms%20Deleted%20without%20approval%20from%20workflow%20when%20multi-selection%20is%20applied) |
| 7 | Customer needs to migrate glossaries, glossary terms, or metadata from classic Azure Purview Data Ca... | The new Data Governance experience underwent a complete overhaul of glossary ter... | Recommend the official third-party tool Macula Purview Automate (https://www.maculasys.com/microsoft... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FApps%20-%20Data%20Governance%2FMigration%20to%20the%20new%20experience) |
| 8 | Recently created data products not found in Unified Catalog (Data Governance) discovery experience a... | Week of 11/11/2024: DG solution switched from tracking tenant ID to account ID f... | Temporary issue during DG migration (ETA completed 12/6/2024). If customer encounters this after mig... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FAdministration%20(Provisioning%20%26%20RBAC)%2FUser%20request%20for%20changing%20Purview%20account%20region) |
| 9 | Glossary terms not showing up in Discovery experience after enabling new Data Governance experience | In the new experience, governance domains (previously called business domains) a... | Create governance domains → add business concepts and glossary terms under those domains → publish t... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Apps%20-%20Data%20Governance/Troubleshooting%20Guides/Governance%20Domains) |
| 10 | Users assigned Governance Domain Reader role lose access after April 2025 role change. Role no longe... | Governance Domain Reader role deprecated and removed due to limited usage and cu... | Assign affected users Local Catalog Reader (domain-level) or Global Catalog Reader (cross-domain) as... | 🔵 7.0 | ado-wiki |
| 11 | Business Custom Attribute with Date datatype shows Invalid Date on Custom Attributes page after savi... | - | Engineering identified issue; code fix in deployment pipeline expected EOW. Attach case to ICM 21000... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Known%20Issues) |