---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Partner Connectors/Citrix HDX Plus/Tenant Onboard/Citrix Tenant Onboard Offboard Status Check"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Partner%20Connectors/Citrix%20HDX%20Plus/Tenant%20Onboard/Citrix%20Tenant%20Onboard%20Offboard%20Status%20Check"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Citrix Tenant Onboard/Offboard Status Check

## Overview

Customer will need to connect to Azure tenant in Citrix Cloud console before they can assign Citrix license to customers.
This page summarizes the customer experience regarding tenant onboard and offboard and provides troubleshooting guide for support team.

## Tenant Onboard Experience

All customer operations will happen inside Citrix DaaS full configuration console.
Reference: [Connect Azure Active Directory to Citrix Cloud](https://docs.citrix.com/en-us/citrix-hdxplus-w365/connect-aad-cloud.html)

Once the operation finished, an API request will be sent to the EPA service.

## Check Tenant Onboard Event

EPA service will log the Citrix tenant activities into Kusto CloudPC cluster (https://cloudpc.eastus2.kusto.windows.net).

```kql
CloudPCEvent
| where env_time > ago(30d)
| where env_cloud_environment =~ "Prod"
| where EventUniqueName == "Onboard"
| where Col1 == "Start to handle partner Citrix"
| extend onboardTime = env_time
| project onboardTime, env_cloud_name, TenantId = ContextId, ActivityId
| where TenantId contains "<Customer Azure Tenant Id>"
| sort by onboardTime desc
```

- `TenantId` will be the Id of customer Azure tenant.
- CloudPC cluster will only persist event for 30 days.
