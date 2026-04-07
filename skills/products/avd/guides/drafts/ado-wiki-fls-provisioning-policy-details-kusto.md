---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/Support Tools/Kusto Queries/Windows 365 | Cloud PC/Windows 365 FrontLine Dedicated and Frontline Shared/Windows 365 Frontline Shared: View Provisioning policy details"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FTools%20and%20Data%20Collection%2FSupport%20Tools%2FKusto%20Queries%2FWindows%20365%20%7C%20Cloud%20PC%2FWindows%20365%20FrontLine%20Dedicated%20and%20Frontline%20Shared%2FWindows%20365%20Frontline%20Shared%3A%20View%20Provisioning%20policy%20details"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Viewing FLS Provisioning Policy Details

Because of different data ingestion methods, the provisioning policy for Frontline Shared can be viewed in two ways:

## Kusto Query 1: Standard Policy Details (from aka.ms/cpcd)

Requires provisioning policy ID.

```kql
let PolicyID = '<PROV Policy ID>';
let _endTime = now();
let _startTime = ago(7d);
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_cloud_environment == "PROD"
| where env_time >= _startTime and env_time < _endTime
| where Col1 contains "Got provisioning policy:" and Col1 contains PolicyID and Col1 contains "EnableSingleSignOn"
| parse kind=regex flags=Ui Col1 with * "Got provisioning policy: {\"Id\":\"" ProvPolicyID '\",' *
| parse kind=regex flags=Ui Col1 with * "\"EnableSingleSignOn\":" SSOState ',' *
| parse kind=regex flags=Ui Col1 with * "\"ImageId\":" CustomImageID ',' *
| parse kind=regex flags=Ui Col1 with * "\"ImageType\":" OSImageType ',' *
| parse kind=regex flags=Ui Col1 with * "\"OnPremisesConnectionId\":" ANCID '}],' *
| parse kind=regex flags=Ui Col1 with * "\"domainJoinType\":" JoinType ',' *
| parse kind=regex flags=Ui Col1 with * "\"locale\":" CustomLP '},' *
| parse kind=regex flags=Ui Col1 with * "\"ProvisioningType\":" LicenseType ',' *
| parse kind=regex flags=Ui Col1 with * "\"CloudPcNamingTemplate\":" NamingTemplate ',' *
| parse kind=regex flags=Ui Col1 with * "\"regionName\":" RegionName ',' *
| parse kind=regex flags=Ui Col1 with * "\"regionGroup\":" RegionGroup '}],' *
| extend LicenseType = iif(LicenseType has "\"dedicated\"", "Enterprise", "FrontLine")
| extend OSImageType = iif(OSImageType has "0", "Gallery", "Custom")
| extend RegionName = iif(isempty(RegionName), "Check VNET Region", RegionName)
| extend RegionGroup = iif(isempty(RegionGroup), "Check VNET Region", RegionGroup)
| extend ANCID = iif(isempty(ANCID), "MSHosted", ANCID)
| project env_time, ProvPolicyID, SSOState, CustomImageID, OSImageType, ANCID, JoinType, CustomLP, LicenseType, NamingTemplate, RegionName, RegionGroup, Col1, ActivityId
| order by env_time desc
```

**Note**: For Frontline Shared, Col1 will show additional APv2 Device Preparation entries if configured.

## Kusto Query 2: Scheduled Reprovisioning Configuration

Shows the Scheduled Reprovisioning configuration when set or modified (visible within 30 days of change).

```kql
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_cloud_environment == "PROD"
| where env_time between (ago(30d)..now())
| where Col1 contains "<PROV Policy ID>"
| where Col1 contains "Enter SchedulePolicyApplyTask"
| parse Col1 with * ", policy id: " ProvPolicyID ',' *
| parse Col1 with * "\"reservePercentage\":" ReservedPercentage ',' *
| parse kind=regex flags=Ui Col1 with * "\"cronScheduleExpression\": \"" CRONSchedule '\"' *
| extend CRON = CRONSchedule
| project env_time, ActivityId, ProvPolicyID, ReservedPercentage, CRON
```

The CRON expression defines when scheduled reprovisioning occurs (e.g., "At 2:00 On every Monday every month").
