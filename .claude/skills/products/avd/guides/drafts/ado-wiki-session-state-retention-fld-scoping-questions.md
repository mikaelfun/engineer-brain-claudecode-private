---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Session State Retention FLD/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FSession%20State%20Retention%20FLD%2FScoping%20Questions"
importDate: "2026-04-05"
type: scoping-questions
---

# Session State Retention FLD - Scoping Questions

## 1. Environment & Configuration
- Are the affected users on Windows 365 Frontline Cloud PCs in Dedicated Mode?
- What Windows version and build is running on the Cloud PC? (Confirm Windows 11 24H2 or newer)
- Is the Cloud PC using a Gallery Image, or was a custom image used?
- What is the Cloud PC size (vCPU / RAM / disk)?
- In which Azure region is the Cloud PC deployed?
- Which Windows App client is the user connecting from (Web, Windows, iOS, macOS, Android)?
- Is the Cloud PC associated with a specific provisioning policy targeted for Session State Retention?

## 2. User Scenario / UX
- What is the exact user action when ending the workday (disconnect vs sign-out vs shutdown)?
- What behavior is the user expecting when reconnecting?
- What actually happens when the user reconnects?
- Are applications closed, or does the user get a fresh desktop?
- Does the issue occur after a few hours, overnight, or immediately?
- Does the system time and clock update correctly after reconnection?

## 3. Scope & Impact
- How many users are impacted?
- Are all affected users on the same provisioning policy?
- Is this impacting business-critical workflows?
- When did the issue first start occurring?

## 4. Reproducibility
- Can the issue be reproduced consistently?
- Does it reproduce on every disconnect, or only under certain conditions?
- Does it reproduce across different devices or clients?

## 5. Recent Changes
- Were there any recent changes before the issue started? (OS updates, Policy changes, Provisioning policy changes)
- Have there been any Windows Updates or reboots on the Cloud PC?
- Were any Power Policy settings recently configured or modified?

## 6. Logs & Evidence
- Can you confirm the exact time window when the disconnect and reconnect occurred?
- Can you provide the Cloud PC name, user UPN, tenant ID, and provisioning policy ID?

## 7. Workarounds
- Does reconnecting again restore the session, or does it remain reset?
- Does reconnecting from a different client change the behavior?
- If the user disconnects instead of signing out, does behavior improve?

## 8. Triage Decision Support
- Configuration issue: Requirements or client mismatch
- Known limitation: Preview scope, reboot behavior, unsupported image/size
- Potential product issue: Meets all requirements, consistent repro, no reboot
