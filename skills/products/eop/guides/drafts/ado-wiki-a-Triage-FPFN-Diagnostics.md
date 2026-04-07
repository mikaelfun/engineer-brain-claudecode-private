---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Triage and escalate FPFN quickly with new diagnostics"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FTriage%20and%20escalate%20FPFN%20quickly%20with%20new%20diagnostics"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview
To help you handle False Positive and False Negative (FP/FN) issues in Microsoft Defender for Office 365 easily and effectively, we’re introducing three new Assist 365 diagnostics:
- **Review Submission Activity**
- **Defender for Office 365 Message Explorer**
- **Review ODSP (OneDrive/SharePoint) and Teams Malware Verdicts**

**Bookmark and follow [aka.ms/fpfn](/Troubleshooting-Guides/Troubleshooting-False-Positives-and-False-Negatives) for detailed escalation steps.**

# Review Submission Activity

<span style="color: Green;"> **Applies to : Email messages and URLs**
 
This diagnostic provides an overview of all admin and end-user submissions for a tenant within a specified time frame. It helps in identifying false positives and false negatives **admin** or **user** submissions in the customer environment (tenant) without needing to repeatedly ask customers for submission IDs.

# Defender for Office 365 Message Explorer

<span style="color: Green;"> **Applies to : Email messages and URLs**

This diagnostic offers an in-depth analysis of submission IDs or network message IDs. Access it directly by searching for it in Assist 365 or through the **Review Submission Activity** diagnostic results. Microsoft Defender for Office 365 (MDO) Message Explorer **Scenarios** provide insights into how MDO handled a message and how to troubleshoot False Positives and False Negatives. You can provide up to 20 Ids separated by a comma to lookup multiple messages or submissions at once.

The **Scenarios** in the Defender for Office 365 Message Explorer diagnostic are designed to help you quickly determine whether the issue you’re working on is a **true FP/FN** that demands an escalation to the **Analysts (FPFN)** team or not (for example, authentication or configuration issues).

## Available Scenarios

### Review Details of a Submission

Provide one or more Submission IDs or Network Message IDs. Narrowing results to a specific recipient is optional. For each submission, the diagnostic provides:

  - Status visible in the Submissions Portal
  - Original scanning verdict (initial filter results)
  - Rescan verdict (results after submission)
  - Triage status (system or grader)
  - Suggested action plan

### View Filtering Details of a Message (Spam Verdict Reason)

Provide one or more Network Message IDs. Narrowing results to a specific recipient is optional. For each message, the diagnostic provides:

  - Filtering details of a message
  - Time Travel (ZAP) activity
  - All tenant and mailbox level overrides
  - Suggested action plan
 
### Review Timeline, Click, and Detonation Details

Provide one or more Network Message IDs. Narrowing results to a specific recipient is optional. For each message, the diagnostic provides:

  - Timeline of Events
  - Time Travel (ZAP) activity
  - Safe Attachments and Safe Links Detonation Activity
  - Url Click Activity
 
**NOTE**:<span style="color: red;"> The legacy **Review Spam Filter Verdict Reason** and **Review Submission Explorer Entries** are in the process of being deprecated. Therefore, it is strongly recommended to use the new diagnostics for handling false positive and false negative issues. 

# Advantages of the New Diagnostic Experience

- **Faster visibility:** Look up messages within minutes of delivery, rather than waiting hours.
- **Recipient-level insights:** View results specific to each recipient for more granular analysis.
- **ZAP and time-travel visibility:** View Zero-hour Auto Purge (ZAP) and time-travel actions applied to messages.
- **Batch processing:** Analyze up to 20 messages simultaneously, improving efficiency.
- **Comprehensive reporting:** Generate full reports on any Tenant or user level allows.
- **Filter transparency:** See all filters that were applied to a message—even those that didn’t influence the final verdict.

# Demos
## Scenario: Review Details of a Submission

Watch the 15-minute demo video on how to run diagnostics for the scenario 'Review Details of a Submission' and interpret the results.

<span style="color: Green;">**NOTE: While preparing the demo, a bug was discovered in the Defender for Office 365 Message Explorer diagnostic tool that prevented the lookup of submission details for multiple submission IDs or network message IDs simultaneously. This issue has now been resolved**.

