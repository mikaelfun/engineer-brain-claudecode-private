---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Processes/Critsits"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Processes/Critsits"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune CRITSIT Process

[[_TOC_]]

## Overview
This article describes the process to follow when working an Intune CritSit.

## Definition of a CRITSIT
A Critical Situation (CRITSIT) is a Global process designed to manage critical (Severity 1/A) Premier Support customer situations consistently worldwide. CRITSIT collaboration and escalations are taken with a high sense of urgency.

## Examples of Impact on CRITSIT situations
- One or more services aren't accessible or are unusable.
- Production, operations, or deployment deadlines are severely affected, or there will be a severe impact on production or profitability.
- Multiple users or services are affected.

## CRITSIT Ownership

**IMPORTANT!** For SMC CRITSIT, the SLA is 30 minutes and there is a financial implication if we do not meet SLA.

1. Accept the CRITSIT by taking ownership of the case and meet SLA.
2. Post the case to the **CRITSIT and S500 Assistance Requests** channel in the Intune Case Discussion team.
3. If this is a new CRITSIT, read the customer description and call the customer within the first 15 minutes after taking ownership.
4. If the customer does not answer, still accept ownership and notify the CRITSIT Manager and Incident Manager.
5. If the CRITSIT is not in our scope of support, follow the Premier misroute process.

## CRITSIT Management and providing customer updates

1. Assess the current impact and re-evaluate severity.
2. Complete scope and document under Summary Tab. Define the problem, the customer goal and determine CRITSIT exit criteria or severity reduction.
3. After a clearly defined issue and scope, focus on getting the customer in a working state as soon as possible.
4. Document the case and agree with the customer how often an update is needed.
5. Review active bugs, emerging issues, service events (LSI), KB, Wiki, Teams to determine if this is a known issue.
6. Be available on Internal Microsoft Communications.
7. Continue to update notes every 60-90 minutes.

## Escalation and Collaboration

If engagement from a Support Escalation Engineer is needed:
1. In RAVE, document the details of the problem as part of the case history under Add Internal Note using the IET Template.
2. Update the CRITSIT post with the request indicating that you need IET engagement.
3. Evaluate if cross-collaboration with other teams is needed.

## What to do when there is an ICM filed

