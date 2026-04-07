# Purview 工程师内部工具 (DTM/rCRI/ICM) -- Comprehensive Troubleshooting Guide

**Entries**: 10 | **Drafts fused**: 26 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-case-management-acronyms.md](..\guides/drafts/ado-wiki-a-case-management-acronyms.md), [ado-wiki-a-case-management-basics.md](..\guides/drafts/ado-wiki-a-case-management-basics.md), [ado-wiki-a-citizen-alliance-support-program.md](..\guides/drafts/ado-wiki-a-citizen-alliance-support-program.md), [ado-wiki-a-cri-creation-through-asc.md](..\guides/drafts/ado-wiki-a-cri-creation-through-asc.md), [ado-wiki-a-cri-escalation-framework.md](..\guides/drafts/ado-wiki-a-cri-escalation-framework.md), [ado-wiki-a-dfm-introduction.md](..\guides/drafts/ado-wiki-a-dfm-introduction.md), [ado-wiki-a-guidance-for-internal-non-css.md](..\guides/drafts/ado-wiki-a-guidance-for-internal-non-css.md), [ado-wiki-a-handling-feature-requests.md](..\guides/drafts/ado-wiki-a-handling-feature-requests.md), [ado-wiki-a-icm-process.md](..\guides/drafts/ado-wiki-a-icm-process.md), [ado-wiki-a-icm-terminology.md](..\guides/drafts/ado-wiki-a-icm-terminology.md), [ado-wiki-a-icm-waiting-customer-or-css.md](..\guides/drafts/ado-wiki-a-icm-waiting-customer-or-css.md), [ado-wiki-a-logs-required-for-escalation-3p-data-source-scan.md](..\guides/drafts/ado-wiki-a-logs-required-for-escalation-3p-data-source-scan.md), [ado-wiki-a-mapping-purview-components-icm.md](..\guides/drafts/ado-wiki-a-mapping-purview-components-icm.md), [ado-wiki-a-rca-escalation-process.md](..\guides/drafts/ado-wiki-a-rca-escalation-process.md), [ado-wiki-a-supportability-restricted-cris.md](..\guides/drafts/ado-wiki-a-supportability-restricted-cris.md), [ado-wiki-a-teams-sharing-dos-and-donts.md](..\guides/drafts/ado-wiki-a-teams-sharing-dos-and-donts.md), [ado-wiki-ava-process-escalation-data-collection.md](..\guides/drafts/ado-wiki-ava-process-escalation-data-collection.md), [ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md](..\guides/drafts/ado-wiki-b-ICM-Quality-Step-by-Step-Flow.md), [ado-wiki-b-azure-support-center-asc.md](..\guides/drafts/ado-wiki-b-azure-support-center-asc.md), [ado-wiki-b-duplicate-case-best-practices.md](..\guides/drafts/ado-wiki-b-duplicate-case-best-practices.md), [ado-wiki-collaboration-support-boundary.md](..\guides/drafts/ado-wiki-collaboration-support-boundary.md), [ado-wiki-get-adf-datascan-activityids.md](..\guides/drafts/ado-wiki-get-adf-datascan-activityids.md), [ado-wiki-internal-system-error-connectivity-scripts.md](..\guides/drafts/ado-wiki-internal-system-error-connectivity-scripts.md), [ado-wiki-kusto-datascanagent-event-migration.md](..\guides/drafts/ado-wiki-kusto-datascanagent-event-migration.md), [ado-wiki-logs-required-for-escalation.md](..\guides/drafts/ado-wiki-logs-required-for-escalation.md), [ado-wiki-system-error-launch-datascan-process.md](..\guides/drafts/ado-wiki-system-error-launch-datascan-process.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-case-management-basics.md, ado-wiki-a-case-management-acronyms.md

1. CASE DETAILS `[source: ado-wiki-a-case-management-acronyms.md]`
2. 1. Assignment `[source: ado-wiki-a-case-management-basics.md]`
3. Preferred contact method `[source: ado-wiki-a-case-management-basics.md]`
4. SLA Help (yanking cases) `[source: ado-wiki-a-case-management-basics.md]`
5. 2. FQR (First Quality Response) `[source: ado-wiki-a-case-management-basics.md]`
6. FQR Should Include: `[source: ado-wiki-a-case-management-basics.md]`
7. Issue scoping `[source: ado-wiki-a-case-management-basics.md]`
8. Initial checking `[source: ado-wiki-a-case-management-basics.md]`
9. CRI Creation through ASC `[source: ado-wiki-a-cri-creation-through-asc.md]`
10. Guidelines for Raising CRIs `[source: ado-wiki-a-cri-creation-through-asc.md]`

### Phase 2: Data Collection (KQL)

```kusto
cluster('Babylon').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxxx" //Scan ID
| project PreciseTimeStamp, Type, EventName, ElapsedTimeInMS, ScanResultId, Message, FullException, Uri
```
`[tool: ado-wiki-internal-system-error-connectivity-scripts.md]`

```kusto
database("babylonMdsLogs").ScanningLog
| where ScanResultId == "{scanResultID}"
| where Message contains "k8s"
```
`[tool: ado-wiki-kusto-datascanagent-event-migration.md]`

```kusto
cluster('{kustoCluster}').database('{kustoDatabase}').DataScanAgentLinuxEvent
| where ScanResultId == '{scanResultID}'
//| where Message contains "syntax error" or Message contains " unexpected " or Message contains "failed " or Message contains "terminated " or Message contains "unsupported " or Message contains "exception " or Message contains "memory" or Level == "1" or Level == "2" or Level == "3"
// Level 1 = Critical, 2 = Error, 3 = Warning
```
`[tool: ado-wiki-kusto-datascanagent-event-migration.md]`

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "{scanResultID}"
| project Tenant
```
`[tool: ado-wiki-kusto-datascanagent-event-migration.md]`

```kusto
cluster("https://catalogtelemetrykusto.eastus.kusto.windows.net")
.database("Scan")
.GetAgentCluster({ScanRunId})
```
`[tool: ado-wiki-system-error-launch-datascan-process.md]`

```kusto
let activityid = cluster("https://catalogtelemetrykusto.eastus.kusto.windows.net")
    .database("Scan").GetScanActivities({ScanRunId});
cluster({ClusterConnStr}).database('DataScanLogs').CustomLogEvent
| where ActivityId in (activityid)
```
`[tool: ado-wiki-system-error-launch-datascan-process.md]`

```kusto
cluster({ClusterConnStr}).database('DataScanLogs').DataScanAgentEvent
| where ScanResultId == {ScanRunId}
```
`[tool: ado-wiki-system-error-launch-datascan-process.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Customer cannot access files shared via DTM workspace, receives access denied or... | Customer is using a different account than the one listed as... | Verify customer is using the account listed as contact for the case. If another ... |
| EU DfM case linked to WW ICM RCRI: transferred/second case owner cannot access R... | ICM runs CheckAccess on DFM instance matching RCRI/ICM insta... | Only original RCRI creator has access via ACL. Known bug: work items 35507191 an... |
| After taking ownership of DFM case or receiving JIT approval, unable to view lin... | AccessCheck does not immediately sync after ownership change... | Log out from ICM portal and log back in to force access refresh. |
| Access issues when multiple DFM cases linked to a single RCRI. | RCRI and AccessCheck design based on 1:1 relationship betwee... | Avoid linking multiple cases to one RCRI. This is a known design limitation. |
| Cannot see or access RCRI contents after creating via ASC using TSE/MID/AME acco... | Bug in ASC passes incorrect format (UPN instead of alias) fo... | Ask EEE/SEE/EE to add you explicitly to the RCRI. Bugs tracked: 35715517, 357435... |
| Support case added to Impact Assessment section of RCRI but not visible. | - | Close the browser tab and reopen the RCRI. Navigate to Impact Assessment section... |
| Search by column name does not return column entities in search results; searchi... | Keyword search matches content within columns but not column... | Known limitation. Search for the parent entity (e.g., the parquet file or table)... |
| Search does not return expected assets when searching by keyword or applying fil... | Multiple causes: camelCase asset names not matched by partia... | Adjust search keywords: split camelCase names (e.g., 'product detail' instead of... |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer cannot access files shared via DTM workspace, receives access denied or empty workspace | Customer is using a different account than the one listed as the case contact; D... | Verify customer is using the account listed as contact for the case. If another person needs access,... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Information%20Protection/_wiki/wikis/Information%20Protection%20Team%20Wiki?pagePath=/General%20Onboarding%20Material/Case%20Management/Secure%20data%20transferring%20on%20cases%20with%20DTM) |
| 2 | EU DfM case linked to WW ICM RCRI: transferred/second case owner cannot access RCRI via CheckAccess ... | ICM runs CheckAccess on DFM instance matching RCRI/ICM instance. EU DFM case ID ... | Only original RCRI creator has access via ACL. Known bug: work items 35507191 and 35507130. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Supportability%20for%20Restricted%20CRIs%20%28rCRI%29) |
| 3 | After taking ownership of DFM case or receiving JIT approval, unable to view linked RCRI despite Acc... | AccessCheck does not immediately sync after ownership change or JIT approval. | Log out from ICM portal and log back in to force access refresh. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Supportability%20for%20Restricted%20CRIs%20%28rCRI%29) |
| 4 | Access issues when multiple DFM cases linked to a single RCRI. | RCRI and AccessCheck design based on 1:1 relationship between RCRI and DFM case.... | Avoid linking multiple cases to one RCRI. This is a known design limitation. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Supportability%20for%20Restricted%20CRIs%20%28rCRI%29) |
| 5 | Cannot see or access RCRI contents after creating via ASC using TSE/MID/AME account (post Oct 22). | Bug in ASC passes incorrect format (UPN instead of alias) for TSE/MID/AME accoun... | Ask EEE/SEE/EE to add you explicitly to the RCRI. Bugs tracked: 35715517, 35743502. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Supportability%20for%20Restricted%20CRIs%20%28rCRI%29) |
| 6 | Support case added to Impact Assessment section of RCRI but not visible. | - | Close the browser tab and reopen the RCRI. Navigate to Impact Assessment section to see the linked c... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Supportability%20for%20Restricted%20CRIs%20%28rCRI%29) |
| 7 | Search by column name does not return column entities in search results; searching 'address' returns... | Keyword search matches content within columns but not column names themselves; c... | Known limitation. Search for the parent entity (e.g., the parquet file or table) instead of the colu... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FSearch%20and%20Browse%2FKnown%20Issues%20(Search%20%26%20Browse%20Purview)) |
| 8 | Search does not return expected assets when searching by keyword or applying filters | Multiple causes: camelCase asset names not matched by partial lowercase keywords... | Adjust search keywords: split camelCase names (e.g., 'product detail' instead of 'productde'), appen... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FSearch%20and%20Browse%2FSearch%20results%20does%20not%20return%20an%20asset%2FSearch%20result%20does%20not%20return%20expected%20asset) |
| 9 | After deploying External Azure Subscription (via MCAPS), engineer cannot login — browser returns err... | IPv6 connectivity issue causes temporary login failure when first accessing a ne... | Temporarily disable IPv6: Control Panel > Network and Internet > Network and Sharing Center > Change... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FRequest%20Azure%20Subscription) |
| 10 | MIP PowerShell module throws Object reference not set to an instance of an object error on PowerShel... | PowerShell 7 is not supported by the Microsoft Purview Information Protection cl... | Use Windows PowerShell 5.1 (powershell.exe) instead of PowerShell 7 (pwsh.exe) when running MIP cmdl... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/sensitivity-labels/known-issues-ip-client) |