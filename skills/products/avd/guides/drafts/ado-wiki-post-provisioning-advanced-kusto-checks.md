---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Provisioning/Post Provisioning advanced kusto checks"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Provisioning/Post%20Provisioning%20advanced%20kusto%20checks"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Post Provisioning Advanced Kusto Checks

## Common Errors (CSS - do not raise an ICM or ping devs directly)

| Error Code | Error Message | Impact | Action | Comments | Root Cause | Execution Flow |
| --- | --- | --- | --- | --- | --- | --- |
| PartialFailure | Failed to Install language by PowerShell Module. Language pack or features could only be partially installed. ErrorCode: -2145123272. | 1 step failed. Provisioning will run into "Provisioned with warning" status | known issue. Reprovision may help. | This error code is only for step: WindowsLocalization | HAADJ policy block components on device. | VmExtension |
| PluginInternalError | Check error message in StepResults column. | 1 or more step failed when CMD agent plugin execute scripts. Provisioning will run into "Provisioned with warning" status | known issue. Reprovision may help. | Plugin execution path runs well. | | CMD Agent |
| RunVmExtensionScriptError | Failed to Install language by PowerShell Module. Failed to install language. ErrorCode: -2147418113. | 1 or more step failed when run powershell scripts. Provisioning will run into "Provisioned with warning" status | known issue. Reprovision may help. (ErrorCode: -2147418113 can be different.) | | HAADJ policy block components on device. | VmExtension |
| RunVmExtensionScriptError | Others different with above. | 1 or more step failed when run powershell scripts. Provisioning will run into "Provisioned with warning" status | Needs further investigation. Reprovision may help. | | | VmExtension |
| Timeout | Timeout to receive postProvisioning plugin event | In device, steps may run succeed but all steps will be marked to failed in timeout case. Provisioning will run into "Provisioned with warning" status. | Needs further investigation. Reprovision may help. Check DGS and Hermes logs. If DGS shows "Forwarded IoTHub message to Event Grid successfully" with PluginId 6251a87d, DGS received event successfully - contact Vicky Qi/Dandan Cao. If DGS shows "Received device message via IoT Hub" but no send success, contact Cloud PC Identity & Auth RBAC & Unified Agent Team or Honglu Chen. If DGS didn't receive event, check HermesLogShort for publish events. | Plugin triggered succeeded but don't send event in time limit. | | CMD Agent |
| TriggerPluginTimeout | Trigger plugin PluginId 6251a87d-5ec4-4a5e-b836-f6c3a233b4e7 timeout | Provisioning will run into "Provisioned with warning" status. All steps will be marked to failed. | Check DGS log for "Successfully sent request GetExecutePluginRequestAsync to Hermes" and InProgress status. If DGS errors, contact Honglu Chen. If DGS runs well but Hermes errors, transfer to CloudPC Service WCX Hermes OCE (Prashant's team). | Try to trigger plugin 3 times but not get complete signal in time. | | CMD Agent |
| PostProvisioningTimeout | | Provisioning will run into "Provisioned with warning" status. All steps will be marked as failed. | Check StepResults column. If any step status is InProgress/Pending, it's unexpected. Check Update svc log - if PostProvisioning finally succeeded but log interrupted for a long time, it's known issue. Otherwise contact Vicky Qi/Dandan Cao. | PostProvisioning over 90 minutes doesn't return Succeed/Failed result to workspace. | | CMD Agent |
| Unknown | | Provisioning will run into "Provisioned with warning" status. 1 or more steps failed. | Unexpected. If query in monitor can get related log, contact Vicky Qi/Dandan Cao. If "BlockHighRiskPorts" failed with "Can not get BlockHighRiskPorts log", contact Rongbin Han (CMD Agent flighting related). If can't get log, check dashboard. If MMD/Autopatch enroll failed or core provision step failed, contact OCE of provision team and transfer to CloudPC Service Cloud PC Provisioning team. | | | VmExtension |

## Kusto Query: Single Device Breakdown

**Usage**: Input DeviceId and Time as parameters.

```kusto
// ================================= up workspace dgs hermes =======================================
let deId = 'CPC DEVICE ID'; //
let pluginId = "6251a87d-5ec4-4a5e-b836-f6c3a233b4e7"; // do not modify
let tTime = ago(16d);
let common = union cluster("https://cloudpc.eastus2.kusto.windows.net/").database('CloudPC').CloudPCEvent,cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_time > tTime;
let aadId = toscalar(common| where ApplicationName contains "dgs"| where * contains deId| distinct DeviceId| where strlen(DeviceId) > 10 | limit 1);
union cluster("https://cloudpc.eastus2.kusto.windows.net/").database('CloudPC').CloudPCEvent,cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_time > tTime
| where ApplicationName contains "up"
| where * contains deId
| project env_cloud_environment,env_cloud_name,AccountId,ServiceName,ApplicationName,DeviceId,Message, ColMetadata,EventUniqueName,env_time,ActivityId,ComponentName, Col1, Col2, Col3, Col4, Col5,ScenarioType, Col6, OtherIdentifiers,BuildVersion
| as UpdateSvcLog;
common
| where ApplicationName == "prov-function"
| where * contains deId
| project env_cloud_environment,AccountId,ServiceName,ApplicationName,DeviceId,ActivityId, Message, ColMetadata,ComponentName,EventUniqueName,env_time,OtherIdentifiers,Col1,BuildVersion
| as WorkSpaceLog;
common
| where ApplicationName contains "dgs"
| where DeviceId == aadId
|where * contains pluginId
| project AccountId,ServiceName,ApplicationName,DeviceId,ActivityId, Message, ColMetadata,ComponentName,EventUniqueName,env_time,Col1, Col2, Col3, Col4, Col5, Col6, OtherIdentifiers,BuildVersion
| as DeviceGatewayLog;
let HermesFull = common
| where ServiceName == "HermesService"
| where DeviceId == aadId
| project AccountId,DeviceId,ServiceName,ApplicationName,ComponentName,EventUniqueName,ActivityId, Message, ColMetadata,env_time, Col1, Col2, Col3, Col4, Col5, Col6, OtherIdentifiers,BuildVersion;
HermesFull
| as HermesLogFull;
HermesFull
|where * contains pluginId
|as HermesLogShort;
print DeviceId = deId,AadDeviceId = aadId
| as Id;
// ================================= up workspace dgs hermes =======================================
```

## Escalation Contacts

| Component | Contact |
| --- | --- |
| CMD Agent plugin / PostProvisioning orchestration | Vicky Qi / Dandan Cao |
| DeviceGateway / IoT Hub issues | Honglu Chen |
| Hermes service errors | CloudPC Service\WCX Hermes OCE (Prashant's team) |
| BlockHighRiskPorts / CMD Agent flighting | Rongbin Han |
| MMD/Autopatch enrollment / Core provision failures | CloudPC Service\Cloud PC Provisioning team |
| DGS communication issues | CloudPC Service\Cloud PC Identity & Auth RBAC & Unified Agent Team |
