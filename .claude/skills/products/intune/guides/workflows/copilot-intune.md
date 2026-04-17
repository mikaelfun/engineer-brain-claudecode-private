# Intune Security Copilot for Intune — 排查工作流

**来源草稿**: ado-wiki-Security-Copilot.md
**Kusto 引用**: (无)
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: Scoping/Troubleshooting Questions
> 来源: ado-wiki-Security-Copilot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 2: Diagnostics
> 来源: ado-wiki-Security-Copilot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
//Enabled Skillsets
MedeinaApi
| where SessionId == {Session}
| where name == "Generic"
| where body startswith "Getting SkillDescriptors for skillset"
| project body
```
`[来源: ado-wiki-Security-Copilot.md]`

```kql
//Investigate a specific session and enabled skillsets
let sessionidd = "<get this from .har browser trace>";
Global("EvaluationSkillInvocations")
| where TIMESTAMP > ago(30d)
| where SessionId == sessionidd
| project PreciseTimeStamp, SessionId, SkillsetName, SkillName, Exception, SkillInputs, SkillOutput
```
`[来源: ado-wiki-Security-Copilot.md]`

```kql
//Understand more about a specific session
let Session = "<get this from .har browser trace>";
Global("MedeinaApi")
| where SessionId == Session
```
`[来源: ado-wiki-Security-Copilot.md]`

## Scenario 3: Skills - Skill not found
> 来源: ado-wiki-Security-Copilot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
MedeinaApi
| where SessionId == {Session}
| where name == "Microsoft.Medeina.Skillsets.Orchestrator.V1.MedeinaOrchestratorV1Skills"
| where body == "No skill matched"
```
`[来源: ado-wiki-Security-Copilot.md]`

```kql
//Find if a Tenant is onboarded to CoPilot correctly
KnownTenants
| where TenantId contains '6b74cafa'
```
`[来源: ado-wiki-Security-Copilot.md]`

```kql
//Sample query to find retry errors
Global("EvaluationSkillInvocations")
|where TIMESTAMP > ago(30d)
|where Exception contains "Please enable the ARM skillset and retry"
|project PreciseTimeStamp, SessionId, SkillsetName, SkillName, Exception, SkillInputs, SkillOutput, tenantid
|distinct tenantid
|count 
```
`[来源: ado-wiki-Security-Copilot.md]`

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
`[来源: ado-wiki-Security-Copilot.md]`

```kql
//Is my customer exception part of a general issue?
Global("EvaluationSkillInvocations")
| where TIMESTAMP > ago(30d)
| where Exception contains "We are currently experiencing heavy load. Please try again later."
| project PreciseTimeStamp, SessionId, SkillsetName, SkillName, Exception, SkillInputs, SkillOutput, tenantid
| distinct tenantid
| count
```
`[来源: ado-wiki-Security-Copilot.md]`

## Scenario 4: Embedded Experience specific troubleshooting scenarios
> 来源: ado-wiki-Security-Copilot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Incorrect data provided by Copilot
- No data was provided by Copilot
- Copilot buttons are missing from Intune
- Copilot doesn't show enabled in Intune tenant administration
- Notice of near or at consumption (SCU) limit
- Received an error with a prompt
- Copilot not following scope tags/RBAC permissions as expected

## Scenario 5: Standalone Experience specific troubleshooting scenarios
> 来源: ado-wiki-Security-Copilot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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
