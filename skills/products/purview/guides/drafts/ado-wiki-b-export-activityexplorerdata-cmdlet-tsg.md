---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Activity Explorer/Troubleshooting Scenarios: Activity Explorer/Scenario: Export-ActivityExplorerData cmdlet not working"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FActivity%20Explorer%2FTroubleshooting%20Scenarios%3A%20Activity%20Explorer%2FScenario%3A%20Export-ActivityExplorerData%20cmdlet%20not%20working"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]


# Scenarios

This document is for troubleshooting when an issue occurs while running the command [Export-ActivityExplorerData](https://learn.microsoft.com/en-us/powershell/module/exchange/export-activityexplorerdata?view=exchange-ps) to export the Activity Explorer data. This includes:
- Export-ActivityExplorerData command is not recognized
- You get error while using the filters with the Export-ActivityExplorerData command
- No data or incorrect data is retrieved while running the Export-ActivityExplorerData command


# Prerequisites

To follow these steps, you will need:

- The complete command and parameters customer is running
- The error details customer is getting while running the command


# Step by Step Instructions

## Step 1: Is the PowerShell module installed?

First, we must verify the PowerShell module is being used correctly

- Export-ActivityExplorerData command is part of the [ExchangePowerShell](https://learn.microsoft.com/en-us/powershell/module/exchange/?view=exchange-ps) module. Please make sure that the machine has this module installed.
  - Run the command Connect-IPPSSession and login with an administrator account, after installing the PowerShell module.  Refer  [Connect to Security & Compliance PowerShell | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/exchange/connect-to-scc-powershell?view=exchange-ps#connect-to-security--compliance-powershell-with-an-interactive-login-prompt)

## Step 2: Are the filters correct?

Next, we must verify the filters are set correctly

- Please check you are using one of the available filters documented at [Supported Filters | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/exchange/export-activityexplorerdata?view=exchange-ps#description)
  - Here is an example 
      ```powershell
      Export-ActivityExplorerData -StartTime "07/06/2024 07:15 AM" -EndTime "07/08/2024 11:08 AM" -Filter1 @("Activity", "LabelApplied") -OutputFormat Csv
      ```
  - If the filter is available and supported in the documentation, run the command with -Verbose parameter to get detailed error.
  - Check for any syntax errors in the command. [Refer the examples given](https://learn.microsoft.com/en-us/powershell/module/exchange/export-activityexplorerdata?view=exchange-ps#examples).

## Step 3: Is the Data correct?

After this, we must verify the data in the result are correct

- Please check the filters used in the command and the values given. If it is using time range, make sure the date and time format are correct [Refer the examples given](https://learn.microsoft.com/en-us/powershell/module/exchange/export-activityexplorerdata?view=exchange-ps#examples)

- Change the filter options and try again. For example, use the 'user' filter and date range alone without using Activity filter. The actual value for the activity may be different from the one you are entering.

- Collect a Fiddler trace and check the response data is as expected while running the Export-ActivityExplorerData command. Refer [How to: Capture a network trace - Overview](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9071/How-to-Capture-a-network-trace)
 - If the filter options are correct and still not getting the data, check if you are able to get the same data from the Activity Explorer UI. Please refer [Scenario: Event not showing in Activity Explorer](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/8975/Scenario-Event-not-showing-in-Activity-Explorer?anchor=step-2%3A-check-the-filters)

 - If the UI is generating the data as expected but not the Export-ActivityExplorerData command, please proceed to [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case)
 

## Step 4: Get Assistance

If the steps above do not resolve your issue, [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case) and get the [required information](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10520/Required-Information-Activity-Explorer)
