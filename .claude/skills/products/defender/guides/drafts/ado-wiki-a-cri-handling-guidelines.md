---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/MDC CRI handling playbook for EG/MDC CRIs: CRI handling guidelines"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Escalations%20and%20procedures/MDC%20CRI%20handling%20playbook%20for%20EG/MDC%20CRIs%3A%20CRI%20handling%20guidelines"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CRI handling guidelines
[[_TOC_]]



> **Note:**  
[2023-11-01]: This guidance refer to the **New IcM** experience. Make sure to enable to align to the new UI, structure and guidelines. On any IcM top right:  
![image.png](/.attachments/image-1a479b1f-b630-493c-a785-da0724730dec.png)

##MDC Custom fields
---
"Microsoft Defender for Cloud IcM service carry these custom fields:
1. **TA Approver:** Mandatory on creation.  
CSS must have their regional TA review and approve the CRI.
2. **Area Category:** Mandatory on Mitigation.   
Listing MDC's features and areas of the CRI issue.  

3. **Corrective Action** Optional.  
That was used to resolve the CRI

##Requesting additional information 
---
If more information is needed, @mention the IcM creator to notify them about your request.  

Once you type @ in the IcM discussion an input box appears, listing the IcMs relevant people:  
![Listing people involved in the IcM](/.attachments/image-3d161a3d-9985-4f3c-b5c4-a5d488eb38b0.png =x320)  
Choose the CRI creator and ask the question.  
When you @mention someone, IcM sends n e-mail to the person mentioned.  

<!--
# Investigating using IcM Troubleshooting Studio
---
IcM Troubleshooting Studio is a lightweight version of Azure Support Center (ASC).
1. Select the Troubleshooting tab.
2. Select the "Investigate using ICM Troubleshooting Studio" button in the top right corner:  
![Investigate using IcM Troubleshooting studio](/.attachments/image-614c6583-acfd-4a67-b1cc-957bd7ba41ae.png)
3. To see the subscription, its details and resources, choose the Resource Explorer from the left pane.
4. Click on the subscription ID to see its properties and configurations, such as assigned policies, ARG query, Access Control, Advisor Recommendations, Health status and more.  

On the Resource tree on the left, you can split the tree by Providers or Resource Groups. You can click on any resource to see its properties and settings.
> IcM Troubleshooting Studio is based on more elaborated "Azure Support Center" (ASC), but recently it removed the permissions except for CSS personnel.
-->

# Investigating customer's environment with Azure Support center (ASC)
---
**Azure Support Center (ASC)** is based on an active Support Request ID (also known as case or ticket). It gives you a detailed view of the customer's environment: subscription, resources, diagnostic and analytic data, reports and more.  
To access ASC, click on any of the links at the bottom of the summary (if the CRI was created from ASC as required):  
![image.png](/.attachments/image-e716acec-75df-4a64-a626-9f7f9d30e8c1.png =x180) -->


# CRI Mitigation/Resolution
---
Mitigate and resolve the CRI based on the criteria below. Strive to Mitigate the CRI ASAP!  
- Avoid leaving the CRI Active and unattended.
- If there are no more action items from your end - Mitigate the CRI.
- If you encounter a CRI outside your area of responsibility and are unsure how to proceed:
    
    *   Transfer it to the team you believe is responsible.
        
    *   If the responsible team is unknown, transfer it to the **CxE Care/CEM MDC**queue along with a summary of the information you have.  
*Note:To locate the CEM MDC IcM team, make sure to uncheck the **Only teams with an on-call rotation**option in the search settings.*  
![image.png](/.attachments/image-ef8ce492-aaab-4681-b077-b5a8d8d7a427.png =x180)  

## CRI mitigation criteria
---
- Noise
- Bug / WI
- By design
- Wont fix
- Customer error
- External team

## CRI Mitigation scenarios
1.  The issue is fixed and released to prod or
2.  A workaround was provided to the customer or
3.  The issue is fixed or get a fixed due date. The due date for GA was updated and shared with the customer or
4.  The issue is By Design and will not be fixed in the scope of the CRI.

## Mitigate Low quality or Noise CRI
---
Read this to learn if your CRI is Noise or not:  [MDC CRIs: Identify noisy CRI](/Defender-for-Cloud/MDC-Escalations-and-procedures/MDC-CRI-handling-playbook-for-EG/MDC-CRIs:-Identify-noisy-CRI)  

Mitigate the CRI as noise/LQ on these conditions:

