---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Knowledge Management (KM)/SME Dashboards_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Knowledge%20Management%20%28KM%29/SME%20Dashboards_Process"
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



This page provides insight on the Subject Matter Expert (SME) Dashboards and their intended usage. 



# What are SME Dashboards?



SME Dashboards act as a landing page for SMEs to review pending AzureIaaSVM Wiki action items that their SME team is responsible for. 



## Editing SME Dashboards



These Dashboards are <u>**NOT**</u> individualized. Any changes made to the Dashboard will impact the view for all other SMEs in your SME team. For this reason, <u>**please do not edit any widgets on the SME Dashboards.**</u> For any changes that need to be made to the SME Dashboard, please contact the Knowledge Management team using the contact information at the [bottom of this page](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/535180/SME-Dashboards_Process?anchor=have-feedback%3F).



## What information is displayed on SME Dashboards?



The following content is present on SME Dashboards:

- **SME Team Members:** A list of the all the _verified_ SMEs in the respective SME area. If you need to add a SME member or be added to a SME team, please review the [**AzureIaaSVM Wiki Permissions Process**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/506083/AzureIaaSVM-Wiki-Permissions_KM-Process?anchor=subject-matter-experts-(smes)) for further instructions. 

- **Quick Access - Create a New Work Item:** A "New Work Item" widget is available for SMEs to easily create work items to track on-going efforts in their SME area. 

- **Known Issues or Bug by Vertical Chart:** A pie chart detailing the new Known Issues or Bug in the SME area's respective Vertical. This chart offers a visual representation of all Known Issues or Bug and it does not provide actionable information. 

- **Pending Pull Requests (PR):** A list of all Pull Requests requiring approval from the respective SME group. Wiki permissions are configured so that any change to the content in respective SME folders _requires_ an approval from a TA/SME in that SME area. For example, if a user were to make a change to a document in the /SME-Topics/Azure-Advisor/TSGs folder and create a Pull Request, the PR would automatically require an approval from the <u>SME and TA - Azure Advisor</u> team. This PR would be displayed in the Pull Requests widget until a member of the SME team approves the changes. To learn more about approving PRs, please review the [**Approving Pull Requests Process**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494910/).

- **Known Issues or Bug for Vertical:** A list of all new and active Known Issues or Bug (KIB) in the SME area's respective Vertical. These Known Issue or Bug Work Items indicate that a new troubleshooting guide (TSG) must be developed and published for this issue. Not all Work Items in this widget will apply to the SME team whose dashboard the user is currently viewing. Pay special attention to the tags on these Work Items to identify what SME team is responsible for creating the new TSG. When there is a new EI Work Item for your SME area, the SME team must assign the Work Item to a team member and they are responsible for creating the TSG. It is up to the SME team to determine how to assign these Work Items to their team members. For more information on Known Issues or Bug, how they are identified and how they must be documented in the Wiki, review the [**How To Declare an Known Issue or Bug Process**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494899/).

- **Feedback:** A list of all active Feedback Work Items related to this SME team's Wiki content. All Wiki pages have an option to provide feedback on the content at the bottom of the page. When an engineer provides feedback on any page in the /SME-Topics folder, a Work Item is created and assigned to the respective SME team. When there is a new Feedback Work Item for your SME area, the SME team must assign the Work Item to a team member and they are responsible for reviewing the feedback, updating content if necessary, and closing the Work Item. It is up to the SME team to determine how to assign these Work Items to their team members.

- **Kudos:** A list of all active Kudos Work Items related to this SME team's Wiki content. All Wiki pages have an option to provide kudos on the content at the bottom of the page. When an engineer provides kudos on any page in the /SME-Topics folder, a Work Item is created and assigned to the respective SME team. When there is a new Kudos Work Item for your SME area, the SME team must assign the Work Item to a team member and they are responsible for reviewing the kudos and closing the Work Item. This information can be useful when identifying what content is the most useful for Support Engineers and how to improve other content. It is up to the SME team to determine how to assign these Work Items to their team members.



# SME Dashboards by SME Team



