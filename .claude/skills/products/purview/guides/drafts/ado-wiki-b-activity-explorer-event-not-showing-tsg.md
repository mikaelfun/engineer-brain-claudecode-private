---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Activity Explorer/Troubleshooting Scenarios: Activity Explorer/Scenario: Event not showing in Activity Explorer"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FActivity%20Explorer%2FTroubleshooting%20Scenarios%3A%20Activity%20Explorer%2FScenario%3A%20Event%20not%20showing%20in%20Activity%20Explorer"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]


# Scenario

This document is for troubleshooting when an event does not show in Activity Explorer. This includes:

- Event not showing in Activity Explorer
- DLP not showing alert in Activity Explorer
- Label event not visible in Activity Explorer

# Prerequisites

To follow these steps, you will need:

- Information for the event that should show in Activity Explorer
  - Event type
  - Event name
  - Workload specific identifier
    - For Exchange: Email message Id
    - For SharePoint: Document Path
    - For Teams: Teams message Id
    - For Endpoint: File name or Sha1
  - Time of the event

# Step by Step Instructions

## Step 1: Check the Audit log
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

## Step 2: Check the filters

Events can be filtered out and not show in Activity Explorer

- Check the values applied in the different filters
- Check and make sure the event you are looking for is within the Date range selected. Change the range if needed.
- You can add more filtering options from the **Filters** button.

## Step 3: Check Admin Units

Users and policies with admin units will only see activities for their respective admin unit

- Check if the user has an admin unit
  - If the user has an admin unit, it may not be showing due to their [configured admin unit](#Admin-Unit-not-showing-Activity-Explorer-event) 
- Is the policy assigned an Admin Unit?
  - If so is the user included in the Admin Unit?
- If the user is indeed in an AU then they will only see events to what Policies the AU is tied to in Purview.

## Step 4: Download the Activity Explorer log from PowerShell

You can download the Activity Explorer log using PowerShell command and check whether the Missing event is present in the downloaded Activity Explorer log.

- You can use the **Export-ActivityExplorerData** PowerShell command to download the Activity Explorer data.
  - Please refer [this article](https://learn.microsoft.com/en-us/powershell/module/exchange/export-activityexplorerdata?view=exchange-ps) and download the Activity Explorer data using PowerShell
  - If the activity is missing in the downloaded log as well, please proceed to the next step.
  - If the activity is present in the downloaded log, then it is a display issue in the UI. Please proceed to [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case)


## Step 5: Get Assistance

If the steps above do not resolve your issue, [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case) and get the [required information](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10520/Required-Information-Activity-Explorer)
 

# Resolutions

## Admin Unit not showing Activity Explorer event

`Root Cause:` Users with an Admin Unit (AU) will only see events for users in their assigned AU. Global Admins will be able to see every event

`Resolution:` This is by design. If you wish for the user to see all events, make them a Global Admin, or change the AU configuration
