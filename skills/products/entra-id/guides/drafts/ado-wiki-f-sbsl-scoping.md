---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/SBSL - Slow Logon/Workflow: SBSL: Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FSBSL%20-%20Slow%20Logon%2FWorkflow%3A%20SBSL%3A%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413875&Instance=413875&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413875&Instance=413875&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This guide outlines the key steps to scope a case involving SBSL issues. It covers what information to gather, where to look for potential problems, when delays occur, and the extent of the issue.

[[_TOC_]]

## What

- **What OS version(s) are impacted?**
- **What type of environment are the impacted clients a part of?**
  - Virtual Desktop Infrastructure (VDI)
  - Remote Desktop Services (RDS)
  - End user environment (laptop/desktop)
- **What users are impacted?**
  - Cross Domain/Forest users or even EntraID?
  - All users, admins, non-admins, local account vs. domain account, etc.
- **What computers are impacted?**
   -  AAD joined devices?


## Where

- **Where are the impacted clients located?**
  - Active Directory (AD) Client Site
    - Is there a local Domain Controller (DC)?
  - Geographical Location

## When

- **During which operation does the delay occur?**

  | Operations               | Definitions                                        |
  |--------------------------|----------------------------------------------------|
  | Slow Boot                | OS Loader to Secure Attention Sequence (CTRL+ALT+DEL) |
  | Slow SAS                 | SAS slow to present Credential dialog              |
  | Slow Logon               | Valid credential entry to explorer launched        |
  | Slow Cached Cred Logon   | Valid credential entry to explorer launched (off the corporate network) |
  | Slow Desktop             | Blank desktop or unresponsive Start Menu           |
  | Slow Lock                | Slow lock tile after Windows + L or SAS            |
  | Slow Unlock              | Slow lock tile to Credential dialog                |
  | Slow Logoff              | Logoff to SAS slow                                 |
  | Slow Shutdown            | Shutdown to Power Off                              |
  | Logon hang               | Logon never completes or takes more than 30 minutes to complete |

- **Where in the operation does the delay occur?**
  - Before Windows Logo
  - When a specific message like Welcome or Applying Computer Settings is displayed
  - After a user enters their credentials
- **Does this occur on every logon or just first-time logins?**
- **Does the issue occur only on first logon after BOOT?**
- **When was the issue first noticed?**
  - Today, last week, etc.
  - Any other changes happen around this time frame? (network changes, new applications, upgrades, etc.)

## Extent

- **How long is the delay?**
  - What is the baseline or normal/expected time?
- **How many machines are impacted?**
- **How often does this happen?**
  - Is this issue intermittent or after every reboot or every logon, etc.
- **Ask for a video of the problem where possible**