SME Dashboards can be found by navigating to the AzureIaaSVM Wiki (**https://aka.ms/vmwiki**) and under the _Overview_ section, select _Dashboards_. Expand the _All Dashboards_ drop down and identify the correct Dashboard for your SME team. All SME Dashboards follow the same naming convention: "{SME AREA} SME Dashboard".



A table of all SME Dashboards is provided below:

| **SME Area** | **SME Dashboard** | 

|:------------ |:----------------- |

| Agents & Extensions (AGEX) | [AGEX SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/6891d500-306a-4cab-a22c-4247ef117835) |

| Azure Advisor | [Advisor SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/b8f442ac-5467-4c5a-95f9-3c33ae3cf413) |

| Azure Center for SAP Solutions (ACSS) | [ACSS SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/038a7851-9686-403b-af14-f89fc2142f4f) |

| Azure Compute Gallery (SIG) | [SIG SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/57d360cf-e0e9-4766-ab34-ba24f794990c) |

| Azure Encryption | [Azure Encryption SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/f25a3833-41bd-440f-b867-7f237ac2b9a4) |

| Azure Files - All Topics | [Azure Files SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/300c1134-d21a-4af9-ba68-50379a9e7562) |

| Azure Files Sync | [Azure Files Sync SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/63b19217-9653-450a-ae32-1c0b99e2d97c) |

| Azure Image Builder (AIB) | [AIB SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/28095656-514c-42eb-aa65-e4d26dbc8693) |

| Can't RDP SSH | [Connectivity SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/8c1916d6-8da4-4e44-b587-4b4075c43ca2) | 

| Can't Start Stop | [Can't Start Stop SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/c35a5814-b456-407c-a6d5-acdcfcbb12e7) |

| Azure Cloud Shell | [Azure Cloud Shell SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/4729de64-7d27-4656-8d58-342d6ca760a2) |

| Dedicated Host | [Dedicated Host SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/4326cf6d-ce89-4139-8969-01ff92539830) |

| Deployment | [Deploy SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/b6573e87-9df2-45d5-bb9a-dfd4c001e776) |

| Disk Management | [Disk Mgmt SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/5a7bdaa0-367a-4d79-8474-40400c003ef1) |

| Instance Meta Data Service (IMDS) | [IMDS SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/145de363-117b-496d-824f-5d0a4c48c5d7) |

| Linux on Azure | [Linux SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/7a1fb26f-c009-4f13-8867-7733e4e13bc0) |

| Managed Service Identity (MSI) | [MSI SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/8e0bb356-b5aa-4a6b-b323-8827b562504e) |

| Migration & Move | [Mig-Move SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/439bdb9b-7b2c-47f2-b81b-60984cb4ca98) |

| Performance | [Performance SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/b76e2089-5768-45c7-a7cf-b7981f8045e6) | 

| Planned Maintenance | [Planned Maint SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/b92b77aa-5d5b-44ed-ac6b-3a2c3eaad269) |

| Portal | [Portal SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/d7db4622-7eed-47bc-abeb-787f4342a2f8) |

| Recover Storage Objects | [Recover Storage SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/44421935-6056-41a9-835e-8850c624013b) |

| Serial Access Console (SAC) | [Connectivity SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/8c1916d6-8da4-4e44-b587-4b4075c43ca2) | 

| Storage Account Management | [Storage Acct Mgmt SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/19557a6e-d554-4e73-92c6-55dbe367fbf4) |

| Storage Billing | [Storage Billing SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/b70d6624-79ff-4834-b075-99a39f710bf9) |

| Storage Connectivity | [Storage Conn SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/ac43c37e-fa5b-49d4-9784-e80faa0410fe) |

| Storage Data Migration | [Storage Data Mig SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/d5497079-bc16-456d-b175-a2bb1fd04651) |

| Storage Monitoring | [Storage Monitor SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/84ec32e0-b4f5-4524-b1ed-7aa3ae521171) |

| Storage Performance | [Storage Perf SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/030e8488-ed2a-4ade-b546-89214bbb4c9e) |

| Unable to Delete Storage | [Unable to Delete SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/8e4a3d8d-ea1b-4a11-885a-e89de97bd982) |

| Unexpected Restarts | [Restarts SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/b0c6db16-4c98-434e-ac63-457f8439dbe9) |

| Virtual Machine Scale Sets (VMSS) | [VMSS SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/726be7f8-fae1-4c72-b9cc-b20302c0b36f) |

| Windows on Azure (WOA) | [Windows on Azure SME Dashboard](https://supportability.visualstudio.com/AzureIaaSVM/_dashboards/dashboard/920ad3a6-ee11-46cc-964a-e8076cc914e4) |



::: template /.templates/Processes/Knowledge-Management/KM-Feedback-Template.md 

:::

