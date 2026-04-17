# AVD W365 Monitoring & Radar — 排查工作流

**来源草稿**: ado-wiki-w365-monitoring-radar-function-use.md, ado-wiki-w365-monitoring-radar-scoping-questions.md, ado-wiki-w365-scope-tags-intunegeosync.md
**Kusto 引用**: (无)
**场景数**: 22
**生成日期**: 2026-04-07

---

## Scenario 1: General page design
> 来源: ado-wiki-w365-monitoring-radar-function-use.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Windows 365 reporting and monitoring has been substantially improved with an entirely new experience that provides:
   - Tenant level operations analysis, help desk detail and end to end configuration details
   - Rich visualizations
   - Flexible data series and filters accelerating troubleshooting
   - Contextualized data for multi-dimensional analysis
   - Detailed tabular data for performance, connection configuration, connection events and connection error
The new experience is found in Intune by selecting **Reports** > **Cloud PC Monitoring (Preview)**. The legacy reports are currently maintained in **Reports** > **Cloud PC Overview**.
The monitoring page is organized so that administrators have an intuitive top to bottom of the page flow. When a selection is made at the top of the page, it impacts all data and components on the page including visualizations and tables.
1. Select the tab according to the task:
a. **Connection Health**: Understand performance and reliability of user connections across your full tenant.
b. **User and devices**: Deep-dive on the detailed history of specific users or devices, particularly useful for helpdesk scenarios.
c. **Configurations**: Understand end to end connection configurations aggregated across your environment.
2. Set the data series for analysis from the configuration variables that most commonly impact Windows 365 and Cloud PCs.
3. Determine the timeframe.
4. Filter based on client, service and host configuration variables to identify and focus on specific cohorts.

## Scenario 2: Connection Health Page
> 来源: ado-wiki-w365-monitoring-radar-function-use.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Use the connection health page to observe the full Windows 365 tenant, quickly identify when a problem occurs and isolate the cohorts.
Metrics shown:
1. **Average active connection count**: trend of all active connections for the given time
2. **Connection failure rate**: number of connections that have a failure (currently calculated based on ANY connection failure)
3. **Cloud PC health**: percentage of Cloud PCs that are healthy. Health is determined based on validation tests executed about every 30 minutes.
4. **Round trip time**: median (P50) RTT for all CPCs for the time period
5. **View Data**: tabular data used to create charts and trends
**Note:** Filters applied to the page impact the tabular data.

## Scenario 3: Users and Devices Page
> 来源: ado-wiki-w365-monitoring-radar-function-use.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Use this page for granular analysis of a specific user or device. Especially useful for Help Desk calls.
1. Search for the known user or device
2. Select associated items via checkboxes to filter all visuals and tabular data
3. Use Time Range picker for desired time window
4. View per-user/device performance and reliability metrics

## Scenario 4: Configurations Page
> 来源: ado-wiki-w365-monitoring-radar-function-use.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Less about identifying connection reliability/performance issues, more about understanding configurations:
   - **Endpoint**: OS Type, OS Version, Client Type, etc.
   - **Service**: provisioning policy, Cloud PC image, BCDR configuration
   - **Host**: OS, Remote agents and settings
Each connection creates a potentially unique "signature" as users may connect from different devices.

## Scenario 5: View Data
> 来源: ado-wiki-w365-monitoring-radar-function-use.md | 适用: \u901a\u7528 \u2705

### 排查步骤
All pages have a "View Data" fly-out at the bottom:
1. **Select View data** to expand. Size by dragging the handle.
2. **Environment metrics**: Measures associated with performance and reliability. Each row represents an aggregate of a specific time range.
3. **Connection configuration**: View each connection and associated configuration. Use to narrow or understand common traits.
4. **Events**: Granular view of connection including checkpoint events, errors and Health Check results. Provides data to diagnose connection errors, reliability and performance issues.

## Scenario 6: 1. Environment & Configuration
> 来源: ado-wiki-w365-monitoring-radar-scoping-questions.md | 适用: Global-only \u274c

