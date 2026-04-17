---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for API/Defender for API Billing TSG"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20API%2FDefender%20for%20API%20Billing%20TSG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Defender for API Billing Logic and Usage Tracking

## Summary
---
This article provides an overview of the billing logic and usage tracking for Microsoft Defender for API, a plan within Microsoft Defender for Cloud. It covers the details of sub-plans, billing types, meters, and pricing associated with the service.

## Detailed Explanation
---
Microsoft Defender for API is a comprehensive plan offering several sub-plans within Microsoft Defender for Cloud. The billing structure is designed to cater to different usage levels and is implemented at the subscription level, requiring at least one onboarded API resource. The reported usage is tracked at the API level, and billing is calculated based on both fixed and overage prices, depending on the API call thresholds.

 
### D4API Bundle Billing Logic
---
The **D4API bundle** consists of **five sub-plans (P1–P5)**.  
Each sub-plan includes:
*   A **fixed hourly price**
*   An **overage price** for API calls that exceed the defined threshold

**Usage reporting is at the API level.**  
If there is **no API traffic during a specific hour**, billing applies only to the fixed price, and the usage record is emitted at the **subscription level**.

#### **Scenario 1: Hours Without API Traffic**

*   Emit **one usage record** for the fixed-price meter at the **subscription level**
*   **Quantity:** `1`
*   **Usage record URI example:** /subscriptions/{subscriptionId}/providers/Microsoft.Security/pricings/Api


#### **Scenario 2: Hours With API Traffic**

*   Emit usage records for:
    *   **API call meter** (free or overage)
    *   **Fixed price**, distributed proportionally across all API resources that had traffic
*   **Total quantity for fixed price:** Always sums to `1` per hour
*   **Usage record URI example:** /subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/Microsoft.ApiManagement/service/{serviceName}/providers/Microsoft.Security/apiCollections/{apiName}


### Sub-Plans and Billing
---
Microsoft Defender for API comprises five sub-plans, each with its fixed and overage pricing structure. The sub-plans are identified as P1 through P5. These plans offer different levels of service and pricing to accommodate various usage requirements:

- **P1**: $200 per month for up to 1 million API calls.
- **P2**: $700 per month for up to 5 million API calls.
- **P3**: $5,000 per month for up to 50 million API calls.
- **P4**: $7,000 per month for up to 100 million API calls.
- **P5**: $50,000 per month for up to 1 billion API calls.

If the usage exceeds the specified threshold for any plan, an overage price is applied for each additional API call.

### Meters
---
The service utilizes 21 new meters to manage billing and usage tracking. These meters are categorized based on the sub-plan, billing type (fixed or overage), and pricing tier (standard or trial). Each meter corresponds to a unique Meter ID to facilitate accurate usage reporting and billing.

| Meter Name | Meter ID |
|--|--|
| Per Sub Billing Ovg P1 | 974a6a67-7bb7-50f6-a7c4-cb0258109a23 |
| Per Sub Billing P1 | ec3b0853-a3fa-5312-8425-f50fb1a33662 |
| Per Sub Billing Ovg P1_Trial | 480732f1-38e7-5d55-bbb5-75f9c0f4dec9 |
| Per Sub Billing P1_Trial | 3533a218-9677-594e-b242-16040a0bb7e0 |
| Per Sub Billing Ovg P2 | 58f9465a-a0d5-5d89-a86a-0dab74faf76e |
| Per Sub Billing P2 | 9d76fabc-1d5c-5208-8fbd-da65050e30a4 |
| Per Sub Billing Ovg P2_Trial | aa365f1c-332b-57a3-a62c-cc0a9777bb52 |
| Per Sub Billing P2_Trial | 1aae432c-be6e-5336-a084-e8d408dfb5ee |
| Per Sub Billing Ovg P3 | 34f364b8-2ec9-5ad7-b96f-57d392ecab89 |
| Per Sub Billing P3 | 006be79b-30e2-5341-95b6-8c8bde9d7a04 |
| Per Sub Billing Ovg P3_Trial | f2a2bd0d-ab27-5bc7-8312-cf2ccbef1114 |
| Per Sub Billing P3_Trial | c29fb57f-0545-512b-ba27-8a45ecbb59a3 |
| Per Sub Billing Ovg P4 | a7824c7b-e58f-52f6-9e09-b65ae238df13 |
| Per Sub Billing P4 | de3493d9-ee03-5785-acf3-8d01b93a4a07 |
| Per Sub Billing Ovg P4_Trial | 715fcd9b-dc3c-563a-b68d-465b51a92c58 |
| Per Sub Billing P4_Trial | acbfc302-b1f6-519a-90a2-794784fbf40c |
| Per Sub Billing Ovg P5 | 2736c6a4-9c1b-5cc2-bc34-98876fab606b |
| Per Sub Billing P5 | 3b5e61ab-7f4d-5d88-8ad8-95fb9b2f1dfe |
| Per Sub Billing Ovg P5_Trial | 54d4cbef-50a5-5dc0-a982-810674277204 |
| Per Sub Billing P5_Trial | a4c2c6c8-148b-5284-8114-e9db65eb1b6c |
| Free Meter | a97d4215-f78e-50c3-8dbe-bf230ad8493b |

