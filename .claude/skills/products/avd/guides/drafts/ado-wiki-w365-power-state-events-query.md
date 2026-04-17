---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/Support Tools/Kusto Queries/Windows 365 | Cloud PC/Get power state events"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FTools%20and%20Data%20Collection%2FSupport%20Tools%2FKusto%20Queries%2FWindows%20365%20%7C%20Cloud%20PC%2FGet%20power%20state%20events"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Get Power State Events (Kusto Query)

## Purpose
Check PowerOn/PowerOff actions and reasons for Cloud PC.

## Query
```kql
let CheckPowerActions = (CompanyID:string, Day1:timespan, Day2:timespan)
{
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_cloud_environment == "PROD"
| where Day1 > Day2
| where env_time between (ago(Day1)..ago(Day2))
| where ComponentName != 'Instrumentation'
| where ComponentName != "MetricsMiddleware"
| where * has CompanyID and Col1 !has "Device not Onboarded"
| where ApplicationName has_any ("prov-function","SchdlrFunction", "schdlr", "RMFunction")
| where ServiceName != "HermesService"
| where Col1 contains "CloudPCPowerStatusChanged"
| parse kind = regex flags = Ui Col1 with * "\\"resourceID\\":" WorkspaceID ',' *
| parse kind = regex flags = Ui Col1 with * "\\"Action\\":" Action ',' *
| parse kind = regex flags = Ui Col1 with * "\\"Reason\\":" Reason ',' *
| where WorkspaceID contains "<WorkspaceID>"
| project env_time, ActivityId, ComponentName, EventUniqueName, Action, Reason, WorkspaceID, Col1, OtherIdentifiers
| order by env_time desc
};
CheckPowerActions('<TenantID>', 15d, 0d)
```

## Usage
- Replace `<WorkspaceID>` with target Cloud PC workspace ID
- Replace `<TenantID>` with customer tenant ID
- Adjust timespan parameters as needed
