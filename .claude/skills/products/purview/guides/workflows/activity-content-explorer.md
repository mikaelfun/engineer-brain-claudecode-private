# Purview Activity Explorer 与 Content Explorer — 排查工作流

**来源草稿**: `ado-wiki-a-activity-explorer-capture-network-trace.md`, `ado-wiki-a-activity-explorer-search-audit-log-event.md`, `ado-wiki-a-item-not-visible-content-explorer.md`, `ado-wiki-b-activity-explorer-event-not-showing-tsg.md`, `ado-wiki-b-activity-explorer-required-information.md`, `ado-wiki-b-activity-explorer-support-boundaries.md`, `ado-wiki-b-capture-network-trace-content-explorer.md`, `ado-wiki-b-export-activityexplorerdata-cmdlet-tsg.md`
**Kusto 引用**: 无
**场景数**: 30
**生成日期**: 2026-04-07

---

## Scenario 1: Introduction
> 来源: ado-wiki-a-activity-explorer-capture-network-trace.md | 适用: 未标注

### 排查步骤
This document will show how to capture a network trace log for Activity Explorer issues.

`[来源: ado-wiki-a-activity-explorer-capture-network-trace.md]`

---

## Scenario 2: Step 1: Start the Network Trace
> 来源: ado-wiki-a-activity-explorer-capture-network-trace.md | 适用: 未标注

### 排查步骤
- Refer to the [Developer Tools Capture Instructions](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9071/How-to-Capture-a-network-trace?anchor=developer-tools-capture-instructions) for detailed general instructions.
  - Open the Activity Explorer page and start the network trace using the steps mentioned in the above link.
  - Refresh the page after starting the trace to make sure we are getting all the requests from the beginning.
  - Click on the **'Customize columns'** and select **'Record Identity'** column.
  - If the issue is specific to any event, copy the **'Record Identity'** value for that event.
  - Please make sure that the trace should have **`"apiproxy/di/search/LabelAnalyticsActivityData"`** API call with right parameters.
  - Export the network trace and get it.

`[来源: ado-wiki-a-activity-explorer-capture-network-trace.md]`

---

## Scenario 3: Introduction
> 来源: ado-wiki-a-activity-explorer-search-audit-log-event.md | 适用: 未标注

### 排查步骤
This guide shows how to find the audit log event for any event that is **already showing** in Activity Explorer.

`[来源: ado-wiki-a-activity-explorer-search-audit-log-event.md]`

---

## Scenario 4: Background
> 来源: ado-wiki-a-activity-explorer-search-audit-log-event.md | 适用: 未标注

