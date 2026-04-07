---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/SHU/testing/ASC/old tsg"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1008654"
importDate: "2026-04-06"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8b502565&URL=https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1008654&Instance=1008654&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8b502565&URL=https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1008654&Instance=1008654&Feedback=2)

___
<div id='cssfeedback-end'></div>

<table style="margin-left:.34in">
  <tr style="background:#ffeeff;color:black;">
    <td>
      <p>&#128721; <b>Stop</b></p>
      <p>This content is being developed and is not yet ready for consumption.</p>
    </td>    
  </tr>
</table>

[[_TOC_]]


# Session host update Roles
- HpuAg  Session host Update App Gateway
- HpuCosmos  CosmosDB triggerSession host update
- Hpu  Session host update

# Identifiers and Querying
![image.png](/.attachments/image-9a25fcf3-1d9d-47fa-b775-ff1164b4490a.png)

## Activity ID
ActivityID gets passed in with every Update request.  Our service has a unique flow compared to most Azure services.  After kicking off the initial operation of Update, user is able to perform operations (retry, pause, etc.) on the update itself.  Furthermore, the migration operation has no public identity, and is simply associated with the Host Pool itself.

There are 3 State changes that are terminal - StartFailed, Canceled and completed. These terminal states mark the end of an activity id. For Diagnostics logs, expect a new Activity Id, for the updates diagnostics events, after a Diag Error is logged (this would be for when the update ends up in the following states: StartFailed, UpdateFailed and Canceled). 

On events of UpdateFailed (where the update is in a non-terminal state), an action such as Retry or Cancel will be logged as a new Diagnostics record where the AcitivtyId will be new but accompanied by the initial acitivityId that began the update, marked as ParentId. 

RdOperations and RDInfratrace will always be logged using the parent/initial id as the ActivityId.

### Getting the ActivityId 

The ActivityId, CorrelationId and ReferenceId are the same values. 

Requests made to manipulate the update may have different Activity Ids (on the ArmProvider side), but within the HostPoolUpdate service side (roles mentioned above) the entire update will be tracked using the initial Id which began the update. 

Note that, all telemetry and diagnostics logs can be tracked by either the HostPool arm path or one of the ids: AcitivtyId, CorrelationId, ReferenceId

## CorrelationId

The CorrelationId is a value that is propagated throughout the entire migration.  From the perspective of the update service telemetry, it is the equivalent of a unique identifier for the update (as we do not have an ID in our public model). 

It is currently being tracked in the ReferenceId/RequestId tables in Kusto.  The id is returned to the user as part of the UpdateDetails payload and can be used when looking at the logs. 
The Correlation ID is presented at the top of any error message in the portal, so that the admin can reference it and supply it to the CSS engineer

### Getting the CorrelationId
- UpdateDetails object 
- Since the correlationId/RequestId/ActivityId is associated with all calls for an update, you can get the correlationId with any given hostpool resource Id of interest.

## Example Diagnostics Queries

```
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodau.australiaeast.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").RDOperation
| where ArmPath == "<host pool ARM path>"
| where Role contains "hpu"
| project RequestId, TIMESTAMP
| order by TIMESTAMP desc
```

## Example Telemetry Usage Examples

```
Getting all traces for an Update
All output is logged to RDInfra table.  
Example root query for getting all traces for a migration:

cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDInfraTrace 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDInfraTrace 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodau.australiaeast.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").RDInfraTrace
| where ActivityId == "<activity id>"
| where Role contains "hpu"
```
```
Querying Operations on a SessionHost
This will return all operations that applied to a single session host throughout the course of a migration.

cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodau.australiaeast.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").RDOperation
| where Role == "Hpu"
| where RequestId == "<request id>"
| extend json=parse_json(Props), Name, ResType
| where json.SessionHostId == "<session host id>
```
```
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodau.australiaeast.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").RDOperation
| where Role contains "hpu"
| where ActivityId == "<activity id>"
```

# Diagnostics Usage

## DiagActivity
DiagActivity will be logging update progress, with Activity Type = Long Running Management Activity. User request to manipulate the update will also be logged in the 
DiagActivity table by the RDArmProvider, these will be short lived activity with Activity Type = Management Activity. 

If the update doesnt encounter a state that logs a DiagError, all the ActivityIds for that update will be the same, until it reaches a Terminal State. 

