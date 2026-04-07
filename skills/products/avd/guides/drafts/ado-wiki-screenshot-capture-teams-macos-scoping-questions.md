---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Screenshot Capture in Microsoft Teams via Windows App on macOS/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Screenshot%20Capture%20in%20Microsoft%20Teams%20via%20Windows%20App%20on%20macOS/Scoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scoping Questions - Screenshot Capture in Teams via Windows App on macOS

## 1. Environment & Configuration
- Which macOS version? What Windows App (Beta) version?
- Beta channel or another release channel?
- All macOS devices or specific ones?
- Connecting to Cloud PC or other remote desktop?

## 2. User Scenario / UX
- What is user trying to capture (Teams chat, meeting, shared content)?
- What happens when selecting Window > Capture Screen?
- Any on-screen confirmation or notification?

## 3. Policies, Controls & Restrictions
- Is Screen Capture Protection enabled on Cloud PC (server/client/both)?
- Are Teams screenshot restrictions enabled in tenant?
- Conditional Access or device compliance policies involved?

## 4. Version & Feature Validation
- Windows App version 2926 confirmed?
- Experimental section enabled? Screen Capture Redirection enabled?
- Has feature ever worked previously?

## 5. Logs & Evidence
- Capture Screen option greyed out or clickable?
- Screenshot file appears in Downloads folder on Cloud PC?
- Is rdpvchost.exe running on Cloud PC?

## 6. CSS Triage Outcome
- Expected behavior/limitation (policy or security restriction)
- Configuration issue (version, Experimental settings, server component)
- Known limitation (clipboard behavior, local macOS restrictions)
- Potential product issue (feature enabled but not functioning)
