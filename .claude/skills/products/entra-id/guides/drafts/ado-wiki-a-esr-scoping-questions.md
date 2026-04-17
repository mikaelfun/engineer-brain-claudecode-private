---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ESR/Workflow: ESR: Troubleshooting/Workflow: ESR: Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FESR%2FWorkflow%3A%20ESR%3A%20Troubleshooting%2FWorkflow%3A%20ESR%3A%20Scoping%20Questions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## ESR: Scoping Questions

Guidelines for scoping questions when addressing issues related to Enterprise State Roaming (ESR) in Windows 10 and Windows 11.

**Important:** In Windows 11 and the most recent versions of Windows 10, Enterprise State Roaming (ESR) provides synchronization for significantly fewer settings than in older Windows 10 versions.

Before getting in touch with the customer, check the list of settings that can be configured to sync in recent Windows versions:
[Windows roaming settings reference](https://docs.microsoft.com/en-us/azure/active-directory/devices/enterprise-state-roaming-windows-settings-reference)

### Schedule a remote session with the customer

Give the customer the opportunity to describe the issue on their own.

Try to clarify the information below:

#### What

- Which Windows 11 or Windows 10 version are we using?
- Which type of users are using ESR? Synched, Azure Active Directory (AAD), or both?
- What type of environment and devices do we have? AAD Joined only? Hybrid Joined? Non-Azure AD Joined?
- Is the issue sporadic, or can it be reproduced at will?
- What are the steps done to reproduce the issue?
- Which settings do not sync?
- Which settings do sync, if any?

#### Where

- Does the issue affect all users or just some from a specific location?

#### When

- Was the ESR sync working earlier? For which settings?
- Are there any recent changes that we are aware of?

#### Impact

- Approximately how many users are affected?