If the update hits an UpdateFailed State, this is a non-terminal state and logs a DiagError. The user will need to perform an action on the update, either Retry or Cancel. 

Both will generate a new AcitivityId with a parentId being equal to the initial actvityid. The query to use in this case would be: 

```
Example Query

cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").DiagActivity 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").DiagActivity 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodau.australiaeast.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").DiagActivity
| where ActivityId == "<activity id>" or ParentId == "<parent id>"
| where Type == "LongRunningManagement"
| project TIMESTAMP,ParentUpdateId, ActivityId, UpdateStatus, Status, Outcome,SessionHostPoolId, ArmPath, ScheduledTime
```

Outcome is only success for when Update Status = completed.

Outcome is a Failure when Update status = StartFailed/UpdateFailed or Canceled. 

For all intermediary status changes (while the update is in progress), the Status field of the DiagActivity will be ongoing. 

### UpdateStatus values:

| Value | Explanation |
|--|--|
| Initiating Update | Filler value. Seen every time a new Diagnostics Activity is created. For eg. When update is created or when Cancel/Retry is requested on a UpdateFailed. |
| Scheduled | When an update has been scheduled. Accompanied by a Scheduled Time value. The time within the timezone specified by the user |
| InProgress | Update is in progress |
| Pausing/Cancelling | Transient state going to paused/Canceled | 
| Paused/Canceled | Update has successfully paused/canceled |
| StartFailed | Update Failed to start |
| UpdateFailed | Update failed |
| Completed | Update completed |

### DiagActivity for HPU, Long Running Management Activity Schema
- "Id": 4d15b703-c29e-4645-b5be-4c1948da1188,
- "Type": LongRunningManagement,
- "StartTime": 2021-12-01T17:26:34.7322699Z, //time activity was logged
- "EndTime": 1601-01-01T00:00:00Z, //irrelevant unless the entry is for a terminal state
- "UserName": <>,
- "Outcome": <>, //completed or Failure. Completed for when update completes. Failure for StartFailed, UpdateFailed and Canceled.
- "Status": Ongoing, //while update is active. In one of the following states: Scheduled, InProgress, Paused
- "ArmPath": /subscriptions/292d7caa-a878-4de8-b774-689097666272/resourceGroups/shhirji-northeurope/providers/Microsoft.DesktopVirtualization/hostpools/shhirji-hpu-ne,
- "ClientType": AzurePowershell/v0.0.0 PSVersion/v5.1.19041.1320,  //how the update was triggered
- "SessionHostPoolId": 5952d018-f606-464f-9b8e-2686e30af22b,
- "AadTenantId": 01884692-6d96-44fa-8c58-11b4e90fef19,
- "TIMESTAMP": 2021-12-01T17:26:35.6033822Z,"ActivityId": 4d15b703-c29e-4645-b5be-4c1948da1188,
- "RequestId": 4d15b703-c29e-4645-b5be-4c1948da1188,
- "host_Role": RDDiagnosticsRole,
- "UpdateMethod": DiskSwap, //currently only one method
- "OSDiskSaved": True, //if user wants to save their old disk for rollback purpose or so.
- "CustomScriptAdded": False, //if user has specified custom script to be deployed during update
- "NewVMSize": Standard_D2s_v3, //new vm size to update hostpool to
- "NewVMSku": 20h2-ent, //new SKU to update hostpool to 
- "ImageSource": Marketplace, //Image source, can be MarketPlace or custom 
- "MaxVMsUnavailableDuringUpdate": 1, //number of vms to update, 1 <= n <= number of SHs
- "UpdateType": Scheduled, //if the update is scheduled or immediate 
- "ScheduledTime": 2021-12-01 09:36:15 AM  Pacific Standard Time, //scheduled time, in the timezone user specified 
- "UpdateStatus": InitiatingUpdate, //one of the status from the list above
- "OSDiskType": StandardSSD_LRS, //type of disk hostpool is updating to 	
- "ParentUpdateId": 00000000-0000-0000-0000-000000000000,//often null, unless user requested the following on an active update: Retry or Canceled. This is the initial update id. Allows correlating  user action to cancel/retry after an error was encountered.

## DiagCheckPoint
Every state change results in a checkpoint. 

