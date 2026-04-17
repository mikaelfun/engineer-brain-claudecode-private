---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Entra ID Conditional Access for Agent Identities"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FEntra%20ID%20Conditional%20Access%20for%20Agent%20Identities"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Authentication
- cw.AAD-Workflow
- cw.Conditional-Access
- comm-idsp
---
[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Conditional-Access](/Tags/Conditional%2DAccess) 

[[_TOC_]]

### Compliance note  

This wiki contains test/lab data only.

# Feature overview  
<span style="color:red;font-weight:700;font-size:20px">This is an unreleased product. Documentation still in development.</span>

Conditional Access for Agent ID is a new capability in Microsoft Entra ID that brings Conditional Access evaluation and enforcement to AI agents. Conditional Access treats agents as first-class identities and evaluates their access requests the same way it evaluates requests for human users or workload identities, but with agent-specific logic.

For more information about the types of agents and the identity and access management challenges they present, see [Security for AI with Microsoft Entra agent identity](https://learn.microsoft.com/en-us/entra/agent-id/identity-professional/security-for-ai).

## Agent identity architecture in Microsoft Entra

To understand how Conditional Access works with agent identities, it's important to understand the fundamentals of Microsoft Entra Agent ID. Agent ID introduces first-class identity constructs for agents. These are modeled as applications (agent identities) and users (agent users).

| Term                               | Description                                                  |
| :--------------------------------- | :----------------------------------------------------------- |
| Agent blueprint                    | A logical definition of an agent type. Necessary for agent identity blueprint principal creation in the tenant. |
| Agent identity blueprint principal | A service principal that represents the agent blueprint in the tenant and executes only creation of agent identities and agent users. |
| Agent identity                     | Instantiated agent identity. Performs token acquisitions to access resources. |
| Agent user                         | Nonhuman user identity used for agent experiences that require a user account. Performs token acquisitions to access resources. |
| Agent resource                     | Agent blueprint or agent identity acting as the resource app (for example, in agent to agent (A2A) flows). |

For more information, see [Microsoft Entra agent ID security capabilities for AI Agents](https://learn.microsoft.com/en-us/entra/agent-id/identity-professional/microsoft-entra-agent-identities-for-ai-agents).

## Conditional Access capabilities for agent identities and agent users

Conditional Access enforces Zero Trust principles across all token acquisition flows initiated by agent identities and agent users.

Conditional Access **applies** when:

- An agent identity requests a token for any resource (agent identity  resource flow).
- An agent user requests a token for any resource (agent user  resource flow).

Conditional Access **doesn't apply** when:

- An AI agent was developed on a platform that does not currently support Agent Identities.
  - At this time **AI Foundry** and **Copilot Studio** do not fully support agent identities and therefor cannot be controled with Conditional Access.  This will change soon after Ignite 2025.
- An agent identity blueprint acquires a token for Microsoft Graph to create an agent identity or agent user.
  - Note: Agent blueprints have limited functionality. They can't act independently to access resources and are only involved in creating agent identities and agent users. Agentic tasks are always performed by the agent identity.
- An agent identity blueprint or agent identity performs an intermediate token exchange at the `AAD Token Exchange Endpoint: Public endpoint (Resource ID: fb60f99c-7a34-4190-8149-302f77469936)`.
  - Note: Tokens scoped to the `AAD Token Exchange Endpoint: Public` can't call Microsoft Graph. Agentic flows are protected because Conditional Access protects token acquisition from agent identity or agent user.
- The Conditional Access policy is scoped to users or workload identities, **not** to agents.
- [Security defaults](https://learn.microsoft.com/en-us/entra/fundamentals/security-defaults) are enabled.

| Authentication flow                                          | Does Conditional Access apply | Details                                                      |
| :----------------------------------------------------------- | :---------------------------: | :----------------------------------------------------------- |
| Agent identity  Resource                                    |              Yes             | Governed by agent identity policies.                         |
| Agent user  Resource                                        |              Yes             | Governed by agent user policies.                             |
| Agent identity blueprint  Graph (create agent identity (Agent ID)/agent user) |              No              | Not governed by Conditional Access because this flow involves creation of agent identities and agent users by the blueprint. |
| Agent identity blueprint or Agent identity (Agent ID)  Token Exchange |              No              | Not governed by Conditional Access because this flow involves the blueprint or agent identity making an intermediate token exchange call that enables it to perform agentic tasks. This flow does not involve any resource access. |

## Supported vs. Unsupported Agent Types

The Entra Agent registry will display 4 types of agents:
- Agent identities (with no user)
- Agent identities (with user)
- Agents with service principals
- Agents with no identities

Of those, Conditional Access will only target **Agent identities (with no user)** and **Agent identities (with user)**.  To see your agent types, open the Entra portal and access the [Agent ID](https://aka.ms/agentIdUX_ExtPreview) section; from there click on "overview".

![Agent ID Overview](../../../../.attachments/AAD-Authentication/2299387/CA_Agent_Types.png)

# Flow Diagrams

## On Behalf Of (OBO) Flow

![On behalf of flow diagram](../../../../.attachments/AAD-Authentication/2299387/OBO_Flow_Diagram.png)

1. User authenticates with the Client and obtains a User Access Token (Tc)
2. Client sends the User Access Token (Tc) to the Agent Blueprint to act on behalf of the user
3. Agent Blueprint requests a FIC Exchange Token (T1) from Entra ID using MSI, Entra ID returns the T1 to Agent
4. Agent Identity sends an OBO token exchange request to Entra ID, including both T1 and the User Access Token (TC) 
5. Entra ID issues a Resource Access Token (TR) to the Agent Identity after validating both T1 and TC
   - T1.Aud == AgentIdentity.ParentApp == Agent Blueprint
   - TC.Aud == Agent Blueprint
6. Agent Identity accesses the Resource using the Resource Access Token (TR)

## Autonomous App Flow

![Autonomous App flow diagram](../../../../.attachments/AAD-Authentication/2299387/Autonomous_App_Flow_Diagram.png)

1. Agent Blueprint requests a FIC Exchange Token (T1) from Entra ID using MSI, Entra ID returns the T1 to Agent
2. Agent Identity sends an OBO token exchange request to Entra ID, including T1
3. Entra ID issues a Resource Access Token (TR) to the Agent Identity after validating T1
   - T1.Aud == AgentIdentity.ParentApp == Agent Blueprint
4. Agent Identity accesses the Resource using the Resource Access Token (TR).

## Agentic User Flow

![Agentic user flow diagram](../../../../.attachments/AAD-Authentication/2299387/Agentic_User_Flow_Diagram.png)

1. Agent Blueprint requests a FIC Exchange Token (T1, for Agent Identity impersonation) from Entra ID using MSI, Entra ID returns the T1 to Agent
2. Agent Identity requests a FIC Exchange Token (T2, for Agent ID user impersonation) using T1, Entra ID returns the T2 to Agent Identity
   - ESTS validates T1.Aud == AgentIdentity.ParentApp == Agent Blueprint
3. Agent Identity sends an OBO token exchange request to Entra ID, including both T1 and T2
   - ESTS validates T2.Aud == Agent ID User.ParentApp == Agent Identity
4. Entra ID issues a Resource Access Token (TR) to the Agent Identity after validating both T1 and T2
5. Agent ID user accesses the Resource using the Resource Access Token (TR).

# Common Usage Scenarios

## Scenario 1: Conditional Access Policies for Agent Identities as Actors

This scenario restricts access for specific agent identities to resources. Administrators create a new policy on the Conditional Access homepage, selecting Agent identities (preview) as the policy target. They can scope the policy to all agents or selected agents and target resources broadly or granularly. No conditions need selection, and the access control is set to block.

## Scenario 2: Conditional Access Using Custom Security Attributes

Administrators can define custom security attributes (e.g., an attribute set with a string attribute named Approved with values True or False) in the Microsoft Entra admin center. Policies then filter agent identities by these attributes for more precise control. The policy setup mirrors Scenario 1 but adds an Edit filter step to select the custom attribute value. Access controls are set to block, and validation again involves token request attempts that should be blocked if the policy applies .

## Scenario 3: Conditional Access for Human Users Accessing Agent Identities

This use case enforces controls like Multi-Factor Authentication (MFA) for human users accessing agent identities. Policies apply to Users and groups, targeting Agent ID resources. Conditions such as device platform or client apps may be included but are optional. Access controls require MFA or other controls as appropriate.

# Case handling  

This feature is supported by the **Identity Security and Protection** and **M365 Identity** communities.

- **SAP**: Azure/Microsoft Entra Sign-in and Multifactor Authentication/Conditional Access/Agent Identities

# Licensing  

This feature requires a Microsoft Entra ID P1 or P2 subscription.

# Prerequisites 

- Have a user with one of these roles: [Conditional Access Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#conditional-access-administrator), [Security Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#security-administrator), [Global Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#global-administrator).
- To create newcustom security attributesto be used in CA policies, you will also need the following roles:[Attribute Definition Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#attribute-definition-administrator) and[AttributeAssignment Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#attribute-assignment-administrator) 
- To use existing custom security attributes, the following role is sufficient: [Attribute Assignment Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#attribute-assignment-administrator).
- To view policies, you need [Conditional Access Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#conditional-access-administrator) and [Attribute Assignment Reader](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#attribute-assignment-reader).

# Limitations and known issues

If the Agent was built on a platform that does not support Agent Identites and Conditional Access, you will not be able to impact them using conditional access.

**Supported** 1st Party Agent Platforms
- Security Copilot
  
**Unsupported** 1st Party Agent Platforms
- AI Foundry
- CoPilot Studio
- Copliot Chat Agent Creator

This list was last updated 11/13/2025 and will change quickly as more 1st and 3rd parties onboard fully to Agent ID.

# How to configure and manage

Creating a Conditional Access policy for agents involves these four key components:

![Agent ID CA Configuration Sample](../../../../.attachments/AAD-Authentication/2299387/conditional-access-agent-settings-v2.png)

1. Assignments
   1. Scope policies to:
      1. All agent identities in the tenant.
      2. Specific agent identities based on their object ID.
      3. Agent identities based on custom security attributes preassigned to them.
      4. Agent identities grouped by their blueprint.
      5. All agent users in the tenant.
2. Target resources
   1. Resource targeting options include:
      1. All resources.
      2. All agent resources (agent blueprints and agent identities).
      3. Specific resources grouped by custom security attributes preassigned to them.
      4. Specific resources based on their appId.
      5. Agent blueprints (targeting the blueprint covers the agent identities parented by the blueprint).
3. Conditions
   1. Agent risk (high, medium, low).
4. Access controls
   1. Block.
5. Policies can be toggled On, Off, or set to Report-only for simulation.

Pre-ignite 'magic url': <https://aka.ms/caforagents>.

## Agent Scoping

Agents are first-class accounts within Microsoft Entra ID that provide unique identification and authentication capabilities for AI agents. Conditional Access policies targeting these objects have specific recommendations addressed in the article [Conditional Access and agent identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/agent-id)

Policy can be scoped to:

- All agent identities
- Select agents acting as users
- Select agent identities based on [attributes](https://learn.microsoft.com/en-us/entra/fundamentals/custom-security-attributes-overview)
- Select individual agent identities

## New Agent Identities Card

A new card has been added to the Conditional Access overview in support of Agent Identities.

![Agent ID Overview Card](../../../../.attachments/AAD-Authentication/2299387/CA_Agent_OverviewCard.png)

It contains 2 links:

- **See all unprotected sign-ins**: Opens Service principal sign-ins under Sign-in Events.
- **See all policies protecting agents**: Opens list of policies filtered on **Actors:Agents**.

# Troubleshooting

## Viewing policy configuration in ASC

At this time you will need to review the **Policy Details JSON** to tell if a policy targets any agents agents.

### Targeting All Agent Identities

For the **All agent identities** option look for **includeAgentIdServicePrincipals** set to **All** as seen below.

``` json
"clientApplications": {
   "includeServicePrincipals": [],
   "includeAgentIdServicePrincipals": ["All"],
   "excludeServicePrincipals": []
}
```

<details>
 <summary>Click to expand full example</summary>

 ``` json
 {
  "id": "010e4479-209a-46f0-819f-537e98160633",
  "templateId": null,
  "displayName": "AI - All Agent Block Test",
  "createdDateTime": "2025-11-06T16:57:41.8310266Z",
  "modifiedDateTime": "2025-11-10T21:05:49.5305883Z",
  "state": "enabledForReportingButNotEnforced",
  "deletedDateTime": null,
  "partialEnablementStrategy": null,
  "sessionControls": null,
  "conditions": {
    "userRiskLevels": [],
    "signInRiskLevels": [],
    "clientAppTypes": [
      "all"
    ],
    "platforms": null,
    "locations": null,
    "times": null,
    "deviceStates": null,
    "devices": null,
    "applications": {
      "includeApplications": [
        "All"
      ],
      "excludeApplications": [],
      "includeUserActions": [],
      "includeAuthenticationContextClassReferences": [],
      "applicationFilter": null
    },
    "users": {
      "includeUsers": [
        "None"
      ],
      "excludeUsers": [],
      "includeGroups": [],
      "excludeGroups": [],
      "includeRoles": [],
      "excludeRoles": [],
      "includeGuestsOrExternalUsers": null,
      "excludeGuestsOrExternalUsers": null
    },
    "clientApplications": {
      "includeServicePrincipals": [],
      "includeAgentIdServicePrincipals": [
        "All"
      ],
      "excludeServicePrincipals": []
    }
  },
  "grantControls": {
    "operator": "OR",
    "builtInControls": [
      "block"
    ],
    "customAuthenticationFactors": [],
    "termsOfUse": [],
    "authenticationStrength@odata.context": "https://graph.microsoft.com/beta/$metadata#identity/conditionalAccess/policies('010e4479-209a-46f0-819f-537e98160633')/grantControls/authenticationStrength/$entity",
    "authenticationStrength": null
  }
}
 ```
</details>

### Targeting All Agents Acting as Users:

For the **All agents action as users** option look for **users/includeUsers** set to **AllAgentIdUsers** as seen below.

``` json
"users": {
   "includeUsers": ["AllAgentIdUsers"],
   "excludeUsers": [],
   "includeGroups": [],
   "excludeGroups": [],
   "includeRoles": [],
   "excludeRoles": [],
   "includeGuestsOrExternalUsers": null,
   "excludeGuestsOrExternalUsers": null
}
```

<details>
 <summary>Click to expand full example</summary>

 ``` json
 {
  "id": "d7060d6a-948a-4492-8fb2-14c38e4c76c9",
  "templateId": null,
  "displayName": "AI: All Agents acting as users",
  "createdDateTime": "2025-11-06T21:04:05.8823749Z",
  "modifiedDateTime": "2025-11-10T18:39:46.6579881Z",
  "state": "enabledForReportingButNotEnforced",
  "deletedDateTime": null,
  "partialEnablementStrategy": null,
  "sessionControls": null,
  "conditions": {
    "userRiskLevels": [],
    "signInRiskLevels": [],
    "clientAppTypes": [
      "all"
    ],
    "platforms": null,
    "locations": null,
    "times": null,
    "deviceStates": null,
    "devices": null,
    "clientApplications": null,
    "applications": {
      "includeApplications": [
        "All"
      ],
      "excludeApplications": [],
      "includeUserActions": [],
      "includeAuthenticationContextClassReferences": [],
      "applicationFilter": null
    },
    "users": {
      "includeUsers": [
        "AllAgentIdUsers"
      ],
      "excludeUsers": [],
      "includeGroups": [],
      "excludeGroups": [],
      "includeRoles": [],
      "excludeRoles": [],
      "includeGuestsOrExternalUsers": null,
      "excludeGuestsOrExternalUsers": null
    }
  },
  "grantControls": {
    "operator": "OR",
    "builtInControls": [
      "block"
    ],
    "customAuthenticationFactors": [],
    "termsOfUse": [],
    "authenticationStrength@odata.context": "https://graph.microsoft.com/beta/$metadata#identity/conditionalAccess/policies('d7060d6a-948a-4492-8fb2-14c38e4c76c9')/grantControls/authenticationStrength/$entity",
    "authenticationStrength": null
  }
}
```

</details>

### Targeting Agent Identities Based on Attributes:

For the **Select agent identities based on attributes** option look for **agentIdServicePrincipalFilter** set to target specfici attributes as seen below.

``` json
"agentIdServicePrincipalFilter": {
   "mode": "include",
   "rule": "CustomSecurityAttribute.AIAgentTags_AgentDataCountry -eq \"Canada\""
}
```

<details>
 <summary>Click to expand full example</summary>
 
``` json
{
  "id": "8cf153bd-368c-48b9-9ba3-f3bda3131859",
  "templateId": null,
  "displayName": "Agents based on Attr",
  "createdDateTime": "2025-11-13T13:46:53.0730732Z",
  "modifiedDateTime": null,
  "state": "enabledForReportingButNotEnforced",
  "deletedDateTime": null,
  "partialEnablementStrategy": null,
  "sessionControls": null,
  "conditions": {
    "userRiskLevels": [],
    "signInRiskLevels": [],
    "clientAppTypes": [
      "all"
    ],
    "platforms": null,
    "locations": null,
    "times": null,
    "deviceStates": null,
    "devices": null,
    "applications": {
      "includeApplications": [
        "All"
      ],
      "excludeApplications": [],
      "includeUserActions": [],
      "includeAuthenticationContextClassReferences": [],
      "applicationFilter": null
    },
    "users": {
      "includeUsers": [
        "None"
      ],
      "excludeUsers": [],
      "includeGroups": [],
      "excludeGroups": [],
      "includeRoles": [],
      "excludeRoles": [],
      "includeGuestsOrExternalUsers": null,
      "excludeGuestsOrExternalUsers": null
    },
    "clientApplications": {
      "includeServicePrincipals": [],
      "excludeServicePrincipals": [],
      "agentIdServicePrincipalFilter": {
        "mode": "include",
        "rule": "CustomSecurityAttribute.AIAgentTags_AgentDataCountry -eq \"Canada\""
      }
    }
  },
  "grantControls": {
    "operator": "OR",
    "builtInControls": [
      "block"
    ],
    "customAuthenticationFactors": [],
    "termsOfUse": [],
    "authenticationStrength@odata.context": "https://graph.microsoft.com/beta/$metadata#identity/conditionalAccess/policies('8cf153bd-368c-48b9-9ba3-f3bda3131859')/grantControls/authenticationStrength/$entity",
    "authenticationStrength": null
  }
}
```
</details>

### Targeting Specific Agent Identities:

For the **Select Select individual agent identities** option look for **clientApplications\includeServicePrincipals** set to specific Agent/Agent Blueprint GUIDs.

### CA Policy JSON Decoder

| Assignment                         | Type    | Option                                      | Attribtue                                          | Value                                 |
| ---------------------------------- | ------- | ------------------------------------------- | -------------------------------------------------- | ------------------------------------- |
| Users or agents (Preview) \ Agents | Include | All agent identities                        | clientApplications\includeAgentIdServicePrincipals | ALL                                   |
| Users or agents (Preview) \ Agents | Include | All agents acting as users                  | users\includeUsers                                 | AllAgentIdUsers                       |
| Users or agents (Preview) \ Agents | Include | Select agent identities based on attributes | clientApplications\agentIdServicePrincipalFilter   | Mode = Include; Rule = <scoping rule> |
| Users or agents (Preview) \ Agents | Include | Select individual agent identities          | clientApplications\includeServicePrincipals        | GUIDs of Agents                       |
| Users or agents (Preview) \ Agents | Exclude | Select agent identities based on attributes | clientApplications\agentIdServicePrincipalFilter   | Mode = Exclude; Rule = <scoping rule> |
| Users or agents (Preview) \ Agents | Exclude | Select individual agent identities          | clientApplications\includeServicePrincipals        | GUIDs of Agents                       |
| Target resources                   | Include | All agent resources (Preview)               | applications\ includeApplications                  | AllAgentIdResources                   |
| Target resources                   | Exclude | All   agent resources (Preview)             | excludeApplications                                | AllAgentIdResources                   |

## Logging

Admins can use the Sign-in logs to investigate why a Conditional Access policy did or didn't apply as explained in [Microsoft Entra sign-in events](https://learn.microsoft.com/en-us/entra/identity/conditional-access/troubleshoot-conditional-access#microsoft-entra-sign-in-events). For agent-specific entries, filter for **agentType** of **agent user** or **agent identity**. Some of these events appear in the **User sign-ins (non-interactive)** while others appear under **Service principal sign-ins**.

- Agent identities (actor) accessing any resources  Service principal sign-in logs  agent type: agent ID user
- Agent users accessing any resources  Non-interactive user sign-ins  agentType: agent user
- Users accessing agents  User sign-ins
  
![Sign-In Logs](../../../../.attachments/AAD-Authentication/2299387/CA_SignIn_Details.png)

Admins can also check the CA policies details to see why the policy applied or did not apply to a specific agent sign-in.

![CA Policy Details of Sign-In](../../../../.attachments/AAD-Authentication/2299387/CA_SignIn_Details.png)

## ICM escalations  

EvoSTS (ESTS) - This team handles issues involving the EvoSTS authentication service.  This is the token issuance portion of Azure Active Directory.  Please make sure you have reviewed the support workflows on [csssupportwiki.com](http://csssupportwiki.com/) and consult an Cloud Identity TA prior to submitting.

### Support Engineer ICM Template

Support Engineers should file an ICM using this Support Engineer [ICM Template.](https://aka.ms/calockout) 

### Target ICM Team

Identity TAs can redirect to the PG using this service and team.

- **Owning Service**: ESTS
- **Owning Team**: Conditional Access

## Supportability documentation  

### Public documentation

Public documentation will go live at Ignite.

**Agent ID:**

- Microsoft Entra Agent ID docs homepage: [Microsoft Entra Agent ID documentation | Microsoft Learn](https://learn.microsoft.com/en-us/entra/agent-id/)
- What's the Microsoft agent identity platform: [What is Microsoft agent identity platform - Microsoft Entra Agent ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/what-is-agent-id-platform)
- What's new at Ignite: [Microsoft Entra Ignite 2025: Key Announcements and Updates - Microsoft Entra | Microsoft Learn](https://learn.microsoft.com/en-us/entra/fundamentals/whats-new-ignite-2025)
- What is Agent ID: [What is Microsoft Entra Agent ID? - Microsoft Entra Agent ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/agent-id/identity-professional/microsoft-entra-agent-identities-for-ai-agents)

**Conditional Access:**

- Main doc for CA for Agent ID: [Conditional Access for Agent Identities in Microsoft Entra - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/conditional-access/agent-id&tabs=custom-security-attributes#agent-identity-architecture-in-microsoft-entra)
- New CA template: [Conditional Access Templates: Simplify Security - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policy-common&tabs=ai-agents)
- Agent (as actor) selection options: [Conditional Access Setup: Users, Groups, Agents, and Workload Identities - Microsoft Entra ID | Mic](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-users-groups#agents-preview)
- Agent resources: [Targeting Resources in Conditional Access Policies - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps#all-agent-resources-preview)
- Agent risk condition in CA: [How to Use Conditions in Conditional Access Policies - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-conditions#agent-risk-preview)
- New MMP: [Microsoft-Managed Conditional Access Policies for Enhanced Security - Microsoft Entra ID | Microsof](https://learn.microsoft.com/en-us/entra/identity/conditional-access/managed-policies#block-all-high-risk-agents-from-accessing-all-resources-preview)

**Conditional Access APIs:**

- [conditionalAccessPolicy resource type](https://learn.microsoft.com/en-us/graph/api/resources/conditionalaccesspolicy?view=graph-rest-beta)
- [conditionalAccessConditionSet resource type](https://learn.microsoft.com/en-us/graph/api/resources/conditionalaccessconditionset?view=graph-rest-beta)
- [conditionalAccessClientApplications resource type](https://learn.microsoft.com/en-us/graph/api/resources/conditionalaccessclientapplications?view=graph-rest-beta)
- [conditionalAccessApplications resource type](https://learn.microsoft.com/en-us/graph/api/resources/conditionalaccessapplications?view=graph-rest-beta)
- [conditionalAccessUsers resource type](https://learn.microsoft.com/en-us/graph/api/resources/conditionalaccessusers?view=graph-rest-beta)

**Identity Protection:**

- IDP: [ID Protection for Agents - Microsoft Entra ID Protection | Microsoft Learn](https://learn.microsoft.com/en-us/entra/id-protection/concept-risky-agents)



### Training  

- [Deep Dive Recording](https://aka.ms/AAyikg4)
- [Deep Dive Slides](https://aka.ms/AAyizup)

**Note**: If training in hosted in Cloud Academy:  To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.