### 排查步骤
Purpose: Quickly understand the customer setup and rule out unsupported or misconfigured environments.
   - Which **Windows 365 service** is affected (Enterprise, Business, Government)?
   - What **Cloud PC OS version and build** is impacted?
   - Is the Cloud PC **Azure AD joined or Hybrid joined**?
   - Is **Intune / MDM** managing the Cloud PC? If yes, which **key policies** apply?
   - What **network path** is used by the end user (corporate network, VPN, home network)?
   - Are any **conditional access policies** applied to Cloud PC access?
   - Is this a **single Cloud PC** or **multiple Cloud PCs** across users/regions?
   - Has **Windows 365 monitoring (Radar)** been reviewed? If yes, what signals or alerts are observed?

## Scenario 7: 2. User Scenario / UX Experience
> 来源: ado-wiki-w365-monitoring-radar-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Purpose: Clearly understand what the user sees and when the experience breaks.
   - What is the **exact user action** when the issue occurs?
   - At which stage: provisioning / sign-in / session launch / in-session / disconnect-reconnect?
   - Is the issue **blocking access**, **degrading performance**, or **cosmetic/UX-related**?
   - What **error message or behavior** does the user experience?
   - Does the issue occur **immediately** or **after some time in session**?
   - Is this impacting **keyboard, mouse, display, audio, Teams, or app behavior**?

## Scenario 8: 3. Scope & Impact Assessment
> 来源: ado-wiki-w365-monitoring-radar-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - How many **users are affected**?
   - Are all affected users in the **same tenant, region, or policy group**?
   - Is this impacting **production users** or test users only?
   - When did the issue **first start occurring**?
   - Is the issue **ongoing**, **intermittent**, or **one-time**?
   - Is there a **business-critical impact**?

## Scenario 9: 4. Reproducibility
> 来源: ado-wiki-w365-monitoring-radar-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Can the issue be **reproduced consistently**?
   - Does it reproduce on another Cloud PC / another user / another network?
   - Does the issue occur after a **specific action or workflow**?
   - Does restarting the Cloud PC **temporarily resolve** the issue?

## Scenario 10: 5. Recent Changes
> 来源: ado-wiki-w365-monitoring-radar-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Were there any **recent changes** before the issue started?
   - Intune policy updates / Networking changes / Identity-CA changes / Windows updates
   - Was the Cloud PC **recently reprovisioned or resized**?
   - Have any **preview features** been enabled recently?

## Scenario 11: 6. Monitoring, Logs & Technical Evidence
> 来源: ado-wiki-w365-monitoring-radar-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Have you reviewed **Windows 365 monitoring (Radar)** for affected users?
   - Are there **alerts, degraded signals, or health indicators** visible?
   - Can you provide: Cloud PC name(s), affected user UPN(s), approximate **timestamp** of failure?
   - Are there relevant **event logs** or **client-side error details**?
   - Is the issue reflected in **service health** or **admin center insights**?

## Scenario 12: 7. Workarounds & Mitigations
> 来源: ado-wiki-w365-monitoring-radar-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Has any **temporary workaround** been tried? (Cloud PC restart / User reconnect / Policy rollback)
   - Does the issue stop occurring after a **specific mitigation**?
   - Is the customer **open to temporary mitigations** if needed?

## Scenario 13: 8. Validation: Product Issue vs Configuration
> 来源: ado-wiki-w365-monitoring-radar-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Does the issue reproduce in a **clean / known-good configuration**?
   - Does it affect **multiple tenants** or only this one?
   - Is the behavior **expected per current design/limitations**?
   - Evidence pointing to: Misconfiguration / Known limitation / Service degradation / Product bug?

## Scenario 14: 9. Best Practices to Reinforce
> 来源: ado-wiki-w365-monitoring-radar-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Confirm monitoring (Radar) is **actively reviewed**
   - Validate **change management** for Intune / CA updates
   - Ensure **supported network paths** are used
   - Avoid enabling **preview features** in production unintentionally

## Scenario 15: Windows 365 Scope Tags — IntuneGeoSync Service
> 来源: ado-wiki-w365-scope-tags-intunegeosync.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> ⚠️ This information is primarily for WCX PMs and SaaF teams. Steps may not apply to CSS directly.

