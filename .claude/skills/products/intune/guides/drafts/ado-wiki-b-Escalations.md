---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Processes/Escalations"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Processes/Escalations"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune Escalation Process (ATZ)

[[_TOC_]]

## Overview

This article describes the process to request an escalation or consult when working a case in DFM and is for **Intune ATZ only**.

Scenarios covered:
- Front line and Tier 2 Escalation
- ICM/CRI Escalation (Possible error in the console/device/service that needs PG involvement)
- DCR Escalation (Design Change Request)
- Team Consult (Consultation about next steps or action plan)

## Definition of Escalation

A case escalation is appropriate when:
- The case has reached technical depth that it can no longer be worked by an SE and needs someone from IET to own and drive.
- It has been confirmed that an ICM/DCR/RFC needs to be filed with the PG.
- The case has particular political aspects (e.g., exec escalation) and needs an escalation resource.

> Escalations are NOT intended for one-off questions.

## Status Definitions

| Status | Meaning |
|--------|---------|
| Triage Needed | Escalation request submitted, awaiting an SEE to engage |
| SEE Investigating | SEE has assigned the request to themself and is reviewing details |
| Escalation Complete | Ready for SEE to work with SE on a warm transition |
| Need More Information | Significant items need to be addressed before escalation can proceed |
| Cancelled | Request no longer needed or not ready |

## Resources to Use Prior to Escalation

- [DfM Knowledge](https://onesupport.crm.dynamics.com/)
- [The Wiki](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1321070/Welcome)
- [Public Docs](https://learn.microsoft.com/en-us/mem/intune/)
- [Tools - Kusto/ASC/Assist365](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1345251/Tools)
- Your peers and TAs
- [The SMEs](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1446693/SMEs)
- [SME Channels in Teams](https://teams.microsoft.com/l/team/19:80b976c3dfef4efbbbca8b2c67f80630%40thread.skype/conversations?groupId=8aefb036-b9be-4a78-9c84-51120af6a695&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

## Basic Questions
For simple, non-urgent questions, post to the appropriate channel in the Intune Case Discussion team in Microsoft Teams.

## Requesting an Escalation

**SLA target:** For all non-Sev A escalations, we strive to address all IET requests within 7 days.

Process flow:
1. After resources are exhausted, SE engages TA.
2. TA confirms the case is ready for escalation, then submits it on the Escalation request site. Default Status: "Triage Needed".
3. The SEE taking the escalation updates the item listing themselves in "Assigned To" field and sets Status to "SEE Investigating".
   - If mostly in place → SEE reaches out to case owner for warm handoff, changes Status to "Escalation Complete".
   - If significant work is still needed → SEE notifies TA, requests steps to be completed, updates Status to "Need More Information".
     - If fillable within 5 business days → TA/Case Owner notify SEE when steps completed, proceed with warm transition.
     - If > 5 business days → TA can resubmit when necessary steps are performed. SEE changes Status to "Cancelled".

**IMPORTANT!** The case owner maintains ownership and communication until an SEE takes over the case.

## How to Find CompanyID, TenantID, AccountID, ContextID

Key mapping:
- **Context ID = ContentID = Company ID = Azure AD ID = Azure Tenant ID** (all the same)
- **AccountID = Intune tenant ID**

Kusto query to find IDs using Intune Device ID:
```kusto
IntuneEvent
| where DeviceId == '<input Intune Device ID here>'
| where isnotempty(AccountId) and isnotempty(ContextId)
| project DeviceId, 
    ACCOUNTIDisINTUNEtenantID = AccountId, 
    Assist365TENANTIDisCONTEXTIDisCOMPANYIDisCONTENTIDisAZUREtenantID = ContextId
| take 1
```

## IET Template (Assistance Request)

When submitting an escalation, document the details as an internal note using the IET Template:

```
IET TEMPLATE | ASSISTANCE REQUEST | <case title>

- Title: [Company Name] – One line description of the issue
- Case#:
- TA|TL Engaged: (alias - must sign off personally)
- Assistance requested: ICM/CRI | RFC | DCR
- Date Issue Started:
- Default domain name: (found in Domains tab in Assist365, e.g. contoso.onmicrosoft.com)
- Company ID: (Tenant ID, found in Tenant > Details tab in Assist365)
- MDM Authority:
- ASU: (found in Assist365 Intune Application)

===============
Issue Summary:
(What is happening? How is the issue presenting itself?)

Impact:
- Approx. affected user count:
- Is this a POC (proof of concept): YES/NO
- Is this blocking users from working: (explain if yes)
- Will this cause delay on customer project(s) if not resolved quickly: YES/NO, include needed fix deadline if known.
- Anything else on impact: (leadership visibility, CEO affected, etc.)

===============
Expected Behavior:

Article Referenced for Expected Behavior:

Observed Behavior:

===============
Affected Users: (List 1-3 UPNs and UserIDs)
User1:
- UPN:
- UserID:
- Intune licensed: YES/NO

===============
Affected Devices: (List 1-3 sample devices)
Device 1:
- Intune Device ID:
- AAD Device ID:
- AAD Object ID:
- Device name:
- Serial number:
- Platform: Android/iOS/iPadOS/MacOS/Windows
- Model and OS version number (& SKU if Windows):
- Enrollment method:
- CP log incident ID:

===============
Related Policies/Apps:
- Policy type:
- Policy name:
- Policy ID:
- Targeted group, ID, type:
- Policy related/affected settings:
- Additional information:

===============
Troubleshooting:
(Tests completed, logs investigated, important findings, Kusto queries with relevant results, educated guess on root cause)

===============
Repro Steps:
- Configurations and steps needed to reproduce:
- Are you able to reproduce the issue in a test tenant? YES / NO
- How your repro results were different:
- Why you could not attempt repro:

===============
Additional data/logs:
(Zip all pertinent non-cropped screenshots, logs, and attachments into a single .zip file and attach to the case)
```

## Mandatory Data for AdminUI/Reporting Issues

To escalate to IET for AdminUI/Reporting issues, you need these 4 items (must NOT be more than 10 days old):
1. **F12 Trace (.HAR)** collected during the repro (including Console Logs from Step 10)
2. **Full URL** where the issue occurs
3. **Ctrl + Alt + D screenshot** (press on the problem blade, then take screenshot)
4. All of the above zipped together
