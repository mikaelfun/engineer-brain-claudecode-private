# AVD AVD 监控与诊断 - Comprehensive Troubleshooting Guide

**Entries**: 6 | **Drafts fused**: 10 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-insights-confirm-dcr-la-workspace.md, ado-wiki-ama-deployment-issues.md, ado-wiki-dcrs-feature-requests.md, ado-wiki-deprecated-data-collection.md, ado-wiki-portal-related-issue-data-collection.md, ado-wiki-remoting-connection-report.md, mslearn-insights-troubleshooting.md, onenote-avd-diagnostic-logs-tools.md, onenote-avd-diagnostics-log-analytics.md, onenote-avd-log-analytics-queries.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: OneNote, KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Error retrieving data when loading Diagnostics tab in DfM EU... | DfM EU region data retrieval limitation in Azure Support Cen... | Use a Global (WW) DFM case to load the VM in ASC instead of ... |
| AVD Insights workbook (new, not Insights Legacy) not selecti... | The default Insights workbook selects DCR based on naming co... | Ensure the desired DCR name follows the 'microsoft-avdi-*' n... |
| AVD Insights workbook not selecting the expected Log Analyti... | Default Insights workbook selects LA workspace based on alph... | Rename/recreate the desired Diagnostic Setting to appear fir... |
| Need to verify if Relative Mouse is being triggered successf... | - | Use ASC Tracing tab with connection Activity ID (filter Task... |
| Logging in to VM joined to Azure AD DS with an Azure AD user... | By design: strict enforcement on UPN to enable reliable re-c... | Organizations using Azure AD DS for their AVD environment ne... |
| AVD users see ADFS login prompt for session host RDP sign-in... | AAD cookie is still valid allowing silent sign-in to AVD gat... | This is expected behavior when ADFS cookie expires before AA... |

### Phase 2: Detailed Investigation

#### How to Confirm Which DCR and Log Analytics Workspace Is Being Selected (AVD Insights)
> Source: [ado-wiki-a-insights-confirm-dcr-la-workspace.md](guides/drafts/ado-wiki-a-insights-confirm-dcr-la-workspace.md)

> ⚠️ This content is under development / may be outdated.

#### AMA Deployment Issues (AVD)
> Source: [ado-wiki-ama-deployment-issues.md](guides/drafts/ado-wiki-ama-deployment-issues.md)

> ⚠️ This content was marked as "in development / not yet ready for consumption" in the wiki.

#### DCRs and Feature Requests Process - WCX
> Source: [ado-wiki-dcrs-feature-requests.md](guides/drafts/ado-wiki-dcrs-feature-requests.md)

WCX CxE CAT team manages DCR and feature requests for Windows 365 and Azure Virtual Desktop. Any DCR or feature request from support (not a bug) goes through SaaF process and is filed in CRM.

#### WVD/AVD Data Collection (Deprecated)
> Source: [ado-wiki-deprecated-data-collection.md](guides/drafts/ado-wiki-deprecated-data-collection.md)

See [WebRTC trace collection guide](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/474447/Troubleshooting?anchor=collect-webrtc-traces-on-the-avd-client-m

#### Portal Related Issue - Data Collection
> Source: [ado-wiki-portal-related-issue-data-collection.md](guides/drafts/ado-wiki-portal-related-issue-data-collection.md)

For any **MEM/Azure** Portal related issue, collect the following from the customer:

#### Remoting connection report on Endpoint Analytics
> Source: [ado-wiki-remoting-connection-report.md](guides/drafts/ado-wiki-remoting-connection-report.md)

This report is available on the MEM portal for customers with Cloud PC licenses in their tenant.

#### AVD Insights Troubleshooting Guide
> Source: [mslearn-insights-troubleshooting.md](guides/drafts/mslearn-insights-troubleshooting.md)

> Source: [Troubleshoot Azure Virtual Desktop Insights](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-insights)

#### AVD Diagnostic Logs & Data Collection Tools (OneNote)
> Source: [onenote-avd-diagnostic-logs-tools.md](guides/drafts/onenote-avd-diagnostic-logs-tools.md)

## Data Collection Tool: MSRD-Collect

#### AVD Diagnostics with Log Analytics — KQL Query Patterns
> Source: [onenote-avd-diagnostics-log-analytics.md](guides/drafts/onenote-avd-diagnostics-log-analytics.md)

**Source**: OneNote Lab Verification (Ning, 2021-11)

*Contains 3 KQL query template(s)*

#### AVD Log Analytics Query Reference (OneNote)
> Source: [onenote-avd-log-analytics-queries.md](guides/drafts/onenote-avd-log-analytics-queries.md)

Log Analytics workspace queries using WVDConnections, WVDErrors, WVDCheckpoints tables.

*Contains 8 KQL query template(s)*

### Key KQL Queries

**Query 1:**
```kql
WVDConnections
| where UserName contains "username"
| take 100
| sort by TimeGenerated asc, CorrelationId
```

**Query 2:**
```kql
WVDConnections
| where UserName contains "username"
| take 100
| sort by TimeGenerated asc, CorrelationId
| summarize dcount(CorrelationId) by bin(TimeGenerated, 1d)
```

**Query 3:**
```kql
let Events = WVDConnections | where UserName contains "username";
Events
| where State == "Connected"
| project CorrelationId, UserName, ResourceAlias, StartTime=TimeGenerated
| join (Events
    | where State == "Completed"
    | project EndTime=TimeGenerated, CorrelationId)
on CorrelationId
| project Duration = EndTime - StartTime, ResourceAlias
| sort by Duration asc
```

**Query 4:**
```kql
WVDConnections
| project-away TenantId, SourceSystem
| join kind=leftouter (
    WVDErrors
    | summarize Errors=makelist(pack('Code', Code, 'CodeSymbolic', CodeSymbolic, 'Time', TimeGenerated, 'Message', Message, 'ServiceError', ServiceError, 'Source', Source)) by CorrelationId
) on CorrelationId
| join kind=leftouter (
    WVDCheckpoints
    | summarize Checkpoints=makelist(pack('Time', TimeGenerated, 'Name', Name, 'Parameters', Parameters, 'Source', Source)) by CorrelationId
    | mv-apply C
```

**Query 5:**
```kql
WVDConnections
| where State == "Connected" and TimeGenerated > ago(7d)
| project CorrelationId, UserName, ResourceAlias, StartTime = TimeGenerated
| join (WVDConnections | where State == "Completed" | project EndTime = TimeGenerated, CorrelationId) on CorrelationId
| project UserName, StartTime, EndTime, ResourceAlias
| sort by StartTime desc
```

**Query 6:**
```kql
WVDConnections
| where UserName == "userupn"
| take 100
| sort by TimeGenerated asc, CorrelationId
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Error retrieving data when loading Diagnostics tab in DfM EU ASC for Cloud PC | DfM EU region data retrieval limitation in Azure Support Center | Use a Global (WW) DFM case to load the VM in ASC instead of the EU DFM case | 🔵 7.5 | ADO Wiki |
| 2 | AVD Insights workbook (new, not Insights Legacy) not selecting the expected Data... | The default Insights workbook selects DCR based on naming convention 'microsoft-... | Ensure the desired DCR name follows the 'microsoft-avdi-*' naming convention. Th... | 🔵 7.5 | ADO Wiki |
| 3 | AVD Insights workbook not selecting the expected Log Analytics workspace – showi... | Default Insights workbook selects LA workspace based on alphanumerical sort of D... | Rename/recreate the desired Diagnostic Setting to appear first in alphanumerical... | 🔵 7.5 | ADO Wiki |
| 4 | Need to verify if Relative Mouse is being triggered successfully in an AVD sessi... | - | Use ASC Tracing tab with connection Activity ID (filter Task Name = RelativeMous... | 🔵 7.5 | ADO Wiki |
| 5 | Logging in to VM joined to Azure AD DS with an Azure AD user sourced from Window... | By design: strict enforcement on UPN to enable reliable re-connections and no du... | Organizations using Azure AD DS for their AVD environment need users created dir... | 🔵 6.5 | KB |
| 6 | AVD users see ADFS login prompt for session host RDP sign-in even though AAD gat... | AAD cookie is still valid allowing silent sign-in to AVD gateway, but ADFS cooki... | This is expected behavior when ADFS cookie expires before AAD cookie. After user... | 🔵 6.0 | OneNote |
