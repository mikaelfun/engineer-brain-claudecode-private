---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Useful KQL Queries/Internal Engineer Queries (Azure Data Explorer, Jarvis, Kusto Explorer)/List Details of a Maintenance Configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FUseful%20KQL%20Queries%2FInternal%20Engineer%20Queries%20(Azure%20Data%20Explorer%2C%20Jarvis%2C%20Kusto%20Explorer)%2FList%20Details%20of%20a%20Maintenance%20Configuration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# List Details of a Maintenance Configuration

Azure Resource Graph query to retrieve full details of a Maintenance Configuration resource.

## Basic query (full MC details)

```kql
where type == "microsoft.maintenance/maintenanceconfigurations"
| where name == "< Name of MC >"
```

This returns all fields including: id, name, type, tenantId, location, resourceGroup, subscriptionId, properties, tags.

## Properties detail query

```kql
where type == "microsoft.maintenance/maintenanceconfigurations"
| where name == "< Name of MC >"
| project properties
```

Returns the `properties` object which includes:
- **maintenanceWindow**: timeZone, duration, startDateTime, recurEvery
- **extensionProperties**: inGuestPatchMode
- **configurationType**: e.g. "Regular"
- **maintenanceScope**: e.g. "InGuestPatch"
- **visibility**: e.g. "Custom"
- **installPatches**: rebootSetting, windowsParameters (classificationsToInclude), linuxParameters (classificationsToInclude)

## Example properties output

```json
{
  "maintenanceWindow": {
    "timeZone": "India Standard Time",
    "duration": "02:00",
    "startDateTime": "2023-05-13T07:00:00Z",
    "recurEvery": "1Day"
  },
  "extensionProperties": {"inGuestPatchMode": "User"},
  "configurationType": "Regular",
  "maintenanceScope": "InGuestPatch",
  "visibility": "Custom",
  "installPatches": {
    "rebootSetting": "IfRequired",
    "windowsParameters": {"classificationsToInclude": ["Critical", "Security"]},
    "linuxParameters": {"classificationsToInclude": ["Critical", "Security"]}
  }
}
```
