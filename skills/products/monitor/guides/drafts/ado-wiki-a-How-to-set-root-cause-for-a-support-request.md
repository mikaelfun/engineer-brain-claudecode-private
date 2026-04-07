---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/General/How to set root cause for a support request"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/General/How%20to%20set%20root%20cause%20for%20a%20support%20request"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Introduction
---
Each time a customer opens a support request it represents a scenario where a customer was unable to effectively utilize one of our products or services without seeking guidance making for a less satisfied customer. In addition, Microsoft incurs costs associated with providing that customer with support.

Identifying a root cause allows the product teams to determine where to invest their time and resources in order to improve products and services resulting in greater customer satisfaction and reduce support costs.

CSS can help the product teams to understand the types of issues customers are facing by identifying root cause selected from a root cause tree. Product teams then aggregate these selections across time periods to identify the areas of greatest need and benefit.

Getting a bug fix is usually easy but raising enough awareness on issues that cross boundaries between products or require wholesale functional design changes are hard to address without hard data to prove the effort is justified so reliably picking the right Root Cause on a consistent basis helps us tackle these tougher problems. Please be diligent and consistent.

# What is a Root Cause Tree
---
A Root Cause tree is a means to bucketize issues to a feature or functional area of a product that drove the customer to call support and drive justification to the Product teams to makes fixes or design changes.

# A Root Cause Tree structure
---
A root cause tree is broken out in several branches. The branches allow consistent, non-overlapping choices. As of today, the Azure Monitoring root cause trees has 4 levels. Some branches are ancillary needs. Several branches are common to all Azure Monitor products.

![image.png](/.attachments/image-6812cfb8-1bc6-4582-bae0-5f19ddb35e6f.png)

Below you will find sections discussing each Level 1, 2, 3, and 4 with guidance on when to select or not select an option. If there is conflict or confusion please reach out to your SME, TA, or STA OR use the Feedback option in the top right of this page so this material can be improved.


## General Guidelines
---
- Level 1 and Level 2: setting the best Root Cause is essentially coding the case to get it in front of the Product Team best suited to address the issue so the same support ticket does not happen again.
![image.png](/.attachments/image-1736991b-db79-4bac-b59b-3d674679ea11.png)
- Level 3: setting the best choice here is all about the feature area being used and drove the creation of the support case and the case was centered around. This gets the issue to the right team within a Product Group.
![image.png](/.attachments/image-065be346-2149-42db-963d-609a8df351bb.png)
- Level 4: Is the actual root cause of the issue. There are common set of choices here shared by all Azure Monitor Services, but each Monitor service may have additional choices available.
![image.png](/.attachments/image-d92e6d2e-d8b2-4fc0-8d65-da0e67810fcb.png)

# Root Cause Level 1 
---
The choice here is the same for all Azure Monitor service at Level 1. **NOTE:** As of Fall 2024 the Hybrid products such as SCOM and SCSM do not have Root Cause trees.

| Level 1 Choices | When to Use & Guidance |
| -- | -- |
| Root Cause - Azure Monitoring | For this to be the case the SAP needs to be set to one of the Azure Monitor services. There are no options or choices to make. |


# Root Cause Level 2 
---
All Azure Monitor services have consistent L2 branch choices, 3 of them a product, outage, and Not Determined options. **NOTE:** As of Fall 2024 the Hybrid products such as SCOM and SCSM do not have Root Cause trees.

| Level 2 Choices | When to Use & Guidance |
| -- | -- |
| <An Azure Monitor Product> |  What is in selection here is dictated by the SAP. Whatever Azure Monitor product SAP is used is what will drive the option here as an example Log Analytics or Application Insights. |
|  Cloud Event (SIE) Outage | This option needs to be used when the case was caused by an outage. The choices under this branch are one for each Azure Monitor product, select the product that was impacted by the outage and the customer called about. |
| Root Cause Not Determined / Applicable | The following are the choices: <ul><li> Duplicate Case - use this when there two cases from the same customer on the same issue </li><li> _Test Case - Change the SAP to "Windows\PSS Other" which will result in NO Root Cause tree to be presented. The support request should be closed as a duplicate.  See article [How to close a test support request](/Azure-Monitor/How%2DTo/General/How-to-close-a-test-support-request) for more details. </li><li> Product could not be identified - use this when the was not resolved and it is unclear if the Azure Monitor product was actually correct for the case but simply not enough is known. Do NOT use this when the product was clearly understood to be the Azure Monitor product   the case was opened but the issue was never resolved in this case choose the Product at the Level 2 and best L3 / L4 options. |


# Root Cause Level 3 
---
This is Azure Monitor Product Feature and Functional areas. The choice made here is frequently the feature area the case was created for but not necessarily all the time. 

| Level 3 Choices | When to Use & Guidance |
| -- | -- |
| Application Insights | [Root Cause an Application Insights Issue](/Application-Insights/How%2DTo/Application-Insights-General-Resources/Case-Handling/Root-Cause-an-Application-Insights-Issue) |
| Log Analytics | [How to Root Cause a Log Analytics Issue](https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/386669/How-to-Root-Cause-a-Log-Analytics-Issue)|
| | |


# Root Cause Level 4 
---
This is the "root cause". This area is the actual outcome of what was known of the situation when the case was closed, many these items will be obvious and that is the point, but some come with important caveats. 
These choices documented here are the common choices for all Azure Monitor products, but each Azure Monitor product may have additional choices at this level and the meaning and usage of these specialized choices will be documented by the individual product, see the product links in the Level 3 section above.

| Root Cause | When to Use & Guidance |
|--|--|
| By Design - Unsupported user scenario or product limitation | When the ask is a want of a particular behavior or function that currently does not exist.  | 
| By Design - Clear documentation exists, links shared with customer | When the issue is well documented and the solution was to share the documentation with the customer and/or walk them through the documentation. |
| Code or infrastructure - Owned by Customer or third party | Any bug fixes to code or infrastructure resources owned by the customer or a third party |
| Code or infrastructure - Owned by Microsoft, ICM is linked to the support request | This should only be used if you have an ICM or Bug number to put into the ICM field. This the proof the issue was validated as bug.  
| Product Documentation is incorrect or incomplete - CSS submitted doc update | Minor edits that are handled by the CSS process. See Image in Common Scenarios below for guidance. | 
| Product Documentation is incorrect or incomplete - Language translation or other localization issue | Any issues where the customer needed to be provided guidance because of bad translation or other localization (for example, bad screenshots) issues. |
| Product Documentation is incorrect or incomplete - Needs PG review | This is only for significant changes that need to be made in the public documentation on learn.microsoft.com. See Image in Common Scenarios below for guidance. |
| Unknown - Customer abandoned or solved with no assistance from Microsoft | An effort should be made to understand what customers did to solve their issue so a proper root cause can be set here, this is a fall selection when this was not possible. | 


# Common Scenarios
---

- Common misuse of making these selections and what selections to use in lieau
   - ![image.png](/.attachments/image-f670e255-9ce3-4735-b8b5-6f119c8d5f3a.png)

---
Last Modified: October 3rd 2024
Last Modified By: matthofa
