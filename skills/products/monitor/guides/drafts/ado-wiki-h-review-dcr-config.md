---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Review Data Collection Rule (DCR) Config"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Review%20Data%20Collection%20Rule%20(DCR)%20Config"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AMA: How To Review Data Collection Rule (DCR) Config

## Overview

This article helps identify what the JSON of a Data Collection Rule (DCR) looks like in different scenarios. Knowing what normal looks like helps compare and contrast configurations in customer environments that may have structure or syntax issues.

Reference: [Data Collection Rule - Structure](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/data-collection-rule-structure)

> **Note:** This article assumes you are reviewing the **JSON** of the DCR and **NOT** the UI.

## Get the DCR

Start [here](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs) to list associated DCRs and locate the ResourceId.

Methods to retrieve DCR JSON:
- **Azure Support Center (ASC)**: Resource Explorer > Resource Provider > Microsoft.Insights > dataCollectionRules
- **Azure Portal**
- **Azure Cloud Shell**
- **Azure PowerShell**
- **REST API**

## Review the DCR

### Scenario: ALL
- `transformKQL` is not a required property. It may or may not be present and either is permitted.

### Scenario: Heartbeat
- Any DCR with a Log Analytics Workspace destination automatically includes the Heartbeat dataType (`HEALTH_ASSESSMENT_BLOB`).

### Scenario: Performance Counters (Microsoft-Perf)
- streams = `Microsoft-Perf`
- samplingFrequencyInSeconds = positive integer from 1-1800
- counterSpecifiers = valid counter
- Destination = Log Analytics Workspace
- Check `transformKql` in dataFlows (default is "source")

### Scenario: VM Insights (Microsoft-InsightsMetrics)
- streams = `Microsoft-InsightsMetrics`
- samplingFrequencyInSeconds = **60** (no other value allowed)
- counterSpecifiers = `\VmInsights\DetailedMetrics`
- Optional: extensions for map feature, Microsoft-ServiceMap stream

### Scenario: Syslog (Microsoft-Syslog)
- dataSources = syslog
- streams = `Microsoft-Syslog`
- facilityNames: alert, audit, auth, authpriv, clock, cron, daemon, ftp, kern, local0-7, lpr, mail, news, nopri, ntp, syslog, user, uucp
- logLevels: Debug, Info, Notice, Warning, Error, Critical, Alert, Emergency

### Scenario: Syslog (Microsoft-CommonSecurityLog)
- Same as Microsoft-Syslog scenario except streams = `Microsoft-CommonSecurityLog`
- If DCR contains tag `"createdBy": "Sentinel"`, collaborate with Sentinel team
- SAP: `Azure/Microsoft Sentinel/Data Connectors/Connectors based on Azure Monitoring Agent`
- **Destination must be a Sentinel-enabled workspace**

### Scenario: Windows Event Log (Microsoft-Event)
- dataSources: windowsEventLogs
- streams: `Microsoft-Event`
- xPathQueries: `<LogName>!*<XPathQuery>` (e.g., `System!*[System[(EventID=7021 or EventID=7040)]]`)
- Check transformKql in dataFlows

### Scenario: Windows Security Event Log (Microsoft-SecurityEvent)
- dataSources: windowsEventLogs
- streams: `Microsoft-SecurityEvent`
- xPathQueries: `Security!*<XPathQuery>`

### Scenario: Text Logs (Custom-Text-<tableName>_CL)
- streamDeclarations: prefix "Custom-"
- dataSources: logFiles
- streams: prefix "Custom-"
- filePatterns: contains pattern matching the in-scope file
- format: text
- recordStartTimestampFormat: must match one of the permitted values (ISO 8601, etc.)

### Scenario: IIS Logs (Microsoft-W3CIISLog)
- dataSources = iisLogs
- streams = `Microsoft-W3CIISLog`
- logDirectories: optional, defaults to `C:\inetpub\logs\LogFiles`
