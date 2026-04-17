---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Frontline/Frontline Shared/Windows 365 Cloud Apps/Support Boundaries"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Frontline/Frontline%20Shared/Windows%20365%20Cloud%20Apps/Support%20Boundaries"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Support Boundaries - Windows 365 Cloud Apps

## 1. Environment & Configuration

**Goal:** Establish whether the environment meets Cloud Apps prerequisites and supported configurations.
- Which **Windows 365 license** is assigned to the affected users?
- Are Cloud Apps being accessed from: Windows 11 physical device, Windows 365 Cloud PC, or AVD session host?
- What is the **OS version and build** of the local device? (Winver output)
- Is the **Windows App** or **Windows 365 App** being used? Confirm the **app version**.
- Are users **Entra ID joined, Hybrid-joined, or Azure AD registered**?
- Is **Intune MDM** managing the device? Is the device **successfully enrolled and compliant**?
- Are **FSLogix**, **App Attach**, or **MSIX App Attach** involved?
- Are any **Conditional Access policies** applied to Cloud Apps or Windows 365 access?

## 2. User Scenario / UX Flow

**Goal:** Understand exactly what the user is doing and where the UX breaks.
- How is the user launching the Cloud App? (Windows App UI / Start menu / File-path association / Deep link / URI)
- What is the **expected behavior** vs **actual behavior**?
- At what point does the issue occur? (App discovery / Launch / Authentication / App opens but fails)
- Is the issue happening **before or after sign-in**?
- Does the Cloud App open in a **new window, existing session, or fail silently**?
- Are users receiving **any UI error, toast notification, or dialog**?

## 3. Scope & Impact

**Goal:** Assess severity and prioritize correctly.
- How many users are affected? (Single / Multiple / Entire tenant)
- Are all Cloud Apps impacted or **only a specific app**?
- Is this blocking **production work** or considered a **degradation**?
- When did the issue first start?
- Is this impacting **newly provisioned users**, existing users, or both?

## 4. Reproducibility

**Goal:** Determine consistency and isolate variables.
- Is the issue **100% reproducible** or intermittent?
- Can it be reproduced on another user / device / network?
- Does the issue reproduce after sign-out/sign-in, app restart, device reboot?
- Does the issue occur when launching the app **outside of Cloud Apps**?

## 5. Recent Changes

**Goal:** Identify triggers.
- Were there any **recent changes** before the issue started? (Intune policy / App / Windows updates / License changes)
- Were any **new Cloud Apps** recently added or modified?
- Was the device **recently enrolled**, reprovisioned, or reset?
- Were any **security or Conditional Access policies** updated?

## 6. Policies, Features & Limits Validation

**Goal:** Differentiate supported behavior vs. limitation.
- Is the Cloud App listed as **supported** for this scenario?
- Is this app supported with Intune Autopilot, DPP/FLS, file-path launch?
- Are any **known limitations** documented for this app type?
- Is the app expected to support **multi-instance, file associations, or deep links**?
- Are users exceeding any **documented limits** (sessions, concurrency, profile size)?

## 7. Logs, Evidence & Technical Data

**Goal:** Enable fast escalation or root cause.
- Collect: Windows App logs, Event Viewer logs (Application / Microsoft / Windows 365 / AAD)
- Check for **sign-in failures** in Entra ID sign-in logs
- Check for **Intune errors** related to app deployment or compliance
- Look for **error codes or correlation IDs**
- Request **screen recording** showing the issue end-to-end

## 8. Workarounds & Mitigations

- Does the app work when launched outside Cloud Apps, on another device, or without file-path association?
- Does reinstalling or updating the app change the behavior?
- Does temporarily excluding the device from specific policies help?
- Test access using a **test user with minimal policies**

## 9. Support Boundaries & Next Steps (Internal CSS)

**Goal:** Decide ownership and collaboration.
- Does this issue point to: Windows 365 service / Windows App client / Intune/Autopilot / Entra ID/Authentication?
- Is there evidence of a **product bug** vs. misconfiguration?
- Do logs indicate a need to engage: Windows 365 Engineering / Intune / Identity (AAD) / App owner/ISV?
