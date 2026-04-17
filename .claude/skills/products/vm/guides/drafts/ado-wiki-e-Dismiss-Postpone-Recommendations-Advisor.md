---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/How Tos/Dismiss and Postpone Recommendations_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Advisor/How%20Tos/Dismiss%20and%20Postpone%20Recommendations_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Summary
Azure Advisor may often show recommendations that may not be of concern or immediate relevance to a customer. Advisor allows such recommendations to be dismissed or postponed, to allow the impactful recommendations to take precedence.

## What does Dismiss do?
When you dismiss a recommendation it hides it from view until you reactivate it manually.

## What does Postpone do?
Postponing a recommendation lets you set a time period after which it will reappear automatically. You can delay a recommendation either in the Azure portal or by using code.

## Prerequisites for Postponing or Dismissing Recommendations
To dismiss or postpone a recommendation, you must have the role of a **contributor** or an **owner**.

## Postpone or Dismiss recommendations
1. Launch Azure Advisor in the Azure portal.
2. Choose a recommendation category to review your recommendations.
3. For a single recommendation:
   a. Pick a recommendation from the list provided.
   b. Click on **Postpone** or **Dismiss** for the recommendation you wish to delay or dismiss.
4. For more than one recommendation:
   a. Mark the checkbox on the left side of the row corresponding to each resource.
   b. Choose either **Postpone** or **Dismiss** positioned at the upper left corner of the table.
   - When you postpone, you can select the timeframe for snoozing.

## Reactivate a Postponed or Dismissed recommendation
1. Launch Azure Advisor in the Azure portal.
2. Select Recommendation Status filter as **Postponed & Dismissed** in Overview page or move to the recommendation category and select **Postponed & Dismissed** Tab.
3. For a single recommendation: Click **Activate** for the recommendation.
4. For multiple: Mark checkboxes and choose **Activate** at the upper left corner.
