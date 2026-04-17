---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Automation/[Guide] - Find which Analytic Rule have alert trigger playbooks are configured on Specific Workspace"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Automation/%5BGuide%5D%20-%20Find%20which%20Analytic%20Rule%20have%20alert%20trigger%20playbooks%20are%20configured%20on%20Specific%20Workspace"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Guide to Find which Analytic Rule have alert trigger playbooks are configured on Specific Workspace

## Why?

Following the [Retirement Announcement](https://azure.microsoft.com/en-us/updates?id=retirement-announcement-assigning-alert-trigger-playbooks-within-microsoft-sentinel-analytics-rules) published in March 2023, classic alert-trigger automation in Microsoft Sentinel, where playbooks are triggered directly from analytic rules will be deprecated in **March 2026**. To ensure your alert-driven automations continue to run without interruption, please migrate to **automation rules**.

Migrating existing playbooks that are invoked by alert triggers to automation rules is recommended for better management and automation.

## Scope

This guide provides an easy and quick way for Azure Sentinel Administrators to identify which analytic rules are using *classic* alert automation (playbooks), within a specified workspace.

### Option 1: Logic App - Classic Automation Detection Tool

Make use of this tool. It contains two ARM template-based Logic Apps that scan your environment and provide a complete list of impacted analytic rules requiring migration.

- https://github.com/Azure/Azure-Sentinel/tree/master/Tools/Classic%20Automation%20Migration
  - If you have feedback or question feel free to reach out to owner: Sagi Yagen

### Option 2: Powershell Script - To Find Analytic Rules with Alert Trigger Playbooks in a Workspace

**Prerequisites**
- An active Azure account with appropriate permissions (such as Reader, Contributor, or especially Security Insights permissions).
- PowerShell installed on your machine.
- The Azure PowerShell module installed (`Az` module).
- Basic knowledge of PowerShell scripting and Azure management.
- Access to the subscription ID where the workspace is hosted.
- The workspace's resource ID (not just name, but full Azure resource ID).

```powershell
# === Config ===
$subscriptionId = "your_subscription_id_here"
$workspaceResourceID = "Your_Sentiel_workspace_Resource_Id"

# Connect to your Azure account
Connect-AzAccount

# Select the specified subscription
Set-AzContext -SubscriptionId $subscriptionId

$UriToGetAllAnalyticRules = "$workspaceResourceID/providers/Microsoft.SecurityInsights/alertRules?api-version=2023-09-01-preview"
$actionsApiVersion = "2025-09-01"
$outFile = ".\sentinel_rules_actions_raw.csv"

# === Get rules ===
$GetARinJson = az rest --method get --uri $UriToGetAllAnalyticRules
if (-not $GetARinJson) {
    Write-Error "No response received from rules endpoint: $UriToGetAllAnalyticRules"
    return
}

$ConvertARToObj = $GetARinJson | ConvertFrom-Json
$rules = if ($ConvertARToObj.PSObject.Properties.Name -contains 'value') { $ConvertARToObj.value } else { @($ConvertARToObj) }

$analyticRules = $rules | ForEach-Object {
    [pscustomobject]@{
        id          = $_.id
        displayName = $_.properties.displayName
    }
}

# === Loop rules, fetch actions raw, and accumulate rows for export ===
$rows = New-Object System.Collections.Generic.List[object]

foreach ($rule in $analyticRules) {
    $actionsUri = "https://management.azure.com{0}/actions?api-version={1}" -f $rule.id, $actionsApiVersion
    Write-Host " Getting actions for: $($rule.displayName)" -ForegroundColor Cyan

    $actionsRaw = $null
    try {
        $actionsRaw = az rest --method get --uri $actionsUri
    } catch {
        Write-Warning "Failed to fetch actions for '$($rule.displayName)': $($_.Exception.Message)"
    }

    $cellValue =
        if ([string]::IsNullOrWhiteSpace($actionsRaw)) {
            'no value'
        } else {
            $actionsRaw
        }

    $rows.Add([pscustomobject]@{
        RuleDisplayName = $rule.displayName
        RuleId          = $rule.id
        ActionsRaw      = $cellValue
    })
}

# === Export to CSV ===
$rows | Export-Csv -Path $outFile -NoTypeInformation -Encoding UTF8
Write-Host " Exported $(($rows | Measure-Object).Count) rules to $outFile" -ForegroundColor Green
```

**Expected Outcomes**
- The script generates a CSV file (`sentinel_rules_actions_raw.csv`) containing all analytic rules in the specified workspace.
- For each rule, it shows whether there are associated alert trigger playbooks (actions). If no actions are configured, it states `no value` or `System.Object[]`.
- This export allows easy review and auditing of current alert rules and their linked playbooks, helping plan migration to automation rules.

**Notes**
- Replace `"your_subscription_id_here"` and `"Your_Sentinel_Workspace_Resource_Id"` with actual values.
- The script uses `az rest` commands - ensure Azure CLI is installed and logged in.

## Additional Information

- [Migrate your Microsoft Sentinel alert-trigger playbooks to automation rules](https://learn.microsoft.com/en-us/azure/sentinel/automation/migrate-playbooks-to-automation-rules)
- [Call to Action: Migrate Your Classic Alert-trigger Automations to Automation Rules Before March 2026](https://techcommunity.microsoft.com/blog/microsoftsentinelblog/call-to-action-migrate-your-classic-alert%E2%80%91trigger-automations-to-automation-rule/4479137)
