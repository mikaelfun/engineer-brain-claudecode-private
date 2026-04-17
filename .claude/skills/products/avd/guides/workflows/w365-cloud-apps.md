# AVD W365 Cloud Apps — 排查工作流

**来源草稿**: ado-wiki-cloud-app-from-file-path-setup.md, ado-wiki-cloud-apps-escalation-paths.md, ado-wiki-cloud-apps-kusto-troubleshooting.md, ado-wiki-cloud-apps-support-boundaries.md, ado-wiki-w365-cloudapps-technical-specs.md
**Kusto 引用**: (无)
**场景数**: 22
**生成日期**: 2026-04-07

---

## Scenario 1: Step-by-step (Admin perspective)
> 来源: ado-wiki-cloud-app-from-file-path-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Navigate to Intune Admin Center > Windows 365 > Cloud Apps
2. Select Add app > From file path
3. Enter required properties:
   - File path
   - App name
   - Display name (must be unique)
   - Icon path and index
4. (Optional) Enter command-line arguments and description
5. Select Add
6. System validates file and icon paths
7. App status transitions to Ready to publish

## Scenario 2: What CSS should verify
> 来源: ado-wiki-cloud-app-from-file-path-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - File path exists on Cloud PC
   - Icon path is valid and renders correctly
   - App status is not stuck in validation

## Scenario 3: What good looks like
> 来源: ado-wiki-cloud-app-from-file-path-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - App appears in Cloud Apps list
   - Status = Ready to publish / Published
   - Icon renders correctly or default icon is shown

## Scenario 4: Support and PG Escalation Routing
> 来源: ado-wiki-cloud-apps-escalation-paths.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **Management** (provisioning policy, reports, portal, publishing) → **W365 first**
2. **Connectivity before first pixels appear** (i.e., the "Show Details" button shows up on the launch) → **W365 first**, but likely something else (AVD) afterwards
3. **After cloud app is launched** → **RAIL (AVD)**

## Scenario 5: Detailed Routing (per SAAF)
> 来源: ado-wiki-cloud-apps-escalation-paths.md | 适用: \u901a\u7528 \u2705