```
Sample query for when Update may have hit a failure and user retried, you will need to query all the different ActivityIds to get the checkpoint for the duration of the update.

cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").DiagCheckpoint 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").DiagCheckpoint 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").DiagCheckpoint
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").DiagCheckpoint
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").DiagCheckpoint
| union cluster("rdsprodau.australiaeast.kusto.windows.net").database("WVD").DiagCheckpoint
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").DiagCheckpoint
| where TIMESTAMP > ago(30d)
| where ActivityId == "<activity id>" or ActivityId == "<activity id>"
```
```
If the update didnt encounter any errors, it can be queried using one activityId

cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").DiagCheckpoint 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").DiagCheckpoint 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").DiagCheckpoint
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").DiagCheckpoint
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").DiagCheckpoint
| union cluster("rdsprodau.australiaeast.kusto.windows.net").database("WVD").DiagCheckpoint
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").DiagCheckpoint
| where TIMESTAMP > ago(30d)
| where ActivityId == "<activity id>" 
```

### HostPoolUpdate CheckPoint schema: 
- "ActivityId": fb18175d-dc4f-4a0c-98f9-0cdd32cc99ab,
- "Name": HostPoolUpdateCompleted,
- "Time": 2021-11-23T19:51:41.9933612+00:00,
- "ReportedBy": RDHostPoolUpdater,
- "Parameters": {"stateFrom":"InProgress","stateTo":"Completed","sessionHostUpdated":"1","progressPercentage":"100"},
- "TIMESTAMP": 2021-11-23T19:51:42.2289516Z

### CheckPoint Name Values:
| CheckPoint Name | Parameter Schema |
|--|--|
| HostPoolUpdateStarted | StateFrom, StateTo,Number of Session Hosts Updated, Progress Percentage. |
| HostPoolUpdateFailed | StateFrom, StateTo,Number of Session Hosts Updated, Progress Percentage |
| HostPoolUpdateCompleted | StateFrom, StateTo,Number of Session Hosts Updated, Progress Percentage |
| HostPoolUpdateResumed | StateFrom, StateTo,Number of Session Hosts Updated, Progress Percentage |
| HostPoolUpdateCancelled | StateFrom, StateTo,Number of Session Hosts Updated, Progress Percentage |
| HostPoolUpdatePaused | StateFrom, StateTo,Number of Session Hosts Updated, Progress Percentage |
| HostPoolUpdateScheduled | ScheduledFor |
| ActionOnScheduledUpdate | RequestedAction |
| HostPoolUpdateImmediate | KickedOffAt  |

## DiagError
Expect a DiagError entry when an update hits a StartedFailed, UpdateFailed or Canceled state.

### DiagError schema: 
```
"ActivityId": e22e3942-4e9e-44a0-8ae8-2d92f86c1deb,
"Time": 2021-11-30T00:06:15.1025731+00:00,
"ErrorSource": RDHostPoolUpdater,
"ErrorOperation": UpdateHostPool,
"ErrorCode": 0,
"ErrorCodeSymbolic": ErrorCodeSymbol,
"ErrorMessage": InProgress. Error: Fault Code:SessionHostMigrationError, Fault Context: /subscriptions/b0dbcd15-5a27-4bfa-8011-a36b9539edb3/resourceGroups/guptasaloni-RG/providers/Microsoft.Compute/virtualMachines/guptasaloni-0, Fault Message: Error during 'SwapDiskOntoVmOperation' - System.Exception: The orchestrator function 'GenerateDiskForSwap_orchestration' failed: "One or more errors occurred. (Exception occured in module GenerateDisk with exception Microsoft.RDManagement.Exceptions.KeyvaultSecretRetrieveFailedException: Failed to retrieve KeyVault secret LocalVMPW rom KeyVault /subscriptions/b0dbcd15-5a27-4bfa-8011-a36b9539edb3/resourceGroups/guptasaloni-RG/providers/Microsoft.KeyVault/vaults/guptasaloni-HostPool
Stack trace:     at HostPoolCreate.GenerateDiskForSwap.<>c__DisplayClass6_0.<<GenerateDisk>b__0>d.MoveNext() in C:\__w\1\s\RDHostpoolCreate\GenerateDiskForSwap.cs:line 273
====================== 
) (Exception occured in module GenerateDisk with exception Microsoft.RDManagement.Exceptions.KeyvaultSecretRetrieveFailedException: Failed to retrieve KeyVault secret LocalVMPW rom KeyVault /subscriptions/b0dbcd15-5a27-4bfa-8011-a36b9539edb3/resourceGroups/guptasaloni-RG/providers/Microsoft.KeyVault/vaults/guptasaloni-HostPool
Stack trace:    < Expect stack trace > Fault Type: ServiceError,
"ReportedBy": RDHostPoolUpdater,
"TIMESTAMP": 2021-11-30T00:06:15.2616847Z,
```

