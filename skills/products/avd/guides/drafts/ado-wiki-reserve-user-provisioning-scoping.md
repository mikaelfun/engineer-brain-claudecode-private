---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Reserve - User Provisioning/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Reserve%20-%20User%20Provisioning/Scoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Reserve - User Provisioning Scoping Questions

## 1. Environment & Configuration

These questions establish whether the environment meets **baseline requirements** and help identify misconfiguration early.

- Is this **Windows 365 Reserve** (Project Apex) or another Windows 365 edition (Enterprise / Frontline)?
- Has a **Reserve provisioning policy** already been created and assigned in Intune?
- How long ago was the user added to the **Reserve provisioning policy group**?
- Is **user self-provisioning** explicitly enabled in **Windows App settings** via Intune?
- Are the affected users assigned a **valid Windows 365 Reserve license**?
- Which **geography** is configured in the Reserve provisioning policy?
- Is this tenant currently in **Preview or GA** for Reserve user provisioning?

## 2. User Scenario / UX Flow

These questions clarify **where in the experience the issue occurs**.

- What exactly is the user trying to do when the issue happens?
  - Provision a new Cloud PC
  - Retry after a failed provisioning
  - Access an already provisioned Reserve Cloud PC
- Is the **Provision Cloud PC** option visible in the Windows App?
- On which platform is the user using the Windows App? (Windows / macOS / iOS / Web)
- Does the issue occur **before**, **during**, or **after** provisioning is initiated?
- Is the user seeing an **error message**, a silent failure, or no option at all?

## 3. Scope & Impact

- How many users are affected? (Single / Multiple / All users in the policy group)
- Is this blocking the user from **working entirely**, or is there an alternative device available?
- Is this impacting **business continuity scenarios** (lost device, hardware failure)?
- Are users unable to provision **at all**, or only experiencing delays?

## 4. Reproducibility & Pattern

- Does the issue reproduce consistently for the same user?
- Does it reproduce for **different users** with the same policy?
- Have any users successfully provisioned Reserve Cloud PCs in this tenant?
- Does the behavior differ based on **client platform** (e.g., Windows vs iOS)?

## 5. Recent Changes

- Were any recent changes made to: Intune policies, Windows App settings, User group membership, Licensing assignments?
- Were users **recently added or removed** from the Reserve policy group?
- Has the customer recently moved from **Preview to GA**, or vice versa?
- Were there any recent tenant-wide changes or incidents?

## 6. Logs, Evidence & Technical Data

- What **error message or notification**, if any, is shown in the Windows App?
- What is the **Windows App version** installed on the client?
- Has the user attempted provisioning from **another device or platform**?
- Are there any **Intune provisioning errors** or status messages visible?
- Has the user received any **Reserve notification emails** (failure, expiration, retry)?

## 7. Workarounds / Mitigations

- Has the user attempted to **sign out and sign back in** to the Windows App?
- Has the user retried provisioning after waiting some time?
- Can IT temporarily provision access using **standard Windows 365** instead of Reserve?
- Is there a secondary device available to reduce immediate impact?

## 8. Decision Check (CSS Internal Use)

- Configuration issue → Guide customer to correct Intune / policy setup
- Known limitation → Set expectations and share documented behavior
- Known issue → Validate against existing TSG / known issues
- Potential bug → Escalate with evidence and repro details
