---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Knowledge Management (KM)/KM FAQ_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Knowledge%20Management%20%28KM%29/KM%20FAQ_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.KM

- cw.Process

- cw.Reviewed-08-2024

---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::








[[_TOC_]]



# Summary 



The purpose of this article is to introduce the new AzureIaaSVM wiki Project and answer common questions regarding the move from the old wiki (AzureVMPod) to the new project (AzureIaaSVM). 



# Frequently Asked Questions (FAQ)



## 1. What falls under the scope of the Knowledge Management team?

- The purpose of the Knowledge Management (KM) team is to maintain our internal knowledge sources and processes to help us better assist our customers. Specifically, the KM team helps define wiki processes and standards, and ensure others adhere to those standards when modifying the wiki. The KM process can be found in the **[Processes/Knowledge Management (KM) folder](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/499954/Knowledge-Management)**. 



The KM team is also responsible for making sure that no Personal Identifiable Information (PII) is included in the wiki.

## 2. What is happening to the old AzureVMPod wiki? Will we still be able to access it?

- As of April 12th 2022, the AzureVMPod was retired and is no longer available to users. The link to that wiki will no longer work. 

## 3. A long time ago, I used to be able to directly edit pages on the main branch without creating a pull request. Why did this change?

- Pull requests and their required approvals help to maintain the integrity of the wiki. This also assists with reducing incidents of PII being published to the wiki and maintaining **[Microsoft Privacy and Data Protection Standards](https://www.microsoft.com/en-us/trust-center/privacy#:~:text=Your%20control%20of%20your%20data%20Your%20control%20over,more%20about%20GDPR%20Learn%20more%20about%20ISO%2FIEC%2027018)**. 

## 4. What is the Knowledge Management Graveyard folder?

- The **[Knowledge Management Graveyard folder](https://supportability.visualstudio.com/_git/AzureIaaSVM?path=%2F.knowledge-management%2Fgraveyard)** is a folder that contains archived material. This folder is used during the **[Page Deletion Process](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494913)** to remove outdated, duplicated, or pages no longer needed. 

- The Graveyard folder can be found in ***\.knowledge-management\graveyard.***

## 5. What happened to tags and dynamic content?

- Dynamic content (as provided by the Supportability team) interfered with other functions in DevOps such as being able to preview images in dev personal branches.

- As of July 11, 2024, the Supportability team is stopping support of Dynamic Functions for all other wikis due to security and compliance reasons. It may be re-enabled at a later date when time can be committed to update and secure the feature. It is highly unlikely however, that this wiki will use them at that time either.

## 6. How do I create/edit articles? 

- To create a new page, please see the **[Editing DevOps Wiki](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494911)** and **[Wiki Page Standards](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494917)**. If you are interested in adding in adding a new SME topic to the wiki, please see **[Add a New SME Topic to the Wiki Process](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/640075/Add-a-New-SME-Topic-to-the-Wiki_Process).** 

## 7. Why do the page titles have the SME area if the pages are already sorted into folders? 

- This is for when engineers are searching the wiki. They may not look at the folder structure to see where the page is located so this makes it easier to tell what SME area owns the article. 

## 8. My dev branch has disappeared after my Pull Request was completed. What happened?

- KM engineers are responsible for deleting source branches when completing PRs. If your dev branch has disappeared after the PR was merged to **main**, this is expected behavior. If your dev branch still exists after you PR was completed, <u>please delete your dev branch</u>. You should create a new branch for each PR.   

## 9. I used to be able to approve my own PRs and now I cannot. What happened?

- You will no longer be able to approve your own PR. This ensures the integrity of the content that will be merged into the main branch has been checked by two approvers other than the author of the pull request. For more information on approving PRs, see the **[Approving Pull Requests KM process page](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494910)**.

## 10. How can I identify the content owner and/or author of a specific Wiki page?

- There may be a scenario in which you need to identify the content owner and/or author of a specific Wiki page. Follow these steps to identify the right person to contact:

    1. **DO NOT** contact the engineer whose name is listed under the page title. This is not _always_ the correct content owner.

    2. Navigate to the top right corner of the page and select the three vertical dots.

    3. Select _View revisions_ to see the page's full update history.

    4. Show all history to identify the original author of the document and who has updated it since. 

- Review the [**Wiki Feedback and Kudos Best Practices Process**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/528966/) for more detail.

## 11. Who can I reach out to with questions?

- This depends on the page.

   - For this page or any other page owned by the KM team, you can send an email to azvmkm@microsoft.com or use the template at the bottom of an KM process pages.

   - For content owned by a SME area, use the feedback section at the bottom of that page to send feedback to the appropriate SME team.

   - If there is no point of contact for a page, please send an email to the KM team at azvmkm@microsoft.com including a link to the page, and we will try to help you located the owner.





::: template /.templates/Processes/Knowledge-Management/KM-Feedback-Template.md

::

