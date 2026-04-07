---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Processes/Template requesting help on Teams"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Processes/Template%20requesting%20help%20on%20Teams"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Template: Requesting SME Help on Microsoft Teams

## Summary

Standard templates for requesting assistance from SMEs via Microsoft Teams channels and for documenting in DfM case notes.

> ⚠️ **Important:** Be vigilant — do not include any PII in notes posted on Teams.

---

## Teams Channel Template

Paste this in the relevant Teams channel:

```
- **Case number** (Mandatory):
- **Brief description of the issue:**
    Briefly explain what the issue is, indicating platform, number of devices, and a concise description.

- **Additional information:**
  - Expected behavior:
    What troubleshooting steps have you provided to the customer and what were the results?
  - Can you reproduce the issue in your test environment? (If not, why?):
  - What data have you collected and what have you found? (e.g. MDMDiagnostic logs, ODC logs, SDP, Screenshots, browser traces, network traces):
  - Relevant links, KB articles, Teams conversations, bugs researched:
  - What assistance are you requesting? (this is probably the most important thing — be brief and concise!!)
```

---

## DfM Case Notes Template

Save this to your **case notes** in DfM:

```
- **Case number** (Mandatory):

- **Brief description of the issue:**
    Briefly explain what the issue is, indicating platform, number of devices, and a concise description.

- **User and device information:**
  - User ID:
  - User-assigned license:
  - Platforms impacted (Android/iOS/Windows/macOS/Linux):
  - Intune device ID:
  - OS version:
  - Serial number:
  - Enrollment method:

- **App or policy information:**
  - Application Name, Type (appx, msi, Win32, ipa, apk, Store) and Application ID.
  - How is the application deployed (Available/Required, Users/Devices):
  - Policy Information (Name, ID, Policy type, targeted group).

- **Additional information:**
  - Expected behavior:
    What troubleshooting steps have you provided to the customer and what were the results?
  - Can you reproduce the issue in your test environment? (If not, why?):
  - What data have you collected and what have you found? (e.g. MDMDiagnostic logs, ODC logs, SDP, Screenshots, browser traces, network traces):
  - Relevant links, KB articles, Teams conversations, bugs researched:
  - What assistance are you requesting?

- **SCOPE:** Brief description of the SCOPE on the case.
```

> **Note:** Adapt/modify the template to align with each scenario (i.e. App, Policy, etc.) before posting. Avoid unnecessary "N/A" entries in the template.
