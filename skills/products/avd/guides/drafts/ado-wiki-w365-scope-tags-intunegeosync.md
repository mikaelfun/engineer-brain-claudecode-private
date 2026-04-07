---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/WCX Specific Content/Windows 365 Scope Tags"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FWCX%20Specific%20Content%2FWindows%20365%20Scope%20Tags"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows 365 Scope Tags — IntuneGeoSync Service

> ⚠️ This information is primarily for WCX PMs and SaaF teams. Steps may not apply to CSS directly.

## Overview

The IntuneGeoSync service cooperates with the Intune partner sync feature for scope tag data. Before receiving data from Intune, W365 needs to be onboarded as a partner to Intune's data pipeline. The service operates in a geo manner (NA, EU, AP, AU).

### Code Repo
[W365-Svc-IntuneGeoSync](https://microsoft.visualstudio.com/CMD/_git/W365-Svc-IntuneGeoSync)

### Engineering TSG
https://eng.ms/docs/experiences-devices/wd-windows/wcx/cloud-pc/cloudpc-service/intunegeosync-service/tsgs/tsg

### Dashboards
- [Infra Grafana - Health Indicator Service](https://win365infra-f9btdrbeddd0b0au.eus.grafana.azure.com/d/0t8Pbr5Vk/health-indicator-service?orgId=1&var-alias=is&var-environment=INT&var-scaleunit=INT01&var-serviceType=Enterprise)
- [IntuneGeoSync Dashboard (Geneva)](https://portal.microsoftgeneva.com/dashboard/CloudPCCore/Services/IntuneGeoSync)

### ICM Format
1. Monitor name is in title
2. Useful dashboards are in Discussion part (also related Kusto query)
3. TSG link is in Diagnostics part
4. Impacted environment and scale unit in Impacted Resource part

## Kusto — ScopeTag Sync Check

```kql
//ScopeTag Sync Check
let CheckScopeTags = (CompanyID:string, Day1:timespan, Day2:timespan)
{
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_cloud_environment == "PROD"
| where env_time between (ago(2d)..ago(0d))
| where ComponentName != 'Instrumentation'
| where ComponentName != "MetricsMiddleware"
| where AccountId has CompanyID and Col1 !has "Device not Onboarded"
| where ApplicationName in ("is","cds")
| where ServiceName != "HermesService"
| where (OtherIdentifiers contains "ScopeTag" or Col1 contains "ScopeTag") and OtherIdentifiers !contains "frontLineShared"
| parse kind = regex flags = Ui OtherIdentifiers with * ",\"DeviceId\":\"" IntuneDeviceID '\",' *
| parse kind = regex flags = Ui OtherIdentifiers with * ",\"ScopeTagsToAddPaddedAndSerializedList\":\"" AddedScopeTagID '\",' *
| extend IntuneDeviceID2=strcat("Intune Device ID:", " ", IntuneDeviceID)
| extend AddedScopeTagID2=strcat(",Added Scopetag ID:", " ", AddedScopeTagID)
| extend AddedScopeTagInfo=strcat(iif(isempty(IntuneDeviceID),"",IntuneDeviceID2)," ",iif(isempty(AddedScopeTagID),"",AddedScopeTagID2))
| project env_time, ActivityId, ApplicationName, AddedScopeTagInfo, OtherIdentifiers
| order by env_time desc
};
CheckScopeTags('TENANTID',1h,0h) //Replace TENANTID
```

### Contacts
- Intune QueryBroker: Anderson Kulandaisamy, Glaeser Chan (under Syam Pinnaka), Himanshi Shrivastava, Divya Patidar (under Kapil Raja Durga)
