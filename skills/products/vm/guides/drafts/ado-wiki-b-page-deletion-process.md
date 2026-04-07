---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Knowledge Management (KM)/Page Deletion_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Knowledge%20Management%20%28KM%29/Page%20Deletion_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.KM
- cw.Process
- cw.Reviewed-03-2026
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]

# Summary 

We do not "delete" pages. We instead, mark the page as archived with the file extension `.archive` which will remove it from showing in the wiki. Then it will later be automatically moved to the [.knowledge-management/graveyard folder](https://supportability.visualstudio.com/AzureIaaSVM/_git/AzureIaaSVM?path=%2F.graveyard), which will save them as a backup if they are needed in the future.

We have no plans to delete archived files from the graveyard, so they should always be available as a backup if they need to be restored.

# Identifying an Outdated Page

An outdated page is any wiki page that contains information that is no longer useful or relevant for the support of our engineers and customers.

# Deleting a Page

| **PLEASE NOTE** | 
|:----------------|
|In order to complete the steps below, you will need to edit the page being deleted in your own developement (dev) branch and create a pull request when you are finished. For detailed steps on editing wiki pages, see the **[Editing DevOps-Wiki](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494911)** page.

## Find Links to the Outdated Page

First you will need to search the Wiki for any pages that contain a link to the outdated page. Removing the page will cause all hyperlinks to the page to break, so we need to ensure that those links are either removed or replaced.

-  Find pages that contain the link by searching for the unique page ID.
   - Find the unique page ID in the URL of the outdated page
    <br>![UniqueID](/.attachments/Processes/KM_UniqueIDexample_URL.png =1100x63) 
   - Type the ID in the search bar
    <br>![Search Bar](/.attachments/Processes/KM_IDsearch_searchbar.png =700x210)
   - Replace the links to the outdated page if possible. Otherwise, remove the link.

     
## Rename the Page 

The next step in deleting a page is adding `.archive` to the end of the file name. Adding `.archive` to the file name ensures the page isn't rendered in the wiki, but the content itself remains in the files repository. The page also won't show up in wiki search results. By not allowing these to appear in the search we lessen the risk of sending outdated information to our customers.
- To add `.archive` to the end of the file name, click on the three vertical ellipsis (...) to the right of the file and select **Rename**.
<br> ![Rename Image](/.attachments/Processes/Page-Deletion-Process_Renaming-Page.png =300x344)
   - Add `.archive` _after_ the ".md" on the file name.

   **Example:**
   <br>![Adding .archive](/.attachments/Processes/Page-Deletion-Process_adding-archive.png =800x241)

   - Next, click **commit**. 
   - Lastly, create a pull request when you have finished making all necessary changes for the page deletion process. For detailed steps on creating pull requests, see the **[Editing DevOps-Wiki](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494911)** page.

## Moving the page to the graveyard

At this point, the page no longer exists in the wiki, but the file still remains in the file repository. 

<u>*This step is for KM member only!*<u>

Periodically the KM team will perform mass updates to move all `.archive` files to the graveyard to clean up the file hierarchy and to backup the files if they're needed in the future. This may be a 'manual' process at first, but eventually we will have this done automatically on a regular basis.

::: template /.templates/Processes/Knowledge-Management/KM-Feedback-Template.md
:::
