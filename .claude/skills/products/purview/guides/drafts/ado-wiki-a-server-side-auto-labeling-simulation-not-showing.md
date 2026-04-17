---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Auto Labeling/Server Side Auto Labeling/Troubleshooting Scenarios: Server Side Auto Labeling/Scenario: Server Side Auto Labeling Simulation not showing expected item"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAuto%20Labeling%2FServer%20Side%20Auto%20Labeling%2FTroubleshooting%20Scenarios%3A%20Server%20Side%20Auto%20Labeling%2FScenario%3A%20Server%20Side%20Auto%20Labeling%20Simulation%20not%20showing%20expected%20item"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]


# Scenario

This troubleshooting guide is for investigating when a Server Side Auto Labeling policy is in simulation and does not return the expected results

- Email missing in Auto label simulation
- Document not showing in the Items for Review for auto labeling

# Prerequisites

To follow these steps, you will need:

- A copy of the item not showing
- Expected policy match

# Step by Step Instructions

## Step 1: Verify the conditions of the policy

First we must verify the conditions of the policy to verify it if indeed should match the expected file

- Follow the guide on how to [Analyze the Conditions](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/8998/Scenario-Server-Side-Auto-Labeling-not-applying-correctly?anchor=step-1%3A-analyze-conditions) to verify if the policy should match or not

## Step 2: Understand how simulation works for SharePoint and OneDrive

Simulation mode for SharePoint and OneDrive documents will query all the documents at the time the policy is ran and report the results

- Was the file modified after the simulation was started?
  - Simulation mode will only return documents that match the conditions when the simulation was started
  - If the document was created or changed to match the policy conditions after simulation started, it will not match
  - Emails do not follow this, as Simulation policies are evaluated when the email is sent and received
  - If a custom SIT was created after the document was last modified, that SIT will not be found on the document in Simulation
  - Only 100 files per site/user per policy will be shown
- How does simulation work?
  - For each Site/User in the Auto Label Policy, Up to 100 files from each Site/User that match the Auto Label rule will be queried
    - Only previously classified files will be returned in the initial query
    - This is why the Custom SIT needs to be created before the document was created/modified
    - SPO/ODB classification only happens when documents are created or modified
  - Then, from the initial query of up to 100 documents per Site/User, all of those documents will have classification re-run on them to see if they still meet the Auto Label Rule criteria
  - After the second scan, if they meet the Auto Label Rule criteria, then they will be shown in the Simulation Results
- Verify the [prerequisites in the public documentation for simulation mode](https://learn.microsoft.com/en-us/purview/apply-sensitivity-label-automatically#prerequisites-for-auto-labeling-policies)

## Step 3: Understand how simulation works for Exchange

Auto label simulations in Exchange work by evaluating emails in transport, and if they should apply to the policy

- Follow the [Auto Labeling not matching section for Exchange](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/8998/Scenario-Server-Side-Auto-Labeling-not-applying-correctly?anchor=emails-sent-in-exchange-online) TSG to see if the policy matched in the Extended Message Trace

## Step 4: Get Assistance

If the steps above do not resolve your issue, [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case) and get the [required information](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10522/Required-Information-Server-Side-Auto-Labeling)
