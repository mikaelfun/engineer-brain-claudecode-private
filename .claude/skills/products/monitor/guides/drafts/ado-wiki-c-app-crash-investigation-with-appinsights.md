---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/Application's crashes References/How to approach application crash investigations with Application Insights suspected responsible"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAdditional%20Reference%20Material%2FApplication's%20crashes%20References%2FHow%20to%20approach%20application%20crash%20investigations%20with%20Application%20Insights%20suspected%20responsible"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Approach Application Crash Investigations with Application Insights Suspected Responsible

## Overview
General guidance for scenarios where customers or external CSS teams suggest that Application Insights SDKs/agents are responsible for an application crash or HTTP 5xx errors. Targeted to web apps hosted on App Services.

## Considerations
- If engagement is through a collaboration task, the originating CSS team should present compelling evidence of a code defect involving our SDKs/agents.

## Workflow

### 1. Understand the back story
Key questions to ask:
- What is the exact behavior? Step-by-step description before crash/failure.
- When did failures begin? Did they follow an application change or deployment?
- Was Application Insights enabled prior to these failures?
- What evidence indicates Application Insights is behind this issue?
- What happens if we remove the SDK/agent? Does the app continue to fail?

### 2. Validate for recent SDK version changes

**Auto instrumentation (App Services)**: SDK upgrades happen with new ANT releases. Use "Determine the ANT Version or Antares Build Version" to check if ANT build recently changed.

**Manual instrumentation**: Little changes without customer control. If no manual SDK upgrades were performed but app broke, AI binaries are likely not responsible.

**KQL to check SDK versions**:
```kql
// Classic schema
search *
| where timestamp > ago(30d)
| where cloud_RoleName contains 'Name of the web app'
| summarize max(timestamp) by sdkVersion, $table

// Workspace-based schema
search *
| where TimeGenerated > ago(30d)
| where AppRoleName contains 'Name of the web app'
| summarize max(TimeGenerated) by SDKVersion, $table
```

Check against known SDK versions documentation. Suggest upgrading if using old versions.

### 3. Trace request execution on App Services
Key questions from request tracing:
- Did failed requests reach the App Service **frontend roles**? If no → issue is at a prior stage (load balancers, application gateways, etc.)
- Did failed requests reach the **worker role**? If no → Application Insights SDK is NOT a factor (SDK code only runs when request hits the worker)
- If recorded in worker → investigate FREB logs for exception details

### 4. Gather compelling evidence
Memory dumps are key to confirm whether SDK code is involved:
- **Reproducible issue**: Have customer trigger behavior and capture memory dumps before/after
- **Non-reproducible**: Use App Services **Auto Heal** feature to capture dumps automatically when conditions are met (e.g., status code triggers)

Once memory dump captured during broken experience, escalate to PG and EEE for review.
