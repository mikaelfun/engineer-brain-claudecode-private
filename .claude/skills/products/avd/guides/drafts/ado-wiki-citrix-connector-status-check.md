---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Partner Connectors/Citrix HDX Plus/Tenant Onboard/Citrix Connector Status Check"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Partner%20Connectors/Citrix%20HDX%20Plus/Tenant%20Onboard/Citrix%20Connector%20Status%20Check"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Citrix Connector Status Check

## Overview

Customer will need to enable Citrix Cloud Connector in Microsoft Endpoint Manager before they can connect Azure Active Directory to Citrix Cloud.

## Enable the Citrix Connector for Windows 365

All customer operations happen inside Microsoft Endpoint Manager (https://endpoint.microsoft.com/).

Reference: [Enable the Citrix Connector for Windows 365](https://docs.citrix.com/en-us/citrix-hdxplus-w365/enable-citrix-connector.html)

## Check Cloud Connector Event

EPA service logs the Citrix Cloud connector activities into Kusto CloudPC cluster.

```kql
CloudPCEvent
| where env_time > ago(30d)
| where env_cloud_environment =~ "Prod"
| where ComponentName == "UpdateExternalPartnerSettingAsync" or ComponentName == "CreateExternalPartnerSettingAsync"
| where EventUniqueName == "UpdateExternalPartnerSetting" or EventUniqueName == "CreateExternalPartnerSetting"
| extend OperationTime = env_time
| project OperationTime, env_cloud_name, TenantId = AccountId, EnableConnector = Col2
| where TenantId contains "<Customer Azure Tenant Id>"
| sort by OperationTime desc
```

- `TenantId` = customer Azure tenant Id
- CloudPC cluster retains events for 30 days only
