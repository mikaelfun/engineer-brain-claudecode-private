---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Enroll Device/Enrollment Time Grouping"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEnroll%20Device%2FEnrollment%20Time%20Grouping"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Enrollment Time Grouping (ETG)

ETG addresses the delay between device enrollment and full policy configuration. Used by:
- Autopilot Device Preparation Policy (APv2, GA July 2024)
- [Future] iOS Device Enrollment / Android Device Enrollment

## How ETG Works

ETG eliminates provisioning delay by having admin pre-configure a static Entra security group in enrollment policies. Intune pre-calculates assignments and adds devices to the group at enrollment time.

## Security Group Requirements

Device security group must meet ALL of the following:
- **Static group** (not dynamic)
- **Not assignable to groups**
- **Scoped to the admin** configuring the policy
- **"Intune Provisioning Client" must be an owner** of the group

> Note: Use Azure Support Center (ASC) to view Entra group ownership — not available in Assist 365.

If "Intune Provisioning Client" is not visible in tenant, see [Create a Device Group](https://learn.microsoft.com/en-us/autopilot/device-preparation/tutorial/user-driven/entra-join-device-group#create-a-device-group).

## Support Boundaries

ETG is an Intune feature using static Entra groups. Group owner, properties, configuration, membership, usage belong to Intune.

---

## Troubleshooting Scenarios with Kusto

### Scenario 1: Error updating device security group in ETG profile (SG Configuration Error)

**Step 1 — Query DCv2 frontend logs:**
```kusto
IntuneEvent
| where SourceNamespace == "IntunePE"
| where ComponentName == "DCV2DeviceManagementController"
| where FileName startswith "DeviceManagementConfigurationJustInTimeAssignmentPolicyController"
| where AccountId == "EnterAccountId"
| where TraceLevel <= 3
| project env_time, ActivityId, AccountId, FunctionName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```
> Note: Client not set as SG owner returns "SG not found".

**Step 2 — Query DeviceMembership controller (all ETG policies):**
```kusto
let IncludeFunctionNames = datatable (environments: string) [
"SetDeviceMembershipConfigAsync",
"GetDeviceMembershipConfigAsync",
"ClearDeviceMembershipConfigAsync",
"GetSecurityGroupAsync",
"IsAutopilotFPAOwnerOfSecurityGroupAsync",
"IsValidSecurityGroupAsync",
"ValidateSecurityGroupsAsync"];
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time >= ago(1d)
| where ActivityId == "Enter ActivityId"
| where ServiceName == "DeviceProvisioningService"
| where FunctionName in (IncludeFunctionNames)
| project env_time, ActivityId, AccountId, ComponentName, FunctionName, EventUniqueName, Message, Col2, Col3, Col4, Col5, Col6
```

---

### Scenario 2: ETG not reducing policy application latency (ETG Enablement)

**Step 1 — Query DeviceMembership setup:**
```kusto
let IncludeFunctionNames = datatable (environments: string) [
"SetDeviceMembershipAsync",
"GetVirtualTargetPropertiesAsync",
"GetDeviceDirectoryAsync",
"SetDeviceEgmAsync"];
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time >= ago(1d)
| where ActivityId == "Enter ActivityId"
| where ServiceName == "DeviceProvisioningService"
| where FunctionName in (IncludeFunctionNames)
| project env_time, ActivityId, AccountId, DeviceId, ComponentName, FunctionName, EventUniqueName, Message, Col2, Col3, Col4, Col5, Col6
```
> Note: VTP (VirtualTargetProperties) Not Found = SG not configured for that profile.

**Step 2 — Query Effective Group for profile (if EGM was set):**
```kusto
union cluster("https://qrybkradxeu01pe.northeurope.kusto.windows.net").database("qrybkradxglobaldb").EffectiveGroupMembershipEffectiveGroupService_Snapshot,
cluster("https://qrybkradxus01pe.westus2.kusto.windows.net").database("qrybkradxglobaldb").EffectiveGroupMembershipEffectiveGroupService_Snapshot
| where TargetId == "d968e8cf-0b83-4acb-bb88-d563ebb8d112"
| project EffectiveGroupId
```
> AllDevicesVirtualGroupId = `adadadad-808e-44e2-905a-0b7873a8a531`

---

### Scenario 3: Devices not added to ETG security group membership (DeviceMembershipUpdater)

**Pre-Step**: Starting in **2510** release, check **Devices > Monitor > Enrollment time grouping failures** report (up to 20 min delay, requires `Microsoft.Intune/ManagedDevices/Read` permission).

**Step 1 — Query DeviceMembershipUpdater:**
```kusto
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time >= ago(1d)
| where ServiceName == "DeviceProvisioningService"
| where ComponentName endswith "DeviceMembershipUpdater"
| where DeviceId == "a63a2cc7-944a-47e8-ab51-9ef4ee8f3e86"
| project env_time, ActivityId, AccountId, DeviceId, FunctionName, EventUniqueName, Message, Col1, Col2, Col3, Col4, Col5, Col6
```
> Failure to update SG membership causes policy tattoo removal after 72hr GnT grace period.

---

### Scenario 4: Devices not added after Entra identity change

**Step 1 — Query for identity change processing:**
```kusto
let IncludeFunctionNames = datatable (environments: string) [
"ProcessDeviceAadDeviceIdChangeAsync"];
IntuneEvent
| where SourceNamespace == "IntunePE"
| where DeviceId == "5aa0bafd-b417-444a-8c23-3bf3c5b420b3"
| where ServiceName == "DeviceProvisioningService"
| where FunctionName in (IncludeFunctionNames)
| project env_time, ActivityId, AccountId, DeviceId, FunctionName, EventUniqueName, Message, Col2, Col3, Col4, Col5, Col6
```

---

## FAQ and Known Issues

**ETG SG changes apply to future enrollments only** — previously enrolled devices are not impacted.

**SGSv2 grace period**: 72 hours. If device not added to SG within 72hr, policy tattoo removal occurs.

**Remediation if wrong EG enrolled:**
- During grace period: Delete device in Intune → re-enroll
- After grace period: Update SG memberships in Entra

**SG membership update retry timeout**: 1 hour.

**If SetupDeviceMembership fails before EG is calculated**: Enrollment proceeds (not blocked). Background retry is planned.

**Device SG membership update reporting**: Report in development for notifying admin when update fails.

---

## Getting Help with Cases

- ETG cases don't always require Autopilot SME — scope the case based on the actual problem
- App deployment issue on ETG device → troubleshoot as app deployment case
- Device not added to ETG group → troubleshoot group membership, not Autopilot

**Escalations**: If Kusto queries can't explain the flow, RFC/ICM via standard process with TA/PTA.

## Training Resources

- [2 Intune Readiness Sessions on ETG (Overview + Deep-Dive Troubleshooting)](https://microsoft.sharepoint.com/teams/LearnCSSIntune/IntuneFeaturesDeepDiveArchives/Forms/AllItems.aspx?id=%2Fteams%2FLearnCSSIntune%2FIntuneFeaturesDeepDiveArchives%2F2407%20%2D%20Enrollment%20Time%20Grouping)
- [ETG Q&A Session with CXE](https://microsoft.sharepoint.com/teams/LearnCSSIntune/IntuneFeaturesDeepDiveArchives/Forms/AllItems.aspx?id=%2Fteams%2FLearnCSSIntune%2FIntuneFeaturesDeepDiveArchives%2F2407%20%2D%20Enrollment%20Time%20Grouping%2FETG%20Q%26A%20with%20CXE)