### 排查步骤
For connectivity issues (#2 above):
   - **Device connectivity** → Shih team
   - **Windows App** → Client teams
   - **App connection** → Vivian and AVD team
   - **Network issue** → Rex and Bruce

## Scenario 6: Overview
> 来源: ado-wiki-cloud-apps-kusto-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Use the [CPCD Dashboard](https://aka.ms/cpcd) which contains a dedicated page for Cloud Apps troubleshooting.
**Key principle:** Cloud Apps = Windows 365 Frontline Shared + AVD RAIL
   - Issues with functionality of the Cloud App (e.g., bad rendering) → treat same as RAIL (AVD Remote Apps)
   - Provisioning and connectivity issues → treat same as Windows 365 machine
   - Related TSGs: [Frontline Shared](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/1928053/Frontline-Shared), [AVD RAIL (RemoteApps)](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/823641/RemoteApps)

## Scenario 7: App Discovery & Configuration
> 来源: ado-wiki-cloud-apps-kusto-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **Table 1 (FTE Only):** Shows cloud apps per Tenant with details (requires Reporting Cluster access)
2. **Table 2:** Shows discovered apps when policy was created (data within 30 days). Col1 has information about the discovery flow
3. **Table 3:** Shows discovered app details with focus on app configuration (exe path, name, etc.)

## Scenario 8: Publishing Flow
> 来源: ado-wiki-cloud-apps-kusto-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
4. **Table 4:** When publishing an app, run this first to get the Activity ID
5. **Table 5:** With the Activity ID, check details on the publishing event
6. **Table 6:** Shows extended information about the app publish event in Col1

## Scenario 9: Unpublishing Flow
> 来源: ado-wiki-cloud-apps-kusto-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
7. **Table 7:** Get the Activity ID for the unpublish event
8. **Table 8:** With the Activity ID, check detailed events
9. **Table 9:** Shows full details based on the Cloud App ID

## Scenario 10: Combo Actions (Reset+Publish, Update+Publish)
> 来源: ado-wiki-cloud-apps-kusto-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
10. **Table 10:** Get the Activity ID for combo actions (Update+Publish = editing already published cloud app, e.g., change display name)
11. **Table 11:** Check details for the combo event using the activity ID from step 10
12. **Table 12:** Shows full events for all combo and single actions performed (uses Cloud App ID)

## Scenario 11: Notes
> 来源: ado-wiki-cloud-apps-kusto-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - When doing **Unpublish**, you will see a **Patch event** because the app is also Reset to default state
   - **Combo actions** always show the Reset/Update and the Patch event
   - When checking the combo activity ID, also check the other Activity ID from the Patch event
   - Internal service application names in Kusto columns are NOT Cloud App names - do not confuse

## Scenario 12: 1. Environment & Configuration
> 来源: ado-wiki-cloud-apps-support-boundaries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Goal:** Establish whether the environment meets Cloud Apps prerequisites and supported configurations.
   - Which **Windows 365 license** is assigned to the affected users?
   - Are Cloud Apps being accessed from: Windows 11 physical device, Windows 365 Cloud PC, or AVD session host?
   - What is the **OS version and build** of the local device? (Winver output)
   - Is the **Windows App** or **Windows 365 App** being used? Confirm the **app version**.
   - Are users **Entra ID joined, Hybrid-joined, or Azure AD registered**?
   - Is **Intune MDM** managing the device? Is the device **successfully enrolled and compliant**?
   - Are **FSLogix**, **App Attach**, or **MSIX App Attach** involved?
   - Are any **Conditional Access policies** applied to Cloud Apps or Windows 365 access?

## Scenario 13: 2. User Scenario / UX Flow
> 来源: ado-wiki-cloud-apps-support-boundaries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Goal:** Understand exactly what the user is doing and where the UX breaks.
   - How is the user launching the Cloud App? (Windows App UI / Start menu / File-path association / Deep link / URI)
   - What is the **expected behavior** vs **actual behavior**?
   - At what point does the issue occur? (App discovery / Launch / Authentication / App opens but fails)
   - Is the issue happening **before or after sign-in**?
   - Does the Cloud App open in a **new window, existing session, or fail silently**?
   - Are users receiving **any UI error, toast notification, or dialog**?

## Scenario 14: 3. Scope & Impact
> 来源: ado-wiki-cloud-apps-support-boundaries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Goal:** Assess severity and prioritize correctly.
   - How many users are affected? (Single / Multiple / Entire tenant)
   - Are all Cloud Apps impacted or **only a specific app**?
   - Is this blocking **production work** or considered a **degradation**?
   - When did the issue first start?
   - Is this impacting **newly provisioned users**, existing users, or both?

## Scenario 15: 4. Reproducibility
> 来源: ado-wiki-cloud-apps-support-boundaries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Goal:** Determine consistency and isolate variables.
   - Is the issue **100% reproducible** or intermittent?
   - Can it be reproduced on another user / device / network?
   - Does the issue reproduce after sign-out/sign-in, app restart, device reboot?
   - Does the issue occur when launching the app **outside of Cloud Apps**?

## Scenario 16: 5. Recent Changes
> 来源: ado-wiki-cloud-apps-support-boundaries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Goal:** Identify triggers.
   - Were there any **recent changes** before the issue started? (Intune policy / App / Windows updates / License changes)
   - Were any **new Cloud Apps** recently added or modified?
   - Was the device **recently enrolled**, reprovisioned, or reset?
   - Were any **security or Conditional Access policies** updated?

## Scenario 17: 6. Policies, Features & Limits Validation
> 来源: ado-wiki-cloud-apps-support-boundaries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Goal:** Differentiate supported behavior vs. limitation.
   - Is the Cloud App listed as **supported** for this scenario?
   - Is this app supported with Intune Autopilot, DPP/FLS, file-path launch?
   - Are any **known limitations** documented for this app type?
   - Is the app expected to support **multi-instance, file associations, or deep links**?
   - Are users exceeding any **documented limits** (sessions, concurrency, profile size)?

## Scenario 18: 7. Logs, Evidence & Technical Data
> 来源: ado-wiki-cloud-apps-support-boundaries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Goal:** Enable fast escalation or root cause.
   - Collect: Windows App logs, Event Viewer logs (Application / Microsoft / Windows 365 / AAD)
   - Check for **sign-in failures** in Entra ID sign-in logs
   - Check for **Intune errors** related to app deployment or compliance
   - Look for **error codes or correlation IDs**
   - Request **screen recording** showing the issue end-to-end

## Scenario 19: 8. Workarounds & Mitigations
> 来源: ado-wiki-cloud-apps-support-boundaries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Does the app work when launched outside Cloud Apps, on another device, or without file-path association?
   - Does reinstalling or updating the app change the behavior?
   - Does temporarily excluding the device from specific policies help?
   - Test access using a **test user with minimal policies**

## Scenario 20: 9. Support Boundaries & Next Steps (Internal CSS)
> 来源: ado-wiki-cloud-apps-support-boundaries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Goal:** Decide ownership and collaboration.
   - Does this issue point to: Windows 365 service / Windows App client / Intune/Autopilot / Entra ID/Authentication?
   - Is there evidence of a **product bug** vs. misconfiguration?
   - Do logs indicate a need to engage: Windows 365 Engineering / Intune / Identity (AAD) / App owner/ISV?

## Scenario 21: Windows 365 CloudApps Technical Specs
> 来源: ado-wiki-w365-cloudapps-technical-specs.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**SAAF Only - Engineering Document:**
[CloudApp_Trouble_Shooting | CloudPC](https://eng.ms/docs/experiences-devices/wd-windows/wcx/cloud-pc/cloudpc-service/windows-365-service/serviceteams/tm-vtian/tsg/cloudapp_trouble_shooting)
**Technical overview and configuration steps:**
[Windows 365 Cloud Apps - Overview](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/2115954/Windows-365-Cloud-Apps)

## Scenario 22: Publishing States
> 来源: ado-wiki-w365-cloudapps-technical-specs.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| AppPublishStatus | State |
|---|---|
| 0 | preparing |
| 1 | ready |
| 2 | publishing |
| 3 | published |
| 4 | unpublishing |
| 5 | failed |
| 7 | deleting |
