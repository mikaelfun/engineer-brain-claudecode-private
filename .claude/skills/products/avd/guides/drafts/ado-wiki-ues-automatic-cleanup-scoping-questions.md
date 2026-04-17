---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/UES Automatic Cleanup/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FUES%20Automatic%20Cleanup%2FScoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# UES Automatic Cleanup - Scoping Questions

## Environment and Configuration
- Is this environment using Windows 365 with User Experience Sync (UES / Cloud Profiles)?
- Which policy is the affected user assigned to?
- Is Automatic Cleanup enabled or disabled in the policy?
- What is the cleanup threshold (days) configured for unattached user storage?
- Is the policy configured to always run cleanup, or only when storage usage meets/exceeds quota?

## User Scenario / UX
- What exactly did the user notice (missing files, settings reset, new profile)?
- Did the user recently sign in to a different Cloud PC or get reprovisioned?

## Scope and Impact
- How many users are impacted (single user, multiple users, or entire policy)?
- Is the impact blocking user productivity, or limited to profile data loss?

## Reproducibility and Timing
- When was the last time the user profile worked as expected?
- Do you know when the cleanup ran relative to the users last sign-in?

## Recent Changes
- Were there any recent changes to storage quota, cleanup threshold, or cleanup mode?
- Was the user recently deleted/recreated, unassigned/reassigned, or moved between policies?

## Known Behavior vs Issue Validation
- Was the cleanup behavior expected based on current policy configuration?
- Is there any indication the cleanup ran while it should have been disabled?

## Workarounds
- Has cleanup been temporarily disabled to prevent further impact?
- Can the user be reassigned to a policy with cleanup turned off for validation?
