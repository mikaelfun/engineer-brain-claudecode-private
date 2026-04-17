---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations Platform/Recommendation Exemption/Troubleshooting Guide - Who and When Created Recommendation Exemption"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20Platform%2FRecommendation%20Exemption%2FTroubleshooting%20Guide%20-%20Who%20and%20When%20Created%20Recommendation%20Exemption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]



---



#  Possible Scenarios 



- Customer wants to know who created the exemption? 

- Customer wants to know When was it created? 



---



#  Useful Dashboard 



| **Name** | **Note** |

| --- | --- |

| [Defender for Cloud - Recommendations](https://dataexplorer.azure.com/dashboards/c64843f3-ee69-458f-84ed-1d57361ad364) | Owner: Ankit Patel |



---



#  Background



Microsoft Defender for cloud use **two different technologies to manage exemptions**:



1. **Azure Policy-based Recommendations**   

   These rely on Azure policy exemptions to exempt resources.



2. **Security Standard-based Recommendations**   

   These do **not** depend on Azure policy but create exemptions under **Microsoft.Security/standardAssignments**.



---



#  Troubleshooting Guide



## Step 1: Identify the Recommendation Type  Policy-based or Security Standard-based? 



- There are multiple ways to determine this. One effective method is to use the dashboard.  

- Open the **[Defender for Cloud - Recommendations Dashboard](https://dataexplorer.azure.com/dashboards/c64843f3-ee69-458f-84ed-1d57361ad364)** to get detailed information about the recommendation in question.



- If the **PolicyDefinitionId** is **empty**, it indicates a **Security Standard-based** recommendation.



![Dashboard Example](/.attachments/Troubleshooting-Guide-Who-and-When-Created-Recommendation-Exemption-1.png)



---



## For Azure Policy-based Recommendations 



- The primary approach involves examining activity logs or exemption resources from Azure Policy side.

- Details are being documented in a more comprehensive guide. Stay tuned! 



---



## For Security Standard-based Recommendations 



### Step A: Find details about the exemption in question.



1. Navigate to **Defender for Cloud** > **Recommendations** > **Classic View** > Select the relevant recommendation > **Not Applicable Resources** > Click the **"..."** on the right side > **Manage Exemption**.



![Manage Exemption](/.attachments/Troubleshooting-Guide-Who-and-When-Created-Recommendation-Exemption-2.png)



2. Gather the following information:

   - **Exemption Name**

   - **Scope**

   - **Description**

   - **Expiration Date**



![List of Exemptions](/.attachments/Troubleshooting-Guide-Who-and-When-Created-Recommendation-Exemption-3.png)



---



### Step B: Find the Exemption Resource ID



Run the following Kusto Query (KQL) to retrieve detailed information about the exemption:



```kusto

securityresources

| where type == "microsoft.security/standardassignments"

| where properties.effect == "Exempt"

| extend type = "MDC"

| extend exemptionId = name

| extend exemptionDisplayName = tostring(properties.displayName)

| extend description = tostring(properties.description)

| extend category = tostring(properties.exemptionData.exemptionCategory)

| extend scope = split(id, "/providers/Microsoft.Security/standardAssignments/")[0]

| extend assessmentKey = tostring(properties.exemptionData.assessmentKey)

| extend isSingleRecommendation = iff(assessmentKey != "00000000-0000-0000-0000-000000000000", true, false)

| extend isIdentityBased = iff(scope contains "providers/Microsoft.Security/pricings/CloudPosture/securityentitydata", true, false)

| extend recommendations = iff(

    isSingleRecommendation,

    pack_array(assessmentKey),

    iff(

      isnotempty(properties.exemptionData.subAssessmentExemptionRule.if.allOf[0].operation.values),

      properties.exemptionData.subAssessmentExemptionRule.if.allOf[0].operation.values,

      iff(

        isnotempty(properties.exemptionData.subAssessmentExemptionRule.if.anyOf[0].operation.values),

        properties.exemptionData.subAssessmentExemptionRule.if.anyOf[0].operation.values,

        dynamic([])

      )

    )

  )

| extend numRecommendations = array_length(recommendations)

| project id, name, type, subscriptionId, exemptionDisplayName, description, category, scope, assessmentKey, isSingleRecommendation, isIdentityBased, recommendations, numRecommendations

//| where exemptionDisplayName contains "name" // Follow Step A to get it.

//| where assessmentKey contains "<assessmentKey>" // Follow Step 1 to get it.

```



*Note: Adjust where condition to filter for specific exemptions based on their name or assessment key.*



---



### Step C: Retrieve Exemption Details Using the API 



Use the **Standard Assignments - Get API**:



 [Standard Assignments - Get](https://learn.microsoft.com/en-us/rest/api/defenderforcloud/standard-assignments/get?view=rest-defenderforcloud-2024-08-01&tabs=HTTP)



#### Example API Calls:



- **At Management Group Level:**



```http

GET https://management.azure.com/providers/Microsoft.Management/managementGroups/{management-group-name}/providers/Microsoft.Security/standardAssignments/{exemption-id}?api-version=2024-08-01

```



- **At Subscription Level:**



```http

GET https://management.azure.com/subscriptions/{subscription-id}/providers/Microsoft.Security/standardAssignments/{exemption-id}?api-version=2024-08-01

```



- **At Resource Level:**



```

http



```



 You can execute these requests via [Azure API playground}(API playground: https://ms.portal.azure.com/#view/Microsoft_Azure_Resources/ArmPlayground ) Explorer or your favorite API testing tool.



**Expected Response Sample:**



```json

{

  "id": "/providers/Microsoft.Management/managementGroups/contoso/providers/Microsoft.Security/standardAssignments/your-exemption-id",

  "name": "your-exemption-id",

  "type": "Microsoft.Security/standardAssignments",

  "properties": {

    "displayName": "Test Exemption",

    "description": "Exemption description",

    "assignedStandard": {

      "id": "/providers/Microsoft.Security/securityStandards/your-standard-id"

    },

    "effect": "Exempt",

    "expiresOn": "2022-05-01T19:50:47.083633Z",

    "exemptionData": {

      "exemptionCategory": "waiver",

      "assignedAssessment": {

        "assessmentKey": "1195afff-c881-495e-9bc5-1486211ae03f"

      }

    },

    "metadata": {

      "createdBy": "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx",

      "createdOn": "2022-11-10T08:31:26.7993124Z",

      "lastUpdatedBy": "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx",

      "lastUpdatedOn": "2022-11-10T08:31:26.7993124Z"

    }

  }

}

```



---



| **Contributor Name** | **Details** | **Date** |

|----------------------|--------------|----------|

| Ankit Patel         | Created this content | 8/22/2025 |

|                      |              |          



:::template /.templates/Wiki-Feedback.md 

:::