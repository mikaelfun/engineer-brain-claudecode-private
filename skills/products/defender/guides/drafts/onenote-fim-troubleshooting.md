# File Integrity Monitoring (FIM) Troubleshooting Guide

> Source: OneNote - Mooncake POD Support Notebook / Microsoft Defender for Cloud / Defender for Servers / FIM

## Overview

FIM is enabled via Change Tracking in Azure Security Center. ADO Wiki reference:
- [Concept: Enabling Change Tracking via FIM in ASC](https://dev.azure.com/Supportability/AzureAutomation/_wiki/wikis/Azure-Automation.wiki/179564/Concept-Enabling-Change-Tracking-via-File-Integrity-Monitoring-in-Azure-Security-Center)

## Log Analytics Queries

### ConfigurationData (Inventory Snapshots)
Refreshed approximately every **20 hours** + on change detection.

```kql
ConfigurationData
| where Computer contains "<MACHINENAME>"
```

### ConfigurationChange (Change Events)
Diff between two ConfigurationData snapshots.

```kql
ConfigurationChange
| where Computer contains "<MACHINENAME>"
```

## Troubleshooting Tips
- If tracked correctly, machine should have ConfigurationData results
- ConfigurationChange only appears on actual changes between snapshots
- ~20h snapshot interval, recent changes may not appear immediately
- FIM depends on MMA/OMS agent - verify agent health first
