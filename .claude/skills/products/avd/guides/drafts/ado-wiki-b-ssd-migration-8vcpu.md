---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Dependencies/Azure VM/Standard SSD to Premium SSD Migration for 8vCPU CPC"
sourceUrl: "https://dev.azure.com/Supportability/40748abc-bccb-489c-bcd1-d75a6ef1cd53/_wiki/wikis/10869040-b84f-4c69-8fc7-2c796a8fa00c?pagePath=%2FFeatures%2F%F0%9F%A4%9DDependencies%2FAzure%20VM%2FStandard%20SSD%20to%20Premium%20SSD%20Migration%20for%208vCPU%20CPC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Standard SSD to Premium SSD Migration for 8vCPU CPC

**8vCPU's** (Ent, Business, GCCH/GCC) migrating from Std SSD to Premium SSD.
Migration Start Date: 4/3/24

Migration is manual currently and can be tracked using the SSD Migration Breakdown Excel sheet (see wiki attachment).

Premium SSD migration will take place in multiple rounds over the next 5-6 months. We will be targeting inactive CPCs first and then move to active CPCs where migration is triggered through user-initiated reboot. Snapshot will be taken for all CPCs right before migration. In the rare case that a failure occurs, the CPC may be unavailable for 1-2 hours.

## Safety measures

1. Azure storage team doesn't expect any such failures to happen during migration. At all times, we will adhere to Azure Storage recommended throttling limits.
2. Already tested rigorously in PPE and other env with no issues.
3. Migration plan targets all inactive CPCs first. Assuming one of the inactive CPC fails migration, it will be restored within a couple of hours. We also check for user presence and abort migration if they are present.
4. Even with active CPCs, we will first target business and non-critical customers. Only when 100% confident will we move to Enterprise customers.

## Failure handling

If a single occurrence of Azure Disk Change API failure occurs:
1. Monitors will create a Sev 2/3 notifying the team
2. Stop all remaining migrations in the queue and new migrations not yet queued
3. Troubleshoot to see if restore is needed or is it an Azure API error not impacting customer
4. If restore is needed, involve the connectivity/restore teams to proceed with restore from just-in-time snapshot
5. Confirm the issue is resolved

**ICM Team name: Cloud PC Hosting - Frontline, 1P**

## KQL: Check DiskUpgrade status

```kql
let env = 'PROD';
let envTime = ago(30d);
let CloudPCEvent = () {
    cluster("cloudpc.eastus2").database("CloudPC").table("CloudPCEvent")
    | union isfuzzy=true cluster("cloudpc.eastus2").database("CloudPCProd").table("CloudPCEvent")
    | union isfuzzy=true cluster("cloudpc.eastus2").database("CloudPC").table("OTelCloudPCEvent")
    | union isfuzzy=true cluster("cloudpc.eastus2").database("CloudPCProd").table("OTelCloudPCEvent")
    | union isfuzzy=true cluster("cloudpcneu.northeurope").database("CloudPCProd").table('CloudPCEvent')
    | union isfuzzy=true cluster("cloudpcneu.northeurope").database("CloudPCProd").table('OTelCloudPCEvent')
};
CloudPCEvent()
| where env_cloud_environment == env
| where env_time > envTime
| where ApplicationName == 'cogssvc' and ComponentName == 'EventGridService' and Col1 startswith 'Success to publish '
| extend jsonString = replace_string(replace_regex(Col1, @'Success to publish [a-zA-Z]+ event with payload: ', ''), '}.', '}')
| extend json = parse_json(jsonString)
| extend WorkflowExecutionStatus = tostring(json.Payload.WorkflowExecutionStatus)
| extend CloudPcId = toguid(json.Payload.ResourceId)
| extend WorkflowId = toguid(json.Payload.WorkflowInstanceId)
| extend WorkflowName = tostring(json.Payload.WorkflowName)
| extend HasWorkflowEnded = tobool(json.Payload.HasWorkflowEnded)
| extend ActivityName = tostring(json.Payload.ActivityName)
| where HasWorkflowEnded == true and WorkflowName contains 'DiskUpgrade'
// | where CloudPcId in () // provide the list of CloudPcIds here
| project env_time, CloudPcId, WorkflowId, WorkflowName, ActivityName, WorkflowExecutionStatus, env_cloud_name
```

## KQL: Get DiskUpgrade WFs with failure

```kql
CloudPCEvent
| where env_time > ago(7d)
| where env_cloud_environment == 'PROD'
| where ApplicationName == 'cogssvc'
| where * contains 'DiskUpgrade failed for'
| project env_time, env_cloud_name, env_cloud_environment, ApplicationName, BuildVersion, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, DeviceId, OtherIdentifiers, ActivityId
| order by env_time desc
| take 100
```

## KQL: Drill down by WorkflowId

```kql
CloudPCEvent
| where * contains "<WorkflowId>"
| where ApplicationName == 'cogssvc'
| project env_time, env_cloud_name, env_cloud_environment, ApplicationName, BuildVersion, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, DeviceId, OtherIdentifiers, ActivityId
| order by env_time desc
```
