---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/Support Tools/Kusto Queries/Windows 365 | Cloud PC/Windows 365 FrontLine Dedicated and Frontline Shared/Windows 365 Frontline Shared: Autopilot V2 Device Preparation DPP Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Tools%20and%20Data%20Collection/Support%20Tools/Kusto%20Queries/Windows%20365%20%7C%20Cloud%20PC/Windows%20365%20FrontLine%20Dedicated%20and%20Frontline%20Shared/Windows%20365%20Frontline%20Shared%3A%20Autopilot%20V2%20Device%20Preparation%20DPP%20Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# W365 Frontline Shared: Autopilot V2 DPP Troubleshooting

## Scenario 1: DPP Profile Not Assigned - FLS CPC Provisioned with Warnings

### Prerequisites Check
1. Is the Device Preparation Profile created as **Automatic (Preview)** and assigned to the device group?
   - Reference: https://learn.microsoft.com/en-us/autopilot/device-preparation/tutorial/automatic/automatic-workflow
2. Is the device group Owner set to **Intune Provisioning Client** (AppId: `f1346770-5b25-470b-88bd-d5744ab7952c`)?
   - In some tenants the SP name may be "Intune Autopilot ConfidentialClient" - verify by AppID
   - If missing, add it: https://learn.microsoft.com/en-us/autopilot/device-preparation/tutorial/user-driven/entra-join-device-group#adding-the-intune-provisioning-client-service-principal
3. Is the DPP profile added in the Frontline Shared provisioning policy?

### Diagnostic Steps

#### Step 1: Check Provisioning Message (Get WorkflowID)
```kusto
let ServiceEvent = cluster('https://cdp-gds-eudb-int.northeurope.kusto.windows.net').database('cdp-gds-eudb-int').ServiceEvent
| union cluster('https://cdp-gds-global-int.eastus.kusto.windows.net').database('cdp-gds-global-int').ServiceEvent
| union cluster('https://cdp-gds-global-preprod.eastus.kusto.windows.net').database('cdp-gds-global-preprod').ServiceEvent
| union cluster('https://cdp-gds-eudb-preprod.northeurope.kusto.windows.net').database('cdp-gds-eudb-preprod').ServiceEvent
| union cluster('https://cdp-gds-global-prod.eastus.kusto.windows.net').database('cdp-gds-global-prod').ServiceEvent
| union cluster('https://cdp-gds-eudb-prod.northeurope.kusto.windows.net').database('cdp-gds-eudb-prod').ServiceEvent;
ServiceEvent
| where env_time > ago(2h)
| where Tags contains "<DEVICE Name>"
| project TIMESTAMP, Operation, Tags, WorkflowId
| order by TIMESTAMP desc
| limit 6000
```

#### Step 2: Check Autopilot V2 Errors with WorkflowID
```kusto
-- Same ServiceEvent union as above --
ServiceEvent
| where env_time > ago(1d)
| where WorkflowId == "<WORKFLOW ID>"
| where ServiceName == "identityrm"
| project TIMESTAMP, env_time, ServiceName, LatencyMilliseconds, Tags, EventIdName, StatusCode, Operation, Classification, WorkflowId, Exception, env_ex_type, env_ex_msg
| order by TIMESTAMP desc
```

**Expected Error:** `DPP is not enabled for this machine. Error Code: DppNotEnabled`

#### Step 3: Validate Intune DPP Profile Assignment
```kusto
-- Get ActivityID --
IntuneEvent
| where env_time > ago(1d)
| where SourceNamespace == "IntunePE"
| where FunctionName == "SaveClientIdentity"
| where DeviceId == "<INTUNE Device ID>"
| project ActivityId, env_time

-- Check DPP response --
IntuneEvent
| where env_time > ago(1d)
| where SourceNamespace == "IntunePE"
| where ActivityId == "<Activity ID>"
| where ComponentName == "AutopilotV2EnrollmentHelper"
| project env_time, ActivityId, BuildVersion, FunctionName, ComponentName, TraceLevel, LineNumber, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Message
| order by env_time desc
```

**Expected Error in Col1:** `Not trying to update device lookup result either because the authority is not Intune or because a device preparation profile is not assigned`

### Resolution
If configuration from CPC side looks correct, **engage Intune Collab** for service-side DPP profile assignment issues.
