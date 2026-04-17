---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Delivery Partners/Partners Escalation"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FDelivery%20Partners%2FPartners%20Escalation"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

# Definition of Escalation

A case has reached the technical depth that it can no longer be worked by a Support Engineer and needs a Support Escalation engineer to continue working on it.

The case has particular political aspects (i.e. exec escalation) and needs to have an escalation resource to drive.

It has been confirmed that an IcM/DCR/RFC needs to be filed with the PG.

The issue is documented in a way that needs assistance from the Product Group to get the resolution.

Escalations are NOT intended to be used for one-off questions as there are other avenues for that.

# Resources that you can use as reference

- DFM knowledge
- Public Documentation
- Intune Wiki
- Your peers
- Internal Tools such as Assist365 or Kusto

# Who can approve an Escalation?

The escalations to our SEEs can be approved by the Technical Advisor or by the SEEs themselves when we determine all the resources have been exhausted or the issue requires engagement with PG.

The SDM or upper management from Microsoft can also request to escalate a case if is an executive escalation.

# What to do when we got the approval for the escalation?

> [!IMPORTANT]  
> The case owner maintains ownership of the case and communication until an SEE takes over the case.

Even if you got the approval to escalate the case **DO NOT** mention this to the customer, avoid saying phrases like:

- We are going to wait for an answer of our highest resources.
- We're currently escalating the case to the Product Group.
- We'll be engaging a Senior Escalation Engineer/Resource.
- We're waiting on the SMEs to provide an answer.
- An Escalation Resource will be taking over after we finish the escalation process.

Instead, you can use these phrases:

- We're actively checking on the information provided. In the meantime, let me share a snippet of our findings.
- We're running deeper checks to confirm if this is something we have come across before.
- Let's collect logs from a working device to compare them to the affected machine while we engage additional resources.
- We'll be cross-collaborating internally with upper resources to make sure the info is fully evaluated.

Copy and paste **the below template** into an internal note on the case, this way the SEE/SME/PTA can review it at any time and suggest modifications.

We need to make sure we have all the required information related to issue, if the internal documentation template is up to date, we should have the basic information such as:

- Issue Definition and Scope Agreement.
- Business Impact.
- Information about the affected users or devices.
- Information about the affected policies or applications.
- Repro steps the customer is following to experience the issue.
- Logs depending on the scenario.  

> [!IMPORTANT]  
> The Business Impact is one of the most important details if the SEE needs to raise an ICM. Make sure we have all the details related to the impact, this could include details on how this is impacting the end users or the admins, how many users are being affected and if there is any security or financial impact.

After adding the details mentioned above, we need to start summarizing the troubleshooting that we have done, this part will be documented in the section called Troubleshooting found in the Escalation Template and the idea is to mention all the research that we have done and all the references and tools that we have used so far.

If you validated a public document about the configuration, please add the document so the SME, TA and SEE can use it as reference.

Here are some important considerations:

- Document what is the expected behavior based on the documentation and what is the experience the customer is reporting, not all configurations will have documentation but please make sure you validate if thats the case.

- Make sure you add detailed information about the action plan that you provided, and document what was the outcome. The issue might have been partially solved or if it still persists.  

- Any minor detail is important to avoid the SEEs from repeating themselves or advising actions that have been already taken with the SE.

- If we collect logs, make sure those are attached to the case DTM files and you mention the log that you reviewed, and your assessment based on that.

- The logs might indicate error codes or confirmation that Intune is delivering the configuration but is important to document what we have reviewed so far.

- For scenarios when we use Kusto, make sure you add the query that was used and based on the results, what is your assessment.

> [!TIP]  
> When you are consolidating the escalation, is recommended to add all the logs, screenshots or relevant files to a single compressed file and document the name of that file, this way whomever reviews the case will have access to the most recent files.

The idea is to document all the actions that we have taken from the technical perspective, since we dont need to know administrative parts of the case.

Here are some examples of details that we **dont** need to document:

- If the customer was unresponsive or out of the office.  
- Log entries when we had follow-up calls with the customer.

After adding most of the details, engage the SME or TL, this person will review the escalation template to validate if we have properly documented the issue and make sure we have added all the details about the problem.

The SME will also review the troubleshooting and if there are additional steps that we can do with the customer, it will advise the SE to validate those steps before proceeding with the escalation.