- SE does not respond to information requests **within 48 working hours**.
- SE creator did not follow TSG/WF from [Microsoft Defender for Cloud CSS wiki](/Defender-for-Cloud/MDC-Escalations-and-procedures/MDC-CRI-Escalations-procedure-for-CSS) or as shown in the template.
- CRI is a known issue listed in [MDC Known issues](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_queries/query/09765519-4f67-40f2-bc4c-72300e37fdd4/) board.
- CRI did not use one of our templates.
- CRI was not reviewed or approved by a TA.
- Insufficient investigation or analysis provided in the summary.
- CRI is unclear.
- Duplicate

### Mitigating or Resolving as Noise/Low quality
1. Mitigate the CRI
   * Mitigation Steps Taken: Describe why it is Noise.
   * How Fixed: Other
   * Noise: Yes (Optional)
   * Auto-Resolve: Yes/No (Radion button, optional mark as you wish)
   * Click the Mitigate button.  

      Example:  
      ![Mitigating a CRI when clicking the mitigate button](/.attachments/image-d0d4fe9d-5b6e-468b-911d-a2a3df5bc7e7.png =x480)  

1. Select the **Custom fields** tab
2. Under **Owning service category - Azure** card below, find the **CRI Escalation Quality** field
3. Select the Reason for Noise:  
![Defining a reason for a noisy IcM when clicking on the CRI Escalation quality](/.attachments/image-9786ed5d-de20-4736-a91e-3339641c2f3c.png =x480)  
4. Click Save changes on the top right on the IcM form.

