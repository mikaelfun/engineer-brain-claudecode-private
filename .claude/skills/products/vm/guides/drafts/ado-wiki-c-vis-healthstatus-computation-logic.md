---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Center for SAP Solutions (ACSS)/TSGs/Monitoring TSGs/Monitoring VIS healthstatus computation logic and relevant mappings_ACSS"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Center%20for%20SAP%20Solutions%20%28ACSS%29%2FTSGs%2FMonitoring%20TSGs%2FMonitoring%20VIS%20healthstatus%20computation%20logic%20and%20relevant%20mappings_ACSS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VIS Health/Status Computation Logic and Relevant Mappings

## Color Code to Status/Health Mapping for SCS/App Server Instances

| State Color | Status     | Health    |
|-------------|------------|-----------|
| Green       | Running    | Healthy   |
| Yellow      | Running    | Degraded  |
| Red         | Running    | Unhealthy |
| Gray        | Unavailable| Unknown   |

## Color Code to Status Mapping for DB Instances

| State Color | Status     |
|-------------|------------|
| Green       | Running    |
| Yellow      | Unavailable|
| Red         | Unavailable|
| Gray        | Unavailable|

## VIS Health/Status Computation from SCS/App Server Instances

| App Instance | ASCS Instance | Status           | Health    | Color    |
|--------------|---------------|------------------|-----------|----------|
| Green        | Green         | Running          | Healthy   | Green    |
| Yellow       | Green         | Running          | Degraded  | Yellow   |
| Red          | Green         | Running          | Unhealthy | Red      |
| Gray         | Green         | Partially Running| Healthy   | Green    |
| Green        | Gray          | Offline          | Unknown   | Gray     |
| Red          | Gray          | Offline          | Unknown   | Gray     |
| Gray         | Gray          | Offline          | Unknown   | Gray     |
| Yellow       | Gray          | Offline          | Unknown   | Gray     |
| Green        | Yellow        | Running          | Degraded  | Yellow   |
| Yellow       | Yellow        | Running          | Degraded  | Yellow   |
| Red          | Yellow        | Running          | Unhealthy | Red      |
| Gray         | Yellow        | Partially Running| Degraded  | Yellow   |
| Green        | Red           | Running          | Unhealthy | Red      |
| Yellow       | Red           | Partially Running| Unhealthy | Red      |
| Red          | Red           | Running          | Unhealthy | Red      |
| Gray         | Red           | Running          | Unhealthy | Red      |

## Multiple App Server Scenario

In case of multiple app server architecture:

1. If more than 50% of app servers are in green, red, yellow, or gray state, their status will be considered as the status shown by the majority.
2. In case of equal number of servers showing different statuses, the less severe status is considered. Severity order: Green < Yellow < Red < Gray.

Example: 2 app servers - one "Red" and one "Gray" -> less severe "Red" is used.

## HA Scenario DB Instance Status (from DB Node Status)

- All DB nodes "Running" -> "Running"
- All DB nodes "Unavailable" -> "Unavailable"
- Else -> "Partially Running"
