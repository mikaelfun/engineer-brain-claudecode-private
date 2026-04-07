---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/MDC CRI handling playbook for EG/MDC CRIs: SLA and KPIs"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Escalations%20and%20procedures/MDC%20CRI%20handling%20playbook%20for%20EG/MDC%20CRIs%3A%20SLA%20and%20KPIs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MDC CRIs: SLA and KPIs

## SLA
---
Based on the IcM severity the SLA is defined in [Azure CEN](https://aka.ms/AzureCEN) (Classify, Escalate, Notify) matrix.   
   - Note: We are in the process of defining [new CEM Matrix for C&AI engineering: [CRI CEN_Draft_2024.docx](https://microsoft-my.sharepoint.com/:w:/p/evanba/EbqH5sBWGJ9MuF2JrgkFEFABMvwpAdIcxu7AJ6qxKUHwQg?e=QaSDkS).

For CRIs Sev 3&4 the SLA for mitigation is:  
![image.png](/.attachments/image-84b4b68a-40e6-4135-ba5e-e92dbf523cc4.png =x180)  
Since 72h mitigation time is not quite feasible, MDC LT defines a goal of 20 days mitigation p75 average.

## Microsoft service availability SLA agreement
---
- [Service Level Agreements (SLA) for Online Services](https://www.microsoft.com/licensing/docs/view/Service-Level-Agreements-SLA-for-Online-Services?lang=1&year=2025)



**The following Service Levels and Service Credits are applicable to Customer’s use of each Protected Node:**  
![image.png](/.attachments/image-1a657d55-cabd-4e69-b864-0098af5234f3.png =x50)  
| Uptime Percentage<br> | Service Credit<br> |
| --- | --- |
| < 99.9%<br> | 10%<br> |
| < 99%<br> | 25%<br> |


## S500 CRIs and RCA
---
S500 customers are eligible to request RCA on their ticket CRI.  
S500 CRIs are marked with ***S500 RCA Process Awareness*** in the summary.

RCA is requested by indicating “RCA Needed” custom field:  
![image.png](/.attachments/image-0d1d4f21-32a2-435a-828e-e977d5e56bd7.png)

To fill in the RCA use the Root Cause section under **Mitigation & resolution** tab.

More S500 and RCA details: [Azure S500 Quality RCA Experience](https://microsoft.sharepoint.com/:p:/t/appsinfra/EcoQor4MRv5LoVdURz-NCP0B7Cq5GsuT2Ov4LBFU0ArjiQ?e=ncMAsi).

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