### 排查步骤
**Activity Explorer events are based off the audit log.** To find the audit data the Activity Explorer event is based on, you can use the [Purview Portal](https://purview.microsoft.com/audit/auditsearch) or the [Search-UnifiedAuditLog](https://learn.microsoft.com/en-us/powershell/module/exchange/search-unifiedauditlog?view=exchange-ps) cmdlet.

`[来源: ado-wiki-a-activity-explorer-search-audit-log-event.md]`

---

## Scenario 5: Searching for a Specific Event
> 来源: ado-wiki-a-activity-explorer-search-audit-log-event.md | 适用: 未标注

### 排查步骤
- Refer to [Audit Log Activities | Microsoft Learn](https://learn.microsoft.com/en-us/purview/audit-log-activities#sensitivity-label-activities) for different values available for **Operations**.
- Refer to [Audit Log RecordType | Microsoft Learn](https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-schema#auditlogrecordtype) for different values available for **Record Types**.
- Use the relevant conditions while searching for a specific event.

```powershell

`[来源: ado-wiki-a-activity-explorer-search-audit-log-event.md]`

---

## Scenario 6: Example: DLP rule match operation by specific user
> 来源: ado-wiki-a-activity-explorer-search-audit-log-event.md | 适用: 未标注

### 排查步骤
Search-UnifiedAuditLog -StartDate "06/04/2024" -EndDate "06/05/2024" -UserIds Jack@contoso.com -Operations DlpRuleMatch -ResultSize 500

`[来源: ado-wiki-a-activity-explorer-search-audit-log-event.md]`

---

## Scenario 7: Example: Label file actions, label detection in Transport and Auto Labeling events in Exchange using RecordType
> 来源: ado-wiki-a-activity-explorer-search-audit-log-event.md | 适用: 未标注

### 排查步骤
Search-UnifiedAuditLog -StartDate ((Get-Date).addDays(-2)) -EndDate (Get-Date) -RecordType SensitivityLabelAction, MIPLabel, MipAutoLabelExchangeItem -ResultSize 5000
```

- Replace the values for **StartDate**, **EndDate**, **UserID** and **Operations** (or any other filter) with the values you see in Activity Explorer.
- For more details, refer to [How to: Search the audit log](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9080/How-to-Search-the-audit-log-for-an-event).

`[来源: ado-wiki-a-activity-explorer-search-audit-log-event.md]`

---

## Scenario 8: Scenario
> 来源: ado-wiki-a-item-not-visible-content-explorer.md | 适用: 未标注

### 排查步骤
This document is for troubleshooting when an item is not visible in Content Explorer. This includes:
- A file or mail which has sensitivity label or retention label is not displayed in the Content Explorer
- A file or mail contains Sensitive Information type is not displayed in the Content Explorer
- Some Sensitivity Labels are not displayed in the Content Explorer
- Some Sensitive Information types are not displayed in the Content Explorer

`[来源: ado-wiki-a-item-not-visible-content-explorer.md]`

---

## Scenario 9: Step 1: Has the expected amount of time passed?
> 来源: ado-wiki-a-item-not-visible-content-explorer.md | 适用: 未标注

### 排查步骤
Items with Sensitivity Labels or Sensitive Information Types may take up to 7 days to populate in Content Explorer. Items labeled via server-side auto-labeling may take up to 14 days.
 - Please verify that the customer has waited 7 days for information to show in Content Explorer
 - Please verify that the customer has waited 14 days for labels applied via server-side auto-labeling policies

`[来源: ado-wiki-a-item-not-visible-content-explorer.md]`

---

## Scenario 10: Step 2: Is the document supported for Labeling?
> 来源: ado-wiki-a-item-not-visible-content-explorer.md | 适用: 未标注

### 排查步骤
A document won't show in Data Explorer if labeling is not supported for that document in SharePoint or OneDrive

   - Verify the [file is supported](https://learn.microsoft.com/en-us/microsoft-365/compliance/sensitivity-labels-sharepoint-onedrive-files?view=o365-worldwide#supported-file-types) for labeling in SPO/ODB.

`[来源: ado-wiki-a-item-not-visible-content-explorer.md]`

---

## Scenario 11: Step 3: Is the Label visible for the file in SPO or OD?
> 来源: ado-wiki-a-item-not-visible-content-explorer.md | 适用: 未标注

### 排查步骤
Next, we must verify the label shows in SharePoint/OneDrive

- In the SPO document Library, add the Sensitivity column and check the file has the Label applied.
- If the Sensitivity label is not visible in the SPO, then file is not actually labelled and it won't show up in the Content Explorer.

`[来源: ado-wiki-a-item-not-visible-content-explorer.md]`

---

## Scenario 12: Step 4: Is the Sensitivity Information type in the file or mail detected?
> 来源: ado-wiki-a-item-not-visible-content-explorer.md | 适用: 未标注

### 排查步骤
For emails, we must verify if the SIT is on the email

 - Refer [How to: Test a Sensitive Information Type (SIT) - Overview](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/10204/How-to-Test-a-Sensitive-Information-Type-(SIT))
 - If the SIT was not detected in the file, it won't show up in the Content Explorer.

`[来源: ado-wiki-a-item-not-visible-content-explorer.md]`

---

## Scenario 13: Step 5: Are you searching with full site name or email?
> 来源: ado-wiki-a-item-not-visible-content-explorer.md | 适用: 未标注

### 排查步骤
- When **Exchange** or **Teams** is the selected location, you can search on the **full email address** of the mailbox, for example `user@domainname.com`.
   - When either **SharePoint** or **OneDrive** are selected location, the search tool appears when you drill down to site names, folders, and files. If you are searching with Site name, please provide full site name otherwise you may get error. Refer [Get started with content explorer](https://learn.microsoft.com/en-us/purview/data-classification-content-explorer#filter)

`[来源: ado-wiki-a-item-not-visible-content-explorer.md]`

---

## Scenario 14: Step 6: Check the Network trace and see if the item is present.
> 来源: ado-wiki-a-item-not-visible-content-explorer.md | 适用: 未标注

### 排查步骤
Sometimes the network trace may return the item, but the portal may not show it

   - Collect network trace for the Content explorer. Refer [How to: Capture a network trace for Content Explorer - Overview](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9713/How-to-Capture-a-network-trace-for-Content-Explorer)
   - Search the item name you are looking for and see if it is present there.

`[来源: ado-wiki-a-item-not-visible-content-explorer.md]`

---

## Scenario 15: Step 7: Other reasons
> 来源: ado-wiki-a-item-not-visible-content-explorer.md | 适用: 未标注

### 排查步骤
Here are some other reasons why files don't show properly in Data/Content Explorer

- If the file is encrypted, the file may show in Data Explorer, but the user will not be able to see the contents of the file in the pane

`[来源: ado-wiki-a-item-not-visible-content-explorer.md]`

---

## Scenario 16: Step 8: Get Assistance
> 来源: ado-wiki-a-item-not-visible-content-explorer.md | 适用: 未标注

### 排查步骤
If the steps above do not resolve your issue, [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case) and get the [required information](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10523/Required-Information-Data-Explorer)



<!--- ScenarioFooter --->

`[来源: ado-wiki-a-item-not-visible-content-explorer.md]`

---

## Scenario 17: Scenario
> 来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md | 适用: 未标注

### 排查步骤
This document is for troubleshooting when an event does not show in Activity Explorer. This includes:

- Event not showing in Activity Explorer
- DLP not showing alert in Activity Explorer
- Label event not visible in Activity Explorer

`[来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md]`

---

## Scenario 18: Step 1: Check the Audit log
> 来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md | 适用: 未标注

### 排查步骤
All activity explorer entries come from the Audit log. If the event is NOT in the Audit Log, it will NOT be in Activity Explorer.
You can search the Audit log and confirm whether the event is present there. 

- Two ways of searching the audit log
  - Using the Search-UnifiedAuditLog cmdlet 
  - Using the compliance portal.

Please refer [this article](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9080/How-to-Search-the-audit-log-for-an-event) and collect the Audit logs using one of the methods described.

- After collecting the Audit log, look for the specific missing event (eg: Label applied, DLP Rule match etc) in the exported Audit log.  If the Activity is missing in the Audit log, please follow these steps: 
  - If the activity missing is related Sensitivity Label event, engage team owning the application, from where the activity was performed.
 Eg: If the missing activity is **Label applied** from **Office client** application (Word/Excel/PowerPoint/Outlook), you need to engage the respective Office client team. 
  - For [missing activity related to DLP rule actions in Exchange Online](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8916/Scenario-DLP-is-matching-on-an-email-that-it-should-not-match-in-Exchange)
  - For [missing activity related to DLP rule actions in SharePoint Online or OneDrive](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8945/Scenario-DLP-SharePoint-or-OneDrive-rule-is-not-matching-a-document)
  - For [missing activity related to DLP rule actions in Teams](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8953/Scenario-DLP-Teams-rule-is-not-matching-Teams-message)
  - For [missing activity related to DLP rule actions in Endpoint](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8901/Scenario-DLP-Endpoint-Rule-is-not-matching-a-file-on-Windows)

`[来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md]`

---

## Scenario 19: Step 2: Check the filters
> 来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md | 适用: 未标注

### 排查步骤
Events can be filtered out and not show in Activity Explorer

- Check the values applied in the different filters
- Check and make sure the event you are looking for is within the Date range selected. Change the range if needed.
- You can add more filtering options from the **Filters** button.

`[来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md]`

---

## Scenario 20: Step 3: Check Admin Units
> 来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md | 适用: 未标注

### 排查步骤
Users and policies with admin units will only see activities for their respective admin unit

- Check if the user has an admin unit
  - If the user has an admin unit, it may not be showing due to their [configured admin unit](#Admin-Unit-not-showing-Activity-Explorer-event) 
- Is the policy assigned an Admin Unit?
  - If so is the user included in the Admin Unit?
- If the user is indeed in an AU then they will only see events to what Policies the AU is tied to in Purview.

`[来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md]`

---

## Scenario 21: Step 4: Download the Activity Explorer log from PowerShell
> 来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md | 适用: 未标注

### 排查步骤
You can download the Activity Explorer log using PowerShell command and check whether the Missing event is present in the downloaded Activity Explorer log.

- You can use the **Export-ActivityExplorerData** PowerShell command to download the Activity Explorer data.
  - Please refer [this article](https://learn.microsoft.com/en-us/powershell/module/exchange/export-activityexplorerdata?view=exchange-ps) and download the Activity Explorer data using PowerShell
  - If the activity is missing in the downloaded log as well, please proceed to the next step.
  - If the activity is present in the downloaded log, then it is a display issue in the UI. Please proceed to [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case)

`[来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md]`

---

## Scenario 22: Step 5: Get Assistance
> 来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md | 适用: 未标注

### 排查步骤
If the steps above do not resolve your issue, [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case) and get the [required information](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10520/Required-Information-Activity-Explorer)

`[来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md]`

---

## Scenario 23: Admin Unit not showing Activity Explorer event
> 来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md | 适用: 未标注

### 排查步骤
`Root Cause:` Users with an Admin Unit (AU) will only see events for users in their assigned AU. Global Admins will be able to see every event

`Resolution:` This is by design. If you wish for the user to see all events, make them a Global Admin, or change the AU configuration

`[来源: ado-wiki-b-activity-explorer-event-not-showing-tsg.md]`

---

## Scenario 24: Introduction
> 来源: ado-wiki-b-capture-network-trace-content-explorer.md | 适用: 未标注

### 排查步骤
This document will show how to capture a network trace log for Content Explorer issues.

`[来源: ado-wiki-b-capture-network-trace-content-explorer.md]`

---

## Scenario 25: Step 1: Start the Network trace
> 来源: ado-wiki-b-capture-network-trace-content-explorer.md | 适用: 未标注

### 排查步骤
- Refer the [Developer Tools Capture Instructions](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9071/How-to-Capture-a-network-trace?anchor=developer-tools-capture-instructions) to get detailed general instructions.
  - Open the Content Explorer page and start the network trace using the steps mentioned in the above link.
  - Refresh the page after starting the trace to make sure we are getting all the requests  from the beginning.
  - Wait to load the page.
  - Export the network trace and get it.

`[来源: ado-wiki-b-capture-network-trace-content-explorer.md]`

---

## Scenario 26: Scenarios
> 来源: ado-wiki-b-export-activityexplorerdata-cmdlet-tsg.md | 适用: 未标注

### 排查步骤
This document is for troubleshooting when an issue occurs while running the command [Export-ActivityExplorerData](https://learn.microsoft.com/en-us/powershell/module/exchange/export-activityexplorerdata?view=exchange-ps) to export the Activity Explorer data. This includes:
- Export-ActivityExplorerData command is not recognized
- You get error while using the filters with the Export-ActivityExplorerData command
- No data or incorrect data is retrieved while running the Export-ActivityExplorerData command

`[来源: ado-wiki-b-export-activityexplorerdata-cmdlet-tsg.md]`

---

## Scenario 27: Step 1: Is the PowerShell module installed?
> 来源: ado-wiki-b-export-activityexplorerdata-cmdlet-tsg.md | 适用: 未标注

### 排查步骤
First, we must verify the PowerShell module is being used correctly

- Export-ActivityExplorerData command is part of the [ExchangePowerShell](https://learn.microsoft.com/en-us/powershell/module/exchange/?view=exchange-ps) module. Please make sure that the machine has this module installed.
  - Run the command Connect-IPPSSession and login with an administrator account, after installing the PowerShell module.  Refer  [Connect to Security & Compliance PowerShell | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/exchange/connect-to-scc-powershell?view=exchange-ps#connect-to-security--compliance-powershell-with-an-interactive-login-prompt)

`[来源: ado-wiki-b-export-activityexplorerdata-cmdlet-tsg.md]`

---

## Scenario 28: Step 2: Are the filters correct?
> 来源: ado-wiki-b-export-activityexplorerdata-cmdlet-tsg.md | 适用: 未标注

### 排查步骤
Next, we must verify the filters are set correctly

- Please check you are using one of the available filters documented at [Supported Filters | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/exchange/export-activityexplorerdata?view=exchange-ps#description)
  - Here is an example 
      ```powershell
      Export-ActivityExplorerData -StartTime "07/06/2024 07:15 AM" -EndTime "07/08/2024 11:08 AM" -Filter1 @("Activity", "LabelApplied") -OutputFormat Csv
      ```
  - If the filter is available and supported in the documentation, run the command with -Verbose parameter to get detailed error.
  - Check for any syntax errors in the command. [Refer the examples given](https://learn.microsoft.com/en-us/powershell/module/exchange/export-activityexplorerdata?view=exchange-ps#examples).

`[来源: ado-wiki-b-export-activityexplorerdata-cmdlet-tsg.md]`

---

## Scenario 29: Step 3: Is the Data correct?
> 来源: ado-wiki-b-export-activityexplorerdata-cmdlet-tsg.md | 适用: 未标注

### 排查步骤
After this, we must verify the data in the result are correct

- Please check the filters used in the command and the values given. If it is using time range, make sure the date and time format are correct [Refer the examples given](https://learn.microsoft.com/en-us/powershell/module/exchange/export-activityexplorerdata?view=exchange-ps#examples)

- Change the filter options and try again. For example, use the 'user' filter and date range alone without using Activity filter. The actual value for the activity may be different from the one you are entering.

- Collect a Fiddler trace and check the response data is as expected while running the Export-ActivityExplorerData command. Refer [How to: Capture a network trace - Overview](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9071/How-to-Capture-a-network-trace)
 - If the filter options are correct and still not getting the data, check if you are able to get the same data from the Activity Explorer UI. Please refer [Scenario: Event not showing in Activity Explorer](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/8975/Scenario-Event-not-showing-in-Activity-Explorer?anchor=step-2%3A-check-the-filters)

 - If the UI is generating the data as expected but not the Export-ActivityExplorerData command, please proceed to [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case)

`[来源: ado-wiki-b-export-activityexplorerdata-cmdlet-tsg.md]`

---

## Scenario 30: Step 4: Get Assistance
> 来源: ado-wiki-b-export-activityexplorerdata-cmdlet-tsg.md | 适用: 未标注

### 排查步骤
If the steps above do not resolve your issue, [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case) and get the [required information](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10520/Required-Information-Activity-Explorer)

`[来源: ado-wiki-b-export-activityexplorerdata-cmdlet-tsg.md]`

---
