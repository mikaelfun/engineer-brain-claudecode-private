# AVD 监控与诊断 — 排查工作流

**来源草稿**: ado-wiki-a-insights-confirm-dcr-la-workspace.md, ado-wiki-ama-deployment-issues.md, ado-wiki-dcrs-feature-requests.md, ado-wiki-deprecated-data-collection.md, ado-wiki-portal-related-issue-data-collection.md, ado-wiki-remoting-connection-report.md, mslearn-insights-troubleshooting.md, onenote-avd-diagnostic-logs-tools.md, onenote-avd-diagnostics-log-analytics.md, onenote-avd-log-analytics-queries.md
**Kusto 引用**: (无)
**场景数**: 49
**生成日期**: 2026-04-07

---

## Scenario 1: How to Confirm Which DCR and Log Analytics Workspace Is Being Selected (AVD Insights)
> 来源: ado-wiki-a-insights-confirm-dcr-la-workspace.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> ⚠️ This content is under development / may be outdated.

## Scenario 2: Overview
> 来源: ado-wiki-a-insights-confirm-dcr-la-workspace.md | 适用: \u901a\u7528 \u2705

### 排查步骤
When AVD Insights workbook shows unexpected data, it may be selecting a different DCR or Log Analytics workspace than intended. Use this procedure to verify what is currently selected.

## Scenario 3: Steps
> 来源: ado-wiki-a-insights-confirm-dcr-la-workspace.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Go to **Azure Portal** → **Azure Virtual Desktop** → **Host Pools**
2. Select the impacted Host Pool
3. Click **Insights** (under Monitoring section)
4. Click **Customize** at the top menu
5. Click **Edit**
6. Look for the parameters **`poolla`** and **`assignedDCR`**:
| Parameter | What it shows |
|-----------|---------------|
| `poolla` | Currently selected Log Analytics workspace; dropdown shows all available LA workspaces linked to the host pool (Diagnostic Settings with LA workspace destination) |
| `assignedDCR` | Currently selected DCR; dropdown shows all available DCRs for this host pool |

## Scenario 4: Related Pages
> 来源: ado-wiki-a-insights-confirm-dcr-la-workspace.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Insights Workbook not selecting expected DCR](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1363016)
   - [Insights Workbook not selecting expected Log Analytics workspace](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1363018)
   - [Insights Workbook displaying unexpected or incorrect data](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1353237)

## Scenario 5: AMA Deployment Issues (AVD)
> 来源: ado-wiki-ama-deployment-issues.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> ⚠️ This content was marked as "in development / not yet ready for consumption" in the wiki.

## Scenario 6: Too many `<query failed>` errors in portal during deployment
> 来源: ado-wiki-ama-deployment-issues.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - First page load shows 1 error
   - Clicking refresh increases errors to 8
   - Customers may stop deployment and open support cases due to these errors

## Scenario 7: Broken link in Workbooks
> 来源: ado-wiki-ama-deployment-issues.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Clicking "Workbooks" redirects to host pool overview page instead of expected workbook

## Scenario 8: Typo in Resource Group creation
> 来源: ado-wiki-ama-deployment-issues.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - "Create a resource group" page has a spelling error for "Resource"

## Scenario 9: Deploy Resource Group fails every time
> 来源: ado-wiki-ama-deployment-issues.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Clicking "Deploy" consistently fails with an error

## Scenario 10: Session host data settings tab errors
> 来源: ado-wiki-ama-deployment-issues.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - First page load shows errors
   - Clicking refresh clears errors but shows `<query failed>` errors
   - Clicking refresh again completely changes the page layout

## Scenario 11: CSS Steps
> 来源: ado-wiki-dcrs-feature-requests.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Have customer complete DCR Template (must be fully completed)
2. Complete IcM with "DCR" in title + impact statement
3. Submit IcM to WCX SaaF team
4. Document case with ICM and CRM numbers, close service request

## Scenario 12: SaaF Steps
> 来源: ado-wiki-dcrs-feature-requests.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Take ownership, triage for completeness
2. Search for duplicates at https://aka.ms/wcxcrm
3. Identify Feature PM/Advocate from Advocate Mapping spreadsheet
4. If viable, request ADO from Feature PM
5. Create CRM entry with [DCR] prefix in title, include ICM number and ADO
6. Add CRM number to IcM, advise CSS to archive case

## Scenario 13: Rejected DCRs
> 来源: ado-wiki-dcrs-feature-requests.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Track in CRM under "Rejected" or "Rejected - Workaround Available" status for future reference.

