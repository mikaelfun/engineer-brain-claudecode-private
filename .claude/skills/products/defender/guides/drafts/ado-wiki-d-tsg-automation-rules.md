---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Automation/Automation Rules and Playbooks/Automation rules/[TSG] - Automation Rules"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FAutomation%2FAutomation%20Rules%20and%20Playbooks%2FAutomation%20rules%2F%5BTSG%5D%20-%20Automation%20Rules"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [TSG] - Automation Rules

## How to find the automation rule ID

There are at least 4 ways to collect the automation rule ID (in order of preference):

### 1. Automation rule export (Preferred)

Use the Portal feature to export the automation rules:

1. From the Microsoft Sentinel navigation menu, select Automation.
2. Select the rule (or rules) you want to export, and select Export from the bar at the top of the screen.
3. Find the exported file in your Downloads folder. It has the same name as the automation rule, with a .json extension.

For more details: [export automation rules](https://learn.microsoft.com/en-us/azure/sentinel/import-export-automation-rules#export-rules)

### 2. HAR file

1. Open a new browser tab, go to the Sentinel Overview page and refresh
2. Start HAR file tracing: [Capture a browser trace](https://learn.microsoft.com/en-us/azure/azure-portal/capture-browser-trace)
3. Open the Automation page and let it fully load
4. Stop the HAR tracing and save
5. Search for calls to `https://management.azure.com/batch` with request to `.../providers/Microsoft.SecurityInsights/automationRules?api-version=...`
6. The response will contain the list of automation rules and their IDs

### 3. API call

Use the API directly: [Automation Rules - List](https://docs.microsoft.com/en-us/rest/api/securityinsights/stable/automation-rules/list?tryIt=true)

### 4. Backend search (Last resort)

Use the hash value of the automation rule name to search in backend telemetry:

```kql
let AutomationRuleID = '';
let SentinelIncidentID = 'XXXXXXXXXXXXXXXXXXXXX';
let WorkspaceID_parameter = 'XXXXXXXXXXXXXXXXXXXXX';
let _endTime = datetime(2024-mm-ddT04:00:00Z);
let _startTime = datetime(2024-mm-ddT03:00:00Z);
let parameter_AutomationRuleName = 'XXXXXXXXXXXXXXXXXXXXXXX';
cluster('securityinsights.kusto.windows.net').database('SecurityInsightsProd').Log
| where env_time > ago(2d)
| where env_properties has ['WorkspaceID_parameter']
| where isempty(['SentinelIncidentID']) or env_properties has ['SentinelIncidentID']
| where (isempty(['AutomationRuleID']) or env_properties has ['AutomationRuleID'])
| project env_time, TriggersOn=tostring(env_properties.TriggersOn),
    TriggersWhen=tostring(env_properties.TriggersWhen),
    AutomationRuleArmResourceName=tostring(env_properties.AutomationRuleArmResourceName),
    AutomationRuleName=tostring(env_properties.AutomationRuleName),
    Order=toint(env_properties.Order),
    CreatedTimeUtc=todatetime(env_properties.CreatedTimeUtc),
    LastModifiedTimeUtc=todatetime(env_properties.LastModifiedTimeUtc),
    DisplayNameHash=toupper(tostring(env_properties.DisplayNameHash)),
    IsEnabled=tostring(env_properties.IsEnabled),
    Conditions=todynamic(env_properties.Conditions),
    Actions=todynamic(env_properties.Actions)
| where isnotempty(Actions) and isnotempty(Conditions)
| summarize arg_max(env_time,*) by AutomationRuleArmResourceName
| take 1000
| sort by Order, AutomationRuleName
| project-reorder Order, AutomationRuleName, *
| extend GivenHashName=toupper(hash_sha256(['parameter_AutomationRuleName']))
| extend SHAMatch=iff(GivenHashName==DisplayNameHash, true, false)
| where SHAMatch == "True"
```

## Common Issues

First, review the public doc: [Automate threat response with automation rules](https://learn.microsoft.com/en-us/azure/sentinel/automate-incident-handling-with-automation-rules)

### Automation rules did not run

Things to check:
- Incident was created
- The Incident meets the condition of the rule
- If there is playbook triggering, is the playbook triggered? Was the playbook configured properly?
- Check [SentinelHealth records](https://learn.microsoft.com/en-us/azure/sentinel/monitor-automation-health)

### Automation rules do not behave as expected

Things to check:
- Check the order of the actions (might be conflicts, including playbooks)
- Check the order of the automation rules. Multiple rules can have the same order.

### Validate if the automation rule triggered

Check SentinelHealth records or incident history:

```kql
SecurityIncident
| where IncidentNumber == "{IncidentNumber}"
| project TimeGenerated, IncidentName, Status, ModifiedBy
| order by TimeGenerated asc
```

The `ModifiedBy` field should start with `Automation rule -`.

### Backend telemetry for automation rule triggers

Use the [Sentinel investigations dashboard](https://dataexplorer.azure.com/dashboards/845b8bf9-af7a-4a5c-bb49-c511ead29e9d) or [Useful troubleshooting queries - Automation](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/7791/Useful-troubleshooting-queries?anchor=sentinel---automation).

### Validating entities (hidden character mismatch)

When automation rule entity conditions do not match despite appearing correct in Log Analytics:

1. Create a new LogicApp Playbook with only the "Microsoft Sentinel Incident" trigger (no additional blocks)
2. Create a new Automation Rule pointing to this playbook with non-entity conditions
3. Configure the same Analytic Rule filter but only use conditions that are not entity-based
4. When the next incident happens, check Logic App > Runs History > Show Raw Outputs
5. Inspect the raw JSON for hidden characters (e.g. double spaces that LAW normalizes)
6. Fix the automation rule condition based on actual raw data
7. Delete the temporary playbook and rule

## SentinelHealth Queries

```kql
SentinelHealth
| where OperationName == "Automation rule run" or OperationName == "Playbook was triggered"
| where ExtendedProperties.IncidentName == "<incidentName>"
| extend TriggeredOn = ExtendedProperties.TriggeredOn
| extend TriggeredByName = ExtendedProperties.TriggeredByName
```

```kql
SentinelHealth
| where OperationName == "Automation rule run" or OperationName == "Playbook was triggered"
| extend TriggeredOn = ExtendedProperties.TriggeredOn
| extend TriggeredByName = ExtendedProperties.TriggeredByName
| where Status == "Failure"
```

## Notes

- SHA256 hash calculation in PowerShell:
```powershell
$mystring = "XXXXXXXXX"
$mystream = [IO.MemoryStream]::new([byte[]][char[]]$mystring)
Get-FileHash -InputStream $mystream -Algorithm SHA256
```
- Overall health can be viewed in [SOAR SLO](https://portal.microsoftgeneva.com/dashboard/RomeAmbaProd/SLOs/SOAR%20SLOs) Geneva dashboard.
