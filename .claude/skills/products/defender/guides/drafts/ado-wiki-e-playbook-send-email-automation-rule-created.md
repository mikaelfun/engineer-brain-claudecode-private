---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Automation/Automation Rules and Playbooks/Playbook - Send email when a Sentinel Automation rule is created"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Automation/Automation%20Rules%20and%20Playbooks/Playbook%20-%20Send%20email%20when%20a%20Sentinel%20Automation%20rule%20is%20created"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Playbook - Send email when a Sentinel Automation rule is created

## Description

This article outlines the procedure for creating a playbook in Microsoft Sentinel to send an email upon the creation of an automation rule.

We will use a Sentinel Analytic Rule to query the Azure Activity logs table for an Automation rule created in the last 5 minutes. Because the query will return only an Automation rule ID, we will use the [Automations - Get](https://learn.microsoft.com/en-us/rest/api/securityinsights/stable/automation-rules/get?tabs=HTTP) API to get the Automation rule name and send an email with this information.

## Requirements

- Azure Activity Logs data connector enabled.

## Instructions

1. Enable Azure Activity Logs data connector in Sentinel.
2. Create a Sentinel Analytics rule to generate an incident when an Automation rule is created with the query below:

```kusto
AzureActivity
| where OperationNameValue == "MICROSOFT.SECURITYINSIGHTS/AUTOMATIONRULES/WRITE"
| where ActivityStatusValue == "Success"
| where ActivitySubstatusValue == "Created"
| extend automationRuleId = substring(split(_ResourceId, '/')[12], 0, 36)
```

3. In the Analytics Rule, under entities, map **File Hash** with **automationRuleId**.
4. Create a Playbook with the following flow:
   - Trigger: When Azure Sentinel incident creation rule is triggered
   - Get entities from the incident
   - Parse the File Hash entity to extract the automationRuleId
   - Call the [Automations - Get](https://learn.microsoft.com/en-us/rest/api/securityinsights/stable/automation-rules/get?tabs=HTTP) API to get the automation rule name
   - Send an email with the automation rule information
5. Attach this playbook to the Analytic rule created in step 2.

## Testing

**Action**: Create a new automation rule.
**Expected Result**: After approx. 5 minutes, an email will be sent with the automation rule information.
