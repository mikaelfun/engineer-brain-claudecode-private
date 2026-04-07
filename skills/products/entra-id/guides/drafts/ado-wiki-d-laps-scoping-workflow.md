---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Legacy LAPS or LAPSv1/Workflow: LAPS: Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20LAPS/Legacy%20LAPS%20or%20LAPSv1/Workflow%3A%20LAPS%3A%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/567262&Instance=567262&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/567262&Instance=567262&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document outlines the necessary steps and considerations for troubleshooting issues related to Local Administrator Password Solution (LAPS) configurations. It covers identifying the impacted OS versions, users, and GPO configurations, as well as determining the location and extent of the issue.

[[_TOC_]]

# Scoping

## What
- What OS version(s) is impacted?
- What users are impacted?
  - Cross-domain/forest scenarios?
  - LAPS managed administrator account is built-in or customized?
- What is the problem with LAPS configurations?
  - What is the error received, if any?
  - In which way is it failing?
- What is the GPO (Group Policy Object) configuration where you have configured the LAPS settings?
  - Is LAPS-related GPO not applying?
  - What is the configuration of the link? (linked to OU, domain, site)
  - Do computers pertain to that OU, domain, site?

## Where
- Where are the impacted clients located?
  - AD (Active Directory) Client Site
    - Is there a local DC (Domain Controller)? How many?
  - Geographical location
  - All over the organization?
  - Where is the affected machine located? Which site and subnet?
  - Do we have any firewall between the affected machine and the DCs?

## When
- When was the issue first noticed?
  - Today, last week, etc.
  - Any other changes happen around this time frame? (network changes, new applications, upgrades, etc.)
- If this is a problem with failure to set the local Administrator password by LAPS, was it ever applied?

## Extent
- How many machines/users are impacted?
- How often does this happen?
  - Is this issue intermittent or consistent?