## Examples
---
To retrieve and analyze usage data, you can use a query in the Pav2 logs. Below is an example query for tracking usage:

```kusto
let P1OverageStandardMeter = "974a6a67-7bb7-50f6-a7c4-cb0258109a23"; 
let P1OverageTrialMeter = "480732f1-38e7-5d55-bbb5-75f9c0f4dec9";
let P2OverageStandardMeter = "58f9465a-a0d5-5d89-a86a-0dab74faf76e";
let P2OverageTrialMeter = "aa365f1c-332b-57a3-a62c-cc0a9777bb52";
let P3OverageStandardMeter ="34f364b8-2ec9-5ad7-b96f-57d392ecab89";
let P3OverageTrialMeter ="f2a2bd0d-ab27-5bc7-8312-cf2ccbef1114";
let P4OverageStandardMeter ="a7824c7b-e58f-52f6-9e09-b65ae238df13";
let P4OverageTrialMeter ="715fcd9b-dc3c-563a-b68d-465b51a92c58";
let P5OverageStandardMeter ="2736c6a4-9c1b-5cc2-bc34-98876fab606b";
let P5OverageTrialMeter ="54d4cbef-50a5-5dc0-a982-810674277204";
let P1FixStandardMeter ="ec3b0853-a3fa-5312-8425-f50fb1a33662";
let P1FixTrialMeter ="3533a218-9677-594e-b242-16040a0bb7e0";
let P2FixStandardMeter ="9d76fabc-1d5c-5208-8fbd-da65050e30a4";
let P2FixTrialMeter ="1aae432c-be6e-5336-a084-e8d408dfb5ee";
let P3FixStandardMeter ="006be79b-30e2-5341-95b6-8c8bde9d7a04";
let P3FixTrialMeter ="c29fb57f-0545-512b-ba27-8a45ecbb59a3";
let P4FixStandardMeter ="de3493d9-ee03-5785-acf3-8d01b93a4a07";
let P4FixTrialMeter ="acbfc302-b1f6-519a-90a2-794784fbf40c";
let P5FixStandardMeter ="3b5e61ab-7f4d-5d88-8ad8-95fb9b2f1dfe";
let P5FixTrialMeter ="a4c2c6c8-148b-5284-8114-e9db65eb1b6c";
let FreeAllBundlesOverage = "a97d4215-f78e-50c3-8dbe-bf230ad8493b";
cluster('pav2data.eastus.kusto.windows.net').database('aipusagedb').getProcessedUsageData()
| where usageTime > ago(1d)
| project
    UsageTime = usageTime,
    MeterId = resourceId,
    Units = units,
    ResourceUri = resourceUri,
    IngestTime = ingestTime,
    SubscriptionId = reportingId,
    Location = sourceRegion,
    Tags = tags,
    AdditionalInfo = additionalInfo,
    Day = startofday(usageTime)
| where MeterId in (P1OverageStandardMeter, P1OverageTrialMeter, P2OverageStandardMeter, P2OverageTrialMeter, P3OverageStandardMeter, P3OverageTrialMeter, P4OverageStandardMeter, P4OverageTrialMeter, P5OverageStandardMeter, P5OverageTrialMeter, P1FixStandardMeter, P1FixTrialMeter, P2FixStandardMeter, P2FixTrialMeter, P3FixStandardMeter, P3FixTrialMeter, P4FixStandardMeter, P4FixTrialMeter, P5FixStandardMeter, P5FixTrialMeter, FreeAllBundlesOverage)
| where SubscriptionId == 'c7cc771e-049b-48c4-a3fa-48ad6414bb8e'
| summarize sum(Units) by bin(UsageTime,1h), MeterId
```

## Related Articles
---
- https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-apis-introduction
