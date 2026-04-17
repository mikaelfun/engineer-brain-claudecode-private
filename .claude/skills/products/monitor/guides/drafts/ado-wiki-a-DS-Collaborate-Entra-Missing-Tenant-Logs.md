---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/Collaboration Guides/Collaborating with Microsoft Entra for missing tenant logs exported through diagnostic settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/Collaboration%20Guides/Collaborating%20with%20Microsoft%20Entra%20for%20missing%20tenant%20logs%20exported%20through%20diagnostic%20settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
---
This article describes how to collaborate with the Microsoft Entra (a.k.a., Azure Active Directory, Azure AD) team for the purpose of verifying that data was correctly sent to OnBehalfOf (a.k.a., OBO, Shoebox, diagnostic settings).

# Information you will need
---

- Azure Tenant ID.
- The type of log that is missing one or more records.  Available log categories can be found in article https://learn.microsoft.com/entra/identity/monitoring-health/howto-configure-diagnostic-settings#log-categories.

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;background-color:#efd9fd">
   
   **Note**
   
   If the target destination is an Azure Monitor Logs (a.k.a., Log Analytics) workspace, then the log type will be evident from the table name being queried.
   </div>

- Timestamps and correlationIds of one or more records that did not reach the target destination.

# Creating the Collaboration
---
1. Populate a well-articulated problem description identifying details about the tenant, the record(s) missing including relevant log types, timestamps and correlationIds.

1. Clearly identify that the ask of the Entra team is to provide a blob path that confirms the data was sent to OBO for each missing record matching the blob paths to the timestamp and correlationId(s) provided.

1. Set the Support Area Path (SAP) to:
   - For Sign-In Logs: **Azure\Microsoft Entra Governance, Compliance and Reporting\Sign-In Activity Reports\Problem with a specific sign-in log entry**
   - For Audit Logs: **Azure\Microsoft Entra Governance, Compliance and Reporting\Audit Logs\Problem with a specific audit log entry**
