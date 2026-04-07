---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/FLS Devices automatically reset/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/FLS%20Devices%20automatically%20reset/Scoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# FLS Devices Automatically Reset - Scoping Questions

## 1. Environment & Configuration

- Is this Cloud PC provisioned as **Windows 365 Frontline Shared mode**?
- Is the issue affecting **all Frontline Shared Cloud PCs** or only specific devices/users?
- Are these Cloud PCs managed through **Microsoft Intune** and **Microsoft Entra ID**?
- Are any **custom provisioning policies, scripts, or postprovisioning tasks** applied to these devices?
- Has **User Experience Sync (UES)** been enabled for this Frontline policy, or is full nonpersistence expected?

_Helps determine baseline eligibility and whether behavior aligns with expected FLS design._

## 2. User Scenario / User Experience

- What is the **exact user expectation** after signout (clean device vs. data persistence)?
- What specific **data, settings, or applications** are users expecting to remain after they sign out?
- Does the issue occur **immediately after signout**, or only after the next user signs in?
- Are users aware that **local files, personalization, and session state do not persist by design**?

_Quickly surfaces expectation mismatch vs. actual product behavior._

## 3. Scope & Impact

- How many users are impacted (single user, group, entire frontline workforce)?
- Is this blocking **core frontline workflows**, or is it primarily a usability/expectation concern?
- Does this impact **production scenarios**, or is it limited to testing/pilot environments?
- Is there a **business-critical dependency** on data persisting between shared sessions?

_Supports severity assessment and prioritization._

## 4. Reproducibility

- Can the issue be **reproduced consistently** using the same signin / signout flow?
- Does the reset occur **after every signout**, or only intermittently?
- Does the behavior reproduce across **multiple Cloud PCs** in the same policy?
- What is the **approximate reset time** observed after signout?

_Determines if this is deterministic design behavior or intermittent anomaly._

## 5. Expected vs. Actual Behavior Validation

- After signout, does the Cloud PC return to a **known-good baseline snapshot**?
- Are **applications and policies restored correctly** after reset?
- Is any **user data unexpectedly persisting**, or is data being removed as designed?
- Is the concern that data **should persist**, or that it **should not but does**?

_Critical for distinguishing configuration issues from correct nonpersistent behavior._

## 6. Recent Changes

- Were there any **recent changes** to provisioning policies, licensing, or Frontline assignments?
- Was this behavior observed **since first deployment**, or did it start recently?
- Have there been any **recent Intune, Entra, or Windows image updates**?

_Helps identify regressions vs. longstanding design behavior._

## 7. Logs, Evidence & Technical Data

- Do you see any **reset-related events** around user signout in device or Intune logs?
- Can you capture **timestamps** for signout, reset start, and next signin?
- Are there screenshots or recordings showing **before signout vs. after reset state**?
- Are there any **errors or failures** during the reset process?

_Supports escalation readiness if behavior deviates from expected design._

## 8. Workarounds / Mitigations

- Have users been advised to store data in **OneDrive, SharePoint, or other cloud storage**?
- Would enabling **User Experience Sync (UES)** meet the business requirement for persistence?
- Is there a need to reassess whether **Frontline Shared** is the correct deployment model for this use case?

_Keeps cases moving forward even when behavior is by design._

## 9. Product vs. Configuration Validation (Key CSS Pivot)

- Based on expectations, is the customer seeking **nonpersistent behavior**, or actual persistence?
- Is the reported issue aligned with the **documented design of True NonPersistence FLS**?
- Is this best addressed through **education/documentation**, **configuration change**, or **product escalation**?

_Drives fast decision-making and correct routing._
