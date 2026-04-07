---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/UEBA/[TSG] - UEBA Enablement in Connectors"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FNext-Gen%20-%20Microsoft%20Sentinel%20(USX)%2FUEBA%2F%5BTSG%5D%20-%20UEBA%20Enablement%20in%20Connectors"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<!-- �Required: Main title of the document -->
# Troubleshooting guide for UEBA Enablement in Connectors

---
<!-- �Required: Table of Contents -->
[[_TOC_]] 

<!-- �Required: Training sessions resources and links-->
## Training sessions
---
|Date (DD/MM/YYYY)|Session Recording|Presenter|
|--|--|--|
|<16/12/2025>|<Recording-Placeholder>|<Ofir Gavish>|

<!--�Required: Brief introduction to the feature/s-->
## Overview
---
       Transform UEBA onboarding into a frictionless, contextual experience by embedding it directly within the sentinel data connectors.

<!-- Required: Detailed description of the feature/s-->
### Feature Description
---
      
In the Advanced Options tab of your data connector configuration page, you'll find individual toggles for each table that supports UEBA analysis. These toggles let you choose exactly which data tables from your connected data source (such as Azure Active Directory or other security platforms) should feed into UEBA's behavioral analytics engine. For example, if your connector provides Sign-in Logs, Audit Logs, and other tables, you can selectively enable only the Sign-in Logs for UEBA analysis while leaving others disconnected. This fine-grained control helps you focus UEBA analysis on the most valuable data sources for detecting threats and anomalies in your environment, while managing data ingestion costs and processing overhead.

<!-- Required: Requirements to use the feature/s-->
## Prerequisites
---
      
- Specific connector must be connected.
- Must have required permissions. (Global Admin or Security Admin)
- UEBA must be enabled. (Otherwise, route to UEBA settings page)

<!-- Optional: Costs/Billing to use the feature/s-->
## Costs
---
      
No special license is required to add UEBA functionality to Microsoft Sentinel, and there's no extra cost for using it.
However, since UEBA generates new data and stores it in new tables that UEBA creates in your Log Analytics workspace,�additional data storage charges�apply.
<!-- Optional: Known limitations of the feature/s-->
## Limitations and Workarounds
---
- **Limitation 1**: Connector-Specific Tables: Only tables that are explicitly configured as UEBA-supported for each connector type can be toggled - you cannot manually add custom tables
  - **Limitation Workaround 1**: None, UEBA support only specific tables. See this for more information: [Enable entity behavior analytics to detect advanced threats | Microsoft Learn] (https://learn.microsoft.com/en-us/azure/sentinel/enable-entity-behavior-analytics?tabs=azure)
- **Limitation 2**:        Single Workspace Scope: Table connections apply only to the specific Sentinel workspace - multi-workspace scenarios require configuring each workspace separately
  - **Limitation Workaround 2**: Select a different workspace in the main connector page, and enable UEBA on the wanted tables.
- **Limitation 3**: No Batch Operations: Tables must be toggled one at a time; there's no "select all" or bulk enable/disable functionality
  - **Limitation Workaround 3**: None, must enable/disable one by one.

<!-- Required: Details required to escalate issues to the Product Group-->
## Escalating to Product Group (PG)
---

### IcM Escalation Path Lookup <!-- Required: Details to determine Escalation path, make sure to use the relevant link and check that the escalation path is listed-->
*   Owning service -M365D UEBA | UEBA
      
If there are any errors or issues please make sure to collect:

    *   Name of connector
    *   Description of scenario and an error message.
    *   HAR File

<!-- Optional: Frequently Asked Questions-->
## Frequently Asked Questions (FAQs)
---

      
**Q1**: Which connectors do UEBA support?
- Answer to Q1: List is here: [Enable entity behavior analytics to detect advanced threats | Microsoft Learn](https://learn.microsoft.com/en-us/azure/sentinel/enable-entity-behavior-analytics?tabs=azure)

**Q2**: What permissions are required to add new connectors for UEBA?
- Answer to Q2: Global Admin or Security Admin

**Q3**: Where is documentation for this specific connector?
- Answer to Q3: [https://aka.ms/connector-ueba](https://aka.ms/connector-ueba "https://aka.ms/connector-ueba")


<!-- Required: Details required to escalate issues to the Product Group-->
# Additional Information
---


  - **Public Documentation**
      

    *   [UEBA Public documentation](https://learn.microsoft.com/en-us/azure/sentinel/enable-entity-behavior-analytics?tabs=azure)
    *   [https://aka.ms/connector-ueba](https://aka.ms/connector-ueba "https://aka.ms/connector-ueba")


<!-- Optional: Details required to explain acronyms-->
## Acronyms
---

| Acronyms | Definition |
|--|--|
| UEBA | User and Entity Behavior Analytics |


---
| Contributor Name | Details | Date(DD/MM/YYYY) |
|--|--|--|
| Gil Naaman & Ofir Gavish | Created | 11/12/2025|

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
