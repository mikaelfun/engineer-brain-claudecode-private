---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Resize V2/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Resize%20V2/Scoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scoping Questions - Windows 365 Resize V2

## 1. Environment & Configuration
- Is this Windows 365 Enterprise or Business?
- Are the affected Cloud PCs using direct license assignment or group-based licensing?
- What is the current Cloud PC status (Provisioned, Pending resize, Grace period, Resize failed)?
- Are you resizing a Gen2 VM, or are any affected Cloud PCs Gen1?
- What is the source SKU and target SKU?
- Is this a single device resize or a bulk resize?

## 2. User Scenario / UX
- What does the admin/user see in the portal when resize fails?
- Does the Cloud PC become unavailable during/after the resize attempt?
- After resize attempt, does user see original Cloud PC, new Cloud PC, or both?

## 3. Scope & Impact
- How many users/Cloud PCs are affected?
- Is this impacting production users or test environment?
- Does the issue affect all resize attempts or only specific SKUs/users?

## 4. Licensing & Resize V2 Specific Checks
- When using group-based licensing: was target license assigned and source license removed?
- Did any Cloud PCs remain in pending resize state longer than expected?
- After resize attempt, does license SKU match Cloud PC hardware spec?

## 5. CSS Decision-Making
- Configuration issue vs Known limitation vs Service inconsistency vs Potential product bug
- Next step: Retry resize / License correction / Customer guidance / Escalation to PG
