# Monitor 监控权限与 RBAC

**Entries**: 20 | **21V**: ALL | **Sources**: 1
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Log search alert rule querying across tenants fails or stops working - cross-... | Since March 2024, cross-tenant queries for log search alert rules are no long... | Use Azure Lighthouse to assign RBAC roles with adequate access across tenants... | 8.5 | ADO Wiki |
| 2 | Log search alert rule using linked storage account fails after July 2024 or w... | Since July 2024, linked storage requires managed identity; only user-assigned... | 1) Configure user-assigned managed identity on the alert rule 2) Assign Stora... | 8.5 | ADO Wiki |
| 3 | Log search alert rule cross-service query to ADX or ARG fails - default ident... | Default identity is not supported for cross-service (Azure Data Explorer / Az... | Switch to system-assigned or user-assigned managed identity. For ADX: Reader ... | 8.5 | ADO Wiki |
| 4 | Error creating/updating ITSM connection: 'access_denied', 'server_error', or ... | Misconfiguration of ServiceNow service integration user and/or roles; the aut... | Validate authentication by sending a direct token request to ServiceNow using... | 8.5 | ADO Wiki |
| 5 | Error creating/updating ITSM connection: access_denied, server_error, or Unau... | Misconfiguration of ServiceNow service integration user and/or roles; the aut... | Validate authentication by sending a direct token request to ServiceNow using... | 8.5 | ADO Wiki |
| 6 | No telemetry data in Application Insights; self-diagnostics log shows Azure I... | Local Auth is disabled on the Application Insights resource but the SDK is no... | Configure SDK with proper Entra ID authentication using managed identity or s... | 8.5 | ADO Wiki |
| 7 | Live Metrics shows Dependency and Failure data but CPU and Committed Memory m... | CPU and Committed Memory come from Performance Counters requiring proper iden... | Check permissions for the identity used by instrumented process to read Perfo... | 8.5 | ADO Wiki |
| 8 | Error creating availability tests: 'You do not have sufficient permissions to... | Webtest (microsoft.insights/webtests) resources are separate ARM resources fr... | Assign Application Insights Component Contributor or Monitoring Contributor b... | 8.5 | ADO Wiki |
| 9 | Availability test fails with 301, 302, 401, or 500 on website requiring authe... | Availability tests send anonymous HTTP requests without authentication tokens... | Add authentication headers manually in test config. Use TrackAvailability() t... | 8.5 | ADO Wiki |
| 10 | Azure Monitor data source 'Save & Test' fails in Azure Managed Grafana with a... | The Managed Identity (or App Registration) used by Grafana does not have the ... | Assign Monitoring Reader role to the Grafana Managed Identity at subscription... | 8.5 | ADO Wiki |
| 11 | Customer sees 'You might not have enough access' banner when attempting to cr... | Customer is not an admin or owner of the subscription, so upon resource creat... | 1) Customer can proceed with resource creation but needs someone with proper ... | 8.5 | ADO Wiki |
| 12 | View AMW metrics in editor entry point is not visible or disabled on the reso... | AMW Access Control Mode is set to workspace only instead of workspace and res... | 1) In AMW Query Options, set Access Control Mode to Workspace and resource co... | 8.5 | ADO Wiki |
| 13 | Resource-scoped PromQL query returns empty results or 403 error when querying... | Querying identity (user, managed identity, or AAD app) lacks Monitoring Reade... | 1) Grant Monitoring Reader to querying identity on scoped resource. 2) If AMW... | 8.5 | ADO Wiki |
| 14 | Summary Rule create/update returns HTTP 400 'User {principalId} does not main... | User creating/modifying the summary rule lacks Microsoft.OperationalInsights/... | Grant the user Microsoft.OperationalInsights/workspaces/tables/write permissi... | 8.5 | ADO Wiki |
| 15 | Cross-tenant queries through ADX Proxy to Azure Monitor resources fail with a... | The AAD token used to authenticate to ADX/Azure Monitor is scoped to a single... | Use the documented cross-tenant workaround: query data from each cluster/tena... | 8.5 | ADO Wiki |
| 16 | Query execution fails with HTTP 401 - Valid authentication was not provided o... | Authentication (AuthN) failure - AAD token validation failed. Common causes: ... | 1) Verify a valid AAD token is supplied with correct audience/scope for the A... | 8.5 | ADO Wiki |
| 17 | Query execution is slow or fails with HTTP 403 when user has custom RBAC role... | RBAC evaluation is slow because the system must traverse and check permission... | 1) Use wildcard permission microsoft.operationalinsights/workspaces/query/*/r... | 8.5 | ADO Wiki |
| 18 | In Azure Portal metrics chart, supported metrics names are not loading for a ... | Customer lacks Monitoring Reader RBAC permission on the resource, causing Met... | 1) Collect HAR file from customer while reproducing 2) Try reproducing on own... | 8.5 | ADO Wiki |
| 19 | Customer unable to see metrics data in Azure Metrics Explorer but no errors s... | The Azure Monitor Metrics API is a LIST call. ARM applies RBAC filtering on t... | 1) Obtain correlation ID from HAR trace of Metrics Explorer 2) Query ARMProd ... | 8.5 | ADO Wiki |
| 20 | Query to Azure Resource Graph from Azure Monitor fails with permissions or au... | User or service principal lacks required permissions for Azure Resource Graph... | Verify required permissions are correctly set per ARG documentation. User nee... | 7.5 | ADO Wiki |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/permissions-rbac.md)
