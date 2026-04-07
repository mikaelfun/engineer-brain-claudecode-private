---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/W365 Monitoring (Radar)/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FW365%20Monitoring%20(Radar)%2FScoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# W365 Monitoring (Radar) - Scoping Questions

## 1. Environment & Configuration

Purpose: Quickly understand the customer setup and rule out unsupported or misconfigured environments.

- Which **Windows 365 service** is affected (Enterprise, Business, Government)?
- What **Cloud PC OS version and build** is impacted?
- Is the Cloud PC **Azure AD joined or Hybrid joined**?
- Is **Intune / MDM** managing the Cloud PC? If yes, which **key policies** apply?
- What **network path** is used by the end user (corporate network, VPN, home network)?
- Are any **conditional access policies** applied to Cloud PC access?
- Is this a **single Cloud PC** or **multiple Cloud PCs** across users/regions?
- Has **Windows 365 monitoring (Radar)** been reviewed? If yes, what signals or alerts are observed?

## 2. User Scenario / UX Experience

Purpose: Clearly understand what the user sees and when the experience breaks.

- What is the **exact user action** when the issue occurs?
- At which stage: provisioning / sign-in / session launch / in-session / disconnect-reconnect?
- Is the issue **blocking access**, **degrading performance**, or **cosmetic/UX-related**?
- What **error message or behavior** does the user experience?
- Does the issue occur **immediately** or **after some time in session**?
- Is this impacting **keyboard, mouse, display, audio, Teams, or app behavior**?

## 3. Scope & Impact Assessment

- How many **users are affected**?
- Are all affected users in the **same tenant, region, or policy group**?
- Is this impacting **production users** or test users only?
- When did the issue **first start occurring**?
- Is the issue **ongoing**, **intermittent**, or **one-time**?
- Is there a **business-critical impact**?

## 4. Reproducibility

- Can the issue be **reproduced consistently**?
- Does it reproduce on another Cloud PC / another user / another network?
- Does the issue occur after a **specific action or workflow**?
- Does restarting the Cloud PC **temporarily resolve** the issue?

## 5. Recent Changes

- Were there any **recent changes** before the issue started?
  - Intune policy updates / Networking changes / Identity-CA changes / Windows updates
- Was the Cloud PC **recently reprovisioned or resized**?
- Have any **preview features** been enabled recently?

## 6. Monitoring, Logs & Technical Evidence

- Have you reviewed **Windows 365 monitoring (Radar)** for affected users?
- Are there **alerts, degraded signals, or health indicators** visible?
- Can you provide: Cloud PC name(s), affected user UPN(s), approximate **timestamp** of failure?
- Are there relevant **event logs** or **client-side error details**?
- Is the issue reflected in **service health** or **admin center insights**?

## 7. Workarounds & Mitigations

- Has any **temporary workaround** been tried? (Cloud PC restart / User reconnect / Policy rollback)
- Does the issue stop occurring after a **specific mitigation**?
- Is the customer **open to temporary mitigations** if needed?

## 8. Validation: Product Issue vs Configuration

- Does the issue reproduce in a **clean / known-good configuration**?
- Does it affect **multiple tenants** or only this one?
- Is the behavior **expected per current design/limitations**?
- Evidence pointing to: Misconfiguration / Known limitation / Service degradation / Product bug?

## 9. Best Practices to Reinforce

- Confirm monitoring (Radar) is **actively reviewed**
- Validate **change management** for Intune / CA updates
- Ensure **supported network paths** are used
- Avoid enabling **preview features** in production unintentionally
