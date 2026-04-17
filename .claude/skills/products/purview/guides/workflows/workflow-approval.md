# Purview 工作流审批 — 排查工作流

**来源草稿**: `ado-wiki-a-access-workflows-roadmap.md`, `ado-wiki-a-workflow-queries.md`, `ado-wiki-asset-ingestion-workflow.md`, `ado-wiki-workflow-kusto-queries.md`
**Kusto 引用**: 无
**场景数**: 17
**生成日期**: 2026-04-07

---

## Scenario 1: Feature Roadmap
> 来源: ado-wiki-a-access-workflows-roadmap.md | 适用: 未标注

### 排查步骤
| Priority | Feature | Status | Private Preview | Public Preview | GA | Comments/Dependencies |
| --- | --- | --- | --- | --- | --- | --- |
| Remove blockers & enable revenue/use | Native customizable DG workflow for access provisioning | At risk | Jun | Oct | TBD | Deployment happening but needs customer validation in private preview before moving to public preview |
| Remove blockers & enable revenue/use | Native customizable DG workflow for data product publish approval | At risk | Aug | Oct | Nov | Fixed, waiting deployment and validation from QA |
| Remove blockers & enable revenue/use | Native customizable DG workflow for glossary terms publish approval | At risk | Oct | Oct | Nov | Fixed, waiting deployment and validation from QA |
| Remove blockers & enable revenue/use | External Unified Catalog Power Automate connector for managing workflows and data access grants (SPN Auth) | On track | Nov | TBD | TBD | In design, potential risk from unknowns |
| Remove blockers & enable revenue/use | In-product DG workflow addition for self-service policies for automated access granting in Azure Databricks (Korea Telecom Only) | Shippable - waiting on customer | Oct | TBD | TBD | Demo complete; improvements possible but not prioritized |
| Remove blockers & enable revenue/use | Native HTTP connector | Planning | Nov | TBD | TBD | May need to delay to prioritize other squad commitments |

`[来源: ado-wiki-a-access-workflows-roadmap.md]`

---

## Scenario 2: Key Risks & Dependencies
> 来源: ado-wiki-a-access-workflows-roadmap.md | 适用: 未标注

### 排查步骤
- Customer Validation: Several features at risk due to pending customer validation, especially private preview releases.
- QA & Deployment: Some workflows ready but awaiting deployment and QA validation.
- Design & Unknowns: Power Automate connector and HTTP connector in design/planning phases.
- Customer-Specific: Databricks access for Korea Telecom tailored for specific customer.

`[来源: ado-wiki-a-access-workflows-roadmap.md]`

---

## Scenario 3: Status Legend
> 来源: ado-wiki-a-access-workflows-roadmap.md | 适用: 未标注

### 排查步骤
- On Track: Progressing as planned.
- At Risk: May miss milestones due to dependencies, validation, or resource constraints.
- Shippable - waiting on customer: Ready but pending customer action/feedback.
- Planning: Early design/planning; timelines may shift.

`[来源: ado-wiki-a-access-workflows-roadmap.md]`

---

## Scenario 4: Query 1: Workflow Service Web Requests
> 来源: ado-wiki-a-workflow-queries.md | 适用: 未标注

### 排查步骤
Logs all API calls to workflow service. Can be filtered by time, purview account name, request URL path, client request ID.

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceWebRequests
| where RequestUrl contains "e5d68127-1b67-4e27-aac7-a3ee61411cda" //workflow request id
| sort by PreciseTimeStamp
```

`[来源: ado-wiki-a-workflow-queries.md]`

---

## Scenario 5: Query 2: Workflow Service Details
> 来源: ado-wiki-a-workflow-queries.md | 适用: 未标注

### 排查步骤
Logs detailed info of handling requests. Can be filtered by time, purview account name, client request ID, workflow run ID.

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceDetails
| where WorkflowRunId == "b9d0304f-d47d-420e-829f-d57b2a5feab3"
//| where * contains "b9d0304f-d47d-420e-829f-d57b2a5feab3"
| project PreciseTimeStamp, Level, HttpMethod, RequestPath, ClientRequestId, Message
| sort by PreciseTimeStamp asc
```

`[来源: ado-wiki-a-workflow-queries.md]`

---

## Scenario 6: Overview
> 来源: ado-wiki-asset-ingestion-workflow.md | 适用: 未标注

### 排查步骤
Asset ingestion workflow in Purview:

1. **DB Source** traverses and reads data
2. **Integration Runtime** creates ingestion job, writes raw assets to **Staging Storage** (managed storage account)
3. **Ingestion Service** pulls from staging, aggregates into Resource Sets if needed
4. **Ingestion Service** sends offline notifications to OT & calls **Data Map Service**
5. **Data Map Service** persists assets, sends RS notification to OT
6. **Offline Tier (OT)** scheduled job enriches RS: calculates size, partition count, updates schema & classifications, then re-ingests to Data Map

**Important**: Advanced Resource Set must be enabled from UI for OT job functions. Wait ~12 hours for OT job to complete re-ingestion.

`[来源: ado-wiki-asset-ingestion-workflow.md]`

---

## Scenario 7: During Traverse and Read
> 来源: ado-wiki-asset-ingestion-workflow.md | 适用: 未标注

### 排查步骤
When IR traverses data source, Purview:
1. Discovers assets
2. Matches Resource Set patterns
3. Samples data
4. Retrieves Schema (if classified) or basic Entities/Relationships
5. Classifies data
6. Creates Entities/Relationships

`[来源: ado-wiki-asset-ingestion-workflow.md]`

---

## Scenario 8: Kusto Tables Reference
> 来源: ado-wiki-asset-ingestion-workflow.md | 适用: 未标注