## Scenario 14: CXE CAT Advocates to Area Lead Mapping
> 来源: ado-wiki-dcrs-feature-requests.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| CXE Advocate | Area Lead |
|---|---|
| David Rankin | Sandeep Patnaik |
| Marvin Quinzon | Joydeep Mukherjee |
| Claus Emrich | Roop Kiran Chevuri |
| Jason Byway | Nandita Sharma |
| Donna Ryan | Sam Tulimat |
| Roel Schellens | Eric Orman |
| Aleksandar Bozadzhiev | Pratik Shah |
| Shannon Fritz | Lucas Brodzinski |

## Scenario 15: Collect WebRTC Traces
> 来源: ado-wiki-deprecated-data-collection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
See [WebRTC trace collection guide](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/474447/Troubleshooting?anchor=collect-webrtc-traces-on-the-avd-client-machine-(not-the-vm))

## Scenario 16: WVD Collect Script
> 来源: ado-wiki-deprecated-data-collection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Use [WVD Collection Script](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464548/WVD-Logs-and-Traces?anchor=wvd-collect-powershell-script) with the `-Teams` parameter to collect both dxdiag and Teams logs.

## Scenario 17: Teams on WVD Data Collection
> 来源: ado-wiki-deprecated-data-collection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
From the [Teams on WVD Troubleshooting Doc](https://microsoft.sharepoint.com/:w:/t/RD20/EaMbiynRdPxKhbIHA0CUGhQBDF8FWn6Vuz_LVb5U6rwgSg?e=UoP3dv):
   - Collect dxdiag logs locally
   - Collecting Teams logs
   - Collecting client traces
   - Report issue via Remote Desktop client > Feedback Hub

## Scenario 18: Additional Resources
> 来源: ado-wiki-deprecated-data-collection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Calling & Collaboration for WVD](https://osgwiki.com/wiki/Calling_%26_Collaboration_for_WVD#Teams_on_WVD_troubleshooting) on PG Wiki

## Scenario 19: Portal Related Issue - Data Collection
> 来源: ado-wiki-portal-related-issue-data-collection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
For any **MEM/Azure** Portal related issue, collect the following from the customer:
1. **Session ID**: Get via `Ctrl + Alt + D` in the portal
2. **Screenshot**: Capture the issue while it is reproducing on customer side
This data is essential for investigating portal rendering, loading, or functionality issues in the Intune/Azure portal for Windows 365/Cloud PC management.

## Scenario 20: Remoting connection report on Endpoint Analytics
> 来源: ado-wiki-remoting-connection-report.md | 适用: \u901a\u7528 \u2705

### 排查步骤
This report is available on the MEM portal for customers with Cloud PC licenses in their tenant.
Remoting connection report on Endpoint analytics helps IT monitor key performance metrics for connecting to the cloud PCs and shares insights on how it impacts user connectivity.
There are two metrics we provide in this report:
1. Cloud PC Sign in time (sec) provides the total time users take to connect to the cloud PC
2. Round Trip Time (ms) provides insights on speed and reliability of network connections from the user location

## Scenario 21: Getting started guide
> 来源: ado-wiki-remoting-connection-report.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Enroll your device to Endpoint analytics Quickstart - Enroll Intune devices - https://learn.microsoft.com/en-us/mem/analytics/enroll-intune
There are four pages in Resource perf report on Endpoint analytics:
A. Landing page: Remoting connection
B. Model performance page
C. Device performance page
D. Device history page

## Scenario 22: A. Landing page: Remoting connection
> 来源: ado-wiki-remoting-connection-report.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Average round Trip Time (ms) provides insights on speed and reliability of network connections from the user location
2. Average cloud PC Sign in time (sec) provides the total time users take to connect to the cloud PC
3. Daily metric trend (30 days) helps you get a trend of your average Cloud PC round trip time and cloud PC sign-in time. You can use the drop down to select cloud PC round trip time or sign in time
4. Insights and Recommendations provide insights on the number of devices that have above average cloud PC round trip time and cloud PC sign in time.
**Key thresholds:**
   - Round trip time is characterized as high if equal to or higher than **200 ms**. Devices above the threshold are identified under insights
   - Cloud PC sign-in time is characterized as high if equal to or higher than **60 sec**. Devices above the threshold are identified under insights
**Average cloud PC sign in time deep link provides** the breakdown of the time it takes users to connect to their cloud PCs. Some phases happen rarely, like Core Boot sign in time as Cloud PC is always available to users.
**Cloud PC sign in phases:**
a) **Remoting sign in time:** Time from when user clicks on cloud PC client to when cloud PC sends user login and credentials to the cloud PC machine
b) **Core Sign in time:** Average time it takes to get to a responsive desktop after a user signs in. Excludes new user sign in and first sign in after a feature update
c) **Core Boot:** Time taken to reach the sign in prompt after a device is turned on. Excludes OS update time. This phase may not occur at all times with cloud PCs

