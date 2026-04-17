---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Data Explorer/Troubleshooting Scenarios: Data Explorer/Scenario: Item not visible in Content Explorer"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FData%20Explorer%2FTroubleshooting%20Scenarios%3A%20Data%20Explorer%2FScenario%3A%20Item%20not%20visible%20in%20Content%20Explorer"
importDate: "2026-04-06"
type: troubleshooting-guide
---

<!--- ScenarioHeader --->

[[_TOC_]]


# Scenario

This document is for troubleshooting when an item is not visible in Content Explorer. This includes:
- A file or mail which has sensitivity label or retention label is not displayed in the Content Explorer
- A file or mail contains Sensitive Information type is not displayed in the Content Explorer
- Some Sensitivity Labels are not displayed in the Content Explorer
- Some Sensitive Information types are not displayed in the Content Explorer

# Prerequisites

To follow these steps, you will need:

- Access to the Content Explorer page
- The details of the mail or file which is not displayed in the Content explorer
- The name of the Sensitivity Label or Sensitive information type which is not displayed in the Content Explorer


# Step by Step Instructions

## Step 1: Has the expected amount of time passed?

Items with Sensitivity Labels or Sensitive Information Types may take up to 7 days to populate in Content Explorer. Items labeled via server-side auto-labeling may take up to 14 days.
 - Please verify that the customer has waited 7 days for information to show in Content Explorer
 - Please verify that the customer has waited 14 days for labels applied via server-side auto-labeling policies

## Step 2: Is the document supported for Labeling?

A document won't show in Data Explorer if labeling is not supported for that document in SharePoint or OneDrive

   - Verify the [file is supported](https://learn.microsoft.com/en-us/microsoft-365/compliance/sensitivity-labels-sharepoint-onedrive-files?view=o365-worldwide#supported-file-types) for labeling in SPO/ODB.

## Step 3: Is the Label visible for the file in SPO or OD?

Next, we must verify the label shows in SharePoint/OneDrive

- In the SPO document Library, add the Sensitivity column and check the file has the Label applied.
- If the Sensitivity label is not visible in the SPO, then file is not actually labelled and it won't show up in the Content Explorer.

## Step 4: Is the Sensitivity Information type in the file or mail detected?

For emails, we must verify if the SIT is on the email

 - Refer [How to: Test a Sensitive Information Type (SIT) - Overview](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/10204/How-to-Test-a-Sensitive-Information-Type-(SIT))
 - If the SIT was not detected in the file, it won't show up in the Content Explorer.
 
## Step 5: Are you searching with full site name or email?

   - When **Exchange** or **Teams** is the selected location, you can search on the **full email address** of the mailbox, for example `user@domainname.com`.
   - When either **SharePoint** or **OneDrive** are selected location, the search tool appears when you drill down to site names, folders, and files. If you are searching with Site name, please provide full site name otherwise you may get error. Refer [Get started with content explorer](https://learn.microsoft.com/en-us/purview/data-classification-content-explorer#filter)
 
## Step 6: Check the Network trace and see if the item is present.

Sometimes the network trace may return the item, but the portal may not show it

   - Collect network trace for the Content explorer. Refer [How to: Capture a network trace for Content Explorer - Overview](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9713/How-to-Capture-a-network-trace-for-Content-Explorer)
   - Search the item name you are looking for and see if it is present there.

## Step 7: Other reasons

Here are some other reasons why files don't show properly in Data/Content Explorer

- If the file is encrypted, the file may show in Data Explorer, but the user will not be able to see the contents of the file in the pane

## Step 8: Get Assistance

If the steps above do not resolve your issue, [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case) and get the [required information](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10523/Required-Information-Data-Explorer)



<!--- ScenarioFooter --->
