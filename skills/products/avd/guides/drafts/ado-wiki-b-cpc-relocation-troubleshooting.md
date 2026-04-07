---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Dependencies/CPC Relocation/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/40748abc-bccb-489c-bcd1-d75a6ef1cd53/_wiki/wikis/10869040-b84f-4c69-8fc7-2c796a8fa00c?pagePath=%2FFeatures%2F%F0%9F%A4%9DDependencies%2FCPC%20Relocation%2FTroubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CPC Relocation / RegionRelocation Troubleshooting

This is a backend feature - no user interaction nor troubleshooting is applicable for this release.

## When customer asks why CPC was moved

You can verify the user settings and geography options enabled to check whether the customer has it activated. The customer has the chance to opt-out through user settings at their convenience.

**Note:** Currently, relocation can only be triggered by Microsoft; it is a purely internal action.

## Verification via CPCD

Since this is an action, you can also obtain details about the action in **CPCD > Action Diagnostics** page.

## KQL: Verify RegionRelocation

```kql
let MyCloudPCEvent =
    union cluster("cloudpc.eastus2").database("CloudPC").CloudPCEvent,
    cluster("cloudpcneu.northeurope").database("CloudPCProd").CloudPCEvent;
let GetPersistLogs = (StartTime:datetime, EndTime:datetime, Env:string, TenantIds:dynamic)
{
    MyCloudPCEvent
    | extend TruncId = Col1, Col1 = iff(ApplicationName in ("prov", "prov-function"), OtherIdentifiers, Col1)
    | where env_time between (StartTime .. EndTime) and iff(Env != "", env_cloud_environment == Env, true) and iff(array_length(TenantIds) >= 1 and TenantIds[0] != "", AccountId in (TenantIds), true)
    | where ComponentName == 'PersistProvisionResultActivity' and EventUniqueName like 'Execute'
    | order by env_time asc
    | extend Col1 = iff(Col1 startswith "[Chunk", substring(Col1, indexof(Col1, ':') + 2), Col1)
    | summarize Col1 = strcat_array(make_list(Col1), ''), arg_max(env_time, *) by ActivityId, AccountId, TruncId
    | parse Col1 with 'Begin persist ' ActionType ' result, status:' Status ', count:#' CountDetail ', result:' ResultModel ', targeting items:' Items
    | extend ResultModel = parse_json(ResultModel), Items = parse_json(strcat('[', Items, ']'))
    | mv-expand Item = Items
    | extend WorkItem = parse_json(tostring(Item.WorkItem))
    | extend Error = parse_json(WorkItem.Error)
    | extend AccountId = tostring(AccountId), PartnerAppType = WorkItem.PartnerAppType,
        ProvisionPhase = coalesce(Error.provisionPhase, ResultModel.Error.provisionPhase), ProvisionRequestId = ResultModel.ProvisionId,
        ErrorCode = coalesce(Error.errorCode, ResultModel.Error.errorCode), ErrorCategory = coalesce(Error.errorCategory, ResultModel.Error.errorCategory), ErrorMessage = coalesce(Error.meta.message, ResultModel.Error.meta.message),
        Status = Item.Status, IsLastRetry = WorkItem.IsLastRetry,
        ProvisionRecipe = dynamic_to_json(ResultModel.ProvisionRecipe), PostProvisionStepResults = dynamic_to_json(ResultModel.PostProvisionStepResults[tostring(Item.DeviceId)]),
        DeviceModel = coalesce(Item.DeviceModel, dynamic_to_json(WorkItem.OriginalDeviceModel)),
        DeviceName = split(dynamic_to_json(WorkItem.OriginalDeviceModel.DeviceResourceId), "/")[-1]
    | project
        env_time, env_cloud_name, ActivityId, AccountId, UserId = tostring(WorkItem.UserId), ActionType, Status, IsLastRetry, ProvisionRequestId,
        ErrorCategory, ErrorCode = iff(Item.Status == 'Successed', '', strcat(ProvisionPhase, '_', ErrorCode)), ErrorMessage,
        WorkItemId = tostring(WorkItem.WorkItemId), DeviceId = tostring(Item.DeviceId), PolicyId = tostring(WorkItem.PolicyId), ProvisionId = tostring(WorkItem.RequestId),
        Region = ResultModel.Region, ImageType = tostring(ResultModel.ImageType), ServicePlanType = tostring(WorkItem.ServicePlanType), OriginalServicePlanId = tostring(WorkItem.OriginalServicePlanId), TargetServicePlanId = tostring(WorkItem.TargetServicePlanId),
        ProvisionRecipe, PostProvisionStepResults, PartnerAppType, BusinessType = WorkItem.BusinessType,
        Col1, DeviceModel, DeviceName = tostring(DeviceName),
        BuildVersion, env_cloud_roleInstance
};
let StartTime = ago(30d);
let EndTime = now();
let Env = "PROD";
let TenantIds = pack_array(""); // Add TenantId inside quotes
let PersistLogs = GetPersistLogs(StartTime, EndTime, Env, TenantIds);
PersistLogs
| where ActionType in ("SkuMigration","RegionRelocation")
| order by env_time desc
| project-away Col1
| take 1000
```

## Expected behavior

- No expected error messages for the customer side
- No expected error messages/codes even internally
- Relocation is purely internal, triggered by Microsoft only
