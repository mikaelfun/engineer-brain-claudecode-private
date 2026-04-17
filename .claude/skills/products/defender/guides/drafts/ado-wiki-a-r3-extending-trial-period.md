---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/[Procedure] Extending the trial period for Microsoft Defender for Cloud plans"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Escalations%20and%20procedures/[Procedure]%20Extending%20the%20trial%20period%20for%20Microsoft%20Defender%20for%20Cloud%20plans"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Extending trial period for Microsoft Defender for Cloud plans

## Summary
-------

Currently, Microsoft Defender for Cloud (MDC) offers a one-month free trial for all its plans simultaneously. Starting in November 2023, the trial period will be plan-specific and extendable for requesting customers or their representatives. This change allows valuable customers to conduct proof of concept (POC) on their environment for an extended duration before purchasing a plan.

## Detailed Explanation
--------------------

The MDC trial period is now tailored to individual plans and can be extended upon request. This initiative aims to provide customers ample time to evaluate the service before committing financially. The extension process involves creating an IcM (Incident Management) request that follows specific guidelines.

## Requesting trial extension
---

1.  Create an IcM using the [**IcM template #'z3p3e2'**](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=z3p3e2).
    *   **Note:** Do not increase the severity level of the IcM; it should remain at Severity 3 or 4.
2.  The IcM is assigned to Embedded Escalation Engineer (EEE) for approval. If the request exceeds 90 days, allow additional time for Product Group (PG) approval.
3.  Once approved, EEE transfers the Customer Reported Incident (CRI) to the "Defenders - CRIs" queue for implementation.
    *   **Service Level Agreement (SLA):** 3 business days.

### Required Information
---
1. *   **Azure:** Subscription(s) ID
   *   **AWS:** Account(s) ID
   *   **GCP:** Project(s) ID
2. *   List of MDC plan(s) requested for extension, separated by commas
3. *   Start date
4. *   End date
5. *   Number of resources, estimated or real
6. *   Customer name (found under Custom fields - Owning service - Microsoft Defender for Cloud - Customer Org name/domain)
7. *   Contact name including CSAM/CxE/requestor name and MS title

### Prerequisites and requirements
---
1.  **AWS/GCP connectors must be configured and connected to an enabled Azure subscription,** prior to the Trial extension request.
2.  Use the IcM template without altering its title or severity level.
    *   For urgent requests, contact EEE after creating the IcM.
    *   New subscriptions are entitled to a 30-day trial by default without any action required.
    *   If a subscription has exhausted all its trial days and risks being charged post-enablement, state this clearly and mention that enablement awaits extension application.
3.  After creating the IcM request, **track it continuously until it's mitigated or resolved.**

## Trial extension request handling
---------------------------------

1.  When an IcM is mitigated, it indicates that the extension has been applied unless stated otherwise by Directly Responsible Individual (DRI).
2.  The backend system configures trial extensions.  
**Trial extension is not visible on the subscriptions, does not display remaining trial days and not indicated in the invoice**
    *   Verification requires checking invoices retroactively for no-charges.
3.  MDC covers any charges incurred during the trial extension period.



## EEE troubleshooting guide
---------------------------------

There are two ways you can verify trial extension of a subscription:

1. Two hours after the PG submitted the trial extension to production, check if the respective subscription id / security connector id is in the forbidden list of the relevant Billing application by running the following Kusto query:

   ```q
   //Run in Kusto Data explorer
   let customerId = "<customerId>"; // customer id is subscription id for Azure, AWS account (PlatformEC2, PlatformDCSPMAWS) or workspace id (PlatformWS)
   let billingApplicationName = "<applicationName>"; //for example:"fabric:/PlatformVM.Application", refer to the table below
   cluster('https://romeservicelogs.kusto.windows.net').database('RomeServiceProd').ServiceFabricDynamicOEBil2
   | where env_time >= ago(15d)
   | where applicationName  == billingApplicationName
   | where operationName == "BillingTaskActorService.BillingTaskLogic.BillCustomerAsync"
   | extend customData = todynamic(customData)
   | extend Identifier = tolower(tostring(customData.Customer.Identifier))
   | extend isCustomerInForbiddenListNow = tobool(tolower(tostring(customData.isCustomerInForbiddenListNow)))
   | extend isCustomerInForbiddenLisInFuture = iff(not(isCustomerInForbiddenListNow) and isnotnull(customData.Customer.ForbiddenListStartTime), tostring(todatetime(customData.Customer.ForbiddenListStartTime) > now() and now() < todatetime(customData.Customer.ForbiddenListEndTime)) , "N/A")
   | where Identifier == customerId
   | extend MeterId = tostring(bag_keys(parse_json(customData.SumOfQuantitiesByMeter))[0])
   | extend TrialStartDate = todatetime(tostring(customData.Customer.ForbiddenListStartTime))
   | extend TrialEndDate = todatetime(tostring(customData.Customer.ForbiddenListEndTime))
   | project env_time, isCustomerInForbiddenListNow, isCustomerInForbiddenLisInFuture, applicationName, TrialStartDate, TrialEndDate, MeterId
   ```
- If isCustomerInForbiddenListNow = True or isCustomerInForbiddenListInFuture > current datetime, then it means the trial extension was applied.

- If needed you can also filter by the respective MeterId by applying its respective filter.
Meter ID key value list can be consulted in [this page](https://dev.azure.com/msazure/One/_git/Rome-Skw-SharedInfra?path=/src/KustoFunctions/TelemetryFunctions/AB%20-%20Common/AC%20-%20PaasTelemetry.csl&_a=contents&version=GBmaster).

| Application Name | Partition Key | 
|------------------|---------------|
| Platform         | acr           |
| PlatformAKS      | aks           |
| PlatformAKV      | akv           |
| PlatformAkvNodes | akvn          |
| PlatformAPI      | api           |
| PlatformAppSer   | appser        |
| PlatformARM      | arm           |
| PlatformArmNodes | armn          |
| PlatformContainers | con         |
| PlatformCosmosDB | cosmos        |
| PlatformDCSPM    | dcspm         |
| PlatformDcspmAws | dcspma        |
| PlatformDcspmGcp | dcspmg        |
| PlatformDNS      | dns           |
| PlatformEC2      | ec2           |
| PlatformStorage  | strg          |
| PlatformStorageData | strgd       |
| PlatformVM       | vm            |
| PlatformWS       | ws            |


2. Go to the [CustomerSettings.csv file](https://msazure.visualstudio.com/One/_git/Rome-Skw-Billing-Platform?path=%2Fsrc%2FApplications%2FPlatformAppSer%2FPlatformAppSer.Deployment%2FServiceGroupRoot%2FCustomerSettings%2FPrd-Weu%2FCustomerSettings.csv&version=GBdevelop&_a=contents) containing the list of subscriptions and plans inserted to extension.
   - Make sure it is on `develop` brunch:  
     ![Customer Settings .csv](/.attachments/image-0a4e26d4-79b8-4b97-a2e1-75024071d3eb.png =x80)  
   - **Download** the csv! The file is too big to display in ADO page.  
     ![Customer Settings .csv](/.attachments/image-7eff36f4-ec3a-4265-b1fb-7b358355925f.png =x120)  
   - Search by subscription/Account Id (same value for `customerId = "<customerId>"`)   
   - **If the column IsInForbiddenList = TRUE then the extension is set in place.**


## Additional information
---
- In most cases, the requestor will be the customer's representative: CxE, CSS, CSAM, PM and others.
- No need for Support Request.
- No need for CRI/IcM TA Approver - tag the EEE instead (Eli Sagie/ Oscar Avila / Francisco Prelhaz).
- One can request trial extension at a different time for different plans.


<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:white;background-color:purple">

When a customer�s trial period for a plan is extended, **the information will not be visible to them in the Pricing section**. Instead, the extension is applied in the Billing Platform and can only be seen on the customer�s bill. To confirm that the extension has been applied, the customer should contact the support engineer representative who handled their IcM.
</div>
<!--
- After extending trial period for a plan, the customer will not see the information in Pricing, we just applied it in the Billing Platform. **The customer cannot see it by the configuration, only in the bill.**  
To verify if the extension was indeed applied, contact the support engineer representative that handled the IcM.-->



## PG & CSS TSG: 
---
- [Trial extension process](https://msazure.visualstudio.com/One/_wiki/wikis/Rome%20Defenders%20Wiki/608834/Trial-extension-process)
- [MDE Discount process](https://msazure.visualstudio.com/One/_wiki/wikis/Rome%20Defenders%20Wiki/476449/MDE-Discount-process)
- [Check MDC Subscription Trial Eligibility](/Defender-for-Cloud/MDC-Pricing,-Billing-and-Usage/[TSG]-%2D-Check-MDC-Subscription-Trial-Eligibility)

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
