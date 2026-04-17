---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Processes/DCR Process"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Processes/DCR%20Process"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune DCR Process

**_Do not update this article without first consulting someone on the Intune Supportability Team (MgtSolSupportability@microsoft.com)_**

[[_TOC_]]

## Public Roadmaps
The only publicly available information on the Intune roadmap that can be shared with customers:
- [M365 Roadmap](https://www.microsoft.com/en-US/microsoft-365/roadmap?filters=Microsoft%20Intune)
- [Intune In Development](https://learn.microsoft.com/en-us/mem/intune/fundamentals/in-development)

Any information on things in development not listed on either of those pages **cannot** be shared with customers.

## Key Warnings When Discussing DCRs with Customers
- **Submitting a DCR does NOT guarantee that ANY change will be implemented**
- A **very small** percentage of DCRs actually get implemented
- Customers must NOT create business plans around the idea that a DCR will be accepted and implemented.
- We cannot commit to **any** timelines for initial triage, PM acceptance, prioritization, development, preview, or GA.
- If not listed on a public roadmap → do not share any ETA.

## Common Intune DCR Rejection Reasons
- The DCR involves a third-party OS where the requested feature is not currently available from the third-party OS
- The DCR wants to change how a policy enforced by a third-party OS functions
- The DCR is actually for another Microsoft technology (Entra, Defender, Office, etc.)

## The DCR Submission Process

### Broad Commercial and Pro Customers
These customers do not have a CSAM that can follow up on DCR status. The **highly recommended method** is for them to leave feedback per KB [2529942](https://internal.evergreen.microsoft.com/en-us/topic/ed3e7ec8-fb2c-2a2f-821d-fdf5ac400214).

> ⚠️ These customers will likely contact the last case owner for follow-up on DCRs, creating high d-sat probability.

If customer is adamant, contact your PTL/PTA for next steps.

### Unified/Premier Customers

Steps to submit a DCR:
1. Work with the customer to complete the customer portion of the **Business Impact Statement Template**.
   - Keep DCRs to a single topic where possible.
   - Read the helper text to understand nuance between sections.
   - Copy-pasting the same paragraph into each section is not a good way to get the DCR implemented.
   - **You the engineer** should read through what the customer provided to ensure the ask is clear.
2. Complete the **engineer portion** of the business impact statement template.
3. Combine both templates in an internal note in your case.
4. Using your team's process, engage the appropriate resource to submit the DCR template to the [DCR portal](https://m365crm.microsoftcrmportals.com/dcrrequest/).
5. After the DCR has been filed:
   - **Premier/Unified:** Provide the CSAM/IM the reference number and a brief description.
   - **Premier/Unified:** Inform the customer the DCR has been submitted; if they have questions they should contact their **CSAM**; the case will now be closed.
   - **Broad Commercial / Pro:** Inform the customer the DCR has been submitted; the case will now be closed; if it enters development the topic *might* be posted to the public roadmaps; there is no further information that can be provided even if requested.

## I am an SEE or TA - How to Submit an Intune DCR

1. Review the full SE section above.
2. Go to the DCR submission site: https://m365crm.microsoftcrmportals.com/dcrrequest/
   - Access is controlled by the IDWeb security group "Intune Escalation Team" (iet@microsoft.com).
   - Add yourself to the appropriate subgroup (apaciet, emeaiet, indiaiet, intuneatziet, intuneta).
   - Allow 24-48 hours for propagation after adding yourself. If still having issues, contact MgtSolSupportability@microsoft.com.
3. Click "Submit New Request"
4. Complete the form with the information from the business impact statement.
   - Add SAP or SME area as a prefix to the title.
   - If there was an RFC or break/fix ICM, include it in the submission.
5. Attach the business impact statement and any supporting files.
6. Click "Submit for Review" → the DCR is now submitted and read-only.
7. To find the reference number: My Requests > Submitted Requests > find the "Request ID".

## I am an IM or CSAM or Account Manager - Following Up on an Intune DCR

Dashboard: [DCR Support Self-Service Reporting](https://msit.powerbi.com/groups/me/reports/610171c3-8328-4a7a-85ce-041f157342f4/ReportSectionaa212f5c600b7669e40a)
- Access controlled via IDWeb: [Intune DCR Reporting group](https://idwebelements.microsoft.com/GroupManagement.aspx?Group=IntuneDCRReporting&Operation=join)

DCR status definitions:
- **Pending Triage:** Filed, awaiting initial triage by Intune Supportability SMEs.
- **Pending PM Review:** Initial triage completed, now pending PM review. No plans, ETA, or commitments at this point. Can take months/years.
- **DCR Approved:** Approved by PM team. ETA of feature shipping is generally not available.
- **DCR Rejected:** Rejected. Refer to DCR triage notes for reasons. Even when rejected, remains on file and may be considered in the future.

For additional questions: [IntuneDCRHelp@microsoft.com](mailto:IntuneDCRHelp@microsoft.com)

## I am not in Intune Support (CSS) - Submitting an Intune DCR
- If there is a support case: send a collab to SAP Azure/Microsoft Intune.
- If there is not a support case: direct them to leave feedback per KB [2529942](https://internal.evergreen.microsoft.com/en-us/topic/ed3e7ec8-fb2c-2a2f-821d-fdf5ac400214).

## Business Impact Statement Template - Customer Portion

*--Start of customer portion of template--*

### Understanding the scenario
| Item | Answer | Description |
| -- | -- | -- | 
| Support case number | | To be entered by Microsoft Support |
| Describe the *technical* problem | | On a technical level, what is occurring that isn't desired? |
| How was the issue found? | | What were you attempting to do when you discovered this issue? Was this something new or something that changed recently? |

### Understanding the Impact
| Item | Answer | Description |
| -- | -- | -- | 
| This is blocking (pick one): | | Adoption / Pre-sales / Deployment / None |
| Select the priority (pick one) | | P0-Must fix ASAP / P1-Required for rollout / P2-Nice to have / P3-Not identified yet |
| Number of users and/or devices impacted | | Total number of users and/or devices directly affected. |
| How long has this been an issue? | | Days/Months/Years |
| How frequently is this issue faced? | | Daily, once a week, once a month, etc? |
| Does this affect your releases? | | Yes/No |
| Describe the impact on your end users/administrators | | What extra steps are needed? How long do admins have to spend on something that should be automated? |

### Understanding available existing solutions
| Item | Answer | Description |
| -- | -- | -- | 
| Is there a known workaround to this issue? | | Yes/No |
| If there is a workaround but it is not sufficient, describe why | | Why the workaround is not a viable solution. |

### Describing the Business Problem
| Item | Answer | Description |
| -- | -- | -- | 
| Describe the business problem in detail | | Monetary costs, compliance issues, added overhead, etc. |
| Describe how day-to-day business/operations are being impacted | | How many/what percentage of people are affected daily? |
| Describe what changed in the product or service to trigger this issue | | Is this related to an Intune service release and/or an OS change? |
| What is the latest date when this issue must be resolved by | | Business deadline? Note: This is NOT a commitment from Microsoft. |

*--End of customer portion of template--*

## Business Impact Statement Template - Engineer Portion

| Item | Answer | Description |
| --- | --- | --- |
| DCR Title | | Clearly describe the requested feature or change. Add SAP/SME area as prefix. Good patterns: "Add support for X platform in Y feature" or "Enable capability X for scenario Y" |
| DfM Case Number | | |
| Customer Name | | |
| Entra Tenant ID | | |
| Intune Account ID | | |
| Break/Fix and/or RFC ICM | | |
| Support engineer's assessment | | Your feedback on the customer's design change request and how helpful it would be for Intune as a service. Will it also help other customers? |
| Which category does this fall under | | Data loss / Reliability of Service / Compliance / Privacy / Security / Other |
| What workarounds have been investigated and/or attempted? | | Describe all workarounds offered, attempted, and results. Customer's willingness/ability to use them. |
