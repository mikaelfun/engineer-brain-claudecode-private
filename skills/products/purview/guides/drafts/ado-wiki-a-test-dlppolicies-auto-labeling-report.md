---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Auto Labeling/Server Side Auto Labeling/How to: Server Side Auto Labeling/How To: Gather an Auto Labeling Test-DlpPolicies Report"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAuto%20Labeling%2FServer%20Side%20Auto%20Labeling%2FHow%20to%3A%20Server%20Side%20Auto%20Labeling%2FHow%20To%3A%20Gather%20an%20Auto%20Labeling%20Test-DlpPolicies%20Report"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction

This will show how to gather a Test-DlpPolicies report for a document in SharePoint or OneDrive. This report will show the evaluation results of Auto Labeling Policies at the time of the cmdlet execution

# Prerequisites

To follow these steps, you will need:

- Access to the Exchange Online PowerShell
- A valid SMTP address to send the report to
- Access to the document in question

# Step by Step Instructions

## Step 1: Follow the instructions

The instructions for running Test-DlpPolicies are detailed in the public documentation

- Connect to the [Exchange Online PowerShell](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9073/How-to-Connect-to-Exchange-Online-PowerShell)
- Follow [How to: Run Test-DlpPolicies - Overview](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8939/How-to-Run-Test-DlpPolicies)
- Once the report is finished, a DLP results email and an Auto Labeling results email will be sent

## Step 2: Analyze the Auto Labeling report

Next we will analyze the Auto Labeling report sent to the given report address

- Find the email with the subject `Test-DlpPolicies for Autolabeling on File` in the inbox of the `-SendReportTo` email
- `Classification Results for the last execution` will show the Sensitive Information Types found on the file
- `Currently applied label ID` is the label that is applied
- `Label stamped to item by MIP processor` shows the label applied if it was automatically applied
- `Policy Evaluation Results` will show the results of the policy evaluation at the time of running the cmdlet
  - It will show which Auto Label policies did/did not match
