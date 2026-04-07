---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/General Guidance/Finding customer CSAM and IMs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGeneral%20Guidance%2FFinding%20customer%20CSAM%20and%20IMs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
Sometimes S500 customers do not open their support cases under the right support contract to get premier support even when they have a premier or unified support contract.

In these instances, if you need to find the customer's CSAM or IM you can try these steps

1. Take **tenant ID** from DFM \ Case Buddy \ Customer Verbatim
2. Search https://lynx.office.net by tenant ID -> Account -> Identity -> Locate **MSSales Top Parent Org ID**

   ![image.png](/.attachments/image-e960016d-a8ff-4a60-8d14-dda7cdffcfe2.png)

   **NOTE**: If case is properly linked to unified premier support contract the TPID can also be found in DFM or Case Buddy's More info - Actions tab.  [See Example](/.attachments/image-b24c01d8-eb06-4737-badc-c101385cf208.png) but this should also mean case has CSAM+IM listed as well
  

2. Open https://aka.ms/whoisthecsam
3. Use filters to filter by **MSSales TPID** found in previous step

   ![image.png](/.attachments/image-5650f5f3-85ab-4f84-b3f8-beee5beaa5b0.png)

4. You should now find the customer's Primary + Secondary + Incident Managers listed in this report
