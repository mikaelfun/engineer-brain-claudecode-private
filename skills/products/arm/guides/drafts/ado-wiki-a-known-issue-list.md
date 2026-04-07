---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/Known issue list"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/Known%20issue%20list"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

This wiki page contains the list of active and resolved known issues for Azure Resource Manager, Blueprints, Management Groups and Service Catalog (services supported by ARM EEEs).

Resolved issues may be purged from the list if they are no longer consider relevant for a potential after review.

## Experience
Engineers ideally should review the list below before reaching out to a TA, TAs can still confirm if the support ticket fits into one of the known issues referenced below. However, confirmation steps for each case are on each known issue and expected to be followed to get that confirmation.

Following the confirmation steps is a must. There are scenarios that may fit the title, but not the whole scenario, therefore the title should not be enough to draw conclusions.

It is also important (after confirmation) for engineers to **link their support tickets to the known issues** using the steps in the next section. This information is used to drive prioritization of fixes with PG to assist with case reduction.

## Important! Linking Cases to Known Issues
Support engineers are expected to link their cases to the **work item id** if a case is confirmed to be related to one of the active known issues below.

To link a case to an active known issue, fill the form in the below link:
**[[FORMS] Link case to an active known issue](https://forms.office.com/r/YB5M5dNri9)**

## Active Known Issues
Do not rely just on the title to tell the customer they are experiencing a known issue. Instructions on how to verify the behavior actually matches the documented known issue are inside the work item.

> Active known issues are tracked in ADO query: https://dev.azure.com/supportability/AzureDev/_queries/query/c6d511dc-2541-4638-a130-00f1c887173d

## Resolved Known Issues
Resolved issues remain visible for future reference. The issues in the following list are **not** expected to be found on new customer cases, and therefore, the items in the following list should not be linked to any new support case.

If a customer scenario is detected that matches one of the items in the below list, reach out to a TA or open a SME request with this information, for the TA or SME to confirm if the issue needs to be reactivated and tracked again.

> Resolved known issues are tracked in ADO query: https://dev.azure.com/supportability/AzureDev/_queries/query/aea4b886-b615-4401-8772-d0f72954b3c3

Once a resolved known issue is no longer considered relevant, it will be removed from the list above. However, for tracking purposes, retired known issues can be found on [this query](https://dev.azure.com/supportability/AzureDev/_queries/query/ceb751e2-8733-4a58-be43-b23dd4a1937e/).

## Notifications
Support engineers are expected to use the above work items link and this wiki as the source of truth for any new known issue detected on the services referenced above.

However, notifications of new known issues are available via email and Teams in an opt-in basis.

- To receive email notifications, join **armei** in [IDweb](https://aka.ms/idweb).
- To receive Teams notifications, enable notifications on the [[ARM] Known Issues tracker](https://teams.microsoft.com/l/channel/19%3a14bce7b07e664b02bb7598b9a0a23d27%40thread.skype/%255BARM%255D%2520Known%2520Issues%2520Tracker?groupId=8a6a0fe1-0d7d-41a0-93f0-0fd7af9ac2c8&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) channel in Teams.

## Frequently asked questions

### What is the goal?
To provide a centralized location for known issues to be reported and tracked, allowing engineers and TAs to be aware and discover any active issues that may be found in support tickets.

The process also considers mapping new occurrences of an issue found in support cases to an existing known issue.

### How does the process work?
EEEs will document known issues into our Azure DevOps database. EEEs and TAs will meet monthly to ensure the issues are up to date and review how many cases have been found for a specific issue.

### What do engineers need to do?
If a support ticket is found where the scenario seems to be an unexpected behavior, review the known issue list to confirm if it is not reported already. Each known issue includes confirmation steps, workarounds and a customer statement if the issue is confirmed to be related. In case of doubt, reach out to a TA.

If the confirmation steps are positive for a specific support case, **engineers are expected to link the support ticket to an active known issue**, filling out the form referenced above.

### Why do engineers need to link the support ticket to the known issue?
EEEs will use this data to prioritize fixes of the known issues with product group.

### What happens when a known issue is resolved?
The known issue record will be updated to reflect that it is now resolved. It will be kept in the database until its review confirms it's no longer relevant, when it will then be moved to a completed state. The query for completed items is linked in this article, right below the Resolved issues.

### I believe I have information about a known issue that is not in the list, what should I do?
Reach out to a TA and let them know, they will evaluate with the EEEs to get the issue documented.

### Additional feedback?
Reach out to armtas@microsoft.com
