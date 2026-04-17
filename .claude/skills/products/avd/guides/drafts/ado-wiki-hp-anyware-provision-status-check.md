---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Partner Connectors/HP Anyware/Provisioning/HP Anyware Provision Status Check"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FPartner%20Connectors%2FHP%20Anyware%2FProvisioning%2FHP%20Anyware%20Provision%20Status%20Check"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview
The major difference from regular Cloud PC and 3rd party integrated Cloud PC is that connectivity will be established by 3rd party agent instead of AVD RD agent. And a 3rd party license will be assigned to customer as well as Cloud PC license.

For HP scenario:
- If the HP license is present at provisioning time, Windows 365 will install the HP Anyware agent after provisioning.
- If the HP license is enabled on an existing Cloud PC, Windows 365 will install the HP agent via post-provisioning.

# Overall Provisioning Workflow
There will be 7 steps in the provisioning process.
- **[HP]** User is licensed in the HP cloud portal
- **[HP]** UserId + LicenseState + Token sent to W365
- **[W365]** UserId + LicenseSate + Token stored in W365 until TTL expires
- **[W365]** Provisioning/post-provisioning executes HP agent install
- **[W365]** HP agent installed using JWT token
- **[HP]** HP agent registers into HP service using JWT token
- **[HP]** CPC registered and available in HP cloud portal

From the workflow, we can see the main responsibilities from W365 is to install HP agent.

# HP Agent Installation Flow

EPM(External Partner Management) service will be responsible to send HP agent installation event to CMD Agent via DeviceGateway service and monitor the lifecycle of HP agent installation.

# Troubleshooting HP Agent License Assignment Issue

1. How to know if HP's license request has been operated completely? If it failed in some step?

You can query the detail by **userId** or **cloudPcId**. And then troubleshoot by time and operation.

```kql
// Query by user id
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName == "epm"
| where UserId == "<userId>"
| where env_time between (datetime(<start>) .. datetime(<end>))
| order by env_time desc
| project env_time, BuildVersion, env_cloud_name, env_cloud_roleVer, AccountId, ApplicationName, ComponentName, EventUniqueName, ActivityId, RelatedActivityId, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, UserId, PayLoadId, OtherIdentifiers, DeviceId
```

```kql
// Query by Cloud PC id
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName == "epm"
| where OtherIdentifiers contains "<cloudPcId>"
| where env_time between (datetime(<start>) .. datetime(<end>))
| order by env_time desc
| project env_time, env_cloud_name, env_cloud_roleVer, AccountId, ApplicationName, ComponentName, EventUniqueName, ActivityId, RelatedActivityId, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, UserId, PayLoadId, OtherIdentifiers
```

2. How to know if user has received a assignment for HP license

```kql
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where EventUniqueName == "ReceivedPartnerUserMessage"
| where ApplicationName == "epa"
| where UserId == "<userId>"
| where PayLoadId == "33391b76-c73e-481e-942a-dc97e887cb0b" // HP PayloadId
| sort by env_time desc
| where env_time between (datetime(<start>) .. datetime(<end>))
| project env_time, UserId, Col1
```

# Troubleshooting HP Agent Installation Issue

When a user has issue about the HP agent (un|re)installation failure:

1. Get the **message Id** from "Col1":
```kql
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where EventUniqueName == "PartnerDataUploadMessageRecordedAndQueued"
| where ApplicationName == "epa"
| where PayLoadId == "33391b76-c73e-481e-942a-dc97e887cb0b" // HP PayloadId
| where env_time between (datetime(<start>) .. datetime(<end>))
| sort by env_time desc
| project ColMetadata, Col1, Col2, AccountId
```

2. Check if the message had been processed successfully:
```kql
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName == "epa"
| where Col1 == "<messageId>"
| project env_time, AccountId, UserId, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```

3. Query the operation detail by userId, get the **action Id** from "Col1":
```kql
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName == "epm"
| where AccountId == "<tenantId>"
| where PayLoadId == "33391b76-c73e-481e-942a-dc97e887cb0b" // HP PayloadId
| where UserId == "<userId>"
| where env_time between (datetime(<start>) .. datetime(<end>))
| sort by env_time desc
| project env_time, AccountId, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```

4. Query if the operation executed successfully:
```kql
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName == "epm"
| where ComponentName != "ExternalPartnerActionEntityTransformer"
| where Col1 == "<actionId>"
| where env_time > ago(30d)
| sort by env_time asc
| project env_time, ComponentName, EventUniqueName, AccountId, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, env_cloud_name, ActivityId, UserId
```
