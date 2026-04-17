---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Workspace Management/How-to: Do a one-time historic data export from Kusto into customer storage account"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FWorkspace%20Management%2FHow-to%3A%20Do%20a%20one-time%20historic%20data%20export%20from%20Kusto%20into%20customer%20storage%20account"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How-to: One-time Historic Data Export from Log Analytics to Storage Account

## Scenario
Customers may need to export historic data from their Log Analytics or Application Insights workspace into a storage account.

## Preferred Method: Logic App
Use the Logic App process: https://learn.microsoft.com/azure/azure-monitor/logs/logs-export-logic-app

Fine tune according to Log Analytics limits:
- Log queries cannot return more than 500,000 rows
- Log queries cannot return more than 64,000,000 bytes
- Log queries cannot run longer than 10 minutes by default
- Log Analytics connector is limited to 100 calls per minute

## Special Internal Process (Exceptional Cases Only)

> **WARNING**: This process is currently **not supported**. Only exceptional circumstances with M4 approval will be considered. Do NOT share this alternative with customers until internal validation.

### Pre-requisites
Before starting:
- [ ] Explore all available export options and document why they cannot be used
- [ ] Document business impact in detail (involve TAM/PFE/CSA/TA/STA)
- [ ] **Set right expectations**: bar is very high, likelihood of rejection is equally high

### Required Information

| Application Insights | Log Analytics |
|--|--|
| URI to App Insight data | Workspace URI |
| IKey | Query for data migration |
| Query for data migration | Storage URI + key |
| Storage URI + key | Data formatting details |
| Data formatting details | |

### Process
After gathering pre-requisites, use the IcM template to raise request to EEE triage: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=w2Yj2a

> Note: PG is working on a new feature to allow customers to perform one-time historic data export (target: February 2025).
