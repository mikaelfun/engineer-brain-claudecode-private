---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Troubleshooter guides/[TSG] - Threat Intelligence/Actions - Threat intelligence Private Preview Feature"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FTroubleshooter%20guides%2F%5BTSG%5D%20-%20Threat%20Intelligence%2FActions%20-%20Threat%20intelligence%20Private%20Preview%20Feature"
importDate: "2026-04-07"
type: troubleshooting-guide
---

#This section will provide with guide on "Actions - Private Preview" feature for Sentinel Threat intelligence indicators.
[[_TOC_]]
# Refrence ICM
- https://portal.microsofticm.com/imp/v5/incidents/details/472733537/summary
#<span style='color: red;'>MUST REVIEW BEFORE PROCEEDING!</span>
- <span style='color: red;'>**We cannot say anything about private previews with customers that don't have an NDA. This even includes acknowledging that we have a private preview for X feature.**</span>
- <span style='color: red;'>**You can share information about private previews (confirming that we have a private preview, and an overview) with organization that has an NDA signed and reminding them of the confidentiality of our information.**</span>
- <span style='color: red;'>Private Preview Feature **does not come with any formal Microsoft support or SLA.** </span>
- <span style='color: red;'>Private Preview Feature **might have other issues that were not yet discovered or fixed.** </span>
- <span style='color: red;'>Some Private Preview Feature might **not ever get released to Public and may be dropped off from future plans.** </span>
- <span style='color: red;'>That's why you should **suggest customer to join our community**. By joining our community, they can provide feedback or get asstiance on any Private Preview feature. </span>
- <span style='color: red;'>Customer can join community by follwing:https://aka.ms/MSSecurityCCP</span>
#Acronyms
- TI = Threat intelligence
## How to access Private Preview feature?
- This feature-flag URL https://portal.azure.com/?feature.bulkactions=true&feature.ingestionrules=true will enable two TI private previews in Sentinel portal
    - Threat intelligence indicators bulk actions (Provides ability to bulk Edit or Delete)
    - Threat intelligence indicators ingestion rules (Ability to created data rules at TI ingestion)
- Using the link above you will see new "Actions" option show up on UI. Giving you ability to use Private Preview features.

    ![Image1.png](/.attachments/1-Bulk-Actions-Private-Preview-Feature.png =50%x50%)
###<span style='color: green;'>**Feature:1 - One time action (aka: Bulk Action)**</span>
####Use case
    
    - Customer has Thousands of TI indicators injested with no expiry and they want to delete them all at once.
    - Customer has Thousands of TI indicators and on certain indicators they want to add tag and they are looking for an easy automation to do the job.
- **Example** - Delete all TI indicators with valid till it is null.

    ![Image1.png](/.attachments/2-Bulk-Actions-Private-Preview-Feature.png =50%x50%)
- **Action History** - Where you can review One-time Actions submitted in past.

    ![Image1.png](/.attachments/3-Bulk-Actions-Private-Preview-Feature.png =50%x50%)
###<span style='color: green;'>**Feature:2 - Ingestion rules**</span>
####Use case
    
    - Customer wants to make sure in future, TI inicators with set expiry date get injested to Sentinel. Any indicator with no expiry will get automatically deleted.
    - Customer wants to make sure in future, certain TI indicators will get "x" tag added automatically.
- **Example** - Delete all TI indicators with valid till it is null and source does not equeal to "Sentinel".

    ![Image1.png](/.attachments/4-Bulk-Actions-Private-Preview-Feature.png =50%x50%)
- **Manage ingestion rules** - Where you can review all of your TI ingestion rules and edit them as needed.

    ![Image1.png](/.attachments/5-Bulk-Actions-Private-Preview-Feature.png =50%x50%)
________
|Contributor Name|  Details|  Date|
|--|--|--|
| patela | Created this section | 08/01/2024 |
|  |  |  |
|  |  |  |
|  |  |  |

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
