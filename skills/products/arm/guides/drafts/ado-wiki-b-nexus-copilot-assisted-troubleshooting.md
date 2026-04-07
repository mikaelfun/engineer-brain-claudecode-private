---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:C:/Program Files/Git/Azure Local Nexus/Tools and Processes/Copilot-assisted Nexus troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=C%3A/Program%20Files/Git/Azure%20Local%20Nexus/Tools%20and%20Processes/Copilot-assisted%20Nexus%20troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Team: Containers-vTeam-Content
Product: Nexus
Area: Troubleshooting
---

**Created by: Carlos Natera**  
_Last review: 11-February-2026_

# AzureOperatorNexus  Copilot-assisted Nexus troubleshooting (POC)

  

## TL;DR

  

This is a **repo-grounded troubleshooting kit** for **Azure Operator Nexus**:

  

- A library of **Kusto (KQL) queries** (with scenario context) you can reuse.

- **Schema references** for the tables those queries depend on.

- **Operator / controller / RP** notes to help interpret telemetry.

- A **Copilot prompt** that guides engineers to pick and parameterize the right queries.

  

The goal is to make Nexus troubleshooting **faster** and **more consistent**, and to prove (via this POC) that Copilot + curated content can materially improve triage outcomes.

  

## What this project is

  

**AzureOperatorNexus** is a folder inside the **[AzureAdaptiveCloud.Diagnostics ](https://supportability.visualstudio.com/AzureAdaptiveCloud/_git/AzureAdaptiveCloud.Diagnostics)** repository, which lives in the **AzureAdaptiveCloud** Azure DevOps project.

  

Think of it as a **knowledge base** optimized for:

  

- Nexus CSS support engineers doing incident/case troubleshooting

- Copilot-assisted query selection + parameterization

- Repeatable troubleshooting playbooks grounded in known-good query patterns

  

## Why we need it

  

Nexus troubleshooting frequently requires correlating across many tables and components. Without a shared, curated source of truth, we often see:

  

- Rebuilding the same queries case after case

- Inconsistent patterns for time filters, correlation IDs, and resource identity

- Time lost figuring out which tables/fields/operators matter for a given symptom

- Variability in troubleshooting quality and completeness

  

This project centralizes the best-known query patterns and the context needed to apply them correctly.

  

## Benefits

  

- **Faster time-to-first-signal**: you start from proven queries, not from scratch.

- **Higher accuracy**: fewer wrong joins/filters because queries + schemas are documented.

- **Repeatable flow**: case inputs  recommended queries  interpretation  next steps.

- **Knowledge retention**: findings from one case can be turned into reusable docs.

- **Copilot output stays grounded**: the prompt is designed to steer Copilot to this repos content.

  

## POC status (v1)

  

This is a **first version / proof-of-concept**:

  

- Coverage is incomplete; many scenarios still need to be added.

- Some query docs reference tables that dont yet have matching entries in `Schemas/`.

- Formatting and consistency will improve over time.

  

The purpose of v1 is to prove this approach works and can **significantly speed up troubleshooting** while **increasing accuracy**.

  

## Prerequisites

  

- VS Code

- Git (or VS Code Git integration)

- GitHub Copilot access

- VS Code extensions:

 - GitHub Copilot

 - GitHub Copilot Chat (or Copilot Chat enabled via the Copilot extension, depending on your VS Code build/policies)

  

## Quickstart (how to use it today)

  

### 1) Clone AzureAdaptiveCloud.Diagnostics

  

You need a local copy of **AzureAdaptiveCloud.Diagnostics**.

  

Option A  Clone from VS Code

  

1. Open VS Code

2. Command Palette: `Ctrl+Shift+P`

3. Run: **Git: Clone**

4. Paste the Azure DevOps clone URL for **AzureAdaptiveCloud.Diagnostics**

5. Choose a local folder

6. When prompted, click **Open**

  

Option B  Clone from terminal (PowerShell)

  

```powershell

git clone <AZDO_CLONE_URL_FOR_AzureAdaptiveCloud.Diagnostics>

```

  

Where do I get the clone URL?

  

- In Azure DevOps, open the **AzureAdaptiveCloud.Diagnostics** repo  click **Clone**  copy the URL.

  

### 2) Open the AzureOperatorNexus folder in VS Code

  

Open the folder:

  

`AzureAdaptiveCloud.Diagnostics/AzureOperatorsNexus`

  

(Opening just this folder keeps navigation/search focused.)

  

### 3) Start Copilot Chat with the Nexus troubleshooting prompt

  

1. Open: `Templates/troubleshooting_prompt.md`

2. Copy the entire prompt

3. Open **Copilot Chat** in VS Code

4. Paste the prompt

5. Provide case inputs (best effort):

 - Issue description

 - Time window (start/end + time zone)

 - subscriptionId (if available)

 - correlationId (if available)

 - primary resource identity (cluster name, resource ID, RG, operator name)

  

Expected outcome

  

- Copilot recommends relevant query docs from `Queries/`.

- Copilot parameterizes the Kusto queries using your inputs.

- Copilot explains interpretation and suggests next-step queries.

  

## How it works (conceptually)

  

The prompt in `Templates/troubleshooting_prompt.md` is written to:

  

- Prefer query patterns already documented under `Queries/`

- Respect schemas documented under `Schemas/`

- Leverage operator/RP context under `Controllers-Operators-Resources-RP/` for interpretation

  

In practice, your workflow becomes:

  

1. Provide the scenario + identifiers

2. Run suggested KQL

3. Share results back

4. Iterate until root cause is found or narrowed

  

## Whats in the folder (map)

  

- `Templates/`

 - `troubleshooting_prompt.md`: prompt for Copilot Chat

 - `query-template.md`: template for documenting new queries

- `Queries/`

 - scenario-focused query docs (Markdown), organized by source/author area

- `Schemas/`

 - schema references for commonly used tables

- `Controllers-Operators-Resources-RP/`

 - operator/controller/resource/RP context to support interpretation

  

## Tips for best results

  

- Use the tightest **time window** you can.

- If you have a **correlationId**, provide it earlymany query flows pivot on it.

- Share back a small excerpt of results (top rows + key columns) and ask Copilot what to do next.

  

## Contributing (lightweight)

  

If you find a useful query during a case:

  

- Add a new query doc under `Queries/` using `Templates/query-template.md`, or

- Improve an existing doc with:

 - clearer parameters

 - expected output

 - interpretation guidance

 - links to relevant schema docs

  

Small improvements compound quickly.
