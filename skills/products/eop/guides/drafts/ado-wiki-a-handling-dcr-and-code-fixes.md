---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Process Documentation/Global Processes/Handling Design Change Requests (DCR) and Code Fixes"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FProcess%20Documentation%2FGlobal%20Processes%2FHandling%20Design%20Change%20Requests%20(DCR)%20and%20Code%20Fixes"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Handling Design Change Requests (DCR) and Code Fixes

## Purpose
Ensure that Design Change Requests (DCR) and Bug Fixes developed by the Engineering team are handled efficiently and communicated clearly to customers.

## Process Steps

### 1. Initial Assessment
- **DCR Creation**: Check for previous DCRs of the same request. If a parent DCR/User Story [DCR] already exists, reference this User Story [DCR]'s link in your escalation. Do not add comments to the User Story [DCR] (strictly for PG).
  - For Business Impact Statement: use BIS Template
- **DCR Acceptance/Rejection**: Once Engineering has evaluated the request:
  - **Rejection**: Give the customer time to review. No need to proceed with Step 2. Explore alternative solutions or consider archiving the case.
  - **Acceptance**: Move to Step 2.
- **Bug Fix Work Item Creation**: Engineering may create a work item for the bug fix. This process may take several months to resolve.

### 2. Engage Customer Success Account Manager (CSAM)
- **Provide ADO Work Item/DCR**: Engage the CSAM or account team with the Azure DevOps (ADO) work item or DCR to follow up on.
- **Two-Week Follow-Up Timer**: Allow the CSAM two weeks to follow up with the customer.
- **Communication with CSAM**: Inform that you will keep the case open for a couple of weeks and update the customer about the acceptance and engagement with the CSAM. Request inclusion in the initial call between the CSAM and the customer.

### 3. Customer Communication
- **Post-Account Team Conversation**: After the account team has communicated with the customer, follow up to archive the case professionally.

### 4. Archive/Close
- Final Steps: Archive and close the case once all necessary communications and actions are completed.

## MDO DCR SLA
The SLA for the DCR is **30 days**. Set up expectations that the DCR may take up to 30 days to be analyzed.

## Handling Pushback from CSAM/Account Team
- **Engage with M1**: If the CSAM or account team pushes back, engage with M1 to start a conversation with the CSAM.
- **Email Communication**: Use email to communicate with the CSAM.

## Customer Email Template
*Note: do not reference a Work Item's URL, only the Work Item number*

```
Dear [Customer Name],

I hope this message finds you well.

We are writing to inform you that the [design change request (DCR) or Code Fix] associated with your case has been reviewed and we will proceed with archiving your case.

Here are the key points regarding this decision:

- CSAM Point of Contact: Your Customer Success Account Manager (CSAM) will remain your primary point of contact for any further inquiries related to [DCR or Code Fix].

- Long-Term Process: Please note that the work being developed for this issue is long-term and we may not provide a completion date, due to varying factors in the development cycle.

- Continued Engagement: Your CSAM can still be engaged to provide updates on the progress of the code development process or assist in engaging with Support again as needed.

- Work Item: For your reference, the Work Item associated with this case is [Work Item].

We appreciate your understanding and patience as we work towards a resolution. Should you have any questions or need further assistance, please do not hesitate to reach out to your CSAM.

Thank you for your continued partnership.

Best regards,
[Your Name]
[Your Position]
[Your Contact Information]
```

## Talking Points for Engineers
- **CSAM as Point of Contact**: Emphasize that the CSAM is the primary point of contact.
- **Long-Term Process**: Clearly communicate that the fixes are long-term and we may not provide a completion date.
- **Continued Engagement**: Highlight that the CSAM can still support as required.
- **Bug Number**: Always include the bug number in communications for tracking.