## Scenario 16: Overview
> 来源: ado-wiki-w365-scope-tags-intunegeosync.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The IntuneGeoSync service cooperates with the Intune partner sync feature for scope tag data. Before receiving data from Intune, W365 needs to be onboarded as a partner to Intune's data pipeline. The service operates in a geo manner (NA, EU, AP, AU).

## Scenario 17: Code Repo
> 来源: ado-wiki-w365-scope-tags-intunegeosync.md | 适用: \u901a\u7528 \u2705

### 排查步骤
[W365-Svc-IntuneGeoSync](https://microsoft.visualstudio.com/CMD/_git/W365-Svc-IntuneGeoSync)

## Scenario 18: Engineering TSG
> 来源: ado-wiki-w365-scope-tags-intunegeosync.md | 适用: \u901a\u7528 \u2705

### 排查步骤
https://eng.ms/docs/experiences-devices/wd-windows/wcx/cloud-pc/cloudpc-service/intunegeosync-service/tsgs/tsg

## Scenario 19: Dashboards
> 来源: ado-wiki-w365-scope-tags-intunegeosync.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Infra Grafana - Health Indicator Service](https://win365infra-f9btdrbeddd0b0au.eus.grafana.azure.com/d/0t8Pbr5Vk/health-indicator-service?orgId=1&var-alias=is&var-environment=INT&var-scaleunit=INT01&var-serviceType=Enterprise)
   - [IntuneGeoSync Dashboard (Geneva)](https://portal.microsoftgeneva.com/dashboard/CloudPCCore/Services/IntuneGeoSync)

## Scenario 20: ICM Format
> 来源: ado-wiki-w365-scope-tags-intunegeosync.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Monitor name is in title
2. Useful dashboards are in Discussion part (also related Kusto query)
3. TSG link is in Diagnostics part
4. Impacted environment and scale unit in Impacted Resource part

## Scenario 21: Kusto — ScopeTag Sync Check
> 来源: ado-wiki-w365-scope-tags-intunegeosync.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
//ScopeTag Sync Check
let CheckScopeTags = (CompanyID:string, Day1:timespan, Day2:timespan)
{
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_cloud_environment == "PROD"
| where env_time between (ago(2d)..ago(0d))
| where ComponentName != 'Instrumentation'
| where ComponentName != "MetricsMiddleware"
| where AccountId has CompanyID and Col1 !has "Device not Onboarded"
| where ApplicationName in ("is","cds")
| where ServiceName != "HermesService"
| where (OtherIdentifiers contains "ScopeTag" or Col1 contains "ScopeTag") and OtherIdentifiers !contains "frontLineShared"
| parse kind = regex flags = Ui OtherIdentifiers with * ",\"DeviceId\":\"" IntuneDeviceID '\",' *
| parse kind = regex flags = Ui OtherIdentifiers with * ",\"ScopeTagsToAddPaddedAndSerializedList\":\"" AddedScopeTagID '\",' *
| extend IntuneDeviceID2=strcat("Intune Device ID:", " ", IntuneDeviceID)
| extend AddedScopeTagID2=strcat(",Added Scopetag ID:", " ", AddedScopeTagID)
| extend AddedScopeTagInfo=strcat(iif(isempty(IntuneDeviceID),"",IntuneDeviceID2)," ",iif(isempty(AddedScopeTagID),"",AddedScopeTagID2))
| project env_time, ActivityId, ApplicationName, AddedScopeTagInfo, OtherIdentifiers
| order by env_time desc
};
CheckScopeTags('TENANTID',1h,0h) //Replace TENANTID
```
`[来源: ado-wiki-w365-scope-tags-intunegeosync.md]`

## Scenario 22: Contacts
> 来源: ado-wiki-w365-scope-tags-intunegeosync.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Intune QueryBroker: Anderson Kulandaisamy, Glaeser Chan (under Syam Pinnaka), Himanshi Shrivastava, Divya Patidar (under Kapil Raja Durga)
