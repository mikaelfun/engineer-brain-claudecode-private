---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Portal Issues for Alerts"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20Portal%20Issues%20for%20Alerts"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Portal Issues for Alerts

## Scenario
Use this troubleshooting guide for issues relating to the Azure portal user experience that happen constantly or intermittently in a customer environment.

Examples: Portal not loading; Specific alert rule not loading; Problems creating, retrieving, updating or deleting alert rules which otherwise work using PowerShell, API, CLI, etc.

> **Note**: If the issue only happened once on the portal and it does not reproduce, then the following steps will not apply. In this situation, we can do a best effort to investigate from trace logs, but we must set customer expectations that it might not be possible to get an RCA into what happened.

## Scoping
- What type of alert are they trying to create or modify?
- What method are they using to create or modify the alert? (ARM Template, PowerShell, Bicep, Terraform, etc.)
- What errors is the customer seeing? (Provide screenshots)

## Troubleshooting

### Step 1: Cover the basics
Ask the customer to complete the below list:
1. Clear the cache by doing a hard refresh
2. Try using a different browser
3. Try using Private browsing
4. Try using another network
5. Try enabling 3rd party cookies and testing the behavior
6. If all is still failing, is it possible to unblock the customer using PowerShell, API, CLI, etc?

> **Important**: If the CRUD operation issue reproduces when using PowerShell, API, CLI, etc, then this is not a portal issue, and it is likely an issue with the Alerts Control Plane. Use the Kusto guides for Activity Log/Log/Metric Alert rule CRUD events.

### Step 2: Check for outages and known issues
Check for outages using the Check for Service Outages guidance and search Known Issues.

### Step 3: Validate the user's permissions
For CRUD operations, the user must have:
- **Read** permission on the alert rule's **scope**
- **Read** permission on the **action group**
- **Write** permission on the **resource group** where the alert rule is located

For log search alert rules: if user gets "The query couldn't be validated since you need permission for the logs", the user is missing:
- Workspace-context: `Microsoft.OperationalInsights/workspaces/query/read`
- Resource-context: `Microsoft.Insights/logs/tableName/read`

### Step 4: Collect HAR trace, console logs, and relevant screenshots/videos
Collect browser trace during issue reproduction. Do NOT take screenshots of customer environment yourself.

### Step 5: Analyze the browser trace and console logs
- Check for red messages or exceptions
- Check for 3xx, 4xx, or 5xx return codes
- Check for 200 OK with no response data
- Check if traffic is blocked (management.azure.com, api.loganalytics.io, etc.)

### Step 6: Attempt to reproduce the issue
1. Create alert rule(s) with the same configuration
2. Attempt the same operation in both internal (ms.portal.azure.com) and customer-facing portal
3. If issue only reproduces in customer portal, a fix may be on the way

### Step 7: Escalate to the product group
Raise ICM to **Azure Monitor | Alerts User Experience (UX) (Id: D143DT)** with clear repro steps, HAR trace, timestamps, and grant case access to Backup 3 on-call.