Error Message contains the state you were in before you hit an Error and the FaultType contains information about the error type  Service Error or Customer Error.

# Sample Diagnostics Logs

## Common Scenarios supported by HostPool Update 

1. Validate HostPoolUpdate (full and standalone validation only available via PowerShell, on Portal - static validation at the time of scheduling the update and full validation before update kicks off)
   - Before kicking off the update, user can run Validation on their defined SHC and HostPoolUpdate properties 
   - Long running operation. Can be queried using the operationID
1. Update HostPool 
   - HostPool Update can be kicked off immediately or scheduled for a later date/time
   - Scheduled update can be canceled or overwritten to start immediately. Update can be scheduled a maximum of 2 weeks ahead of time.
   - An update InProgress can be Paused or Canceled 
   - A Paused update can be Resumed or Canceled
   - An UpdateFailed can be Retried or Canceled 
   - You can only kickoff a new update on the same hostpool once the previous update has reached a terminal state of Canceled, Completed or StartFailed. UpdateFailed must first be canceled in order to initiate a new update. **

## Frequent User Errors  

1. Resource not found: Using an image from a different subscription result in a ResourceNotFound Error.
   ```
   New-AzWvdSessionHostConfiguration -HostPoolName $hpname -ResourceGroupName $resgrp -SubscriptionId $subID -VMSizeID Standard_D2s_v3 -DiskInfoType StandardSSD_LRS  
   -DomainInfoJoinType AzureActiveDirectory -AzureActiveDirectoryInfoMdmProviderGuid "0000000a-0000-0000-c000-000000000000" - 
   VMAdminCredentialsPasswordKeyVaultResourceId "/subscriptions/dbedef25-184c-430f-b383-   
   0eeb87c3205d/resourceGroups/vinagRG/providers/Microsoft.KeyVault/vaults/vinagHPUKV" -VMAdminCredentialsPasswordKeyVaultSecretName LocalAdmin - 
   VMAdminCredentialsUsername admin6 -ImageInfoType "Custom" -CustomInfoResourceID "/subscriptions/0325dd32-ebf8-403e-86b0- 
   365c7d3306d9/resourceGroups/vinagImageCreationRG/providers/Microsoft.Compute/galleries/vinagSIG/images/SIGImage1/versions/1.0.0" -CustomConfigurationParameterUrl 
   https://achawla5sa2ppe.blob.core.windows.net/hpucontainer/ParamFile.json -CustomConfigurationTemplateUrl 
   https://achawla5sa2ppe.blob.core.windows.net/hpucontainer/selfhostdsc.json
   ```

1. DomainJoin error as the Vnet didnt resolve  solution is to create a VM with a VNET that has a resolving DNS server.
   ```
   Error: FaultCode    : SessionHostMigrationError
   FaultContext : 4f7e5f1e-3a17-4172-86c1-934ecdf8dad0
   FaultText    : RDHostPoolCreate.Exceptions.MigrationException: Exception occured in module DomainJoinOperation with exception System.Exception: Extension provisioning failed.  
   Instance model status:  
   ${"name":"joindomain","type":"Microsoft.Azure.ActiveDirectory.AADLoginForWindows","typeHandlerVersion":"1.0.0.1","substatuses":null,"statuses":[{"code":"Provi 
   sioningState/failed/1","level":"Error","displayStatus":"Provisioning failed","message":"Extension '' of Handler 
   'Microsoft.Azure.ActiveDirectory.AADLoginForWindows' version '1.0.0.1' faulted due to exception during extension processing","time":null}]}
   ---> Microsoft.RDManagement.Exceptions.SerializableCloudException: Long running operation failed with status 'Failed'. Additional Info:'VM has reported a failure 
   when processing extension 'joindomain'. Error message: "Extension '' of Handler 'Microsoft.Azure.ActiveDirectory.AADLoginForWindows' version '1.0.0.1' faulted 
   due to exception during extension processing"
   More information on troubleshooting is available at https://aka.ms/vmextensionwindowstroubleshoot '
   --- End of inner exception stack trace ---
   <...stack trace>  
   FaultType    : ServiceError
   ```