**Notes for Noise CRI**
- Use [MDC CRIs: Identify noisy CRI](/Defender-for-Cloud/MDC-Escalations-and-procedures/MDC-CRI-handling-playbook-for-EG/MDC-CRIs:-Identify-noisy-CRI) to identify and detect noisy CRI ahead.
- We do not accept IcMs created by or transferred from other products teams!  
Close the CRI as noise while instructing to follow the guideline from [MDC CRI Escalations procedure for CSS](/Defender-for-Cloud/MDC-Escalations-and-procedures/MDC-CRI-Escalations-procedure-for-CSS).
- When closing a CRI as Noise an email is sent to the CRI creator, his/her manager and the TA approver, asking for explanations.  
   [Email example](https://microsoft-my.sharepoint-df.com/:u:/p/elsagie/ERY98JRmzRVJnPoaclcZ5OYBlIMTRgAQqy2bZ04PunzGsA?e=5MVDc4)


## Mitigate CRI with ADO work item: Using Repair Items feature
---
CRI is a known issue, new bug, feature request or task.  

Applies to CRIs when:
1. CRI is a known issue of any type (bug/task/feature request/limitation etc.).  
   - We hold [MDC Known-issues board](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_queries/query/09765519-4f67-40f2-bc4c-72300e37fdd4/) that can be used for this purpose.  
**If the KI item does not exist, we will appreciate if you add it!**
2. Repair Item of ADO Work Item is linked to the IcM.
3. WI is assigned and ETA (Target Date) is provided.

### Linking a Repair Item WI
You can link existing bug/task/PBI from One\Rome project or with [MDC Known Issue](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_queries?tempQueryId=c92686fd-c153-4be1-87e8-3b87eb104ca9) items to Mitigate the CRI.

[IcM Repair Items](https://icmdocs.azurewebsites.net/workflows/Postmortem/VSTSrepairitems.html) is a feature linking ADO items to the IcM to help Mitigate the CRI dependent on the work item. Repair items in Azure DevOps are tagged at `Incident Repair Item` and the IcM added to the WI Links.

**Adding a Repair Item and Mitigate the CRI:**

1. On the IcM form, got to **Mitigation & resolution** tab. 
2. Select Repair Items link option:  
![Repair Items blade](/.attachments/image-c8174950-ffcf-4f09-b366-2dc8125fda36.png =x140)  

3. Select the profile:  
   - **VSTS:One Project** - for  most  MDC ADO bugs and tasks
   - **Known Issues Board (ASIM-Security)** - for Known-Issue item from [MDC Known Issues](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_queries/query/09765519-4f67-40f2-bc4c-72300e37fdd4/)
   - Connection to MSData - *less common*
   - Security Tools - Defender for Devops - *less common*
   - CommunicationManager - *less common*

3. Under Work item ID insert the WI Id:  
![How to add a work item to the repair items in IcM](/.attachments/image-8ce03c5b-611f-4a8c-90b6-3ad7f4d0da2a.png =x520)  


   Hit 'Tab' on your keyboard to automatically fetch the details from the WI.  
   
    If the work-item does not exist, you can create it from this wizard by selecting the "+ Add new" button.

4. Set the Type and Delivery of your choice.
5. Finish by selecting Review Incidents button.
6. After saving, WI is linked to the CRI:  
![result of the action when linking an azure devops work item to the IcM](/.attachments/image-df1bda64-12f3-40f1-8f10-3a81ed7fbdcf.png)  
7. The bug is tagged Incident Repair Item:  
![Result of the work item being linked](/.attachments/image-782ce14d-5e1e-4f50-bd5b-2db2480fc700.png)  
8. The bug Links gets a link back to the CRI:  
  ![Experience for the user when linking the work item](/.attachments/image-6983cda9-8d72-4528-ad98-864d67180546.png =x180)  
9. If bug doesnt exist and should be created, press the + at the Repair Items and follow the instructions to create new linked WI.
10. CRI can now be Mitigated 

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:white;background-color:purple">
   <b>Note:</b><br>The WI must be assigned and with ETA (Target Date) indicated!<br>
    Check the <a href=https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_queries?tempQueryId=c92686fd-c153-4be1-87e8-3b87eb104ca9> MDC Known-issues board</a> if your KI exists, <b>and create new one if not!</b>
   </div>  


## Mitigating a CRI (without a WI)
---------  
If there is no related bug or KI, CRI can be mitigated if:
- DRI provided a workaround to the issue.
- Issue is by-design and public doc link provided. If no public document exists, its doc bug.
- Issue caused by customer error and explanation provided.

On Mitigation:  
- Make sure to @mention the CRI creator saying that answer has been provided.
- Mark the CRI Pending Confirmation
- Upon Mitigation possible post (for Mitigation Steps Taken *) can be something like:  
    *"As solution/fix has been provided, I'm going ahead and Mitigate this IcM.  
   If you feel it still needs more investigation or you're not fully answered - Please re-activate this with additional information.  
   Else, please go ahead and Resolve this IcM."*
- Select the appropriate How Fixed reason.  


#Other Mitigation concerns
## RCA
---
Follow [MDC CRIs: Root Cause Analysis (RCA) provisioning](/Defender-for-Cloud/MDC-Escalations-and-procedures/MDC-CRI-handling-playbook-for-EG/MDC-CRIs:-Root-Cause-Analysis-\(RCA\)-provisioning)

### External owning team
- If the CRI should be transferred or handled by external Microsoft Dev team, its the DRIs responsibility to locate and transfer the CRI. If challenged, ask an [EEE](mailto:MDCaEEE@microsoft.com) for help to find the required destination team.  
- If the CRI was created by an external product support **CRI should be mitigate and resolved as Noise** referring the creator to [MDC CRI Escalations procedure for CSS](/Defender-for-Cloud/MDC-Escalations-and-procedures/MDC-CRI-Escalations-procedure-for-CSS#before-creating-the-cri). We do not allow othe teams to create CRIs directly, they must start with collaboration task with our support engineers.


## CRI Reactivation
---
For any reason the CRI is mitigated and/or resolved, CSS can reactivate it if the issue was not answered or fail to confirm. CSS must provide additional and updated information about the issue.  

## Sev 2 CRIs
Sev2 CRI has strict SLA times - 4 hours to mitigate.  
If the Sev2 CRI is about an **outage** we communicate with AzComm. AzComm communication is required to prevent support cases creation as result of the outage by having AzComm publish the outage to customers through different channels, mainly [Azure Service Health](https://ms.portal.azure.com/?l=en.en-us#blade/Microsoft_Azure_Health/AzureHealthBrowseBlade/serviceIssues/navigateTo/healthHistory/selectTrackingId/YNN3-BZ8).  
- [ICM Severity Definition ](https://microsoft.sharepoint.com/:w:/r/teams/SxG/_layouts/15/Doc.aspx?sourcedoc=%7BE9CF8A33-A166-4E64-B7F3-830AC760FDB3%7D&file=ICM%20Severity%20Definition.docx&action=default&mobileredirect=true&DefaultItemOpen=1&share=IQEzis_pZqFkTrfzgwrHYP2zAX1oetgbgGukpvSbMuhMLZM&ovuser=72f988bf-86f1-41af-91ab-2d7cd011db47%2Cakapetaniou%40microsoft.com&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI0OS8yMzA3MjMwMTAzNiIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D) we follow.

## Announcing outage or service downtime
---
Follow [MDC CRIs: Azure Service Health Communications for Outages & Downtime](/Defender-for-Cloud/MDC-Escalations-and-procedures/MDC-CRI-handling-playbook-for-EG/MDC-CRIs:-Azure-Service-Health-Communications-for-Outages-&-Downtime)
<br>
<br>

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
