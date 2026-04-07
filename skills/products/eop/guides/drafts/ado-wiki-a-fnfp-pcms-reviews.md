---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Tips & Hints/Guideline to help on FNFP PCMS Reviews"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTips%20%26%20Hints%2FGuideline%20to%20help%20on%20FNFP%20PCMS%20Reviews"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Guideline to help on FNFP PCMS Reviews

## Overview
The purpose of this guideline is to assist specifically to FNFP PCMS reviews and ensure that all reviewers adopt a consistent approach. This will help identify potential opportunities, align with FNFP TSGs, and enhance our support for customers on this topic.

## FNFP TSG Documentation Summary
- [Troubleshooting False Positives and False Negatives - Overview](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/7858/Troubleshooting-False-Positives-and-False-Negatives)
- [Troubleshooting False Positives and False Negatives - Information Collection](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/7858/Troubleshooting-False-Positives-and-False-Negatives?anchor=information-collection)
- [Troubleshooting False Positives and False Negatives - Severity Matrix](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/7858/Troubleshooting-False-Positives-and-False-Negatives?anchor=severity-matrix-%E2%80%93-escalating-fp/fn-to-engineering)
- [Troubleshooting False Positives and False Negatives - How to Escalate to Engineering](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/7858/Troubleshooting-False-Positives-and-False-Negatives?anchor=escalating-to-engineering)

## Key Points to Review on a FNFP Case
Always align first if it is a FNFP case. If not, make sure that the SAP is realigned to the correct scope.

### FNFP Case Without Escalation
- [ ] Make sure the SAP is aligned to the FNFP case scope (if an FP or FN).
- [ ] Validate if customer has provided the information needed for FNFP (e.g. SubmissionID, NMID, URLs)

**FNFP information is provided by the customer:**
- Check if the Case Owner has run the FNFP Diagnostics
- If the Diagnostics was run, check if the output refers to configuration or to escalate:
  - If the output was Configuration, validate if it was communicated to customer
  - If the output is to escalate, why escalation is not raised?
  - Make sure that the escalation is prepared based on the FNFP template

**FNFP information is still NOT provided by the customer:**
- Validate on the communications that the needed information (e.g. SubmissionID, NMID, URLs) is being asked to the customer
- Validate if a meeting has been suggested to the customer to assist on the collection of data
- If customer is unresponsive, validate if the Account team is involved

### FNFP Case With Escalation
- [ ] Make sure the SAP is aligned to the FNFP case scope (if an FP or FN).
- [ ] Check on the IcM if there is progression on the escalation
  - **If mitigated**: Was this communicated to the customer?
  - **If still active**: Validate where the IcM is pending and assist if needed to progress.

## Expected Steps After Case Is Reviewed
If opportunities are identified during the review, the reviewer must contact the case owner for a coaching session to help progress the case. This session should occur after the review to avoid further delays.
