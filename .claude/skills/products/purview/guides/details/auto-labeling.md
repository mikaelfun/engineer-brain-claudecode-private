# Purview 自动标签 (客户端 / 服务端) -- Comprehensive Troubleshooting Guide

**Entries**: 10 | **Drafts fused**: 8 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-client-side-auto-labeling-support-boundaries.md](..\guides/drafts/ado-wiki-a-client-side-auto-labeling-support-boundaries.md), [ado-wiki-a-required-information-server-side-auto-labeling.md](..\guides/drafts/ado-wiki-a-required-information-server-side-auto-labeling.md), [ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md](..\guides/drafts/ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md), [ado-wiki-a-server-side-auto-labeling-support-boundaries.md](..\guides/drafts/ado-wiki-a-server-side-auto-labeling-support-boundaries.md), [ado-wiki-a-test-dlppolicies-auto-labeling-report.md](..\guides/drafts/ado-wiki-a-test-dlppolicies-auto-labeling-report.md), [ado-wiki-b-client-side-auto-labeling-required-information.md](..\guides/drafts/ado-wiki-b-client-side-auto-labeling-required-information.md), [ado-wiki-client-side-auto-labeling-not-applying.md](..\guides/drafts/ado-wiki-client-side-auto-labeling-not-applying.md), [ado-wiki-server-side-auto-labeling-not-applying.md](..\guides/drafts/ado-wiki-server-side-auto-labeling-not-applying.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md

1. Prerequisites `[source: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md]`
2. Step by Step Instructions `[source: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md]`
3. Step 1: Verify the conditions of the policy `[source: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md]`
4. Step 2: Understand how simulation works for SharePoint and OneDrive `[source: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md]`
5. Step 3: Understand how simulation works for Exchange `[source: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md]`
6. Step 4: Get Assistance `[source: ado-wiki-a-server-side-auto-labeling-simulation-not-showing.md]`
7. Introduction `[source: ado-wiki-a-test-dlppolicies-auto-labeling-report.md]`
8. Prerequisites `[source: ado-wiki-a-test-dlppolicies-auto-labeling-report.md]`
9. Step by Step Instructions `[source: ado-wiki-a-test-dlppolicies-auto-labeling-report.md]`
10. Step 1: Follow the instructions `[source: ado-wiki-a-test-dlppolicies-auto-labeling-report.md]`

### Phase 2: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Server Side Auto Labeling policy scoped to SharePoint/OneDrive (SPO/ODB) with Ad... | SharePoint/OneDrive does not support Admin Units in Auto Lab... | Remove Admin Unit scope from the Auto Label Policy for SharePoint/OneDrive locat... |
| Server Side Auto Labeling Exchange policy not evaluating emails at all — policy ... | Policy is in simulation mode (not Enforce), OR policy scope ... | (1) Set policy mode to Enforce (auto labeling does not apply in simulation mode)... |
| Server Side Auto Labeling policy matched (confirmed via AgentInfo or Test-DlpPol... | SSAL override of manually applied labels is not supported fo... | For Exchange: enable 'Override manually applied labels with lower priority' in t... |
| Client Side Auto Labeling not applying in Outlook, Word, or Excel Online; label ... | User does not have the required license (MIP_S_CLP2) for Aut... | Verify and assign correct license with MIP_S_CLP2 capability using Assist365. Ch... |
| Client Side Auto Labeling configured correctly and SIT matches, but label not au... | AutoLabeling_SensitiveTypeIds is missing from the label API ... | Capture OWA network trace, check label API response for AutoLabeling_SensitiveTy... |
| Document not showing in Server Side Auto Labeling simulation Items for Review af... | Simulation mode only returns documents matching conditions a... | Re-run the simulation after the document modification, or turn on the auto label... |
| Custom SIT not matching document in Server Side Auto Labeling simulation | Custom SIT was created after the document was last modified.... | Modify the document (e.g. trivial edit) after creating the custom SIT to trigger... |
| Not all matching documents shown in Server Side Auto Labeling simulation results | Simulation results are capped at 100 files per site/user per... | This is by design. Use Test-DlpPolicies cmdlet to verify specific documents indi... |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Server Side Auto Labeling policy scoped to SharePoint/OneDrive (SPO/ODB) with Admin Units assigned i... | SharePoint/OneDrive does not support Admin Units in Auto Labeling policies. Assi... | Remove Admin Unit scope from the Auto Label Policy for SharePoint/OneDrive locations. Admin Units ar... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAuto%20Labeling%2FServer%20Side%20Auto%20Labeling%2FTroubleshooting%20Scenarios%3A%20Server%20Side%20Auto%20Labeling%2FScenario%3A%20Server%20Side%20Auto%20Labeling%20not%20applying%20correctly) |
| 2 | Server Side Auto Labeling Exchange policy not evaluating emails at all — policy missing from AgentIn... | Policy is in simulation mode (not Enforce), OR policy scope includes recipient i... | (1) Set policy mode to Enforce (auto labeling does not apply in simulation mode). (2) Verify policy ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAuto%20Labeling%2FServer%20Side%20Auto%20Labeling%2FTroubleshooting%20Scenarios%3A%20Server%20Side%20Auto%20Labeling%2FScenario%3A%20Server%20Side%20Auto%20Labeling%20not%20applying%20correctly) |
| 3 | Server Side Auto Labeling policy matched (confirmed via AgentInfo or Test-DlpPolicies report) but ex... | SSAL override of manually applied labels is not supported for SharePoint/OneDriv... | For Exchange: enable 'Override manually applied labels with lower priority' in the auto label policy... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAuto%20Labeling%2FServer%20Side%20Auto%20Labeling%2FTroubleshooting%20Scenarios%3A%20Server%20Side%20Auto%20Labeling%2FScenario%3A%20Server%20Side%20Auto%20Labeling%20not%20applying%20correctly) |
| 4 | Client Side Auto Labeling not applying in Outlook, Word, or Excel Online; label not recommended or a... | User does not have the required license (MIP_S_CLP2) for Auto Labeling. Plans co... | Verify and assign correct license with MIP_S_CLP2 capability using Assist365. Check mailbox capabili... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Auto%20Labeling/Client%20Side%20Auto%20Labeling/Troubleshooting%20Scenarios%3A%20Client%20Side%20Auto%20Labeling/Scenario%3A%20Client%20Side%20Auto%20Labeling%20not%20applying%20correctly) |
| 5 | Client Side Auto Labeling configured correctly and SIT matches, but label not auto-applied in OWA. | AutoLabeling_SensitiveTypeIds is missing from the label API response (compliance... | Capture OWA network trace, check label API response for AutoLabeling_SensitiveTypeIds. If missing, e... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Auto%20Labeling/Client%20Side%20Auto%20Labeling/Troubleshooting%20Scenarios%3A%20Client%20Side%20Auto%20Labeling/Scenario%3A%20Client%20Side%20Auto%20Labeling%20not%20applying%20correctly) |
| 6 | Document not showing in Server Side Auto Labeling simulation Items for Review after document was mod... | Simulation mode only returns documents matching conditions at the time simulatio... | Re-run the simulation after the document modification, or turn on the auto labeling policy to apply ... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAuto%20Labeling%2FServer%20Side%20Auto%20Labeling%2FTroubleshooting%20Scenarios%3A%20Server%20Side%20Auto%20Labeling%2FScenario%3A%20Server%20Side%20Auto%20Labeling%20Simulation%20not%20showing%20expected%20item) |
| 7 | Custom SIT not matching document in Server Side Auto Labeling simulation | Custom SIT was created after the document was last modified. SPO/ODB classificat... | Modify the document (e.g. trivial edit) after creating the custom SIT to trigger re-classification, ... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAuto%20Labeling%2FServer%20Side%20Auto%20Labeling%2FTroubleshooting%20Scenarios%3A%20Server%20Side%20Auto%20Labeling%2FScenario%3A%20Server%20Side%20Auto%20Labeling%20Simulation%20not%20showing%20expected%20item) |
| 8 | Not all matching documents shown in Server Side Auto Labeling simulation results | Simulation results are capped at 100 files per site/user per auto labeling polic... | This is by design. Use Test-DlpPolicies cmdlet to verify specific documents individually. Consider s... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAuto%20Labeling%2FServer%20Side%20Auto%20Labeling%2FTroubleshooting%20Scenarios%3A%20Server%20Side%20Auto%20Labeling%2FScenario%3A%20Server%20Side%20Auto%20Labeling%20Simulation%20not%20showing%20expected%20item) |
| 9 | Server Side Auto Labeling policy simulation is stuck and never completes. | Simulation may hang due to transient backend issues. | Restart the simulation and wait up to 12 hours for it to complete. If still stuck after restart, esc... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Auto%20Labeling/Server%20Side%20Auto%20Labeling/Troubleshooting%20Scenarios%3A%20Server%20Side%20Auto%20Labeling/Scenario%3A%20Server%20Side%20Auto%20Labeling%20simulation%20is%20stuck) |
| 10 | Server Side Auto Labeling simulation metrics are incorrect; Files to be labeled count not correct. | Simulation only shows 100 files per site/user per policy. Files to be labeled co... | Explain the 100 files per site/user limit. Files to be labeled updates every 24 hours; wait for next... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Auto%20Labeling/Server%20Side%20Auto%20Labeling/Troubleshooting%20Scenarios%3A%20Server%20Side%20Auto%20Labeling/Scenario%3A%20Server%20Side%20auto%20labeling%20metrics%20are%20not%20correct) |