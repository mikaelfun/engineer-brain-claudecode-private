---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/UES Disks automatically expand/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FUES%20Disks%20automatically%20expand%2FScoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# UES Disks Automatically Expand - Scoping Questions

## 1. Environment & Configuration

- Is this issue occurring in an environment using **Cloud Profiles with User Experience Sync (UES)**?
- Is **automatic storage expansion** enabled, or is the profile configured for **fixed-size storage**?
- What is the **maximum storage size** configured for the affected users?
- Are these users newly provisioned, or do they have **existing profile disks**?
- Is the tenant currently **near or exceeding its storage quota**?
- Has the storage configuration been recently changed (auto → fixed or fixed → auto)?
- Are all affected users assigned to the **same policy or collection**?

## 2. User Scenario / UX

- What is the **user experience** when the issue occurs (e.g., storage full errors, app failures, profile load issues)?
- Is the issue visible to the end user, or only detected by IT/admins?
- Does the user experience any **session interruption** during the time storage should expand?
- Are specific apps or workloads triggering the issue (e.g., large downloads, OneDrive sync, app installs)?

## 3. Scope & Impact

- How many users are affected — **single user, subset, or all users** under the same policy?
- Is this impacting **production users** or a test/pilot group?
- Are users completely blocked from working, or is the impact **intermittent or degraded**?
- Does the issue affect **new users only**, **existing users only**, or both?

## 4. Reproducibility

- Can the issue be **reproduced consistently** by filling the profile disk?
- Does the behavior occur every time the disk reaches a high usage level?
- Does the issue reproduce across **different users or sessions**, or only a specific profile?
- Has this behavior ever worked correctly in the past?

## 5. Recent Changes

- Were there any **recent changes** to:
  - UES policies
  - Storage settings
  - User assignments
  - Tenant storage quotas
- Were there any **service updates, rollouts, or maintenance events** around the time the issue started?
- Did the issue start immediately after a configuration change, or some time later?

## 6. Logs, Evidence & Technical Data

- What is the **current provisioned disk size** and **used space** for an affected user?
- Do logs show any **disk expansion attempts or failures**?
- Are there any **warnings or errors** related to storage, profiles, or the Cloud Profile Agent?
- Are expansion events visible for **other users** in the same policy?
- Can you share timestamps when the disk reached high usage and what happened next?

## 7. Differentiating Configuration vs. Product Issue

- Is the configured **maximum disk size already reached**?
- Is automatic expansion working for **some users but not others**?
- Does switching a test user to a **different policy** change the behavior?
- Does the issue persist after **reapplying the policy or metadata settings**?
- Are users with **fixed-size storage** experiencing the same behavior?

## 8. Workarounds / Mitigations

- Have you attempted to **increase the maximum storage size** temporarily?
- Have you tested with a **new user profile** to compare behavior?
- Can affected users free up disk space as a temporary workaround?
- Have you tried moving a user to a **known-good policy** to restore service?
- Is there an acceptable **temporary mitigation** to reduce user impact while investigating?

## 9. CSS Next-Step Validation

- Based on current findings, does this appear to be:
  - Expected product behavior
  - Policy or configuration issue
  - Service-side limitation
  - Potential product bug
- What data do we already have to support escalation, if needed?
- What additional evidence is required before engaging engineering?
