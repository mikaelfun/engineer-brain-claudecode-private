---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Knowledge Management (KM)/KM Admins/Add a New SME Topic"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Knowledge%20Management%20%28KM%29/KM%20Admins/Add%20a%20New%20SME%20Topic"
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



# Overview

This page covers the steps needed to create a new Subject Matter Expert (SME) topic in the SME Topics folder of the AzureIaaSVM wiki.



# Prerequisites



Approval from the Knowledge Management (KM) team is required as they will need to set up the backend permission groups and policies. You can reach out to the KM team leads by sending an email to the [**azvmkm-globalleads@microsoft.com**](mailto:azvmkm-globalleads@microsoft.com) group.



<hr>



# Knowledge Management (KM) Administrative Tasks



The following steps can only be completed by a member of the 'Project Adminstrator' group.



## Create New SME Team



**Note: This section must be completed before attempting any other sections.**



<details close>

<summary>Click to expand/collapse this section</summary>

<br>





1. Navigate to the **Project Settings**<br>

![Navigate to the Project Settings of the AzureIaaSVM wiki.](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Go-to-Project-Settings.png)

2. In the left menu, select **Teams** under **General**.

3. Before creating the new SME team, save the SME profile image by clicking on an existing SME group. Then right-click the image and select **Save image as**.<br>

![Save the SME and TA profile picture by right clicking and selecting Save image as.](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Save-SME-Profile-Image.png)

4. Go back to the list of all teams, and then click the **New Team** button.<br>

![Select to create a new Team using the button.](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Select-Teams-New-Team.png)

   1. Set the profile image to the previous save imaged in the previous step by clicking on the default image.

   2. The name of the group should start with "SME and TA - " with the name of the SME Topic following. For example, `SME and TA - ScaleSets` or `SME and TA - Serial Console`.

   3. Add the appropriate Technical Advisor (TA) group and EEE group, if applicable, to the **Members** section along with any fully ramped SMEs in the topic.

   4. Add the **Description** `SME/TA/EEE PR Approvals`.

   5. Set the **Administrators** section to `[AzureIaaSVM]\KM - Group Membership Admins`.

   6. Uncheck **Add admin(s) to team as member(s)**.

   7. Add to `[AzureIaaSVM]\Readers Only` group to the **Permissions** section.

   8. Uncheck **Create an area path with the name of the team**.

   9. Click the **Create** button.<br>

![Fill out the new team form with relevant information.](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Fill-out-new-team-info.png)

5. Once the team has been created, add the new Team to the **All SMEs** team.<br>

![Navigate to the All SMEs ](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Select-All-SMEs-Group.png)<br>

![Select the Add button to add new team to All SMEs](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Choose-Add-Button.png)





</details>





## Add New SME Topic Tag



This section covers how to create the new Tag for the new SME area. The tag will be used on Kudos and Feedback work items made for the pages within that SME Topic folder.



<details close>

<summary>Click to expand/collapse this section</summary>

<br>



1. First we need to think of what tag should be used for the new SME topic. It's best to come up with something that is not to long. If an abbrviation is being used, it should be the common abbreviation for that SME topic. 

    ```

    Examples:



    Restarts

    Mig-Move

    AIB

    RDP-SSH

    VMSS

    ```

