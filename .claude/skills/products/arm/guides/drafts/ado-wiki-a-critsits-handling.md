---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/Process/CritSits and 24x7 sev Bs handling"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/Process/CritSits%20and%2024x7%20sev%20Bs%20handling"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

## Scope
This process is applicable for any case that has the 24x7 flag enabled (including severity B).

## For CritSits (severity 1 and severity A cases)
### Notes
For **all** CritSits, a note, every 2 to 3 hours must be added if the pending action is on the Microsoft side.
```
Initial analysis of the issue: (only applicable for new CritSits)
Troubleshooting done since the last update
-A
-B
-C

Next steps
-D
-E
-F
```
> The above note is the minimum expected. If the engineer already has a note template that contains this information, they can continue to use it.

There are scenarios where it doesn't make sense to add a note so frequently. Here are the exceptions to when this note is not required:
- CritSit is an outage pending on IcM updates (and there are none).
- Customer is out for the day but severity cannot be reduced due to a specific request from them or the CSAM (Severity downgrade will be discussed later on this wiki).
- CritSit is pending on customer action/requested information (follow ups should still be documented on the case).
- Last action is expected to take a while and there will not be an update for several hours.
- CritSit is pending on collaboration owner to take action.

> For any of the situations above, the scenario should be documented in the last note.

### Severity downgrade
There are scenarios where the engineer is expected to negotiate the severity of a CritSit with the customer. Here are a few of those situations:
- Customer opened the case as a CritSit just to get someone assigned to the case as soon as possible, but they do not have any urgency after the case is assigned.
- Customer opened the case because they have a deadline to meet. On this scenarios Microsoft can explain to the customer we will do our best to assist them as soon as possible, but we cannot make any commitments on solution delivery.
- The issue at hand does not seem to merit the CritSit category. In these scenarios a business impact should be requested from customer to better understand the situation and make the decision from there.
- Although the customer was initially impacted on their production environment, Microsoft has provided a valid workaround to unblock their scenario.
- Customer is not available to work 24/7 on the issue, and they are about to finish their shift.

Engineers can rely on the CSAM or Incident Manager for the above negotiation.

Some CritSits are CritSits, because their severity is political, and although they do not qualify on the expected criteria, we must still keep the severity they have.

If the customer has stopped responding for a few hours, and no agreement was in place to keep the case a CritSit, **the severity should be dropped as well** (including an explanation to customer on why the severity is being downgraded).

> For the above communication, it should be clear the customer can reach out to **azurebu@microsoft.com** if urgent assistance is required.

If the severity is dropped, and the current engineer is not in the same time zone as the user, the case should be moved back to the queue for an assignment in the customer region.

### IcM escalation
If the CritSit has a valid business impact or production outage, the IcM opened must be severity 2. In some occasions product group might push back on CSS opening a severity 2 when just a single customer is impacted, but as per the [CEN Matrix](https://aka.ms/cen), a single customer scenario can still be severity 2 if there is a production impact.

### Accountability
Even if the CritSit is waiting for engineering group, or a collaboration, the case owner is still accountable of ensuring the case is moving forward and follow up frequently with the party that has the action pending.

## Severity B cases
### 24x7 flag removal
There are scenarios where the engineer is expected to negotiate if the case should be 24x7 with the customer. Here are a few of those situations:
- Customer opened the case as 24x7 because they believe Microsoft can work on it 24x7 without them being available.
- Customer opened the case because they have a deadline to meet. On this scenarios Microsoft can explain to the customer we will do our best to assist them as soon as possible, but we cannot make any commitments on solution delivery.
- Customer is not available to work 24/7 on the issue, and they are about to finish their shift.

If the customer has stopped responding for a few hours, and no agreement was in place to keep the case 24x7, **the 24x7 flag should be dropped as well** (including an explanation to customer on why the severity is being downgraded).

> For the above communication, it should be clear the customer can reach out to **azurebu@microsoft.com** if urgent assistance is required.

If the 24x7 flag is dropped, and the current engineer is not in the same time zone as the user, the case should be moved back to the queue for an assignment in the customer region. Update the case country/timezone if the customer has indicated they are located in a different region than the one currently set on the case. Also, make sure **there is a note that makes it clear this was the reason of the transfer**.

## Case handover (Both CritSits and severity B 24x7 cases)
- Confirm the customer is available to keep working on the case during the next region hours.
  - If not, negotiate a severity downgrade/remove the 24x7 flag, specially if the next action is on their side or we need to continuously check something with them.
  - If they do not reply, assume they are gone for the day and drop the severity/remove the 24x7 flag.
- Use the following template for the handover note:
  ```
  Troubleshooting done since the last update
  -A
  -B
  -C

  Action plan for next engineer
  -D
  -E
  -F

  <Confirmation the customer is available to continue working during the next region hours or explanation 
  why the case was moved even if the customer was not going to be available>
  ```
  > The above note is the minimum expected. If the engineer already has a note template that contains this information, they can continue to use it.
