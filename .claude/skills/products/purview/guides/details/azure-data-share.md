# Purview Azure Data Share (ADS) -- Comprehensive Troubleshooting Guide

**Entries**: 22 | **Drafts fused**: 4 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-ads-snapshot-issues.md](..\guides/drafts/ado-wiki-a-ads-snapshot-issues.md), [ado-wiki-a-data-share-kusto-debug.md](..\guides/drafts/ado-wiki-a-data-share-kusto-debug.md), [ado-wiki-a-sla-alert.md](..\guides/drafts/ado-wiki-a-sla-alert.md), [ado-wiki-ads-kusto-tables-reference.md](..\guides/drafts/ado-wiki-ads-kusto-tables-reference.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-ads-snapshot-issues.md

1. Azure Data Share (ADS) — Snapshot Issues `[source: ado-wiki-a-ads-snapshot-issues.md]`
2. Scenario 1: Snapshot Failed (with no clear error message) `[source: ado-wiki-a-ads-snapshot-issues.md]`
3. Refer to [Kusto query to find pipeline IDs and error messages of datasets](../ado-wiki-ads-snapshot-troubleshooting.md) to check the translated error and get more details on why the pipeline failed. `[source: ado-wiki-a-ads-snapshot-issues.md]`
4. If the Kusto results are still insufficient to mitigate, **raise an AVA and engage the SME**. `[source: ado-wiki-a-ads-snapshot-issues.md]`
5. Scenario 2: Snapshot Succeeded but Unexpected Results `[source: ado-wiki-a-ads-snapshot-issues.md]`
6. Refer to [Kusto query to find pipeline IDs and error messages of datasets](../ado-wiki-ads-snapshot-troubleshooting.md) to find the **pipeline run ID** for the affected dataset. `[source: ado-wiki-a-ads-snapshot-issues.md]`
7. Create a **collaboration ticket to ADF support** with the pipeline IDs to confirm and understand the behavior and root cause. `[source: ado-wiki-a-ads-snapshot-issues.md]`
8. If ADF support confirms the issue is NOT from ADF side, raise an AVA with the information provided. `[source: ado-wiki-a-ads-snapshot-issues.md]`
9. Data Share — Kusto Queries for Debugging and Error Logs `[source: ado-wiki-a-data-share-kusto-debug.md]`
10. Account ID Lookup `[source: ado-wiki-a-data-share-kusto-debug.md]`

### Phase 2: Data Collection (KQL)

```kusto
AccountInfoSnapshotEvent
| where AccountName == '{AccountName}'
| project AccountId
```
`[tool: ado-wiki-a-data-share-kusto-debug.md]`

```kusto
ShareLogEvent
| where env_time > datetime('{StartTime}') and env_time < datetime('{EndTime}')
| where AccountId in (
    (AccountInfoSnapshotEvent
    | where AccountName == '{AccountName}'
    | project AccountId)
)
```
`[tool: ado-wiki-a-data-share-kusto-debug.md]`

```kusto
ShareLogEvent
| where env_time > datetime('{StartTime}') and env_time < datetime('{EndTime}')
| where correlationId in ('{SingleCorrelationId}')
```
`[tool: ado-wiki-a-data-share-kusto-debug.md]`

```kusto
ShareLogEvent
| where env_time > datetime('{StartTime}') and env_time < datetime('{EndTime}')
| where correlationId in ('{CorrelationId}')
```
`[tool: ado-wiki-ads-kusto-tables-reference.md]`

```kusto
ShareLogEvent
| where env_time > datetime('{StartTime}') and env_time < datetime('{EndTime}')
| where AccountId in ((AccountInfoSnapshotEvent
  | where AccountName == '{AccountName}'
  | project AccountId))
```
`[tool: ado-wiki-ads-kusto-tables-reference.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Azure Data Share (ADS) metrics alert rule created but notification not fired whe... | Either the ADS metrics are not displayed correctly (platform... | Check if ADS metrics are displayed correctly in Metrics blade. If metrics displa... |
| Azure Data Share (ADS) snapshot or dataset operation fails with authentication/p... | ADS managed identity lacks required database roles. Provider... | Verify ADS MI roles via SQL query on sys.database_principals. Grant missing role... |
| Azure Data Share (ADS) operation fails with permission error on storage account ... | ADS MI missing RBAC roles. Provider MI needs Storage Blob Da... | Grant Storage Blob Data Reader for provider MI, Storage Blob Data Contributor fo... |
| Error adding DataSet in Azure Data Share when storage uses selected networks — F... | Storage firewall blocks client IP from enumerating container... | Add client IP to storage Firewall settings. Retry adding DataSet. |
| Cannot accept/reject Azure Data Share invitation — User Domain Verification Fail... | Email domain not registered as custom domain in Azure AD ten... | Add custom domain in Azure AD: Entra ID > Custom domain names > Add. After verif... |
| Azure Data Share no longer under active development — do not create ICM for feat... | Product decision: ADS team has limited bandwidth. | Do NOT create ICM for ADS feature requests. Ref: https://learn.microsoft.com/en-... |
| Azure Data Share snapshot fails: Blob is missing or cannot be located | Conditional access on storage RBAC blocking OAuth token from... | Fix conditional access expression or assign Storage Blob Data Reader without con... |
| ADS snapshot fails: permission missing even after assigning Owner role | Owner/Contributor roles do NOT grant blob data access. Need ... | Use Storage Blob Data Contributor (receive) or Reader (share) instead of Owner |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Data Share (ADS) metrics alert rule created but notification not fired when condition is met (... | Either the ADS metrics are not displayed correctly (platform issue), or the Azur... | Check if ADS metrics are displayed correctly in Metrics blade. If metrics display is wrong, raise an... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Share%2FAzure%20Data%20Share%20(ADS)%2FADS%20metrics%20alert%20not%20fired) |
| 2 | Azure Data Share (ADS) snapshot or dataset operation fails with authentication/permission error on S... | ADS managed identity lacks required database roles. Provider needs db_datareader... | Verify ADS MI roles via SQL query on sys.database_principals. Grant missing roles directly to ADS MI... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Share%2FAzure%20Data%20Share%20(ADS)%2Fauthentication%20failure) |
| 3 | Azure Data Share (ADS) operation fails with permission error on storage account or data lake | ADS MI missing RBAC roles. Provider MI needs Storage Blob Data Reader; consumer ... | Grant Storage Blob Data Reader for provider MI, Storage Blob Data Contributor for consumer MI on sto... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Share%2FAzure%20Data%20Share%20(ADS)%2Fauthentication%20failure) |
| 4 | Error adding DataSet in Azure Data Share when storage uses selected networks — Failed to retrieve co... | Storage firewall blocks client IP from enumerating containers. | Add client IP to storage Firewall settings. Retry adding DataSet. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Share%2FCannot%20add%20or%20edit%20asset%2FError%20adding%20DataSet%20when%20storage%20is%20in%20selected%20networks) |
| 5 | Cannot accept/reject Azure Data Share invitation — User Domain Verification Failed | Email domain not registered as custom domain in Azure AD tenant. | Add custom domain in Azure AD: Entra ID > Custom domain names > Add. After verification, retry invit... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Share%2FCannot%20find%20or%20view%20pending%20share%20invitation%2FCannot%20Accept%20or%20Reject%20Invitation) |
| 6 | Azure Data Share no longer under active development — do not create ICM for feature requests | Product decision: ADS team has limited bandwidth. | Do NOT create ICM for ADS feature requests. Ref: https://learn.microsoft.com/en-us/azure/data-share/... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Share%2FAzure%20Data%20Share%20(ADS)%2FNo%20ICM%20for%20feature%20request) |
| 7 | Azure Data Share snapshot fails: Blob is missing or cannot be located | Conditional access on storage RBAC blocking OAuth token from ADS MI | Fix conditional access expression or assign Storage Blob Data Reader without conditions | 🔵 7.0 | ado-wiki |
| 8 | ADS snapshot fails: permission missing even after assigning Owner role | Owner/Contributor roles do NOT grant blob data access. Need data-plane roles. | Use Storage Blob Data Contributor (receive) or Reader (share) instead of Owner | 🔵 7.0 | ado-wiki |
| 9 | ADS snapshot schedule not working after adding new dataset | By design: provider schedule change makes consumer trigger stale | Consumer must delete trigger and create new one. Map new dataset. | 🔵 7.0 | ado-wiki |
| 10 | ADS snapshots stopped after scheduled time change | By design: sync settings are immutable. Schedule change = DELETE old + PUT new. | Consumer must re-accept new synchronization setting after schedule change | 🔵 7.0 | ado-wiki |
| 11 | Unable to view SQL Azure tables in Azure Data Share | Ports 443 and 1443 blocked by firewall/network | Enable outbound HTTPS on ports 443 and 1443. Verify with telnet. | 🔵 7.0 | ado-wiki |
| 12 | Customer asks about adding firewall to Azure Data Share | ADS is PaaS, no firewall option available | ADS is PaaS and does not support firewall configuration. | 🔵 7.0 | ado-wiki |
| 13 | Error adding DataSet in ADS when storage uses selected networks - not authorized | Client IP not in storage firewall allow list. | Add client IP to storage Firewall settings. Retry. | 🔵 7.0 | ado-wiki |
| 14 | Cannot accept/reject ADS invitation - User Domain Verification Failed | Email domain not registered as custom domain in Azure AD. | Add custom domain in Entra ID. After verification, retry invitation. | 🔵 7.0 | ado-wiki |
| 15 | ADS no longer under active development - do not create ICM for feature requests | Product decision: ADS team limited bandwidth. | Do NOT create ICM for ADS feature requests. Ref supported stores doc. | 🔵 7.0 | ado-wiki |
| 16 | ADS snapshot fails: Blob is missing - conditional access blocking OAuth | Conditional access expression on RBAC role blocks ADS MI OAuth tokens. | Fix conditional access or assign Storage Blob Data Reader without conditions. | 🔵 7.0 | ado-wiki |
| 17 | ADS snapshot schedule not working after adding new dataset | By design: provider schedule change makes consumer trigger stale. | Consumer must delete trigger and create new one. Map new dataset. | 🔵 7.0 | ado-wiki |
| 18 | ADS snapshots stopped after scheduled time change | Sync settings immutable. Schedule change = DELETE old + PUT new. | Consumer must re-accept new synchronization setting. | 🔵 7.0 | ado-wiki |
| 19 | Unable to view SQL Azure tables in ADS - ports 443/1443 blocked | Network firewall blocking outbound HTTPS on required ports. | Enable outbound HTTPS on ports 443 and 1443. | 🔵 7.0 | ado-wiki |
| 20 | ADS is PaaS - no firewall configuration option | ADS is PaaS service. | Inform customer: ADS is PaaS, no firewall option. | 🔵 7.0 | ado-wiki |
| 21 | Cannot view share invitation in Microsoft Purview as a guest user of the tenant | Guest users must verify their email address for the tenant before they can view ... | As a guest user, verify your email address for the tenant to view share invitations. Once verified, ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20%28TSGs%29%2FData%20Share%2FPurview%20Share%2FIssue%20with%20seeing%20share%20invitations%20in%20guest%20tenant) |
| 22 | User cannot view Purview Data Share invitation despite receiving email notification | Email invitation sent to alias instead of Azure login email; share already accep... | Ensure data provider sends invitation to Azure login email (not alias); check Received Shares tab if... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20%28TSGs%29%2FData%20Share%2FPurview%20Share%2FIssues%20with%20share%20invitation%2FCannot%20view%20share%20invite) |