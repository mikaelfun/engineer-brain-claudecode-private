---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Automation/[TSG] - Playbook Generator"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Automation/%5BTSG%5D%20-%20Playbook%20Generator"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<!-- Required: Main title of the document -->
# Playbook Generator (SOAR NL) TSG

---
<!-- Required: Table of Contents -->
[[_TOC_]] 

<!-- Required: Training sessions resources and links-->
## Training sessions
---
| Date (DD/MM/YYYY) | Session Recording | Presenter |
|--|--|--|
| 11/02/2026 | [Microsoft Sentinel - Next Generation Sentinel Automation - Vibe Playbooks](https://platform.qa.com/resource/microsoft-sentinel-next-generation-sentinel-automation-vibe-playbooks-1854/?context_id=12963&context_resource=lp) | Yael Bergman/Raviv Marom |

<!--Required: Brief introduction to the feature/s-->
## Overview
---
The **Playbook Generator** introduces a new, AIassisted way to build automation workflows in Sentinel. The user describes the workflow in natural language, and _Cline_ AI coding agent (wired to Security copilot) produces the playbook in python along with tests, documentation, and a visual flow diagram. This streamlined process accelerates automation development and enables teams to integrate external APIs, validate logic, and deploy endtoend playbooks with confidence.


<!-- Required: Detailed description of the feature/s-->
### Feature Description

The **Playbook Generator** is an AIdriven system embedded directly into the Microsoft Defender portal, designed to streamline the authoring, editing, and validation of automation playbooks. It combines a naturallanguage planning interface with an embedded Visual Studio Code environment powered by _Cline_, AI coding agent

1.  Authoring Model (Cline Agent + VS Code Environment)
    *   When creating or editing a playbook, the system opens an embedded VS Code session.
    *   The user describes the desired logic in natural language.
    *   Cline then performs several actions:
        *   Fetches relevant documentation (with userapproved URL access).
        *   Generates a structured execution plan.
        *   Builds a flow diagram.
        *   Identifies missing integrations.
![image.png](/.attachments/image-6511103a-8f24-4cd9-970c-e276ddaf6607.png)
2.  Code Generation & System Constraints
    *   After approving the plan, the user switches from Plan Mode to Act Mode, where Cline produces Pythonbased automation code. Only Python is supported at this stage.
    *   External libraries are not supported

3. Integration and Execution Model
    *   Playbooks can integrate with **any thirdparty API** using integration profiles, which encapsulate the base URL, authentication, and credentials for external systems.
    *   Since playbooks currently accept **alerts as the sole input type**, all triggered automations are alertdriven.
    *   Generated playbooks can be applied broadly across Sentinel, Defender, or XDR alert streams
4. Visibility
    * The user can view an executed playbook under the new Activities tab in the Incident page. A new activity type Run Playbook will show.
    * The Run Playbook activity has a status (Completed/Failed) and within the side panel the user can see the list of API calls that were executed (the first of which will always be a Graph API call to fetch the alert) and can investigate further which API failed and with which error. 
![image.png](/.attachments/image-41e282a7-a54d-4920-ac21-7b7f59c698af.png)


<!-- Required: Requirements to use the feature/s-->
## Prerequisites
---
* Using Sentinel in USX portal
* Sentinel workspace contributor role
* Security copilot workspace (capacity should reside in US/EU or have the CrossRegion toggle on)


<!-- Optional: Costs/Billing to use the feature/s-->
## Costs
---
While security copilot with SCU is required, the feature itself does not consume any SCUs (no charge).


<!-- Optional: Known limitations of the feature/s-->
## Limitations and Workarounds
---
* A single user can only work on a single open editor at a time
* Playbooks are written only in Python
* Currently only alert based playbooks are supported
* The user must always have a Graph integration set with at least alert read role assigned, as it is used to fetch the alerts

![image.png](/.attachments/image-1404401d-db9b-4aca-86cb-ce268b94d367.png)

## Known issue/s
---
- Link/s to known issue.

## Common scenarios and Troubleshooting  <!-- Describe issue common scenarios as reflected from Cases and CRIs-->
---
### Create playbook / edit playbook is greyed out
The user is unable to create a new playbook or edit a playbook (buttons greyed out)
   - Does the user have sufficient permission? Sentinel Contributor role (Azure) / Detection Tuning (URBAC portal)
   - Does the user have another tab opened or window opened with the VSCode editor?
   - Does the tenant have a Security copilot workspace with capacity in US/EU/have the CrossRegion toggle on?

### Cline returns Http 429: Too Many Requests
A message to Cline is retuned with an error Http 429: Too Many Requests
   - Make sure the capacity of the Security copilot workspace is located in US/EU and Allow Overage is checked

### Playbook execution fails
In the Incident page, under the Activities tab the Run Playbook action shows as Failed
   - If the failure reason shows as playbook not enabled - the user should go back to the playbooks page and enable the playbook.
   - Otherwise, the user can see the API calls with the Http return codes and understand which API call failed. They can go back to edit the playbook and consult Cline on the error. There could be an issue with the integration credentials, API call structure, etc'.

### Graph integration added with proper permissions, but fails during execution with 4xx
If the app used for the integration is new, it might take some time for its permissions to take affect

## Required Kusto Access
---
Refer to the [Microsoft Sentinel - Kusto Permissions](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/3313/Sentinel-Permissions) wiki page to see how to gain the appropriate access.

Cluster: https://securityinsights.kusto.windows.net


### Collect user flow - all PlaybookEditor APIs
```let timeinterval=1d;
let ids=database("SecurityInsightsProd").Log
| where env_time > ago(timeinterval)
| where APP_NAME == "playbookeditor-webapi"
| where env_properties has_all ("e9a3aa7c-353e-4ca4-b65f-3e1c11dc999f") //org id
| where env_properties has_any ("editPlaybook", "createPlaybook", "submitFiles","endSession","extendSession","refreshIntegrations")//"checkEditorAccess"
| distinct env_dt_traceId;
database("SecurityInsightsProd").Span
| where env_time > ago(timeinterval)
| where APP_NAME == "playbookeditor-webapi"
| where env_dt_traceId in (ids)
| extend path = tostring(env_properties["url.path"])
| project-reorder env_time, path, httpStatusCode, httpMethod, name
```

<!-- Required: Details required to escalate issues to the Product Group-->
## Escalating to Product Group (PG)
---
Before creating the IcM, make sure you have exhausted all the steps in this document.
- Make sure to collect:
  - <data-placeholder>
  - <data-placeholder>
- Document detailed reproduction steps of the issue.

### IcM Escalation Path Lookup 
- Issues with playbook management and playbook editing: escalate to SOAR team: **Microsoft Sentinel Automation/ Triage - SOAR**
- Issues with automation rules: escalate to SOAR team: **Microsoft Sentinel Automation/ Triage - SOAR**
- Issues with integration handling: escalate to Actions team: **Microsoft Sentinel Actions - UNIACT**
- Issues with playbook execution: escalate to Actions team: **Microsoft Sentinel Actions - UNIACT**


<!-- Optional: Frequently Asked Questions-->
## Frequently Asked Questions (FAQs)
---
**Q**: What AI model is used?
 - We currently use gpt5.x

**Q**: Does using Playbook Generator feature consumes my SCUs?
 - No, the feature does not consume customer SCUs. There is a daily usage limit enforced on the feature.

**Q**: I completed my playbook but forgot something. Can I edit an existing playbook?
 - Yes, you can go back to the editor and edit an existing playbook.

**Q**: Can I edit more than one playbook at once?
 - Currently each user can only have one open session at a time

**Q**: Is the Graph integration mandatory?
 - Yes, Graph integration is needed for the system to be able to pull the alert. It must have at least Read Alerts permissions

**Q**: What triggers are supported?
 - Currently only Alert Created trigger. Case trigger will be added by GA as well.

**Q**: I created an automation rule for the playbook. Where are executions kept?
 - In the Incident page, under the new Activities tab.

**Q**: My playbook shows as failed in the activities tab with message "playbook is disabled"
 - After creating or editing a playbook, it must first be enabled by the user in the Playbooks configuration page. Similarly, to edit a playbook it must first be disabled.

**Q**: Can I also manually edit the code or just work with the agent?
 - Yes, you can also edit the python code directly

**Q**: Can I use my own VSCode locally with my agent?
 - No, currently only the inline experience is supported. The agent is enhanced with specific instructions for playbook development.

**Q**: What is the playbook built of?
 - It's a python script. Not LogicApps JSON or ARM template.

**Q**: Can I use other languages except python?
 - No, currently only python is supported.

**Q**: Can I add files or import more python libraries?
 - The playbook is the single playbook.py file. No external libraries can be included

**Q**: Is the script execution stdout shown in the portal?
 - We don't display or save the stdout as it may include secrets

<!-- Required: Details required to escalate issues to the Product Group-->
# Additional Information
---

  - **Public Documentation**
    - [Generate playbooks using AI in Microsoft Sentinel (preview)](<https://review.learn.microsoft.com/en-us/azure/sentinel/automation/generate-playbook?branch=pr-en-us-311528>)


<!-- Optional: Details required to explain acronyms-->
## Acronyms
---

| Acronyms | Definition |
|--|--|
| SOAR | Security Orchestration, Automation, and Response  |
| PBE | PlaybookEditor  |
| SCP | Security copilot  |


---
| Contributor Name | Details | Date(DD/MM/YYYY) |
|--|--|--|
| Raviv Marom | Creator | 11/02/2026 |

---
:::template /.templates/Wiki-Feedback.md 
:::

---
:::template /.templates/Ava-GetHelp.md 
:::