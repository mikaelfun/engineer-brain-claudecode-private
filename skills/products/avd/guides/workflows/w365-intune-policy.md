# AVD W365 Intune 策略 — 排查工作流

**来源草稿**: ado-wiki-b-issues-routing-and-escalation-guide.md, ado-wiki-settings-framework-faq.md, ado-wiki-settings-framework-troubleshooting.md, ado-wiki-ues-automatic-cleanup-faq.md, ado-wiki-ues-automatic-cleanup-scoping-questions.md, ado-wiki-ues-automatic-cleanup-setup-guide.md, ado-wiki-ues-disks-auto-expand-faq.md, ado-wiki-ues-disks-expand-scoping-questions.md, ado-wiki-ues-disks-expand-setup-guide.md, ado-wiki-user-experience-sync-faq.md
**Kusto 引用**: (无)
**场景数**: 38
**生成日期**: 2026-04-07

---

## Scenario 1: AVD Sub-Issue Routing and Escalation Guide
> 来源: ado-wiki-b-issues-routing-and-escalation-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

## Scenario 2: Issue Routing Matrix
> 来源: ado-wiki-b-issues-routing-and-escalation-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Scenario | Supported By |
|--|--|
| ARM Template issues | We use the same ARM template as AIB. AVD engineer will investigate first and if hits roadblock can send collab to AIB. SAP: `Azure\Azure VM Image Builder\Image Template Submission failure` |
| Managed Identity issues | AVD engineer will investigate first to confirm customer is following our doc correctly to create managed identity. If hits roadblock can send collab to AAD. SAP: `Azure\Managed Identities for Azure Resources\User Assigned Managed Identity\Problem with user-assigned managed identity` |
| AIB (Azure Image Builder) platform and service issues | AIB team. SAP: `Azure\Azure VM Image Builder\Image Builder failure` |
| AVD Built-in script issues | AVD engineer will review packer logs. If hits roadblock will create ICM. |
| Custom script issues | AVD cannot support scripts created or modified by customers. Support is best effort for any/all custom scripts. If the customer asks for help with custom script refer them to [Help! My Powershell script isn't working!](https://techcommunity.microsoft.com/t5/ask-the-performance-team/help-my-powershell-script-isn-t-working-can-you-fix-it/ba-p/755797). Also see internal article: Policy: Custom Code and Scripts. |

## Scenario 3: MsrdcwForwarder Error Notes (In-Development)
> 来源: ado-wiki-b-issues-routing-and-escalation-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Error observed: MsrdcwForwarder fails with `0x80190194` (HTTP 404 / Not Found)
```
[1]1B2C.0450::08/19/22-12:27:31 [MSRDCForwarder_WILFailure] ErrorCode=0x80190194
BG_E_HTTP_ERROR_404 / HTTP_E_STATUS_NOT_FOUND — Not found (404).
```
> Note: Investigation pending — "need to understand what possible errors may see and solutions"

## Scenario 4: AVD Client Trace Notes (In-Development)
> 来源: ado-wiki-b-issues-routing-and-escalation-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - MSI client and Store client both write traces to the same location with the same naming scheme — cannot distinguish between them
   - `msrdcforwarder` may not log events on every client launch (new trace file created each time but may be empty)

## Scenario 5: Settings Categories
> 来源: ado-wiki-settings-framework-faq.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Settings are split into three categories with distinct delivery paths:
| Category | Delivery Path |
|----------|---------------|
| Cloud PC configurations | Enforced during lifecycle management |
| Windows App settings | Enforced at the app layer post-provisioning |
| Remote connection experience | Applied dynamically at session start |

## Scenario 6: CPCD and Kusto
> 来源: ado-wiki-settings-framework-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Monitor Settings Framework changes in **CPCD > Settings** or using Kusto.

## Scenario 7: Query 1: Settings Profile Ingested (Daily)
> 来源: ado-wiki-settings-framework-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Shows daily ingestion of all Settings profiles. Data ingestion can take up to 24 hours.
```kql
let TenantID = ''; // Enter TenantID
fn_GetSettingProfileEntity
| where ChangeType == "Update"
| where TenantId == TenantID
| extend SettingsArray = parse_json(Settings)
| mv-expand Setting = SettingsArray
| extend 
    SettingDefinitionId = tostring(Setting.SettingDefinitionId),
    Value = tostring(Setting.Value),
    SettingProfileID = tostring(Setting.ProfileId),
    Priority = toint(Setting.Priority)
| extend SettingDefinitionId = extract(@"[^.]+\.[^.]+\.(.+)", 1, SettingDefinitionId)
| project IngestionTimeStamp = DPUData__IngestedTimestamp, TenantId, ChangeType, Priority, SettingProfileID, TemplateId, SettingDefinitionId, Value
```
`[来源: ado-wiki-settings-framework-troubleshooting.md]`

## Scenario 8: Query 2: Settings Profile Changes (30 days)
> 来源: ado-wiki-settings-framework-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Tracks all changes to Setting profiles. Shows profiles with multiple settings and groups.
```kql
let TenantID = '';
let cluster = cluster("https://cloudpc.eastus2.kusto.windows.net").database("CloudPC").CloudPCEvent
| union (cluster("https://cloudpcneu.northeurope.kusto.windows.net").database("CloudPCProd").CloudPCEvent);
cluster
| where AccountId == TenantID
| where ApplicationName == "wset"
| where env_cloud_environment == "PROD"
| where Col1 contains "Created SettingProfileEntity:" or Col1 contains "Updated SettingProfileEntity:"
| extend JsonData = parse_json(extract(@"(?:Created|Updated) SettingProfileEntity: (.+)$", 1, Col1))
| extend profile_id = tostring(JsonData.id), profile_templateId = tostring(JsonData.templateId), Priority = toint(JsonData.priorityMetaData.Priority)
```
`[来源: ado-wiki-settings-framework-troubleshooting.md]`

## Scenario 9: Specific Setting Troubleshooting Links
> 来源: ado-wiki-settings-framework-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Cloud PC configurations**: AI-enabled Cloud PCs
   - **Windows App Settings**: (WIP)
   - **Remote Connection Experience**: (WIP)
   - **User settings (legacy)**: User Settings policy

## Scenario 10: Q1. What happens to the user after cleanup?
> 来源: ado-wiki-ues-automatic-cleanup-faq.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Their profile is deleted.
   - User experience resets to a new profile.

## Scenario 11: Q2. Can admins see which users were deleted?
> 来源: ado-wiki-ues-automatic-cleanup-faq.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - PM indicated future visibility via:
   - Admin reporting
   - Backend telemetry
   - CSS may rely on backend queries for investigation.

## Scenario 12: Q3. What if cleanup runs but some storage remains?
> 来源: ado-wiki-ues-automatic-cleanup-faq.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - If quota is still exceeded:
   - Forced cleanup logic applies after 7 days.
   - Admin intervention may still be required.

## Scenario 13: Environment and Configuration
> 来源: ado-wiki-ues-automatic-cleanup-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Is this environment using Windows 365 with User Experience Sync (UES / Cloud Profiles)?
   - Which policy is the affected user assigned to?
   - Is Automatic Cleanup enabled or disabled in the policy?
   - What is the cleanup threshold (days) configured for unattached user storage?
   - Is the policy configured to always run cleanup, or only when storage usage meets/exceeds quota?

## Scenario 14: User Scenario / UX
> 来源: ado-wiki-ues-automatic-cleanup-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - What exactly did the user notice (missing files, settings reset, new profile)?
   - Did the user recently sign in to a different Cloud PC or get reprovisioned?

## Scenario 15: Scope and Impact
> 来源: ado-wiki-ues-automatic-cleanup-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - How many users are impacted (single user, multiple users, or entire policy)?
   - Is the impact blocking user productivity, or limited to profile data loss?

## Scenario 16: Reproducibility and Timing
> 来源: ado-wiki-ues-automatic-cleanup-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - When was the last time the user profile worked as expected?
   - Do you know when the cleanup ran relative to the users last sign-in?

## Scenario 17: Recent Changes
> 来源: ado-wiki-ues-automatic-cleanup-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Were there any recent changes to storage quota, cleanup threshold, or cleanup mode?
   - Was the user recently deleted/recreated, unassigned/reassigned, or moved between policies?

## Scenario 18: Known Behavior vs Issue Validation
> 来源: ado-wiki-ues-automatic-cleanup-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Was the cleanup behavior expected based on current policy configuration?
   - Is there any indication the cleanup ran while it should have been disabled?

## Scenario 19: Workarounds
> 来源: ado-wiki-ues-automatic-cleanup-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Has cleanup been temporarily disabled to prevent further impact?
   - Can the user be reassigned to a policy with cleanup turned off for validation?

## Scenario 20: Step 1: Access policy storage settings
> 来源: ado-wiki-ues-automatic-cleanup-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Navigate to the User Storage Control Center, open the target policy, select Settings

## Scenario 21: Step 2: Configure cleanup behavior
> 来源: ado-wiki-ues-automatic-cleanup-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Set the inactivity threshold (X days)
   - Optionally enable Only delete when at or exceeding policy limit

## Scenario 22: Step 3: Enable automatic cleanup
> 来源: ado-wiki-ues-automatic-cleanup-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Toggle Automatic Cleanup to ON
   - Review and accept the permanent deletion consent dialog

## Scenario 23: Step 4: Save configuration
> 来源: ado-wiki-ues-automatic-cleanup-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Confirm settings are saved
   - Verify indicator reflects cleanup status as enabled

## Scenario 24: Key Notes
> 来源: ado-wiki-ues-automatic-cleanup-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Cleanup runs every 24 hours, only unattached storage is deleted
   - Forced deletion still occurs after exceeded tolerance period

## Scenario 25: Q1. When does disk expansion occur?
> 来源: ado-wiki-ues-disks-auto-expand-faq.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Real-time during active user sessions, triggered when storage reaches a defined threshold.

## Scenario 26: 1. Environment & Configuration
> 来源: ado-wiki-ues-disks-expand-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Is this issue occurring in an environment using **Cloud Profiles with User Experience Sync (UES)**?
   - Is **automatic storage expansion** enabled, or is the profile configured for **fixed-size storage**?
   - What is the **maximum storage size** configured for the affected users?
   - Are these users newly provisioned, or do they have **existing profile disks**?
   - Is the tenant currently **near or exceeding its storage quota**?
   - Has the storage configuration been recently changed (auto → fixed or fixed → auto)?
   - Are all affected users assigned to the **same policy or collection**?

## Scenario 27: 2. User Scenario / UX
> 来源: ado-wiki-ues-disks-expand-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - What is the **user experience** when the issue occurs (e.g., storage full errors, app failures, profile load issues)?
   - Is the issue visible to the end user, or only detected by IT/admins?
   - Does the user experience any **session interruption** during the time storage should expand?
   - Are specific apps or workloads triggering the issue (e.g., large downloads, OneDrive sync, app installs)?

## Scenario 28: 3. Scope & Impact
> 来源: ado-wiki-ues-disks-expand-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - How many users are affected — **single user, subset, or all users** under the same policy?
   - Is this impacting **production users** or a test/pilot group?
   - Are users completely blocked from working, or is the impact **intermittent or degraded**?
   - Does the issue affect **new users only**, **existing users only**, or both?

## Scenario 29: 4. Reproducibility
> 来源: ado-wiki-ues-disks-expand-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Can the issue be **reproduced consistently** by filling the profile disk?
   - Does the behavior occur every time the disk reaches a high usage level?
   - Does the issue reproduce across **different users or sessions**, or only a specific profile?
   - Has this behavior ever worked correctly in the past?

## Scenario 30: 5. Recent Changes
> 来源: ado-wiki-ues-disks-expand-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Were there any **recent changes** to:
   - UES policies
   - Storage settings
   - User assignments
   - Tenant storage quotas
   - Were there any **service updates, rollouts, or maintenance events** around the time the issue started?
   - Did the issue start immediately after a configuration change, or some time later?

## Scenario 31: 6. Logs, Evidence & Technical Data
> 来源: ado-wiki-ues-disks-expand-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - What is the **current provisioned disk size** and **used space** for an affected user?
   - Do logs show any **disk expansion attempts or failures**?
   - Are there any **warnings or errors** related to storage, profiles, or the Cloud Profile Agent?
   - Are expansion events visible for **other users** in the same policy?
   - Can you share timestamps when the disk reached high usage and what happened next?

## Scenario 32: 7. Differentiating Configuration vs. Product Issue
> 来源: ado-wiki-ues-disks-expand-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Is the configured **maximum disk size already reached**?
   - Is automatic expansion working for **some users but not others**?
   - Does switching a test user to a **different policy** change the behavior?
   - Does the issue persist after **reapplying the policy or metadata settings**?
   - Are users with **fixed-size storage** experiencing the same behavior?

## Scenario 33: 8. Workarounds / Mitigations
> 来源: ado-wiki-ues-disks-expand-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Have you attempted to **increase the maximum storage size** temporarily?
   - Have you tested with a **new user profile** to compare behavior?
   - Can affected users free up disk space as a temporary workaround?
   - Have you tried moving a user to a **known-good policy** to restore service?
   - Is there an acceptable **temporary mitigation** to reduce user impact while investigating?

## Scenario 34: 9. CSS Next-Step Validation
> 来源: ado-wiki-ues-disks-expand-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Based on current findings, does this appear to be:
   - Expected product behavior
   - Policy or configuration issue
   - Service-side limitation
   - Potential product bug
   - What data do we already have to support escalation, if needed?
   - What additional evidence is required before engaging engineering?

## Scenario 35: Setup Steps
> 来源: ado-wiki-ues-disks-expand-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Admin creates or edits a UES-enabled policy
2. Enable User Experience Sync
3. Select user storage type:
   - **Automatic storage expansion** (recommended)
   - Fixed-size storage
4. If automatic expansion is selected:
   - Verify maximum size is configured (default 64 GB)
5. Save the configuration

## Scenario 36: What CSS Should Verify
> 来源: ado-wiki-ues-disks-expand-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Policy is successfully applied to users
   - User storage type reflects expected configuration in User Storage (PAMO view)
   - Initial disk size starts at 4 GB for new users

## Scenario 37: What "Good" Looks Like
> 来源: ado-wiki-ues-disks-expand-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - User disk grows automatically as usage increases
   - No user-facing prompts or session interruptions occur during expansion

## Scenario 38: User Experience Sync FAQ
> 来源: ado-wiki-user-experience-sync-faq.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Question | Answer |
|----------|--------|
| 1. What User data is persisted with this feature? | UES redirects the entire user profile including files and folders under C:\Users\%username% which importantly, also includes a user's NTUser.dat file. The solution also applies default exclusions for Microsoft products to improve the user's experience. |
| 2. Is it possible for IT admins to apply custom inclusions or exclusions? | We are evaluating requirements for custom inclusions and exclusions for future releases. |
| 3. What distinguishes UES from FSLogix? | FSLogix requires the customer to set up, manage, and configure storage and other settings that control its operation. It also depends on SMB storage for user profiles, which necessitates legacy NTFS and Kerberos authentication. |
