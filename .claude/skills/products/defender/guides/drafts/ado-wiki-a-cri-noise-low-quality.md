---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/MDC CRI handling playbook for EG/MDC CRIs: Noise-Low quality CRI"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Escalations%20and%20procedures/MDC%20CRI%20handling%20playbook%20for%20EG/MDC%20CRIs%3A%20Noise-Low%20quality%20CRI"
importDate: "2026-04-06"
type: troubleshooting-guide
---


[[_TOC_]]

# How to identify and tag CRI as Noise/LQ?

## MDC CRI must be:
---
1. Created by MDC support engineer.
2. Created from ASC (Azure Support Center) template, using the "Escalate case" button.
3. Reviewed and approved by listed TA Approver.
4. Followed by initial investigation using existing TSG.

**Violation of any of the above topics could be a reason to close the CRI as Noise/LQ!**

# CRI Escalation Low Quality reasons
- Bypassed EEE
- Not Reviewed By TA
- Did Not Follow TSG
- Did Not Use Template
- Template Not Filled Correctly
- Improper Severity (not aligned with CEN)
- Insufficient Analysis
- Insufficient Collaboration
- Ask Not Clear
- Routed to incorrect service/team

- N/A



### External CRIs
---
We prefer and recommend that MDC CRI be created by MDC SE. CRIs created by external support teams are taken with careful inspection and often rejected.  
External support engineers (SE) should create a collaboration task to involve MDC SE that is trained and familiar with the product's troubleshooting.  

CRI suspected as external:  
   - If it's too basic and could have been resolved with known TSG or documentation.
   - 'TA Approver' custom field is "Live-Site" rather than a person name.
   - Ask: the CRI creator, the TA approver or [MDC EEE](mailto:MDCaEEE@microsoft.com).

**Note:**  
The CRI may have been transferred between different services and teams. You can check the discussion history to see if it was originally created for another product before it was assigned to us.  
If the issue is too basic or lacks helpful information, close it as Noise.  
If the issue is bouncing around different services and ends up in your queue, **use your own judgment** or transfer to **CxE Care/CEM MDC** queue.
<br>

### Not created from ASC  
---
1. ASC suggests a [template](https://microsoft-my.sharepoint-df.com/:x:/p/elsagie/Ee2pg_vyKK9FpNmzpEPREoIBsvR7dqSJbGEN_kYetzJV4w?e=ZTMvZw&nav=MTVfezlFNDU1NEM0LTk2MjktNDhGNi1CMTY0LTA5Mzc2RjQzQkQ1RX0) for default settings and instructions in the summary body.

2. ASC add environment details to the bottom of the summary, e.g.:
   > ![image.png](/.attachments/image-61830639-528e-4f88-aa9a-cf00ce4e13f5.png =x160)  

If any is missing close as **Noise: Did Not Use Template**

### Not Reviewed By TA  
---
The list of approvers registered under the *Custom Fields - TA Approver* field. One must be indicated.  
If it's blank you can close it as **CRI Quality: Not Reviewed By TA**.  


### Insufficient Analysis
---
Does the CRI have evidence that the initial investigation was conducted? <br>or Could CSS resolve the case following existing TSG?
---
The SE followed by the TA Approver must conduct their initial investigation. Missing investigation evidence, preferably followed by existing TSG, is **CRI Quality: Insufficient Analysis**.

Missing trivial details, for example claims about an agent without checking for valid heartbeat, also falls under that category. 

---
# [How to close a CRI as noise](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/5671/MDC-CRIs-CRI-handling-guidelines?anchor=as-noise)

#Important notes
---
- If you unsure how to process the CRI further, feel free to **transfer it to CxE Care/CEM MDC** IcM team with a description of the status up to date.
- Any CRI **can be reactivated** by the SE after clearing the noise, e.g. conducting initial investigation, got TA approver, add missing information, more...
- Default CRI retention period is 60 days. Past this the CRI cannot be edited or change anything.
- Find more about CRI handling in [MDC CRI handling playbook for EG](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/5663/MDC-CRI-handling-playbook-for-EG)


<!--

- Reactivated noise CRI - should I accept it? what's the criteria for it? (Information provided, initial investigation conducted, etc.).
   - Where noise reason is not created by ASC and not approved by TA (or lied about) not eligible for reactivation.

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
