---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Knowledge Management (KM)/Permissions Explained_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Knowledge%20Management%20%28KM%29/Permissions%20Explained_Process"
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



Below you can find details about each group/team in this Azure DevOps (ADO) project, how they relate to creating and editing content, and who can approve and merge pull requests.



**ALL** users can propose changes and new content in the AzureIaaSVM wiki. These changes should be made in a private branch and submitted via a pull request (PR) for merger into the main branch. Additional details on how to make a branch and submit a pull request can be found in the [**Editing DevOps Wiki**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494911/) and [**Approving Pull Requests**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494910) process pages.



Depending on the page that is being edited, there are various approval groups that will be automatically added to your PR. A PR cannot be merged until all approvals have been received by at least one member of each required group.



<br>



# Joining a Permissions Group



By default, **all users have read access** to the AzureIaaSVM wiki. You do not need to join a group to access TSG's, How-To's, etc.



| <mark>IMPORTANT</mark> |

|:-----------------------|

| For steps on joining the various permissions groups, please see the [**FAQ**](#frequently-asked-questions-(faq)) at the bottom of this page. |





---





<br>



# <span style="color:blue">PR Approvers</span>



While **ANY** user may cast votes on a PR, each PR will have policies applied that require a member of a specified team(s) to also approve the PR. A PR cannot be merged until it receives all of its required approvals. The required team(s) are detailed below.



## SME and TA - "Topic"

<details closed>

<div style="background-color:#EAEAEA; color:black">



There are currently 33 "**SME and TA - _<topic>_**" teams.



Every SME topic has a respective "SME and TA" team that will be automatically added as a required approver to any PRs that are attempting to modify pages within their respective SME topic folder(s). To ensure the integrity and accuracy of the wiki, **only fully ramped SMEs will be added to these teams**. We will **not** permit adding existing DLs to these groups.



These teams have the following nested groups:

- TA - _<vertical>_

- EEE - _<vertical>_



Note: Two exceptions:

- **SME and TA - Linux on Azure** is vertical agnostic, it therefore uses the **All TAs** team instead of a **TA - _<vertial>_** team

- **SME and TA - Windows on Azure** at the request of the team it does not have TA approvers. Regular ongoing reviews by the SMEs have been commited to, with manager sponsorship.



These teams are also a member of:

- Readers Only

- Project Valid Users

</div>

</details>



## All TAs

<details closed>

<div style="background-color:#EAEAEA; color:black">



This group is used for PR approvals on any pages that fall outside of a SME topic (e.g., "Tools", "Process", etc).



It contains all four **TA - _<vertical>_** teams as nested members, allowing any TA to satisfy this team's requirement on a PR.

- TA - Config and Setup

- TA - Connectivity

- TA - Management

- TA - Storage



This team is also a member of:

- Project Valid Users

- SME and TA - Linux on Azure*



Note: "Linux on Azure" is vertical agnostic, therefor its SME team contains the **All TAs** team in place of a **TA - _<vertial>_** team.

</div>

</details>



## Process Owner - "Process"

<details closed>

<div style="background-color:#EAEAEA; color:black">



These teams are used when a process document has a defined owner. 



Not all processes have "owners". For those that do, these groups are used in PR approval policies to ensure those owners sign off on any changes to that process document. Examples of owned processes would be the Handover Process and LSI SIE Playbook.



Unlike the other groups, this group can self-approve. Meaning they can approve their own PRs when editing their owned process.



**Note:** The "All TAs" group would also be included on PRs modifying any process. If the PR's author is the process owner and a TA, their self approval would ONLY validate the requirement for the **Process Owner - _<process>_** policy and NOT the **All TAs** policy.



These teams are also a member of:

- Readers Only

- Project Valid Users

</div>

</details>



## Knowledge Management (aka "KM")

<details closed>

<div style="background-color:#EAEAEA; color:black">



**All** PRs require approval from a member of this team.



KM is responsible for reviewing content for PII, adherence to wiki standards, and more. They do not look at technical content as closely, which is why we have other polices requiring appropriate "SME and TA" team(s) to approve PRs as well.



This is the **only team able to complete/merge PRs** into the main branch or delete other users' dev branches. This is a tightly controlled group of individuals who have completed privacy trainings for internal KB content and are familiar with the processes and standards as documented in the [**Knowledge Management Processes**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494912).



**Note:** Membership of this team is limited to FTEs and is managed via CoreIdentity Entitlement: [AzureIaaSVM Wiki KM - PR Approvers](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azureiaasvmw-1mtm).



This team is also a member of:

- Readers Only

- Project Valid Users

</div>

</details>



## Break-Glass Editors

<details closed>

<div style="background-color:#EAEAEA; color:black">



The purpose of this team is to allow its members to **force the completion/merger of PRs**, regardless of approvals, **by bypassing all PR policies**.



This is a **severly controlled group**. It is intended only for the <u>_critical_</u> merging of pages for major Live Site Incidents (LSIs) or Service Impacting Events (SIEs).



This team cannot make direct edits to the main branch, meaning the use of private branches and PRs is still required. It is expected that the point of contact (POC) for the LSI/SIE/etc, will author the artical.



All PRs approved by this group will be reviewed by the Project Administrators as a compliance check. <u>**This is a tightly monitored group. Your access to this group can be revoked at any time should it be determined that it is being used to approve PRs outside of its intended use.**</u>



This team is also a member of:

- Project Valid Users

</div>

</details>



---







<br>



# <span style="color:red">Permissioned Groups</span>



These are the groups that have additional permissions in more than just the wiki repository.



## KM - Group Membership Admins

<details closed>

<div style="background-color:#EAEAEA; color:black">



This is a subset of the Knowledge Management team. It was created to separate the responsibiliy of adding and removing users in the SME/TA/EEE groups, from the rest of the primary KM team.



As the primary KM team continues to grow and and its members acclimate to their new role, we wanted to ensure that membership change requests were handled by KM members who fully understood how the wiki's permissions and PR policies are designed and applied. Mistakes in group memberships could adversely impact the PR review and approval process.



This team is also a member of:

- Readers Only

- Project Valid Users

</div>

</details>



## Project Administrators

<details closed>

<div style="background-color:#EAEAEA; color:black">



Full control over all aspects of this ADO (Azure DevOps) project.



As the name suggests, members of this team can administrate the entire AzureIaaSVM project.



The Project Administrators have **removed** the following permissions from themselves:

- Bypass polices when completing pull requests

- Bypass polices when pushing

- Rename repository

- Create repository (more than one repo is not needed at this time)

- Delete repository (if the repo is ever deleted, all VM documentation will also be deleted. **THIS SHOULD NEVER BE DONE.**)



**Note:** Project Administrators may alter their team's permissions to regain any of the above items, should the need arise. These items were simply removed to help prevent any unintentional consequences.



This team is also a member of:

- AzureIaaSVM Team

- Project Valid Users



**As of 2023-11-17, direct membership is no longer permitted per 1ES/Security360 guidelines.** A "Priviledged Identity Management" (PIM) group has replaced all direct memberships to the Project Administrators group. The former Project Administrators are now members of the **ADO-SUPPORTABILITY-AZUREIAASVM-PA-JIT** PIM group and the PIM group is listed as the only Project Administrator to the wiki. The PIM group members are able to elevate their permissions for a limited time (similar to a JIT request) to gain Project Administrator permissions if/when needed, but "persistent access" is no longer given/used.



PIM group members can follow this guide to elevate their access into the PIM group: [Elevating Access into the PIM Group](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1254062/PIM-Access-Group-for-Project-Administrators_Process?anchor=elevating-access-into-the-pim-group)

</div>

</details>



## Readers Only

<details closed>

<div style="background-color:#EAEAEA; color:black">



While this team does **not** have any management abilities, it is the only remaining group with directly assigned permissions.



Members of this team have access to read and access the ADO project and its wiki. This is the primary team used for bulk assignment of permissions to all users.



The primary member of this group is "Microsoft All Staff". This allows all of the Microsoft org to leverage our wiki as needed (this is standard across all projects inside the Supportability ADO Org.)



This team has the following nested groups:

- Microsoft All Staff

- SME and TA - _<topic>_

- TA - _<vertical>_

- EEE - _<vertical>_

- Process Owner - _<process>_

- Knowledge Management

- KM - Group Membership Admins

- AzureIaaSVM Team



This team is also a member of:

- Project Valid Users

</div>

</details>



---







<br>



# <span style="color:#1AB22D">Logical Groups Only (no direct permissions)</span>



## TA - "Vertical"

<details closed>

<div style="background-color:#EAEAEA; color:black">



These teams are logical groupings for each vertical's TAs.



While not directly used in PR approval policies, they are members of other groups used in PR policies (e.g., the "SME and TA" or "All TAs" teams). In contrast to the old wiki, TAs are no longer able to complete and merge PRs to the main branch.



There are four "**TA - _<vertical>_**" teams:

- TA - Config and Setup

- TA - Connectivity

- TA - Management

- TA - Storage



These teams are also a member of:

- Readers Only

- Project Valid Users

- All TAs

- Respective "SME and TA" group, for each SME topic in their vertical.

</div>

</details>



## EEE - "Vertical"

<details closed>

<div style="background-color:#EAEAEA; color:black">



These teams are logical groupings for each vertical's EEEs.



For simplicity, we have equated EEEs to the same as SMEs, in regard to wiki content. Like the TA teams, the EEE teams are not directly used in PR approvals. Each team is instead a member of the approrpiate "SME and TA" groups, which are used in PR policies.



These are the only teams we have made an exception for and permit the inclusion of DLs.



There are three "**EEE - _<vertical>_**" teams:

- EEE - Config and Mgmt*

- EEE - Connectivity

- EEE - Storage



**Note:** Because the "Configuration & Setup" and the "Management" verticals share the same EEEs, these two were merged into a single team.



These teams are also a member of:

- Readers Only

- Project Valid Users

- Respective "SME and TA" group, for each SME topic in their vertical.

</div>

</details>



---







<br>



# <span style="color:#B5B5B5">Default Built-in Teams (do not use)</span>



These are default teams created with all ADO projects. They serve little to no purpose for our needs currently but cannot be removed.



Do not add/remove memberships in these groups.



## Build Administrators

<details closed>

<div style="background-color:#EAEAEA; color:black">



Members of this team can create, modify, and delete build definitions, as well as manage queued and completed builds.



Currently, the AzureIaaSVM project does not utilize any pipelines or builds.



There will be future updates to leverage these items for automated wiki management, but there is currently no ETA on when this will be done.

</details>



## Project Valid Users & AzureIaaSVM Team

<details closed>

<div style="background-color:#EAEAEA; color:black">



All users of the AzureIaaSVM wiki project are part of these groups.



Members of the _Project Valid Users_ and _AzureIaaSVM Team_ groups have access to the team project. 

</details>



---







<br>



# Frequently Asked Questions (FAQ)



<details close>

<summary>How can I view group/team permissions?</summary>



1. Select **Project Settings** at the bottom of the menu, on the left side your screen.<br>

![Select Project Settings](/.attachments/Processes/Knowledge-Management/AzureIaaSVM-Wiki-Permissions_Select-Project-Settings.png)



2. Under **General** select **Permissions**. From there, you can view by **Groups** or **Users**.<br>

![Click Permissions to view permissions](/.attachments/Processes/Knowledge-Management/AzureIaaSVM-Wiki-Permissions_Click-Permissions-to-view-permissions.png)



3. From here, by clicking on any of the groups you can view what permissions that group has, who is a member of the group, what other groups that group is a member of, and the settings of that group.

</details>



<br>



<details close>

<summary>Why can't I add users to a group?</summary>



Only members of the "KM - Group Membership Admins" team or "Project Administrators" can add users to groups. This is to ensure only authorized users are given permissions to approve PRs, to assist with keeping the integrity of the wiki's content.

</details>



<br>



<details close>

<summary>How can I be added to a group?</summary>



This depends on the group you are looking to join. 



1. **Readers Only**, **Project Valid Users**, and the **AzureIaaSVM Team**: You only need to be an employee at Microsoft.<br>

You should, by default, have access to read the wiki.



2. **Subject Matter Expert (SME)**: You must be a fully ramped SME in that SME topic.<br>

For information on how to become a SME, please see the [**IaaS VM SME Ramp Up Process**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494900).<br>

<br>

To be added to a SME group, reach out to the Technical Advisor (TA) over your SME topic, or Service TA over the topic's vertical, and have them submit the request at [**Azure VM Wiki - TA/SME Update**](https://forms.office.com/r/ZwgveE2s97). A member of the KM team will review the request and add you to the appropriate groups.



3. **Technical Advisors (TA)**: You must be an Acting Technical Advisor (ATA), Technical Advisor (TA), or Service TA (STA) in the VM POD.<br>

If you are an ATA, TA, or STA, submit your request at [**Azure VM Wiki - TA/SME Update**](https://forms.office.com/r/ZwgveE2s97).



4. **Knowledge Management**: Membership is controlled via Core Identity. You can [request membership](https://coreidentity.microsoft.com/manage/entitlement/entitlement/azureiaasvmw-1mtm), but your request will be denied if not sponsored by a KM Manager, Project Admin, or Region Lead as listed [here](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494912/Knowledge-Management-Home?anchor=who-is-on-the-km-team%3F). Contact azvmkm-globalleads@microsoft.com for more information.



5. **Break Glass Editors**: Users in this group must be members of the Knowledge Management team and have been determined to have an advanced knowledge of **ALL** KM processes.<br>

<br>

Membership is controlled via Core Identity. You can [request membership](https://coreidentity.microsoft.com/manage/entitlement/entitlement/azureiaasvmw-1mtm), but your request will be denied if not sponsored by a KM Manager, Project Admin, or Region Lead as listed [here](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494912/Knowledge-Management-Home?anchor=who-is-on-the-km-team%3F). Contact azvmkm-globalleads@microsoft.com for more information.



6. **Project Administrators**: Please reach out to azvmkm-admins@microsoft.com.<br>

At a minimum you must be an ATA/TA/STA, can demonstrate advanced ADO navigation/configuration, and be willing to accept ALL responsibiliy (and blame) for the wiki.

</details>



---



<br>



::: template /.templates/Processes/Knowledge-Management/KM-Feedback-Template.md

:::

