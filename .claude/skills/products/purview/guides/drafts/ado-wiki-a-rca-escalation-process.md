---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Processes/Escalation/RCA Escalation Process"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Processes/Escalation/RCA%20Escalation%20Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

Author Tiffany Fischer
#RCA Escalation Process
## Workflow
This process covers how CSS should escalate RCA requests with engineering.
![RCA-Escalation.png](/.attachments/RCA-Escalation-62599c82-8635-4065-a081-d31008d7bfd4.png)
> Chart representing a detailed workflow for the RCA (Root Cause Analysis) escalation process:
> 
> 1. **Case Submission**: The process starts with the submission of a case.
> 2. **Service Request**: The case is translated into a service request.
> 3. **RCA Requested**: Decision pointif RCA is needed (Y for Yes), the process proceeds; if not (N for No), the engineer resolves the issue and closes the service request.
> 4. **ICM (New/Existing) - ASC**: If RCA is needed, it moves to ICM (Incident and Change Management).
>    - New ICM is opened for RCA only.
>    - Existing ICM transforms from Break/Fix to RCA after mitigation.
>    - PG (Program Group) engagement may be required for a deeper RCA.
>    - Engineer sets the "RCA Needed" field to Yes, starting a countdown to deliver RCA in less than 5 days.
> 5. **Engineer sets [RCA Needed] flag in ICM**: Engineer marks RCA requirement in the system.
> 6. **PG tracks and provides RCA**: The Program Group monitors and provides the root cause analysis.
>    - PG reviews CRI (Customer Reported Issues) with RCA requests during live site meetings.
>    - EEE (Escalation Engineering Experts) can provide RCA if capable.
>    - PS (Product Support) leverages CRI Dashboard from CXP (Customer Experience and Platforms) or SQL MI (Managed Instance) dashboards.
> 7. **CSS Deliver RCA to Customer**: The provided RCA is then communicated to the customer.
>    - RCA is recorded in the Root Cause Field.
>    - EEE reviews to ensure the customer readiness.
> 8. **Close Service Request**: Final step involves closing the service request.
> 
> Additional Notes:
> - If the issue is resolved by the engineer at the RCA Requested stage (N decision), the service request is closed without proceeding to deeper RCA steps as specified on the right side of the


**Note to CSS**: Please feel free to get further clarity from the TA/SME/EEE in case if you are unclear with the provided RCA before delivering to the Customer.

**When to use this RCA process?**
This process should be used ONLY when one or more of the below conditions is true.

 - ASC Insight not generated OR generated without customer-ready content (CRC) and No TSG available.
- Customer requesting for detailed RCA after providing resolution to the Customer or initial cause of the issue.
- Active Incident turn into RCA Request and incident requires engineering expertise to root cause.

If one or more of the above conditions is true, engage engineering for RCA thru ASC (Escalate Ticket) following the steps below.

**How to Create/Update RCA Incident**
- When creating ICM from ASC follow the template and make sure to include Issue StartTime and EndTime of issue occurrence and share the findings from the ASC/TSG Analysis (for new RCA requests) to the summary section.

- Submit ICM from ASC.

