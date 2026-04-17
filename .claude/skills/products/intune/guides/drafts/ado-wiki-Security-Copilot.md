---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Copilot In Intune/Security Copilot"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FCopilot%20In%20Intune%2FSecurity%20Copilot"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# About Security Copilot
As of this writing, Security Copilot in relation to Intune has 2 parts:
- 'Standalone' Security Copilot
  - Found at securitycopilot.microsoft.com
  - Referred to as the 'standalone' portal
  - Also known as the 'platform'
- Security Copilot for Intune 
  - Found within intune.microsoft.com
  - Referred to as the 'embedded experience'
  
## Standalone Security Copilot test tenant information

The designated test environment for Standalone Security Copilot is SevilleCSS.onmicrosoft.com. 

Important caveats:
- This is originally the CSS MDE Security Team's test tenant
- It is not MDM enabled at all
- It has no Intune-enrolled devices
- You can still leverage this environment for MDE attached devices which do appear in Intune.microsoft.com

## Embedded Copilot for Intune test tenant information

The designated environment for the Embedded Copilot for Intune is CoPilotIntuneCSS.onmicrosoft.com.

Important caveats:
- This is the shared tenant for the global Intune CSS team
- It is only licensed for 250 users

## What licensing is required for Security Copilot in Intune? 
At Ignite 2025 it was announced that Security Copilot is now included for all Microsoft 365 E5 customers.

Migration will occur in phases over the next several months with completion expected by July 1, 2026. 

Customers that currently have SCUs in use will be the first to have this new feature enabled. 