Once the template is ready, the SME or TL will reach out to the PTA for another review.

> [!NOTE]  
> The PTA might suggest additional action plans, collect new logs or advise to modify some information on the Template.

Having completed all the steps above, the PTA will approve the escalation and the current case owner will save the note.

The PTA will proceed to post the escalation to the internal Sharepoint to provide visibility to the SEEs.

## Step-by-Step explanation of each part  

### First Section

The first section is very straight forward but we need to be careful with the Title and the Assistance Requested field. We've come across cases where the title is "Unable to enroll devices" but it's actually that the device gets enrolled, but it has a different behavior compared to the what the customer expects. Also, a common scenario is to find a Title that says, "Cannot get report from Intune", and the actual report is generated but it is empty. You need to be specific and careful with the wording that you use.

For the Assistance Requested field make sure you're choosing the correct value, it you get feedback stating that we need to file an RFC before moving forward with an ICM/CRI, make sure you document this properly.

>IET TEMPLATE | ASSISTANCE REQUEST | < case title >
>
>Title: [Company Name]  One line description of the issue
>
>Case#:
>
>TA|TL Engaged: List the alias. A TA/TL must sign off on the task personally.
>
>Assistance requested: Select one: ICM/CRI (something seems broken), RFC (Request for comment - need clarity on something), DCR (Design change request - customer requesting change to how something works).
>
>Date Issue Started: List the date the issue started if known, the last time it was known to have worked correctly, or if it has never worked.
>
>Default domain name: Found in the Domains tab in Assist365. Example:contoso.onmicrosoft.com 
>
>Company ID: Found in the Profile tab in Assist365. Same as the AccountID in the Assist365 Intune Application.
>
>MDM Authority:
>
>ASU: Found in Assist365 Intune Application.
>

### Second Section

> [!TIP]
> Second section of the template, we need to be careful with Issue Summary and the Impact.

The Issue Summary is not the same as the Title, it needs to provide the entire context of the issue. You need to list where the issue is happening in the Portal (if applicable), share the path and the blade of the portal that shows the error, in which devices you see problems, if you see differences between personal/corporate. You need to write a summary like if you were sending this to a person that knows nothing about the problem so we can provide clarity.

In the Impact area, let's make sure we fully understand it. Always get an approx number of users/devices affected, "All Devices and Users affected" is not applicable. We have some additional questions that can be asked:

- Why is this configuration required?
- How is the issue affecting the customer's daily tasks / Production?
- Is the issue preventing them from finishing any critical tasks or projects?
- Are there any workarounds?

> Issue Summary:
>
> Summarize the issue as you currently understand it. What is happening that led to the customer opening a case? How is the issue presenting itself?
>
> Impact:
>
> - Approx. affected user count:
> - Is this a POC (proof of concept): YES/NO
> - Is this blocking users from working: If yes, explain how
> - Will this issue cause delay on customer project(s) if not resolved quickly: YES/NO, include needed fix deadline if known.
> - Anything else that should be known on impact: Example- this has leadership team visibility, their CEO is affected, doctors cannot perform surgery, stores cannot checkout customers, etc.

### Third section

It's worth mentioning that we need to ask what the behavior is (what are they experiencing?) to the customer so that we can correlate that to our documentation and then add the information properly to the template. Observed behavior is something you need to be very careful of because this will let you know whether you see that same behavior based on what's publicly documented and also this will help you when running your internal repro.

> - **Expected Behavior**: Describe the behavior that the customer or you expect to see.
> - **Article Referenced for Expected Behavior**: If there is a public article describing how the affected functionality SHOULD work, include the link here. Also include links that you think should describe how the affected functionality works as applicable.
> - **Observed Behavior**: Describe how the behavior seen by the customer differs from what is documented. If no Microsoft documents are found, explain how the behavior differs from customer expectations.
> - Scope Agreement

### Forth section

Make sure that the device/user being documented is currently affected by the issue. If it's the first one that you documented and the issue can no longer be reproduced, you need new user/device details.

