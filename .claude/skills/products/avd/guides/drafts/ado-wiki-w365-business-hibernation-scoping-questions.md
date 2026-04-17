---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/W365 Business Revamp & Hibernation/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FW365%20Business%20Revamp%20%26%20Hibernation%2FScoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scoping Questions - Windows 365 Business Hibernation

## 1. Environment & Configuration

- Is the Cloud PC affected running **Windows 365 Business** (not Enterprise)?
- Is the tenant currently **enrolled in the Windows 365 Business Hibernation Private Preview**?
- How many Windows 365 Business Cloud PCs are provisioned in the tenant?
- Are all affected users licensed with **Windows 365 Business**, or is this limited to specific users?
- How are users connecting to the Cloud PC (browser only, or other clients)?

## 2. User Scenario / Experience (UX)

- What exactly does the user see when reconnecting after inactivity?
- Does the session resume to the previous state, or does the user see a fresh session?
- Is the Cloud PC reachable, but the session content missing?
- Does the issue occur only after idle time, or also after an explicit signout?

## 3. Scope & Impact

- How many users are impacted?
- Is this blocking user productivity, or is it a functional degradation?
- Has this behavior occurred consistently, or only intermittently?

## 4. Reproducibility

- Can the issue be consistently reproduced by leaving the Cloud PC idle for more than **1 hour**?
- Does the behavior reproduce across different users or Cloud PCs?

## 5. Timing & Recent Changes

- When did this behavior first start occurring?
- Was the tenant recently onboarded to the hibernation Private Preview?
- Were any changes made to user access, licensing, or tenant configuration around that time?

## 6. Expected vs Actual Behavior Validation

- After inactivity, does the Cloud PC appear to hibernate as expected?
- On reconnect, is the session supposed to resume with apps and data intact?

## 7. Logs, Evidence & Technical Data

- Can the customer provide timestamps when the Cloud PC was left idle and when reconnection was attempted?
- Are there screenshots or recordings showing the reconnect behavior?

## 8. Workarounds / Mitigations

- Does reconnecting sooner than 1 hour avoid the issue?
- Does signing out and signing back in restore access?
- Does reprovisioning the Cloud PC temporarily resolve the issue?

## 9. Configuration vs Product Issue Differentiation

- Does this behavior affect **only Windows 365 Business** Cloud PCs?
- Are Enterprise Cloud PCs in the same tenant unaffected?

## 10. CSS Triage Decision Support

- Based on behavior, does this look like:
  - Session state not being preserved?
  - Resume not triggering correctly?
  - Cloud PC failing to transition out of hibernation?
- Is escalation required due to loss of session state or inability to resume?