## Scenario 23: B. Model performance page
> 来源: ado-wiki-remoting-connection-report.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Review the Cloud PC round trip time and Cloud PC sign in time and also get the option to include the phases:
1. Filter by device count to see how many devices you have by the SKU types.
2. Filter by Cloud PC round trip time or Cloud PC sign in time to see if a particular SKU type in your organization is facing issues.

## Scenario 24: AVD Insights Troubleshooting Guide
> 来源: mslearn-insights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Source: [Troubleshoot Azure Virtual Desktop Insights](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-insights)

## Scenario 25: Azure Monitor Agent (Recommended)
> 来源: mslearn-insights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Enable diagnostics: Send AVD diagnostics to Log Analytics
   - Install AMA extension manually if config workbook fails
   - Create Log Analytics workspace if needed
   - Validate Data Collection Rules in use

## Scenario 26: Log Analytics Agent (Deprecated - migrate by Aug 2024)
> 来源: mslearn-insights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Same manual setup steps but using Log Analytics extension
   - Can add custom performance counters and Windows event logs

## Scenario 27: Checklist
> 来源: mslearn-insights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Verify configuration workbook setup (missing counters/events = missing data)
2. Check access permissions:
   - Read access to Azure RG with AVD resources
   - Read access to subscription RG with session hosts
   - Read access to Log Analytics workspaces
3. Open outgoing firewall ports for Azure Monitor
4. Wait 15 minutes for Azure Monitor data ingestion latency
5. If still broken → possible query or data source issue

## Scenario 28: Known Issues & Limitations
> 来源: mslearn-insights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Custom workbook templates don't auto-adopt product group updates
   - Config workbook may show "query failed" errors (refresh and reenter selection)
   - Total sessions counter may overcount by small number
   - Available session count doesn't reflect scaling policies
   - Connection completion events can go missing (rare)
   - Time to connect includes credential entry time → false peaks possible

## Scenario 29: Customization
> 来源: mslearn-insights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Use Azure Monitor Workbooks to save/customize templates
   - Custom templates won't get automatic updates from product group

## Scenario 30: Data Collection Tool: MSRD-Collect
> 来源: onenote-avd-diagnostic-logs-tools.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> AVD-Collect has been replaced by **MSRD-Collect**. Use MSRD-Collect from now on.
   - ADO Wiki: https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/665066/MSRD-Collect
   - Script download: https://aka.ms/avd-collect
   - Duration: ~10 minutes
   - Output: generates logs in local directory

## Scenario 31: FSLogix Log Locations
> 来源: onenote-avd-diagnostic-logs-tools.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Tray tool: `C:\Program Files\FSLogix\Apps\frxtray.exe`
   - Event logs: `%SystemRoot%\System32\Winevt\Logs\Microsoft-FSLogix*` (4 files)
   - Application logs: `%ProgramData%\FSLogix\Logs\` (all files)

## Scenario 32: Domain Join Logs
> 来源: onenote-avd-diagnostic-logs-tools.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - `C:\Windows\Debug\netsetup.log`
   - `C:\WindowsAzure\Logs\Plugins\Microsoft.Compute.JsonADDomainExtension\`

## Scenario 33: Portal Trace Collection
> 来源: onenote-avd-diagnostic-logs-tools.md | 适用: \u901a\u7528 \u2705

### 排查步骤
When investigating Azure Portal issues (e.g. missing user sessions, incorrect display):
1. Open Azure Portal → navigate to affected WVD blade
2. Press F12 → go to "Network" tab
3. Clear console
4. Refresh the affected tab to reproduce the issue
5. Inspect the response body for VM/user session info
6. Check if the issue is portal-side or API-side
7. If API issue → engage PG via IcM

## Scenario 34: Windows Performance Toolkit
> 来源: onenote-avd-diagnostic-logs-tools.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **WPR** (Windows Performance Recorder): ETW-based performance recording tool
   - Doc: https://docs.microsoft.com/en-us/windows-hardware/test/wpt/windows-performance-recorder
   - **WPA** (Windows Performance Analyzer): Creates graphs/tables from ETL files
   - Doc: https://docs.microsoft.com/en-us/windows-hardware/test/wpt/windows-performance-analyzer

## Scenario 35: Log and Registry Reference
> 来源: onenote-avd-diagnostic-logs-tools.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Full reference: https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464429/Log-and-Registry-Locations

## Scenario 36: AVD Diagnostics with Log Analytics — KQL Query Patterns
> 来源: onenote-avd-diagnostics-log-analytics.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Source**: OneNote Lab Verification (Ning, 2021-11)
**Status**: Draft — pending SYNTHESIZE review

## Scenario 37: List recent connections for a user
> 来源: onenote-avd-diagnostics-log-analytics.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
WVDConnections
| where UserName contains "username"
| take 100
| sort by TimeGenerated asc, CorrelationId
```
`[来源: onenote-avd-diagnostics-log-analytics.md]`