>**Affected Users**: List 1 to 3 UPNs and UserIDs experiencing the problem. We must have a specific UPN/UserID for troubleshooting!
>
> User1:
>
> - UPN:
> - UserID:
> - Intune licensed: YES/NO
>
>===============
>
> **Affected Devices**: List 1 to 3 sample device details. We must have specific device info for troubleshooting!
>
> Device 1:
>
> - Intune Device ID:
> - AAD Device ID:
> - AAD Object ID:
> - Device name:
> - Serial number:
> - Platform: Android/iOS/iPadOS/MacOS/Windows
> - Model and OS version number (& SKU if Windows):
> - Enrollment method: Reference Intune: Assist365 Enrollment types and what do they mean- Additional information: Include anything else that may be relevant to that specific device.
> - CP log incident ID:
>
>===============
>
> **Related Policies/Apps**: Add all related policies, apps, and related important information such as Policy name, Policy ID, Policy Type, Targeted groups (group type), and important details related to the scenario.
>
> - Policy type: i.e SCEP policy
> - Policy name:
> - Policy ID:
> - Policy type:
> - Targeted group, ID, type: Example- Win10Devices | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx | Dynamic Device group.
> - Policy related/affected settings:
> - Additional information: Add any information that may be important related to the policy.
>
>===============
>

### Troubleshooting

On this area is important to mention that we're looking for an extensive note of all the troubleshooting that has been done, no need to hold yourself. Example:

Did the first validation with device Id 'xxxxx-xxxxxxxx-xxxxxx'

- Ran the kusto query below (reference/paste the query) and found this information. Or just paste the output that matters for the case investigation.
- Checked the logs for the device that were attached to the case with name 'ODC logs for Test.zip'
  - Checked the log 'Type in the name of the log in question'
    - From this log I found the policy and this information
- Checked another log 'Type in the name of the log in question'
  - From this log I got the following error message
- Additionally, I went to DFM and used this KB 'paste the URL of the resource you used'
  - Ran the Kusto query referenced, and these are my findings

There's a lack of investigation and sometimes the issue is that SEs are storing the entire case history in other tools. They need to be able to document their cases on a daily basis with specific steps/resources and their findings. If they get to the point where they need to escalate, they'll just need to copy their findings and not start from scratch which is causing a lot of delay.

Collecting/referencing a log or running a Kusto doesn't count as troubleshooting. The validations/findings need to be attached.

> [!TIP]
> Include anything that you feel is important in troubleshooting the issue. If you aren't sure something is important, then it's worth including. What tests you completed, what logs you investigated and any important findings, any Kusto queries that gave relevant results (please include the query and the relevant result), do you have an educated guess on what is going on?

## Blank Template

> =======================================
>
> IET TEMPLATE | ASSISTANCE REQUEST | < case title >
>
> - Title: [Company Name]  One line description of the issue
> - Case #:
> - TA|TL Engaged:
> - Assistance requested: ICM, RFC, DCR
> - Date Issue Started:
> - Default domain name:
> - Company ID:
> - MDM Authority:
> - ASU:
>
> ===============
>
> Issue Summary:
>
> **Impact:**
>
> - Approx. affected user count:
> - Is this a POC (proof of concept): YES/NO
> - Is this blocking users from working:
> - Will this issue cause delay on customer project(s) if not resolved quickly: YES/NO, needed fix deadline:
> - Anything else that should be known on impact:
>
> ===============
>
> Expected Behavior:
> Article Referenced for Expected Behavior
> Observed Behavior:
> Scope Agreement:
>
>===============
>
> Affected Users: User1:
>
> - UPN:
> - UserID:
> - Intune licensed: YES/NO
>
> ===============
>
> Affected Devices: Device 1:
>
> - Intune Device ID:
> - AAD Device ID:
> - AAD Object ID:
> - Device name:
> - Serial number:
> - Platform: Android/iOS/iPadOS/MacOS/Windows
> - Model and OS version number (& SKU if Windows):
> - Enrollment method: ReferenceIntune: Assist365 Enrollment types and what do they mean 
> - Additional information: Include anything else that may be relevant to that specific device.
> - CP log incident ID:
>
> ===============
>
> Related Policies/Apps:
>
> - Policy type: i.e. SCEP policy
> - Policy name:
> - Policy ID:
> - Policy type:
> - Targeted group, ID, type:
> - Policy related/affected settings:
> - Additional information:
>
> ==================
>
> **Troubleshooting**
>
> Repro Steps:
>
> - Needed configurations and steps to attempt to repro:
> - Are you able to reproduce the issue in a test tenant using the above configurations/steps? YES / NO
> - How your repro results were different:
> - Why you could not attempt repro:
> ===============
>
> Additional data/logs:
>
> ===============
