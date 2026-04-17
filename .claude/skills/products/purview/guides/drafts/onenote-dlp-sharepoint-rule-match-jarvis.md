# DLP Rule Match for SharePoint File — Jarvis Investigation

> Source: OneNote — Sample query: DLP rule match for SharePoint file
> Status: draft

## Scenario

Customer reports DLP policy is triggering (or not triggering) on SharePoint files. Need to verify which DLP rules matched and what actions were applied.

## Investigation Steps

### 1. Get SharePoint Item Object ID

In 21Vianet, Activity Explorer is **not available**. Use Purview Audit instead:

- Search Purview Audit for target activity on the SharePoint item
- The audit log entry contains:
  - **Item ID** (highlighted in audit details)
  - **Site ID**
- Use the full item path to locate the correct audit entry

### 2. Query Jarvis DLP Agent Logs

- Namespace: `O365PassiveGal`
- Table: `DLPPolicyAgentLogs`
- Filters:
  - **Tenant ID**
  - **Item Object ID** (from step 1)

### 3. Analyze DLP Evaluation

You can filter by:
- **Rule ID** — to check specific rule evaluation
- **Keyword `IsMatch: True`** — to see which DLP policies matched

Key data points from returned logs:
- **Matched DLP Rule ID** — identifies which rule triggered
- **Exact Match Condition** — shows what content triggered the match (SIT, label, etc.)
- **DLP Actions Applied** — shows block/notify/report actions taken

## 21V Note

Activity Explorer is not available in 21Vianet. Always fall back to Purview Audit to get item IDs before Jarvis investigation.
