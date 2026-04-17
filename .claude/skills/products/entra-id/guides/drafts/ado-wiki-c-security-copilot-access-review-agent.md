---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Security Copilot Access Review Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FSecurity%20Copilot%20Access%20Review%20Agent"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- Access Reviews
- Security Copilot
---
 

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Account-Management](/Tags/AAD%2DAccount%2DManagement) [AAD-Workflow](/Tags/AAD%2DWorkflow)  
 


[[_TOC_]]

# Compliance note

This wiki contains test and/or lab data only.

# Update

Update. Based on customer feedback received during the preview, Microsoft is reassessing the Access Review Agent public preview, and it will not move to general availability. The following MC post will be sent to customers on February 27th:

```
Your tenant previously deployed the Access Review Agent public preview. Based on customer feedback received during the preview, Microsoft is reassessing the Access Review Agent public preview, and it will not move to general availability. 

As a result, this public preview feature will be removed on March 27, 2026. We sincerely thank the customers who partnered with us during the preview to explore how agentic AI can be used to improve access review quality. We look forward to incorporating customer feedback and AI learnings from the preview into the core Access Review experience. 

How this will affect your organization

You are receiving this message because your organization previously deployed the Access Review Agent public preview. 

After March 27, 2026: 
	The Access Review Agent will no longer be visible in the Microsoft Entra admin center or in the Security Copilot portal. 
	Reviewers will no longer be able to interact with the agent in Microsoft Teams. 
	Access Review email notifications that previously directed reviewers to the agent in Teams will automatically revert to directing reviewers to complete reviews in the My Access portal. 
	If a reviewer attempts to interact with the agent in Microsoft Teams after this change, they will be redirected to the My Access portal to complete the review. 

This change applies only to the Access Review Agent public preview. The broader Access Reviews experience is not affected. 

What you need to do to prepare

No customer action is required. Microsoft will automatically remove the Access Review Agent public preview from your tenant on March 27, 2026. You may choose to notify reviewers of this change and update any internal documentation that references the Access Review Agent public preview. 


```

# Summary:

The Access Review Agent helps you ensure that access to resources provided to users is up to date with actionable feedback based on specific data from your organization. The agent recommends access review decisions based not only on existing best practices for reviews, but also based on other criteria developed with the agent.

The Access Review agent evaluates access reviews based on policies around previous access review decisions, user activity, governance behavior, and account status. When the agent identifies a suggestion, you can have the agent complete the review based on you accepting, or rejecting, the recommendation.

# Permissions: 

To use the Access Review agent as either an admin, you must have at least the **Security Copilot Contributor** role along with the following roles for specific capabilities:

- **Agent Setup:** To activate, configure, run, and remove the Access Review Agent, you need both the **Identity Governance Administrator** role in combination with the **Lifecycle Workflows Administrator** role, or the **Global Administrator** role.

- **Agent Administration:** To view the overview, activities, or settings of the Access Review Agent, you need either the Global Reader role; a combination of both the **Identity Governance Administrator** role used along with **Lifecycle Workflows Administrator** role; or the **Global Administrator** role.

- **Using the Agent for Access Reviews:** To use the Access Review agent as either an admin, you must have at least the **Security Copilot Contributor** role.

**Note:** These roles should be assigned directly or through a group. Avoid using an account with a role that is activated via PIM. Using an account that doesn't have standing permissions might cause authentication failures for the agent.


# Licensing: 

- You must have the **Microsoft Entra ID Governance** or **Microsoft Entra Suite** license.

- You must Onboard to Security Copilot with at least one **Security Compute Unit (SCU)** provisioned.

     Completing an access review which includes 20 decisions, generating recommendations, as well as the reviewers natural language conversation to complete the review, on average consumes 0.6 SCU. The SCU consumption may vary based on the conversation length between the reviewer and agent.


# Items of Note: 

- Avoid using an account to set up the agent that requires role activation with Privileged Identity Management (PIM). Using an account that doesn't have standing permissions might cause authentication failures for the agent.

- Once agents are started, they can't be stopped or paused. It might take a few minutes to run.

- The agent runs using the identity of the administrator who activated it for the first time to gather insights and save recommendations. Any approvals performed by the reviewer in the Microsoft Teams conversation will be written with the reviewers identity.

- We recommend configuring the agent from the Microsoft Entra admin center.

# Limitations: 

- Currently only works on Team + Groups access reviews
- Does not work on Multi-Stage review. 