1. If key parameters not specified while creating SHC, SHC doesnt show an error but launching an update throws an error:
   ``` 
   New-AzWvdSessionHostConfiguration -HostPoolName FirstAAD -ResourceGroupName vinagRG -SubscriptionId dbedef25-184c-430f-b383-0eeb87c3205d -VMSizeID Standard_B2s - 
   DiskInfoType Premium_LRS  -DomainInfoJoinType AzureActiveDirectory -ImageInfoType MarketPlace -MarketPlaceInfoOffer "Windows-10" -MarketPlaceInfoPublisher 
   "MicrosoftWindowsDesktop" -MarketPlaceInfoSku "19h2-evd" -MarketPlaceInfoExactVersion "18363.1916.2111030305" -CustomConfigurationTemplateUrl 
   https://vinagsa.blob.core.windows.net/hpucontainer/selfhostdsc.json -CustomConfigurationParameterUrl 
   https://vinagsa.blob.core.windows.net/hpucontainer/ParamFile.json
   ```
   ```
   //SHC created successfully 
   PS C:\Users\vinag> Update-AzWvdHostPoolPost -HostPoolName FirstAAD -ResourceGroupName vinagRG -SubscriptionId dbedef25-184c-430f-b383-0eeb87c3205d - 
   ParameterLogOffDelayMinute 1 -ParameterLogOffMessage " Please save your work and sign out for this session host will be shut down for image update. Please log 
   back in when you are ready " -ParameterMaxVmsRemovedDuringUpdate 2
   ```
   ```
   Update-AzWvdHostPoolPost : ActivityId: b5cf0690-e886-4eaf-a803-38e70ecede9f Error: HostPoolUpdateClientException ex:
   Static Validation failed for HostPool Update Initiate.
   {"Warnings":null,"Errors":[{"FaultCode":"ParameterNull","FaultText":"Parameter 'Username' not specified","FaultContext"
   :"StaticHostpoolValidation","FaultType":"UserError"},{"FaultCode":"ParameterNull","FaultText":"Parameter
   'PasswordKeyVaultSecretName' not specified","FaultContext":"StaticHostpoolValidation","FaultType":"UserError"},{"FaultC
   ode":"ParameterNull","FaultText":"Parameter 'PasswordKeyVaultResourceId' not
   specified","FaultContext":"StaticHostpoolValidation","FaultType":"UserError"}]}
   At line:1 char:1
   + Update-AzWvdHostPoolPost -HostPoolName FirstAAD -ResourceGroupName vi ...
   + ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   + CategoryInfo          : InvalidOperation: ({ SubscriptionI...ostPoolUpdate }:<>f__AnonymousType2`4) [Update-AzWv
   dHostPoolPost_UpdateExpanded], Exception
   + FullyQualifiedErrorId : 400,Microsoft.Azure.PowerShell.Cmdlets.DesktopVirtualization.Cmdlets.UpdateAzWvdHostPool
   Post_UpdateExpanded
   ```

1. When a custom image used to update a host pool has been created from a VM of a differing generation from the host pool Session host VMs, the update startfails
   ```
   Start Failed Error: ImageHyperVGenerationDoesNotMatchExistingVms ImagesValidAndCompatibleRule Image requires a HyperV generation 'V2' incompatible with the 
   HyperV generation 'V1' associated with existing VMs in the Host Pool. UserError
   Image requires a HyperV generation 'V2' incompatible with the HyperV generation 'V1' associated with existing VMs in the Host Pool.
   ```

1. If a subsequent update does not need a custom configuration template but SHC has it from a past update, it does not automatically get removed unless user explicitly specifies it as empty string while updating their SHC prior to issuing an update

1. Incorrect KV secret names in SHC will not generate any error, and update will be in Start failed
   ```
   Start Failed error: SessionHostMigrationError /subscriptions/dbedef25-184c-430f-b383- 
   0eeb87c3205d/resourceGroups/vinagRG/providers/Microsoft.Compute/virtualMachines/SecondAAD-0 Error during 'SwapDiskOntoVmOperation' - System.Exception: The 
   orchestrator function 'GenerateDiskForSwap_orch...
   ```
   ```
   Error during 'SwapDiskOntoVmOperation' - System.Exception: The orchestrator function 'GenerateDiskForSwap_orchestration' failed: "One or more errors occurred. 
   (Exception occured in module GenerateDisk with exception Microsoft.RDManagement.Exceptions.KeyvaultSecretRetrieveFailedException: Failed to retrieve KeyVault 
   secret LocalAd rom KeyVault /subscriptions/dbedef25-184c-430f-b383-0eeb87c3205d/resourceGroups/vinagRG/providers/Microsoft.KeyVault/vaults/vinagHPUKV
   ```

1. If the image to be applied for image update is not generalized properly using sysprep then, update service will fail even though the update will continue to show as in progress. 
Possibility of the 1st Session host VM being renamed to non-generalized images VM name, rest of the Session host VMs not in the host pool anymore but available as standalone VMs, Session hosts unretrievable even though the update will continue to show as in progress
 
1. SHC created successfully for personal host pools but issuing an update will lead to startfailed
 
1. In case multiple host pools are updating concurrently (>1) or there are too many Session hosts per batch in the update process or too many resources in the resource group or somehow the compute is being consumed and interferes with the update service compute then the update may fail with the below error. It might work if update is retried.


   | FaultCode | FalutContext | FaultText |
   |--|--|--|
   | ---------- | ---------- | ---------- |

   ```
   MigrationMayExceedCapacityLimit ComputeCapacityRule It was detected that resources created during the update process
   It was detected that resources created during the update process may cause subscription limits to be exceeded for the following resources: [{name: 
   {value:cores,localizedValue:Total Regional vCPUs:}.:limit:100,projectedusecapacity:112}]. Please delete some resources of this type before creating a 
   new one
   ```

1. Image needs to be replicated/available in the VM region and availability zone region if applicable for the update to be successful
 
1. Custom configuration template file and parameter file need to be available in the VM region and availability zone region (Storage account should be in the same Resource group and location as the VMs where the template and param file need to be uploaded) if applicable for the update to be successful
 
1. If scaling plan is not disabled on the host pool, the scheduled update will not start until scaling plan is disabled. It might start right after it is disabled when an admin may not intend for it to start hence, good idea to cancel or adjust the update schedule prior to canceling it (@Shaila  I havent tested it since scaling is public preview now, but I assume this is the behavior)
 
1. It is recommended to not remove any VMs while the image update is ongoing, currently the service does not block you from removing a VM, but it may create issues with the ongoing update.

1. It is important that during the image update, the drain mode of any VMs should not be changed, update service automatically changes the drain mode of the VMs based on which update stage, the VMs are in. 
 
1. VM's in the same host pool can be in different resource groups
 
1. AVD host pools whose VMs were created via Azure portal or arm templates are supported. 
   - VMs created by tweaking the template are not supported
   - VMs created via some other means and later joined to AVD host pool are not supported
 
1. Custom images  ACG image and managed image supported, images created with unmanaged disks not supported for update

1. Trusted Launch feature has not been tested on how the Session hosts will behave after they are image updated with this feature, hence not supported at this time. 

---

# Portal Errors

## GEN1 image error
```
:faultCode": "ImageHyperVGenerationDoesNotMatchExistingVms",
"faultText": "Image requires a HyperV generation 'V2' incompatible with the HyperV generation 'V1' associated with existing VMs in the Host Pool.",
"faultContext": "ImagesValidAndCompatibleRule",
"faultType": "UserError"
```

Cause: HPU does not support updating across image generations, this is a limitation in Azure compute.

Solution: Use GEN2 image

NOTE: HPU does not support updating existing GEN1 image to GEN2 image

## AVD Enterprise App permissions error
```
Error: The client '253f7a05-d2bb-4e0d-b408-c12f6664117a' with object id '253f7a05-d2bb-4e0d-b408-c12f6664117a' 
does not have authorization to perform action 'Microsoft.DesktopVirtualization/hostPools/sessionHostConfigurations/read' . 
```

Cause: AVD Enterprise App does not have AVD Contributor role

Solution: Grant AVD Enterprise App Desktop Virtualization Host Pool Contributor role

## Missing compute permissions to update image
```
"faultCode": "UnhandledValidationException",
"faultText": "Error occured when during validation.  
Exception:  'Microsoft.Rest.Azure.CloudException: The client '253f7a05-d2bb-4e0d-b408-c12f6664117a' with object id '253f7a05-d2bb-4e0d-b408-c12f6664117a' does not have authorization to perform action <resource URI path>'
```
Cause: User does not have permissions to perform operation

Solution: Fix RBAC permissions

## Unable to resolve resource reference error
```
"faultCode": "ResourceNotFound",
"faultText": "Unable to resolve resource reference.  Id '<resource url path>", "faultType": "UserError"
```

Cause: ?

Solution: ?

---

# Diagnostics

Session host update makes use of Azure Log Analytics for presenting diagnostics information.

In order to set up Log Analytics for HPU please review: https://docs.microsoft.com/en-us/azure/virtual-desktop/diagnostics-log-analytics to set up Log Analytics for your environment.

Once configured for HPU the WVDCheckpoints table shows 2 types of activities  Management and Long Running Management.

Management activity type - has always existed and comes from the ARM provider. It is essentially queuing the Host pool for the update operation.

Long Running Management - is a new activity type specific to Session host update service. It is performing the update operation on the host pool after it has successfully been queued.


Here are several queries you can run to troubleshoot HPU

Here is a query you can run to understand your host pools and each Session hosts update time that updated in the last 7 days  

```
let timeRange = ago(7d);
WVDSessionHostManagement
| where UpdateStatus == "Completed" and TimeGenerated > timeRange
| project _ResourceId, _SubscriptionId, CorrelationId, ParentUpdateId, TimeGenerated, OSDiskSaved, CustomScriptAdded, ImageSource, MaxVMsUnavailableDuringUpdate, UpdateType, ScheduledTime, OSDiskType, NewVMSize
| extend ParentActivityId = iff(ParentUpdateId == "00000000-0000-0000-0000-000000000000", CorrelationId, ParentUpdateId)
// Get Session host update time and number of session hosts updated
| join kind = inner 
(
    WVDCheckpoints
    | where ActivityType == "LongRunningManagement" and Name == "HostPoolUpdateCompleted" and TimeGenerated > timeRange
    | extend ParametersParsed = parse_json(Parameters)
    | extend UpdateStartTime = todatetime(ParametersParsed["TimeStarted"]), UpdateCompletionTime = todatetime(ParametersParsed["TimeCompleted"]), SessionHostUpdateCount = toint(ParametersParsed["SessionHostsUpdateCompleted"])
    | project CorrelationId, UpdateStartTime, UpdateCompletionTime, SessionHostUpdateCount, HostPoolUpdateTimeInSeconds = datetime_diff("Second", UpdateCompletionTime, UpdateStartTime)
) on $left.CorrelationId == $right.CorrelationId
// Get session host update time
| join kind = leftouter
(
    WVDCheckpoints
    | where ActivityType == "LongRunningManagement" and Name == "SessionHostUpdateCompleted"
    | extend ParametersParsed = parse_json(Parameters)
    | extend SessionHostUpdateTime = toint(todecimal(ParametersParsed["TimeTakenToUpdateSessionHostInSeconds"]))
    | join kind = inner 
    (
        // Get Parent Activity Id of update
        WVDSessionHostManagement
        | where UpdateStatus == "Completed" and TimeGenerated > timeRange
        | extend ParentActivityId = iff(ParentUpdateId == "00000000-0000-0000-0000-000000000000", CorrelationId, ParentUpdateId)
        | project CorrelationId, ParentActivityId 
    ) on $left.CorrelationId == $right.CorrelationId
    | summarize SessionHostMedianUpdateTime = percentile(SessionHostUpdateTime, 50) by ParentActivityId
) on $left.ParentActivityId == $right.ParentActivityId
| project TimeGenerated, CorrelationId, _SubscriptionId, HostPoolResourceId = _ResourceId, HostPoolUpdateTimeInSeconds, UpdateStartTime, UpdateCompletionTime, SessionHostUpdateCount, SessionHostMedianUpdateTime, OSDiskSaved, CustomScriptAdded, ImageSource, MaxVMsUnavailableDuringUpdate, UpdateType, ScheduledTime, OSDiskType, NewVMSize
| project-rename ['HostPoolUpdateTime [In Seconds]'] = HostPoolUpdateTimeInSeconds, ['SessionHostMedianUpdateTime [In Seconds]'] = SessionHostMedianUpdateTime, ['ScheduledTime [UTC]'] = ScheduledTime
```

This query correlates WVDSessionHostManagement and WVDErrors and provides information to troubleshoot errors during Session host update for specified timeframe. The query returns session host resource id if Session host update fails while updating the session host

```
let timeRange = ago(7d);
WVDSessionHostManagement
| where UpdateStatus == "UpdateFailed" and TimeGenerated >= timeRange
| distinct ParentUpdateId, CorrelationId, _ResourceId, _SubscriptionId
| join kind = inner 
(
    WVDErrors
    | where Source == "RDHostPoolUpdater" and ActivityType == "LongRunningManagement" and TimeGenerated >= timeRange
    | extend IsSessionHostResourceIdAvailable = iif(Message startswith "SessionHostResourceId", 1, 0)
    | extend startIndex = iif(IsSessionHostResourceIdAvailable == 1, indexof(Message, ":") + 1, 0)
    | extend length = iif(IsSessionHostResourceIdAvailable == 1, indexof(Message, ";") - startIndex, 0)
    | extend SessionHostResourceId = iif(IsSessionHostResourceIdAvailable == 1, substring(Message, startIndex, length), "")
    | project TimeGenerated, CorrelationId, SessionHostResourceId, CodeSymbolic, Message
) on CorrelationId
| project TimeGenerated, _SubscriptionId, _ResourceId, ParentUpdateId, CorrelationId, CodeSymbolic, SessionHostResourceId, Message
```

This query correlates WVDSessionHostManagement and WVDCheckpoints and provides time taken to complete the Session host update and median time to update single session host within the host pool in seconds for specified timeframe.

```
let timeRange = ago(7d);
WVDSessionHostManagement
| where UpdateStatus == "Completed" and TimeGenerated >= timeRange
| project _ResourceId, _SubscriptionId, CorrelationId, ParentUpdateId, TimeGenerated, OSDiskSaved, CustomScriptAdded, ImageSource, MaxVMsUnavailableDuringUpdate, UpdateType, ScheduledTime, OSDiskType, NewVMSize
// Get Session host update time and number of session hosts updated
| join kind = inner 
(
    WVDCheckpoints
    | where ActivityType == "LongRunningManagement" and Name == "HostPoolUpdateCompleted" and TimeGenerated >= timeRange
    | extend ParametersParsed = parse_json(Parameters)
    | extend UpdateStartTime = todatetime(ParametersParsed["TimeStarted"]), UpdateCompletionTime = todatetime(ParametersParsed["TimeCompleted"]), SessionHostUpdateCount = toint(ParametersParsed["SessionHostsUpdateCompleted"])
    | project CorrelationId, UpdateStartTime, UpdateCompletionTime, SessionHostUpdateCount, HostPoolUpdateTimeInSeconds = datetime_diff("Second", UpdateCompletionTime, UpdateStartTime)
) on $left.CorrelationId == $right.CorrelationId
// Get session host update time
| join kind = leftouter
(
    WVDCheckpoints
    | where ActivityType == "LongRunningManagement" and Name == "SessionHostUpdateCompleted"
    | extend ParametersParsed = parse_json(Parameters)
    | extend SessionHostUpdateTime = toint(todecimal(ParametersParsed["TimeTakenToUpdateSessionHostInSeconds"]))
    | join kind = inner 
    (
        // Get Parent Activity Id of update
        WVDSessionHostManagement
        | where UpdateStatus == "Completed" and TimeGenerated >= timeRange
        | project CorrelationId, ParentUpdateId
    ) on $left.CorrelationId == $right.CorrelationId
    | summarize SessionHostMedianUpdateTime = percentile(SessionHostUpdateTime, 50) by ParentUpdateId
) on $left.ParentUpdateId == $right.ParentUpdateId
| project TimeGenerated, _SubscriptionId, HostPoolResourceId = _ResourceId, ParentUpdateId, CorrelationId, HostPoolUpdateTimeInSeconds, UpdateStartTime, UpdateCompletionTime, SessionHostUpdateCount, SessionHostMedianUpdateTime, OSDiskSaved, CustomScriptAdded, ImageSource, MaxVMsUnavailableDuringUpdate, UpdateType, ScheduledTime, OSDiskType, NewVMSize
| project-rename ['HostPoolUpdateTime [In Seconds]'] = HostPoolUpdateTimeInSeconds, ['SessionHostMedianUpdateTime [In Seconds]'] = SessionHostMedianUpdateTime, ['ScheduledTime [UTC]'] = ScheduledTime
```