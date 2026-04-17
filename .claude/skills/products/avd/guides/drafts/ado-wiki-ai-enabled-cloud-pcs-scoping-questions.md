---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Settings Framework/AI-enabled Cloud PCs/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Settings%20Framework/AI-enabled%20Cloud%20PCs/Scoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AI-enabled Cloud PCs — Scoping Questions

## 1. Environment & Configuration
- Is the affected device a **Windows 365 Enterprise Cloud PC**? What SKU is assigned?
- What are the **vCPU, RAM, and disk** specs of the Cloud PC?
- Which **Azure region** is the Cloud PC deployed in?
- What is the **OS version and build** currently installed on the Cloud PC?
- Is the Cloud PC enrolled in the **Windows Insider Program**? If yes, which channel?
- Has **AI-enablement** been explicitly assigned to this Cloud PC via Intune?
- How long ago was AI-enablement assigned?
- Has the Cloud PC been **fully updated and restarted multiple times** since enablement?
- Are there any **custom images, security baselines, or hardening policies** applied?

**TSG direction**: Validate Cloud PC eligibility (SKU, region, OS build). Confirm Insider enrollment and AI-enablement assignment. Check post-enablement update and reboot completion.

## 2. User Scenario / UX
- Which AI feature is not working as expected? (Semantic File Search, Federated Search, Click to Do, or multiple)
- What **exact action** is the user trying to perform?
- Where is the issue observed (Taskbar Search, File Explorer, on-screen selection, etc.)?
- What is the **expected behavior vs. actual behavior**?
- Does the issue happen immediately after sign-in or only after some usage time?
- Are any **UI indicators missing** (e.g., search sparkles or Click to Do highlights)?

**TSG direction**: Map issue to feature-specific UX path. Validate feature visibility and activation indicators.

## 3. Scope & Impact
- How many users or Cloud PCs are affected?
- Is the issue limited to **specific users, groups, or regions**?
- Is this blocking core productivity or just a specific workflow?
- Are users able to continue working using **non-AI alternatives**?
- Is this a **new issue** or something that never worked since onboarding?

**TSG direction**: Determine severity and business impact. Decide between individual remediation vs. broader tenant investigation.

## 4. Reproducibility
- Can the issue be reproduced **every time**, or is it intermittent?
- Does it reproduce after a **Cloud PC reboot**?
- Does it reproduce in a **different Cloud PC** with similar configuration?
- Can the issue be reproduced using a **test file or simple scenario**?
- Does it reproduce when signed in with a **different user account**?

**TSG direction**: Isolate user vs. device vs. service behavior. Validate consistency to rule out transient states.

## 5. Recent Changes
- Were there any **recent Windows Updates or Insider builds** installed?
- Were any **Intune policies or Cloud PC settings** modified recently?
- Was AI-enablement **recently enabled, disabled, or reassigned**?
- Were there changes to **OneDrive, SharePoint, or indexing settings**?
- Has nested virtualization or any virtualization feature been enabled?

**TSG direction**: Correlate issue start with configuration or OS changes. Validate known limitations tied to recent updates.

## 6. Logs, Evidence & Technical Data
- Are there any **errors or warnings** observed in the user experience?
- Can we confirm whether **Hybrid Compute Framework (HCF)** is present?
- Are AI model packages fully downloaded on the Cloud PC?
- Is semantic indexing data present on the device?
- Can ETL traces be collected while reproducing the issue?
- Are screenshots or short recordings available showing the behavior?

**TSG direction**: Validate backend readiness (HCF, model packages, indexing). Collect diagnostics for deeper investigation if needed.

## 7. Workarounds / Mitigations
- Does a **Cloud PC restart** temporarily resolve the issue?
- Does the feature work after **additional Windows Updates** are applied?
- Does disabling and re-enabling AI-enablement help?
- Can the user complete the task using **traditional Windows Search**?
- Has turning off **nested virtualization** been tested (if applicable)?

**TSG direction**: Apply known mitigations to restore functionality. Determine if issue aligns with preview-stage limitations.

## 8. Validation & Next Steps
- Has AI-enabled status been validated in **Intune, Windows App, or Taskbar UI**?
- How long has it been since AI-enablement was assigned?
- Is the customer aware this feature is currently **in preview**?
- Is the customer expecting **production-grade stability** at this stage?
- Are they willing to test in a **controlled or secondary Cloud PC**?

**TSG direction**: Set correct expectations for preview behavior. Decide between configuration fix, known issue, or product escalation.