## Scenario 38: Daily connection count
> 来源: onenote-avd-diagnostics-log-analytics.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
WVDConnections
| where UserName contains "username"
| take 100
| sort by TimeGenerated asc, CorrelationId
| summarize dcount(CorrelationId) by bin(TimeGenerated, 1d)
```
`[来源: onenote-avd-diagnostics-log-analytics.md]`

## Scenario 39: Session duration calculation
> 来源: onenote-avd-diagnostics-log-analytics.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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
`[来源: onenote-avd-diagnostics-log-analytics.md]`

## Scenario 40: Notes
> 来源: onenote-avd-diagnostics-log-analytics.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - `CorrelationId` links Connected and Completed events for the same session
   - `State` values: "Connected", "Completed"
   - Use `bin(TimeGenerated, 1d)` for daily aggregation
   - Reference: [Azure Virtual Desktop diagnostics log analytics](https://docs.microsoft.com/en-us/azure/virtual-desktop/diagnostics-log-analytics)

## Scenario 41: AVD Log Analytics Query Reference (OneNote)
> 来源: onenote-avd-log-analytics-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Log Analytics workspace queries using WVDConnections, WVDErrors, WVDCheckpoints tables.

## Scenario 42: View Feed Activity (Connections + Errors + Checkpoints)
> 来源: onenote-avd-log-analytics-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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
    | mv-apply Checkpoints on (
        order by todatetime(Checkpoints['Time']) asc
        | summarize Checkpoints=makelist(Checkpoints)
    )
) on CorrelationId
| project-away CorrelationId1, CorrelationId2
| order by TimeGenerated desc
```
`[来源: onenote-avd-log-analytics-queries.md]`

## Scenario 43: Session Start/End Times (Last 7 Days)
> 来源: onenote-avd-log-analytics-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
WVDConnections
| where State == "Connected" and TimeGenerated > ago(7d)
| project CorrelationId, UserName, ResourceAlias, StartTime = TimeGenerated
| join (WVDConnections | where State == "Completed" | project EndTime = TimeGenerated, CorrelationId) on CorrelationId
| project UserName, StartTime, EndTime, ResourceAlias
| sort by StartTime desc
```
`[来源: onenote-avd-log-analytics-queries.md]`

## Scenario 44: All Connections for a Single User
> 来源: onenote-avd-log-analytics-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
WVDConnections
| where UserName == "userupn"
| take 100
| sort by TimeGenerated asc, CorrelationId
```
`[来源: onenote-avd-log-analytics-queries.md]`

## Scenario 45: Connection Count by Day
> 来源: onenote-avd-log-analytics-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
WVDConnections
| where UserName == "userupn"
| take 100
| sort by TimeGenerated asc, CorrelationId
| summarize dcount(CorrelationId) by bin(TimeGenerated, 1d)
```
`[来源: onenote-avd-log-analytics-queries.md]`

## Scenario 46: Session Duration by User
> 来源: onenote-avd-log-analytics-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
let Events = WVDConnections | where UserName == "userupn";
Events
| where State == "Connected"
| project CorrelationId, UserName, ResourceAlias, StartTime=TimeGenerated
| join (Events | where State == "Completed" | project EndTime=TimeGenerated, CorrelationId) on CorrelationId
| project Duration = EndTime - StartTime, ResourceAlias
| sort by Duration asc
```
`[来源: onenote-avd-log-analytics-queries.md]`

## Scenario 47: Errors for Specific User
> 来源: onenote-avd-log-analytics-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
WVDErrors
| where UserName == "johndoe@contoso.com"
| take 100
```
`[来源: onenote-avd-log-analytics-queries.md]`

## Scenario 48: Error Occurrence by Code
> 来源: onenote-avd-log-analytics-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
WVDErrors
| where CodeSymbolic == "ErrorSymbolicCode"
| summarize count(UserName) by CodeSymbolic
```
`[来源: onenote-avd-log-analytics-queries.md]`

## Scenario 49: Error Distribution Across All Users (Non-Service Errors)
> 来源: onenote-avd-log-analytics-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
WVDErrors
| where ServiceError == "false"
| summarize usercount = count(UserName) by CodeSymbolic
| sort by usercount desc
| render barchart
```
`[来源: onenote-avd-log-analytics-queries.md]`