2. Once the name of the new tag has been decided, navigate to the following work item. This work item contains all existing page tags so that no tags are removed if not in use. If a tag is removed, it could break the feedback/kudos system in the wiki.

   - [**Work Item Task 18560**](https://supportability.visualstudio.com/AzureIaaSVM/_workitems/edit/18560/)

3. Add a new work item tag to the task.<br>

![Click plus sign on work item task to add new tag to the task](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Add-new-SME-tag-to-work-item-task.png)<br>

![Enter the new desired tag.](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Enter-new-SME-tag-on-task.png)

4. Click out of the text box when you have finished entering the tag and confirm it has been added to the list. Once you have confirmed the tag is there, _Save_ the changes to the task.<br>

![Verify the tag has been added and then save the work item.](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Save-new-SME-tag-on-task.png)



</details>





## Create Feedback/Kudos Notification



Notifications must be configured for new SME areas so that all vested parties are aware when new feedback or kudos are submitted for their SME pages.



<details close>

<summary>Click to expand/collapse this section</summary>

<br>



1. Navigate to **Project Settings** > **Notifications**.<br>

![Navigate to Notifications section in Project Settings](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Navigate-to-Notifications.png)

2. Verify you are on the correct SME group and select **+ New Subscription**.<br>

![Add a new subscription after verifying SME area](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Verify-SME-Area-New-Sub.png)

3. Select **Work** > **A work item is created** from the **New Subscription** dialogue box and then click **Next**.<br>

![Select Work and then New work item is created from the message dialogue box](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/New-subscription-dialogue.png)

   1. Create Kudos Notification

      1. Set the **Description** of the notification to `Kudos work item created for <_SME TOPIC_> wiki page`.

      2. **Deliver to** should be set to "Members of the SME and TA - <SME TOPIC>".

      3. **Filter** should be set to **A specific team project** with "AzureIaaSVM" selected.<br>

         ![Fill out description, adjust deliver to, verify filter](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Set-notification-description-deliver-to-filter.png)

      4. Update the **Filter Criteria**.

         1. The **State** and **Authorized As** fields can keep their default values.

         2. Select **+ Add new clause**

            1. **Field** should be set to "Work Item Type"

            2. **Operator** should be "="

            3. **Value** will be set to `Kudos`.<br>

               ![Set Work item type file to Kudos](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Add-work-item-type-value.png)

         3. Select **+ Add new clause** two more times.

            1. **Field** should be set to "Tags" for both.

            2. **Operator** should be set to "Contains value" for both.

            3. **Values** should be set to "Kudos" and the new "<SME TOPIC>".<br>

               ![Set Work item type file to Kudos](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Add-tags-values.png)

         4. Group the two **Tags** values together by checking both check boxes and click the **Group selected clauses**.<br>

            ![Group together the Tags fields and select save](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Group-the-Tags-fields-together.png)

      5. **Save** the new subscription.<br>

         ![Save to create the new notification](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Save-the-Kudos-notification.png)

   2. Create Feedback Notification

      1. Repeats all the steps above to create another new subscription, with the below modifications.

      2. Set the **Description** to `Feedback work item created for <_SME TOPIC_> wiki page`.

      3. The **Work Items Type** value and first **Tags** value under **Filter Criteria** will both be `Feedback`.

      4. Save the new subscription.<br>

         ![Save to create the new notification](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Save-the-feedback-notification.png)



</details>





## Create Kudos/Feedback Work Item Templates



Steps in this section cover how to create the Kudos and Feedback templates for when a new work item of that type is created for a SME area.



**Note: These steps must be completed before you can create the page feedback template for the new SME area.**



<details close>

<summary>Click to expand/collapse this section</summary>

<br>



1. Navigate to the Project Settings.

2. Select _Team Configuration_ from the menu options.

3. Verify you have the correct SME and TA group selected at the top of the page.

4. Select _Templates_.

![Navigate to the Templates section of the Team Configuration in Project Settings](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Navigate-to-templates-for-feedback-kudos.png)



### Create Kudos Template



1. Select **Kudos** from the **Templates** section and then **+ New template**. (For new SME areas, the page will be empty.)<br>

![Select to add a new template to the Kudos templates.](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Select-to-add-new-template.png)

2. Make the **Name** `Kudos - <_SME TOPIC_>` and the **Description** `Template for all Kudos for <_SME TOPIC_> pages`.<br>

![Fill out template title and description.](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Fill-out-template-title-and-description.png)

3. Fill out the template with the following fields and values.<br>

   - **Area Path:** `AzureIaaSVM\Wiki Content Feedback`

   - **Description:** `<div><span style="box-sizing:border-box;display:inline !important;">Please be as detailed as possible with all kudos provided. It will help us improve the wiki! See &quot;</span><a href="https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/528966" style="box-sizing:border-box;text-decoration:underline;cursor:pointer;"><b style="box-sizing:border-box;">Wiki Feedback &amp; Kudos Best Practices</b></a><span style="box-sizing:border-box;display:inline !important;">&quot; for more information.</span><br></div>`

   - **Iteration Path:** `AzureIaaSVM`

   - **Tags (Add):** `Kudos; <SME TOPIC>`<br>

      ![Edit the template with values outlined in steps above and save.](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Create-new-kudos-template-filled-out-example.png)

4.  Click **Save** once done.





### Create Feedback Template



1. Select **Feedback** from the **Templates** section and then **+ New template**. (For new SME areas, the page will be empty.)<br>

![Select to add a new template to the Feedback templates.](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Select-to-add-new-feedback-template.png)

2. Make the *Name* `Feedback - <_SME TOPIC_>` and the **Description** `Feedback template for <_SME TOPIC_> pages`.<br>

![Fill out template title and description.](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Fill-out-template-title-and-description-for-feedback.png)

3. Fill out the template with the following fields and values.

   - **Area Path:** `AzureIaaSVM\Wiki Content Feedback`

   - **Description:** `<div><span style="box-sizing:border-box;display:inline !important;">Please be as detailed as possible with all kudos provided. It will help us improve the wiki! See &quot;</span><a href="https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/528966" style="box-sizing:border-box;text-decoration:underline;cursor:pointer;"><b style="box-sizing:border-box;">Wiki Feedback &amp; Kudos Best Practices</b></a><span style="box-sizing:border-box;display:inline !important;">&quot; for more information.</span><br></div>`

   - **Iteration Path:** `AzureIaaSVM`

   - **Tags (Add):** `Feedback; <SME TOPIC>`<br>

      ![Edit the template with values outlined in steps above and save.](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Create-new-feedback-template-filled-out-example.png)

4.  Click **Save** once done.



</details>





## Create Shared Queries



<details close>

<summary>Click to expand/collapse this section</summary>

<br>



These queries are used for the SME Dashboards and Known Issues or Bug



1. Navigate to **Boards** > **Queries** > **All**.

2. In the **Shared Queries** folder, find the **Feedback** folder, and select the **three horizontal dots** on the right-hand side.

3. Select **New Query**.<br>

   ![Create Feedback Query](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Create-Feedback-Query.png)

4. **Feedback Query** - Using the example below, edit the query to match the required fields for the

   - The only field that will change based upon the SME Team is the **Tag** field. Input the new SME Topic Tag that was created previously.<br>

   ![Feedback Query](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Feedback-Query.png)

   - Select **Save query** when done.

   - Name it `<SME Topic> Feedback`

5. **Kudos Query** - Using the example below, edit the query to match the required fields.

   - The only field that will change based upon the SME Team is the **Tag** field. Input the new SME Topic Tag that was created previously.<br>

   ![Kudos Query](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Kudos-Query.png)

   - Select **Save query** when done.

   - Name it `<SME Topic> Kudos`

6. **Known Issues or Bug Query** - Using the example below, edit the query to match the required fields.

   - The only field that will change based upon the SME Team is the **Tag** field. Input the new SME Topic Tag that was created previously.<br>

   ![Kudos Query](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Known-Issues-or-Bug-Query.png)

   - Select **Save query** when done.

   - Name it `Known Issues or Bug for <SME Topic>`



</details>





## Create SME Dashboard



<details close>

<summary>Click to expand/collapse this section</summary>

<br>

SME Dashboards act as a landing page for SMEs to review pending AzureIaaSVM Wiki action items that their SME team is responsible for. To create a SME Dashboard for the new SME Topic, do the following:



1. In DevOps, navigate to the Overview > Dashboards tab and select **+ New Dashboard**.<Br>

![New Dashboard](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/New-Dashboard.png)

2. Enter these settings and click **Create**:

    - **Name**: `<SME TOPIC> SME Dashboard`

        - Example: "VMSS SME Dashboard".

    - **Dashboard Type:** Team Dashboard

    - **Team**: Select the newly created "SME and TA - <SME TOPIC>" team that was just created.<br>

      ![Dashboard Configuration](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Dashboard-Configuration.png =500x)

3. Once the Dashboard is created, widgets will be added. The image below details which widgets should be included and the layout that should be followed. Some of these widgets will not require any additional configuration (such as Team Members and New Work Item) while others will need to be tailored to the SME Team's needs.<br>

![Dashboard Layout](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Dashboard-Layout.png)

   1. Configure the **Chart for Work Items** widget:

      - **Title:** `Known Issues or Bug for <SME Topic>`

      - **Width:** 2

      - **Height:** 2

      - **Query:** Select the appropriate query created previously.

      - **Chart type:** Pie

      - **Group by:** Tags

      - **Filter to specific tags:** All tags<br>

      ![Chart for Work Items Config](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Chart-for-Work-Items-Config.png =500x)

   2. Configure the **Pull Requests** widget:

      - **Title:** Known Issues or Bug for `<SME Topic>`

      - **Width:** 3

      - **Height:** 2

      - **Team:** Select the appropriate SME Team.<br>

      ![Pull Request Config](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Pull-Request-Config.png =500x)

   3. Configure the **Query Results** for **Known Issues or Bug** widget:

      - **Title:** `Known Issues or Bug for <SME Topic>`

      - **Width:** 3

      - **Height:** 2

      - **Query:** Select the appropriate query created previously.<br>

         ![Known Issue or Bug Query Config](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/KIB-Query-Config.png =500px)

   4. Configure the **Query Results** for **Feedback** widget:

      - **Title:** `Feedback for <SME Topic>`

      - **Width:** 3

      - **Height:** 2

      - **Query:** Select the appropriate query created previously.<br>

   4. Configure the **Query Results** for **Kudos** widget:

      - **Title:** `Kudos for <SME Topic>`

      - **Width:** 3

      - **Height:** 2

      - **Query:** Select the appropriate query created previously.<br>

6. Select **Done Editing** at the top of the Dashboard to save the changes. 

If you are interested in reading more about SME Dashboards and viewing examples of working Dashboards, please visit the [**SME Dashboard Process Documentation**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/535180/).



</details>







## Setup Folder Permissions



This step can only be completed once the pull request (PR) with the creation of the new SME Topic folder has been merged into the main branch of the wiki.



This controls what groups/users are required to approved which PRs.



<details close>

<summary>Click to expand/collapse this section</summary>

<br>



1. Navigate to **Project Settings** > **Repositories** and then click into the **AzureIaaSVM** repository.<br>   

![Go to Repositories from Project settings and select the ](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Navigate-to-Repo-to-set-up-folder-policies.png)

2. Select **Policies**, scroll down to the **Branch Policies** section, and find the **main** branch.<br>

![Select Policies and scroll down to Branch Policies section](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Choose-polices-before-branch-policies.png)<br>

![Select main from all available branches under Branch Policies](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Select-main-branch-from-branch-policies.png)

3. Scroll down to the **Automatically included reviewers** section and click the **+** on the right side of the screen. This will create a new reviewer policy.<br>   

![Select the + from the side of Automatically included reviewers](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Select-to-add-new-review-policy.png)<br>

![Add new reviewer policy window](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Empty-Add-new-reviewer-policy-window.png)

4. Fill out the **Add new reviwer policy** with the following information:

   - **Reviewers:** Add the `SME and TA - <SMETopic>` group created in the *Create New SME Team* section of this page.<br>

      ![Example of adding reviewers using AGEX SME Topic](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Enter-KM-and-SME-TA-topic-group.png)

   - **Policy requirement:** Should be set to **Required** with **Minimum number reviewers** set to **1**.<br>

      ![Verify that policy requirement then required is set to 1](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Verify-policy-requirement-set-to-required-1.png)

   - **For pull request affecting these folders:** Add the following, adding a `;` between each folder path:

      - `/SME-Topics/<NEW-SME-TOPIC-FOLDER-NAME>/*`

      - `/.attachments/SME-Topics/<NEW-SME-TOPIC-FOLDER-NAME>/*`

      - `/.templates/SME-Topics/<NEW-SME-TOPIC-FOLDER-NAME>/*`<br>

      ![For pull request affecting these folder example](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Add-folders-that-policy-should-apply-to.png)

   - **Completion options:** Uncheck the **Allow requestors to approve their own changes**.

      - **Note: This is an extremely important step. Users are NOT allowed to approve their own PRs for accuracy and PII reasons.**<br>

     ![Unecheck the box so that users can't approve their own PRs](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Uncheck-allow-self-approvals.png)

   - **Activity feed message:** `SME/TA - <NEW-SME-TOPIC-NAME>`<br>

     ![Add activity feed message](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Set-activity-feed-message.png)







5. Once completed, the form should look like the following.<br>

![Save new policy](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Save-the-new-policy.png)

6. Click **Save**

7. Find the policy you just created and verify that it is **Enabled**.

   - If the **Enabled** column switch is not set to **On**, change it to **On**<br>

     ![Verify the new policy is enabled](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Enable-the-policy-for-the-new-sme-topic.png)





</details>







## Add to SME Nomination Form for Perms



This section discusses how to add the new SME topic to the form for wiki access requests. More information on wiki permissions can be found on the [**Wiki Permissions**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/506083/AzureIaaSVM-Wiki-Permissions_Process) page.



<details close>

<summary>Click to expand/collapse this section</summary>

<br>



1. Go to: https://forms.microsoft.com/Pages/DesignPageV2.aspx?groupid=759df7b0-79d3-442b-b743-70fdd668bc70

   - **Note:** You must be a member of KM to access this link.

   - If you do not have access (and are a member of KM), request to join [the MS Teams group](https://teams.microsoft.com/l/team/19%3a69d39f39891f458e88845c857d29bcae%40thread.tacv2/conversations?groupId=759df7b0-79d3-442b-b743-70fdd668bc70&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47).

2. Click the form titled **Azure VM Wiki - TA/SME Update**.<br>

![Add-New-SME-Topic/nomination-form-1.png](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/nomination-form-1.png)

3. Scroll to question four titled "**Which TA/SME team(s):**" and select it.<br>

![Add-New-SME-Topic/nomination-form-2.png](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/nomination-form-2.png)

4. Scroll to the bottom of the answer choices and click **+Add Option**.<br>

![Add-New-SME-Topic/nomination-form-3.png](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/nomination-form-3.png)

5. Enter the new SME team name, the same name chosen in the [Create New SME Team](#create-new-sme-team) section above.

6. Click and drag the icon (6 dots) on the left of the new team to move it up the list as appropriate, to maintain alphabetical order.<br>

![Add-New-SME-Topic/nomination-form-4.png](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/nomination-form-4.png)

7. When done, click on any open space to deselect the question. The form will then auto-save at that point.

8. Check/Confirm the new team is listed [here](https://forms.microsoft.com/r/ZwgveE2s97).

</details>





<hr>















# Add New SME Topic to Wiki Repository



The steps in this section can be completed by any user and are not Knowledge Management specific. 



A dev branch will be needed for this section and all changes will be made in the dev branch. For steps on how to create a dev branch in the AzureIaaSVM wiki, see the _Editing DevOps Wiki_ page under the [**Creating a new Dev Branch**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494911/Editing-DevOps-Wiki_Process?anchor=creating-a-new-dev-branch) section.





## Add New SME Topics folder to .attachments and .templates



This section walks you through the steps to add a SME subfolder in the `/.attachments/SME-Topics` and `/.templates/SME-Topics` folders.



<details close>

<summary>Click to expand/collapse this section</summary>

<br>



1. In your dev branch, navigate to `/.attachments/SME-Topics` folder.<br>

![Expand the .attachments folder and find the SME Topics folder](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Find-sme-topics-folder-in-attachments.png)

2. Select the vertical elipsis on the top-right side of the **SME-Topics** folder. Select **+ New** and then **Folder**.<br>

![Select to add a new folder to the SME Topics folder in .attachments](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/select-to-add-new-folder-to-sme-topics.png)

3. Enter the name of the new SME Topic into the **New folder name** field. We also want to add a **.order** in the **New file name** field.

   - A file must be added for the folder to exist. This **.order** can be deleted once images have been added to the folder.<br>

   ![Create new SME Topic folder and add .order file as a placeholder](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/add-folder-name-and-order-file.png)

4. Repeat **Steps 1-3** within the `/.template` folder.<br>

![Add the new folder to .templates and SME Topics](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/add-sme-folder-to-templates.png)<br>

![Enter new SME Topic name in folder field and add .order placeholder](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/add-folder-name-and-order-file-to-templates.png)





</details>





## Create SME Feedback Template



This section covers how to create the template that you see at the bottom of all _SME Topics_ pages in the wiki. Before you can complete these steps, you must first complete all steps in the **Add New Tag** and **Create Kudos/Feedback Work Item Templates** section of this page.



<details close>

<summary>Click to expand/collapse this section</summary>

<br>



### Get Links to Feedback/Kudos Templates

1. Navigate to **Project Settings** > **Team Configuration** > **Templates** > **Kudos** or **Feedback** template.

   - <mark>NOTE:</mark> If you are unable to get to the templates, reach out to a [KM engineer](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494912/Knowledge-Management-Home?anchor=who-is-on-the-km-team%3F) to provide you with the template links.<br>

   ![Navigate to Project Settings then Team Configuration then Templates then Kudos or Feedback](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Get-Feedback-Template-Link-Kudos.png)

2. Select the elipsis (...) and choose **Copy link**. Save the link in your preferred note taking program for reference later.<br>

![Select the elipsis and Copy link](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Copy-link-from-kudos-and-save.png)

3. Repeat the above two steps to get the other link for either Kudos or Feedback.



### Create Page Feedback Template

1. In your dev branch, navigate to the `/.templates/Processes/Knowledge-Management`.

2. Select the vertical elipsis next to the **Knowledge-Management** folder and choose **+ New** > **File**.<br>

![Navigate to .templates, Proceses, Knowledge Management](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/navigate-to-templates-process-km-add-file.png)

3. Name the file `<SME-Topic>-Feedback-Template.md`, replacing <SME-TOPIC> with the name of the new SME topic and click *Create*.<br>

![Add name to File name and select Create button](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/add-sme-topic-template-name-and-create.png)

4. Add the following text to the new page, replacing all _<SME TOPIC NAME>_, _<SME AVA TEAMS CHANNEL LINK>_, _<LINK TO FEEDBACK WORK ITEM TEMPLATE>_, and _<LINK TO KUDOS WORK ITEM TEMPLATE>_ instances.

   ```

   <!-- DO NOT DELETE THIS TEMPLATE. THIS IS THE STANDARD FEEDBACK FOR ALL <SME-AREA> PAGES. -->



   # Need additional help or have feedback?



   | _To engage the <SME TOPIC NAME> SMEs..._ | _To provide feedback on this page..._ | _To provide kudos on this page..._ |

   |:----------|:----------|:-----------|

   |Please reach out to the [<span style="color:#ff6600"><u>**<SME TOPIC NAME> SMEs**</u></span>](https://wikiredirectorendpoint.azurewebsites.net/api/wikiredirecting?url=<SME AVA TEAMS CHANNEL LINK>) AVA channel via Teams.<br><br>Make sure to use the [<u>**Ava process**</u>](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496458) for faster assistance. | Use the [<span style="color:#ff6600"><u>**<SME TOPIC NAME> Feedback**</u></span>](<LINK TO FEEDBACK WORK ITEM TEMPLATE>) form to submit detailed feedback on improvements or new content ideas for <SME TOPIC NAME>.<br><br> **_Please note_** the link to the page is required when submitting feedback on existing pages! <br>If it is a new content idea, please put N/A in the Wiki Page Link. | Use the [<span style="color:#ff6600"><u>**<SME TOPIC NAME> Kudos**</u></span>](LINK TO KUDOS WORK ITEM TEMPLATE>) form to submit kudos on the page. Kudos will help us improve our wiki content overall! <br><br> **_Please note_** the link to the page is required when submitting kudos! |

   ```

   - **NOTE:** When adding the AVA channel link, use the wiki redirector like so: `https://wikiredirectorendpoint.azurewebsites.net/api/wikiredirecting?url=<INSERT-AVA-LINK-HERE>`

5. Click **Commit** in the upper right corner. (A pull request does not need to be created at this time.)<br>

![Add template code created in previous step and commit the change](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/add-template-code-and-commit-change.png)



### Add Feedback Tamplate to "Template Standards" Process Page

1. Navigate to **Processes** > **Knowledge-Management** > **Wiki-Template_Standards_Process.md**

2. Scroll down to the table with all the templets

3. Find where it should be alphabetically and add it following the format of the existing entries.



</details>





## Create Folder in SME Topics



The steps in this section and subsections cover how to create the new SME Topic folder, all subfolders, and folder landing pages.



<details close>

<summary>Click to expand/collapse this section</summary>

<br>



1. In your dev branch, navigate to the **SME-Topics** folder in the navigation tree on the left side of the screen.

2. Select the vertical elipsis on the right of the **SME-Topics** folder and choose **+ New** then **Folder**.<br>

![Create the new SME topic folder in the SME-Topics folder](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Create-new-SME-folder-in-SME-Topics-folder.png)

3. Set the **New folder name** to the name of the new SME Topic and set the **New file name** to `.order`.<br>

![Name the folder and create a .order file](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Create-new-SME-folder-in-SME-Topics-folder-and-order-file.png)

4. Add the following text to the **.order** file, replacing any necessary values:

   ```

   <SME TOPIC>-Home

   Known-Issues-or-Bug

   Workflows

   How-Tos

   TSGs

   Trainings

   ```

   Example:

   ![Example of SME Topic folder .order file](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Example-SME-topic-order-file-for-main-sme-folder.png)

5. Click **Commit**.

   - Adding this text to the **.order** file sets the order of the folders when the new folders and files are merged to the main branch. This is to have a consistent order across all SME Topics.

6. Create an addtional file in the main **SME-Topics**

   - Select the vetical elipsis to the right of the **SME-Topics** folder name and select **+ New** then **File**.

7. Name the file the _**exact same thing**_ as the new SME Topic folder created in step 2 and add the `.md` extension.

   - This will create a folder landing page when the changes are merged with the main branch.<br>   

   ![Name the new file the same thing as the new SME topic folder](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Create-folder-landing-page-file-for-new-sme-topic.png)

8. Once the file has been created, add the following replacing all necessary values with correct SME Topic name

   ```

   <!-- DO NOT DELETE THIS PAGE. It is used as a landing page for the <SME-TOPIC-NAME> folder. -->



   # <SME TOPIC NAME>



   This folder contains articles organized into sub-folders related to the <SME TOPIC NAME> SME area.



   <br>



   [[_TOSP_]]

   ```

9. Click **Commit**.





</details>





### Create Files in New SME Topic Folder



This section covers adding subfolder landing pages and the new SME topic home page to the SME topic folder created in the previous section.



<details close>

<summary>Click to expand/collapse this section</summary>

<br>



1. Navigate to the new SME folder created in the **Create Folder in SME Topics** section above.

2. Select the vertical elipsis then **+ New** then **File**.<br>

![Create the new file](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Create-new-file-for-subfolder-landing-pages.png)

3. You will need to create a file for each the following: 

   - <SME TOPIC>-Home.md

   - Known-Issues-or-Bug.md

   - Workflows.md

   - How-Tos.md

   - TSGs.md

   - Trainings.md<br>

   ![Name the folder same as listed in step above](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Create-new-file-for-subfolder-landing-pages-how-to-example.png)



4. The <SME TOPIC>-Home page can be filled with information specific to that SME area, such as the list of SMEs.

   - The [**Wiki Page Standards**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494917/Wiki-Page-Standards_Process) process should be reviewed for needed page elements.

   - Example home pages include [**AGEX Home**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494943/AGEX-Home), [**Unexpected Restarts Home**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496374/Unexpected-Restarts-Home), and [**VMSS Home**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496448/VMSS-Home) to name a few.

5. For the files `Workflows.md`, `How-Tos.md`, `TSGs.md`, and `Trainings.md`, add the following respectivly and replacing needed values:

   - **Workflows.md:**

      ```

      ---

      Tags:

      - cw.<SME-Topic-Tag>

      - cw.Workflow

      - cw.Reviewed-07-2025

      ---



      ::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md

      :::



      <!-- DO NOT DELETE THIS PAGE. It is used as a landing page for the <SME TOPIC> Workflows folder. -->



      # <SME TOPIC> - Workflows



      Please reference the articles in this folder to see the current Workflows for <SME TOPIC>.



      [[_TOSP_]]

      ```

   - **How-Tos.md:**

      ```

      ---

      Tags:

      - cw.<SME-Topic-Tag>

      - cw.How-To

      - cw.Reviewed-07-2025

      ---



      ::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md

      :::



      <!-- DO NOT DELETE THIS PAGE. It is used as a landing page for the <SME TOPIC> How-Tos folder. -->

   

      # <SME TOPIC> - How Tos



      Please reference the articles in this folder to see the current How Tos for <SME TOPIC>.



      [[_TOSP_]]

      ```

   - **TSGs.md:**

      ```

      ---

      Tags:

      - cw.<SME-Topic-Tag>

      - cw.TSG

      - cw.Reviewed-07-2025

      ---



      ::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md

      :::



      <!-- DO NOT DELETE THIS PAGE. It is used as a landing page for the <SME TOPIC> TSGs folder. -->

   

      # <SME TOPIC> - TSGs



      Please reference the articles in this folder to see the current TSGs for <SME TOPIC>.



      [[_TOSP_]]

      ```

   - **Trainings.md:**

      ```

      ---

      Tags:

      - cw.<SME-Topic-Tag>

      - cw.TSG

      - cw.Reviewed-07-2025

      ---



      ::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md

      :::





      <!-- DO NOT DELETE THIS PAGE. It is used as a landing page for the <SME TOPIC> Trainings folder. -->

   

      # <SME TOPIC> - Trainings

   

      Please reference the articles in this folder to see the current Trainings for <SME TOPIC>.



      [[_TOSP_]]

      ```

6. For the `Known-Issues-or-Bug.md` file:

   1. Reach out to the STAs and/or EEE Claudia Mendes (clmendes) to provide them with the shared queried link/guid for emergining issues you previously created. They will need to update any neccessary automations related to the Known Issues or Bug process.

   2. In the mean time, add the following and replace needed values:

      ```

      ---

      Tags:

      - cw.SME-TOPIC

      - cw.Known-Issue-or-Bug

      ---



      <!-- DO NOT DELETE THIS PAGE. It is used as a landing page for the <SME TOPIC> Known-Issues-or-Bug folder. -->



      <!--UNCOMMENT THIS SECTION AND UPDATE IT WITH THE PROPER QUERY GUID ONCE CREATED>

      ::: query-table xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

      :::

      -->

      ```



</details>



### Create Subfolders in New SME Topic Folder



<details close>

<summary>Click to expand/collapse this section</summary>

<br>



1. In your deb branch, navigate to the new SME folder

2. Select the vertical elipsis then **+ New** then **Folder**.<br>

![Create new subfolder in new SME folder](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Create-new-subfolder-new-sme-topic.png)

3. Create folders for:

   - Known-Issues-or-Bug

   - Workflows

   - How-Tos

   - TSGs

   - Trainings

4. The folders should be named the same as the files created in the **Create Files in New SME Topic Folder** section of this page.

5. When creating the folder, set **Folder name** to one of the five (5) folders, and set the **File name** to `.order`.<br>

![Name folder one of the 5; Known Issues or Bug, Trainings, Workflows, How Tos, or TSGs](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Create-new-subfolder-new-sme-topic-known-issue-or-bug-example.png)

6. Click the **Create** button.

7. The `.order` file can remain empty.

8. Click **Commit** once done.<br>

![Once .order folder has been completed use the commit button in the top right corner to save the page](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Create-new-order-file-for-sme-topic-subfolder.png)



</details>





## Add New Page Tag to KM Page Tags 



This section covers updating the [**Wiki Page Tag Standards**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/500674/Wiki-Page-Tag-Standards_Process) Knowledge Management process page with the new SME topic tag. Once this step is completed, a Pull Request (PR) can be created for review.



<details close>

<summary>Click to expand/collapse this section</summary>

<br>



1. In your branch, navigate to `/Processes/Knowledge-Management-(KM)/Wiki-Page-Tag-Standards_Process.md`<br>

![Navigate to the Wiki Page Tag Standards process page in the navigation tree on the left side of the screen](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Navigate-to-Wiki-Page-Tag-Standards-Process-page.png)

2. Click **Edit** in the top-right of the screen.

3. Scroll down to the **When to use Page Tags** section.<br>

![Select the Edit button at the top right of the screen](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Edit-km-page-tags-standard-section.png)

4. Using the SME tag that was created in the **Add New SME Topic Tag** section of this page, update the table to add the new tag.

   - The table is in alphabetical order, so place the new tag in the appropriate spot based on this information.<br>

![Add the tag to the table based on alphabetical order](/.attachments/Processes/Knowledge-Management/Add-New-SME-Topic/Edit-table-with-new-sme-tag-and-commit.png)

5. Once the tag has been added, click **Commit**.

6. A pull request (PR) can now be created for approval.





</details>





## Update SME Area Table Templates for Welcome page



**NOTE: This section cannot be completed until the PR for all the above edits (creating the new SME Topic folder, landing pages, etc.) have been completed.**



This section give two templates that must be updated for the wiki [**Welcome**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494511/Welcome) page. 





<details close>

<summary>Click to expand/collapse this section</summary>

<br>



There are also 2 templates that need to be updated when a new SME topic is added:  



| **<span style="background-color:red; color:black;">IMPORTANT!</span>** |

|:-----------------------------------------------------------------------|

| If the new SME topic is aligned under a _Vertical_ then put the new link under the correct verticals column. If it <u>doesn't</u> fall under a _Vertical_, then put it under the _Other_ column. |



1. The following template needs to be updated with a link to the new SME areas home page.<br>

   ```/.templates/Processes/Knowledge-Management/SME-Areas-by-Vertical-Table.md```

2. The Known-Issues-or-Bug-by-SME-Topic-Table template should be updated with a link to the Known Issues or Bug subfolder for the new SME topic.<br>

   ```/.templates/Processes/Knowledge-Management/Known-Issues-or-Bug-by-SME-Topic-Table.md```



</details>







::: template /.templates/Processes/Knowledge-Management/KM-Feedback-Template.md

:::

