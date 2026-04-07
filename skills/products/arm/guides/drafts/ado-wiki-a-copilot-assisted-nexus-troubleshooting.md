---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Tools and Processes/Copilot-assisted Nexus troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Tools%20and%20Processes/Copilot-assisted%20Nexus%20troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Copilot-assisted Nexus Troubleshooting (POC)

## TL;DR

A repo-grounded troubleshooting kit for Azure Operator Nexus:
- Library of **Kusto (KQL) queries** with scenario context
- **Schema references** for query tables
- **Operator / controller / RP** notes for telemetry interpretation
- **Copilot prompt** to guide engineers to the right queries

## What This Is

A folder inside the **AzureAdaptiveCloud.Diagnostics** ADO repository, organized as:
- `Templates/` - troubleshooting_prompt.md, query-template.md
- `Queries/` - scenario-focused KQL query docs
- `Schemas/` - commonly used table schemas
- `Controllers-Operators-Resources-RP/` - operator/controller context

## Prerequisites

- VS Code, Git, GitHub Copilot access
- Clone **AzureAdaptiveCloud.Diagnostics** repo

## Quickstart

1. Clone AzureAdaptiveCloud.Diagnostics repo
2. Open `AzureOperatorNexus` folder in VS Code
3. Open `Templates/troubleshooting_prompt.md`, copy entire prompt
4. Open Copilot Chat, paste prompt
5. Provide case inputs: issue description, time window, subscriptionId, correlationId, primary resource identity

## Expected Outcome

- Copilot recommends relevant query docs from `Queries/`
- Copilot parameterizes Kusto queries using your inputs
- Copilot explains interpretation and suggests next-step queries

## Tips

- Use tightest time window possible
- If you have a correlationId, provide it early
- Share back small excerpt of results and ask Copilot what to do next
