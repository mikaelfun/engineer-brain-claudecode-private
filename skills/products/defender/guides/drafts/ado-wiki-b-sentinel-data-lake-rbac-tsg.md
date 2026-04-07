---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Microsoft Sentinel data lake/[TSG] - Sentinel data lake - RBAC"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Microsoft%20Sentinel%20data%20lake/%5BTSG%5D%20-%20Sentinel%20data%20lake%20-%20RBAC"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<!-- Optional: Link to PG original TSG doc -->
Link to Product Group (PG) [Original TSG Document](https://microsoft.sharepoint.com/:w:/t/SecurityPlatform/ET5eJwzNWq1Eu5cFHkfoIZsBG3aRekTw6PMGN_EbejSIkw?e=PHOrVH)

---
<!--  Required: Table of Contents -->
[[_TOC_]] 

<!--  Required: Training sessions resources and links-->
# Training sessions
|Date (DD/MM/YYYY) | Session Recording | Presenter |
|--|--|--|
| 17/07/2025 | [Sentinel Data Lake - RBAC](https://platform.qa.com/resource/sentinel-data-lake-rbac-1854/?context_id=12963&context_resource=lp) | Amy Hariharan Dang |

---
# Documentation

Use the following links to access public documentation related to access control for data lake.

- Microsoft Sentinel Data lake permissions: [Roles and permissions in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/roles#roles-and-permissions-for-the-microsoft-sentinel-data-lake-preview)
- Microsoft Defender XDR URBAC: [Create custom roles with Microsoft Defender XDR Unified RBAC](https://learn.microsoft.com/en-us/defender-xdr/create-custom-rbac-roles) 
- Microsoft Defender XDR URBAC: [Permissions in Microsoft Defender XDR Unified role-based access control (RBAC)](https://learn.microsoft.com/en-us/defender-xdr/custom-permissions-details)

---
# Scenarios

Some of the key public preview scenarios that our customers will be trying to achieve are as follows. These are pivoted more on customer outcomes being sought, it may not be comprehensive as solutions evolve:

## Read
- I want to interactively query data lake using Notebook, Lake Explorer, ADX, or SQL advanced analytics experiences.

## Write
- I want to schedule or manage scheduled advanced analytics jobs for the data lake through Notebook, ADX, or Lake Explorer.
- I want to change retention settings on tables in the data lake.
- I want to create an output table in the default lake workspace through Notebook.
- I want to create an output table in the LA workspace using Notebook or Lake Explorer or ADX.
- I want to configure a connector to land data in the data lake.

---
# Prerequisites

- Tenant has Defender XDR (URBAC)
- Tenant has log analytics workspaces onboarded to Microsoft Sentinel: Workspace must be [onboarded to the Defender portal](https://review.learn.microsoft.com/en-us/unified-secops-platform/microsoft-sentinel-onboard?toc=%2Fazure%2Fsentinel%2FTOC.json&bc=%2Fazure%2Fsentinel%2Fbreadcrumb%2Ftoc.json) and the [Microsoft Sentinel data lake](https://aka.ms/data-lake-overview).
- User is a local tenant account (not External user)

---
# Roles and permissions for the Microsoft Sentinel data lake (Preview)

## Microsoft Sentinel data lake read permissions

To enumerate workspaces in the data lake, see tables within a workspace, view tables in table management, view connectors and status, or interactively query the data lake in notebook, adx, lake explorer or SQL. You need read permission.

Microsoft Entra ID roles provide broad access across all workspaces in the data lake. Use the following roles to provide read access to all workspaces within the Microsoft Sentinel data lake, such as for running queries.

| **Permission type** | **Supported roles** |
| --- | --- |
| **Read access across all workspaces** | Use any of the following Microsoft Entra ID roles:<br>- [Global reader](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#global-reader)<br>- [Security reader](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/security#security-reader)<br>- [Security operator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#security-operator)<br>- [Security administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#security-administrator)<br>- [Global administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#global-administrator) |

Alternatively, you might want to assign the ability to read tables from within a specific workspace. In such cases, use one of the following:

| **Tasks** | **Permissions** |
| --- | --- |
| **For read permissions on the default workspace** | Use a [custom Microsoft Defender XDR unified RBAC role with _security data basics (read)_](https://aka.ms/data-lake-custom-urbac) permissions over the Microsoft Sentinel data collection. |
| **For any other Microsoft Sentinel workspace in the data lake** | Use one of the specific built-in roles in Azure RBAC for permissions on that workspace:<br>- [Log Analytics Reader](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/monitor#log-analytics-reader)<br>- [Log Analytics Contributor](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/monitor#log-analytics-contributor)<br>- [Microsoft Sentinel Contributor](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/security#microsoft-sentinel-contributor)<br>- [Microsoft Sentinel Reader](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/security#microsoft-sentinel-reader)<br>- [Reader](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/general#reader)<br>- [Contributor](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/privileged#contributor)<br>- [Owner](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/privileged#owner) |

## Microsoft Sentinel data lake write permissions

To schedule or manage scheduled advanced analytics jobs for the data lake through Notebook, ADX, or Lake Explorer, or to change retention settings or move tables between tiers in table management, or to configure a connector to the data lake, or to create an output table in the data lake: you need write permissions.

Microsoft Entra ID roles provides broad access across all workspaces in the data lake. Use the following roles to provide write access to the Microsoft Sentinel data lake tables:

| **Permission type** | **Supported roles** |
| --- | --- |
| **Write to tables in the analytics tier using KQL jobs or notebooks** | Use one of the following Microsoft Entra ID roles:<br>- [Security operator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#security-operator)<br>- [Security administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#security-administrator)<br>- [Global administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#global-administrator) |
| **Write to tables in the Microsoft Sentinel data lake** | Use one of the following Microsoft Entra ID roles:<br>- [Security operator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#security-operator)<br>- [Security administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#security-administrator)<br>- [Global administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#global-administrator) |

Alternatively, you might want to assign the ability to write output to a specific workspace, including creating, updating, and deleting tables in that workspace. In such cases, use one of the following:

| **Tasks** | **Permissions** |
| --- | --- |
| **For edit permissions on the default workspace** | Use a [custom Microsoft Defender XDR unified RBAC role with _data (manage)_](https://aka.ms/data-lake-custom-urbac) permissions over the Microsoft Sentinel data collection. |
| **For any other Microsoft Sentinel workspace in the data lake** | Use any built-in or custom role that includes the following Azure RBAC [Microsoft operational insights](https://learn.microsoft.com/en-us/azure/role-based-access-control/permissions/monitor#microsoftoperationalinsights) permissions on that workspace:<br>- _microsoft.operationalinsights/workspaces/write_<br>- _microsoft.operationalinsights/workspaces/tables/write_<br>- _microsoft.operationalinsights/workspaces/tables/delete_<br>Example built-in roles that include the above are Log Analytics Contributor, Owner, and Contributor. |

# Manage jobs in the Microsoft Sentinel data lake

To create scheduled jobs or manage jobs in the Microsoft Sentinel data lake, you must have one of the following Microsoft Entra ID roles:

- [Security operator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#security-operator)
- [Security administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#security-administrator)
- [Global administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#global-administrator)

---
<!-- Optional: Frequently Asked Questions-->
# FAQs

**Q1**: **How can I get permissions to schedule or manage scheduled jobs?**  
**A1**: For public preview, you must hold Entra Global Administrator, Security Administrator, or Security Operator role to schedule or manage scheduled jobs.

**Q2**: **How do I use the "Advanced Analytics" permission in Microsoft Defender URBAC � within the permission group for Data Operations?**  
**A2**: For public preview, this permission will not yet be able to be used effectively. We are working on allowing more democratized job access at which point this permission can be used. For public preview, you must hold Entra Global Administrator, Security Administrator, or Security Operator role to schedule or manage scheduled jobs.

**Q3**: **What does it mean to grant a permission in URBAC over "Microsoft Sentinel data collection" or "Default lake workspace"?**  
**A3**: Within Microsoft Defender XDR URBAC ([https://security.microsoft.com/mtp_roles](https://security.microsoft.com/mtp_roles)), when you create a custom role you will select your permissions for the data lake (Security Operations/security data basics (read) OR Data Operations/data (manage)). When you assign the permission in the next step, you will see "Microsoft Sentinel" available as a data collection towards the bottom. By default is it is usually on when creating a new role. To turn it on or off, you would select "Edit" and then check the appropriate option. Set it to "None" if you don't want the role assignment to include access to the data lake.

![Screenshot of Add Assignment](/.attachments/==image_0==-ba1ba749-b0ba-4fe0-aeba-245d528ef5da.png) 

**Q4**: **I have access today in URBAC to the data source "Microsoft Defender for Endpoint". Will I be able to read data inside the data lake?**  
**A4**: No. In order to use lake explorer, ADX, SQL, Notebook or so on to view data in the data lake, you will need to get access to the Microsoft Sentinel default lake data collection as well.

**Q5**: **In Lake explorer and ADX, I cannot see a workspace I know is in the data lake. Why?**  
**A5**: If a workspace has no tables in it, it will not be available to see in Lake Explorer or ADX. It will not be available to you to see in any browse experience and will not be available in the scheduled job drop down list of workspaces. At least one table must be created within it at which point it will show up in the scheduling experience or in the browse experience. In addition you must have permissions on the workspace.

**Q6**: **I cannot connect to Lake Explorer or ADX. Why?**  
**A6**: If you do not have access to a workspace with at least one table within it, you cannot access lake explorer or ADX successfully.

---
<!-- Required: Details required to escalate issues to the Product Group
# Escalating to Product Group (PG)

- Team name
  - IcM path

Before creating the IcM, make sure you have exhausted all the steps in this document.
- Make sure to collect:
  - <data-placeholder>
  - <data-placeholder>
- Document detailed reproduction steps of the issue.-->

---
|Contributor Name|Details|Date(DD/MM/YYYY)|
|--|--|--|
| Amy Hariharan Dang | Created this page | 17/07/2025 |

---
:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
