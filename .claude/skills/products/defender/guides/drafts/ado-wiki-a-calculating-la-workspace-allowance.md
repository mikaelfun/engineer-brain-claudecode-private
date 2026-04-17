---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Pricing, Billing and Usage/MDC and Log Analytics workspace on Servers plan/Log Analytics Workspace 500MB allowance TSG/Calculating Log Analytics Workspace Allowance Usage"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Pricing%2C%20Billing%20and%20Usage/MDC%20and%20Log%20Analytics%20workspace%20on%20Servers%20plan/Log%20Analytics%20Workspace%20500MB%20allowance%20TSG/Calculating%20Log%20Analytics%20Workspace%20Allowance%20Usage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Calculating Log Analytics Workspace Allowance Usage

## Overview

Defender for Servers provides a 500MB/day/VM free allowance for specific security data types in the connected Log Analytics workspace. Data beyond this limit is billable.

## Key Concepts

1. **Heartbeat Events**: Logs from agents (AMA/MMA) providing VM health/status
2. **Solutions Column**: Indicates applied solutions (security, antimalware)
3. **Category Column**: Differentiates AMA vs MMA agents

## Steps to Calculate Allowance Usage

### 1. Identify Relevant Data Types

Covered data types: `SecurityAlert`, `SecurityBaseline`, `SecurityDetection`, `SecurityEvent`, `WindowsFirewall`, `ProtectionStatus`, `Update`, `UpdateSummary`, `MDCFileIntegrityMonitoringEvents`

### 2. Query Data Consumption

```kql
let Unit = 'GB';
Usage
| where IsBillable == 'TRUE'
| where DataType in ("SecurityAlert", "SecurityBaseline", "SecurityDetection", "SecurityEvent", "WindowsFirewall", "ProtectionStatus", "Update", "UpdateSummary", "MDCFileIntegrityMonitoringEvents")
| project TimeGenerated, DataType, Solution, Quantity, QuantityUnit
| summarize DataConsumedPerDataType = sum(Quantity)/1024 by DataType, DataUnit = Unit
| sort by DataConsumedPerDataType desc
```

### 3. Check AMA Agent Heartbeats

```kql
Heartbeat
| where Category == "Azure Monitor Agent"
```

Verify Solutions column is populated correctly for AMA agents.

### 4. Verify Allowance Application

Allowance should appear in cost report as free meter with quantity 0.

```kql
Heartbeat
| summarize by Computer, SubscriptionId
| summarize TotalUnits = sum(Quantity) by bin(TimeGenerated, 1d), SCAgentChannel, SecuritySolution
| sort by TimeGenerated desc, SCAgentChannel asc, SecuritySolution asc
```

### 5. Troubleshoot Missing Solutions

If VMs lack expected solutions (security, antimalware), investigate onboarding process and ensure solutions are correctly applied.

## Common Issues

| Issue | Resolution |
|---|---|
| Missing Solutions in Heartbeat | Ensure VMs onboarded with Security/AntiMalware solutions |
| Incorrect Data Ingestion | Verify data types are in predefined allowance set |
| Allowance Not Reflected | Check configuration and cost report queries |

## References

- [IcM 525703693](https://portal.microsofticm.com/imp/v5/incidents/details/525703693/summary)
- [IcM 557824708](https://portal.microsofticm.com/imp/v5/incidents/details/557824708/summary)