- **Public Info**: [Learn about Security Copilot inclusion in Microsoft 365 E5 subscription](https://learn.microsoft.com/en-us/copilot/security/security-copilot-inclusion)

## Currently unsupported policy types for Copilot:
- Config Manager Tenant Attach based policy (i.e. targeting Windows (ConfigMgr))
- Reusable settings
- Custom compliance policy scripts
- Conditional Access (dependent on Entra ID support)
- App protection
- App configuration
- Policy sets

# Support Boundaries
- **Note: The Intune embedded experience will not work unless the standalone experience is working within the customer's org**
- Platform configurations: Generally fall under the Security Copilot team
- RBAC: Ownership depends on the specific issue
- Incorrect data: Intune portal and telemetry are the 'source of truth'

# Troubleshooting Security Copilot

## How to BLOCK Copilot with Intune:
- **Public info**: [Remove or prevent installation of the Copilot app](https://learn.microsoft.com/en-us/windows/client-management/manage-windows-copilot#remove-or-prevent-installation-of-the-copilot-app)

## Scoping/Troubleshooting Questions
- What is the specific issue?
- Can we validate on which platform the issue lies? (Standalone vs Embedded)
- Can we validate where the discrepancy is? (Intune Kusto vs Medeina clusters)
- Can you internally repro or is it only reproducible on the customer side?
- Do you have a .har F12 Browser trace of the repro?
- Have you collected session ID and skill names affected?
- Have you collected the RBAC roles that the affected user has?
- Is user a member of Security Owner or Security Contributor in securitycopilot.microsoft.com?

## Kusto Queries

**Prerequisites:**
1. Join "Security Copilot CSS" Entra Security Group via IDweb
2. Request "Security Copilot CSS" Access Package: https://myaccess.microsoft.com/@microsoft.onmicrosoft.com#/access-packages/041a897f-0c26-4da4-a730-9c85403c7e7e

**Prod Kusto Clusters:**
```
cluster('https://medeinaapiprodwestus3g.westus3.kusto.windows.net') -- North America
cluster('https://medeinaapiprodnortheur.northeurope.kusto.windows.net') -- North Europe
cluster('https://medeinaapiproduksouthg.uksouth.kusto.windows.net') -- UK South
cluster('https://medeinaapiprodaustrali.australiaeast.kusto.windows.net') -- Australia East
cluster('https://medeinaapiprodjapaneas.japaneast.kusto.windows.net') -- Japan East
cluster('https://medeinaapiprodcanadace.canadacentral.kusto.windows.net') -- Canada Central
cluster('https://medeinaapiprodbrazilso.brazilsouth.kusto.windows.net') -- Brazil South
```

### Diagnostics
```kql
//Enabled Skillsets
MedeinaApi
| where SessionId == {Session}
| where name == "Generic"
| where body startswith "Getting SkillDescriptors for skillset"
| project body
```

```kql
//Investigate a specific session and enabled skillsets
let sessionidd = "<get this from .har browser trace>";
Global("EvaluationSkillInvocations")
| where TIMESTAMP > ago(30d)
| where SessionId == sessionidd
| project PreciseTimeStamp, SessionId, SkillsetName, SkillName, Exception, SkillInputs, SkillOutput
```

```kql
//Understand more about a specific session
let Session = "<get this from .har browser trace>";
Global("MedeinaApi")
| where SessionId == Session
```

### Skills - Skill not found
```kql
MedeinaApi
| where SessionId == {Session}
| where name == "Microsoft.Medeina.Skillsets.Orchestrator.V1.MedeinaOrchestratorV1Skills"
| where body == "No skill matched"
```

```kql
//Find if a Tenant is onboarded to CoPilot correctly
KnownTenants
| where TenantId contains '6b74cafa'
```

```kql
//Sample query to find retry errors
Global("EvaluationSkillInvocations")
|where TIMESTAMP > ago(30d)
|where Exception contains "Please enable the ARM skillset and retry"
|project PreciseTimeStamp, SessionId, SkillsetName, SkillName, Exception, SkillInputs, SkillOutput, tenantid
|distinct tenantid
|count 
```

```kql
//Find evaluations by customer, weekly
let start_time = ago(7d);
let adjusttime = start_time + 1d;
let customername = "contoso";
EvaluationsExpanded
| where EvaluationCreatedOn > start_time
| where TenantName contains customername
| join kind=leftouter (Global("Prompts")
| where TIMESTAMP > adjusttime
| distinct SessionId, PromptId, Experience=Source) on PromptId, SessionId
| project-away SessionId1,PromptId1
| where Experience == "immersive"
| project EvaluationCreatedOn, SessionId, PromptContent, EvaluationContent, PromptSkillName, PromptInputs, EvaluationResultType, SessionPromptCount, SkillsetNames
```

```kql
//Is my customer exception part of a general issue?
Global("EvaluationSkillInvocations")
| where TIMESTAMP > ago(30d)
| where Exception contains "We are currently experiencing heavy load. Please try again later."
| project PreciseTimeStamp, SessionId, SkillsetName, SkillName, Exception, SkillInputs, SkillOutput, tenantid
| distinct tenantid
| count
```

## Embedded Experience specific troubleshooting scenarios
- Incorrect data provided by Copilot
- No data was provided by Copilot
- Copilot buttons are missing from Intune
- Copilot doesn't show enabled in Intune tenant administration
- Notice of near or at consumption (SCU) limit
- Received an error with a prompt
- Copilot not following scope tags/RBAC permissions as expected

## Standalone Experience specific troubleshooting scenarios
- Asked non-Intune question, Intune plug-in WAS picked
- Asked Intune question, Intune plug-in was NOT picked
- Asked 'open' Intune question, got incorrect result
- Asked question about specific object, incorrect information returned
- Setup/initialization of platform
- Notice of near or at consumption (SCU) limit

## Logs to gather
- Validate what is currently visible in the Intune portal
- If customer repeats the prompt on a different object, does it fail similarly?
- Is the issue reproducible in the CSS test tenant?
- Validate what is reported in Intune Kusto for that object
- Collect .har while reproducing the issue, or at least collect the session ID
- Notate any prompts verbatim
- Request any knowledge source files

## Session history
1. Go to securitycopilot.microsoft.com
2. Click top left hamburger menu > my sessions
3. Click through sessions to find the needed one
4. Session ID is at the top of the page and in browser URL

# Known issues
- JSON error in embedded experience due to insufficient Copilot permissions (user needs Security Contributor or Security Reader role)
- "Not set up" false error due to insufficient Copilot RBAC roles
- "No skill matched" when Intune plugin is not picked by orchestrator

# Escalations
- First post to appropriate Intune Teams SME Case Discussion Channel
- Email CopilotIntuneCSS@microsoft.com v-team alias for initial IET/RFC questions prior to submitting
- Only then should the SEE escalate to Intune CXE via ICM

## Regional Points of Contact
| Region | CSS Supportability | CSS Delivery-FTE POC | CSS Delivery Partner POC |
|--------|-------------------|---------------------|------------------------|
| APAC | Leon Zhu | Sai Santosh, Jin Yang | Diwakar Singh |
| EMEA | Ivan Valdes Chapa | Cristian Marin | Ahmed Moharram |
| Americas | Umair Khan, Jacob Scott | Dean Yamada | Sudip Barua |
