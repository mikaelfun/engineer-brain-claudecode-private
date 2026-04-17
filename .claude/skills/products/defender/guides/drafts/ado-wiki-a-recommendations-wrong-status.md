---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations Platform/[TSG] - Recommendations showing wrong status"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20Platform%2F%5BTSG%5D%20-%20Recommendations%20showing%20wrong%20status"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Recommendations showing wrong status**

<br>This Troubleshooting Guide (TSG) will guide you on how to investigate recommendations that are showing incorrect status or false positives.

**Section/ Landing Page Description**

[[_TOC_]]

## **Overview**

When investigating an issue, we need first of all to check from which type the recommendation is from. There are two types of recommendations:

1. **Control plane recommendations-** In this case, we are creating recommendations on top of Policy by taking Policy compliance and converting it into recommendations in such a way that non-compliant status becomes unhealthy, and compliant becomes healthy.
2. **Data plane recommendations-** In this case, the recommendations are calculated and pushed directly to Microsoft Defender for Cloud (MDC) by external partners.

> Use this :clipboard:[**Recommendations information**](https://dataexplorer.azure.com/dashboards/04220f16-28bf-4645-aaec-6c26981c585a?p-_assessmentKey=all&p-_assessmentName=all&p-_resourceType=all&p-_policyDefinitionId=all&p-_supportedEnv=all&p-_releaseState=all&p-_sourceType=all&p-_teamName=all#c7e74ca2-351c-4723-b474-50ccb17b8ba6) dashboard (Data Explorer) to get the Recommendations type, Incident Case Management (ICM) team to escalate, release state, and much more details.

Once you found the recommendation type- you can use the following steps to investigate inconsistency issues:

## **Data plane recommendations investigation steps**

If the resource has been deleted but recommendations still exist, please follow [smart aligner Troubleshooting Guide (TSG)](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/1889/-Product-Knowledge-Smart-Aligner) to understand where the responsibility is for this and to begin initial investigation.<br>

Otherwise, run the query below to compare resource status between Microsoft Defender for Cloud (MDC) and Policy. In any case of inconsistency, find and contact the recommendation owner using this [guide](https://msazure.visualstudio.com/One/_wiki/wikis/Rome%20Core%20Wiki/207396/Search-recommendation-owner).

## **Control plane recommendations investigation steps**

As described above, in this type of recommendation we are just taking Policy compliance and generating recommendations based on it.

1. Start by checking if the status is consistent between Policy and Microsoft Defender for Cloud (MDC). (You can use the query below)

   - If the status is identical (compliant and healthy, non-compliant and unhealthy)- there is no issue from Microsoft Defender for Cloud (MDC) side.
     - You can check the Policy definition logic to understand how the status is defined.
   - If the status is not identical- move to the next step

2. Check if the job that generates recommendations on top of Policy completed successfully. It should run one time every 12 hours.
   - To check the status of the job you can use :clipboard:[this](https://dataexplorer.azure.com/dashboards/e931a467-e499-4691-bc47-bc05824cd840?_startTime=1hours&_endTime=now&_subscriptionId=__rtd_internal_all_selection&_policyJob=RunCustomPoliciesJobManagerAsync&_policyJob=RunPolicyInsightsJobManagerAsync&_assessmentKey=__rtd_internal_all_selection&_policyDefinition=__rtd_internal_all_selection&_resourceName=__rtd_internal_all_selection#3ddc7693-634a-4b2a-84b5-d08342482d3b) dashboard. 
     - You need to make sure you are filtering the specific subscription id, and filtered on 'RunPolicyInsightsJobManagerAsync' job only
   - If the job failed- Please contact the Microsoft Defender for Cloud (MDC) recommendations team

3. If the issue is a deleted resource- the ticket should be transferred to the Azure policy team to check why they generate compliance results on deleted resource

## **Simple query to compare resource health state between Microsoft Defender for Cloud (MDC) and Policy**

Below is a simple query that compares the status of resource between Microsoft Defender for Cloud (MDC) and Policy.
For running this query, you will need:
1. The relevant assessment key for your recommendation
2. The relevant policy definition Id for your recommendations
3. The problematic resource name

This info can be extracted by using :clipboard:[this](https://dataexplorer.azure.com/dashboards/04220f16-28bf-4645-aaec-6c26981c585a?p-_assessmentKey=all&p-_assessmentName=all&p-_resourceType=all&p-_policyDefinitionId=all&p-_supportedEnv=all&p-_releaseState=all&p-_sourceType=all&p-_teamName=all#c7e74ca2-351c-4723-b474-50ccb17b8ba6) dashboard.

### Running the query
For running the query, you need access to the customer subscription in Azure Portal. If you don't have this kind of access, you need to ask the customer to run it and send us the results.

With access to the relevant subscription, please open Azure Portal, and search for "Azure Resource Graph". There, paste the query below and change the relevant parameters (subscriptionId, assessmentKey, PolicyDefinitionId, resource name).

Run the query below and inspect if the results match.

```
securityresources
| where type == "microsoft.security/assessments"
| where subscriptionId == "<ADD-HERE-SUBSCRIPTION-ID>"
| where name == "ADD-HERE-ASSESSMENT-KEY" 
| where id contains "<ADD-HERE-RESOURCE-NAME>"
| extend resourceName = tostring(split(tolower(extract("(.*)/providers/Microsoft.Security",1, id)),"/")[-1])
| extend statusInMdc = properties.status.code
| project resourceName, statusInMdc
| join
(
policyresources
| where type == "microsoft.policyinsights/policystates"
| where subscriptionId == "<ADD-HERE-SUBSCRIPTION-ID>"
| where * contains "ADD-HERE-POLICY-DEFINITION-ID"
| where id contains "<ADD-HERE-RESOURCE-NAME>"
| extend resourceName = tostring(split(tolower(extract("(.*)/providers/microsoft.policyinsights",1, id)),"/")[-1])
| extend statusInPolicy = properties.complianceState
| extend policyAssignmentScope = tostring(properties.policyAssignmentScope)
| extend policyAssignmentId = tostring(properties.policyAssignmentId)
| project resourceName, statusInPolicy, policyAssignmentScope, policyAssignmentId
) on resourceName
//Remove comment from below to find policy "policyAssignmentScope, policyAssignmentId"
| project resourceName, statusInMdc, statusInPolicy//, policyAssignmentScope, policyAssignmentId
```

We expect all the results to match (Healthy and compliant, unhealthy and non-compliant):

![Image description: Screenshot showing query results of resource health state comparison between Microsoft Defender for Cloud and Policy. The image is a visual representation of the query output, with columns indicating resourceName, statusInMdc, and statusInPolicy.](/.attachments/image-53efa150-c7dd-459d-bbdd-1d8b32faad12.png)

If they are not - please attach screenshots and the full results to the ticket.

## **Known issues/limitations**

1. Active/Inactive known limitation: 

   - In Microsoft Defender for Cloud (MDC) we differentiate between two types of customers:
     - **Active customers**- have at least one plan turned on, or actively logged into Microsoft Defender for Cloud (MDC) portal in the past 30 days
     - **Inactive customers**- do not have any plan and were not logged into Microsoft Defender for Cloud (MDC) User Interface (UI) in the past 30 days.

   - Our background jobs process and generate data only on active customers (because of the high volume of data we need to process).
   - In this case, if the customer does not have any plan, and they do not log into Microsoft Defender for Cloud (MDC) portal in the past 30 days, they will become inactive and part of the recommendations will not be generated for them.
     - What will be the experience in this case?
       - Microsoft Defender for Cloud (MDC)- recommendations will not appear at all
       - Policy- recommendations will be shown as non-compliant, inside the reason will be **"Assessment not found"**

   - According to my explanation above, there are two options for mitigation (customers can choose only one of them):
     1. Turn on and pay on at least one plan
     2. Be active in Microsoft Defender for Cloud (MDC) User Interface (UI) at least once a month

This behavior is by design as processing all data including inactive customers requires a huge scale and without any sense.

You can check if subscription is active/inactive and free/standard using :clipboard:[this](https://dataexplorer.azure.com/dashboards/e931a467-e499-4691-bc47-bc05824cd840?p-_startTime=1hours&p-_endTime=now&p-_subscriptionId=v-4cdd59e7-81c9-4574-95de-3add2ed3f0aa&p-_policyJob=v-RunPolicyInsightsJobManagerAsync&p-_assessmentKey=all&p-_policyDefinition=all&p-_resourceName=all#3ddc7693-634a-4b2a-84b5-d08342482d3b) dashboard.

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