[![MDO Diag Demo - MDO Message Explorer and Review Submission Activity (April 2025) | QA Platform](/.attachments/EOPDiag/Picture3.png)](https://platform.qa.com/resource/mdo-diag-demo-mdo-message-explorer-and-review-submission-activity-april-2025-1854/?context_id=12116&context_resource=lp)

## Scenarios: View Filtering Details of a Message (Spam Verdict Reason) & Review Timeline, Click, and Detonation Details

Watch the 15-minute demo video on how to run diagnostics for the Scenarios 'View Filtering Details of a Message (Spam Verdict Reason)' & 'Review Timeline, Click, and Detonation Details' and interpret the results.

[![MDO Diag Demo- MDO Message Explorer -View Filtering and Timeline details (May 2025) | QA Platform](/.attachments/EOPDiag/Picture4.png)](https://platform.qa.com/resource/mdo-diagnostic-demo-view-filtering-and-timeline-details-1854/?context_id=12116&context_resource=lp)

# Action FP/FNs Based on Diagnostic Results

## Run the Diagnostic
Get the Submission IDs from **Review Submission Activity** or from the customer and execute the **Defender for Office 365 Message Explorer** to review submission details. Let’s explore the first way to obtain this information.

- To start Defender for Office 365 Message Explorer via **Review Submission Activity** diagnostics results, review the results and find the **`Get Submission Details`** link at the bottom of the results pane. This will **prepopulate** the diagnostic with the results on the screen, as per the following screenshot.

![SubmissionActivity](/.attachments/FP-FN/SubmissionActivity.png)

- The other way is to execute Defender for Office 365 Message Explorer **directly** using Submission ID or Network Message ID or both, as per the following screenshot:

![MDOMessageexplorer](/.attachments/FP-FN/MDOMessageexplorer.png)

## Understanding the Result Fields
Review these fields in the submission details results from **Defender for Office 365 Message Explorer** to decide whether escalation to analysts is required:

- Submitted as
- Final verdict before submission
- Rescan verdict after submission
- Triage status
- Action needed

![Submissiondetails](/.attachments/FP-FN/Submissiondetails.png)

- **Submitted as:** This refers to the initial classification or category under which an email or URL was submitted by the user or admin for review. It indicates the type of false negative issue reported, such as spam (Junk), phish, or a false positive issue (non-junk).
- **Final verdict before submission:** This is the original classification or decision made by Microsoft Defender for Office 365 **`before`** the user or admin submitted the item for review. It represents the initial assessment of the email or URL, such as marking it as spam or safe.
- **Rescan verdict after submission:** This refers to the updated classification or decision made by the system **`after`** the item has been resubmitted and rescanned in Microsoft Defender for Office 365. It shows whether the system verdict has changed following the submission, such as reclassifying a previously marked spam email as safe.
- **Triage status:** This indicates whether the submitted item has undergone further analysis by the grading team or system. It shows if the submission was reviewed by human graders or automated systems to determine its accuracy and appropriate classification.
- **Action needed:** This provides guidance on the next steps required to address the submission. It includes recommendations for support engineers or admins, such as creating allow/block rules and/or escalating the case to Analysts (FPFN) in Assist 365 if the customer disagrees with the verdict.

# Was this truly a FP/FN or when to escalate to Analysts (FPFN)?

If the **Triage status** indicates any of the following results, <span style="color: Red;"> an escalation is most likely **not required**. </span> Proceed with the suggestions specified under the **Action needed** section and escalate only when necessary. Review the result with a SME/PTA/TA if you’re unsure if the result demands an escalation.

  - The message was reported as a False Positive and rescan shows that the message is clean. The message was originally filtered due to a spoof or due to domain/user/mailbox intelligence impersonation verdict, **not** due to message content.
   - This Machine Learning False Positive was automatically triaged upon submission since the **rescan verdict aligned** with the reason the message was submitted.
  - The message was reported as a false negative. Our filters identified this message as spam (or another value). The message was allowed to deliver due to a tenant override (a configuration issue).
  - The submission was detected as spam (or another value) on rescan, which **aligns with the reason** the submission was made. This indicates our filters have already been updated to identify these correctly.
  - The submission system identified this as a newsletter. (Here, an escalation may be warranted **only** if the customer doesn’t agree with a BCL verdict of a message).
  - The submission was triaged by the grader team and given a verdict of (any value).


If the **Triage status** indicates any of the following, <span style="color: Red;"> an escalation is most likely **required**. </span> Proceed with the suggestions specified under the **Action needed** section, collect the necessary information from the customer and escalate accordingly if necessary.
  - The submission never made it to the back end.
  - The original message is unavailable and cannot be processed.
  - The submission has not yet been triaged by the grading team.
  - The grading team marked this as a false submission, meaning that our filters gave a verdict (of any value) and they believe that to be correct.
  - This submission was automatically triaged as having bypassed content filtering. This happens when an internal M365 component needs to bypass filtering, such as delivery to Quarantine or when Malware has previously been detected.
  - The grading team marked this is as an invalid submission due to missing M365 headers.

# Review ODSP (OneDrive/SharePoint) and Teams Malware Verdicts

<span style="color: Green;"> **Applies to : Files uploaded to OneDrive, SharePoint, and Teams**

Allows you to provide one or more SHA256 file hashes and see the scan results for the files in Teams, SharePoint Online, and OneDrive for Business. It also provides guidance on how to troubleshoot a False Positive as well as how to correct False Positive detections and unblock files. You can provide up to 20 file hashes at once, separated by a comma.

Here is a quick demo for you to take a look at for running this diagnostic:

[![MDO Diag Demo - Review ODSP and Teams Malware Verdicts (July 2025) | QA Platform](/.attachments/EOPDiag/Picture5.png)](https://platform.qa.com/resource/mdo-diagnostic-demo-review-odsp-and-teams-malware-verdict-july-2025-1854/?context_id=16492&context_resource=lp)

**Bookmark and follow [aka.ms/spofp](https://aka.ms/spofp) for detailed FP/FN Troubleshooting and escalation steps for files uploaded to SPO, OneDrive and Teams**

# Feedback
If you find issues or have recommendations on these diagnostics, email mdodiagnosticfeedback@service.microsoft.com. Your voice is important for its continuous improvements. 
