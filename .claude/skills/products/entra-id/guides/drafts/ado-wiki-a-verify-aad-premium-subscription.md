---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Logs and Reporting/Azure AD Reporting Workflow/How to Verify if an AAD Tenant has a Premium subscription"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20Logs%20and%20Reporting/Azure%20AD%20Reporting%20Workflow/How%20to%20Verify%20if%20an%20AAD%20Tenant%20has%20a%20Premium%20subscription"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-orgmgt
- cw.Entra ID Logs and Reporting
- Workflow
- cw.comm-orgmgt-tsg
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
#Overview
This TSG will help you verify if the customer's AAD tenant has a Premium subscription or not, and if the premium subscription is still valid or if it has expired.

##Sample Premium subscriptions
This is not the complete list. Commerce can add a new premium subscription at any time. You can find the list of subscriptions in this document - [**Product names and service plan identifiers for licensing**](https://docs.microsoft.com/en-us/azure/active-directory/enterprise-users/licensing-service-plan-reference)
- AAD_PREMIUM  
- AAD_PREMIUM_P2  
- EMS -> Offers AAD_PREMIUM
- EMSPREMIUM \[SkuId: b05e124f-c7cc-45a0-a6aa-8cf78c946968\] -> Offers both AAD\_PREMIUM & AAD\_PREMIUM\_P2 
- M365EDU_A3_FACULTY - Offers AAD_PREMIUM
- M365EDU_A3_STUDENT - Offers AAD_PREMIUM
- M365EDU_A5_FACULTY -> Offers AAD_PREMIUM & AAD_PREMIUM_P2
- M365EDU_A5_STUDENT -> Offers has AAD_PREMIUM & AAD_PREMIUM_P2
- M365_G3_GOV
- SPE_E3 -> Offers AAD_PREMIUM
- SPE_E5 -> Offers AAD_PREMIUM & AAD_PREMIUM_P2
- SPE_E3_USGOV_DOD -> Offers AAD_PREMIUM
- SPE_E3_USGOV_GCCHIGH -> Offers AAD_PREMIUM
- IDENTITY_THREAT_PROTECTION -> Offers AAD_PREMIUM_P2
- SPE_F1 -> Offers AAD_PREMIUM  


##Here are the steps to check if a tenant has a Premium subscription

1. Look up the tenant in [ASC](https://azuresupportcenter.msftcloudes.com/) by supplying the case number. Once the tenant loads select "Customer" in the left menu and then select the _Subscriptions_ tab to check if you can find any of the premium subscriptions above. 

    For example, you can see from the screenshot below that the tenant has both AAD_PREMIUM and AAD_PREMIUM_P2.

    ![image.png](/.attachments/image-52af523b-064f-44d8-b0e0-21a6dffd173c.png)

    
   To see the details of a subscription such as Purchased/Start Date and Expiry/Next Lifecycle Date, expand the row:

   ![image.png](/.attachments/image-d2a4f0d2-6450-4738-a147-849a6ffce34d.png)

   **Note: It would be great if you can include the details of the tenant's premium subscription as shown above in the IcM.**

2. If in case you did not see any subscription from the list of sample Premium subscriptions above, copy the SkuId and look it up in this documentation - [Product names and service plan identifiers for licensing](https://docs.microsoft.com/en-us/azure/active-directory/enterprise-users/licensing-service-plan-reference).

   ![image.png](/.attachments/image-bafd1b5b-e5fb-4527-a90c-d3cbeee5d1dc.png)

   For example you wanted to check if **PBI_PREMIUM_P1_ADDON** has AAD_Premium or AAD_PREMIUM_P2, copy its SkuId and search it from the [Product names and service plan identifiers for licensing](https://docs.microsoft.com/en-us/azure/active-directory/enterprise-users/licensing-service-plan-reference) documentation.

   In the screenshot below, notice that it has EXCHANGE_S_FOUNDATION and PBI_PREMIUM_P1_ADDON but no AAD_PREMIUM or AAD_PREMIUM_P2. So for reporting, it is not considered a premium subscription. Continue to check the other subscriptions.

   Screenshot from _Product names and service plan identifiers for licensing_ documentation:

   ![image.png](/.attachments/image-14035d49-5171-43c0-9ac7-e14d770d177a.png)



   If you did not find any premium subscription then the tenant does not have it. Sign-in logs will not be sent to Azure Monitor.