- Open the ICM created (https://portal.microsofticm.com/imp/v3/incidents/details/your_icm# ) to update custom field [RCA Needed] as shown below. It is critical to set this column to [Yes] for engineering to qualify the incident for root cause analysis.

![RCA-Escalation-IcM-Image.png](/.attachments/RCA-Escalation-IcM-Image-8c28000f-929c-4f09-8bfe-f2745fc37a8b.png)
> Screenshot displaying an incident management portal, specifically from a Microsoft service (https://portal.microsofticm.com). The page is focused on the incident details for the service category Azure. The user interface includes a navigation bar with options such as Dashboard, Incidents, Outages, On Call Lists, Reporting, Automation, and Administration. The highlighted section shows custom fields for recording incident details such as "Ops Team Effort," "Alert Name," and whether "RCA Needed" (Root Cause Analysis) is set to "Yes." There are action buttons for saving, resetting, and acknowledging the incident.


Note - the above step to set [RCA Needed] is also required for break/fix incidents that turns into RCA request after mitigation.

By default [RCA Needed] column will hold the default value as [No] when ICM created from ASC.

FYI - (We have a feature request pending with ASC team to integrate [RCA Needed] column directly into ASC. Upon rollout the above step will be revised to set [RCA Needed] flag directly in ASC)

##**Tracking RCA incidents**
- Engineering /CSS will be able to track the RCA Incidents status using [RCA Needed] custom column.
- Time to RCA is measured as the delta between the latter of [ICM mitigated time, time when [RCA Needed] is set to Yes] and the time when the Root Cause section is populated
- Backlogs of RCAs will be managed /reviewed by Engineering during live site meetings.
- Tracking thru P360 and PBI Dashboard will be enabled in a later phase.

##**Severity guidelines**

- New RCA requests should open as a Severity 3 or 4 ONLY (including ARR/Pulse). RCA do not qualify for Sev2 and this is applicable for all support plans.
- RCA requests for ARR customers should include [ARR Customer] to the title. This will help engineering team to work on these requests at a higher priority over other RCA requests.
- When an active Sev-2 turns into a RCA (self healed or mitigated and waiting for RCA), please ensure to lower the severity to continue working with engineering on RCA request.
- FYI - in most cases, when Sev-2 is mitigated and pending for RCA, the status will be updated from Active to Mitigated by PG.

##**SLAs / Delays**
- We do not have an service level agreement with engineering for RCA delivery request.
- Due to the nature and complexity of the issue, the duration required for identifying root cause will vary and makes harder to set SLA.
- However, idle RCA incidents over 72 hours and/or issue occurred timeframe is close to rollover (data retention period) which ever is closer, then follow-up with engineering and/or loop the associated EEE engineers to the communication.
- Follow CSAT Impacting process, when RCA pending with extended delay and/or customer unhappy with the delay to expedite.
- **Exceptions** - Complexity of the issue influence RCA delays which can take extremely long to determine the cause. Also, the increase in volumes and engineering bandwidth can force delays at times.

##**RCA Delivery**

- PG will check for [RCA Needed] column RCA ICMs to deliver the root cause.
- RCA by PG should be delivered only in the Root cause section of the ICM and not in the discussion tab or other places. Sample icm w/RCA updated

![RCA-Escalation-IcM-Image2.png](/.attachments/RCA-Escalation-IcM-Image2-b5f4cb50-d56c-4a26-b15e-473e08c81441.png)
> Screenshot displaying the "Root Cause" section of a workflow within an RCA escalation process. It includes information such as the number of incidents linked to the root cause, the root cause title, category, and subcategory. There is a text box for root cause details, and options to link or unlink related incidents. A notification highlights that changes to the root cause will be reflected in all linked incidents. The "Repair Items" section is partially visible below.


- If RCA is no longer needed, set the RCA Needed field to No under Custom Fields for Service Category Azure.
- If for any reason (pure customer error or ICM creator misunderstanding), unable to provide an RCA, use Root Cause Category as "Unable to determine" and provide a reason in the "Root Cause Details" as shown below:

![RCA-Escalation-IcM-Image3.png](/.attachments/RCA-Escalation-IcM-Image3-a9e5eb31-3fd7-402e-8ddd-e898a2d46aea.png)
> Screenshot displaying the 'Root Cause' input form within an RCA Escalation Process. The form features fields for 'Root Cause Title', 'Root Cause Category' (highlighted in yellow and marked as 'Unable to Determine'), 'Root Cause Subcategory', and 'Root Cause Details'. Additionally, there is a 'Repair Items' section and a warning message that instructs users not to enter personally identifiable information (PII), accompanied by a link to learn more about PII.


##**Some other follow up questions:**

 - If an ICM is opened only for an RCA, the case should stay in the Active state and RCA needed should be set to RCA Needed asap, correct? In that case, the ICM is mitigated when the RCA is provided, so the RCA time is essentially zero, right?

   -   When RCA Needed Flag is checked, the clock starts ticking irrespective of the state.  When an RCA is delivered in the Root cause section then the  RCA clock stops.
If the ICM is opened for a technical issue and the customer knows they also want an RCA, support can open the case w/RCA Needed = Yes, but then the RCA timer doesnt start until the case is mitigated and the timer stops when the RCA field is populated, correct?

- When RCA Needed flag is set to [Yes] before Mitigation,    RCA Start time will choose the  latest, and in this case -  Mitigated time
   - (Mitigated time will be greater than the RCA request status  (RCANeeded=Yes)  change time.  

  - And if  RCA needed set to [Yes ] by the engineer after ICM is mitigated, then the same logic will be applied.  In this case, RCA needed =Yes will be treated as start time, which is the latest.

- ICM has been marked Mitigated without providing the RCA. What should I do?
    - If an ICM has been marked Mitigated without providing the RCA, engineers will keep the ICM in the mitigated state and follow-up with the Icm owner and involve EEEs. If still no response on the follow-up, engineers will reactivate the Icm so that RCA can be added by the PG.
