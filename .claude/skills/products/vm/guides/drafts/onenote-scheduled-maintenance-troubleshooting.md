# Azure Scheduled Maintenance Troubleshooting Guide

> Source: OneNote - VM - Azure Scheduled Maintenance
> Quality: guide-draft (pending SYNTHESIZE review)

## Key Rules

1. **CSS does NOT handle customer requests** to freeze High Risk Workload scheduled maintenance
2. For other planned maintenance, generally **do not recommend postponing** (additional unforeseen risks)

## High Risk Workload (HRW) Process

- URL: https://aka.ms/AzHRW
- CSAM nominates sensitive workloads to:
  - Opt-out Live Migration (LM)
  - Opt-out Tardigrade
  - Opt-out HostOS updates (VMPhu)
  - Subscribe advanced notifications for TOR maintenance
- If active impact on HRW workload: raise ICM 2 to **WASU**

## Hardware Decommissioning

- Raise ICM to **Decom Dev Team**: https://aka.ms/CRI-HardwareDecom
- Wiki: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496013/Hardware-Decommissioning_Planned-Maint

## Key Concepts

| Term | Description |
|------|-------------|
| Tracking ID | Incident ID of the maintenance (e.g., `1_SB-RW0`) |
| SN | CXP service notification |
| ICM | PG team tracks maintenance events by ICM |
| Azure RT CLSTS | "V-" team for TOR update and isolation only; do NOT raise planned maintenance ICM to them |

## Troubleshooting Steps

1. **Check ASC VM health events** - look for migration trigger type indicating scheduled maintenance
2. **Query Kusto** (azurecm cluster):
   ```kql
   ScheduledMaintenanceInformational
   | where PreciseTimeStamp > ago(7d)
   | where message contains "<VMName>"
   | project PreciseTimeStamp, Tenant, scheduledMaintenanceId, message
   ```
3. **Cross-reference maintenanceId in ICM** for maintenance details
4. **Verify node status** if impacted node not found in notification ICM:
   ```kql
   LogNodeSnapshot
   | where nodeId == "<nodeId>"
   | where TIMESTAMP > ago(30d)
   | project TIMESTAMP, nodeId, nodeState, nodeAvailabilityState, containerCount, faultInfo
   ```
   - Confirm node was not "Unallocatable" when ICM was created

## Mooncake Maintenance Window Config

- Config file: `ScheduledMaintenanceWindows.Mooncake.xml` in OneDCMT repo

## Related References

- Planned Maintenance TSG: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496026/Basic-Workflow_Planned-Maint
- Service Healing: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1666466/Service-Healing_How-It-Works
- VM Service Healed After No Action: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1666480/VM-Service-Healed-for-Planned-Maint-After-No-Action-Taken_Planned-Maint
