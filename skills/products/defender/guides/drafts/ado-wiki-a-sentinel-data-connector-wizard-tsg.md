---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/General topics/[TSG] - Microsoft Sentinel Data Connector Wizard"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FGeneral%20topics%2F%5BTSG%5D%20-%20Microsoft%20Sentinel%20Data%20Connector%20Wizard"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<!-- Required: Main title of the document -->
# Troubleshooting Guide for Microsoft Sentinel Data Connector Wizard
---

<!-- Required: Table of Contents -->
[[_TOC_]] 

<!-- Required: Training sessions resources and links-->
## Training sessions
---
|Date (DD/MM/YYYY)|Session Recording|Presenter|
|--|--|--|
| 17/03/2025 | [Microsoft Sentinel - Defender Portal - Data Connector Wizard and Connector Builder Agent](https://platform.qa.com/resource/microsoft-sentinel-defender-portal-data-connector-wizard-and-connector-builder-agent-xapi-1854/?context_id=12963&context_resource=lp) | Nikita Chhabra |

<!--Required: Brief introduction to the feature/s-->
## Overview
---

<!-- Required: Detailed description of the feature/s-->
### Feature Description
---
The Sentinel Data Connector Wizard is designed to make onboarding and connecting data sources with Microsoft Sentinel simple, fast, and intuitive. Instead of navigating complex manual steps or writing custom scripts, the wizard provides a guided, step-by-step experience that helps security teams connect their data sources, whether Microsoft services or third-party platforms, into Sentinel with minimal effort. 

The Wizard provides the Connector ARM template post completion which you can install into your workspace, download to make further edits before installing and deploy directly.

<!-- Required: Requirements to use the feature/s-->
## Prerequisites
---
### Required/Preferred Environmental Requirements
Your organization must have onboarded to Microsoft Sentinel.
Must be onboarded with USX experience in Defender portal.

https://learn.microsoft.com/azure/sentinel/move-to-defender

### Required Roles & Permissions
- Microsoft Sentinel Contributor  

### Clouds
- In Scope: Commercial clouds
- Out of Scope: Nation/Sovereign (US Gov, China Gov, Other Gov)

## Common scenarios and Troubleshooting  <!-- Describe issue common scenarios as reflected from Cases and CRIs-->
---

### Scenario 1: Create custom connector option is not visible
---
#### Symptom
- The option to create a custom connector does not appear in the Data Connectors page.
#### Investigation
- Confirm you are in **Microsoft Sentinel  Configuration  Data Connectors**.
- Verify the user has the **Microsoft Sentinel Contributor** role.
#### Likely Cause
- Missing required role or preview access.
- Workspace not selected in portal.
#### Resolution
- Assign the correct role and refresh the page.
- Reenter the experience after selecting a workspace

### Scenario 2: Connector deploys successfully but does not appear immediately
---
#### Symptom
- Deployment completes, but the new connector is not visible in the Data Connectors list.
#### Investigation
- Refresh the browser after deployment.
- Search for the connector by name in the Data Connectors list.
#### Likely Cause
- UI refresh delay after ARM deployment.


### Scenario 3: Deployment fails during the Deploy step
---
#### Symptom
- Deployment fails with validation or permission errors.
#### Investigation
- Confirm the user has **Microsoft Sentinel Contributor** permissions.
- Review deployment error messages surfaced by the wizard.
- Download the ARM template for inspection if needed.
#### Likely Cause
- Insufficient permissions or invalid configuration values.
#### Resolution
- Correct configuration values and retry deployment.
- File a bug with deployment error details if the issue persists.

### Scenario 4: Validation errors on fields or schema
---

#### Symptom
- Wizard blocks progress due to validation errors.
#### Investigation
- Review field length and character set guidance shown in the UI.
- Recheck sample data used for DCR autogeneration.
#### Likely Cause
- Field values exceed supported limits or contain unsupported characters.
#### Resolution
- Adjust field definitions and retry.
- Report validation gaps or unclear messaging as bugs.

<!-- Required: Details required to escalate issues to the Product Group-->
## Escalating to Product Group (PG)
---
Before creating the IcM, make sure you have exhausted all the steps in this document.
- Make sure to collect:
  - Issue Description, Region, Connector API details.
  - Screenshots of issue
- Document detailed reproduction steps of the issue.

### IcM Escalation Path Lookup <!-- Required: Details to determine Escalation path, make sure to use the relevant link and check that the escalation path is listed-->
- [Microsoft Sentinel](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/3314/Sentinel-PG-Dev-lookup-escalation-path)

<!-- Optional: Frequently Asked Questions-->
## Frequently Asked Questions (FAQs)
---
### Q1: Do I need to write ARM templates or custom scripts?
A: No. The wizard generates the required ARM template automatically based on the inputs you provide.  
You may optionally download and edit the ARM template before deployment if customization is required.

### Q2:What happens after I finish configuring a connector?:
A: Once configuration is complete:
*   connector ARM template is generated
*   You can deploy the connector directly from the wizard
*   Or download the ARM template for inspection or manual deployment  
    After deployment, the connector appears in the Microsoft Sentinel Data Connectors experience.

### Q3: Can I reuse or modify a connector created with the wizard?
A: Yes. Since the output is an ARM template, you can:
*   Download it
*   Modify it as needed
*   Redeploy it to the same or another Sentinel workspace, subject to permissions.


### Q4: Does the wizard support thirdparty and custom REST APIs?
A: Yes. The wizard supports configuring connectors for both Microsoft and thirdparty data sources, including REST APIbased integrations.


### Q5: How is schema and DCR configuration handled?
A: The wizard assists with Data Collection Rule (DCR) configuration as part of the guided flow. Where applicable, schema and column definitions are derived from the configuration inputs and sample data provided during setup.


### Q6: What should I do if data is not ingested after deployment?
A: If data does not start flowing:
*   Open the connector details page in Microsoft Sentinel
*   Verify authentication and connection settings
*   Confirm the source API or endpoint is reachable  
    If needed, test using a mock API endpoint to validate configuration independently.


### Q7: Can I deploy connectors created with the wizard to multiple workspaces?
A: Yes, provided you have the required permissions on each target workspace and the deployment parameters are updated accordingly.

### Q8: Does the wizard support nested APIs?
A: No, currently nested API support is not available.


<!-- Required: Details required to escalate issues to the Product Group-->
## Additional Information
---

  - **Internal Documentation**
    - [Roadmap Hub - Microsoft Sentinel Data Connector Wizard](https://microsoft.sharepoint.com/sites/roadmaphub/SitePages/Threat%20Protection/Sentinel%20Data%20Connector%20Wizard.aspx?csf=1&web=1&e=JJTKiq&CID=5d5094e6-204b-4ac6-8f78-bcb8c206dbb7)
  - **Public Documentation**
    - [Public documentation TBD](<link-placeholder>)

---
| Contributor Name | Details | Date(DD/MM/YYYY) |
|--|--|--|
| Nikita Chhabra | Updated| 03/09/2026 |
| Krishna Sagar B V | Creator | 25/02/2026 |

---

:::template /.templates/Wiki-Feedback.md 
:::

---
:::template /.templates/Ava-GetHelp.md
:::
