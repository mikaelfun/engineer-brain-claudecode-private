---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Partner Connectors/Citrix HDX Plus/Provisioning/Citrix License Status Check"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Partner%20Connectors/Citrix%20HDX%20Plus/Provisioning/Citrix%20License%20Status%20Check"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Citrix HDX Plus License Status Check

## Overview

Customer will have both Citrix tenant **and** Azure tenant in Citrix HDX Plus scenario. Both Citrix license **and** Windows365 license are needed.

## Windows365 License

### Customer Experience
Citrix HDX Plus feature only supports customers with **Windows365 Enterprise** license.
Customer administrators can follow the guidance [here](https://learn.microsoft.com/en-ca/windows-365/enterprise/assign-licenses) to assign licenses.

### License Check for Support Team
Support team can check Windows365 license status in [RAVE](https://rave.office.net/). Same process as general Windows365 license check.

## Citrix License

### Customer Experience
Detailed guidance in Citrix documentation: [Assign Citrix Licenses to Users](https://docs.citrix.com/en-us/citrix-hdxplus-w365/assign-licenses.html)

### License Check for Support Team
Citrix sends API request to Windows 365 EPA service that the selected users are entitled to use Citrix. EPA service logs Citrix tenant activities into [Kusto CloudPC cluster](https://cloudpc.eastus2.kusto.windows.net).

```kql
union cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPC').CloudPCEvent,
      cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_time > ago(3d)
| where env_cloud_environment =~ "Prod"
| where ComponentName == "UserClient"
| where * == "{UserID}" // UserID
| where AccountId contains "{TenantID}" // TID
| extend LicenseActionType = case(
    Col1 == "0", "Assign",
    Col1 == "1", "Unassign",
    Col1 == "2", "Refresh",
    "Unknown"
)
| project AssignTime = env_time, ActivityId, AccountId, UserId, LicenseActionType, Message = Col2
```

### License State Matrix
| Value | State |
|-------|-------|
| 0 | Assign |
| 1 | Unassign |
| 2 | Refresh / Unknown |

> **Note:** CloudPC cluster only persists events for 30 days.
