# Storage Cross-Region Migration Decision Guide: ADF/AzCopy vs PG Live Migration

**Source**: OneNote — CN1/CE1 Migration 防坑指南 - PG Storage Migration Guideline (Graham Tiplady)
**Status**: draft

## PG Recommendation
**Customer should use ADF-based copy/migration** rather than live cross-region migration in Mooncake.

## Decision Matrix

| Criteria | ADF/AzCopy | Live Migration (MSFT-managed) |
|---|---|---|
| What moves | Data only (new account) | Entire storage account + identity |
| Account name | Changes | Preserved |
| Endpoints & keys | New | Preserved |
| App changes | Yes (connection strings) | Minimal |
| Mooncake support | Fully supported | Limited, case-by-case |
| Cross-sub/tenant | Supported | Generally restricted |
| Customer timing control | Full control | Platform-managed |
| Incremental sync | Yes (ADF) | No |
| Risk profile | Low, predictable | Higher variability |

## When to Use ADF/AzCopy
- Mooncake lowest-risk path
- Cross-subscription/tenant
- Incremental sync needed
- App teams can tolerate endpoint changes

## When to Use Live Migration
- Account identity preservation critical
- Apps cannot be reconfigured
- Account passes preflight validation
- Account is LRS (or migrating to current GRS target region)
- **Sustained ingress < 1 Gbps**

## Live Migration Risks
- **Eligibility**: strict constraints (LRS only, no object replication, < 1 Gbps sustained ingress)
- **No incremental resume**: CRC error → full restart
- **Queue-based**: no customer control over timing
- **Scenario: High ingress workload** → migration stalls, cannot checkpoint, must restart from beginning
