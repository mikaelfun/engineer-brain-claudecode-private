# Adaptive Application Control (AAC) Troubleshooting Guide

> Source: OneNote - Mooncake POD Support Notebook / Microsoft Defender for Cloud / Defender for Servers / adaptive application control

## Overview

AAC relies on AppLocker (Windows) and LinuxAuditD (Linux) events via OMS agent.

## Prerequisites Check

1. Verify machines in AAC list (reported events in last day)
2. If NOT in list:
   - Standard tier required
   - AppLocker configured (Windows)
   - Linux machines meet criteria
   - OMS agent reporting correctly

## Kusto Diagnostics (romelogsmc / Rome3Prod)

**AAC Security Alerts:**
```kql
AppWhitelistingVmsIngestion
| where SubscriptionId == "<sub-id>"
| where ResourceId contains "<vm-resource-id>"
```

**AAC Recommendations:**
```kql
AppWhitelistingConfigurationsIngestion
| where SubscriptionId == "<sub-id>"
| where VmRecommendations contains "<vm-resource-id>"
```

**AAC Group Status:**
```kql
AppWhitelistingGroupsIngestion
| where SubscriptionId == "<sub-id>"
```

**Group Request Traces:**
```kql
TraceEvent
| where env_time > ago(1d)
| where env_cloud_name == "Rome.R3.AppWhitelistingRP"
| where message has "PutGroupDataAsync"
| order by env_time asc
| project env_time, message, env_cv
```

## Common Issues
- **Group not stable**: VMs run inconsistent applications
- **Group stuck in creation**: Check AppWhitelistingGroupsIngestion
- **VMs not discovered**: Verify Standard tier + OMS + AppLocker
