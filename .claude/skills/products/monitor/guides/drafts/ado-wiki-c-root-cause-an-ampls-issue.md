---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/How-To/Azure Monitor Private Link Scope General Resources/Root Cause an AMPLS Issue"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAMPLS%20%28Azure%20Monitor%20Private%20Link%20Scope%29%2FHow-To%2FAzure%20Monitor%20Private%20Link%20Scope%20General%20Resources%2FRoot%20Cause%20an%20AMPLS%20Issue"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# What are Root Cause Trees
---
Root Cause trees are a means to bucketize issues to the feature or functional area of a product that drove the customer to call support and pick the Support Topic they did.

# Why use a Root Cause Tree
---
Root Cause tree is the primary way to identify and address functional areas and features that cause customers to call us. They allow us to provide an actual measurement of what is causing issues. Getting a bug fix is easy but raising enough awareness of issues that cross boundaries between products or require wholesale functional changes are hard to address with hard data to prove the efforts is justified so reliably picking the right Root Cause on a consistent basis helps us tackle these tougher problems. Please be diligent.


Below you will find tables for both Level 3 and 4 topics with explanations on when to select or not select an option.

**NOTE:** There are key exceptions to choosing one of the level three and four options below these would be:

If the issue was due to an Outage and there is an associated SIE item then choose this root cause:
**Root Cause - Azure Monitoring\Cloud Event (SIE) | Outage\Application Insights Outage**

If the issue is a duplicate issue by the same customer, only root case one of the two to its proper Level 3 and 4 topic below for one of the case choose this root cause:
**Root Cause - Azure Monitoring\Root Cause Not Determined | Applicable\_Duplicate Case**

If the ticket was opened by someone internally for some testing purpose then choose this root cause
**Root Cause - Azure Monitoring\Root Cause Not Determined | Applicable\_Test Case**

## General Guidelines
---
- What is being used and centered around the issue?
   - When choosing a topic, consider what is being used when the issue was encountered?
   - If using Azure Functions, the SAP and Root Cause should probably be change to Azure Functions unless the issue was specifically an ingestion side issue or an Application Insights portal experience issue (but see comments below).
   - When choosing an L3 topic within Application Insights, the same caveat above applies, what was the feature being used?
      - For example, if it was Availability Tests, then most likely Availability Tests would be the right branch.
      - The counter point is if the problem surfaced within the Portal experience (blades). Most of the times the blades (UI) are not the issue, rather they are victims of the data sent (no data sent to AI, no data to display in the UI).  Consider the scenario of missing data, this would then be better coded to Codeless Attach or the proper SDK.

- Who has the best chance to improve the situation? This is the question you want to ask yourself when choosing a Root Cause.
   - Consider what product team or feature team within a product is best suited to improve the situation going forward. This is almost always the correct choice. If you need help determining this, reach out to any SME/TA or the STA

# Root Cause Level 1 - Azure Monitoring
---
If you need to change this node to some other product for example App Services then the case should handed over to a person on that team to close, this should have been negotiated out early on during the life of the case.

Most of Azure Monitor Services have their own Level one branch so this will need to be changed if the issue is with say Log Analytics or Alerts and Action Groups.

# Root Cause Level 2 - Azure Monitor Private Link Scope (AMPLS)
---
Each Azure Monitor Service will have certain common choices at this level, once of which is Azure Monitor Private Link Scope. So if the issue was related to Log Analytics Agents and its inability to send data to LA due to AMPLS select Log Analytics Agents at Level 1 and Azure Monitor Private Link Scope at level 2. The same goes for Application Insights or Log Analytics Core.

# Root Cause Level 3 - Product Feature and Functional areas
---

| Root Cause  | When to Use & Rules for Use |
|--|--|
| AMPLS Backend Services | Use this topic for any situation where the issue was directly related to a configuration setting, that is DNS hi-jack scenarios etc. |
| AMPLS Configuration Experience in Azure Portal | Use this if the issue dealt with configuration of AMPLS within the portal, that is Network Isolation settings etc. |


# Root Cause Level 4 - Actual Causes
---
This area is the actual outcome of what we know of the situation when we closed the case. Again many of these items will be obvious and that is the point but some come with important caveats. These same items are found under every Level 3 item.

| Root Cause  | When to Use & Rules for Use |
|--|--|
|Code Defect| This should only be used if you have an ICM or Bug number to put into the ICM field. This the proof the issue was validated as bug.|
| By Design - Documentation insufficient, unclear, discoverability | This should be used when the customer and **you** have looked at the documentation and struggled with the information or could not find it.|
|By Design - User education | This is many times a How To type case and it seems that customer opted to call us for help regardless if they found the documentation or not and the documentation seems good.|
|By Design - Unsupported or Limitation | This the choice to make if the customer wants a particular behavior or function that currently does not exist.
| Unknown - Customer discontinued | This the choice when we do not know the solution because the customer disconnected too early for us to conclude anything. If there is high certainty and data points to conclude it was another choice but we simply could not confirm then choose the appropriate option above. If choosing this option then select the feature that drove the customer to call us at the Level 3, often times that will be codeless attach or SDK.|
| Unknown - Customer solved | This the choice when we do not know the solution because the customer solved the issue themselves. If there is high certainty and data points to conclude it was some other choice above but we simply could not confirm then choose the appropriate option above.|


# Common Scenarios
---
- *What is if the customer is using an old SDK and asking them to try the latest fixes the issue?* In this case, a Level 4 choice of "By Design - User education". We cannot say it was a code defect definitely nor can we say it was a limitation of the older version.
