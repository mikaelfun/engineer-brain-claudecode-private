---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Grace Period/Grace Period for Windows 365 Enterprise"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Grace%20Period/Grace%20Period%20for%20Windows%20365%20Enterprise"
importDate: "2026-04-21"
type: guide-draft
---

**How to check if an Enterprise CPC is in Grace period using CPCD:**

You will require the following information from the customer: 
_Tenant ID
User ID_
Access CPCD and go to the **Action Diagnostic** blade. Scroll down until you reach **Action Events Overview** and look for the CPC which is attributed to the **User ID**:

![image.png](/.attachments/image-b01d298d-bdcc-47de-9686-7ec6a15a1221.png)

In the service plan column you will need to look for **Enterprise**.

**IMPORTANT!**

The Grace period should have the statuses in a chronological order: Draft -> Success. That will confirm if the machine is indeed in grace period. If you are seeing the Cancel Grace period in between, it means that at that moment the user got assigned a new license or add to the provisioning policy.

It is also important to check the **OriginalServicePlanID** Column to make sure that we are seeing the same resource:

![image.png](/.attachments/image-18b995d0-05cc-4497-8514-32567f82a670.png)