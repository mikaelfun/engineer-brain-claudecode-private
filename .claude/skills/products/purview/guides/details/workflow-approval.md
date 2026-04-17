# Purview 工作流审批 -- Comprehensive Troubleshooting Guide

**Entries**: 2 | **Drafts fused**: 4 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-access-workflows-roadmap.md](..\guides/drafts/ado-wiki-a-access-workflows-roadmap.md), [ado-wiki-a-workflow-queries.md](..\guides/drafts/ado-wiki-a-workflow-queries.md), [ado-wiki-asset-ingestion-workflow.md](..\guides/drafts/ado-wiki-asset-ingestion-workflow.md), [ado-wiki-workflow-kusto-queries.md](..\guides/drafts/ado-wiki-workflow-kusto-queries.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-access-workflows-roadmap.md, ado-wiki-a-workflow-queries.md

1. Access & Workflows - Internal Roadmap `[source: ado-wiki-a-access-workflows-roadmap.md]`
2. Feature Roadmap `[source: ado-wiki-a-access-workflows-roadmap.md]`
3. Key Risks & Dependencies `[source: ado-wiki-a-access-workflows-roadmap.md]`
4. Status Legend `[source: ado-wiki-a-access-workflows-roadmap.md]`
5. Basic Queries for Troubleshooting Workflow Run Failure `[source: ado-wiki-a-workflow-queries.md]`
6. Query 1: Workflow Service Web Requests `[source: ado-wiki-a-workflow-queries.md]`
7. Query 2: Workflow Service Details `[source: ado-wiki-a-workflow-queries.md]`
8. Asset Ingestion Workflow Description `[source: ado-wiki-asset-ingestion-workflow.md]`
9. **DB Source** traverses and reads data `[source: ado-wiki-asset-ingestion-workflow.md]`
10. **Integration Runtime** creates ingestion job, writes raw assets to **Staging Storage** (managed storage account) `[source: ado-wiki-asset-ingestion-workflow.md]`

### Phase 2: Data Collection (KQL)

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceWebRequests
| where RequestUrl contains "e5d68127-1b67-4e27-aac7-a3ee61411cda" //workflow request id
| sort by PreciseTimeStamp
```
`[tool: ado-wiki-a-workflow-queries.md]`

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceDetails
| where WorkflowRunId == "b9d0304f-d47d-420e-829f-d57b2a5feab3"
//| where * contains "b9d0304f-d47d-420e-829f-d57b2a5feab3"
| project PreciseTimeStamp, Level, HttpMethod, RequestPath, ClientRequestId, Message
| sort by PreciseTimeStamp asc
```
`[tool: ado-wiki-a-workflow-queries.md]`

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceWebRequests
| where ['time'] >= ago(1h)
```
`[tool: ado-wiki-workflow-kusto-queries.md]`

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceDetails
| where ['time'] >= ago(1h)
```
`[tool: ado-wiki-workflow-kusto-queries.md]`

```kusto
WorkflowApprovalRequestMetrics
| where ClientRequestId == "<client-request-id>"
```
`[tool: ado-wiki-workflow-kusto-queries.md]`

```kusto
WorkflowServiceWebRequests
| where PurviewAccountName == "<account-name>"
  and WebRequestEventName == "OnCompleted"
  and StatusCode !startswith "2"
| where ['time'] > ago(1d)
| project HttpMethod, RequestUrl, ClientRequestId
```
`[tool: ado-wiki-workflow-kusto-queries.md]`

```kusto
WorkflowServiceWebRequests
| where PurviewAccountName == "<account-name>"
| where ['time'] > ago(1d)
| summarize count() by ClientRequestId, HttpMethod, RequestUrl
| where count_ == 1
```
`[tool: ado-wiki-workflow-kusto-queries.md]`

```kusto
WorkflowServiceDetails
| where ClientRequestId == "<client-request-id>"
```
`[tool: ado-wiki-workflow-kusto-queries.md]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Workflow approval via actionable email in Outlook shows 403 error. | By-design: Approval via actionable emails in Outlook only supported for Purview ... | Click View item detail in the email and approve from the Purview portal. Ensure Purview account has ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FWorkflow%2FWorkflow%20-%20Known%20issues%20and%20solutions) |
| 2 | Workflow approval from Outlook returns HTTP 404 error. Same request works from Purview portal. | Tenant mismatch between Purview account tenant and the Outlook login tenant. App... | 1) Approve from Purview Portal (Workflows > Requests and approvals). 2) Ensure approver is logged in... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FWorkflow%2FWorkflow%20Approval%20from%20Outlook%20returns%20HTTP%20404%20Error) |