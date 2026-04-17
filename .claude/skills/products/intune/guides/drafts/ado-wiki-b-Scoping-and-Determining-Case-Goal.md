---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Delivery Partners/Processes Case Lifecycle/Scoping and Determining Case Goal"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FDelivery%20Partners%2FProcesses%20Case%20Lifecycle%2FScoping%20and%20Determining%20Case%20Goal"
importDate: "2026-04-05"
type: troubleshooting-guide
---

Scope:
Use the [Scoping Questions](https://internal.support.services.microsoft.com/en-us/help/4010574) :
Make the scope a testable action avoid wide or vague scopes

- Send the email as soon as possible after the scoping conversation

- Write the scope in your own words:

1. Do not copy and paste any information from the case description or Customer or Partner emails into the scope.
1. Include as much technical detail as possible.
1. Describe the business impact in nontechnical words.
1. Describe specific closure conditions without repeating the issue definition.
1. The scoping email must capture all information discussed from the scoping call. Leave nothing out, the more detailed the scope the better.
1. The Customer or Partner should be able to see that we have understood all the information that was discussed.
- For Break-fix cases (where something is broken, and the expectation is that it be fixed), AVOID using the words like "root", "cause", "why", "how" in the agreed resolution.

1. We may frequently find cause as part of our troubleshooting, but we do not commit to it in the resolution statement of a break-fix case.
- For global English reasons keep your scope direct and simple:

1. Keep the sentences short.
1. Use simple subject-verb construction instead of complex constructions.
- If the customer does not agree to the scope, re-scope the issue with customer to gain agreement:

1. For Premier customers, engage the IM+ or CSAM as necessary.

## **Example of case Scope:**
**PROBLEM DESCRIPTION:**
`Describe the customer's problem in your own words. Do not simply copy and paste the customer verbatim. Be verbose and include all details. This is the who, what, and when of the issue, what the customer is trying to achieve, the error or behavior they are seeing, the goal they're trying to achieve, etc. If this is a new feature or technology, you might also include the URL to the documentation referenced by the customer.`

**TECHNICAL BACKGROUND:**

`How often does it happen, did it ever work, what have they changed?`

**OBSERVED BEHAVIOR + CUSTOMER REPRO STEPS:**
`What is the actual outcome of the customer's steps? When available, include the exact error message as stated in the screenshot. Provide detailed steps as we need to see how the customer is getting the error. In other words, what exact steps are being taken by the customer when they encounter the problem? This can be in the form of a step-by-step description, PSRs, screen recordings, etc.`

**EXPECTED BEHAVIOR:**
`Based on the repro steps, what outcome should we expect based on our documentations related to the feature the customer is having issues with?`

**WORKAROUNDS AVAILABLE:**
`Any troubleshooting already performed?`

**ENVIRONMENT**:


```
MDM Authority:
SCCM version if applicable:
Tenant:
Affected users' UPN and UserID: 
Which Devices:
Device IDs:
IMPACT:
Understand how the issue is impacting Cu environment, how many devices/users are affected, Project timelines
```


**SCOPE**:
`Should match the scope sent to the customer - What are the specific closure conditions, when available you may include affected UPN, OS platform and specific error message, who, what, and when"`

# Case Documentation
Review the guide lines for each step of the case presented in the Case Management Standards

**Call-back Commitment**
- Be proactive in contacting the customer or partner, even if the next action is on the them. You should always have a next date and time that you will follow-up with a call if you don't hear from them sooner.
- Document your next contact time in an action plan template.
- Microsoft should always be driving case progression, a case without a call-back commitment is not progressing and may be considered idle.

**Recovery**

- Engage recovery as soon as any CSat risk is identified:
- Engaging recovery after solution is confirmed is too late, identify risks early
- Engage your Technical Advisor, Manager, or the Technical Account Manager to help with recovery:
- In all situations requiring recovery ensure the customer or partner has been responded to within 72 hours and ideally the same day.
- Complete recovery as quickly as possible and do not allow the cases to stay in recovery for extended periods of time (no more than 1 week recommended).


**Wait States, Dispositions and Case Status**

- Keep the case Wait State, Disposition and Case Status updated at all stages of the case. This helps identify who has the next action on the case.

**Communication**

- Use the telephone first and frequently, unless the customer or partner specifically asks to use email only or the customer's service level requires Web Response only.
- Include CASEMAIL on all emails and add all telephone calls into the logs to enable other roles to follow case progression.
- If the customer or partner replies just to you, forward the communication to CASEMAIL for complete tracking of the communication flow.
- Use the official email signature template: Teams may also add information or contact details specific to the technology or segment they support.
- If at any time the customer or partner cannot be reached by phone and does not respond to email follow the Unresponsive Customer Procedure.

**Case Documentation**

- Do not rely on emails to update status, keep tasks updated.
- Put all the notes you can so you can have the troubleshooting steps made, well documented
- Use an action plan template or summary template every day there is customer or partner contact to document next action and next customer or partner contact.
