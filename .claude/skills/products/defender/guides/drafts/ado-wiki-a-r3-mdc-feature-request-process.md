---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/[Procedure] - MDC Feature Request Process"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Escalations%20and%20procedures/[Procedure]%20-%20MDC%20Feature%20Request%20Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Defender for Cloud (MDC) Feature Request Process (also known as Design Change Request)

[[_TOC_]]

## What is a Feature Request?
---
Any product idea, suggestion for improvement, new capability ask, or user interface change can be forwarded as a Feature Request. Feature Requests come from various sources as illustrated in the diagram below.

## Feature Request (FR) process?
---
The Product Group have come up with a standardized process to unify all Feature Request streams coming from customers through internal Microsoft employees. The purpose for this process is to achieve the most optimal holistic representation from field, partners and customers.

![Feature Request Sources](/.attachments/image-f7fb43b5-e565-4b8b-ae72-be37405fac76.png)

## How to Submit a Feature Request
---

Take the following steps to submit a new Microsoft Security Exposure Management Feature Request (FR):

1. Navigate to [Submit MTP DCR Request�� Employee Self-Service Portal](https://m365crm.microsoftcrmportals.com/mtprequest/mtprequest-create/).

2. Log in with your Microsoft credentials.

3. Complete the **Customer Details** section. In the product field, open the lookup window and select the appropriate product. You may select **Microsoft Defender for Cloud**.  

4. In the Customer field, search for your customer.  
_Note: If your customer does not exist in our system, please select �Microsoft Corporation�._

5. In the field _Search in our rich repository of features_, you can search for existing Feature Requests (please do so before submitting a new Feature Request), so that you can easily do a �+1�.  
_Note: You can use wildcards to search, like for example *incidents* this would return Feature Requests that either have the word *incidents* in the title or description.  
Please submit a Feature Request, despite knowing it is in our backlog, as this helps prioritize our planning._

6. If you are not able to find an existing Feature Request, select *Yes* under *Unable to find feature in CRM*.

7. Provide a title that describes your Feature Request in the *Feature Name* field.

8. Under *Feature Category*, select the best matching category.

9. Now complete the **Use Case** Section.

10. Describe the customer use case and the change they are requesting?
   - _Please provide details on what the customer is requesting for this DCR. This should include the use case and details on the change they are requesting._

11. What is the role of your customer?
   - _Please enter the role of your customer in their organization. This is typically going to be customer job title (Security Architect, Security Analyst, Security Manager, Incident
Responder, CISO, etc...)_

12. Desired Outcome
   - _Please state the end result the customer is trying to achieve. This should be a broad goal rather that tool specific. For instance prevent data from moving to an unmanaged device
is a desired outcome._

13. Then Complete the **Impact** Section to help us prioritize your customer�s Feature Request by completing the below

14. Select one of the following for Blocking:
- Adoption
- Pre-Sales
- Deployment
- None

15. Select one of the following for Priority:
- P0 - Must Fix ASAP
- P1 - Required for Rollout
- P2 - Nice To have
- Not Identified Yet

16. Does this fall into any of the categories below?
- Data Loss
- Reliability of service
- Compliance
- Privacy
- Security
- Others

17. How many user(s) and/or device(s) are impacted?

18. How long has the customer been impacted by the absence of this feature?

19. How frequently is the customer been impacted by the absence of this feature?

20. Describe the impact to end users / administrators due to the absence of this feature?
- _Describe impact to user in detail._

21. Then complete the *Workaround** section.

22. Is it possible to use a workaround?
- Yes
- No

23. What workarounds were investigated or attempted?
- Describe in detail all the workarounds offered attempted and the results. Also,
describe customer's willingness/ability to use one of the workarounds offered.

24. Describe why?
- If 'No', Describe in detail why a workaround is not offered/possible.

25. Optionally you can also Attach any supporting documents 

23. Finally, click on **Submit**.

## FAQ
---
1. **How can I get access to submit a Feature Request item?**
   - Request access to Distribution Group [MPS DCR Requestors](https://aka.ms/dcr/newdcraccess "https://aka.ms/dcr/newdcraccess") on IDWEB.

2. **How can I track the status of my Feature Request item?**
   - Follow this page [Security 360 - Unified Product Insights](https://aka.ms/CxE/UnifiedInsights) to open the FR Dashboard Tracker

   2.1. **What are the 3 tabs for on the FR Dashboard?**
   - **Feature Request**: These are the formal, fully created Feature Requests.
   - **Feature Lifecycle by Product**:  Overall view of feature requests per product (statuses, priority... etc) NOT very relevant for CSS
   - **FR Triage Queue**: These represent early-stage submissions that are still in triage by product team/CXE. Multiple DCRs may be consolidated into a single Feature Request if they reflect the same need.

3. **How can I get access to the FR Dashboard Tracker?**
   - Request access to this [CoreIdentity - Security CxE Shared Services](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/securitycxed-mnwm) entitlement.

4. **Are there any Wikis for the FR Dashboard Tracker?**
   - Yes, follow this page Request access to this [Unified Product Insights (UPI)](https://dev.azure.com/seccxeds/DataServices/_wiki/wikis/DataServices.wiki/684/Unified-Product-Insights-(UPI))

5. **Should I submit multiple feature requests if I get a request from different customers about the same feature?** 
   - Yes, even if you already filled the form and submitted the request for an FR, you have to fill another form and submitted if a different customer asked for the same feature. 

6. **How long will it take for my Feature Request to be reviewed?** 
   - The request will be reviewed within one day for any missing or unclear information. Then it will be triaged in a monthly meeting by the PG. The PG will contact you for any extra information. 

7. **What should I do with the case once the FR has been created by one of the approvers** 
   - Provide the CX an update that the FR has been raised. You may also ask the CX if you can archive the case see sample e-mail below,

    ```
    Hi <Customer>, 

    I hope this email finds you well. I wanted to inform you that I have raised the feature request on your behalf, and it is currently with our engineering team for review. 
    
    I cannot guarantee implementation or provide a specific timeline at this stage. However, rest assured that your request will be carefully examined by our Product Managers, and if deemed feasible, it will be added to our backlog for future consideration. 
    
    Can you please let me know if you have any further questions or if we can proceed with archiving this case. Looking forward to hearing from you.

    Kind Regards,
    
    [Your Name]
      
8. **What should I do if I have an urgent high priority feature request from a customer?** 
   - If a customer asked you for an urgent high priority feature request (P0), please submit the feature request with P0 priority and email the following contacts with the feature request title to get your request prioritized: 
     - [MDC EEE - DL](mailto:MDCEEE@microsoft.com;elourinho@microsoft.com?subject=%20P0-MSEM-Feature%20Request%20For%20Case%20XXXXXXXXXXXXXXXX&&body=Dear%20MDC%20Feature%20Request%20Reviewer,%0A%0AHere%20is%20my%20request%20for%20your%20review:%0A%0A1.%20Title%20of%20the%20FR:%20The%20title%20should%20capture%20the%20request%20in%20a%20one-liner%0A%0A2.%20Full%20description%20of%20the%20FR:%0A%0A3.%20Customer%20name:%0A%0A4.%20AAD%20Tenant%20ID:%0A%0A5.%20Reference%20Case%20number:%0A%0A6.%20Blocker%20type:%20|Adoption|Pre-Sales|Deployment|None|%0A%0A7.%20Priority:%20|P0%20-%20Must%20Fix%20ASAP|%0A%0A8.%20Impact:%20|What%20is%20the%20impact%20on%20the%20customer%20if%20we%20cannot%20deliver%20the%20feature,%20Alternatively,%20what%20is%20the%20gain%20for%20Microsoft%20if%20we%20delivered%20this%20feature|%0A%0A9.%20Possible%20Workaround:%0A%0A10.%20Solution%20envisioning:%20|describe%20how%20do%20you%20think%20this%20should%20work%20|)

## Acronyms
---
| Acronyms | Definition |
|--|--|
| DCR | Design Change Request |
| FR | Feature Request |

## Resources
---
Please watch the training and have a look at the deck presented by Alex Steele in the resources. It presents the whole process, examples, and might answer some of your questions. 
For any further questions, concerns, or feedback on the process, please reach out to one of your Technical Advisors.

- [MDC FR Process training](https://microsoft-my.sharepoint-df.com/:v:/p/elsagie/EZwUCIWdN0ZJqm8YhpDyvFkB6qEYsSKxdry9-Ga6ZQceXQ?e=xL2PE6)

<!-- Required: Details required to escalate issues to the Product Group-->
## Additional Information
---
  - **Internal Documentation**
    - [Design Change Request Process](https://dev.azure.com/ASIM-Security/SCIM%20Security%20and%20Compliance%20-%20Global%20Technical%20Community/_wiki/wikis/SCIM-Security-and-Compliance---Global-Technical-Community.wiki/14060/Design-Change-Request-Process)
      - [Unified Feature Request Process](https://dev.azure.com/ASIM-Security/SCIM%20Security%20and%20Compliance%20-%20Global%20Technical%20Community/_wiki/wikis/SCIM-Security-and-Compliance---Global-Technical-Community.wiki/14075/Unified-Feature-Request-Process)
      - [CRM Feature Request Guidance](https://dev.azure.com/ASIM-Security/SCIM%20Security%20and%20Compliance%20-%20Global%20Technical%20Community/_wiki/wikis/SCIM-Security-and-Compliance---Global-Technical-Community.wiki/14073/CRM-Feature-Request-Guidance)
      - [Feature Request Agent](https://dev.azure.com/ASIM-Security/SCIM%20Security%20and%20Compliance%20-%20Global%20Technical%20Community/_wiki/wikis/SCIM-Security-and-Compliance---Global-Technical-Community.wiki/14071/Feature-Request-Agent)

---
| Contributor Name | Details | Date (DD/MM/YYYY) |
|--|--|--|
| Eddie Lourinho/Esty Agmon | Updated process | 09/02/2026 |

---
:::template /.templates/Wiki-Feedback.md 
:::
