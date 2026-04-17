---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/Support Tools/Kusto Queries/Windows 365 | Cloud PC/Windows 365 FrontLine Dedicated and Frontline Shared/Windows 365 Frontline Shared: Autopilot V2 Device Preparation DPP Successful Event"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FTools%20and%20Data%20Collection%2FSupport%20Tools%2FKusto%20Queries%2FWindows%20365%20%7C%20Cloud%20PC%2FWindows%20365%20FrontLine%20Dedicated%20and%20Frontline%20Shared%2FWindows%20365%20Frontline%20Shared%3A%20Autopilot%20V2%20Device%20Preparation%20DPP%20Successful%20Event"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Successful provisioning with DPP - Kusto Trace Guide

## Step 1: Get the Workload ID using the CPC Name

```kql
let ServiceEvent = cluster('https://cdp-gds-eudb-int.northeurope.kusto.windows.net').database('cdp-gds-eudb-int').ServiceEvent
| union cluster('https://cdp-gds-global-int.eastus.kusto.windows.net').database('cdp-gds-global-int').ServiceEvent
| union cluster('https://cdp-gds-global-preprod.eastus.kusto.windows.net').database('cdp-gds-global-preprod').ServiceEvent
| union cluster('https://cdp-gds-eudb-preprod.northeurope.kusto.windows.net').database('cdp-gds-eudb-preprod').ServiceEvent
| union cluster('https://cdp-gds-global-prod.eastus.kusto.windows.net').database('cdp-gds-global-prod').ServiceEvent
| union cluster('https://cdp-gds-eudb-prod.northeurope.kusto.windows.net').database('cdp-gds-eudb-prod').ServiceEvent;
ServiceEvent
| where env_time > ago(3h)
| where Tags contains "<CPC Name>"
| project TIMESTAMP, Operation, Tags, WorkflowId
| order by TIMESTAMP desc
| limit 6000
```

## Step 2: Using the Workflow ID, lookup the final message

```kql
let ServiceEvent = cluster('https://cdp-gds-eudb-int.northeurope.kusto.windows.net').database('cdp-gds-eudb-int').ServiceEvent
| union cluster('https://cdp-gds-global-int.eastus.kusto.windows.net').database('cdp-gds-global-int').ServiceEvent
| union cluster('https://cdp-gds-global-preprod.eastus.kusto.windows.net').database('cdp-gds-global-preprod').ServiceEvent
| union cluster('https://cdp-gds-eudb-preprod.northeurope.kusto.windows.net').database('cdp-gds-eudb-preprod').ServiceEvent
| union cluster('https://cdp-gds-global-prod.eastus.kusto.windows.net').database('cdp-gds-global-prod').ServiceEvent
| union cluster('https://cdp-gds-eudb-prod.northeurope.kusto.windows.net').database('cdp-gds-eudb-prod').ServiceEvent;
ServiceEvent
| where env_time > ago(3h)
| where WorkflowId == "<WORKFLOW ID>"
| where ServiceName == "identityrm"
| project TIMESTAMP, env_time, ServiceName, LatencyMilliseconds, Tags, EventIdName, StatusCode, Operation, Classification, WorkflowId, Exception, env_ex_type, env_ex_msg
| order by TIMESTAMP desc
```

## Step 3: Use RDInfraTrace for complete DPP provisioning flow

```kql
let startTime = ago(3h);
let endTime = now();
let caredCatergories = dynamic(["RDAgent.DPPProvisioningService.DPPProvisioningService","Microsoft.RDInfra.RDAgent.SidecarOrchestratorClient.OrchestratorClient","Microsoft.RDInfra.RDAgent.SidecarOrchestratorClient.AutopilotHelper"]);
cluster('rdsprodus.eastus2').database('WVD').RDInfraTrace
| union cluster('rdsprod.eastus2').database('WVD').RDInfraTrace
| union cluster('rdsprodeu.westeurope').database('WVD').RDInfraTrace
| union cluster('rdsprodjp.japaneast').database('WVD').RDInfraTrace
| union cluster('rdsprodgb.uksouth').database('WVD').RDInfraTrace
| union cluster('rdsprodau.australiaeast').database('WVD').RDInfraTrace
| union cluster('rdsprodin.centralindia').database('WVD').RDInfraTrace
| where TIMESTAMP >= ago(3h)
| where Slot == "RDAgent"
| where Category in (caredCatergories)
| where HostInstance contains "<CPC NAME>"
| order by PreciseTimeStamp desc
| limit 1000
```

## Step 4: Intune Kusto queries for DPP validation

### Get Activity ID from enrollment attempt (using Intune Device ID):
```kql
IntuneEvent
| where env_time > ago(1d)
| where SourceNamespace == "IntunePE"
| where FunctionName == "SaveClientIdentity"
| where DeviceId == "<INTUNE Device ID>"
| project ActivityId, env_time
```

### Check DPP enrollment details using Activity ID:
```kql
IntuneEvent
| where env_time > ago(1d)
| where SourceNamespace == "IntunePE"
| where ActivityId == "<ACTIVITY_ID>"
| where ComponentName == "AutopilotV2EnrollmentHelper"
| project env_time, ActivityId, BuildVersion, FunctionName, ComponentName, TraceLevel, LineNumber, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Message
| order by env_time desc
```

**Key validation**: The Device Preparation Profile ID in Col1 must match the profile ID assigned in the Frontline Shared provisioning policy in Intune.

Check in Intune → Enrollments → Monitor → Windows Autopilot device preparation deployments for the CPC entry, which shows Profile Name and Apps/Scripts install status.