![New Access Review - Reviews Tab - Unchecked Multi-Stage Review](/.attachments/AAD-Account-Management/2216802/New-Access-Review-Tab-Multi-Stage.jpg)


# How it Works: 

Each time the agent runs, it takes the following steps. The initial scanning steps do not consume any SCUs.

1. The agent scans all access reviews in your tenant.

2. The agent analyzes the data, such as their activity, of users being reviewed.

3. The agent reviews previous access review decisions to help inform its recommendations.

        If the agent identifies something that wasn't previously suggested, it takes the following steps. These action steps consume SCUs.

4. The agent evaluates access review durations, and recommends that the reviewer reviews the access review expiring earlier first.

5. The agent identifies that a user is no longer active and recommends revoking access.

6. The agent identifies that a user is still active and using resources, the access review agent recommends approving access.

The agent considers the following about a user when making review recommendations:

1. **Activity:** If the user has signed in(SignInActivity) the past 30 days.

2. **User-to-Group affiliation:** If the user has a low affiliation with other users who has the access being requested.

3. **Account enabled:** If the user's account is enabled(accountEnabled).

4. **Employment status:** If the user's employment ended(employeeLeaveDateTime)

5. **Lifecycle workflow history:** If the user has had a mover workflow ran for them in the past 30 days

6. **Previous reviews:** If the user being reviewed is part of a recurring review, decisions from previous review iterations or access package assignments are considered.


# Setting up the Agent: 

1. With an account that has the Security Copilot Contributor, Identity Governance Administrator and Lifecycle Workflows Administrator roles assigned, sign in to the Microsoft Entra admin center 

2. From the new home page, select Go to agents from the agent notification card.

![Security Copilot Agents Page](/.attachments/AAD-Account-Management/2216802/Entra-SC-Agent-List.jpg)

- You can also select **Agents** from the left navigation menu

3. Select Setup on the Access Review Agent tile.

![Access Review Agent Blade](/.attachments/AAD-Account-Management/2216802/Access-Review-Agent-Blade.jpg)

4. Select **Start agent** to begin the first run. The UX will display a message that says "The agent is starting its first run" in the upper-right corner of the screen.

Prior to Ignite 2025 the agent would run in the context of the user account that installed the agent. Customers who enable the agent after Ignite will find it runs in the context of an Agent Identity. The Entra portal will no longer allows customers to setup the agent without Agent ID.

**Note:** The first run might take a few minutes to complete.

## Switch Installed Agent from User Token to Agent ID

If the customer deployed the Access Review Agent before Agent Identities were introduced at Microsoft Ignite 2025, they can manually switch it from running under the admins security context to using an Agent Identity. Follow these steps:

1. Any administrator can go to the **Agents** blade in the [Microsoft Entra ID portal](https://entra.microsoft.com/#view/Microsoft_Entra_Copilot/AgentsLibrary.ReactView).

2. Find the **Access Review Agent** card.

3. In the banner at the top, click **Create agent identity**.
Alternatively, go to the  **Settings** tab and click **Create agent identity** from the banner there.

**Overview tab**

![CreateAID](/.attachments/AAD-Account-Management/2216802/CreateAID.jpg)

**Settings tab**

- **Enable Agent ID**

![Settings1](/.attachments/AAD-Account-Management/2216802/Settings1.jpg)

- **Context Switched**

![Settings2](/.attachments/AAD-Account-Management/2216802/Settings2.jpg)

# Enable Access review for use with the Access Review Agent

After the Access review is started, you must now enable which access reviews you want the agent to make decisions on. The Access Review Agent is able to scan both new, and existing, access reviews. To Update an existing access review so that the agent scans it, do the following steps:

1. Sign in to the Microsoft Entra admin center as at least an Identity Governance Administrator.

2. Browse to ID Governance > Access Reviews.

3. Select the access review you want the agent to support.

4. On the access review overview page, select **Settings**.

5. Under **Advanced Settings**, check the **Enable** box on the setting that says Access Review Agent (Preview).

6. Select **Save**.

# To enable the agent to make recommendations on an existing access package, you'd do the following steps:

1. Sign in to the Microsoft Entra admin center as at least an Identity Governance Administrator.

2. Browse to ID Governance > Entitlement management > Access package.

3. Select the access package you want the agent to support.

4. On the access package overview page, select Policies, then select the policy you want to update and select Edit.

5. On the edit policy page, select Lifecycle.

6. On the lifecycle tab, check the Enable box on the setting that says Access Review Agent (Preview).

7. Select Save.

# Ensure users are able to see and use the agent:

The Access Review Agent will run as a first party application in Microsoft Teams. As such, Teams must be set to allow the agent to be published to users. This can be accomplished using the steps provided in [Overview of app management and governance in Teams admin center - Manage Org-Wide App Settings](https://review.learn.microsoft.com/en-us/microsoftteams/manage-apps?branch=main&branchFallbackFrom=pr-en-us-9084#manage-org-wide-app-settings)

Initially, while the agent is in public preview, users will need to use Microsoft Teams Public Preview. Administrators should configure a Teams Admin Policy. Use the following link for steps in configuring Teams Public Preview: [Microsoft Teams Public preview](https://review.learn.microsoft.com/en-us/microsoftteams/public-preview-doc-updates?tabs=new-teams-client&branch=main)

While the natural language conversation is occurring in Teams, the actual responses are generated by Microsoft Security Copilot.

# Review Permissions:

To use the Access Review Agent, users will need to be assigned the **Security Copilot Contributor** role at a minimum. 

Participating reviewers will access the agentic experience via Microsoft Teams, but with the role assignment they will be entitled to access https://securitycopilot.microsoft.com/ or the Security Copilot experience in other Microsoft Security administrative portals. If reviewers access Security Copilot outside of Microsoft Teams, their data access with Security Copilot will still be subject to default user permissions.

# Using The Access Review Agent:

The agent, after it has been published to users, can be accessed inside Microsoft Teams:

1. Open your Microsoft Teams application signed in as the user assigned as a reviewer.

2. Select Apps.

3. On the Apps page, search Access Review Agent, and select Add.  

4. Once the agent is added, select Open.

5. When open, you can select the available prompt to start the chat with the agent, or type Help me with my access reviews.

# Triggers: 

The agent is configured to run every 24 hours based on when it's initially configured. You can run it at a specific time by toggling the Trigger setting off and then back on when you want it to run.

![Triggers Checkbox](/.attachments/AAD-Account-Management/2216802/Trigger-Checkbox.jpg)

# Access Review Agent Sessions in Security Copilot Portal

Access Review Agent Sessions can be observed in the SecurityCopilot.com portal.

1. Have the admin navigate to https://securitycopilot.microsoft.com/sessions/ 

2. The admin can click through each session.

# Removing the Agent:

1. Sign in to the Microsoft Entra admin center as at least an **Identity Governance Administrator.**

2. Browse to ID Governance > Access Reviews.

3. Select the access review that has agent support enabled.

4. On the access review overview page, select Settings.

5. Under Advanced Settings, check the Disable box on the setting that says Access Review Agent (Preview).

6. Select Save.

## To remove the agent from making recommendations on an existing access package, you'd do the following steps:

1. Sign in to the Microsoft Entra admin center as at least an **Identity Governance Administrator.**

2. Browse to ID Governance > Entitlement management > Access package.

3. Select the access package you want the agent to support.

4. On the access package overview page, select Policies, then select the policy you want to update and select Edit.

5. On the edit policy page, select Lifecycle.

6. On the lifecycle tab, check the Disable box on the setting that says Access Review Agent (Preview).

7. Select Save.

# Troubleshooting:

If there is an error like Try again and it doesn't recover.

- Check SCU Usage: Ensure that the tenant has sufficient Security Compute Units (SCUs) and is not running into overage. See: [Manage security compute unit usage in Security Copilot | Microsoft Learn ](https://learn.microsoft.com/en-us/copilot/security/manage-usage)
- ASC Data Explorer (ASC): 

To check how the Access Review Agent is currently configured in ASC, use Medeina Kusto Trace Logging.

1. Open Kusto Web UX in ASC.
2. Under Select cluster to add choose: **medeinaapiprodwestus3g.westus3  Add Cluster.**
3. In the medeinalogs database, navigate to: **Functions > ASC > ASCEvaluationSkillInvocations**
4. Use the following Kusto Query: 

```
ASCEvaluationSkillInvocations
| where PreciseTimeStamp > ago(1d)
| where SkillName == "AccessReviewGroupRecommender" //AccessReviewAgent, GroupAccessReviewRecommendationSkill, AccessReviewGroupRecommender, CAPolicyMainSkill
| where ReportingProperties contains "SkillFormat"
| summarize max(PreciseTimeStamp), take_any(SessionId, ReportingProperties) by TenantId = tenantid, AgentName = "AccessReviewGroupRecommender", Enabled = True
| project TenantId, AgentName, Enabled, LastRun = max_PreciseTimeStamp, NextRun = datetime_add('day', 1, max_PreciseTimeStamp), SessionId, RunStatusSuccess = parse_json(ReportingProperties)["Success"]
| limit 10

```
## Using the Session ID from Security Copilot Agent. 

Gather the Session ID from https://securitycopilot.microsoft.com/sessions, or from the Kusto query above. This will be needed for filing any ICMs.

![Microsoft Security Copilot My Sessions](/.attachments/AAD-Account-Management/2216802/SessionID-List-in-Security-Copilot.jpg)

5. Capture HAR File: If the issue persists, capture a HAR file of the admin clicking Run agent for further troubleshooting. See: [Capture a browser trace for troubleshooting - Azure portal | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-portal/capture-browser-trace) Look for any 500 errors with Security Copilot API's against the api.securitycopilot domain
6. Remove and Reinstall the Agent.
7. Open ICM: If the failure message does not point to any obvious reason (No SCUs, No Security Copilot license, No access), open a severity 3 Incident Management (ICM).

## Data Collection

Until Security Copilot Agents are integrated into ASC, ask the customer to capture a browser trace while setting up the agent or manually triggering a run. The trace will include Microsoft Security Copilot REST API calls, such as:

`https://api.securitycopilot.microsoft.com/agents?scope=workspace&product=Entra&agentDefinitionName=Global.Entra.AccessReviewRecommendationAgent`

The **AgentId** for the **Global.Entra.AccessReviewRecommendationAgent** has a 1:1 mapping as there can only be 1 instance of the agent in a tenant. There are other agents where there can be multiple instances in the same tenant and each instance will have its own agent id. The AgentID is similar to appId and objectId on enterprise applications. 

## Steps to Retrieve Agent Settings

1. From the browser trace, copy the Bearer token used in the REST call.

2. Replace <your_access_token> in the command below with that token.

3. Run this curl command from a Windows prompt:

```command
curl -X GET "https://api.securitycopilot.microsoft.com/agents?scope=workspace&product=Entra&agentDefinitionName=Global.Entra.AccessReviewRecommendationAgent" -H "Authorization: Bearer <your_access_token>" -H "Content-Type: application/json"
```

**Sample JSON Response**

```json
{
    "values": [
        {
            "agentDefinitionName": "Global.Entra.AccessReviewRecommendationAgent",
            "displayName": "Access Reviews Agent",
            "settings": {},
            "triggers": [
                {
                    "name": "Default",
                    "description": null,
                    "enabled": true,
                    "settings": {},
                    "pollPeriodSeconds": 86400,
                    "triggerId": "cd60220c-####-####-####-############-default",
                    "identityId": "aec6c8d8-####-####-####-############",
                    "lastUpdatedOn": "2025-12-03T17:05:10.9163219+00:00",
                    "lastUpdatedBy": "131a2ecd-fe35-474b-9ee5-97da1d43a994"
                }
            ],
            "agentId": "cd60220c-####-####-####-############",
            "identity": {
                "type": "Agent",
                "agentApplicationId": null,
                "agentIdentityObjectId": null,
                "agenticUserObjectId": null,
                "identityId": "aec6c8d8-####-####-####-############",
                "capturedObjectName": null
            },
            "enabled": true,
            "requiredSkillsets": [
                "Entra"
            ],
            "consentedToRequiredSkillsets": true
        }
    ],
    "continuationToken": null
}
```

**Key Fields**

- `lastUpdatedBy`: Who last updated the agent.

- `pollPeriodSeconds`: How often the agent runs (in seconds).

- `agentId`: Unique identifier for the CA Optimization Agent.


# Public Documentation

**Note:** The following link will no longer work once the learn doc has been published. It can only be accessed internally and the Wiki will be updated with the public link once it goes live.  

[Access Review Agent with Microsoft Security Copilot](https://review.learn.microsoft.com/en-us/entra/id-governance/access-review-agent?branch=pr-en-us-9084#enable-access-review-for-use-with-the-access-review-agent)

# Escaltions

**ICM PAth:**

Owning Service: **Zero Trust AI Agent**

Owning Team: **Triage team**

# Training

**Deep Dive:** 290409 - Security Copilot Access Review Agent

**Format:** Self-paced eLearning

**Duration:** 46 minutes

**Audience:** Cloud Identity Support Team, Security and Access Management

**Region:** All regions

**Course Location:** [Cloud Academy](https://aka.ms/AAxfigw)