**IMPORTANT!** If the ICM is related with an LSI, follow [Procedure for handling LSIs](https://internal.support.services.microsoft.com/en-us/help/4584495).

1. If case is not related with an LSI, reach out to your TA to review the ICM.
2. With your TA, define if the CRITSIT requires active engagement with PG.
3. If the CRITSIT and ICM need active engagement with PG or the customer, find an SEE/IET resource.
4. Never promise a timeline for a fix even if there is a code fix implementation.
5. Never share alias of PG engineers unless approved.

## How to post in the CRITSIT and S500 Assistance Requests Teams Channel

Teams group: [Intune Case Discussion](https://teams.microsoft.com/l/team/19:80b976c3dfef4efbbbca8b2c67f80630%40thread.skype/conversations?groupId=8aefb036-b9be-4a78-9c84-51120af6a695&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

1. Post the case to the **CRITSIT and S500 Assistance Requests** channel using the CRITSIT form.
2. Indicate if the CRITSIT is SMC or not.
3. Select the type of CRITSIT:
   - New (New created CRITSIT)
   - Homegrown (Severity was raised on a case you currently own)
   - Receiving Handover (Someone from another region transferred)
4. A person monitoring this channel will acknowledge your CRITSIT is active.
5. If IET engagement is needed, create an Assistance Request (AR) following KB [4482666](https://internal.support.services.microsoft.com/en-us/help/4482666) and reply to the CRITSIT thread.

## End of shift - Severity lowered

**IMPORTANT!** Severity should not be lowered until the critical nature/impact has been addressed to the point at which both engineer and customer are reasonably certain the issue is unlikely to manifest again.

If customer agrees on lowering severity:
1. Send an email to the customer with status of the investigation and agreement on callback the following day.
2. Update the case documentation.
3. Keep the ownership of the case and continue the next day.

## End of shift - Keeping Sev A case

If the customer wants to keep the case as severity A but cannot work around the clock:
- A note on the case needs to be added and the CRITSIT manager needs to be informed.
- The next day before your shift starts, the engineer needs to send an email to scsdm@microsoft.com to stay off the rotation and get credit for the CRITSIT.

## Transitioning an Active Critsit within your Region (non S500)

### ATZ to ATZ
- Begin this process one hour before you'll need to hand off.
- Ensure you have the Handover template posted to the case.
- Fill out the required Handoff form: https://aka.ms/SCIMHandoffRequest
- Do NOT transfer the case back to the queue until you receive an approval email.
- Once approved, transfer case back into queue.

### APGC to APGC
Contact the Case Dispatcher to raise awareness of the need to handoff to another APGC engineer.

### EMEA to EMEA
Check with TA/Queue tracker if reassignment is needed.

## SevA Critsit needing callback from different region (not applicable for SMC CritSits)
1. Must have agreement (mandatory) with CritSit manager and Customer for the Case to remain an Inactive Sev A without an owner.
2. Engineer must add an internal case note with CritSit manager agreement/Customer agreement.
3. Engineer must email DMs for awareness: scsdm@microsoft.com.
4. When transferring the CritSit back to the queue, add a description note with format: INACTIVE| Region | Details of callback (date/time).
   - Example: INACTIVE| APAC| Call back time 9.30 AM IST

## End of shift - CRITSIT continues - Regional Handoff Needed

**IMPORTANT!** The customer must allocate appropriate resources to sustain continuous effort 24 hours a day until the issue is resolved.

Process:
1. Create an internal note in the case with the handover template.
2. Monday to Friday - record the handover on the tracking tool: https://aka.ms/SCIMHandoffRequest
3. Once the new engineer is identified, add them to the call with the customer to complete the warm handoff.
4. For ALL EU CRITS with an existing rCRI, provide the new engineer access to the rCRI by adding them as a contact.

Handover timing guide:
- ATZ transfers to APGC on Fridays will start at 12am UTC (7:00pm CT).

## CRITSIT - IET Weekend Engagement

For weekend engagement, fill out the IET Template and save it as a note in the case, but there is no need to send an AR before contacting the On-Call engineer.

## Handover Template

```
=====
New engineer to assume ownership of the entire service request

Originating Region:
Transferring to Region:
Political Critsit Y/N:
ICM Number:

Customer Language Constraints:

Scope
- Issue Summary -
- Scope Agreement -
- Business Impact -
- Affected UPN/UserID -
- Affected DeviceID -
- Affected PolicyID/AppID -

Case Status / Summary
- Completed Action(s) and Result(s) -
- Engineers Assessment -

ACTION PLAN:
Action on Microsoft:
Action on Customer/Partner:
Next Contact:
=====
```

## How to join Intune Discussion in Microsoft Teams

1. Open the Microsoft Teams App.
2. Select the Teams node in the left-hand column.
3. Select Join or create a team in the left corner.
4. Select Join a team with a code.
5. Enter the code **3q2kyhy**.

## Weekdays Region Coverage
- APGC → EMEA → ATZ → APGC (see region coverage chart in wiki)

## SEE2SEE Critsit Handover process

Before starting: All SEE Handovers should be a warm HO.

Decision criteria for SEE2SEE handover types:

### Critsit case - Active Troubleshooting
- Start the Handover process 1 hour before your shift ends.
- Update the case notes with all relevant information.
- Use the (IET Only) SEE2SEE Critsit Handover form.

### Critsit case - ICM created waiting on PG engagement
- Start the Handover process 1 hour before your shift ends.
- Prerequisites: ICM is filed, PG confirmed no more information needed, no action on customer, SEV of ICM matches customer's impact.
- Use the (IET Only) SEE2SEE Critsit Handover form.

### Critsit AR - Active Troubleshooting
- Start the Handover process 1 hour before your shift ends.
- Use the (IET Only) SEE2SEE Critsit Handover form.

### Weekend Critsit case - Active Troubleshooting
- Only used if the case requires an SEE and is actively being worked.
- Start the Handover process 1 hour before your shift ends.
- Use the (IET Only) SEE2SEE Critsit Handover form.