### 排查步骤
| Table | Description | Component |
|-------|-------------|-----------|
| DataScanAgentLinuxEvent | Raw assets discovered for Azure IR. Query correct Kusto endpoint per region. | Integration Runtime |
| TraceGatewayLocalEventLog | Raw assets discovered for Self-Hosted IR | Integration Runtime |
| CustomLogEvent | Verbose runtime log and error callstack | Integration Runtime |
| ScanningLog | Scanning details (which IR used, etc.) | Integration Runtime |
| OnlineTierIngestionDetails | Request and runtime details in ingestion service | Ingestion Service |
| OnlineTierWebRequests | Data Map HTTP request status | Data Map Service |
| OnlineTierDetails | Data Map request detail | Data Map Service |
| OnlineTierDetailsPrivacy | Data Map request payload | Data Map Service |

`[来源: ado-wiki-asset-ingestion-workflow.md]`

---

## Scenario 9: ConvertedEntities Log
> 来源: ado-wiki-asset-ingestion-workflow.md | 适用: 未标注

### 排查步骤
Query `DataScanAgentLinuxEvent` with `Message has "ConvertedEntities"`:

- **referredEntities**: columns info, classification info, parent level info
  - Column attributes: displayName, columnType, qualifiedName
  - Classifications: confidence score, category (e.g., MICROSOFT.GOVERNMENT.CITY_NAME)
  - Parent: location, resourceGroupName, subscriptionId, typeName

- **entity**: asset attributes, sampling status, collection info
  - File assets: fileName, path, schemaType, resourceId, ownership, modification timestamps
  - Container/folder assets: location, itemName, traversedLeafCount, traversedLeafNodes

`[来源: ado-wiki-asset-ingestion-workflow.md]`

---

## Scenario 10: Scope and Responsibility
> 来源: ado-wiki-asset-ingestion-workflow.md | 适用: 未标注

### 排查步骤
Troubleshoot based on workflow and check respective Kusto tables before escalating. Describe all troubleshooting steps and attach logs per "Logs Required for Escalation" TSG.

`[来源: ado-wiki-asset-ingestion-workflow.md]`

---

## Scenario 11: Query 1: API Calls to Workflow Service
> 来源: ado-wiki-workflow-kusto-queries.md | 适用: 未标注

### 排查步骤
Log all API calls, filterable by time, purview account name/id, request URL path, client request ID.

```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceWebRequests
| where ['time'] >= ago(1h)
```

`[来源: ado-wiki-workflow-kusto-queries.md]`

---

## Scenario 12: Query 2: Detailed Request Handling Logs
> 来源: ado-wiki-workflow-kusto-queries.md | 适用: 未标注

### 排查步骤
```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceDetails
| where ['time'] >= ago(1h)
```

`[来源: ado-wiki-workflow-kusto-queries.md]`

---

## Scenario 13: Query 3: Validate Workflow Approval Status
> 来源: ado-wiki-workflow-kusto-queries.md | 适用: 未标注

### 排查步骤
```kql
WorkflowApprovalRequestMetrics
| where ClientRequestId == "<client-request-id>"
```

`[来源: ado-wiki-workflow-kusto-queries.md]`

---

## Scenario 14: Troubleshooting Flow
> 来源: ado-wiki-workflow-kusto-queries.md | 适用: 未标注

### 排查步骤
1. Check WorkflowServiceWebRequests for failed requests:
```kql
WorkflowServiceWebRequests
| where PurviewAccountName == "<account-name>"
  and WebRequestEventName == "OnCompleted"
  and StatusCode !startswith "2"
| where ['time'] > ago(1d)
| project HttpMethod, RequestUrl, ClientRequestId
```

2. Find incomplete requests (only one log entry):
```kql
WorkflowServiceWebRequests
| where PurviewAccountName == "<account-name>"
| where ['time'] > ago(1d)
| summarize count() by ClientRequestId, HttpMethod, RequestUrl
| where count_ == 1
```

3. Check detailed logs:
```kql
WorkflowServiceDetails
| where ClientRequestId == "<client-request-id>"
```

4. If no error found, check Gateway for network timeout:
```kql
GatewayEvent
| where RequestId == "<request-id>"
```

`[来源: ado-wiki-workflow-kusto-queries.md]`

---

## Scenario 15: Basic Queries for Workflow Run Failure
> 来源: ado-wiki-workflow-kusto-queries.md | 适用: 未标注

### 排查步骤
By workflow request ID:
```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceWebRequests
| where RequestUrl contains "<workflow-request-id>"
| sort by PreciseTimeStamp
```

By workflow run ID:
```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceDetails
| where WorkflowRunId == "<workflow-run-id>"
| project PreciseTimeStamp, Level, HttpMethod, RequestPath, ClientRequestId, Message
| sort by PreciseTimeStamp asc
```

`[来源: ado-wiki-workflow-kusto-queries.md]`

---

## Scenario 16: Engaging Product Group via ICM
> 来源: ado-wiki-workflow-kusto-queries.md | 适用: 未标注

### 排查步骤
- **Owning Service:** Microsoft Purview
- **Owning Team:** Workflow

`[来源: ado-wiki-workflow-kusto-queries.md]`

---

## Scenario 17: Required ICM Information
> 来源: ado-wiki-workflow-kusto-queries.md | 适用: 未标注

### 排查步骤
| Field | Notes |
|-------|-------|
| Purview account name | |
| Region | |
| Support topic | |
| Issue start time | |
| Transient or reproducible | |
| Error message | |
| Task or approval request ID | |
| Workflow run ID | |
| Client request ID | From x-ms-client-request-id header in browser dev tools |
| Issue description | |

`[来源: ado-wiki-workflow-kusto-queries.md]`

---
