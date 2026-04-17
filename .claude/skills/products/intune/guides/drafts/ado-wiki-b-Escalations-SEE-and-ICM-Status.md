---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Processes/Escalations SEE and ICM Status'"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Processes/Escalations%20SEE%20and%20ICM%20Status'"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Creating a Customer Reported Incident (CRI) in ASC / SEE ICM Status Process

[[_TOC_]]

## Creating a CRI in ASC (from DFM support case)

This guide walks through the process of submitting a CRI escalation for Intune using the Azure Support Center (ASC) from a support case in DFM.

> Note: GCCH cases should disregard this and still use [aka.ms/intunecri](https://microsoft.sharepoint.com/teams/IntuneCRI/SitePages/ICM%20Templates%20for%20Intune%20Escalations.aspx)

### Step-by-Step Instructions

1. Open the support case in DFM.
2. Click the **Apps** option on the right of the menu bar.
3. Select **ASC** from the list of available apps.
4. In ASC, click the **Escalate Case** button at the top right.
5. In the Escalate Case window, select the **All** option to view templates.
6. Click **Clear** at the right of the search bar to reset filters.
7. Click the arrow beside the **Areas** field and select **CXE Care**.
8. Use the search field to find the desired template by product, template ID, or keywords (e.g., `Intune_App`).
9. Select the template and click **Next**.
10. Complete the required fields:
    - **Title**: Maintain the formatting already provided in the template.
    - **Description**: Follow instructions, include all requested info, and add screenshots if needed.
    - **Severity**: Adjust if necessary (defaults to four).
    - **Customer/SLA Impact**: Select *No* unless maximum attention is required.
    - **Restrict Access**: Select *No* unless told otherwise.
    - **Impacted Regions**: Update if needed.
11. Confirm prepopulated fields:
    - Service, Team, Environment, Impacted Services, Incident Type
12. Click **Submit** to send the CRI.
13. Review the list of related incidents displayed by ASC.

### Reference Video
[Watch the full walkthrough here](https://microsoft.sharepoint.com/teams/CxE-Security-Care-CEM/_layouts/15/stream.aspx?id=%2Fteams%2FCxE%2DSecurity%2DCare%2DCEM%2FShared%20Documents%2FOE%20Operations%2FCRI%20Templates%2FCRI%20Submission%20for%20Intune%2Emp4)

---

## How an SEE Should Request ICM Status for Stale ICMs

Reference: https://internal.evergreen.microsoft.com/en-us/topic/365aa6fe-61d5-3dcc-86b0-65e3e063b5d8
